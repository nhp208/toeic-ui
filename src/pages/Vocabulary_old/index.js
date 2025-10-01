import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import Flashcard from '../../components/Vocabulary/Flashcard';
import FillBlank from '../../components/Vocabulary/FillBlank';
import VocabularyList from '../../components/Vocabulary/VocabularyList';
import styles from './Vocabulary.module.scss';
import Filters from './components/Filters';
import BandProgress from './components/BandProgress';
import Tabs from './components/Tabs';

const Vocabulary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('flashcard');
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    band: '',
    status: ''
  });
  const [stats, setStats] = useState({ total: 0, learned: 0, notLearned: 0 });

  // Sync tab with URL on mount and when location changes
  useEffect(() => {
    if (location.pathname === '/vocabulary') {
      navigate('/vocabulary/flashcard', { replace: true });
      return;
    }
    if (location.pathname.startsWith('/vocabulary/')) {
      const mode = location.pathname.split('/')[2];
      if (mode === 'flashcard' || mode === 'fillblank' || mode === 'list') {
        setActiveTab(mode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    fetchVocabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchVocabData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (filters.status === 'review_due') {
        if (!filters.band) {
          setVocabularies([]);
          setStats({ total: 0, learned: 0, notLearned: 0 });
          return;
        }
        const params = new URLSearchParams();
        params.append('band', filters.band);
        const response = await api.get(`/vocabulary/review/words?${params.toString()}`);
        const list = response?.data?.data?.vocabularies || response?.data?.data || [];
        setVocabularies(list);
        setStats({ total: list.length, learned: 0, notLearned: 0 });
        return;
      }

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        if (key === 'status' && value === 'review_due') return;
        params.append(key, value);
      });

      const response = await api.get(`/vocabulary?${params.toString()}`);
      const list = response?.data?.data?.vocabularies || [];
      const incomingStats = response?.data?.data?.stats;
      setVocabularies(list);
      if (incomingStats) {
        setStats({
          total: incomingStats.total ?? list.length,
          learned: incomingStats.learned ?? 0,
          notLearned: incomingStats.notLearned ?? Math.max((incomingStats.total ?? list.length) - (incomingStats.learned ?? 0), 0)
        });
      } else {
        setStats({ total: list.length, learned: 0, notLearned: list.length });
      }
    } catch (err) {
      setError('Không thể tải danh sách từ vựng');
      console.error('Error fetching vocabularies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStudyMode = (mode) => {
    setActiveTab(mode);
    navigate(`/vocabulary/${mode}`);
  };

  const handleProgressUpdated = () => {
    // Refresh stats and list to reflect new progress
    fetchVocabData();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải từ vựng...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Học Từ Vựng</h1>
        <p>Nâng cao vốn từ vựng TOEIC của bạn</p>
      </div>

      <Tabs activeTab={activeTab} onChange={handleStudyMode} />

      {activeTab !== 'flashcard' && (
        <Filters filters={filters} onChange={handleFilterChange} />
      )}

      {activeTab !== 'flashcard' && (
        <BandProgress band={filters.band} stats={stats} />
      )}

      <div className={styles.content}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchVocabData}>Thử lại</button>
          </div>
        )}

        {activeTab === 'flashcard' && (
          <Flashcard vocabularies={vocabularies} onProgressUpdated={handleProgressUpdated} />
        )}

        {activeTab === 'fillblank' && (
          <FillBlank vocabularies={vocabularies} onProgressUpdated={handleProgressUpdated} />
        )}

        {activeTab === 'list' && (
          <VocabularyList vocabularies={vocabularies} />
        )}
      </div>
    </div>
  );
};

export default Vocabulary;



