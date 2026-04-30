import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import db from '../db.js';

const router = express.Router();

router.use(authMiddleware);

// GET - only user's jobs
router.get('/', (req, res) => {
    const userId = req.user.userId;
    const jobs = db.prepare('SELECT * FROM jobs WHERE user_id = ? ORDER BY id DESC').all(userId);
    res.json(jobs);
});

// CREATE
router.post('/', (req, res) => {
    const userId = req.user.userId;
    const { title, company } = req.body;

    const result = db.prepare(
        'INSERT INTO jobs (user_id, title, company, status) VALUES (?, ?, ?, ?)'
    ).run(userId, title, company, 'applied');

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
    res.json(job);
});

// UPDATE
router.put('/:id', (req, res) => {
    const userId = req.user.userId;
    const id = Number(req.params.id);
    const { status } = req.body;

    // Ensure user can only update their own jobs
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(id, userId);
    if (!job) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
});

// DELETE
router.delete('/:id', (req, res) => {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(id, userId);
    if (!job) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    res.json({ success: true });
});

// NOTES
// Get notes for a job
router.get('/:id/notes', (req, res) => {
    const userId = req.user.userId;
    const jobId = Number(req.params.id);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(jobId, userId);
    if (!job) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const notes = db.prepare('SELECT * FROM notes WHERE job_id = ? ORDER BY created_at DESC').all(jobId);
    res.json(notes);
});

// Add note to a job
router.post('/:id/notes', (req, res) => {
    const userId = req.user.userId;
    const jobId = Number(req.params.id);
    const { content } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(jobId, userId);
    if (!job) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    const result = db.prepare('INSERT INTO notes (job_id, content) VALUES (?, ?)').run(jobId, content);
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.json(note);
});

// Update note
router.put('/notes/:noteId', (req, res) => {
    const userId = req.user.userId;
    const noteId = Number(req.params.noteId);
    const { content } = req.body;

    const note = db.prepare(`
        SELECT notes.* FROM notes
        JOIN jobs ON notes.job_id = jobs.id
        WHERE notes.id = ? AND jobs.user_id = ?
    `).get(noteId, userId);

    if (!note) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('UPDATE notes SET content = ? WHERE id = ?').run(content, noteId);
    res.json({ success: true });
});

// Delete note
router.delete('/notes/:noteId', (req, res) => {
    const userId = req.user.userId;
    const noteId = Number(req.params.noteId);

    const note = db.prepare(`
        SELECT notes.* FROM notes
        JOIN jobs ON notes.job_id = jobs.id
        WHERE notes.id = ? AND jobs.user_id = ?
    `).get(noteId, userId);

    if (!note) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
    res.json({ success: true });
});

export default router;