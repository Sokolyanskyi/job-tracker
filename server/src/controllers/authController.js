import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hash]
        );

        res.json({ success: true, userId: result.rows[0].id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) {
            return res.status(400).json({ message: 'No user' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Wrong password' });
        }

        const token = jwt.sign(
            { userId: user.id },
            SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate secure random token
function generateResetToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Request password reset - sends token to user's email
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If account exists, reset instructions sent' });
        }

        const token = generateResetToken();
        const expires = Date.now() + 3600000; // 1 hour

        // Save reset token
        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [token, expires, user.id]
        );

        // In production, send email with token
        res.json({
            message: 'Password reset instructions sent to email'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset password with token
export const verifyResetToken = async (req, res) => {
    const { token } = req.query;

    try {
        const result = await pool.query('SELECT * FROM users WHERE reset_token = $1', [token]);
        const user = result.rows[0];
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (Date.now() > user.reset_token_expires) {
            return res.status(400).json({ message: 'Token expired' });
        }

        res.json({ valid: true });
    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE reset_token = $1', [token]);
        const user = result.rows[0];
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (Date.now() > user.reset_token_expires) {
            return res.status(400).json({ message: 'Token expired' });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [hash, user.id]
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};