# ratelimiter

Token bucket and sliding window rate limiters with an injectable clock.

## Usage

```js
import { TokenBucket } from "ratelimiter";

const bucket = new TokenBucket({ rate: 5, capacity: 10 }); // 5/sec, burst of 10
if (bucket.take()) handle(request);
```

## Test

```bash
npm test
```

## License

MIT
