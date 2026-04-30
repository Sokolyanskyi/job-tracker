'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes, useAddNote, useUpdateNote, useDeleteNote } from '../hooks/useJobs';
import { getTranslations, Language } from '../lib/i18n';

// Handle icon (grip lines)
const HandleIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
    </svg>
);

// Plus icon for adding notes
const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

// Edit icon
const EditIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// Delete icon
const DeleteIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

// Format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function KanbanCard({ job, isMobile = false }: any) {
    const [expanded, setExpanded] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && ['ru', 'en', 'ua'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const t = getTranslations(language);

    const { data: notes } = useNotes(job.id);
    const addNote = useAddNote();
    const updateNote = useUpdateNote();
    const deleteNote = useDeleteNote();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: job.id,
    });

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        addNote.mutate({ jobId: job.id, content: newNote });
        setNewNote('');
    };

    const handleUpdateNote = (noteId: number) => {
        if (!editContent.trim()) return;
        updateNote.mutate({ noteId, jobId: job.id, content: editContent });
        setEditingNote(null);
        setEditContent('');
    };

    const handleDeleteNote = (noteId: number) => {
        deleteNote.mutate({ noteId, jobId: job.id });
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
                background: '#1e293b',
                padding: isMobile ? 16 : 12,
                marginBottom: isMobile ? 12 : 10,
                borderRadius: isMobile ? 14 : 12,
                cursor: isDragging ? 'grabbing' : 'grab',
                border: '1px solid #374151',
                position: 'relative',
            }}
        >
            {/* Drag handle */}
            <div
                {...listeners}
                {...attributes}
                style={{
                    position: 'absolute',
                    top: isMobile ? 12 : 8,
                    right: isMobile ? 12 : 8,
                    color: '#6b7280',
                    cursor: 'grab',
                    padding: isMobile ? 8 : 4,
                    borderRadius: 4,
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.background = 'transparent';
                }}
            >
                <HandleIcon size={isMobile ? 24 : 20} />
            </div>

            {/* Card content */}
            <div style={{ paddingRight: isMobile ? 40 : 24 }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: isMobile ? '1rem' : '0.875rem' }}>
                    {job.company}
                </div>
                <div style={{ fontSize: isMobile ? '0.875rem' : '0.75rem', opacity: 0.7, color: '#9ca3af', marginTop: 4 }}>
                    {job.title}
                </div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.625rem', opacity: 0.5, color: '#6b7280', marginTop: isMobile ? 8 : 6 }}>
                    {t.created}: {formatDate(job.created_at)}
                </div>
            </div>

            {/* Expand button */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '6px 0',
                    background: 'transparent',
                    border: '1px solid #374151',
                    borderRadius: 6,
                    color: '#9ca3af',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.color = '#9ca3af';
                }}
            >
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </motion.div>
                {expanded ? t.collapse : t.notes}
                {notes && notes.length > 0 && (
                    <span style={{
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: 10,
                        padding: '1px 6px',
                        fontSize: 10,
                    }}>
                        {notes.length}
                    </span>
                )}
            </button>

            {/* Accordion content - Notes */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151' }}>
                            {/* Notes list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {notes?.map((note: any) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{
                                            background: '#0f172a',
                                            padding: 8,
                                            borderRadius: 6,
                                            border: '1px solid #1e293b',
                                        }}
                                    >
                                        {editingNote === note.id ? (
                                            <div>
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: 6,
                                                        borderRadius: 4,
                                                        border: '1px solid #374151',
                                                        background: '#1e2937',
                                                        color: 'white',
                                                        fontSize: 12,
                                                        resize: 'none',
                                                        minHeight: 60,
                                                    }}
                                                    autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                                    <button
                                                        onClick={() => handleUpdateNote(note.id)}
                                                        style={{
                                                            padding: '4px 12px',
                                                            background: '#3b82f6',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            color: 'white',
                                                            fontSize: 11,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {t.save}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingNote(null);
                                                            setEditContent('');
                                                        }}
                                                        style={{
                                                            padding: '4px 12px',
                                                            background: 'transparent',
                                                            border: '1px solid #6b7280',
                                                            borderRadius: 4,
                                                            color: '#9ca3af',
                                                            fontSize: 11,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {t.cancel}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ fontSize: 12, color: '#e5e7eb', wordBreak: 'break-word' }}>
                                                    {note.content}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginTop: 6,
                                                }}>
                                                    <span style={{ fontSize: 10, color: '#6b7280' }}>
                                                        {formatDate(note.created_at)}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingNote(note.id);
                                                                setEditContent(note.content);
                                                            }}
                                                            style={{
                                                                padding: 4,
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#6b7280',
                                                                cursor: 'pointer',
                                                                borderRadius: 4,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = '#3b82f6';
                                                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = '#6b7280';
                                                                e.currentTarget.style.background = 'transparent';
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            style={{
                                                                padding: 4,
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#6b7280',
                                                                cursor: 'pointer',
                                                                borderRadius: 4,
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = '#ef4444';
                                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = '#6b7280';
                                                                e.currentTarget.style.background = 'transparent';
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Add new note */}
                            <div style={{ marginTop: 12 }}>
                                <textarea
                                    placeholder={t.notePlaceholder}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        borderRadius: 6,
                                        border: '1px solid #374151',
                                        background: '#1e2937',
                                        color: 'white',
                                        fontSize: 12,
                                        resize: 'none',
                                        minHeight: 60,
                                    }}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim() || addNote.isPending}
                                    style={{
                                        width: '100%',
                                        marginTop: 8,
                                        padding: '8px 0',
                                        background: newNote.trim() ? '#3b82f6' : '#374151',
                                        border: 'none',
                                        borderRadius: 6,
                                        color: 'white',
                                        fontSize: 12,
                                        cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <PlusIcon />
                                    {t.addNote}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}