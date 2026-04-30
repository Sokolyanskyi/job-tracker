const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/auth';

export async function login(email: string, password: string) {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error('Login error');

    return res.json();
}

export async function register(email: string, password: string) {
    const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Register error: ${res.status}`);
    }
}

// PASSWORD RESET

export async function requestPasswordReset(email: string) {
    const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to request password reset');
    }

    return res.json();
}

export async function verifyResetToken(token: string) {
    const res = await fetch(`${API}/verify-reset-token?token=${token}`, {
        method: 'GET',
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid or expired token');
    }

    return res.json();
}

export async function resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reset password');
    }

    return res.json();
}