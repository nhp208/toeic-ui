import React, { useState, useEffect } from 'react';
import styles from './Introduce.module.scss';
import Logo from '../../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
function Introduce() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentStreak, setCurrentStreak] = useState(7);
    const [totalXP, setTotalXP] = useState(1250);
    const navigate = useNavigate();
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className={styles.homeContainer}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.streakCounter}>
                            <span className={styles.fireIcon}>🔥</span>
                            <span className={styles.streakNumber}>{currentStreak}</span>
                            <span className={styles.streakText}>ngày liên tiếp</span>
                        </div>
                        <div className={styles.xpCounter}>
                            <span className={styles.xpIcon}>⭐</span>
                            <span className={styles.xpNumber}>{totalXP}</span>
                            <span className={styles.xpText}>XP</span>
                        </div>
                    </div>

                    <h1 className={styles.heroTitle}>
                        Học TOEIC <span className={styles.highlight}>Vui Như Chơi</span> 🎮
                    </h1>
                    
                    <p className={styles.heroSubtitle}>
                        Nền tảng luyện thi TOEIC trực tuyến hàng đầu Việt Nam
                    </p>

                    <div className={styles.heroButtons}>
                        <button className={styles.primaryButton} onClick={() => navigate('/auth')}>
                            <span className={styles.buttonText}>🎯 Bắt đầu học ngay</span>
                        </button>
                        <button className={styles.secondaryButton}>
                            <span className={styles.buttonText}>📚 Xem demo bài học</span>
                        </button>
                    </div>
                </div>

                <div className={styles.heroImage}>
                    <div className={styles.penguinContainer}>
                        <div className={styles.penguin3D} style={{
                            transform: `perspective(1000px) rotateY(${mousePosition.x * 15}deg) rotateX(${mousePosition.y * -15}deg) translateZ(20px)`
                        }}>
                            <img src={Logo} alt="TOEIC Practice Mascot" className={styles.penguinLogo} />
                        </div>
                        <div className={styles.penguinShadow}></div>
                        
                        {/* Speech Bubble */}
                        <div className={styles.speechBubble}>
                            <span className={styles.bubbleText}>Chào bạn! Hãy cùng học TOEIC nào! 🎉</span>
                            <div className={styles.bubbleTail}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Simplified */}
            <div className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.titleIcon}>🎯</span>
                    Tại sao chọn TOEIC Practice?
                </h2>
                
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📚</div>
                        <h3>Kho đề thi phong phú</h3>
                        <p>Hơn 1000+ câu hỏi TOEIC được cập nhật thường xuyên theo format mới nhất</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎧</div>
                        <h3>Luyện nghe chuyên sâu</h3>
                        <p>Audio chất lượng cao với giọng đọc chuẩn Anh-Mỹ, phù hợp với đề thi thật</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📊</div>
                        <h3>Thống kê chi tiết</h3>
                        <p>Theo dõi tiến độ học tập và phân tích điểm mạnh, điểm yếu của bạn</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Học mọi lúc mọi nơi</h3>
                        <p>Tương thích với mọi thiết bị, học offline và online linh hoạt</p>
                    </div>
                </div>
            </div>

            {/* CTA Section - Simplified */}
            <div className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2>
                        <span className={styles.ctaIcon}>🚀</span>
                        Sẵn sàng chinh phục TOEIC?
                    </h2>
                    <p>Tham gia ngay để nâng cao kỹ năng tiếng Anh của bạn</p>
                    
                    <button className={styles.ctaButton}>
                        <span className={styles.buttonText}>🎉 Đăng ký miễn phí ngay</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Introduce;