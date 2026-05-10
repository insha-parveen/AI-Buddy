import { useCallback, useRef } from 'react';

type SoundType = 'notification' | 'alarm' | 'chime' | 'bell';

interface UseSoundAlertReturn {
  playSound: (type?: SoundType) => void;
  stopSound: () => void;
}

// Generate sounds using Web Audio API
const createSound = (audioContext: AudioContext, type: SoundType): OscillatorNode[] => {
  const oscillators: OscillatorNode[] = [];
  const now = audioContext.currentTime;

  switch (type) {
    case 'notification': {
      // Pleasant two-tone notification
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1100, now + 0.1);
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);
      oscillators.push(osc1);
      break;
    }
    case 'alarm': {
      // Attention-grabbing alarm pattern
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(800, now + i * 0.4);
        osc.frequency.setValueAtTime(600, now + i * 0.4 + 0.15);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, now + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.4 + 0.3);
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 0.35);
        oscillators.push(osc);
      }
      break;
    }
    case 'chime': {
      // Gentle chime sound
      const frequencies = [523, 659, 784, 1047];
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.5);
        oscillators.push(osc);
      });
      break;
    }
    case 'bell': {
      // Bell-like sound with harmonics
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const gain2 = audioContext.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain2);
      gain.connect(audioContext.destination);
      gain2.connect(audioContext.destination);
      
      osc1.frequency.setValueAtTime(830, now);
      osc2.frequency.setValueAtTime(1245, now);
      osc1.type = 'sine';
      osc2.type = 'sine';
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc1.start(now);
      osc1.stop(now + 1);
      osc2.start(now);
      osc2.stop(now + 0.5);
      
      oscillators.push(osc1, osc2);
      break;
    }
  }

  return oscillators;
};

export function useSoundAlert(): UseSoundAlertReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const playSound = useCallback((type: SoundType = 'bell') => {
    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Stop any existing sounds
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });

      // Create and play new sound
      oscillatorsRef.current = createSound(audioContextRef.current, type);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  const stopSound = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];
  }, []);

  return { playSound, stopSound };
}
