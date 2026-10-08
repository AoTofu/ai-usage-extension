import { USAGE_THRESHOLDS } from '../constants';
import { msg } from '../i18n';
import type { PercentageDisplay, UsageLimit, UsageStatus } from '../types';

/** @deprecated kept as an alias — prefer `UsageStatus` from shared/types. */
export type UsageTone = UsageStatus;

/** Round a number into the inclusive 0–100 range. */
export const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

/** Display preference never changes the stored usage or progress-bar value. */
export const formatUsagePercent = (value: number, display: PercentageDisplay): string => {
  const used = clampPercent(value);
  return display === 'remaining' ? msg('percentageRemaining', String(100 - used)) : `${used}%`;
};

export const badgeIconPath = (range: number, display: PercentageDisplay = 'used'): string =>
  `icons/badges/${display === 'remaining' ? 'remaining' : 'range'}-${range}.png`;

export const isLimitAvailable = (limit: UsageLimit | undefined): boolean =>
  Boolean(limit) && limit?.available !== false;

/** Map a usage percentage to its severity tone. */
export const getUsageTone = (value: number): UsageStatus => {
  const percent = clampPercent(value);

  if (percent >= USAGE_THRESHOLDS.critical) {
    return 'critical';
  }

  if (percent >= USAGE_THRESHOLDS.warning) {
    return 'warning';
  }

  return 'ok';
};

/**
 * Human-readable countdown to a reset timestamp.
 * Returns e.g. `2h 13m`, `45m`, `now`, or `unknown`.
 */
export const formatReset = (resetAt: string | null, now: number): string => {
  if (!resetAt) {
    return msg('timeUnknown');
  }

  const diff = new Date(resetAt).getTime() - now;
  if (!Number.isFinite(diff)) {
    return msg('timeUnknown');
  }

  if (diff <= 0) {
    return msg('timeNow');
  }

  const totalMinutes = Math.floor(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}${msg('timeDayShort')} ${hours % 24}${msg('timeHourShort')}`;
  }

  if (hours > 0) {
    return `${hours}${msg('timeHourShort')} ${minutes}${msg('timeMinuteShort')}`;
  }

  return `${minutes}${msg('timeMinuteShort')}`;
};

/**
 * Human-readable "time since" label for a past timestamp.
 * Returns e.g. `just now`, `5m ago`, `3h ago`.
 */
export const formatRelativeTime = (timestamp: number, now: number): string => {
  const minutes = Math.floor(Math.max(0, now - timestamp) / 60_000);

  if (minutes < 1) {
    return msg('timeJustNow');
  }

  if (minutes < 60) {
    return msg('timeAgo', `${minutes}${msg('timeMinuteShort')}`);
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return msg('timeAgo', `${hours}${msg('timeHourShort')}`);
  }

  return msg('timeAgo', `${Math.floor(hours / 24)}${msg('timeDayShort')}`);
};

export interface UsagePace {
  /** Share of the window that has elapsed (0–100): the usage you can spend by now to hit 100% exactly at reset. */
  target: number;
  /** Current usage minus the target; positive means ahead of an even pace. */
  delta: number;
}

/**
 * Even-pace budget for a rolling window: if the limit is spent linearly so that it hits
 * 100% exactly at reset, how much of it may be used by `now`?
 * Returns `null` when the window length or reset time is unknown.
 */
export const getUsagePace = (limit: UsageLimit | undefined, now: number): UsagePace | null => {
  if (!limit || limit.available === false || !limit.resetsAt || !limit.windowSeconds) {
    return null;
  }

  const resetAt = new Date(limit.resetsAt).getTime();
  const windowMs = limit.windowSeconds * 1000;
  if (!Number.isFinite(resetAt) || windowMs <= 0) {
    return null;
  }

  const remainingMs = resetAt - now;
  // A reset already in the past or far beyond one window means the snapshot is stale.
  if (remainingMs <= 0 || remainingMs > windowMs * 1.5) {
    return null;
  }

  const elapsedShare = Math.max(0, Math.min(1, 1 - remainingMs / windowMs));
  const target = clampPercent(elapsedShare * 100);
  return { target, delta: clampPercent(limit.percentage) - target };
};

/** Caption such as `pace 42% · 12% to spare`, honouring the used/remaining preference. */
export const formatUsagePace = (pace: UsagePace, display: PercentageDisplay): string => {
  const target = msg('paceTargetLabel', formatUsagePercent(pace.target, display));
  if (pace.delta === 0) {
    return `${target} · ${msg('paceOnTrack')}`;
  }
  const amount = `${Math.abs(pace.delta)}%`;
  return `${target} · ${msg(pace.delta > 0 ? 'paceOver' : 'paceUnder', amount)}`;
};
