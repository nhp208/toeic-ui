import React from 'react';
import styles from '../Vocabulary.module.scss';

const Filters = ({ filters, onChange }) => {
  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label>Band:</label>
        <select
          value={filters.band}
          onChange={(e) => onChange('band', e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="0-450">0-450</option>
          <option value="450-700">450-700</option>
          <option value="700+">700+</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Trạng thái:</label>
        <select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="learned">Đã học</option>
          <option value="not_learned">Chưa học</option>
          <option value="review_due">Đến hạn ôn</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Danh mục:</label>
        <select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
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
        <label>Tìm kiếm:</label>
        <input
          type="text"
          placeholder="Nhập từ vựng..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>
    </div>
  );
};

export default Filters;
