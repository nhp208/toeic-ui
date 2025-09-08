import React, { useEffect, useMemo, useState } from 'react';
import styles from './Home.module.scss';
import LearningCalendar from '~/components/LearningCalendar';
import client from '~/api/client';

function Home() {
    const user = useMemo(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }, []);

    const fullName = user?.fullName || user?.username || 'Cánh cụt';
    const level = user?.level || 'beginner';
    const streak = user?.currentStreak ?? 0;
    const xp = user?.totalXP ?? 0;
    const achievements = Array.isArray(user?.achievements) ? user.achievements : [];
    const [showCongrats, setShowCongrats] = useState(false);
    const [justUnlocked, setJustUnlocked] = useState(null);
    const [showStreakIncrease, setShowStreakIncrease] = useState(false);

    const levelLabel = (l) => {
        switch (l) {
            case 'beginner': return 'Cánh cụt mầm non';
            case 'elementary': return 'Cánh cụt cơ bản';
            case 'intermediate': return 'Cánh cụt trung cấp';
            case 'advanced': return 'Cánh cụt cao cấp';
            case 'expert': return 'Cánh cụt chuyên gia';
            default: return 'Cánh cụt tập sự';
        }
    };

    const getInitials = (name = '') => {
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Auto mark learned today and start minute tracking (heartbeat)
    useEffect(() => {
        const userId = user?._id;
        if (!userId) return;

        // Mark today as learned immediately (idempotent)
        client.post(`/users/${userId}/learned-days`, { active: true, type: 'session' }).catch(() => {});

        let intervalId;
        const startHeartbeat = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    client.post(`/users/${userId}/learned-days`, { active: true, minutes: 1, type: 'session' }).catch(() => {});
                }
            }, 60000);
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                // kick an immediate ping when user returns
                client.post(`/users/${userId}/learned-days`, { active: true, minutes: 1, type: 'session' }).catch(() => {});
                startHeartbeat();
            } else {
                if (intervalId) clearInterval(intervalId);
            }
        };

        // Init based on current visibility
        handleVisibility();
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (intervalId) clearInterval(intervalId);
        };
    }, [user]);

    // Detect just unlocked milestone (compare with local cache)
    useEffect(() => {
        if (!user) return;
        try {
            const cacheRaw = localStorage.getItem('achievementsCache');
            const cache = cacheRaw ? JSON.parse(cacheRaw) : [];
            const current = achievements;
            const newly = current.find((a) => !cache.includes(a));
            if (newly) {
                setJustUnlocked(newly);
                setShowCongrats(true);
                localStorage.setItem('achievementsCache', JSON.stringify(current));
            }
        } catch {}
    }, [achievements, user]);

    // Show streak increase congrats once per day (first login of the day)
    useEffect(() => {
        if (!user) return;
        try {
            const today = new Date();
            const y = today.getFullYear();
            const m = `${today.getMonth() + 1}`.padStart(2, '0');
            const d = `${today.getDate()}`.padStart(2, '0');
            const todayYmd = `${y}-${m}-${d}`;
            const lastShown = localStorage.getItem('streakCongratsDate') || '';
            // Only show once per day
            if (lastShown !== todayYmd) {
                // If backend already updated lastActive to today and streak >= 1, show
                setShowStreakIncrease(true);
                localStorage.setItem('streakCongratsDate', todayYmd);
            }
        } catch {}
    }, [user]);

    // Calendar month state
    const [monthOffset, setMonthOffset] = useState(0); // 0: current, -1: prev, +1: next
    const today = new Date();
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const formatYmd = (d) => {
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, '0');
        const dd = `${d.getDate()}`.padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };

    // days learned list from localStorage or user
    const learnedDays = useMemo(() => {
        try {
            const raw = localStorage.getItem('learnedDays');
            if (raw) return JSON.parse(raw);
        } catch {}
        return user?.learnedDays || [];
    }, [user]);

    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const buildMonthDays = () => {
        const firstDayOfMonth = new Date(year, month, 1);
        const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0..Sun=6
        const startDate = new Date(year, month, 1 - startWeekday);
        const cells = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const inMonth = d.getMonth() === month;
            const isToday = isSameDay(d, today);
            const active = learnedDays.includes(formatYmd(d));
            cells.push({ date: d, inMonth, isToday, active });
        }
        return cells;
    };

    const monthCells = buildMonthDays();
    const monthLabel = viewDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });

    return (
        <div className={styles.container}>
            {/* Milestone banner + next goal */}
            <div className={styles.milestone}>
                <div>
                    <div className={styles.milestoneTitle}>🎉 Chúc mừng!</div>
                    <div>Bạn đang có streak {streak} ngày.</div>
                </div>
                <div className={styles.nextGoal}>
                    {(() => {
                        const milestones = [3,7,14,30,60,90,180,365];
                        const next = milestones.find(m => m > streak);
                        return next ? (
                            <>
                                <span>🎯</span>
                                <span>Mục tiêu tiếp theo: {next} ngày</span>
                            </>
                        ) : (
                            <>
                                <span>🏆</span>
                                <span>Đã chinh phục tất cả mốc!</span>
                            </>
                        );
                    })()}
                </div>
            </div>
            <div className={styles.hero}>
                <div className={styles.left}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className={styles.avatar} />
                    ) : (
                        <div className={styles.avatar}>{getInitials(fullName)}</div>
                    )}
                    <div>
                        <div className={styles.name}>Xin chào, {fullName} 👋</div>
                        <div className={styles.statPills}>
                            <div className={styles.pill}>🐧 {levelLabel(level)}</div>
                            <div className={styles.pill}>🔥 {streak} ngày</div>
                            <div className={styles.pill}>⭐ {xp} XP</div>
                        </div>
                    </div>
                </div>
                <button className={styles.cta}>Tiếp tục học</button>
            </div>

            <div className={styles.actions}>
                <div className={styles.bigButton}>
                    <span className={styles.emoji}>📚</span>
                    <div>
                        <div className={styles.title}>Học từ vựng</div>
                        <div className={styles.subtitle}>Chủ đề phù hợp với bạn</div>
                    </div>
                </div>
                <div className={styles.bigButton}>
                    <span className={styles.emoji}>📖</span>
                    <div>
                        <div className={styles.title}>Ngữ pháp</div>
                        <div className={styles.subtitle}>Cơ bản đến nâng cao</div>
                    </div>
                </div>
                <div className={styles.bigButton}>
                    <span className={styles.emoji}>💪</span>
                    <div>
                        <div className={styles.title}>Luyện tập</div>
                        <div className={styles.subtitle}>7 Part TOEIC</div>
                    </div>
                </div>
                <div className={styles.bigButton}>
                    <span className={styles.emoji}>🎯</span>
                    <div>
                        <div className={styles.title}>Thi TOEIC cùng cánh cụt</div>
                        <div className={styles.subtitle}>Mock test đề gợi ý</div>
                    </div>
                </div>
            </div>

            <div className={styles.tip}>💡 Mẹo nhỏ: Học 10 phút mỗi ngày để giữ streak nhé!</div>

            <LearningCalendar userId={user?._id} />

            {(showCongrats || showStreakIncrease) && (
                <div className={styles.modalBackdrop} onClick={() => setShowCongrats(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confetti}>🎉🎉🎉</div>
                        <div className={styles.modalTitle}>{showStreakIncrease ? 'Streak tăng lên!' : 'Chúc mừng đạt mốc!'}</div>
                        <div className={styles.modalText}>
                            {showStreakIncrease
                                ? `Bạn đang có streak ${streak} ngày. Tiếp tục giữ phong độ nhé!`
                                : (justUnlocked ? `Bạn vừa đạt ${justUnlocked.replace('streak_', '')} ngày streak!` : 'Bạn vừa đạt một mốc thành tựu!')}
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.primaryBtn} onClick={() => { setShowCongrats(false); setShowStreakIncrease(false); }}>Tuyệt vời!</button>
                            <button className={styles.ghostBtn} onClick={() => { setShowCongrats(false); setShowStreakIncrease(false); }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
