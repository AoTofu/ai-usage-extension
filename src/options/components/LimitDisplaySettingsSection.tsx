import { msg } from '../../shared/i18n';
import type { PercentageDisplay } from '../../shared/types';
import { formatUsagePercent } from '../../shared/utils';
import { SettingsSection } from './SettingsSection';

interface LimitDisplaySettingsSectionProps {
  percentageDisplay: PercentageDisplay;
  onPercentageDisplayChange: (display: PercentageDisplay) => void;
}

export const LimitDisplaySettingsSection = ({
  percentageDisplay,
  onPercentageDisplayChange,
}: LimitDisplaySettingsSectionProps) => (
  <SettingsSection id="limits">
    <div className="auo-select-grid">
      <label className="auo-field">
        <span className="auo-field__label">{msg('optionsPercentageTitle')}</span>
        <select
          value={percentageDisplay}
          onChange={(event) => onPercentageDisplayChange(event.target.value as PercentageDisplay)}
        >
          <option value="used">
            {msg('optionsPercentageUsed')} — {formatUsagePercent(13, 'used')}
          </option>
          <option value="remaining">
            {msg('optionsPercentageRemaining')} — {formatUsagePercent(13, 'remaining')}
          </option>
        </select>
      </label>
    </div>
  </SettingsSection>
);
