import React, { useState, useEffect } from 'react';
import api from '../../../api/client';
import styles from './AdminStats.module.scss';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats/vocabularies');
      setStats(response.data.data);
    } catch (err) {
      setError('Không thể tải thống kê');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchStats}>Thử lại</button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Thống kê từ vựng</h2>
        <button onClick={fetchStats} className={styles.refreshBtn}>
          🔄 Làm mới
        </button>
      </div>

      {/* Overview Cards */}
      <div className={styles.overview}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.overview.total}</div>
            <div className={styles.statLabel}>Tổng từ vựng</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.overview.published}</div>
            <div className={styles.statLabel}>Đã xuất bản</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.overview.unpublished}</div>
            <div className={styles.statLabel}>Chưa xuất bản</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>Phân bố theo danh mục</h3>
          <div className={styles.chart}>
            {stats.byCategory.map((item, index) => (
              <div key={item._id} className={styles.chartItem}>
                <div className={styles.chartLabel}>
                  {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                </div>
                <div className={styles.chartBar}>
                  <div 
                    className={styles.chartFill}
                    style={{ 
                      width: `${(item.count / Math.max(...stats.byCategory.map(c => c.count))) * 100}%`,
                      backgroundColor: `hsl(${index * 40}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className={styles.chartValue}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Phân bố theo cấp độ</h3>
          <div className={styles.chart}>
            {stats.byLevel.map((item, index) => (
              <div key={item._id} className={styles.chartItem}>
                <div className={styles.chartLabel}>
                  {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                </div>
                <div className={styles.chartBar}>
                  <div 
                    className={styles.chartFill}
                    style={{ 
                      width: `${(item.count / Math.max(...stats.byLevel.map(l => l.count))) * 100}%`,
                      backgroundColor: `hsl(${120 + index * 60}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className={styles.chartValue}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Phân bố theo độ khó</h3>
          <div className={styles.chart}>
            {stats.byDifficulty.map((item, index) => (
              <div key={item._id} className={styles.chartItem}>
                <div className={styles.chartLabel}>
                  {item._id} sao
                </div>
                <div className={styles.chartBar}>
                  <div 
                    className={styles.chartFill}
                    style={{ 
                      width: `${(item.count / Math.max(...stats.byDifficulty.map(d => d.count))) * 100}%`,
                      backgroundColor: `hsl(${30 + item._id * 30}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className={styles.chartValue}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Vocabularies */}
      <div className={styles.recentCard}>
        <h3>Từ vựng gần đây</h3>
        <div className={styles.recentList}>
          {stats.recent.map((vocab) => (
            <div key={vocab._id} className={styles.recentItem}>
              <div className={styles.recentWord}>
                <div className={styles.word}>{vocab.word}</div>
                <div className={styles.meaning}>{vocab.meaning}</div>
              </div>
              <div className={styles.recentMeta}>
                <span className={styles.category}>{vocab.category}</span>
                <span className={styles.level}>{vocab.level}</span>
                <span className={`${styles.status} ${vocab.isPublished ? styles.published : styles.unpublished}`}>
                  {vocab.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </span>
                <span className={styles.date}>
                  {new Date(vocab.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;



