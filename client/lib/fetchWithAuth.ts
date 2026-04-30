import { getToken } from './token';

export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
) {
    const token = getToken();

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status === 401) {
        // 🔥 если нет токена → кидаем на логин
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    return res;
}