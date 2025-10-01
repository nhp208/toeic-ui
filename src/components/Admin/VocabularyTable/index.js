import React, { useState } from 'react';
import styles from './VocabularyTable.module.scss';

const VocabularyTable = ({
  vocabularies,
  loading,
  error,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  onTogglePublish,
  onBulkAction,
  pagination,
  onPageChange
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(vocabularies.map(v => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleBulkAction = (action) => {
    onBulkAction(action, selectedIds);
    setSelectedIds([]);
    setSelectAll(false);
  };

  const getStatusBadge = (isPublished) => {
    return (
      <span className={`${styles.statusBadge} ${isPublished ? styles.published : styles.unpublished}`}>
        {isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
      </span>
    );
  };


  const getPartOfSpeechColor = (partOfSpeech) => {
    const colors = {
      noun: '#E3F2FD',
      verb: '#E8F5E8',
      adjective: '#FFF3E0',
      adverb: '#F3E5F5',
      preposition: '#FCE4EC',
      conjunction: '#E0F2F1',
      interjection: '#FFF8E1',
      pronoun: '#E8EAF6',
      determiner: '#F1F8E9'
    };
    return colors[partOfSpeech] || '#F5F5F5';
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Danh mục:</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">Tất cả</option>
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

        <div className={styles.filterGroup}>
          <label>Band TOEIC:</label>
          <select
            value={filters.band}
            onChange={(e) => onFilterChange('band', e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="0-450">0-450 điểm</option>
            <option value="450-700">450-700 điểm</option>
            <option value="700+">700+ điểm</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Trạng thái:</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="published">Đã xuất bản</option>
            <option value="unpublished">Chưa xuất bản</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Nhập từ vựng..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.selectedCount}>
            Đã chọn {selectedIds.length} từ vựng
          </span>
          <div className={styles.bulkButtons}>
            <button
              onClick={() => handleBulkAction('publish')}
              className={styles.bulkBtn}
            >
              Xuất bản
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className={styles.bulkBtn}
            >
              Ẩn
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className={`${styles.bulkBtn} ${styles.deleteBtn}`}
            >
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Từ vựng</th>
              <th>Nghĩa</th>
              <th>Loại từ</th>
              <th>Band TOEIC</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className={styles.loadingCell}>
                  <div className={styles.loadingSpinner}></div>
                  Đang tải...
                </td>
              </tr>
            ) : vocabularies.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyCell}>
                  Không có từ vựng nào
                </td>
              </tr>
            ) : (
              vocabularies.map((vocab) => (
                <tr key={vocab._id}>
                  <td className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(vocab._id)}
                      onChange={(e) => handleSelectItem(vocab._id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className={styles.wordCell}>
                      <div className={styles.word}>{vocab.word}</div>
                      <div className={styles.pronunciation}>{vocab.pronunciation}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.meaningCell}>
                      <div className={styles.meaning}>{vocab.meaning}</div>
                      <div className={styles.vietnamese}>{vocab.vietnamese}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.partOfSpeech}
                      style={{ backgroundColor: getPartOfSpeechColor(vocab.partOfSpeech) }}
                    >
                      {vocab.partOfSpeech}
                    </span>
                  </td>
                  <td>
                    <span className={styles.band}>{vocab.band}</span>
                  </td>
                  <td>
                    {getStatusBadge(vocab.isPublished)}
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      {new Date(vocab.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => onEdit(vocab)}
                        className={styles.actionBtn}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onTogglePublish(vocab._id)}
                        className={styles.actionBtn}
                        title={vocab.isPublished ? 'Ẩn' : 'Xuất bản'}
                      >
                        {vocab.isPublished ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        onClick={() => onDelete(vocab._id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.pageBtn}
          >
            Trước
          </button>
          
          <div className={styles.pageInfo}>
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
          </div>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            className={styles.pageBtn}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabularyTable;



