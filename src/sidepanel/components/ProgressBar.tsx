import React from 'react';
import type { PercentageDisplay } from '../../shared/types';
import { clampPercent, formatUsagePercent, getUsageTone } from '../../shared/utils';

interface ProgressBarProps {
  percentage: number;
  label: string;
  percentageDisplay?: PercentageDisplay;
  /** Even-pace target (0–100), drawn as a tick on the meter. */
  target?: number | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  percentageDisplay = 'used',
  target = null,
}) => {
  const value = clampPercent(percentage);
  const tone = getUsageTone(value);
  const hasTarget = typeof target === 'number';
  const overPace = hasTarget && value > target;

  return (
    <div className="au-progress">
      <div className="au-progress__row">
        <span className="au-progress__label">{label}</span>
        <span className="au-progress__value">{formatUsagePercent(value, percentageDisplay)}</span>
      </div>
      <div className="au-meter-wrap">
        <div
          className={`au-meter au-meter--${tone}`}
          role="progressbar"
          aria-label={label}
          aria-valuenow={value}
          aria-valuetext={formatUsagePercent(value, percentageDisplay)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="au-meter__fill" style={{ width: `${value}%` }} />
        </div>
        {hasTarget && (
          <div
            className={`au-meter__pace ${overPace ? 'au-meter__pace--over' : ''}`}
            style={{ left: `${clampPercent(target)}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
