// 1단계: 악보를 제시하고, 박자에 맞춰 누르는 동안 관절 좌표를 기록한다.
import { startCamera, onFrames } from './camera.js';
import { createTracker, detectHands } from './handTracker.js';
import { drawHands } from './overlay.js';
import { PATTERNS, makeScore, makeBlockScore, nextChange, describe } from './score.js';
import { startMetronome, stopMetronome } from './metronome.js';
import { createRecorder, beatsCsv, download } from './recorder.js';

const $ = (id) => document.getElementById(id);
const canvas = $('overlay');
const ctx = canvas.getContext('2d');
const COUNT_IN = 4;
const TAIL_MS = 1000; // 마지막 박자 뒤 추가 기록 시간

let session = null; // { score, beatTimes, latencyMs, bpm, discarded, recorder, stamp }
let files = null;   // 끝난 세션의 CSV

// 패턴 체크박스 만들기
for (const [key, { label }] of Object.entries(PATTERNS)) {
  $('patterns').insertAdjacentHTML('beforeend',
    `<label><input type="checkbox" name="pattern" value="${key}" checked> ${label}</label><br>`);
}

const passedBeats = (now) => session.beatTimes.filter((t) => t <= now).length;

function finish(now) {
  stopMetronome();
  const n = passedBeats(now); // 중간에 멈추면 지나간 박자까지만 저장
  const { score, beatTimes, discarded, bpm, latencyMs, recorder, stamp, mode } = session;
  files = {
    [`session_${stamp}_${mode}_frames.csv`]: recorder.csv(),
    [`session_${stamp}_${mode}_beats.csv`]: beatsCsv(score, beatTimes.slice(0, n), discarded, bpm, latencyMs),
  };
  $('result').textContent = `기록 완료: 박자 ${n}개 (폐기 ${discarded.size}개), 프레임 ${recorder.count()}개`;
  session = null;
  $('start').disabled = false;
  $('stop').disabled = true;
  $('save').disabled = false;
}

function updateDisplay(now) {
  if (!session) return [];
  const i = passedBeats(now);
  $('now').textContent = i < session.score.length ? describe(session.score[i]) : '끝';
  const j = i < session.score.length ? nextChange(session.score, i) : -1;
  $('next').textContent = j < 0 ? '' : `그다음 바뀜: ${describe(session.score[j])} (${j - i}박 뒤)`;
  $('progress').textContent = `${i} / ${session.score.length}박, 폐기 ${session.discarded.size}`;
  return session.score[i] ?? [];
}

$('start').onclick = async () => {
  const mode = document.querySelector('input[name=mode]:checked').value;
  const bpm = Number($('bpm').value);
  let score;
  if (mode === 'block') {
    const rounds = Number($('rounds').value);
    const blockLen = Number($('blockLen').value);
    if (!(bpm > 0) || !(rounds > 0) || !(blockLen > 0)) return alert('BPM, 라운드 수, 블록 길이를 확인하세요.');
    score = makeBlockScore(rounds, blockLen);
  } else {
    const types = [...document.querySelectorAll('input[name=pattern]:checked')].map((c) => c.value);
    const nBeats = Number($('beats').value);
    if (!types.length || !(bpm > 0) || !(nBeats > 0)) return alert('패턴, BPM, 박자 수를 확인하세요.');
    score = makeScore(nBeats, types);
  }
  const { beatTimes, latencyMs } = await startMetronome(bpm, score.length, COUNT_IN);
  session = { score, beatTimes, latencyMs, bpm, mode, discarded: new Set(), recorder: createRecorder(),
    stamp: new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '') };
  files = null;
  $('start').disabled = true;
  $('stop').disabled = false;
  $('save').disabled = true;
  $('result').textContent = '';
};

$('stop').onclick = () => session && finish(performance.now());
$('save').onclick = () => files && Object.entries(files).forEach(([name, text]) => download(name, text));

// 스페이스바: 지금과 가장 가까운 박자를 폐기 (잘못 눌렀을 때)
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || !session) return;
  e.preventDefault();
  const now = performance.now();
  const dist = session.beatTimes.map((t) => Math.abs(t - now));
  session.discarded.add(dist.indexOf(Math.min(...dist)));
});

async function main() {
  $('status').textContent = '카메라 켜는 중…';
  const cam = await startCamera($('video'));
  canvas.width = cam.width;
  canvas.height = cam.height;
  $('status').textContent = '손 인식 모델 불러오는 중…';
  const { landmarker } = await createTracker();
  $('status').textContent = '준비 완료';
  $('start').disabled = false;

  onFrames($('video'), (captureTime) => {
    const now = performance.now();
    const hands = detectHands(landmarker, $('video'), now, $('swap').checked);
    if (session) session.recorder.addFrame(captureTime, hands);
    drawHands(ctx, hands, updateDisplay(now));
    if (session && now > session.beatTimes.at(-1) + TAIL_MS) finish(now);
  });
}

main().catch((e) => {
  $('status').textContent = '오류: ' + e.message;
  console.error(e);
});
