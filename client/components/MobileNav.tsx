'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Language = 'ru' | 'en' | 'ua';

interface MobileNavProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
    onLogout: () => void;
    t: {
        language: string;
        logout: string;
    };
}

const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'ua', label: 'Українська' },
];

export default function MobileNav({ language, onLanguageChange, onLogout, t }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    zIndex: 1000,
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isOpen ? (
                        <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                        <>
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </>
                    )}
                </svg>
            </button>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 20,
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#1f2937',
                                borderRadius: 16,
                                padding: 24,
                                width: '100%',
                                maxWidth: 300,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ color: 'white', marginBottom: 20, textAlign: 'center' }}>
                                {t.language}
                            </h3>

                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onLanguageChange(lang.code as Language);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '14px 16px',
                                        marginBottom: 8,
                                        background: language === lang.code ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        border: 'none',
                                        borderRadius: 10,
                                        color: language === lang.code ? '#3b82f6' : 'white',
                                        fontSize: 16,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    {lang.label}
                                </button>
                            ))}

                            <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '20px 0' }} />

                            <button
                                onClick={onLogout}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: 'transparent',
                                    border: '1px solid #ef4444',
                                    borderRadius: 10,
                                    color: '#ef4444',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                }}
                            >
                                {t.logout}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
