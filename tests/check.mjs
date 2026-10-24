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
