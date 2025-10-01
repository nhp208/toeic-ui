import React, { useState, useEffect } from 'react';
import api from '../../../api/client';
import styles from './VocabularyForm.module.scss';

const VocabularyForm = ({ vocabulary, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    word: '',
    pronunciation: '',
    meaning: '',
    vietnamese: '',
    partOfSpeech: 'noun',
    band: '0-450',
    category: 'general',
    isPublished: true,
    examples: [{ sentence: '', translation: '' }],
    synonyms: [],
    antonyms: [],
    tags: [],
    imageUrl: '',
    audioUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word || '',
        pronunciation: vocabulary.pronunciation || '',
        meaning: vocabulary.meaning || '',
        vietnamese: vocabulary.vietnamese || '',
        partOfSpeech: vocabulary.partOfSpeech || 'noun',
        band: vocabulary.band || '0-450',
        category: vocabulary.category || 'general',
        isPublished: vocabulary.isPublished !== undefined ? vocabulary.isPublished : true,
        examples: vocabulary.examples && vocabulary.examples.length > 0 
          ? vocabulary.examples 
          : [{ sentence: '', translation: '' }],
        synonyms: vocabulary.synonyms || [],
        antonyms: vocabulary.antonyms || [],
        tags: vocabulary.tags || [],
        imageUrl: vocabulary.imageUrl || '',
        audioUrl: vocabulary.audioUrl || ''
      });
    }
  }, [vocabulary]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      examples: newExamples
    }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { sentence: '', translation: '' }]
    }));
  };

  const removeExample = (index) => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        examples: newExamples
      }));
    }
  };

  const handleArrayFieldChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (vocabulary) {
        await api.put(`/admin/vocabularies/${vocabulary._id}`, formData);
      } else {
        await api.post('/admin/vocabularies', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{vocabulary ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Thông tin cơ bản</h3>
              
              <div className={styles.formGroup}>
                <label>Từ vựng *</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => handleInputChange('word', e.target.value)}
                  required
                  placeholder="Nhập từ vựng"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phát âm *</label>
                <input
                  type="text"
                  value={formData.pronunciation}
                  onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                  required
                  placeholder="/wɜːrd/"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nghĩa tiếng Anh *</label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) => handleInputChange('meaning', e.target.value)}
                  required
                  placeholder="English meaning"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  value={formData.vietnamese}
                  onChange={(e) => handleInputChange('vietnamese', e.target.value)}
                  required
                  placeholder="Nghĩa tiếng Việt"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Loại từ *</label>
                <select
                  value={formData.partOfSpeech}
                  onChange={(e) => handleInputChange('partOfSpeech', e.target.value)}
                  required
                >
                  <option value="noun">Danh từ</option>
                  <option value="verb">Động từ</option>
                  <option value="adjective">Tính từ</option>
                  <option value="adverb">Trạng từ</option>
                  <option value="preposition">Giới từ</option>
                  <option value="conjunction">Liên từ</option>
                  <option value="interjection">Thán từ</option>
                  <option value="pronoun">Đại từ</option>
                  <option value="determiner">Từ hạn định</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Band TOEIC *</label>
                <select
                  value={formData.band}
                  onChange={(e) => handleInputChange('band', e.target.value)}
                  required
                >
                  <option value="0-450">0-450 điểm</option>
                  <option value="450-700">450-700 điểm</option>
                  <option value="700+">700+ điểm</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Danh mục *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="business">Kinh doanh</option>
                  <option value="travel">Du lịch</option>
                  <option value="education">Giáo dục</option>
                  <option value="technology">Công nghệ</option>
                  <option value="health">Sức khỏe</option>
                  <option value="food">Ẩm thực</option>
                  <option value="shopping">Mua sắm</option>
                  <option value="entertainment">Giải trí</option>
                  <option value="general">Chung</option>
                </select>
              </div>
            </div>

            {/* Examples */}
            <div className={styles.section}>
              <h3>Ví dụ</h3>
              {formData.examples.map((example, index) => (
                <div key={index} className={styles.exampleGroup}>
                  <div className={styles.formGroup}>
                    <label>Câu ví dụ *</label>
                    <input
                      type="text"
                      value={example.sentence}
                      onChange={(e) => handleExampleChange(index, 'sentence', e.target.value)}
                      required
                      placeholder="This is an example sentence."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Bản dịch *</label>
                    <input
                      type="text"
                      value={example.translation}
                      onChange={(e) => handleExampleChange(index, 'translation', e.target.value)}
                      required
                      placeholder="Đây là câu ví dụ."
                    />
                  </div>
                  {formData.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className={styles.removeBtn}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addExample}
                className={styles.addExampleBtn}
              >
                + Thêm ví dụ
              </button>
            </div>

            {/* Additional Information */}
            <div className={styles.section}>
              <h3>Thông tin bổ sung</h3>
              
              <div className={styles.formGroup}>
                <label>Từ đồng nghĩa</label>
                <input
                  type="text"
                  value={formData.synonyms.join(', ')}
                  onChange={(e) => handleArrayFieldChange('synonyms', e.target.value)}
                  placeholder="synonym1, synonym2, synonym3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Từ trái nghĩa</label>
                <input
                  type="text"
                  value={formData.antonyms.join(', ')}
                  onChange={(e) => handleArrayFieldChange('antonyms', e.target.value)}
                  placeholder="antonym1, antonym2, antonym3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Thẻ</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleArrayFieldChange('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>URL hình ảnh</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label>URL âm thanh</label>
                <input
                  type="url"
                  value={formData.audioUrl}
                  onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  />
                  Xuất bản ngay
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Đang lưu...' : (vocabulary ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VocabularyForm;



