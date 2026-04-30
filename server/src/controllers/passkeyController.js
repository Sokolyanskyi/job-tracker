import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';
const RP_NAME = 'Job Tracker';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

// Generate registration options for new passkey
export const generateRegistration = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        // If user doesn't exist, create a new one with a random password (passkey-only auth)
        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            const result = db.prepare(
                'INSERT INTO users (email, password) VALUES (?, ?)'
            ).run(email, randomPassword);
            user = { id: result.lastInsertRowid, email };
        }

        // Get existing credentials for this user
        const existingCredentials = db.prepare(
            'SELECT credential_id as id FROM passkey_credentials WHERE user_id = ?'
        ).all(user.id);

        console.log('Generating registration options for user:', user.id, 'email:', email);
        console.log('Existing credentials:', existingCredentials.length);

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: new TextEncoder().encode(String(user.id)),
            userName: user.email,
            userDisplayName: user.email,
            attestationType: 'none',
            excludeCredentials: existingCredentials,
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        console.log('Generated options, challenge:', options.challenge);

        // Store challenge temporarily (in production use Redis, here use simple in-memory or DB)
        db.prepare(
            'UPDATE users SET reset_token = ? WHERE id = ?'
        ).run(options.challenge, user.id);

        res.json({
            options,
            userId: user.id,
        });
    } catch (error) {
        console.error('Generate registration error:', error);
        res.status(500).json({ message: 'Failed to generate registration options', error: error.message });
    }
};

// Verify and save passkey registration
export const verifyRegistration = async (req, res) => {
    const { email, response, deviceName } = req.body;

    if (!email || !response) {
        return res.status(400).json({ message: 'Email and response are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Get the challenge from the user record
    const expectedChallenge = user.reset_token;

    if (!expectedChallenge) {
        return res.status(400).json({ message: 'Registration challenge not found' });
    }

    try {
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;

            // Save the credential
            db.prepare(
                `INSERT INTO passkey_credentials 
                 (user_id, credential_id, public_key, counter, device_name) 
                 VALUES (?, ?, ?, ?, ?)`
            ).run(
                user.id,
                credential.id,
                Buffer.from(credential.publicKey),
                credential.counter,
                deviceName || 'Unknown Device'
            );

            // Clear the challenge
            db.prepare('UPDATE users SET reset_token = NULL WHERE id = ?').run(user.id);

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                verified: true,
                token,
                user: { id: user.id, email: user.email },
            });
        } else {
            res.status(400).json({ message: 'Verification failed' });
        }
    } catch (error) {
        console.error('Registration verification error:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};

// Generate authentication options
export const generateAuthentication = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        // Don't reveal if user exists
        return res.status(404).json({ message: 'User not found' });
    }

    // Get user's credentials
    const credentials = db.prepare(
        'SELECT credential_id as id FROM passkey_credentials WHERE user_id = ?'
    ).all(user.id);

    if (credentials.length === 0) {
        return res.status(400).json({
            message: 'No passkeys found for this user. Please register a passkey first.',
        });
    }

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: credentials,
        userVerification: 'preferred',
    });

    // Store challenge
    db.prepare(
        'UPDATE users SET reset_token = ? WHERE id = ?'
    ).run(options.challenge, user.id);

    res.json({ options });
};

// Verify passkey authentication
export const verifyAuthentication = async (req, res) => {
    const { email, response } = req.body;

    if (!email || !response) {
        return res.status(400).json({ message: 'Email and response are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Get the credential
    const credential = db.prepare(
        'SELECT * FROM passkey_credentials WHERE credential_id = ? AND user_id = ?'
    ).get(response.id, user.id);

    if (!credential) {
        return res.status(400).json({ message: 'Credential not found' });
    }

    const expectedChallenge = user.reset_token;

    if (!expectedChallenge) {
        return res.status(400).json({ message: 'Authentication challenge not found' });
    }

    try {
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: credential.credential_id,
                credentialPublicKey: new Uint8Array(credential.public_key),
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            // Update counter
            db.prepare(
                'UPDATE passkey_credentials SET counter = ?, last_used_at = datetime("now") WHERE id = ?'
            ).run(verification.authenticationInfo.newCounter, credential.id);

            // Clear challenge
            db.prepare('UPDATE users SET reset_token = NULL WHERE id = ?').run(user.id);

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                verified: true,
                token,
                user: { id: user.id, email: user.email },
            });
        } else {
            res.status(400).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Authentication verification error:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};

// Get user's passkeys
export const listPasskeys = async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const passkeys = db.prepare(
        `SELECT id, credential_id, device_name, created_at, last_used_at 
         FROM passkey_credentials 
         WHERE user_id = ? 
         ORDER BY last_used_at DESC`
    ).all(userId);

    res.json(passkeys);
};

// Delete a passkey
export const deletePasskey = async (req, res) => {
    const userId = req.user?.userId;
    const { credentialId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    db.prepare(
        'DELETE FROM passkey_credentials WHERE credential_id = ? AND user_id = ?'
    ).run(credentialId, userId);

    res.json({ message: 'Passkey deleted' });
};
