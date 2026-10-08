import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.js';

const { getUsagePace, formatUsagePace } = loadTypeScript('src/shared/utils/index.ts');

const HOUR = 60 * 60 * 1000;
const now = Date.UTC(2026, 9, 8, 12, 0, 0);
const at = (ms) => new Date(now + ms).toISOString();

describe('getUsagePace', () => {
  it('targets the elapsed share of a 5-hour window', () => {
    // 2h left of 5h → 3h elapsed → 60% may be used by now.
    const pace = getUsagePace(
      { percentage: 48, resetsAt: at(2 * HOUR), windowSeconds: 5 * 3600 },
      now,
    );
    assert.deepEqual({ ...pace }, { target: 60, delta: -12 });
  });

  it('targets the elapsed share of a weekly window', () => {
    // 5 days left of 7 → 2/7 elapsed ≈ 29%.
    const pace = getUsagePace(
      { percentage: 40, resetsAt: at(5 * 24 * HOUR), windowSeconds: 7 * 24 * 3600 },
      now,
    );
    assert.deepEqual({ ...pace }, { target: 29, delta: 11 });
  });

  it('returns null without a window length, reset time, or for stale snapshots', () => {
    assert.equal(getUsagePace({ percentage: 10, resetsAt: at(HOUR) }, now), null);
    assert.equal(getUsagePace({ percentage: 10, resetsAt: null, windowSeconds: 18000 }, now), null);
    assert.equal(getUsagePace({ percentage: 10, resetsAt: at(-HOUR), windowSeconds: 18000 }, now), null);
    assert.equal(
      getUsagePace({ percentage: 0, resetsAt: at(HOUR), windowSeconds: 18000, available: false }, now),
      null,
    );
  });

  it('formats the caption for used and remaining display', () => {
    const under = { target: 60, delta: -12 };
    assert.equal(formatUsagePace(under, 'used'), 'pace 60% · 12% to spare');
    assert.equal(formatUsagePace(under, 'remaining'), 'pace 40% left · 12% to spare');
    assert.equal(formatUsagePace({ target: 29, delta: 11 }, 'used'), 'pace 29% · 11% over pace');
    assert.equal(formatUsagePace({ target: 50, delta: 0 }, 'used'), 'pace 50% · on pace');
  });
});
