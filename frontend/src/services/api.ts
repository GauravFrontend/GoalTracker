const BASE_URL = 'http://localhost:5000/api';

export const api = {
    // Auth endpoints
    login: async (credentials: any) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    register: async (credentials: any) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch(`${BASE_URL}/logout`, { method: 'POST' });
        return handleResponse(response);
    }
};

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        throw { message: data.error || 'Something went wrong', status: response.status };
    }
    return data;
}
