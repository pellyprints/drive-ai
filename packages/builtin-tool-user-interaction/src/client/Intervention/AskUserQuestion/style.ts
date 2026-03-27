import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  group: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  option: css`
    cursor: pointer;

    display: flex;
    gap: 10px;
    align-items: center;

    padding-block: 8px;
    padding-inline: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimaryBorderHover};
      background: ${token.colorFillQuaternary};
    }
  `,
  optionSelected: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    &:hover {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `,
  indicator: css`
    flex-shrink: 0;

    width: 16px;
    height: 16px;
    border: 2px solid ${token.colorBorderSecondary};

    transition: all ${token.motionDurationMid};
  `,
  indicatorRadio: css`
    border-radius: 50%;
  `,
  indicatorCheckbox: css`
    border-radius: ${token.borderRadiusSM}px;
  `,
  indicatorSelected: css`
    position: relative;
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimary};

    &::after {
      content: '';

      position: absolute;
      inset: 2px;

      border-radius: inherit;

      background: ${token.colorWhite};
    }
  `,
  indicatorCheckboxSelected: css`
    position: relative;
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimary};

    &::after {
      content: '';

      position: absolute;
      inset-block-start: 2px;
      inset-inline-start: 5px;
      transform: rotate(45deg);

      width: 4px;
      height: 7px;
      border: solid ${token.colorWhite};
      border-width: 0 2px 2px 0;
    }
  `,
  otherInput: css`
    flex: 1;

    min-width: 0;
    padding: 0;
    border: none;

    font-size: ${token.fontSize}px;
    color: ${token.colorText};

    background: transparent;
    outline: none;

    &::placeholder {
      color: ${token.colorTextQuaternary};
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  `,
  label: css`
    user-select: none;
    flex: 1;
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
  `,
}));
