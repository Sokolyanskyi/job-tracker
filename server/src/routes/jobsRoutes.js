import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import pool from '../db.js';

const router = express.Router();

router.use(authMiddleware);

// GET - only user's jobs
router.get('/', async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query('SELECT * FROM jobs WHERE user_id = $1 ORDER BY id DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CREATE
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const { title, company } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO jobs (user_id, title, company, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, title, company, 'applied']
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    const userId = req.user.userId;
    const id = Number(req.params.id);
    const { status, title, company } = req.body;

    try {
        // Ensure user can only update their own jobs
        const checkResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (status !== undefined) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (title !== undefined) {
            updates.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }

        if (company !== undefined) {
            updates.push(`company = $${paramCount}`);
            values.push(company);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.json({ success: true });
        }

        values.push(id);
        await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);
        res.json({ success: true });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    try {
        const checkResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [id, userId]);
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NOTES
// Get notes for a job
router.get('/:id/notes', async (req, res) => {
    const userId = req.user.userId;
    const jobId = Number(req.params.id);

    try {
        const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [jobId, userId]);
        if (jobResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const notesResult = await pool.query('SELECT * FROM notes WHERE job_id = $1 ORDER BY created_at DESC', [jobId]);
        res.json(notesResult.rows);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add note to a job
router.post('/:id/notes', async (req, res) => {
    const userId = req.user.userId;
    const jobId = Number(req.params.id);
    const { content } = req.body;

    try {
        const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [jobId, userId]);
        if (jobResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await pool.query(
            'INSERT INTO notes (job_id, content) VALUES ($1, $2) RETURNING *',
            [jobId, content]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update note
router.put('/notes/:noteId', async (req, res) => {
    const userId = req.user.userId;
    const noteId = Number(req.params.noteId);
    const { content } = req.body;

    try {
        const noteResult = await pool.query(
            `SELECT notes.* FROM notes
             JOIN jobs ON notes.job_id = jobs.id
             WHERE notes.id = $1 AND jobs.user_id = $2`,
            [noteId, userId]
        );

        if (noteResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('UPDATE notes SET content = $1 WHERE id = $2', [content, noteId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete note
router.delete('/notes/:noteId', async (req, res) => {
    const userId = req.user.userId;
    const noteId = Number(req.params.noteId);

    try {
        const noteResult = await pool.query(
            `SELECT notes.* FROM notes
             JOIN jobs ON notes.job_id = jobs.id
             WHERE notes.id = $1 AND jobs.user_id = $2`,
            [noteId, userId]
        );

        if (noteResult.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;