import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import './VocabularyList.css';

const VocabularyList = ({ vocabularies }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    band: '',
    search: '',
    status: 'learned' // Chỉ hiển thị từ đã học
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Fetch learned words from user progress
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's learned words directly from UserVocabularyProgress
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      if (filters.band) params.append('band', filters.band);
      if (filters.search) params.append('search', filters.search);
      
      const res = await api.get(`/vocabulary/learned?${params.toString()}`);
      const data = res.data.data;
      
      setWords(data.words || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (err) {
      setError('Không thể tải danh sách từ vựng');
      console.error('Error fetching words:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWords();
  };

  // Get status badge
  const getStatusBadge = (word) => {
    if (!word.userProgress || word.userProgress.status === 'not_started') {
      return <span className="status-badge not-learned">Chưa học</span>;
    }
    
    const status = word.userProgress.status;
    switch (status) {
      case 'learning':
        return <span className="status-badge learning">Đang học</span>;
      case 'reviewing':
        return <span className="status-badge reviewing">Đang ôn tập</span>;
      case 'mastered':
        return <span className="status-badge mastered">Đã thuộc</span>;
      default:
        return <span className="status-badge learned">Đã học</span>;
    }
  };

  // Get band color
  const getBandColor = (band) => {
    const colors = {
      '0-450': '#4CAF50',
      '450-700': '#FF9800',
      '700+': '#9C27B0'
    };
    return colors[band] || '#666';
  };

  if (loading) {
    return (
      <div className="vocabulary-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vocabulary-list-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchWords}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-list-container">
      {/* Header */}
      <div className="list-header">
        <h2>Từ vựng đã học</h2>
        <p>Tổng cộng {words.length} từ đã học</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
        
        <div className="filter-controls">
          <select
            value={filters.band}
            onChange={(e) => handleFilterChange('band', e.target.value)}
          >
            <option value="">Tất cả band</option>
            <option value="0-450">0-450</option>
            <option value="450-700">450-700</option>
            <option value="700+">700+</option>
          </select>
          
        </div>
      </div>

      {/* Word List */}
      <div className="word-list">
        {words.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Không có từ vựng nào</h3>
            <p>Thử thay đổi bộ lọc để tìm từ vựng khác</p>
          </div>
        ) : (
          words.map((word) => (
            <div key={word._id || word.id} className="word-card">
              <div className="word-header">
                <div className="word-main">
                  <h3 className="word-title">{word.word}</h3>
                  <div className="word-pronunciation">{word.pronunciation}</div>
                </div>
                <div className="word-meta">
                  <span 
                    className="band-badge"
                    style={{ backgroundColor: getBandColor(word.band) }}
                  >
                    {word.band}
                  </span>
                  {getStatusBadge(word)}
                </div>
              </div>
              
              <div className="word-content">
                <div className="word-meaning">
                  <strong>Nghĩa:</strong> {word.meaning}
                </div>
                <div className="word-vietnamese">
                  <strong>Tiếng Việt:</strong> {word.vietnamese}
                </div>
                {word.partOfSpeech && (
                  <div className="word-pos">
                    <strong>Loại từ:</strong> {word.partOfSpeech}
                  </div>
                )}
                {word.category && (
                  <div className="word-category">
                    <strong>Chủ đề:</strong> {word.category}
                  </div>
                )}
              </div>
              
              {word.examples && word.examples.length > 0 && (
                <div className="word-examples">
                  <strong>Ví dụ:</strong>
                  {word.examples.map((example, index) => (
                    <div key={index} className="example-item">
                      <div className="example-sentence">"{example.sentence}"</div>
                      <div className="example-translation">{example.translation}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {word.userProgress && (
                <div className="word-progress">
                  <div className="progress-info">
                    <span>Lần học: {word.userProgress.repetitions || 0}</span>
                    <span>Độ thành thạo: {word.userProgress.masteryLevel || 0}%</span>
                  </div>
                  {word.userProgress.nextReview && (
                    <div className="next-review">
                      Ôn lại: {new Date(word.userProgress.nextReview).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'active' : ''}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabularyList;
