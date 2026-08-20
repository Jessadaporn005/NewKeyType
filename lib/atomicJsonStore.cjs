const fs = require('fs');
const path = require('path');

const STORE_FORMAT = 'CYBERDECK_ATOMIC_JSON';
const STORE_SCHEMA_VERSION = 2;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

class AtomicJsonStore {
  constructor(filePath, options = {}) {
    if (!filePath) throw new Error('AtomicJsonStore requires a file path');
    this.filePath = path.resolve(filePath);
    this.backupPath = options.backupPath || `${this.filePath}.bak`;
    this.maxBytes = options.maxBytes || 20 * 1024 * 1024;
    this.writeQueue = Promise.resolve();
  }

  unwrapDocument(document) {
    if (!isRecord(document)) throw new Error('Database root must be an object');
    if (document.format === STORE_FORMAT) {
      if (!isRecord(document.data)) throw new Error('Database envelope data must be an object');
      return {
        data: document.data,
        schemaVersion: Number(document.schemaVersion) || 1,
        revision: Number(document.revision) || 0,
        writtenAt: document.writtenAt || null,
        legacy: false
      };
    }
    return { data: document, schemaVersion: 1, revision: 0, writtenAt: null, legacy: true };
  }

  parse(raw) {
    if (Buffer.byteLength(raw, 'utf8') > this.maxBytes) throw new Error('Database exceeds size limit');
    return this.unwrapDocument(JSON.parse(raw));
  }

  async readFile(targetPath) {
    const raw = await fs.promises.readFile(targetPath, 'utf8');
    return this.parse(raw);
  }

  async read() {
    if (!fs.existsSync(this.filePath)) {
      return { data: {}, source: 'EMPTY', recoveredFromBackup: false, legacy: false, revision: 0 };
    }

    try {
      const result = await this.readFile(this.filePath);
      return { ...result, source: 'PRIMARY', recoveredFromBackup: false };
    } catch (primaryError) {
      try {
        const recovered = await this.readFile(this.backupPath);
        return {
          ...recovered,
          source: 'BACKUP',
          recoveredFromBackup: true,
          warning: `Primary database unreadable: ${primaryError.message}`
        };
      } catch (backupError) {
        const error = new Error(`Database and backup are unreadable: ${primaryError.message}; ${backupError.message}`);
        error.code = 'DATABASE_RECOVERY_FAILED';
        throw error;
      }
    }
  }

  write(data) {
    const operation = this.writeQueue.then(() => this.writeAtomic(data));
    this.writeQueue = operation.catch(() => {});
    return operation;
  }

  async writeAtomic(data) {
    if (!isRecord(data)) throw new Error('Database payload must be an object');

    await fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
    let previousRevision = 0;

    if (fs.existsSync(this.filePath)) {
      try {
        const current = await this.readFile(this.filePath);
        previousRevision = current.revision || 0;
        await fs.promises.copyFile(this.filePath, this.backupPath);
      } catch (error) {
        // Preserve an existing known-good backup when the primary is corrupt.
      }
    }

    const envelope = {
      format: STORE_FORMAT,
      schemaVersion: STORE_SCHEMA_VERSION,
      revision: previousRevision + 1,
      writtenAt: new Date().toISOString(),
      data
    };
    const serialized = JSON.stringify(envelope, null, 2);
    if (Buffer.byteLength(serialized, 'utf8') > this.maxBytes) throw new Error('Database payload exceeds size limit');

    const tempPath = `${this.filePath}.tmp-${process.pid}-${Date.now()}`;
    let handle = null;
    try {
      handle = await fs.promises.open(tempPath, 'wx');
      await handle.writeFile(serialized, 'utf8');
      await handle.sync();
      await handle.close();
      handle = null;
      await fs.promises.rename(tempPath, this.filePath);
      return { success: true, revision: envelope.revision, writtenAt: envelope.writtenAt };
    } finally {
      if (handle) await handle.close().catch(() => {});
      await fs.promises.unlink(tempPath).catch(() => {});
    }
  }
}

module.exports = {
  AtomicJsonStore,
  STORE_FORMAT,
  STORE_SCHEMA_VERSION
};
