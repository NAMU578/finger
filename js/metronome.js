// 메트로놈. 오디오 시계로 클릭을 미리 예약해 박자 간격을 정확하게 맞춘다.
let ctx;
let scheduled = [];

function click(at, accent) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = accent ? 1500 : 1000;
  gain.gain.setValueAtTime(0.4, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.06);
  scheduled.push(osc);
}

// 예비 박(countIn) 뒤에 nBeats개 박자를 예약하고, 각 박자가 "귀에 들리는" 시각(performance.now 기준)을 돌려준다.
// 반드시 버튼 클릭 같은 사용자 동작 안에서 호출해야 소리가 난다.
export async function startMetronome(bpm, nBeats, countIn) {
  ctx ??= new AudioContext();
  await ctx.resume();
  const T = 60 / bpm;
  const lead = 0.3; // 예약 여유 시간(초)
  const a0 = ctx.currentTime;
  const p0 = performance.now();
  const latency = ctx.outputLatency || ctx.baseLatency || 0; // 스피커로 나가기까지의 지연
  const beatTimes = [];
  for (let i = 0; i < countIn + nBeats; i++) {
    click(a0 + lead + i * T, i < countIn);
    if (i >= countIn) beatTimes.push(p0 + (lead + i * T + latency) * 1000);
  }
  return { beatTimes, latencyMs: latency * 1000 };
}

export function stopMetronome() {
  scheduled.forEach((o) => { try { o.stop(); } catch {} });
  scheduled = [];
}
