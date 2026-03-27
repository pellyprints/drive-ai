import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  escapeLink: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 0;

    font-size: 13px;

    transition: color ${token.motionDurationMid};

    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
}));
