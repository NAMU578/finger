// MediaPipe Hand Landmarker로 손 관절 21개와 왼손/오른손을 얻는다.
import { HandLandmarker, FilesetResolver } from
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/vision_bundle.mjs';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export async function createTracker() {
  const fileset = await FilesetResolver.forVisionTasks(WASM);
  const make = (delegate) => HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL, delegate },
    runningMode: 'VIDEO',
    numHands: 2,
  });
  try {
    return { landmarker: await make('GPU'), delegate: 'GPU' };
  } catch {
    return { landmarker: await make('CPU'), delegate: 'CPU' }; // GPU 미지원 기기 대비
  }
}

// MediaPipe의 Left/Right는 "좌우 반전된(셀카) 영상"을 가정한다.
// 우리는 반전하지 않은 원본 프레임을 넣으므로 기본적으로 반대로 뒤집는다. swap은 화면에서 실제로 확인한 뒤 쓰는 수동 보정.
export function resolveSide(label, swap) {
  const side = label === 'Left' ? 'right' : 'left';
  return swap ? (side === 'left' ? 'right' : 'left') : side;
}

// 한 프레임 처리 → [{ side, score, landmarks }]
export function detectHands(landmarker, video, timeMs, swap) {
  const r = landmarker.detectForVideo(video, timeMs);
  return r.landmarks.map((landmarks, i) => ({
    side: resolveSide(r.handedness[i][0].categoryName, swap),
    score: r.handedness[i][0].score,
    landmarks, // 정규화 좌표 x, y (0~1), z(손목 기준 상대 깊이)
  }));
}
