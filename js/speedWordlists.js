/**
 * MONKEYTYPE SPEED WORDLISTS & PROCEDURAL GENERATOR
 * Rich dictionaries for English 200, English 1k, Code/Dev, Thai 200, Cyber Matrix, and Quotes.
 */

export const WORDLIST_ENGLISH_200 = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it',
  'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'us', 'system', 'program', 'run', 'code', 'data', 'write', 'read', 'set', 'call',
  'find', 'state', 'point', 'world', 'hand', 'life', 'part', 'child', 'eye', 'place',
  'case', 'week', 'company', 'system', 'group', 'number', 'problem', 'fact', 'right', 'lead',
  'great', 'small', 'every', 'large', 'big', 'high', 'different', 'next', 'early', 'young',
  'important', 'few', 'public', 'bad', 'same', 'able', 'cyber', 'stream', 'node', 'link',
  'network', 'packet', 'memory', 'socket', 'token', 'server', 'client', 'logic', 'stack', 'heap',
  'array', 'string', 'buffer', 'matrix', 'terminal', 'cipher', 'vector', 'signal', 'access', 'secure',
  'kernel', 'thread', 'process', 'module', 'device', 'channel', 'driver', 'interface', 'protocol', 'binary',
  'power', 'engine', 'speed', 'target', 'strike', 'active', 'input', 'output', 'pulse', 'orbit'
];

export const WORDLIST_ENGLISH_1K = [
  'ability', 'absolute', 'abstract', 'academy', 'accelerate', 'access', 'account', 'accurate',
  'achieve', 'acoustic', 'acquire', 'action', 'activate', 'activity', 'adapter', 'adaptive',
  'address', 'advanced', 'advisor', 'affect', 'agency', 'agenda', 'aircraft', 'airwave',
  'algorithm', 'aligned', 'allocate', 'alpha', 'altitude', 'analyst', 'analyzer', 'ancient',
  'antenna', 'aperture', 'apparent', 'applause', 'applied', 'approach', 'approval', 'arbitrary',
  'archive', 'argument', 'armored', 'array', 'artifact', 'artillery', 'assembly', 'assert',
  'assign', 'asteroid', 'atomic', 'attempt', 'attract', 'auction', 'audio', 'audit',
  'augment', 'authentic', 'authority', 'automate', 'auxiliary', 'available', 'avatar', 'aviation',
  'backbone', 'backup', 'balance', 'bandwidth', 'barrier', 'battery', 'beacon', 'behavior',
  'benchmark', 'binary', 'biometric', 'bionic', 'bitrate', 'blockade', 'blueprint', 'booster',
  'boundary', 'bracket', 'breach', 'broadband', 'broadcast', 'browser', 'buffer', 'bulletin',
  'bypass', 'calibrated', 'camera', 'campaign', 'capacity', 'capsule', 'capture', 'carrier',
  'cascade', 'catalog', 'category', 'cellular', 'central', 'centroid', 'century', 'certify',
  'channel', 'chassis', 'checksum', 'chemical', 'circuit', 'circular', 'citation', 'civilian',
  'clarity', 'classify', 'client', 'climate', 'cloning', 'cluster', 'coastal', 'coaxial',
  'cockpit', 'cognitive', 'coherent', 'collapse', 'collide', 'command', 'compact', 'compiler',
  'complex', 'component', 'compute', 'condense', 'condition', 'conductor', 'configure', 'confirm',
  'connect', 'consensus', 'console', 'constant', 'construct', 'container', 'continent', 'contract',
  'control', 'converter', 'coordinate', 'coprocessor', 'core', 'corridor', 'counter', 'coverage',
  'crawling', 'creation', 'creature', 'critical', 'crypto', 'crystal', 'current', 'cursor',
  'cyberdeck', 'cyberspace', 'cylinder', 'daemon', 'dashboard', 'database', 'datacenter', 'datagram',
  'daylight', 'deadline', 'debugger', 'decisive', 'decoder', 'decrypt', 'defender', 'defensive',
  'deflate', 'deflection', 'delegate', 'delta', 'density', 'deploy', 'derivative', 'designer',
  'desktop', 'destiny', 'detector', 'detonate', 'developer', 'device', 'diagnostic', 'diagram',
  'dialogue', 'diameter', 'diegetic', 'digital', 'dimension', 'direction', 'directory', 'disable',
  'discharge', 'discipline', 'discrete', 'dispatch', 'display', 'disrupt', 'distance', 'distortion',
  'distribute', 'district', 'divergent', 'dividend', 'doctrine', 'document', 'domain', 'dominant',
  'downlink', 'download', 'downward', 'drafting', 'dynamic', 'dynasty', 'echelon', 'ecosystem',
  'effective', 'efficient', 'elastic', 'electric', 'electrode', 'electron', 'elevation', 'eliminate',
  'embedded', 'emergency', 'emission', 'emphasis', 'empirical', 'emulate', 'enclave', 'encoder',
  'encrypt', 'endpoint', 'endurance', 'energetic', 'engineer', 'enhance', 'enormous', 'enterprise',
  'entropy', 'envelope', 'epidemic', 'equation', 'equator', 'equipped', 'escalate', 'essential',
  'estimate', 'ethernet', 'evaluate', 'evaporation', 'evolution', 'examine', 'exception', 'exchange',
  'exclusive', 'execution', 'exercise', 'exhaust', 'exhibition', 'exfiltrate', 'expansion', 'expedition',
  'experience', 'experiment', 'expert', 'explicit', 'explode', 'exploit', 'explorer', 'exponential',
  'exposure', 'extended', 'external', 'extract', 'extreme', 'fabricate', 'facility', 'facsimile',
  'factor', 'fallback', 'fastener', 'fatality', 'faultless', 'feasible', 'feature', 'federation',
  'feedback', 'fiber', 'fidelity', 'filament', 'filter', 'firewall', 'firmware', 'flagship',
  'flexible', 'floating', 'flowchart', 'fluctuate', 'flywheel', 'focal', 'forecast', 'forensic',
  'formatter', 'formula', 'fortress', 'forwarder', 'foundation', 'fraction', 'fragment', 'frequency',
  'friction', 'frontier', 'fuelcell', 'function', 'fundamental', 'furnace', 'fuselage', 'galactic',
  'galaxy', 'galvanic', 'garrison', 'gateway', 'generator', 'generic', 'genetic', 'geodesic',
  'geometry', 'geothermal', 'gigabyte', 'glitch', 'global', 'governor', 'gradient', 'graphics',
  'graviton', 'gridlock', 'guidance', 'gyroscope', 'habitat', 'hacker', 'handshake', 'hardware',
  'harmonic', 'headlight', 'headquarters', 'heatsink', 'heliport', 'heritage', 'hexadecimal', 'hierarchy',
  'highland', 'highspeed', 'highway', 'hologram', 'horizon', 'horizontal', 'hostname', 'humanoid',
  'hydraulic', 'hydrogen', 'hyperlink', 'hypertext', 'hypothesis', 'identify', 'ignition', 'illuminate',
  'imbalance', 'immersion', 'impact', 'imperative', 'implicit', 'importer', 'impression', 'impulse',
  'incident', 'incoming', 'increment', 'indicator', 'induction', 'infantry', 'inference', 'infinite',
  'infrared', 'ingress', 'inherent', 'initial', 'injection', 'innocent', 'innovate', 'inorganic',
  'inspector', 'instance', 'instinct', 'instrument', 'insulation', 'integral', 'intellect', 'interface',
  'intercept', 'interior', 'interlock', 'internal', 'internet', 'interval', 'intrinsic', 'intruder',
  'invariant', 'inventory', 'inverse', 'inverter', 'invisible', 'ionosphere', 'isolated', 'iteration',
  'joystick', 'junction', 'juncture', 'jupiter', 'keystroke', 'kilobyte', 'kinematic', 'kinetic',
  'laboratory', 'labyrinth', 'launcher', 'layering', 'layout', 'leadship', 'legendary', 'lethality',
  'liberate', 'library', 'lightning', 'limiter', 'linguistic', 'linkage', 'liquid', 'listener',
  'location', 'locomotive', 'logarithm', 'logistics', 'longitudinal', 'loopback', 'luminous', 'machinery',
  'macrocell', 'magnetic', 'magnitude', 'mainframe', 'maintain', 'mammoth', 'management', 'manifest',
  'manometer', 'marine', 'martian', 'masking', 'mastery', 'material', 'matrix', 'maximum',
  'mechanism', 'medalist', 'megapixel', 'membrane', 'memorial', 'meridian', 'mesosphere', 'metabolic',
  'metadata', 'metallurgy', 'meteorite', 'microchip', 'microcode', 'microwave', 'migration', 'military',
  'millisecond', 'miniature', 'missile', 'mission', 'mitigate', 'mnemonic', 'mobility', 'modem',
  'modifier', 'modulate', 'molecular', 'momentum', 'monochrome', 'monolithic', 'monorail', 'monument',
  'morphology', 'mosaic', 'motherboard', 'motion', 'motorcade', 'movement', 'multicast', 'multimedia',
  'multiplex', 'multiplayer', 'mutation', 'nanometer', 'nanotech', 'narrative', 'national', 'navigation',
  'nebulous', 'negative', 'negligible', 'nemesis', 'neonlight', 'neosphere', 'network', 'neural',
  'neutral', 'neutron', 'nexuses', 'nitrogen', 'nocturnal', 'nominal', 'nonvolatile', 'northerly',
  'notebook', 'novelist', 'nucleolus', 'nucleus', 'nullify', 'numerical', 'objective', 'obscurity',
  'observe', 'obstacle', 'obtaining', 'occupancy', 'occurrence', 'oceanic', 'octagonal', 'odometer',
  'offline', 'offshore', 'omnidirect', 'oncoming', 'onloading', 'operating', 'operation', 'operator',
  'opposing', 'optically', 'optician', 'optimize', 'optometry', 'orbiting', 'orchestra', 'ordinance',
  'organic', 'organism', 'oriental', 'original', 'orthogone', 'oscillator', 'outbreak', 'outcropping',
  'outermost', 'outflank', 'outgrowth', 'outlander', 'outmoded', 'outnumber', 'output', 'outreach',
  'outrigger', 'outshine', 'outspread', 'outstroke', 'outweigh', 'overburden', 'overcast', 'overclock',
  'overdrive', 'overflow', 'overhaul', 'overhead', 'overhear', 'overkill', 'overlay', 'overload',
  'overlook', 'overnight', 'overpass', 'override', 'overrule', 'overseas', 'oversight', 'overtaken',
  'overture', 'overview', 'oxidation', 'oxidizer', 'pacemaker', 'packaging', 'packet', 'pageant',
  'pagoda', 'painkiller', 'palladium', 'pancreas', 'pandemon', 'panorama', 'pantograph', 'parabolic',
  'parachute', 'paradigm', 'paradox', 'parallel', 'paralyze', 'parameter', 'paramount', 'parasite',
  'parchment', 'parental', 'parity', 'parkland', 'particle', 'partisan', 'partition', 'passageway',
  'passenger', 'passphrase', 'passport', 'password', 'patchwork', 'paternity', 'pathology', 'pathway',
  'patience', 'patriarch', 'patrolman', 'patronage', 'pattern', 'pavement', 'pavilion', 'payload',
  'payment', 'peaceful', 'peacetime', 'pedestrian', 'pendulum', 'penetrate', 'peninsula', 'pentagon',
  'penthouse', 'perceive', 'percentage', 'perceptor', 'perennial', 'perfect', 'perforate', 'perimeter',
  'periodical', 'peripheral', 'periscope', 'permanent', 'permeable', 'permission', 'permit', 'peroxide',
  'perpetual', 'perplexed', 'persevere', 'personal', 'personnel', 'pertain', 'pervasive', 'petroleum',
  'phantom', 'pharmacy', 'phenomena', 'pheromone', 'phosphate', 'photoengr', 'photograph', 'photonics',
  'physical', 'physician', 'physicist', 'physiology', 'pianoforte', 'picturesque', 'piezoelec', 'pigment',
  'pilgrimage', 'pillowcase', 'pilotless', 'pinnacle', 'pioneering', 'pipeline', 'piracy', 'pistachio',
  'piston', 'pitchfork', 'placement', 'planetoid', 'plankton', 'planner', 'planetary', 'plantation',
  'plasma', 'plasticity', 'platform', 'platinum', 'platoon', 'plausibly', 'playground', 'playhouse',
  'pleasure', 'plebeian', 'plenitude', 'plentiful', 'plexiglas', 'pliant', 'plowshare', 'plugboard',
  'plunderer', 'plurality', 'plutonium', 'pneumatic', 'pneumonia', 'pocketbook', 'pointless', 'poisonous',
  'polarizing', 'polemical', 'policeman', 'policymaker', 'polishable', 'polite', 'political', 'pollutant',
  'polyester', 'polyglot', 'polygon', 'polymer', 'polynomial', 'polyp', 'polyphony', 'polystyrene',
  'polythene', 'polyureth', 'pomegranate', 'ponderous', 'pontoon', 'popularity', 'populate', 'porcelain',
  'porcupine', 'porousness', 'porphyry', 'portability', 'portal', 'portfolio', 'porthole', 'portland',
  'portrait', 'portrayal', 'portuguese', 'possession', 'possibility', 'postage', 'postcard', 'postcode',
  'postdated', 'postgraduate', 'posthumous', 'postmaster', 'postmodern', 'postmortem', 'postnasal', 'postoperative',
  'postscript', 'postulate', 'potassium', 'potential', 'potentiom', 'powdered', 'powerhouse', 'powerless',
  'powerplant', 'practical', 'practitioner', 'pragmatic', 'prairie', 'precaution', 'precedence', 'precedent',
  'precept', 'precision', 'preclude', 'precursor', 'predator', 'predecessor', 'predestin', 'predicate',
  'predictable', 'prediction', 'predominant', 'preemptive', 'preface', 'preference', 'prefix', 'prehistoric',
  'prejudice', 'preliminary', 'prelude', 'premature', 'premeditat', 'premier', 'premises', 'premium',
  'premonition', 'preordain', 'preoccupy', 'preparation', 'preparatory', 'prepense', 'preponder', 'preposition',
  'preposterous', 'prerequisite', 'prerogative', 'prescription', 'presence', 'presentment', 'preservation', 'preserver',
  'presidency', 'presidential', 'pressboard', 'pressroom', 'pressure', 'pressurized', 'prestige', 'prestigious',
  'presumable', 'presumption', 'presumptive', 'pretension', 'pretentious', 'preternatural', 'prevalence', 'prevalent',
  'prevention', 'preventive', 'preview', 'previously', 'prewar', 'pricecutter', 'priceless', 'prickliness',
  'prideful', 'priesthood', 'primacy', 'primarily', 'primate', 'primeval', 'primitive', 'primogeniture',
  'primordial', 'principal', 'principle', 'printer', 'printable', 'printout', 'prioritize', 'priority',
  'privilege', 'probability', 'probation', 'problematic', 'procedure', 'proceeding', 'procession', 'processor',
  'proclamation', 'procreative', 'procurable', 'prodigious', 'productive', 'production', 'profession', 'proficiency',
  'profile', 'profound', 'profusion', 'progenitor', 'programmatic', 'programmer', 'progressive', 'prohibition',
  'projectile', 'projection', 'projector', 'proliferation', 'prolific', 'promenade', 'prominence', 'prominent',
  'promissory', 'promotional', 'prompter', 'promptness', 'promulgate', 'pronounce', 'proofread', 'propaganda',
  'propagation', 'propellant', 'propeller', 'propensity', 'properly', 'prophetic', 'prophylactic', 'proportion',
  'proposal', 'proposition', 'propulsion', 'prosaic', 'proscribe', 'prosecutor', 'proselyte', 'prospectus',
  'prosperity', 'prosperous', 'prosthesis', 'prosthetic', 'protectant', 'protective', 'protectorate', 'protocol',
  'prototype', 'protracted', 'protrusion', 'providence', 'providential', 'provocative', 'proximate', 'proximity',
  'quantum', 'quarantine', 'quicksilver', 'radar', 'radiation', 'radioactive', 'reactor', 'realtime',
  'reboot', 'recharge', 'reciprocity', 'recognize', 'recombine', 'recover', 'redirection', 'redundancy',
  'refactor', 'reflect', 'refraction', 'register', 'reinforce', 'relational', 'relay', 'release',
  'reliability', 'reluctance', 'rendezvous', 'repository', 'reservoir', 'resilience', 'resistance', 'resonance',
  'resource', 'response', 'retrieval', 'retrograde', 'revolution', 'ribbon', 'robotics', 'roguelite',
  'rootkit', 'rotational', 'satellite', 'saturation', 'scalability', 'scanner', 'schematic', 'scratchpad',
  'secondary', 'semiconductor', 'sentinel', 'sequence', 'serverless', 'shellcode', 'shielding', 'signature',
  'simulator', 'simulation', 'singularity', 'snapshot', 'software', 'soldering', 'solidstate', 'sonar',
  'spaceship', 'spectrum', 'speedometer', 'stability', 'standard', 'statement', 'statistics', 'stealth',
  'subsystem', 'supercomputer', 'surveillance', 'synchronize', 'synthesizer', 'telemetry', 'terminal', 'terrestrial',
  'thermionic', 'topology', 'trajectory', 'transceiver', 'transformer', 'transistor', 'transmission', 'transmitter',
  'transport', 'triangulate', 'ultrasonic', 'ultraviolet', 'unbreakable', 'unencrypted', 'unification', 'unlimited',
  'unprotected', 'upgrading', 'uplink', 'usability', 'utilitarian', 'utilization', 'validation', 'variable',
  'velocity', 'verification', 'virtualize', 'viscosity', 'visualization', 'voltage', 'vulnerability', 'wavelength',
  'waveform', 'weaponry', 'wireless', 'workstation', 'xenon', 'zeroday', 'zodiacal'
];

export const WORDLIST_CODE = [
  'function', 'return', 'const', 'let', 'async', 'await', 'import', 'export', 'class', 'extends',
  'constructor', 'console.log', 'document.getElementById', 'querySelector', 'addEventListener',
  'setTimeout', 'setInterval', 'clearInterval', 'Promise', 'then', 'catch', 'finally', 'try',
  'JSON.stringify', 'JSON.parse', 'Math.floor', 'Math.random', 'Math.max', 'Math.min', 'Array.from',
  'Object.keys', 'Object.values', 'Object.entries', 'push', 'pop', 'shift', 'unshift', 'splice',
  'slice', 'filter', 'map', 'reduce', 'forEach', 'find', 'findIndex', 'includes', 'indexOf',
  'def', 'class', 'self', '__init__', 'print', 'import', 'from', 'as', 'with', 'open',
  'try', 'except', 'raise', 'yield', 'lambda', 'enumerate', 'zip', 'range', 'len', 'sorted',
  'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'bool', 'None', 'True', 'False',
  '#include', '<iostream>', '<vector>', '<string>', '<memory>', 'std::cout', 'std::cin', 'std::endl',
  'int main()', 'void', 'public:', 'private:', 'template<typename T>', 'nullptr', 'auto', 'struct',
  'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'INSERT INTO',
  'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'PRIMARY KEY', 'FOREIGN KEY', 'NOT NULL', 'DEFAULT',
  'sudo apt update', 'systemctl status', 'journalctl -xe', 'chmod +x', 'chown root:root', 'netstat -tulnp',
  'iptables -A INPUT', 'nmap -sV -p-', 'curl -sSL', 'grep -rnI', 'ssh root@host', 'docker run -d -p',
  'kubectl get pods', 'git commit -m', 'git push origin', 'npm run dev', 'cargo build --release', 'go run main.go'
];

export const WORDLIST_THAI_200 = [
  'การ', 'ความ', 'และ', 'ใน', 'ที่', 'มี', 'เป็น', 'ได้', 'จะ', 'ให้',
  'ไม่', 'ของ', 'ไป', 'มา', 'นี้', 'อยู่', 'กับ', 'โดย', 'ว่า', 'ต้อง',
  'เพื่อ', 'ผู้', 'จาก', 'คน', 'วัน', 'ใช้', 'ทำ', 'งาน', 'ถึง', 'เข้า',
  'ขึ้น', 'แล้ว', 'อื่น', 'หรือ', 'นั้น', 'รู้', 'ยัง', 'ต่อ', 'ออก', 'ทาง',
  'มาก', 'ดี', 'เห็น', 'หลัง', 'ตาม', 'เกิด', 'รับ', 'พบ', 'หา', 'สร้าง',
  'เวลา', 'ปี', 'เรื่อง', 'ใหม่', 'หน้า', 'ใจ', 'ช่วย', 'เปิด', 'ระบบ', 'ผล',
  'ส่วน', 'ชีวิต', 'นำ', 'ต่าง', 'ดู', 'บ้าน', 'เมือง', 'โลก', 'เด็ก', 'กลุ่ม',
  'คิด', 'บอก', 'ข่าว', 'ผ่าน', 'ส่ง', 'ภาพ', 'สูง', 'ใหญ่', 'น้อย', 'สำคัญ',
  'รวม', 'ข้อมูล', 'เพิ่ม', 'จุด', 'มือ', 'ตัว', 'เรียน', 'เงิน', 'แรก', 'พร้อม',
  'เพื่อน', 'ก่อน', 'รัก', 'มอง', 'ถาม', 'ตอบ', 'หยุด', 'ลง', 'ยืน', 'นั่ง',
  'วิ่ง', 'เดิน', 'เร็ว', 'ช้า', 'ใกล้', 'ไกล', 'จริง', 'ถูก', 'ผิด', 'ง่าย',
  'ยาก', 'พูด', 'ฟัง', 'อ่าน', 'เขียน', 'พิมพ์', 'รหัส', 'คำสั่ง', 'เทอร์มินัล', 'เครือข่าย',
  'ปลอดภัย', 'ข้อมูล', 'โปรแกรม', 'ความเร็ว', 'นิ้วมือ', 'แป้นพิมพ์', 'สัมผัส', 'ทดสอบ', 'บันทึก', 'เป้าหมาย',
  'แม่นยำ', 'สำเร็จ', 'พัฒนา', 'เรียนรู้', 'ทักษะ', 'ฝึกฝน', 'สถิติ', 'คะแนน', 'ระดับ', 'รางวัล',
  'ควอนตัม', 'ดิจิทัล', 'เซิร์ฟเวอร์', 'อินเทอร์เน็ต', 'คอมพิวเตอร์', 'หน่วยความจำ', 'ประมวลผล', 'สัญญาณ', 'คลื่น', 'ความถี่'
];

export const WORDLIST_CYBER = [
  'quantum', 'airgap', 'enclave', 'rootkit', 'firewall', 'sentinel', 'exploit', 'zeroday',
  'payload', 'shellcode', 'metasploit', 'wireshark', 'nmap', 'keylogger', 'trojan', 'backdoor',
  'botnet', 'ddos', 'phishing', 'spoofing', 'sniffing', 'honeypot', 'cryptography', 'cipher',
  'decryption', 'encryption', 'rsa8192', 'aes256', 'sha512', 'elliptic', 'blockchain', 'bitcoin',
  'ethereum', 'monero', 'ledger', 'hashrate', 'keystroke', 'tactile', 'actuation', 'telemetry',
  'firmware', 'uefi', 'kernel', 'ring0', 'syscall', 'overflow', 'canary', 'aslr', 'dep',
  'sigint', 'humint', 'c4isr', 'satellite', 'transponder', 'spectrometer', 'frequency', 'airwaves',
  'handshake', 'deauth', 'wpa3', 'packet', 'socket', 'loopback', 'subnetwork', 'gateway', 'proxy',
  'tor', 'darknet', 'onion', 'cyberdeck', 'matrix', 'terminal', 'console', 'mainframe', 'supercomputer'
];

export const QUOTES_COLLECTION = [
  {
    text: "There is no spoon. It is not the spoon that bends, it is only yourself.",
    author: "The Matrix (1999)"
  },
  {
    text: "Hack the planet! Information wants to be free, and we are the conduits of the future.",
    author: "Hackers (1995)"
  },
  {
    text: "The sky above the port was the color of television, tuned to a dead channel.",
    author: "William Gibson (Neuromancer)"
  },
  {
    text: "Talk is cheap. Show me the code. Keystrokes build the digital frontier.",
    author: "Linus Torvalds"
  },
  {
    text: "Control is an illusion. You are either inside the system, or you are rewriting it.",
    author: "Mr. Robot (Elliot Alderson)"
  },
  {
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    author: "Albert Camus"
  },
  {
    text: "Speed is a byproduct of precision and muscle memory. Never look at the keys; feel the matrix.",
    author: "Cyber//Type Field Manual"
  },
  {
    text: "The quieter you become, the more you are able to hear. Silent keystrokes leave no digital trace.",
    author: "Kali Linux / Zen Proverb"
  }
];

/**
 * Procedurally assemble random word stream based on MonkeyType configuration
 */
export function generateSpeedWords(config = {}) {
  const mode = config.mode || 'time';
  const dictionaryKey = config.dictionary || 'english200';
  const hasPunctuation = !!config.hasPunctuation;
  const hasNumbers = !!config.hasNumbers;
  const wordCount = config.wordCount || 50;

  // 1. Quote Mode
  if (mode === 'quote') {
    const qIndex = Math.floor(Math.random() * QUOTES_COLLECTION.length);
    const quote = QUOTES_COLLECTION[qIndex];
    const words = quote.text.split(/\s+/).filter(w => w.length > 0);
    return {
      words: words,
      quoteAuthor: quote.author,
      rawText: quote.text
    };
  }

  // 2. Select Dictionary Word Pool
  let pool = WORDLIST_ENGLISH_200;
  if (dictionaryKey === 'english1k') {
    pool = WORDLIST_ENGLISH_1K;
  } else if (dictionaryKey === 'code') {
    pool = WORDLIST_CODE;
  } else if (dictionaryKey === 'thai200') {
    pool = WORDLIST_THAI_200;
  } else if (dictionaryKey === 'cyber') {
    pool = WORDLIST_CYBER;
  }

  // Determine how many words to generate
  let count = wordCount;
  if (mode === 'time') {
    const timeSec = config.timeLimit || 30;
    // Generate ~4 words per second + buffer so the user never runs out
    count = Math.max(60, Math.ceil(timeSec * 4.5));
  } else if (mode === 'zen') {
    count = 150;
  }

  const generated = [];
  const punctuationMarks = ['.', ',', ',', ';', ':', '!', '?', '"', "'"];

  for (let i = 0; i < count; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)];

    // Inject Numbers
    if (hasNumbers && Math.random() < 0.18 && dictionaryKey !== 'code') {
      const num = Math.floor(Math.random() * 9999);
      word = Math.random() > 0.5 ? `${num}` : `${word}${Math.floor(Math.random() * 99)}`;
    }

    // Inject Punctuation (English only, avoid corrupting Thai or code)
    if (hasPunctuation && dictionaryKey !== 'thai200' && dictionaryKey !== 'code' && Math.random() < 0.22) {
      const punc = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
      if (punc === '"' || punc === "'") {
        word = `${punc}${word}${punc}`;
      } else {
        word = `${word}${punc}`;
      }
    }

    generated.push(word);
  }

  return {
    words: generated,
    rawText: generated.join(' ')
  };
}
