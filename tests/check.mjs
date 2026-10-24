// 실행: node tests/check.mjs  (음 배정과 주파수 계산 확인)
import assert from 'node:assert';
import { NOTES, noteName, noteFreq } from '../js/fingers.js';

assert.equal(noteName(NOTES.right.thumb), '도4');
assert.equal(noteName(NOTES.left.pinky), '도3');
assert.equal(noteName(NOTES.left.thumb), '솔3');
assert.equal(noteName(NOTES.right.pinky), '솔4');
assert.ok(Math.abs(noteFreq(60) - 261.63) < 0.01);
assert.ok(Math.abs(noteFreq(69) - 440) < 1e-9);
console.log('ok');

// 블록 악보: 1라운드에 손가락 10개가 정확히 한 번씩, 블록 길이만큼 연속
import { makeBlockScore, nextChange, KEYS } from '../js/score.js';
const s = makeBlockScore(2, 4);
assert.equal(s.length, 80);
for (let r = 0; r < 2; r++) {
  const firsts = Array.from({ length: 10 }, (_, b) => s[r * 40 + b * 4][0]);
  assert.deepEqual([...firsts].sort(), [...KEYS].sort());
}
assert.equal(String(s[1]), String(s[0]));
assert.equal(nextChange(s, 0), 4);
assert.equal(nextChange(s, 79), -1);
console.log('block ok');
