import { memo, useCallback, useEffect, useState } from 'react';

import { type PendingIntervention } from '../store/slices/data/pendingInterventions';
import InterventionContent from './InterventionContent';
import InterventionTabBar from './InterventionTabBar';
import { useStyles } from './style';

interface InterventionBarProps {
  interventions: PendingIntervention[];
}

const InterventionBar = memo<InterventionBarProps>(({ interventions }) => {
  const { styles } = useStyles();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance: when the active intervention is resolved (removed from list),
  // clamp activeIndex to valid range
  useEffect(() => {
    if (activeIndex >= interventions.length) {
      setActiveIndex(Math.max(0, interventions.length - 1));
    }
  }, [interventions.length, activeIndex]);

  const handleTabChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const activeIntervention = interventions[activeIndex];
  if (!activeIntervention) return null;

  return (
    <div className={styles.container}>
      {interventions.length > 1 && (
        <InterventionTabBar
          activeIndex={activeIndex}
          interventions={interventions}
          onTabChange={handleTabChange}
        />
      )}
      <InterventionContent intervention={activeIntervention} key={activeIntervention.toolCallId} />
    </div>
  );
});

export default InterventionBar;
