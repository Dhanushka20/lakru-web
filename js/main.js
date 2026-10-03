/**
 * DHANUSHKA LAKRUWAN - GAMIFIED PORTFOLIO CORE ENGINE (80% WHITE CLEAN THEME)
 * Sound synthesis (Web Audio API), XP/Level Progression, Canvas Particle Grid
 */

// 1. Audio Synthesizer (Zero external files needed)
class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('cyber_sfx_enabled') === 'true';
    this.initAudioContext();
  }

  initAudioContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('cyber_sfx_enabled', this.enabled);
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.enabled) {
      this.playPowerUp();
    }
    this.updateSoundButtons();
    return this.enabled;
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!this.enabled) return;
    try {
      this.initAudioContext();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  playHover() {
    this.playBeep(650, 'triangle', 0.04, 0.03);
  }

  playClick() {
    this.playBeep(880, 'square', 0.06, 0.04);
  }

  playPowerUp() {
    if (!this.enabled) return;
    try {
      this.initAudioContext();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch(e) {}
  }

  playQuestComplete() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playBeep(freq, 'sine', 0.15, 0.08);
      }, i * 90);
    });
  }

  updateSoundButtons() {
    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
      const icon = btn.querySelector('.sound-icon');
      const text = btn.querySelector('.sound-text');
      if (this.enabled) {
        if (icon) icon.className = 'sound-icon fas fa-volume-high text-yellow-500';
        if (text) text.textContent = 'SFX: ON';
        btn.classList.add('border-yellow-400', 'bg-yellow-50', 'text-yellow-700');
        btn.classList.remove('border-slate-300', 'bg-white', 'text-slate-600');
      } else {
        if (icon) icon.className = 'sound-icon fas fa-volume-xmark text-slate-400';
        if (text) text.textContent = 'SFX: OFF';
        btn.classList.remove('border-yellow-400', 'bg-yellow-50', 'text-yellow-700');
        btn.classList.add('border-slate-300', 'bg-white', 'text-slate-600');
      }
    });
  }
}

// 2. XP & Gamified Progress System
class GamifyEngine {
  constructor(audio) {
    this.audio = audio;
    this.xp = parseInt(localStorage.getItem('user_cyber_xp') || '1250');
    this.maxLevelXP = 2000;
    this.initHUD();
  }

  addXP(amount, questName = 'Exploration Mission') {
    this.xp += amount;
    localStorage.setItem('user_cyber_xp', this.xp);
    this.updateHUD();
    this.showToast(`+${amount} XP: ${questName}! 🚀`);
    this.audio.playQuestComplete();
  }

  updateHUD() {
    const level = Math.floor(this.xp / 1000) + 1;
    const currentLvlXP = this.xp % 1000;
    const percentage = Math.min(100, Math.round((currentLvlXP / 1000) * 100));

    document.querySelectorAll('.xp-val').forEach(el => el.textContent = this.xp);
    document.querySelectorAll('.lvl-val').forEach(el => el.textContent = `LVL ${level}`);
    document.querySelectorAll('.xp-progress-bar').forEach(bar => {
      bar.style.width = `${percentage}%`;
    });
  }

  initHUD() {
    this.updateHUD();
  }

  showToast(message) {
    let container = document.getElementById('cyber-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cyber-toast-container';
      container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 border-2 border-yellow-400 text-yellow-400 px-4 py-3 rounded-xl shadow-xl yellow-glow-sm flex items-center gap-3 backdrop-blur-md font-mono text-sm transform translate-y-8 opacity-0 transition-all duration-300 pointer-events-auto';
    toast.innerHTML = `<i class="fas fa-trophy text-yellow-400 animate-bounce"></i> <span class="font-bold">${message}</span>`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-8', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-8', 'opacity-0');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}

// 3. Cyber Canvas Particle Background for Clean Light Theme
function initCyberCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = Math.min(45, Math.floor(width / 30));

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1.2,
      opacity: Math.random() * 0.4 + 0.2
    });
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234, 179, 8, ${p.opacity})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(203, 213, 225, ${0.4 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

// 4. Global Initializations
document.addEventListener('DOMContentLoaded', () => {
  const audio = new CyberAudioEngine();
  const gamify = new GamifyEngine(audio);
  window.cyberAudio = audio;
  window.cyberGamify = gamify;

  audio.updateSoundButtons();
  document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.toggle();
    });
  });

  document.querySelectorAll('a, button, .interactive-card').forEach(el => {
    el.addEventListener('mouseenter', () => audio.playHover());
    el.addEventListener('click', () => audio.playClick());
  });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      audio.playClick();
    });
  }

  initCyberCanvas();

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-yellow-600', 'font-bold', 'border-b-2', 'border-yellow-400');
      link.classList.remove('text-slate-600');
    }
  });
});
