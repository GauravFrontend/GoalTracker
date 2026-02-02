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
    },

    // Goal endpoints
    getGoals: async (userId: string) => {
        const response = await fetch(`${BASE_URL}/goals?userId=${userId}`);
        return handleResponse(response);
    },

    createGoal: async (data: { userId: string, title: string, type?: 'one-time' | 'recurring', startDate?: string, endDate?: string }) => {
        const response = await fetch(`${BASE_URL}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    toggleGoal: async (goalId: string, date: string) => {
        const response = await fetch(`${BASE_URL}/goals/${goalId}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
        });
        return handleResponse(response);
    },

    updateGoal: async (id: string, updates: any) => {
        const response = await fetch(`${BASE_URL}/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
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
