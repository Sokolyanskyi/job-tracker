'use client';

import { useState, useEffect } from 'react';
import { register, login } from '../../lib/auth';
import { setToken } from '../../lib/token';
import { useRouter } from 'next/navigation';
import { getTranslations, Language } from '../../lib/i18n';

// Eye icon component
const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {visible ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<Language>('en');
    const [isMobile, setIsMobile] = useState(false);
    // Load saved language and detect mobile
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && ['ru', 'en', 'ua'].includes(saved)) {
            setLanguage(saved);
        }

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const t = getTranslations(language);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = t.errors.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t.errors.invalidEmail;
        }

        if (!password) {
            newErrors.password = t.errors.passwordRequired;
        } else if (password.length < 6) {
            newErrors.password = t.errors.passwordMinLength;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        setErrors({});

        if (!validate()) return;

        setLoading(true);

        try {
            await register(email, password);
            // Auto login after registration
            const data = await login(email, password);
            setToken(data.token);
            router.push('/');
        } catch (err: any) {
            setErrors({ general: t.errors.registerFailed });
        } finally {
            setLoading(false);
        }
    };

    const inputContainerStyle = {
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 4,
    };

    const inputStyle = (hasError: boolean) => ({
        width: isMobile ? '100%' : 300,
        maxWidth: 300,
        padding: isMobile ? '14px 18px' : '10px 14px',
        borderRadius: isMobile ? 10 : 8,
        border: `1px solid ${hasError ? '#ef4444' : '#374151'}`,
        background: '#1f2937',
        color: 'white',
        fontSize: isMobile ? 16 : 14,
        outline: 'none',
        transition: 'border-color 0.2s ease',
        minHeight: isMobile ? 48 : 40,
    });

    const errorStyle = {
        color: '#ef4444',
        fontSize: 12,
        marginLeft: 4,
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 16,
                padding: isMobile ? '20px' : '0',
            }}
        >
            <h1 style={{ color: 'white' }}>{t.register}</h1>

            {errors.general && (
                <div style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>
                    {errors.general}
                </div>
            )}

            <div style={inputContainerStyle}>
                <input
                    placeholder={t.email}
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    style={inputStyle(!!errors.email)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
                {errors.email && <span style={errorStyle}>{errors.email}</span>}
            </div>

            <div style={inputContainerStyle}>
                <div style={{ position: 'relative' }}>
                    <input
                        placeholder={t.password}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title={showPassword ? t.hidePassword : t.showPassword}
                    >
                        <EyeIcon visible={showPassword} />
                    </button>
                </div>
                {errors.password && <span style={errorStyle}>{errors.password}</span>}
            </div>

            <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                    width: 150,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 0',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                    if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                }}
            >
                {loading ? '...' : t.register}
            </button>

            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 12 }}>
                {t.haveAccount}{' '}
                <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {t.login}
                </a>
            </p>
        </div>
    );
}
