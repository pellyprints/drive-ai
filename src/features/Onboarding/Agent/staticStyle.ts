import { createStaticStyles, keyframes } from 'antd-style';

const completionSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const staticStyle = createStaticStyles(({ css, cssVar }) => ({
  completionEnter: css`
    animation: ${completionSlideUp} 0.5s ease-out both;
  `,
  composerZone: css`
    gap: 8px;
    margin-block-start: -8px;
  `,
  greetingAvatar: css`
    border-radius: 10px;
    box-shadow: 0 2px 12px ${cssVar.colorBgLayout};
  `,
  greetingDivider: css`
    width: 100%;
    margin-block: 4px;
  `,
  greetingText: css`
    font-size: 16px;
    line-height: 1.7;
    color: ${cssVar.colorText};
  `,
  greetingWrap: css`
    width: 100%;
    max-width: 640px;
  `,
  inlineQuestion: css`
    margin-block-start: 4px;
    padding-block-start: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
}));
