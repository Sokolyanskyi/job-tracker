'use client';

import { useState, useEffect } from 'react';
import { requestPasswordReset } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { getTranslations, Language } from '../../lib/i18n';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<Language>('en');
    const [devToken, setDevToken] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && ['ru', 'en', 'ua'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const t = getTranslations(language);

    const validate = () => {
        if (!email.trim()) {
            return t.errors.emailRequired;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return t.errors.invalidEmail;
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

        setLoading(true);

        try {
            const data = await requestPasswordReset(email);
            console.log('Response data:', data);
            alert('devToken: ' + (data.devToken || 'NOT FOUND'));
            setSuccess(true);
            if (data.devToken) {
                setDevToken(data.devToken);
            }
        } catch (err: any) {
            setError(err.message || t.errors.resetFailed);
        } finally {
            setLoading(false);
        }
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
            }}
        >
            <h1 style={{ color: 'white' }}>{t.forgotPassword}</h1>

            {success ? (
                <div style={{ textAlign: 'center', maxWidth: 350 }}>
                    <div style={{ color: '#22c55e', marginBottom: 16 }}>
                        {t.resetLinkSent}
                    </div>
                    {devToken && (
                        <div style={{ marginBottom: 16, padding: 12, background: '#1f2937', borderRadius: 8 }}>
                            <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>
                                Dev mode - click or copy token:
                            </p>
                            <code style={{ color: '#22c55e', fontSize: 12, wordBreak: 'break-all' }}>
                                {devToken}
                            </code>
                            <br/><br/>
                            <a
                                href={`/reset-password?token=${devToken}`}
                                style={{
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    fontSize: 14,
                                }}
                            >
                                → Reset Password
                            </a>
                        </div>
                    )}
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
                        {t.backToLogin}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder={t.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        disabled={loading}
                        style={{
                            padding: '12px 0',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            border: 'none',
                            borderRadius: 10,
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? '...' : t.sendResetLink}
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
