'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    DragOverlay,
} from '@dnd-kit/core';

import { useJobs, useUpdateJob, filterJobs } from '../hooks/useJobs';
import KanbanColumn from './KanbanColumn';

type Job = {
    id: number;
    title: string;
    company: string;
    status: 'applied' | 'interview' | 'offer' | 'reject';
    created_at: string;
};

const columns: Job['status'][] = [
    'applied',
    'interview',
    'offer',
    'reject',
];

export default function KanbanBoard({
                                        search,
                                        status,
                                        columnTitles,
                                    }: {
    search: string;
    status: string;
    columnTitles: Record<string, string>;
}) {
    const { data: allJobs } = useJobs();
    const updateJob = useUpdateJob();

    const jobs = filterJobs(allJobs || [], search, status);

    const [activeJob, setActiveJob] = useState<Job | null>(null);
    const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // 📱 Detect mobile screen
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 🔥 старт драга
    const handleDragStart = (event: any) => {
        const jobId = Number(event.active.id);
        const job = allJobs?.find((j: Job) => j.id === jobId) || null;

        setActiveJob(job);
    };

    // 🔥 когда тащим над колонкой
    const handleDragOver = (event: any) => {
        const { over } = event;

        if (over) {
            setActiveColumn(over.id);
        } else {
            setActiveColumn(null);
        }
    };

    // 🔥 дроп
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        setActiveJob(null);
        setActiveColumn(null);

        if (!over) return;

        const jobId = Number(active.id);
        const newStatus = over.id;

        updateJob.mutate({
            id: jobId,
            status: newStatus,
        });
    };

    // 📱 Mobile: horizontal scroll layout
    // 🖥️ Desktop: 4 columns grid
    const boardStyles: React.CSSProperties = isMobile ? {
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 16,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.3) transparent',
        WebkitOverflowScrolling: 'touch',
    } : {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
    };

    const columnWidth = isMobile ? { minWidth: '280px', flexShrink: 0 } : {};

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {/* 📊 ДОСКА */}
            <div style={boardStyles}>
                {columns.map((col) => (
                    <div key={col} style={columnWidth}>
                        <KanbanColumn
                            id={col}
                            title={columnTitles[col] || col}
                            jobs={jobs.filter(j => j.status === col)}
                            isActive={activeColumn === col}
                            isMobile={isMobile}
                        />
                    </div>
                ))}
            </div>

            {/* 🚀 ЛЕТАЮЩАЯ КАРТОЧКА */}
            <DragOverlay>
                {activeJob ? (
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            padding: isMobile ? 16 : 12,
                            borderRadius: 12,
                            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
                            transform: 'scale(1.05) rotate(3deg)',
                            color: 'white',
                            border: '2px solid #60a5fa',
                            opacity: 0.95,
                            fontSize: isMobile ? '1rem' : '0.875rem',
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>
                            {activeJob.company}
                        </div>
                        <div style={{ opacity: 0.8 }}>
                            {activeJob.title}
                        </div>
                        <div style={{ opacity: 0.6, marginTop: 4, fontSize: isMobile ? '0.875rem' : '0.75rem' }}>
                            Created: {new Date(activeJob.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}