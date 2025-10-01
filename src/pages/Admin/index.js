import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import VocabularyForm from '../../components/Admin/VocabularyForm';
import VocabularyTable from '../../components/Admin/VocabularyTable';
import AdminStats from '../../components/Admin/AdminStats';
import styles from './Admin.module.scss';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vocabularies');
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVocabulary, setSelectedVocabulary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    band: '',
    search: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (activeTab === 'vocabularies') {
      fetchVocabularies();
    }
  }, [activeTab, filters, pagination.page]);

  const checkAdminAccess = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.data.user.role !== 'admin') {
        navigate('/home');
        return;
      }
    } catch (error) {
      navigate('/auth');
      return;
    }
  };

  const fetchVocabularies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      console.log('🔍 Admin API Request:', `/admin/vocabularies?${params.toString()}`);
      const response = await api.get(`/admin/vocabularies?${params.toString()}`);
      setVocabularies(response.data.data.vocabularies);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total
      }));
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/home');
        return;
      }
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
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleEditVocabulary = (vocabulary) => {
    setSelectedVocabulary(vocabulary);
    setShowForm(true);
  };

  const handleAddVocabulary = () => {
    setSelectedVocabulary(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedVocabulary(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedVocabulary(null);
    fetchVocabularies();
  };

  const handleDeleteVocabulary = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) {
      return;
    }

    try {
      await api.delete(`/admin/vocabularies/${id}`);
      fetchVocabularies();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      alert('Không thể xóa từ vựng');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await api.patch(`/admin/vocabularies/${id}/toggle-publish`);
      fetchVocabularies();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Không thể thay đổi trạng thái xuất bản');
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một từ vựng');
      return;
    }

    try {
      if (action === 'publish') {
        await api.patch('/admin/vocabularies/bulk-status', {
          ids: selectedIds,
          isPublished: true
        });
      } else if (action === 'unpublish') {
        await api.patch('/admin/vocabularies/bulk-status', {
          ids: selectedIds,
          isPublished: false
        });
      } else if (action === 'delete') {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} từ vựng đã chọn?`)) {
          return;
        }
        await api.delete('/admin/vocabularies/bulk-delete', {
          data: { ids: selectedIds }
        });
      }
      fetchVocabularies();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Không thể thực hiện thao tác');
    }
  };

  if (loading && vocabularies.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Quản lý Admin</h1>
        <p>Quản lý từ vựng và nội dung hệ thống</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'vocabularies' ? styles.active : ''}`}
          onClick={() => setActiveTab('vocabularies')}
        >
          <span className={styles.tabIcon}>📚</span>
          Từ vựng
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className={styles.tabIcon}>📊</span>
          Thống kê
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'vocabularies' && (
          <>
            <div className={styles.toolbar}>
              <button onClick={handleAddVocabulary} className={styles.addBtn}>
                <span>+</span>
                Thêm từ vựng
              </button>
            </div>

            <VocabularyTable
              vocabularies={vocabularies}
              loading={loading}
              error={error}
              filters={filters}
              onFilterChange={handleFilterChange}
              onEdit={handleEditVocabulary}
              onDelete={handleDeleteVocabulary}
              onTogglePublish={handleTogglePublish}
              onBulkAction={handleBulkAction}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {activeTab === 'stats' && (
          <AdminStats />
        )}
      </div>

      {showForm && (
        <VocabularyForm
          vocabulary={selectedVocabulary}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Admin;



