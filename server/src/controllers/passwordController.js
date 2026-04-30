import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import db from '../db.js';

// Create email transporter (configure with your email service)
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

// Request password reset
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        // Don't reveal if user exists
        return res.json({ message: 'If this email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    db.prepare(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?'
    ).run(resetToken, resetTokenExpires.toISOString(), user.id);

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Job Tracker <noreply@jobtracker.com>',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>You requested a password reset for your Job Tracker account.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Or copy this link: ${resetUrl}</p>
            `,
        });

        res.json({ message: 'If this email exists, a reset link has been sent' });
    } catch (error) {
        console.error('Email sending failed:', error);
        // Fallback: return the token in response for development
        res.json({
            message: 'Email service not configured. Use this link:',
            resetUrl,
            token: resetToken,
        });
    }
};

// Verify reset token and reset password
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = db.prepare(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")'
    ).get(token);

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    db.prepare(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?'
    ).run(hashedPassword, user.id);

    res.json({ message: 'Password has been reset successfully' });
};

// Verify token (for frontend validation)
export const verifyResetToken = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    const user = db.prepare(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")'
    ).get(token);

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ valid: true });
};
