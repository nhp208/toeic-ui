import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
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
        <div style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: '#FFFFFF', borderBottom: '1px solid #eee'
        }}>
            <div style={{
                maxWidth: 1200, margin: '0 auto', padding: '10px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div onClick={() => navigate('/home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🐧</span>
                    <strong style={{ fontSize: 18 }}>TOEIC Master</strong>
                </div>

                {isLoggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {storedUser?.avatar ? (
                                <img
                                    src={storedUser.avatar}
                                    alt="avatar"
                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }}
                                />
                            ) : (
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: '#8B5FBF',
                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600
                                }}>
                                    {getInitials(storedUser?.fullName || storedUser?.username)}
                                </div>
                            )}
                            <div style={{ lineHeight: 1.2 }}>
                                <div style={{ fontWeight: 600 }}>{storedUser?.fullName || storedUser?.username}</div>
                                <div style={{ fontSize: 12, color: '#6C7B7F' }}>{levelLabel(storedUser?.level)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>🔥</span>
                                <span style={{ fontWeight: 600 }}>{storedUser?.currentStreak ?? 0}</span>
                                <span style={{ fontSize: 12, color: '#6C7B7F' }}>ngày</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>⭐</span>
                                <span style={{ fontWeight: 600 }}>{storedUser?.totalXP ?? 0}</span>
                                <span style={{ fontSize: 12, color: '#6C7B7F' }}>XP</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#F44336', color: '#fff', border: 'none', padding: '8px 12px',
                                borderRadius: 8, cursor: 'pointer'
                            }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => navigate('/auth')}
                            style={{
                                background: '#8B5FBF', color: '#fff', border: 'none', padding: '8px 12px',
                                borderRadius: 8, cursor: 'pointer'
                            }}
                        >
                            Đăng nhập
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
