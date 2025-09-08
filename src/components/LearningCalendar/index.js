import React, { useEffect, useMemo, useState } from 'react';
import client from '~/api/client';
import styles from './LearningCalendar.module.scss';

function LearningCalendar({ userId, learnedDays: learnedDaysProp, onChange, highlightToday = true }) {
    const [monthOffset, setMonthOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [learnedDaysState, setLearnedDaysState] = useState([]);

    // Merge prop -> state
    useEffect(() => {
        if (Array.isArray(learnedDaysProp)) {
            setLearnedDaysState(learnedDaysProp);
        }
    }, [learnedDaysProp]);

    // Fetch from API (fallback localStorage)
    useEffect(() => {
        let mounted = true;
        async function fetchDays() {
            if (!userId) return;
            setLoading(true);
            setError('');
            try {
                const res = await client.get(`/users/${userId}/learned-days`);
                if (mounted && res?.data?.success && Array.isArray(res.data.data)) {
                    setLearnedDaysState(res.data.data);
                    localStorage.setItem('learnedDays', JSON.stringify(res.data.data));
                } else if (mounted) {
                    // fallback localStorage
                    const raw = localStorage.getItem('learnedDays');
                    setLearnedDaysState(raw ? JSON.parse(raw) : []);
                }
            } catch (e) {
                const raw = localStorage.getItem('learnedDays');
                setLearnedDaysState(raw ? JSON.parse(raw) : []);
                setError('Không tải được lịch học, dùng dữ liệu tạm.');
            } finally {
                setLoading(false);
            }
        }
        fetchDays();
        return () => { mounted = false; };
    }, [userId]);

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

    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const monthLabel = viewDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });

    const monthCells = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0..Sun=6
        const startDate = new Date(year, month, 1 - startWeekday);
        const cells = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const inMonth = d.getMonth() === month;
            const isToday = highlightToday && isSameDay(d, today);
            const active = learnedDaysState.includes(formatYmd(d));
            cells.push({ date: d, inMonth, isToday, active });
        }
        return cells;
    }, [year, month, monthOffset, learnedDaysState, highlightToday]);

    // Không còn toggle bằng click; đánh dấu do logic trang Home gửi heartbeat

    return (
        <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
                <button className={styles.navButton} onClick={() => setMonthOffset(monthOffset - 1)} disabled={loading}>←</button>
                <div className={styles.monthLabel}>{monthLabel}</div>
                <button className={styles.navButton} onClick={() => setMonthOffset(monthOffset + 1)} disabled={loading}>→</button>
            </div>
            <div className={styles.weekdayRow}>
                {['T2','T3','T4','T5','T6','T7','CN'].map((w) => (
                    <div key={w} className={styles.weekday}>{w}</div>
                ))}
            </div>
            <div className={styles.calendarGrid}>
                {monthCells.map((c, i) => (
                    <div
                        key={i}
                        className={[
                            styles.dayCell,
                            !c.inMonth ? styles.dayCellOtherMonth : '',
                            c.isToday ? styles.dayCellToday : '',
                            c.active ? styles.dayCellActive : ''
                        ].join(' ').trim()}
                        title={`${formatYmd(c.date)}${c.active ? ' • Đã học' : ''}`}
                    >
                        {c.date.getDate()}
                    </div>
                ))}
            </div>
            <div className={styles.calendarFooter}>
                {error ? error : 'Tím: đã học • Viền: hôm nay • Mờ: ngoài tháng'}
            </div>
        </div>
    );
}

export default LearningCalendar;
