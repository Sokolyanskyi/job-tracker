'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import KanbanBoard from '../components/KanbanBoard';
import MobileNav from '../components/MobileNav';
import { useAddJob } from '../hooks/useJobs';
import { getToken, removeToken } from '../lib/token';
import { getTranslations, Language } from '../lib/i18n';

export default function Home() {
    const router = useRouter();
    const addJob = useAddJob();

    const [form, setForm] = useState({
        title: '',
        company: '',
    });

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [menuOpen, setMenuOpen] = useState(false);
    const [language, setLanguage] = useState<Language>('en');
    const [isMobile, setIsMobile] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Save language on change
    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = getTranslations(language);

    // 🔥 если нет токена → на логин
    useEffect(() => {
        const token = getToken();

        if (!token) {
            router.push('/login');
        }
    }, []);

    // Click outside to close menu
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        removeToken();
        router.push('/login');
    };

    const [formErrors, setFormErrors] = useState<{ title?: string; company?: string }>({});

    const validateForm = () => {
        const errors: { title?: string; company?: string } = {};

        if (!form.title.trim()) {
            errors.title = language === 'ru' ? 'Введите должность' : language === 'ua' ? 'Введіть посаду' : 'Enter job title';
        }

        if (!form.company.trim()) {
            errors.company = language === 'ru' ? 'Введите компанию' : language === 'ua' ? 'Введіть компанію' : 'Enter company name';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        addJob.mutate(form);
        setForm({ title: '', company: '' });
        setFormErrors({});
    };

    return (
        <div style={{ padding: 20, position: 'relative' }}>
            {/* Settings Gear - Top Right */}
            <div ref={menuRef} style={{ position: 'absolute', top: isMobile ? 16 : 20, right: isMobile ? 16 : 20, zIndex: 100 }}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: isMobile ? 12 : 8,
                        borderRadius: isMobile ? 10 : 8,
                        transition: 'all 0.2s ease',
                        minHeight: isMobile ? 44 : 40,
                        minWidth: isMobile ? 44 : 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    {/* Gear Icon SVG */}
                    <svg
                        width={isMobile ? 28 : 24}
                        height={isMobile ? 28 : 24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                        }}
                    >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 10 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 8,
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: 12,
                                padding: 16,
                                minWidth: 200,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                                zIndex: 100,
                            }}
                        >
                            {/* Language Selection */}
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {t.language}
                                </p>
                                {[
                                    { code: 'ru', label: 'Русский' },
                                    { code: 'en', label: 'English' },
                                    { code: 'ua', label: 'Українська' },
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code as Language)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            marginBottom: 4,
                                            background: language === lang.code ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                            border: 'none',
                                            borderRadius: 6,
                                            color: language === lang.code ? '#3b82f6' : 'white',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (language !== lang.code) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (language !== lang.code) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: '#374151', marginBottom: 16 }} />

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '12px 0',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                                }}
                            >
                                {t.logout}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <h1 style={{ color: 'white', marginTop: 20 }}>{t.appTitle}</h1>

            {/* ➕ ADD */}
            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 8 : 12,
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? 16 : 20,
                    maxWidth: isMobile ? '100%' : 600,
                    width: '100%',
                }}
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                    <input
                        placeholder={t.titlePlaceholder}
                        value={form.title}
                        onChange={(e) => {
                            setForm({ ...form, title: e.target.value });
                            if (formErrors.title) setFormErrors({ ...formErrors, title: undefined });
                        }}
                        style={{
                            flex: 1,
                            minWidth: isMobile ? '100%' : 150,
                            padding: isMobile ? '12px 16px' : '10px 14px',
                            borderRadius: isMobile ? 10 : 8,
                            border: `1px solid ${formErrors.title ? '#ef4444' : '#374151'}`,
                            background: '#1f2937',
                            color: 'white',
                            fontSize: isMobile ? 16 : 14,
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            minHeight: isMobile ? 44 : 40,
                        }}
                    />
                    {formErrors.title && (
                        <span style={{ color: '#ef4444', fontSize: isMobile ? 14 : 12 }}>{formErrors.title}</span>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                    <input
                        placeholder={t.companyPlaceholder}
                        value={form.company}
                        onChange={(e) => {
                            setForm({ ...form, company: e.target.value });
                            if (formErrors.company) setFormErrors({ ...formErrors, company: undefined });
                        }}
                        style={{
                            flex: 1,
                            minWidth: isMobile ? '100%' : 150,
                            padding: isMobile ? '12px 16px' : '10px 14px',
                            borderRadius: isMobile ? 10 : 8,
                            border: `1px solid ${formErrors.company ? '#ef4444' : '#374151'}`,
                            background: '#1f2937',
                            color: 'white',
                            fontSize: isMobile ? 16 : 14,
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            minHeight: isMobile ? 44 : 40,
                        }}
                    />
                    {formErrors.company && (
                        <span style={{ color: '#ef4444', fontSize: isMobile ? 14 : 12 }}>{formErrors.company}</span>
                    )}
                </div>

                <button
                    type="submit"
                    style={{
                        padding: isMobile ? '12px 24px' : '10px 20px',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: isMobile ? 10 : 8,
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: isMobile ? 16 : 14,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        marginTop: isMobile ? 8 : 0,
                        width: isMobile ? '100%' : 'auto',
                        minHeight: isMobile ? 44 : 40,
                    }}
                >
                    {t.addButton}
                </button>
            </form>

            {/* 🔍 FILTER */}
            <input
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}
            />

            <KanbanBoard search={search} status={status} columnTitles={t.columns} />

            {/* Mobile Navigation */}
            {isMobile && (
                <MobileNav
                    language={language}
                    onLanguageChange={(lang) => {
                        setLanguage(lang);
                        localStorage.setItem('language', lang);
                    }}
                    onLogout={() => {
                        removeToken();
                        router.push('/login');
                    }}
                    t={{
                        language: t.language,
                        logout: t.logout,
                    }}
                />
            )}
        </div>
    );
}