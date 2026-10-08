import { Check } from 'lucide-react';
import { msg } from '../../shared/i18n';
import type { PopupLayout, ThemePreference } from '../../shared/types';
import { SettingsSection } from './SettingsSection';

interface DisplaySettingsSectionProps {
  popupLayout: PopupLayout;
  onPopupLayoutChange: (layout: PopupLayout) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'system', label: msg('optionsThemeSystem') },
  { value: 'light', label: msg('optionsThemeLight') },
  { value: 'dark', label: msg('optionsThemeDark') },
];

const LAYOUT_OPTIONS: Array<{
  value: PopupLayout;
  title: string;
  description: string;
}> = [
  {
    value: 'single',
    title: msg('optionsLayoutSingle'),
    description: msg('optionsLayoutSingleDescription'),
  },
  {
    value: 'grid',
    title: msg('optionsLayoutGrid'),
    description: msg('optionsLayoutGridDescription'),
  },
];

export const DisplaySettingsSection = ({
  popupLayout,
  onPopupLayoutChange,
  theme,
  onThemeChange,
}: DisplaySettingsSectionProps) => (
  <SettingsSection id="display">
    <div className="auo-choice-group" role="radiogroup" aria-label={msg('optionsLayoutTitle')}>
      {LAYOUT_OPTIONS.map(({ value, title, description }) => (
        <label
          className={`auo-choice ${popupLayout === value ? 'auo-choice--selected' : ''}`}
          key={value}
        >
          <input
            type="radio"
            name="popup-layout"
            value={value}
            checked={popupLayout === value}
            onChange={() => onPopupLayoutChange(value)}
          />
          <span className="auo-choice__text">
            <strong>
              {title}
              <span className="auo-choice__mark" aria-hidden="true">
                <Check size={11} strokeWidth={3} />
              </span>
            </strong>
            <small>{description}</small>
          </span>
        </label>
      ))}
    </div>
    <div className="auo-select-grid auo-theme-field">
      <label className="auo-field">
        <span className="auo-field__label">{msg('optionsThemeTitle')}</span>
        <select
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as ThemePreference)}
        >
          {THEME_OPTIONS.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  </SettingsSection>
);
