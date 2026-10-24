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
