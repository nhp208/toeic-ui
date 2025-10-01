import React from 'react';
import styles from '../Vocabulary.module.scss';

const Tabs = ({ activeTab, onChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'flashcard' ? styles.active : ''}`}
        onClick={() => onChange('flashcard')}
      >
        <span className={styles.tabIcon}>🃏</span>
        Flashcard
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'fillblank' ? styles.active : ''}`}
        onClick={() => onChange('fillblank')}
      >
        <span className={styles.tabIcon}>✏️</span>
        Điền Khuyết
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
        onClick={() => onChange('list')}
      >
        <span className={styles.tabIcon}>📚</span>
        Danh Sách
      </button>
    </div>
  );
};

export default Tabs;
