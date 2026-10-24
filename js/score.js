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

// 블록 악보: 손가락 10개를 무작위 순서로 한 번씩, 각각 blockLen박 연속. 이것을 rounds번 반복.
export function makeBlockScore(rounds, blockLen) {
  const score = [];
  for (let r = 0; r < rounds; r++) {
    for (const k of sample(KEYS, KEYS.length)) {
      for (let i = 0; i < blockLen; i++) score.push([k]);
    }
  }
  return score;
}

// i번째 박자 다음에 처음으로 다른 조합이 나오는 위치 (없으면 -1)
export function nextChange(score, i) {
  const cur = String(score[i]);
  for (let j = i + 1; j < score.length; j++) if (String(score[j]) !== cur) return j;
  return -1;
}

export function describe(keys) {
  if (!keys) return '';
  if (!keys.length) return '쉼';
  return keys.map((k) => {
    const [side, f] = k.split('-');
    return `${side === 'left' ? '왼손' : '오른손'} ${FINGER_KO[f]}`;
  }).join(' + ');
}
