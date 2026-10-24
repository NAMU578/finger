// 0단계: 카메라 점검. 양손 검출률, 처리 속도, 왼손/오른손 판정을 확인한다.
import { startCamera, onFrames } from './camera.js';
import { createTracker, detectHands } from './handTracker.js';
import { drawHands } from './overlay.js';

const $ = (id) => document.getElementById(id);
const video = $('video');
const canvas = $('overlay');
const ctx = canvas.getContext('2d');

const WINDOW_MS = 3000; // 최근 3초 기준 통계
const TARGET_FPS = 20;
const TARGET_BOTH = 0.95;
const log = []; // { t, both, ms }

function updateStats(now) {
  while (log.length && now - log[0].t > WINDOW_MS) log.shift();
  if (log.length < 2) return;
  const fps = (log.length - 1) / ((log.at(-1).t - log[0].t) / 1000);
  const both = log.filter((r) => r.both).length / log.length;
  const ms = log.reduce((s, r) => s + r.ms, 0) / log.length;
  $('fps').textContent = fps.toFixed(1);
  $('both').textContent = (both * 100).toFixed(0) + '%';
  $('ms').textContent = ms.toFixed(1) + ' ms';
  $('fpsCheck').className = fps >= TARGET_FPS ? 'ok' : 'bad';
  $('bothCheck').className = both >= TARGET_BOTH ? 'ok' : 'bad';
}

async function main() {
  $('status').textContent = '카메라 켜는 중…';
  const cam = await startCamera(video);
  canvas.width = cam.width;
  canvas.height = cam.height;
  $('res').textContent = `${cam.width}×${cam.height}, 카메라 ${cam.fps ?? '?'}fps`;

  $('status').textContent = '손 인식 모델 불러오는 중…';
  const { landmarker, delegate } = await createTracker();
  $('delegate').textContent = delegate;
  $('status').textContent = '작동 중';

  onFrames(video, () => {
    const t0 = performance.now();
    const hands = detectHands(landmarker, video, t0, $('swap').checked);
    const t1 = performance.now();
    const sides = hands.map((h) => h.side);
    log.push({ t: t1, both: sides.includes('left') && sides.includes('right'), ms: t1 - t0 });
    drawHands(ctx, hands);
    updateStats(t1);
  });
}

main().catch((e) => {
  $('status').textContent = '오류: ' + e.message;
  console.error(e);
});
