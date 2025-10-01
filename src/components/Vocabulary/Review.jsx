import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import './Review.css';

const Review = ({ vocabularies, onProgressUpdated }) => {
  // Core study state
  const [reviewWords, setReviewWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // UI state
  const [selectedBand, setSelectedBand] = useState('');
  const [wordCount, setWordCount] = useState(10);
  const [shuffleMode, setShuffleMode] = useState(true);
  
  // Stats
  const [score, setScore] = useState(0);
  const [qualityStats, setQualityStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [sessionStart, setSessionStart] = useState(null);
  
  // Band stats
  const [bandStats, setBandStats] = useState({
    '0-450': { total: 0, learned: 0, reviewDue: 0 },
    '450-700': { total: 0, learned: 0, reviewDue: 0 },
    '700+': { total: 0, learned: 0, reviewDue: 0 }
  });

  const currentWord = reviewWords[currentIndex];

  // Fetch band statistics
  const fetchBandStats = useCallback(async () => {
    const bands = ['0-450', '450-700', '700+'];
    const stats = {};
    
    for (const band of bands) {
      try {
        const [totalRes, learnedRes, reviewRes] = await Promise.all([
          api.get(`/vocabulary?band=${band}&limit=1000`),
          api.get(`/vocabulary?band=${band}&status=learned&limit=1000`),
          api.get(`/vocabulary?band=${band}&status=review_due&limit=1000`)
        ]);
        
        stats[band] = {
          total: totalRes.data.data.vocabularies.length,
          learned: learnedRes.data.data.vocabularies.length,
          reviewDue: reviewRes.data.data.vocabularies.length
        };
      } catch (err) {
        console.error(`Error fetching stats for band ${band}:`, err);
        stats[band] = { total: 0, learned: 0, reviewDue: 0 };
      }
    }
    
    setBandStats(stats);
  }, []);

  useEffect(() => {
    fetchBandStats();
  }, [fetchBandStats]);

  // Quality intervals mapping
  const getIntervalDays = (quality) => {
    const intervals = [1, 1, 3, 7]; // Again, Hard, Good, Easy
    return intervals[quality] || 1;
  };

  // Handle quality rating
  const handleQuality = useCallback(async (quality) => {
    if (!currentWord) return;

    try {
      const id = currentWord._id || currentWord.id;
      const nextIntervalDays = getIntervalDays(quality);
      
      await api.put(`/vocabulary/${id}/progress`, {
        type: 'review',
        score: (quality + 1) * 25,
        quality: quality,
        nextIntervalDays
      });

      // Update stats
      setScore(prev => prev + (quality + 1) * 25);
      setQualityStats(prev => {
        const stats = { ...prev };
        if (quality === 0) stats.again += 1;
        if (quality === 1) stats.hard += 1;
        if (quality === 2) stats.good += 1;
        if (quality === 3) stats.easy += 1;
        return stats;
      });

      // Refresh band stats
      fetchBandStats();
      if (onProgressUpdated) onProgressUpdated();

      // Move to next word or complete
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [currentWord, currentIndex, reviewWords.length, fetchBandStats, onProgressUpdated]);

  // Start review session
  const startReview = useCallback(async () => {
    if (!selectedBand) return;
    
    try {
      const res = await api.get(`/vocabulary/review/words?band=${selectedBand}`);
      const words = res.data.data.vocabularies || res.data.data || [];
      
      if (words.length === 0) {
        alert('Không có từ đến hạn ôn trong band này');
        return;
      }
      
      // Shuffle if enabled
      const finalWords = shuffleMode ? 
        [...words].sort(() => Math.random() - 0.5) : 
        words;
      
      setReviewWords(finalWords.slice(0, wordCount));
      setCurrentIndex(0);
      setShowAnswer(false);
      setCompleted(false);
      setScore(0);
      setQualityStats({ again: 0, hard: 0, good: 0, easy: 0 });
      setSessionStart(Date.now());
    } catch (error) {
      console.error('Error fetching review words:', error);
    }
  }, [selectedBand, wordCount, shuffleMode]);

  // Reset study
  const resetStudy = () => {
    setReviewWords([]);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setScore(0);
    setQualityStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setSessionStart(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (!showAnswer) setShowAnswer(true);
        return;
      }
      
      if (!showAnswer) return;
      if (e.key === '1') handleQuality(0);
      if (e.key === '2') handleQuality(1);
      if (e.key === '3') handleQuality(2);
      if (e.key === '4') handleQuality(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, handleQuality]);

  // Band selection screen
  if (reviewWords.length === 0) {
    return (
      <div className="review-container">
        <div className="study-setup">
          <div className="setup-header">
            <h1>Ôn lại từ vựng</h1>
            <p>Ôn tập các từ đã đến hạn học lại</p>
          </div>
          
          <div className="band-selection">
            {[
              { band: '0-450', name: 'Mầm non', icon: '🌱', color: '#4CAF50' },
              { band: '450-700', name: 'Trung cấp', icon: '🌿', color: '#FF9800' },
              { band: '700+', name: 'Cao cấp', icon: '🌳', color: '#9C27B0' }
            ].map(({ band, name, icon, color }) => {
              const stats = bandStats[band];
              const progressPercent = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0;
              
              return (
                <div key={band} className="band-option">
                  <div 
                    className={`band-card ${selectedBand === band ? 'selected' : ''}`}
                    onClick={() => setSelectedBand(band)}
                  >
                    <div className="band-icon" style={{ color }}>{icon}</div>
                    <div className="band-info">
                      <h3>{band}</h3>
                      <p>{name}</p>
                    </div>
                    <div className="band-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercent}%`, backgroundColor: color }}
                        />
                      </div>
                      <div className="progress-text">
                        {stats.learned}/{stats.total} từ đã học
                      </div>
                    </div>
                  </div>
                  
                  {selectedBand === band && (
                    <div className="study-config">
                      <div className="config-row">
                        <div className="config-item">
                          <label>Số từ:</label>
                          <select value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}>
                            <option value={5}>5 từ</option>
                            <option value={10}>10 từ</option>
                            <option value={20}>20 từ</option>
                            <option value={50}>50 từ</option>
                          </select>
                        </div>
                        
                        <div className="config-item">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={shuffleMode}
                              onChange={(e) => setShuffleMode(e.target.checked)}
                            />
                            Xáo trộn
                          </label>
                        </div>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="action-btn review"
                          onClick={startReview}
                          disabled={stats.reviewDue === 0}
                        >
                          <span className="btn-icon">🔄</span>
                          <span className="btn-text">Bắt đầu ôn tập</span>
                          <span className="btn-count">({stats.reviewDue} từ)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    const duration = sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0;
    const avgScore = reviewWords.length > 0 ? Math.round(score / reviewWords.length) : 0;
    
    return (
      <div className="review-container">
        <div className="completion-screen">
          <div className="completion-header">
            <div className="completion-icon">🎉</div>
            <h2>Hoàn thành ôn tập!</h2>
            <p>Bạn đã ôn lại {reviewWords.length} từ vựng</p>
          </div>
          
          <div className="completion-stats">
            <div className="stat-card">
              <div className="stat-value">{avgScore}</div>
              <div className="stat-label">Điểm trung bình</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{duration}s</div>
              <div className="stat-label">Thời gian</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{qualityStats.good + qualityStats.easy}</div>
              <div className="stat-label">Từ thuộc tốt</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{qualityStats.again + qualityStats.hard}</div>
              <div className="stat-label">Cần ôn thêm</div>
            </div>
          </div>
          
          <div className="quality-breakdown">
            <h3>Phân tích kết quả</h3>
            <div className="quality-stats">
              <div className="quality-stat again">
                <span className="quality-label">Again</span>
                <span className="quality-count">{qualityStats.again}</span>
              </div>
              <div className="quality-stat hard">
                <span className="quality-label">Hard</span>
                <span className="quality-count">{qualityStats.hard}</span>
              </div>
              <div className="quality-stat good">
                <span className="quality-label">Good</span>
                <span className="quality-count">{qualityStats.good}</span>
              </div>
              <div className="quality-stat easy">
                <span className="quality-label">Easy</span>
                <span className="quality-count">{qualityStats.easy}</span>
              </div>
            </div>
          </div>
          
          <div className="completion-actions">
            <button className="primary-btn" onClick={resetStudy}>
              Ôn tập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Study screen
  return (
    <div className="review-container">
      <div className="study-header">
        <div className="progress-info">
          <span className="progress-text">{currentIndex + 1} / {reviewWords.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
            />
          </div>
        </div>
        <button className="back-btn" onClick={resetStudy}>
          ← Quay lại
        </button>
      </div>

      <div className="card-container">
        <div className="review-card" onClick={() => !showAnswer && setShowAnswer(true)}>
          {!showAnswer ? (
            <div className="card-front">
              <div className="word">{currentWord?.word}</div>
              <div className="pronunciation">{currentWord?.pronunciation}</div>
              <div className="part-of-speech">{currentWord?.partOfSpeech}</div>
              <div className="hint">Nhấn để xem nghĩa</div>
            </div>
          ) : (
            <div className="card-back">
              <div className="meaning">{currentWord?.meaning}</div>
              <div className="vietnamese">{currentWord?.vietnamese}</div>
              {currentWord?.examples?.[0] && (
                <div className="example">
                  <div className="example-sentence">"{currentWord.examples[0].sentence}"</div>
                  <div className="example-translation">{currentWord.examples[0].translation}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAnswer && (
        <div className="quality-buttons">
          <button 
            className="quality-btn again" 
            onClick={() => handleQuality(0)}
          >
            <span className="btn-text">Again</span>
            <span className="btn-interval">1d</span>
          </button>
          <button 
            className="quality-btn hard" 
            onClick={() => handleQuality(1)}
          >
            <span className="btn-text">Hard</span>
            <span className="btn-interval">1d</span>
          </button>
          <button 
            className="quality-btn good" 
            onClick={() => handleQuality(2)}
          >
            <span className="btn-text">Good</span>
            <span className="btn-interval">3d</span>
          </button>
          <button 
            className="quality-btn easy" 
            onClick={() => handleQuality(3)}
          >
            <span className="btn-text">Easy</span>
            <span className="btn-interval">7d</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Review;
