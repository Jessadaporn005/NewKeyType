import { profileStore } from './profileStore.js';

export class VirtualNetwork {
  constructor(app) {
    this.app = app;
    this.activeTarget = null;
    this.traceProgress = 0;
    this.traceInterval = null;

    // Upgrades
    this.upgrades = {
      proxyBouncer: 0,
      quantumDecryptor: 0
    };

    // Virtual Targets Database (Procedural)
    this.corpNames = ['Militech', 'Arasaka', 'Kang Tao', 'NCPD', 'NetWatch', 'Biotechnica', 'Petrochem', 'Kiroshi', 'Zetatech', 'Night Corp'];
    this.targets = [];
    for(let i=0; i<5; i++) {
      this.targets.push(this.generateTarget());
    }
  }

  generateTarget() {
    const corp = this.corpNames[Math.floor(Math.random() * this.corpNames.length)];
    const suffix = ['Outpost', 'DB', 'R&D', 'Archives', 'Node', 'HQ', 'Subnet', 'Relay'][Math.floor(Math.random() * 8)];
    
    // Difficulty from 1 to 5
    const diff = Math.floor(Math.random() * 5) + 1;
    
    const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    
    // Reward scales with diff
    const reward = (diff * 500) + Math.floor(Math.random() * 500);
    
    // Ports
    const possiblePorts = [21, 22, 80, 443, 3306, 3389, 8080, 53];
    const openPorts = [];
    for(let i=0; i<(diff+1); i++) {
      const p = possiblePorts[Math.floor(Math.random() * possiblePorts.length)];
      if(!openPorts.includes(p)) openPorts.push(p);
    }
    // Always ensure SSH is open so they can connect
    if(!openPorts.includes(22)) openPorts.push(22);

    return { ip, name: `${corp} ${suffix}`, diff, openPorts, reward, hacked: false };
  }

  addCredits(amount) {
    const user = this.app.username || 'Anan';
    profileStore.addCredits(user, amount);
    this.app.syncProfileToHud();
    if(this.app.audio) this.app.audio.playSuccessFanfare();
  }

  getBBSList() {
    let out = `\n--- SHADOW BBS : ACTIVE CONTRACTS ---\n`;
    out += `IP ADDRESS      | CORP / TARGET        | DIFF | REWARD\n`;
    out += `------------------------------------------------------\n`;
    this.targets.forEach(t => {
      const status = t.hacked ? '[COMPLETED]' : `${t.reward} CC`;
      out += `${t.ip.padEnd(15)} | ${t.name.padEnd(20)} |  ${t.diff}   | ${status}\n`;
    });
    out += `\nHint: Use 'nmap [ip]' to scan a target, then 'ssh [ip]' to infiltrate.`;
    return out;
  }

  scanTarget(ip) {
    const target = this.targets.find(t => t.ip === ip);
    if (!target) return `nmap: Host ${ip} seems down or unreachable.`;
    
    let out = `\n[+] Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toISOString()}\n`;
    out += `Nmap scan report for ${target.name} (${target.ip})\n`;
    out += `Host is up (0.0${Math.floor(Math.random()*90)+10}s latency).\n\n`;
    out += `PORT     STATE  SERVICE\n`;
    
    target.openPorts.forEach(p => {
      const service = p === 21 ? 'ftp' : p === 22 ? 'ssh' : p === 80 ? 'http' : p === 443 ? 'https' : p === 3306 ? 'mysql' : 'unknown';
      out += `${p.toString().padEnd(5)}/tcp open   ${service}\n`;
    });
    
    out += `\nNmap done: 1 IP address scanned in 1.42 seconds\n`;
    return out;
  }

  connectSSH(ip) {
    if (this.activeTarget) return `[✗] Error: Already connected to ${this.activeTarget.ip}. Use 'disconnect' first.`;
    
    const target = this.targets.find(t => t.ip === ip);
    if (!target) return `ssh: connect to host ${ip} port 22: Connection refused`;

    this.activeTarget = target;
    if(this.app.audio) this.app.audio.playSuccessFanfare();
    this.startTrace(target.diff);

    return `
[+] ESTABLISHING SECURE TUNNEL TO ${ip}...
[+] BYPASSING FIREWALL (Proxy Bounce Lvl ${this.upgrades.proxyBouncer})...
[✓] CONNECTION ESTABLISHED.

Welcome to ${target.name} Secure Server.
-----------------------------------------
WARNING: ACTIVE TRACE DETECTED!
You have limited time before NetWatch pinpoints your location.
Type 'hack' to steal data, 'clearlogs' to wipe your trace, and 'disconnect' to exit.
`;
  }

  startTrace(diff) {
    this.traceProgress = 0;
    if (this.app.dom.hudTracePanel) {
      this.app.dom.hudTracePanel.classList.remove('hidden');
      this.app.dom.hudTraceBar.style.width = '0%';
      this.app.dom.hudTraceVal.textContent = '0%';
    }

    if (this.traceInterval) clearInterval(this.traceInterval);

    // Speed depends on diff and proxy upgrade
    const baseSpeed = diff * 2.0; 
    const proxyMitigation = this.upgrades.proxyBouncer * 0.4;
    const actualSpeed = Math.max(0.5, baseSpeed - proxyMitigation);

    this.traceInterval = setInterval(() => {
      if (!this.activeTarget) return;

      this.traceProgress += actualSpeed;
      if (this.traceProgress > 100) this.traceProgress = 100;

      if (this.app.dom.hudTraceBar) {
        this.app.dom.hudTraceBar.style.width = `${this.traceProgress}%`;
        this.app.dom.hudTraceVal.textContent = `${Math.floor(this.traceProgress)}%`;
      }

      if (this.traceProgress >= 100) {
        this.busted();
      }
    }, 1000);
  }

  hackData() {
    if (!this.activeTarget) return { type: 'error', msg: `[✗] Error: Not connected to any target.` };
    if (this.activeTarget.hacked) return { type: 'error', msg: `[!] Data already extracted from this node.` };

    // Return a signal to start the mini-game instead of just winning
    return { type: 'start_minigame', target: this.activeTarget };
  }

  hackSuccess(solvedDaemons) {
    if (!this.activeTarget) return `[✗] Error: Not connected.`;
    
    this.activeTarget.hacked = true;
    const bonus = solvedDaemons * 200;
    const totalReward = this.activeTarget.reward + bonus;
    const btcReward = Math.round(totalReward / 8);
    
    const user = this.app.username || 'Anan';
    profileStore.addCredits(user, totalReward);
    profileStore.addBitcoin(user, btcReward);
    this.app.addExp(Math.round(totalReward * 0.6), `Infiltrated ${this.activeTarget.name}`);
    this.app.syncProfileToHud();
    
    // Replace hacked target with a new procedural one
    const index = this.targets.indexOf(this.activeTarget);
    if (index > -1) {
      this.targets[index] = this.generateTarget();
    }
    
    return `
[+] BYPASSING ENCRYPTION...
[✓] ACCESS GRANTED. (Daemons solved: ${solvedDaemons})
[+] DOWNLOADING CONFIDENTIAL DATABASE DUMP... 100%
[✓] DATA SECURED & ENCRYPTED. 
[!] Reward Transferred: +${totalReward} CC | +₿ ${btcReward} BTC
[!] WARNING: SENTINEL TRACE IS ACTIVE. TYPE 'clearlogs' AND 'disconnect'.
`;
  }

  hackFail() {
    if (!this.activeTarget) return ``;
    
    // Penalty: Increase trace progress massively
    this.traceProgress += 35;
    if(this.app.audio) this.app.audio.playErrorSound();
    
    return `
[✗] BREACH FAILED. ENCRYPTION HELD.
[!] WARNING: TRACE ACCELERATED DUE TO FAILED BREACH ATTEMPT!
`;
  }

  clearLogs() {
    if (!this.activeTarget) return `[✗] Error: Not connected to any target.`;
    
    this.traceProgress = Math.max(0, this.traceProgress - 35); // Reduces trace by 35%
    return `[✓] /var/log/ and auth.log wiped. Trace signatures scrambled (-35% Trace).`;
  }

  disconnect() {
    if (!this.activeTarget) return `[✗] Error: Not connected to any target.`;
    
    clearInterval(this.traceInterval);
    if (this.app.dom.hudTracePanel) {
      this.app.dom.hudTracePanel.classList.add('hidden');
    }
    
    const wasTarget = this.activeTarget;
    this.activeTarget = null;
    
    return `[+] Secure tunnel to ${wasTarget.ip} severed. Connection closed.`;
  }

  busted() {
    clearInterval(this.traceInterval);
    if (this.app.dom.hudTracePanel) {
      this.app.dom.hudTracePanel.classList.add('hidden');
    }
    const wasTarget = this.activeTarget;
    this.activeTarget = null;
    
    const user = this.app.username || 'Anan';
    const prof = profileStore.getProfile(user);
    const penalty = Math.floor((prof.credits || 0) * 0.15);
    if (penalty > 0) {
      profileStore.spendCredits(user, penalty);
      this.app.syncProfileToHud();
    }

    if (this.app.audio && this.app.audio.playAlarmSiren) {
      this.app.audio.playAlarmSiren();
    }
    
    const alertEl = document.createElement('div');
    alertEl.className = 'cli-history-output';
    alertEl.style.color = '#ff2255';
    alertEl.style.fontWeight = 'bold';
    alertEl.innerHTML = `
[!] EMERGENCY ALARM: NETWATCH IDS TRACE REACHED 100%!
[!] Intrusion detected on ${wasTarget ? wasTarget.name : 'Target'}. Emergency lockdown initiated.
[!] Security penalty: ${penalty} CC confiscated.
`;
    if (this.app.dom.cliHistory) {
      this.app.dom.cliHistory.appendChild(alertEl);
      this.app.scrollToBottom();
    }
  }

  openShop(args) {
    if (args.length === 0) {
      let out = `\n--- THE VOID : BLACK MARKET ---\n`;
      out += `Your Balance: ${this.credits} CC\n\n`;
      out += `ID | ITEM                | COST    | DESC\n`;
      out += `----------------------------------------------------------\n`;
      out += `1  | Proxy Bouncer       | 1500 CC | Slows down Active Trace. (Lvl: ${this.upgrades.proxyBouncer})\n`;
      out += `2  | Quantum Decryptor   | 3000 CC | (Passive) Adds time to Breach. (Lvl: ${this.upgrades.quantumDecryptor})\n`;
      out += `\nTo buy, type: shop buy [id]\n`;
      return out;
    }

    if (args[0] === 'buy' && args[1]) {
      const id = args[1];
      if (id === '1') {
        if (this.credits >= 1500) {
          this.credits -= 1500;
          this.upgrades.proxyBouncer += 1;
          this.saveData();
          return `[✓] Purchased Proxy Bouncer! Current Level: ${this.upgrades.proxyBouncer}`;
        } else return `[✗] Insufficient funds.`;
      } else if (id === '2') {
        if (this.credits >= 3000) {
          this.credits -= 3000;
          this.upgrades.quantumDecryptor += 1;
          this.saveData();
          return `[✓] Purchased Quantum Decryptor! Current Level: ${this.upgrades.quantumDecryptor}`;
        } else return `[✗] Insufficient funds.`;
      }
      return `[✗] Invalid item ID.`;
    }
    return `[✗] Invalid shop command.`;
  }
}

window.VirtualNetwork = VirtualNetwork;
