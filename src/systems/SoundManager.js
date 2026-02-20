/**
 * Procedural sound synthesizer using Web Audio API.
 * Zero external audio files — everything generated from oscillators + noise.
 */
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.musicGain = null;
        this.musicPlaying = false;
        this.masterVolume = 0.4;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.masterVolume;
        this.master.connect(this.ctx.destination);
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    // --- SOUND EFFECTS ---

    magicBolt() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    swordSwing() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Noise burst for swoosh
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(800, t + 0.12);
        filter.Q.value = 2;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        noise.connect(filter).connect(gain).connect(this.master);
        noise.start(t);
        noise.stop(t + 0.15);
    }

    enemyHit() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    enemyDeath() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Low thud + noise
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.25);

        // Crumble noise
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.06, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noise.connect(nGain).connect(this.master);
        noise.start(t);
        noise.stop(t + 0.2);
    }

    goldPickup() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Bright two-note chime
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1200, t);
        osc2.frequency.setValueAtTime(1600, t + 0.06);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc1.connect(gain).connect(this.master);
        osc2.connect(gain);
        osc1.start(t);
        osc1.stop(t + 0.1);
        osc2.start(t + 0.06);
        osc2.stop(t + 0.2);
    }

    playerHurt() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    frostNova() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Glass shatter + freeze sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.35);

        // Ice crackle
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3) * 0.5;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.08, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        noise.connect(filter).connect(nGain).connect(this.master);
        noise.start(t);
        noise.stop(t + 0.3);
    }

    groundSlam() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Deep impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.4);

        // Rubble noise
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.15, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        noise.connect(filter).connect(nGain).connect(this.master);
        noise.start(t);
        noise.stop(t + 0.3);
    }

    shopOpen() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Mystical ascending arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = t + i * 0.08;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
            osc.connect(gain).connect(this.master);
            osc.start(start);
            osc.stop(start + 0.25);
        });
    }

    purchase() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Register ka-ching
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.05);
        osc.frequency.setValueAtTime(1600, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    waveStart() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // War horn
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(130, t + 0.3);
        osc.frequency.linearRampToValueAtTime(110, t + 0.6);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
        gain.gain.setValueAtTime(0.08, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        osc.connect(filter).connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.7);
    }

    gameOver() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Descending sad notes
        const notes = [392, 349, 330, 262]; // G4, F4, E4, C4
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = t + i * 0.2;
            gain.gain.setValueAtTime(0.1, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.connect(gain).connect(this.master);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    chainLightning() {
        if (!this.enabled) return;
        this.ensureContext();
        const t = this.ctx.currentTime;
        // Electric zap
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() > 0.5 ? 1 : -1) * Math.random() * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        noise.connect(gain).connect(this.master);
        noise.start(t);
        noise.stop(t + 0.08);
    }

    // --- AMBIENT MUSIC ---

    startMusic() {
        if (!this.enabled || this.musicPlaying) return;
        this.ensureContext();
        this.musicPlaying = true;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.03;
        this.musicGain.connect(this.master);
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;

        // Dark ambient drone — layered oscillators
        const notes = [65.4, 82.4, 98.0]; // C2, E2, G2 — dark minor triad
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;
            const gain = this.ctx.createGain();
            const dur = 4;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.5, t + 0.5);
            gain.gain.setValueAtTime(0.5, t + dur - 0.5);
            gain.gain.linearRampToValueAtTime(0, t + dur);
            osc.connect(gain).connect(this.musicGain);
            osc.start(t);
            osc.stop(t + dur);
        });

        // Schedule next loop
        this._musicTimeout = setTimeout(() => this.playMusicLoop(), 3800);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this._musicTimeout) clearTimeout(this._musicTimeout);
        if (this.musicGain) {
            this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        }
    }
}

// Singleton
export const soundManager = new SoundManager();
