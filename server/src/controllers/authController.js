import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const SECRET = 'supersecret';

// Create test user if not exists
const testPassword = await bcrypt.hash('test123', 10);
try {
    db.prepare('INSERT OR IGNORE INTO users (id, email, password) VALUES (1, ?, ?)')
        .run('test@test.com', testPassword);
} catch (e) {
    // ignore
}

export const register = async (req, res) => {
    const { email, password } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        return res.status(400).json({ message: 'User exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)')
        .run(email, hash);

    res.json({ success: true, userId: result.lastInsertRowid });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
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

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        // Don't reveal if user exists
        return res.json({ message: 'If account exists, reset instructions sent' });
    }

    const token = generateResetToken();
    const expires = Date.now() + 3600000; // 1 hour

    // Save reset token
    db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
        .run(token, expires, user.id);

    // In development, return token in response
    // In production, send email
    console.log(`Password reset token for ${email}: ${token}`);

    res.json({
        message: 'Password reset instructions sent to email',
        // Only in development:
        devToken: token
    });
};

// Reset password with token
export const verifyResetToken = async (req, res) => {
    const { token } = req.query;

    const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
    if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    if (Date.now() > user.reset_token_expires) {
        return res.status(400).json({ message: 'Token expired' });
    }

    res.json({ valid: true });
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (Date.now() > user.reset_token_expires) {
        return res.status(400).json({ message: 'Token expired' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
        .run(hash, user.id);

    res.json({ message: 'Password reset successful' });
};