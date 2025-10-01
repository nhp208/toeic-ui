import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';

function Profile() {
    const navigate = useNavigate();
    const storedUser = useMemo(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }, []);

    if (!storedUser) {
        navigate('/auth');
        return null;
    }

    const levelLabel = (level) => {
        switch (level) {
            case 'beginner':
                return 'Cánh cụt mầm non';
            case 'elementary':
                return 'Cánh cụt cơ bản';
            case 'intermediate':
                return 'Cánh cụt trung cấp';
            case 'advanced':
                return 'Cánh cụt cao cấp';
            case 'expert':
                return 'Cánh cụt chuyên gia';
            default:
                return 'Cánh cụt tập sự';
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                {storedUser?.avatar ? (
                    <img src={storedUser.avatar} alt="avatar" className={styles.avatar} />
                ) : (
                    <div className={styles.avatarFallback}>
                        {(storedUser?.fullName || storedUser?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h2 className={styles.name}>{storedUser?.fullName || storedUser?.username}</h2>
                    <div className={styles.level}>{levelLabel(storedUser?.level)}</div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Email</div>
                    <div className={styles.cardValue}>{storedUser?.email || '-'}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Mục tiêu TOEIC</div>
                    <div className={styles.cardValue}>{storedUser?.targetScore ?? 600}</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Chuỗi ngày học</div>
                    <div className={styles.cardValue}>{storedUser?.currentStreak ?? 0} ngày</div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardLabel}>Tổng XP</div>
                    <div className={styles.cardValue}>{storedUser?.totalXP ?? 0}</div>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={() => navigate('/profile/edit')}>Chỉnh sửa</button>
                <button className={styles.secondaryBtn} onClick={() => navigate('/home')}>Về trang chủ</button>
            </div>
        </div>
    );
}

export default Profile;


