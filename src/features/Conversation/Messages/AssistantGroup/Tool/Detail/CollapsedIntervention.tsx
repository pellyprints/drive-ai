import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowDown } from 'lucide-react';
import { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;
    border-radius: 6px;

    font-size: 12px;
    color: ${token.colorTextSecondary};

    transition: background 0.2s;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  pending: css`
    color: ${token.colorWarning};
  `,
}));

interface CollapsedInterventionProps {
  apiName: string;
}

const CollapsedIntervention = memo<CollapsedInterventionProps>(({ apiName }) => {
  const { styles } = useStyles();

  const handleClick = () => {
    const interventionBar = document.querySelector('[data-intervention-bar]');
    interventionBar?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  return (
    <Flexbox horizontal align="center" className={styles.container} gap={6} onClick={handleClick}>
      <span>🔧</span>
      <span>{apiName}</span>
      <span>—</span>
      <span className={styles.pending}>pending</span>
      <Flexbox style={{ marginLeft: 'auto' }}>
        <ArrowDown size={12} />
      </Flexbox>
    </Flexbox>
  );
});

export default CollapsedIntervention;
