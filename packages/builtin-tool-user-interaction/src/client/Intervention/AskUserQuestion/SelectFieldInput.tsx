'use client';

import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { InteractionField } from '../../../types';
import { useStyles } from './style';

const OTHER_KEY_PREFIX = '__other_';
const OTHER_KEY_SUFFIX = '__';
export const getOtherKey = (fieldKey: string) =>
  `${OTHER_KEY_PREFIX}${fieldKey}${OTHER_KEY_SUFFIX}`;

interface SelectFieldInputProps {
  field: InteractionField;
  onChange: (key: string, value: string | string[]) => void;
  onOtherChange: (key: string, value: string) => void;
  onPressEnter?: () => void;
  otherValue: string;
  value?: string | string[];
}

const SelectFieldInput = memo<SelectFieldInputProps>(
  ({ field, value, otherValue, onChange, onOtherChange, onPressEnter }) => {
    const { t } = useTranslation('ui');
    const { cx, styles } = useStyles();
    const otherInputRef = useRef<HTMLInputElement>(null);
    const isMulti = field.kind === 'multiselect';
    const options = field.options ?? [];

    const selectedValues: string[] = isMulti
      ? Array.isArray(value)
        ? (value as string[])
        : []
      : value
        ? [value as string]
        : [];

    const isOtherSelected = isMulti
      ? otherValue.trim().length > 0
      : selectedValues.length === 0 && otherValue.trim().length > 0;

    const handlePresetClick = useCallback(
      (optionValue: string) => {
        if (isMulti) {
          const current = Array.isArray(value) ? (value as string[]) : [];
          const next = current.includes(optionValue)
            ? current.filter((v) => v !== optionValue)
            : [...current, optionValue];
          onChange(field.key, next);
        } else {
          // Single select: select preset, clear Other
          onChange(field.key, optionValue);
          onOtherChange(getOtherKey(field.key), '');
        }
      },
      [field.key, isMulti, onChange, onOtherChange, value],
    );

    const handleOtherTextChange = useCallback(
      (text: string) => {
        onOtherChange(getOtherKey(field.key), text);
        if (!isMulti) {
          // Single select: typing in Other clears preset
          onChange(field.key, '');
        }
      },
      [field.key, isMulti, onChange, onOtherChange],
    );

    const handleOtherRowClick = useCallback(() => {
      otherInputRef.current?.focus();
    }, []);

    const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

    const role = isMulti ? 'group' : 'radiogroup';
    const itemRole = isMulti ? 'checkbox' : 'radio';

    return (
      <div aria-label={field.label} className={styles.group} role={role}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <div
              aria-checked={selected}
              className={cx(styles.option, selected && styles.optionSelected)}
              key={option.value}
              role={itemRole}
              tabIndex={0}
              onClick={() => handlePresetClick(option.value)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handlePresetClick(option.value);
                }
              }}
            >
              <div
                className={cx(
                  styles.indicator,
                  isMulti ? styles.indicatorCheckbox : styles.indicatorRadio,
                  selected &&
                    (isMulti ? styles.indicatorCheckboxSelected : styles.indicatorSelected),
                )}
              />
              <span className={styles.label}>{option.label}</span>
            </div>
          );
        })}

        {/* Other row */}
        <div
          aria-checked={isOtherSelected}
          className={cx(styles.option, isOtherSelected && styles.optionSelected)}
          role={itemRole}
          tabIndex={0}
          onClick={handleOtherRowClick}
        >
          <div
            className={cx(
              styles.indicator,
              isMulti ? styles.indicatorCheckbox : styles.indicatorRadio,
              isOtherSelected &&
                (isMulti ? styles.indicatorCheckboxSelected : styles.indicatorSelected),
            )}
          />
          <span className={styles.label} style={{ flexShrink: 1, minWidth: 'fit-content' }}>
            {t('form.other')}
          </span>
          <input
            aria-label={t('form.other')}
            className={styles.otherInput}
            placeholder={field.placeholder || '...'}
            ref={otherInputRef}
            value={otherValue}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onPressEnter?.();
              }
            }}
          />
        </div>
      </div>
    );
  },
);

SelectFieldInput.displayName = 'SelectFieldInput';

export default SelectFieldInput;
