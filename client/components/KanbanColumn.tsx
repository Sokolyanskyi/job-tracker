'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import KanbanCard from './KanbanCard';

const columnColors: Record<string, { bg: string; border: string; glow: string }> = {
    applied: {
        bg: 'rgba(59, 130, 246, 0.08)',
        border: 'rgba(59, 130, 246, 0.3)',
        glow: 'rgba(59, 130, 246, 0.25)',
    },
    interview: {
        bg: 'rgba(234, 179, 8, 0.08)',
        border: 'rgba(234, 179, 8, 0.3)',
        glow: 'rgba(234, 179, 8, 0.25)',
    },
    offer: {
        bg: 'rgba(34, 197, 94, 0.08)',
        border: 'rgba(34, 197, 94, 0.3)',
        glow: 'rgba(34, 197, 94, 0.25)',
    },
    reject: {
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.3)',
        glow: 'rgba(239, 68, 68, 0.25)',
    },
};

export default function KanbanColumn({
                                         id,
                                         title,
                                         jobs,
                                         isActive,
                                         isMobile = false,
                                     }: any) {
    const { setNodeRef } = useDroppable({ id });
    const colors = columnColors[id] || columnColors.applied;

    return (
        <motion.div
            ref={setNodeRef}
            layout
            className="glass"
            animate={{
                backgroundColor: isActive ? colors.bg : 'rgba(30, 41, 59, 0.5)',
                borderColor: isActive ? colors.border : 'rgba(255,255,255,0.05)',
                boxShadow: isActive
                    ? `0 0 25px ${colors.glow}`
                    : '0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
                padding: isMobile ? 16 : 12,
                minHeight: isMobile ? 400 : 500,
                maxHeight: isMobile ? '70vh' : 'none',
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: isMobile ? 14 : 12,
            }}
        >
            <h3
                style={{
                    marginBottom: isMobile ? 16 : 12,
                    textTransform: 'capitalize',
                    color: colors.border,
                    fontWeight: 600,
                    fontSize: isMobile ? '1.1rem' : '1rem',
                }}
            >
                {title}
            </h3>

            {jobs.map((job: any) => (
                <KanbanCard key={job.id} job={job} isMobile={isMobile} />
            ))}
        </motion.div>
    );
}