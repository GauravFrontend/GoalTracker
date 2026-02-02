// --- CONFIGURATION ---
const IS_PROD = true; // Set to true to use the Ngrok URL
const PROD_URL = 'https://paulita-ungovernmental-subangulately.ngrok-free.dev/api'; // Replace with your generated Ngrok URL
const LOCAL_URL = 'http://localhost:5000/api';

const BASE_URL = IS_PROD ? PROD_URL : LOCAL_URL;

// Helper to add headers automatically
const getHeaders = (isJson = false) => {
    const headers: Record<string, string> = {
        'ngrok-skip-browser-warning': 'true', // Bypasses ngrok warning page
    };
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export const api = {
    // Auth endpoints
    login: async (credentials: any) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    getUser: async (userId: string) => {
        const response = await fetch(`${BASE_URL}/me?userId=${userId}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    register: async (credentials: any) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Goal endpoints
    getGoals: async (userId: string) => {
        const response = await fetch(`${BASE_URL}/goals?userId=${userId}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    createGoal: async (data: { userId: string, title: string, type?: 'one-time' | 'recurring', startDate?: string, endDate?: string }) => {
        const response = await fetch(`${BASE_URL}/goals`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    toggleGoal: async (goalId: string, date: string) => {
        const response = await fetch(`${BASE_URL}/goals/${goalId}/toggle`, {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify({ date }),
        });
        return handleResponse(response);
    },

    catchUp: async (goalId: string, date: string, userId: string) => {
        const response = await fetch(`${BASE_URL}/goals/${goalId}/catchup`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ date, userId }),
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
