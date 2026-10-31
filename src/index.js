/** Continuously refilling bucket. `rate` is tokens per second. */
export class TokenBucket {
  #tokens;
  #last;

  constructor({ rate, capacity, now = () => performance.now() }) {
    if (!(rate > 0) || !(capacity > 0)) throw new RangeError("rate and capacity must be positive");
    this.rate = rate;
    this.capacity = capacity;
    this.now = now;
    this.#tokens = capacity;
    this.#last = now();
  }

  #refill() {
    const t = this.now();
    const elapsed = Math.max(0, t - this.#last) / 1000;
    this.#tokens = Math.min(this.capacity, this.#tokens + elapsed * this.rate);
    this.#last = t;
  }

  /** Try to consume `cost` tokens. */
  take(cost = 1) {
    this.#refill();
    if (cost > this.#tokens) return false;
    this.#tokens -= cost;
    return true;
  }

  /** Milliseconds until `cost` tokens are available (0 if available now). */
  waitTime(cost = 1) {
    this.#refill();
    const missing = cost - this.#tokens;
    return missing <= 0 ? 0 : Math.ceil((missing / this.rate) * 1000);
  }
}

/** At most `limit` events in any trailing window of `windowMs`. */
export class SlidingWindow {
  #events = [];

  constructor({ limit, windowMs, now = () => performance.now() }) {
    if (!(limit >= 1) || !(windowMs > 0)) throw new RangeError("limit and windowMs must be positive");
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  take() {
    const t = this.now();
    while (this.#events.length && this.#events[0] <= t - this.windowMs) this.#events.shift();
    if (this.#events.length >= this.limit) return false;
    this.#events.push(t);
    return true;
  }
}
