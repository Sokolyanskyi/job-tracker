'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword, verifyResetToken } from '../../lib/auth';
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

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && ['ru', 'en', 'ua'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const t = getTranslations(language);

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setError(t.invalidToken);
            return;
        }

        verifyResetToken(token)
            .then(() => {
                setIsValid(true);
                setValidating(false);
            })
            .catch(() => {
                setValidating(false);
                setError(t.invalidToken);
            });
    }, [token, t]);

    const validate = () => {
        if (!password) {
            return t.errors.passwordRequired;
        }
        if (password.length < 6) {
            return t.errors.passwordMinLength;
        }
        if (password !== confirmPassword) {
            return language === 'ru' ? 'Пароли не совпадают' : language === 'ua' ? 'Паролі не співпадають' : 'Passwords do not match';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!token) return;

        setLoading(true);

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || t.errors.serverError);
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ color: '#9ca3af' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 16,
            }}
        >
            <h1 style={{ color: 'white' }}>{t.resetPassword}</h1>

            {success ? (
                <div style={{ textAlign: 'center', maxWidth: 300 }}>
                    <div style={{ color: '#22c55e', marginBottom: 16 }}>
                        {t.passwordResetSuccess}
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: 8,
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        {t.login}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t.newPassword}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                paddingRight: 44,
                                borderRadius: 8,
                                border: `1px solid ${error ? '#ef4444' : '#374151'}`,
                                background: '#1f2937',
                                color: 'white',
                                fontSize: 14,
                                boxSizing: 'border-box',
                            }}
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
                            }}
                        >
                            <EyeIcon visible={showPassword} />
                        </button>
                    </div>

                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'ru' ? 'Подтвердите пароль' : language === 'ua' ? 'Підтвердіть пароль' : 'Confirm password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${error ? '#ef4444' : '#374151'}`,
                            background: '#1f2937',
                            color: 'white',
                            fontSize: 14,
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        style={{
                            padding: '12px 0',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            border: 'none',
                            borderRadius: 10,
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 500,
                            cursor: loading || !isValid ? 'not-allowed' : 'pointer',
                            opacity: loading || !isValid ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? '...' : t.resetPasswordButton}
                    </button>

                    <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                        <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                            {t.backToLogin}
                        </a>
                    </p>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ color: '#9ca3af' }}>Loading...</div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
