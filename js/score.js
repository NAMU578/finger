// 악보(박자마다 눌러야 할 손가락 목록) 생성
import { FINGERS, FINGER_KO } from './fingers.js';

// 손가락 10개의 고정 순서. CSV 열 순서도 이것을 따른다.
export const KEYS = ['left', 'right'].flatMap((s) => FINGERS.map((f) => `${s}-${f}`));

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

export const PATTERNS = {
  single: { label: '한 손 한 손가락', make: () => [pick(KEYS)] },
  chord: {
    label: '한 손 여러 손가락 (2~3개)',
    make: () => {
      const side = pick(['left', 'right']);
      return sample(FINGERS, Math.random() < 0.7 ? 2 : 3).map((f) => `${side}-${f}`);
    },
  },
  both: { label: '양손 각 한 손가락', make: () => [`left-${pick(FINGERS)}`, `right-${pick(FINGERS)}`] },
  rest: { label: '쉼 (아무것도 안 누름)', make: () => [] },
};

export function makeScore(nBeats, types) {
  return Array.from({ length: nBeats }, () => PATTERNS[pick(types)].make());
}

export function describe(keys) {
  if (!keys) return '';
  if (!keys.length) return '쉼';
  return keys.map((k) => {
    const [side, f] = k.split('-');
    return `${side === 'left' ? '왼손' : '오른손'} ${FINGER_KO[f]}`;
  }).join(' + ');
}
