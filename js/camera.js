// 웹캠을 켜서 <video>에 연결한다.
export async function startCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 카메라를 지원하지 않습니다. (HTTPS 주소인지 확인)');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  const s = stream.getVideoTracks()[0].getSettings();
  return { width: s.width ?? video.videoWidth, height: s.height ?? video.videoHeight, fps: s.frameRate };
}

// 새 프레임마다 cb(captureTime) 호출. captureTime은 카메라가 프레임을 찍은 시각(performance.now 기준).
export function onFrames(video, cb) {
  let lastTime = -1;
  const tick = (now, meta) => {
    if (video.currentTime !== lastTime) {
      lastTime = video.currentTime;
      cb(meta?.captureTime ?? performance.now());
    }
    video.requestVideoFrameCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
  };
  tick();
}
