import React from 'react';
import { msg } from '../../shared/i18n';
import type { PercentageDisplay, UsageLimit } from '../../shared/types';
import { formatReset, formatUsagePace, getUsagePace } from '../../shared/utils';
import { ProgressBar } from './ProgressBar';

interface UsageMetricProps {
  label: string;
  limit: UsageLimit;
  now: number;
  showReset?: boolean;
  percentageDisplay?: PercentageDisplay;
}

/** A labelled progress bar plus its "used / limit · resets" caption and even-pace target. */
export const UsageMetric: React.FC<UsageMetricProps> = ({
  label,
  limit,
  now,
  showReset = true,
  percentageDisplay = 'used',
}) => {
  const count =
    limit.countLabel ??
    (typeof limit.used === 'number' && typeof limit.limit === 'number' && limit.limit > 0
      ? `${limit.used} / ${limit.limit}`
      : null);
  const pace = getUsagePace(limit, now);

  return (
    <div className="au-metric">
      <ProgressBar
        label={label}
        percentage={limit.percentage}
        percentageDisplay={percentageDisplay}
        target={pace?.target ?? null}
      />
      {(count !== null || showReset) && (
        <p className="au-meta">
          {count !== null && (
            <>
              <span>{count}</span>
              {showReset && ' · '}
            </>
          )}
          {showReset && msg('resetsLabel', formatReset(limit.resetsAt, now))}
        </p>
      )}
      {pace && (
        <p className={`au-meta au-pace ${pace.delta > 0 ? 'au-pace--over' : ''}`}>
          {formatUsagePace(pace, percentageDisplay)}
        </p>
      )}
    </div>
  );
};
