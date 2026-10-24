// 손가락 번호, 손끝 관절 번호, 음 배정. 이후 단계(특징 계산, 소리 재생)도 이 파일을 공유한다.

export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];
export const FINGER_KO = { thumb: '엄지', index: '검지', middle: '중지', ring: '약지', pinky: '새끼' };

// MediaPipe 21개 관절 중 각 손가락 끝 번호
export const TIP = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };

// 왼손: 새끼 C3 → 엄지 G3, 오른손: 엄지 C4(가온도) → 새끼 G4
export const NOTES = {
  left:  { pinky: 48, ring: 50, middle: 52, index: 53, thumb: 55 },
  right: { thumb: 60, index: 62, middle: 64, ring: 65, pinky: 67 },
};

const NAMES = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시'];
export const noteName = (n) => NAMES[n % 12] + (Math.floor(n / 12) - 1);
export const noteFreq = (n) => 440 * 2 ** ((n - 69) / 12);
