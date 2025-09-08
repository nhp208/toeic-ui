import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Auth.module.scss';
import { useNavigate } from 'react-router-dom';
import api from '~/api/client';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        level: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();

    const levels = [
        { value: 'beginner', label: 'Beginner (0-400 điểm)', description: 'Mới bắt đầu học TOEIC' },
        { value: 'elementary', label: 'Elementary (405-600 điểm)', description: 'Đã có kiến thức cơ bản' },
        { value: 'intermediate', label: 'Intermediate (605-780 điểm)', description: 'Trình độ trung cấp' },
        { value: 'advanced', label: 'Advanced (785-900 điểm)', description: 'Trình độ khá cao' },
        { value: 'expert', label: 'Expert (905-990 điểm)', description: 'Trình độ chuyên gia' },
    ];

    const validateField = (name, value, all = {}) => {
        switch (name) {
            case 'username': {
                if (!value) return 'Tên đăng nhập là bắt buộc';
                if (value.length < 3 || value.length > 30) return 'Tên đăng nhập phải có từ 3-30 ký tự';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Chỉ gồm chữ, số và gạch dưới';
                return '';
            }
            case 'email': {
                if (!value) return 'Email là bắt buộc';
                const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);
                return emailOk ? '' : 'Email không hợp lệ';
            }
            case 'password': {
                if (!value) return 'Mật khẩu là bắt buộc';
                if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
                if (!/\d/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 số';
                if (!/[a-zA-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái';
                return '';
            }
            case 'confirmPassword': {
                if (!value) return 'Xác nhận mật khẩu là bắt buộc';
                if (value !== all.password) return 'Mật khẩu xác nhận không khớp';
                return '';
            }
            case 'fullName': {
                if (!value) return 'Họ và tên là bắt buộc';
                if (value.length < 2 || value.length > 100) return 'Họ tên phải có từ 2-100 ký tự';
                return '';
            }
            case 'level': {
                if (!value) return 'Vui lòng chọn trình độ';
                if (!levels.find(l => l.value === value)) return 'Trình độ không hợp lệ';
                return '';
            }
            default:
                return '';
        }
    };

    const validateAll = (data) => {
        const errs = {
            username: validateField('username', data.username, data),
            email: validateField('email', data.email, data),
            password: validateField('password', data.password, data),
            confirmPassword: validateField('confirmPassword', data.confirmPassword, data),
            fullName: validateField('fullName', data.fullName, data),
            level: validateField('level', data.level || selectedLevel, data),
        };
        setFieldErrors(errs);
        return Object.values(errs).every((e) => !e);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // realtime validate field
        const msg = validateField(name, value, { ...formData, [name]: value });
        setFieldErrors((prev) => ({ ...prev, [name]: msg }));
        if (!isLogin) {
            const nextData = { ...formData, [name]: value };
            setIsFormValid(validateAll(nextData));
        }
    };

    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
        setFormData((prev) => ({
            ...prev,
            level: level,
        }));
        const msg = validateField('level', level, { ...formData, level });
        setFieldErrors((prev) => ({ ...prev, level: msg }));
        if (!isLogin) {
            const nextData = { ...formData, level };
            setIsFormValid(validateAll(nextData));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const { data } = await api.post('/auth/login', {
                    identifier: formData.email,
                    password: formData.password,
                });
                if (data?.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    // Sync achievements cache to avoid duplicate congrats popup
                    try {
                        const ach = Array.isArray(data.data.user?.achievements) ? data.data.user.achievements : [];
                        localStorage.setItem('achievementsCache', JSON.stringify(ach));
                    } catch {}
                    navigate('/home');
                    return;
                }
                setError(data?.message || 'Đăng nhập thất bại');
            } else {
                // chặn nếu form chưa hợp lệ
                const ok = validateAll({ ...formData, level: formData.level || selectedLevel });
                setIsFormValid(ok);
                if (!ok) {
                    setLoading(false);
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Mật khẩu xác nhận không khớp');
                    return;
                }
                // Nếu không nhập level, dùng selectedLevel
                const level = formData.level || selectedLevel || 'beginner';
                // Nếu thiếu username, có thể suy ra từ email
                const username = formData.username || (formData.email ? formData.email.split('@')[0] : '');
                const { data } = await api.post('/auth/register', {
                    username,
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    level,
                    targetScore: 600,
                });
                if (data?.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                    try {
                        const ach = Array.isArray(data.data.user?.achievements) ? data.data.user.achievements : [];
                        localStorage.setItem('achievementsCache', JSON.stringify(ach));
                    } catch {}
                    navigate('/home');
                    return;
                }
                if (data?.errors && Array.isArray(data.errors)) {
                    setError(data.errors[0]?.msg || data.message || 'Đăng ký thất bại');
                } else {
                    setError(data?.message || 'Đăng ký thất bại');
                }
            }
        } catch (err) {
            setError(err?.message || 'Có lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            level: '',
        });
        setSelectedLevel('');
        setError('');
        setFieldErrors({});
        setIsFormValid(false);
    };

    return (
        <div className={styles.home}>
            <div className={styles.homeContainer}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <div className={styles.penguinMascot}>🐧</div>
                    <h1 className={styles.heroTitle}>
                        Chào mừng đến với <span className={styles.brand}>TOEIC Master</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Nâng cao điểm số TOEIC của bạn cùng với chú chim cánh cụt thông minh!
                    </p>
                </div>

                {/* Auth Form */}
                <div className={styles.authSection}>
                    <div className={styles.authCard}>
                        <div className={styles.authHeader}>
                            <div className={styles.authToggle}>
                                <button
                                    className={clsx(styles.toggleBtn, { [styles.active]: isLogin })}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    className={clsx(styles.toggleBtn, { [styles.active]: !isLogin })}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>

                        <form className={styles.authForm} onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="username">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên đăng nhập"
                                        required
                                    />
                                    {fieldErrors.username && (
                                        <div className={styles.fieldError}>{fieldErrors.username}</div>
                                    )}
                                </div>
                            )}
                            {!isLogin && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên của bạn"
                                        required
                                    />
                                    {fieldErrors.fullName && (
                                        <div className={styles.fieldError}>{fieldErrors.fullName}</div>
                                    )}
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    required
                                />
                                {fieldErrors.email && (
                                    <div className={styles.fieldError}>{fieldErrors.email}</div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                                {fieldErrors.password && (
                                    <div className={styles.fieldError}>{fieldErrors.password}</div>
                                )}
                            </div>

                            {!isLogin && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <div className={styles.fieldError}>{fieldErrors.confirmPassword}</div>
                                    )}
                                </div>
                            )}

                            {!isLogin && (
                                <div className={styles.formGroup}>
                                    <label>Trình độ TOEIC hiện tại</label>
                                    <div className={styles.levelSelection}>
                                        {levels.map((level) => (
                                            <div
                                                key={level.value}
                                                className={clsx(styles.levelCard, {
                                                    [styles.selected]: selectedLevel === level.value,
                                                })}
                                                onClick={() => handleLevelSelect(level.value)}
                                            >
                                                <div className={styles.levelHeader}>
                                                    <div className={styles.levelRadio}>
                                                        <input
                                                            type="radio"
                                                            name="level"
                                                            value={level.value}
                                                            checked={selectedLevel === level.value}
                                                            onChange={() => handleLevelSelect(level.value)}
                                                        />
                                                    </div>
                                                    <div className={styles.levelInfo}>
                                                        <h4 className={styles.levelLabel}>{level.label}</h4>
                                                        <p className={styles.levelDescription}>{level.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {fieldErrors.level && (
                                        <div className={styles.fieldError}>{fieldErrors.level}</div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className={styles.errorText}>{error}</div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading || (!isLogin && !isFormValid) || (isLogin && !(formData.email && formData.password))}
                            >
                                {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                            </button>
                        </form>

                        <div className={styles.authFooter}>
                            <p>
                                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                                <button className={styles.linkBtn} onClick={toggleMode}>
                                    {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
