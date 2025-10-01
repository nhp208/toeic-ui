import React from 'react';
import styles from '../Vocabulary.module.scss';

const BandProgress = ({ band, stats }) => {
  if (!band) return null;
  const total = stats?.total || 0;
  const learned = stats?.learned || 0;
  const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div className={styles.bandProgress}>
      <div className={styles.bandProgressHeader}>
        <span>Tiến độ band {band}</span>
        <span>{learned}/{total} ({percent}%)</span>
      </div>
      <div className={styles.bandProgressBarWrap}>
        <div className={styles.bandProgressBar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default BandProgress;
