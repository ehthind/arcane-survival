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

    // --- MEDIEVAL SYNTH MUSIC ---

    startMusic() {
        if (!this.enabled || this.musicPlaying) return;
        this.ensureContext();
        this.musicPlaying = true;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.06;
        this.musicGain.connect(this.master);
        this._beat = 0;
        this._bpm = 100;
        this._beatDur = 60 / this._bpm;
        // D Dorian: D E F G A B C D (medieval feel)
        this._scale = [146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66];
        this._scaleLow = this._scale.map(f => f / 2);
        this._melodyPatterns = [
            [0, 2, 4, 7, 4, 2, 0, 4],   // ascending/descending run
            [4, 3, 2, 0, 2, 4, 7, 4],   // arch shape
            [0, 4, 3, 4, 2, 0, 7, 5],   // leaping
            [7, 5, 4, 2, 0, 2, 4, 0],   // descending
        ];
        this._arpPatterns = [
            [0, 4, 2, 4], // i - v - iii - v
            [0, 2, 4, 7], // ascending
            [4, 2, 0, 4], // rocking
            [0, 7, 4, 2], // wide leap
        ];
        this._currentMelody = 0;
        this._currentArp = 0;
        this.playMusicPhrase();
    }

    // Plucked lute tone — triangle + harmonic with fast decay
    playLuteNote(freq, startTime, duration, volume = 0.5) {
        if (!this.musicPlaying) return;
        const ctx = this.ctx;
        // Fundamental
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.value = freq;
        // Second harmonic (octave) for brightness
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;
        // Third harmonic (faint)
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;

        const gain = ctx.createGain();
        const g2 = ctx.createGain();
        const g3 = ctx.createGain();

        // Plucked string envelope — sharp attack, quick decay, gentle sustain
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(volume * 0.35, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        g2.gain.setValueAtTime(0, startTime);
        g2.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.003);
        g2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

        g3.gain.setValueAtTime(0, startTime);
        g3.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.002);
        g3.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.3);

        // Gentle low-pass to soften
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, startTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 2, startTime + duration);
        filter.Q.value = 1;

        osc1.connect(gain);
        osc2.connect(g2);
        osc3.connect(g3);
        gain.connect(filter);
        g2.connect(filter);
        g3.connect(filter);
        filter.connect(this.musicGain);

        osc1.start(startTime);
        osc2.start(startTime);
        osc3.start(startTime);
        osc1.stop(startTime + duration + 0.05);
        osc2.stop(startTime + duration + 0.05);
        osc3.stop(startTime + duration + 0.05);
    }

    // Drone note — sustained low fifth
    playDrone(startTime, duration) {
        if (!this.musicPlaying) return;
        const ctx = this.ctx;
        // D2 drone
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 73.42; // D2
        // A2 — perfect fifth
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 110; // A2

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.5);
        gain.gain.setValueAtTime(0.25, startTime + duration - 0.5);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0, startTime);
        g2.gain.linearRampToValueAtTime(0.12, startTime + 0.5);
        g2.gain.setValueAtTime(0.12, startTime + duration - 0.5);
        g2.gain.linearRampToValueAtTime(0, startTime + duration);

        osc1.connect(gain).connect(this.musicGain);
        osc2.connect(g2).connect(this.musicGain);
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration + 0.1);
        osc2.stop(startTime + duration + 0.1);
    }

    playMusicPhrase() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime + 0.05;
        const bd = this._beatDur;
        const phraseBeats = 8;
        const phraseDur = phraseBeats * bd;

        // Low drone — sustained through phrase
        this.playDrone(t, phraseDur);

        // Lute arpeggio — rhythmic plucked pattern (low register)
        const arp = this._arpPatterns[this._currentArp % this._arpPatterns.length];
        for (let i = 0; i < phraseBeats; i++) {
            const note = this._scaleLow[arp[i % arp.length]];
            this.playLuteNote(note, t + i * bd, bd * 0.8, 0.3);
        }

        // Melody — upper register plucked notes
        const melody = this._melodyPatterns[this._currentMelody % this._melodyPatterns.length];
        for (let i = 0; i < phraseBeats; i++) {
            const note = this._scale[melody[i]];
            const startTime = t + i * bd + bd * 0.5; // offset by half beat
            const noteDur = bd * 0.7;
            this.playLuteNote(note, startTime, noteDur, 0.4);
        }

        // Occasional high ornament (like a medieval trill)
        if (Math.random() < 0.4) {
            const ornamentBeat = Math.floor(Math.random() * 4) * 2;
            const baseNote = this._scale[melody[ornamentBeat]];
            const graceNote = baseNote * (9 / 8); // whole step above
            this.playLuteNote(graceNote, t + ornamentBeat * bd + bd * 0.35, bd * 0.15, 0.15);
        }

        // Cycle through patterns
        this._beat += phraseBeats;
        if (this._beat % 16 === 0) {
            this._currentMelody = (this._currentMelody + 1) % this._melodyPatterns.length;
        }
        if (this._beat % 8 === 0) {
            this._currentArp = (this._currentArp + 1) % this._arpPatterns.length;
        }

        // Schedule next phrase
        this._musicTimeout = setTimeout(() => this.playMusicPhrase(), phraseDur * 1000 - 50);
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
