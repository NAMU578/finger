// 캔버스에 손 뼈대, 손 이름, 손끝 음 이름을 그린다. 화면은 거울처럼 좌우 반전해서 보여준다.
import { FINGERS, TIP, NOTES, noteName } from './fingers.js';

// 손바닥 + 손가락 마디 연결
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11],
  [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
const COLOR = { left: '#2f6fdd', right: '#d9502f' };

// targets: 강조할 손가락 키 목록 (예: ['left-index', 'right-ring'])
export function drawHands(ctx, hands, targets = []) {
  const { width: w, height: h } = ctx.canvas;
  const px = (p) => [(1 - p.x) * w, p.y * h]; // 거울 반전
  ctx.clearRect(0, 0, w, h);
  ctx.font = '13px sans-serif';

  for (const { side, score, landmarks: lm } of hands) {
    ctx.strokeStyle = ctx.fillStyle = COLOR[side];
    ctx.lineWidth = 2;
    for (const [a, b] of BONES) {
      ctx.beginPath();
      ctx.moveTo(...px(lm[a]));
      ctx.lineTo(...px(lm[b]));
      ctx.stroke();
    }
    for (const f of FINGERS) {
      const [x, y] = px(lm[TIP[f]]);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(noteName(NOTES[side][f]), x + 6, y - 6);
      if (targets.includes(`${side}-${f}`)) {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 2;
      }
    }
    const [wx, wy] = px(lm[0]);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${side === 'left' ? '왼손' : '오른손'} ${(score * 100).toFixed(0)}%`, wx - 40, wy + 24);
    ctx.font = '13px sans-serif';
  }
}
