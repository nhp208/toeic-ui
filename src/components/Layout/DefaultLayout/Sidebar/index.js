import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 'vocabulary',
            title: 'Học từ vựng',
            icon: '📚',
            path: '/vocabulary',
            description: 'Học từ vựng TOEIC theo chủ đề'
        },
        {
            id: 'grammar',
            title: 'Ngữ pháp',
            icon: '📖',
            path: '/grammar',
            description: 'Học ngữ pháp TOEIC cơ bản đến nâng cao'
        },
        {
            id: 'practice',
            title: 'Luyện tập',
            icon: '💪',
            path: '/practice',
            description: 'Luyện tập 7 part TOEIC'
        },
        {
            id: 'test',
            title: 'Thi TOEIC cùng cánh cụt',
            icon: '🎯',
            path: '/test',
            description: 'Thi thử TOEIC với cánh cụt'
        }
    ];

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <div style={{
            width: isCollapsed ? '60px' : '280px',
            height: '100vh',
            background: '#f8f9fa',
            borderRight: '1px solid #e9ecef',
            transition: 'width 0.3s ease',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000,
            paddingTop: '60px' // Để tránh bị Header che
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#8B5FBF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                }}
            >
                {isCollapsed ? '→' : '←'}
            </button>

            {/* Menu Items */}
            <div style={{ padding: '20px 0' }}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleMenuClick(item.path)}
                        style={{
                            padding: isCollapsed ? '12px 8px' : '12px 20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'background-color 0.2s ease',
                            borderLeft: '3px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '20px', minWidth: '24px' }}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: '600', 
                                    fontSize: '14px',
                                    color: '#333',
                                    marginBottom: '2px'
                                }}>
                                    {item.title}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#6c757d',
                                    lineHeight: '1.3'
                                }}>
                                    {item.description}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6c757d'
                }}>
                    <div>🐧 TOEI With Pegu</div>
                    <div>Học cùng cánh cụt</div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
