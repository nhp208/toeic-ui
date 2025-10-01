import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '~/api/client';
import styles from './EditProfile.module.scss';

function EditProfile() {
    const navigate = useNavigate();
    const storedUser = useMemo(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }, []);

    const [form, setForm] = useState({
        fullName: '',
        level: 'beginner',
        targetScore: 600,
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/auth');
            return;
        }
        if (storedUser) {
            setForm({
                fullName: storedUser.fullName || '',
                level: storedUser.level || 'beginner',
                targetScore: storedUser.targetScore || 600,
                avatar: storedUser.avatar || ''
            });
        }
    }, [storedUser, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === 'targetScore' ? Number(value) : value }));
    };

    const fileInputRef = React.useRef(null);

    const handleChooseFile = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (typeof dataUrl === 'string') {
                setForm((prev) => ({ ...prev, avatar: dataUrl }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.put('/auth/profile', form);
            const newUser = res?.data?.data?.user || null;
            if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser));
                setMessage('Cập nhật thành công');
            } else {
                setMessage('Đã lưu');
            }
        } catch (err) {
            setError(err?.message || 'Lỗi lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Chỉnh sửa thông tin</h2>
            <form onSubmit={handleSave} className={styles.form}>
                <label className={styles.label}>
                    <span>Họ và tên</span>
                    <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Nhập họ tên" className={styles.input} />
                </label>
                <label className={styles.label}>
                    <span>Cấp độ</span>
                    <select name="level" value={form.level} onChange={onChange} className={styles.input}>
                        <option value="beginner">Cánh cụt mầm non</option>
                        <option value="elementary">Cánh cụt cơ bản</option>
                        <option value="intermediate">Cánh cụt trung cấp</option>
                        <option value="advanced">Cánh cụt cao cấp</option>
                        <option value="expert">Cánh cụt chuyên gia</option>
                    </select>
                </label>
                <label className={styles.label}>
                    <span>Mục tiêu điểm TOEIC</span>
                    <input name="targetScore" type="number" min={200} max={990} step={5}
                        value={form.targetScore} onChange={onChange} className={styles.input} />
                </label>
                <div className={styles.label}>
                    <span>Ảnh đại diện</span>
                    <div className={styles.avatarRow}>
                        <div className={styles.avatarPicker} onClick={handleChooseFile}>
                            {form.avatar ? (
                                <img src={form.avatar} alt="avatar preview" className={styles.avatarPreview} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>Chọn ảnh</div>
                            )}
                        </div>
                        <div className={styles.urlBox}>
                            <input
                                name="avatar"
                                value={form.avatar}
                                onChange={onChange}
                                placeholder="Dán URL ảnh tại đây hoặc bấm chọn file"
                                className={styles.input}
                            />
                            <div className={styles.hint}>Hỗ trợ dán URL ảnh hoặc chọn file từ máy.</div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={loading} className={styles.primaryBtn}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className={styles.secondaryBtn}>
                        Hủy
                    </button>
                </div>

                {message && <div className={styles.success}>{message}</div>}
                {error && <div className={styles.error}>{error}</div>}
            </form>
        </div>
    );
}

export default EditProfile;


