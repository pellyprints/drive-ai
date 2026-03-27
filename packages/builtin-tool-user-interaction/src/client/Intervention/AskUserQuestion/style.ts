import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
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
  indicatorCheckbox: css`
    border-radius: ${token.borderRadiusSM}px;
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
  label: css`
    user-select: none;
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
  `,
}));
