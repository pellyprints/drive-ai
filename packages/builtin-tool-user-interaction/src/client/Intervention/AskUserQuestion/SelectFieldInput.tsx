'use client';

import { Flexbox, Input } from '@lobehub/ui';
import { Select } from '@lobehub/ui/base-ui';
import type { InputRef } from 'antd';
import { memo, useCallback, useRef, useState } from 'react';
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
    const otherInputRef = useRef<InputRef>(null);
    const isMulti = field.kind === 'multiselect';
    const options = field.options ?? [];

    const [otherActive, setOtherActive] = useState(() => otherValue.trim().length > 0);

    const handleSelectChange = useCallback(
      (v: string | string[]) => {
        onChange(field.key, v);
        if (!isMulti) {
          // Single select: choosing from Select clears Other
          onOtherChange(getOtherKey(field.key), '');
          setOtherActive(false);
        }
      },
      [field.key, isMulti, onChange, onOtherChange],
    );

    const handleOtherToggle = useCallback(() => {
      if (otherActive) {
        // Deactivate Other
        onOtherChange(getOtherKey(field.key), '');
        setOtherActive(false);
      } else {
        // Activate Other, clear Select for single select
        setOtherActive(true);
        if (!isMulti) {
          onChange(field.key, '');
        }
        // Focus input after render
        setTimeout(() => otherInputRef.current?.focus(), 0);
      }
    }, [field.key, isMulti, onChange, onOtherChange, otherActive]);

    const handleOtherTextChange = useCallback(
      (text: string) => {
        onOtherChange(getOtherKey(field.key), text);
        if (!isMulti && text.trim().length > 0) {
          // Single select: typing in Other clears Select
          onChange(field.key, '');
        }
      },
      [field.key, isMulti, onChange, onOtherChange],
    );

    const isOtherChecked = otherActive || otherValue.trim().length > 0;

    return (
      <Flexbox gap={8}>
        {/* antd Select dropdown */}
        {isMulti ? (
          <Select
            mode="multiple"
            options={options.map((o) => ({ label: o.label, value: o.value }))}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            value={value as string[]}
            onChange={(v) => handleSelectChange(v as string[])}
          />
        ) : (
          <Select
            allowClear
            options={options.map((o) => ({ label: o.label, value: o.value }))}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            value={otherActive ? undefined : (value as string) || undefined}
            onChange={(v) => handleSelectChange(v as string)}
          />
        )}

        {/* Other toggle row */}
        <div
          aria-checked={isOtherChecked}
          className={cx(styles.option, isOtherChecked && styles.optionSelected)}
          role="checkbox"
          tabIndex={0}
          onClick={handleOtherToggle}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleOtherToggle();
            }
          }}
        >
          <div
            className={cx(
              styles.indicator,
              styles.indicatorCheckbox,
              isOtherChecked && styles.indicatorCheckboxSelected,
            )}
          />
          <span className={styles.label} style={{ flex: '0 0 auto' }}>
            {t('form.other')}
          </span>
        </div>

        {/* Other input (shown when active) */}
        {isOtherChecked && (
          <Input
            placeholder="..."
            ref={otherInputRef}
            value={otherValue}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            onPressEnter={() => onPressEnter?.()}
          />
        )}
      </Flexbox>
    );
  },
);

SelectFieldInput.displayName = 'SelectFieldInput';

export default SelectFieldInput;
