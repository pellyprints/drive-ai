import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  group: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  option: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    cursor: pointer;
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
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimary};
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: inherit;
      background: ${token.colorWhite};
    }
  `,
  indicatorCheckboxSelected: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimary};
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 5px;
      width: 4px;
      height: 7px;
      border: solid ${token.colorWhite};
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `,
  otherInput: css`
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    padding: 0;
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    min-width: 0;

    &::placeholder {
      color: ${token.colorTextQuaternary};
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  `,
  label: css`
    flex: 1;
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    user-select: none;
  `,
}));
