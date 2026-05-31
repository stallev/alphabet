
// Простой синтезатор звуков на Web Audio API
// Не требует внешних файлов

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export type SoundType = 'flip' | 'match' | 'error' | 'correct' | 'win' | 'click';

export const playSound = (type: SoundType, isMuted: boolean) => {
  // Audio effects are temporarily disabled
  return;
  if (isMuted) return; // eslint-disable-line no-unreachable
  
  try {
    const ctx = getCtx();
    // Возобновляем контекст, если он был приостановлен (политика автовоспроизведения браузеров)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'flip':
        // Короткий высокий щелчок
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'match':
        // Мажорное трезвучие (арпеджио)
        playTone(ctx, 523.25, 0, 0.1); // C5
        playTone(ctx, 659.25, 0.1, 0.1); // E5
        playTone(ctx, 783.99, 0.2, 0.3); // G5
        break;

      case 'error':
        // Мягкий нисходящий тон (triangle вместо sawtooth)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3); // A3
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'correct':
        // Трубная победная фанфара (Sawtooth волна имитирует медь)
        // Быстрый восходящий пассаж с аккордом в конце
        playTone(ctx, 523.25, 0, 0.1, 'sawtooth');   // C5
        playTone(ctx, 659.25, 0.1, 0.1, 'sawtooth'); // E5
        playTone(ctx, 783.99, 0.2, 0.4, 'sawtooth'); // G5 (долгий)
        playTone(ctx, 1046.50, 0.2, 0.4, 'sawtooth');// C6 (долгий, гармония)
        break;
      
      case 'click':
        // Тихий клик интерфейса
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'win':
        // Фанфары
        const melody = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        melody.forEach((note, i) => {
          playTone(ctx, note, i * 0.15, 0.2);
        });
        setTimeout(() => {
           playTone(ctx, 783.99, 0, 0.15);
           playTone(ctx, 1046.50, 0.15, 0.4);
        }, 600);
        break;
    }
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

const playTone = (ctx: AudioContext, freq: number, delay: number, duration: number, type: OscillatorType = 'sine') => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const start = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  
  // Envelope для более мягкого или резкого звука в зависимости от типа
  if (type === 'sawtooth') {
    // Более резкая атака для "трубы"
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.02); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration); // Decay
  } else {
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
  }
  
  osc.start(start);
  osc.stop(start + duration);
};
