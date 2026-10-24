// 프레임별 관절 좌표와 박자 정보를 모아 CSV로 내보낸다.
import { KEYS } from './score.js';

const SIDES = ['left', 'right'];
const LM_COLS = SIDES.flatMap((s) =>
  Array.from({ length: 21 }, (_, i) => ['x', 'y', 'z'].map((a) => `${s}_${i}_${a}`)).flat());
const EMPTY_HAND = Array(63).fill(''); // 손이 안 보인 프레임은 빈칸 → pandas에서 NaN

export function createRecorder() {
  const rows = [];
  return {
    addFrame(t, hands) {
      const row = [t.toFixed(1)];
      for (const side of SIDES) {
        const h = hands.find((h) => h.side === side);
        row.push(...(h ? h.landmarks.flatMap((p) => [p.x, p.y, p.z].map((v) => v.toFixed(4))) : EMPTY_HAND));
      }
      rows.push(row.join(','));
    },
    count: () => rows.length,
    csv: () => ['t', ...LM_COLS].join(',') + '\n' + rows.join('\n') + '\n',
  };
}

// 박자 1개 = 1행. 손가락 10개 열은 그 박자에 눌러야 하면 1, 아니면 0.
export function beatsCsv(score, beatTimes, discarded, bpm, latencyMs) {
  const header = ['beat', 't', 'discarded', 'bpm', 'latency_ms', ...KEYS.map((k) => k.replace('-', '_'))];
  const lines = beatTimes.map((t, i) => [i, t.toFixed(1), discarded.has(i) ? 1 : 0, bpm, latencyMs.toFixed(1),
    ...KEYS.map((k) => (score[i].includes(k) ? 1 : 0))].join(','));
  return header.join(',') + '\n' + lines.join('\n') + '\n';
}

export function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
