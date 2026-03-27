'use client';

import type { BuiltinInterventionProps } from '@lobechat/types';
import { Button, Flexbox, Input, Text, TextArea } from '@lobehub/ui';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AskUserQuestionArgs, InteractionField } from '../../../types';
import SelectFieldInput, { getOtherKey } from './SelectFieldInput';

const FieldInput = memo<{
  field: InteractionField;
  formData: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
  onPressEnter?: () => void;
}>(({ field, formData, onChange, onPressEnter }) => {
  switch (field.kind) {
    case 'textarea': {
      return (
        <TextArea
          autoSize={{ maxRows: 6, minRows: 2 }}
          placeholder={field.placeholder}
          value={formData[field.key] as string}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    }
    case 'select':
    case 'multiselect': {
      return (
        <SelectFieldInput
          field={field}
          otherValue={(formData[getOtherKey(field.key)] as string) ?? ''}
          value={formData[field.key]}
          onChange={onChange}
          onOtherChange={onChange}
          onPressEnter={onPressEnter}
        />
      );
    }
    default: {
      return (
        <Input
          placeholder={field.placeholder}
          value={formData[field.key] as string}
          onChange={(e) => onChange(field.key, e.target.value)}
          onPressEnter={onPressEnter}
        />
      );
    }
  }
});

/** Check if a select/multiselect field has a valid value (preset or other) */
const isSelectFieldFilled = (
  field: InteractionField,
  formData: Record<string, string | string[]>,
): boolean => {
  const presetValue = formData[field.key];
  const otherValue = (formData[getOtherKey(field.key)] as string) ?? '';

  if (field.kind === 'multiselect') {
    const hasPresets = Array.isArray(presetValue) && presetValue.length > 0;
    const hasOther = otherValue.trim().length > 0;
    return hasPresets || hasOther;
  }
  // select
  const hasPreset = typeof presetValue === 'string' && presetValue.length > 0;
  const hasOther = otherValue.trim().length > 0;
  return hasPreset || hasOther;
};

const AskUserQuestionIntervention = memo<BuiltinInterventionProps<AskUserQuestionArgs>>(
  ({ args, interactionMode, onInteractionAction }) => {
    const { t } = useTranslation('ui');
    const { question } = args;
    const isCustom = interactionMode === 'custom';

    const initialValues = useMemo(() => {
      const values: Record<string, string | string[]> = {};
      if (!question.fields) return values;

      for (const field of question.fields) {
        if (field.value === undefined) continue;

        if ((field.kind === 'select' || field.kind === 'multiselect') && field.options?.length) {
          const optionValues = new Set(field.options.map((o) => o.value));

          if (field.kind === 'multiselect' && Array.isArray(field.value)) {
            const presets = field.value.filter((v) => optionValues.has(v));
            const others = field.value.filter((v) => !optionValues.has(v));
            if (presets.length > 0) values[field.key] = presets;
            if (others.length > 0) values[getOtherKey(field.key)] = others.join(', ');
          } else if (field.kind === 'select' && typeof field.value === 'string') {
            if (optionValues.has(field.value)) {
              values[field.key] = field.value;
            } else {
              values[getOtherKey(field.key)] = field.value;
            }
          }
        } else {
          values[field.key] = field.value;
        }
      }
      return values;
    }, [question.fields]);

    const [formData, setFormData] = useState<Record<string, string | string[]>>(initialValues);
    const [submitting, setSubmitting] = useState(false);

    const handleFieldChange = useCallback((key: string, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleSubmit = useCallback(async () => {
      if (!onInteractionAction) return;
      setSubmitting(true);
      try {
        // Clean up empty values before submitting
        const payload: Record<string, string | string[]> = {};
        for (const [key, val] of Object.entries(formData)) {
          if (Array.isArray(val) && val.length === 0) continue;
          if (typeof val === 'string' && val.trim().length === 0) continue;
          payload[key] = val;
        }
        await onInteractionAction({ payload, type: 'submit' });
      } finally {
        setSubmitting(false);
      }
    }, [formData, onInteractionAction]);

    const handleSkip = useCallback(async () => {
      if (!onInteractionAction) return;
      await onInteractionAction({ type: 'skip' });
    }, [onInteractionAction]);

    const isFreeform = !question.fields || question.fields.length === 0;

    const isSubmitDisabled = isFreeform
      ? !(formData['__freeform__'] as string)?.trim()
      : (question.fields?.some((f) => {
          if (!f.required) return false;
          if (f.kind === 'select' || f.kind === 'multiselect') {
            return !isSelectFieldFilled(f, formData);
          }
          const val = formData[f.key];
          if (typeof val === 'string') return val.trim().length === 0;
          if (Array.isArray(val)) return val.length === 0;
          return !val;
        }) ?? false);

    if (!isCustom) {
      return (
        <Flexbox gap={8}>
          <Text>{question.prompt}</Text>
          {question.fields && question.fields.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {question.fields.map((field) => (
                <li key={field.key}>
                  {field.label}
                  {field.required && ' *'}
                </li>
              ))}
            </ul>
          )}
        </Flexbox>
      );
    }

    return (
      <Flexbox gap={12}>
        <Text style={{ fontWeight: 500 }}>{question.prompt}</Text>
        {question.description && (
          <Text style={{ fontSize: 13 }} type="secondary">
            {question.description}
          </Text>
        )}
        {isFreeform ? (
          <TextArea
            autoSize={{ maxRows: 6, minRows: 2 }}
            placeholder={question.description || ''}
            value={formData['__freeform__'] as string}
            onChange={(e) => handleFieldChange('__freeform__', e.target.value)}
          />
        ) : (
          question.fields &&
          question.fields.length > 0 && (
            <Flexbox gap={8}>
              {question.fields.map((field) => (
                <Flexbox gap={4} key={field.key}>
                  <Text style={{ fontSize: 13 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </Text>
                  <FieldInput
                    field={field}
                    formData={formData}
                    onChange={handleFieldChange}
                    onPressEnter={() => {
                      if (!isSubmitDisabled) handleSubmit();
                    }}
                  />
                </Flexbox>
              ))}
            </Flexbox>
          )
        )}
        <Flexbox horizontal gap={8} justify="flex-end">
          <Button onClick={handleSkip}>{t('form.skip')}</Button>
          <Button
            disabled={isSubmitDisabled}
            loading={submitting}
            type="primary"
            onClick={handleSubmit}
          >
            {t('form.submit')}
          </Button>
        </Flexbox>
      </Flexbox>
    );
  },
);

AskUserQuestionIntervention.displayName = 'AskUserQuestionIntervention';

export default AskUserQuestionIntervention;
