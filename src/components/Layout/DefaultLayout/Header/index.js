import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';

function Header() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const storedUser = useMemo(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }, []);

    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token && storedUser);

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

    const getInitials = (name = '') => {
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    return (
        <div className={styles.header}>
            <div className={styles.container}>
                <div onClick={() => navigate('/home')} className={styles.brand}>
                    <span className={styles.brandIcon}>🐧</span>
                    <strong className={styles.brandTitle}>TOEIC With Pegu</strong>
                </div>

                {isLoggedIn ? (
                    <div className={styles.userSection}>
                        <div
                            className={styles.userBox}
                            onMouseEnter={() => setMenuOpen(true)}
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            {storedUser?.avatar ? (
                                <img
                                    src={storedUser.avatar}
                                    alt="avatar"
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.avatarInitials}>
                                    {getInitials(storedUser?.fullName || storedUser?.username)}
                                </div>
                            )}
                            <div className={styles.userInfo}>
                                <div className={styles.userName}>{storedUser?.fullName || storedUser?.username}</div>
                                <div className={styles.userLevel}>{levelLabel(storedUser?.level)}</div>
                            </div>

                            {menuOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownArrow} />
                                    <div className={styles.sectionTitle}>Tài khoản</div>
                                    <button
                                        onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                                        className={styles.menuBtn}
                                    >
                                        <span>👤</span>
                                        <span>Hồ sơ</span>
                                    </button>
                                    <button
                                        onClick={() => { setMenuOpen(false); navigate('/profile/edit'); }}
                                        className={styles.menuBtn}
                                    >
                                        <span>✏️</span>
                                        <span>Chỉnh sửa thông tin</span>
                                    </button>
                                    {storedUser?.role === 'admin' && (
                                        <button
                                            onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                                            className={styles.menuBtn}
                                        >
                                            <span>⚙️</span>
                                            <span>Quản trị</span>
                                        </button>
                                    )}
                                    <hr className={styles.divider} />
                                    <button
                                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                                        className={styles.menuBtnDanger}
                                    >
                                        <span>🚪</span>
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span>🔥</span>
                                <span style={{ fontWeight: 600 }}>{storedUser?.currentStreak ?? 0}</span>
                                <span className={styles.statSub}>ngày</span>
                            </div>
                            <div className={styles.statItem}>
                                <span>⭐</span>
                                <span style={{ fontWeight: 600 }}>{storedUser?.totalXP ?? 0}</span>
                                <span className={styles.statSub}>XP</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => navigate('/auth')} className={styles.loginBtn}>
                            Đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
