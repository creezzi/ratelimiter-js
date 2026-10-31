import { test } from "node:test";
import assert from "node:assert/strict";
import { TokenBucket, SlidingWindow } from "../src/index.js";

const clock = () => {
  const c = { t: 0, now: () => c.t };
  return c;
};

test("bucket allows a burst then blocks", () => {
  const c = clock();
  const b = new TokenBucket({ rate: 1, capacity: 3, now: c.now });
  assert.deepEqual([1, 2, 3, 4].map(() => b.take()), [true, true, true, false]);
});

test("bucket refills over time but never beyond capacity", () => {
  const c = clock();
  const b = new TokenBucket({ rate: 2, capacity: 4, now: c.now });
  b.take(4);
  c.t = 1000;
  assert.equal(b.take(), true);
  assert.equal(b.take(), true);
  assert.equal(b.take(), false);
  c.t = 100_000;
  let n = 0;
  while (b.take()) n++;
  assert.equal(n, 4);
});

test("waitTime", () => {
  const c = clock();
  const b = new TokenBucket({ rate: 2, capacity: 2, now: c.now });
  b.take(2);
  assert.equal(b.waitTime(1), 500);
  c.t = 500;
  assert.equal(b.waitTime(1), 0);
});

test("a cost larger than capacity never succeeds", () => {
  const b = new TokenBucket({ rate: 1, capacity: 2, now: clock().now });
  assert.equal(b.take(3), false);
});

test("sliding window", () => {
  const c = clock();
  const w = new SlidingWindow({ limit: 2, windowMs: 10, now: c.now });
  assert.deepEqual([w.take(), w.take(), w.take()], [true, true, false]);
  c.t = 10;
  assert.equal(w.take(), true);
});

test("validation", () => {
  assert.throws(() => new TokenBucket({ rate: 0, capacity: 1 }), RangeError);
  assert.throws(() => new SlidingWindow({ limit: 0, windowMs: 1 }), RangeError);
});
