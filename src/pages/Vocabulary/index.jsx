import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Flashcard from '../../components/Vocabulary/Flashcard';
import ReviewFillBlank from '../../components/Vocabulary/ReviewFillBlank';
import VocabularyList from '../../components/Vocabulary/VocabularyList';
import './Vocabulary.css';

const Vocabulary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('flashcard');
  const [vocabularies] = useState([]);

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === '/vocabulary') {
      navigate('/vocabulary/flashcard', { replace: true });
      return;
    }
    
    if (location.pathname.startsWith('/vocabulary/')) {
      const mode = location.pathname.split('/')[2];
      if (['flashcard', 'review', 'list'].includes(mode)) {
        setActiveTab(mode);
      }
    }
  }, [location.pathname, navigate]);

  // Handle tab change
  const handleTabChange = (mode) => {
    setActiveTab(mode);
    navigate(`/vocabulary/${mode}`);
  };

  // Handle progress update
  const handleProgressUpdated = () => {
    // Refresh data if needed
    console.log('Progress updated');
  };

  return (
    <div className="vocabulary-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Học Từ Vựng TOEIC</h1>
          <p>Nâng cao vốn từ vựng của bạn với các phương pháp học hiệu quả</p>
        </div>
      </div>

      <div className="navigation-tabs">
        <button
          className={`nav-tab ${activeTab === 'flashcard' ? 'active' : ''}`}
          onClick={() => handleTabChange('flashcard')}
        >
          <span className="tab-icon">🃏</span>
          <span className="tab-label">Flashcard</span>
          <span className="tab-description">Học với thẻ từ</span>
        </button>
        
        <button
          className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => handleTabChange('review')}
        >
          <span className="tab-icon">✏️</span>
          <span className="tab-label">Ôn tập</span>
          <span className="tab-description">Điền khuyết từ đến hạn</span>
        </button>
        
        <button
          className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
        >
          <span className="tab-icon">📚</span>
          <span className="tab-label">Danh sách</span>
          <span className="tab-description">Từ vựng đã học</span>
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'flashcard' && (
          <Flashcard 
            vocabularies={vocabularies} 
            onProgressUpdated={handleProgressUpdated} 
          />
        )}
        
        {activeTab === 'review' && (
          <ReviewFillBlank 
            vocabularies={vocabularies} 
            onProgressUpdated={handleProgressUpdated} 
          />
        )}
        
        {activeTab === 'list' && (
          <VocabularyList vocabularies={vocabularies} />
        )}
      </div>
    </div>
  );
};

export default Vocabulary;
