const API_BASE_URL = "http://localhost:8085/api/v1";

function getAuthHeaders() {
    const token = localStorage.getItem('ascend_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const ascendApi = {
    // 1. Health check to detect if Spring Boot is online
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE_URL}/system/status`, { signal: AbortSignal.timeout(2000) });
            if (!res.ok) return false;
            const data = await res.json();
            return data.status === 'Online';
        } catch {
            return false;
        }
    },

    // 2. Authentication: Register new Hunter Recruit
    async register(registerData) {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Registration failed: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('ascend_token', data.token);
        }
        return data;
    },

    // 3. Authentication: Login & obtain JWT Bearer Token
    async login(loginData) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Login failed: ${res.statusText}`);
        }
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('ascend_token', data.token);
        }
        return data;
    },

    logout() {
        localStorage.removeItem('ascend_token');
    },

    getToken() {
        return localStorage.getItem('ascend_token');
    },

    // 4. Fetch Hunter Profile (Level, Rank, Total XP, Attributes) with JWT
    async getProfile(username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/hunters/profile?username=${encodeURIComponent(username)}`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        if (!res.ok) throw new Error(`Failed to load profile: ${res.statusText}`);
        return await res.json();
    },

    // 5. Fetch Today's Daily Quests from PostgreSQL with JWT
    async getTodayQuests(username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/quests?username=${encodeURIComponent(username)}`, {
            headers: {
                ...getAuthHeaders(),
            },
        });
        if (!res.ok) throw new Error(`Failed to load quests: ${res.statusText}`);
        return await res.json();
    },

    // 6. Mark Quest as Complete (Awards Server-Side XP & evaluates level up) with JWT
    async completeQuest(questId, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/quests/${questId}/complete?username=${encodeURIComponent(username)}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
            },
        });
        if (!res.ok) throw new Error(`Failed to complete quest: ${res.statusText}`);
        return await res.json();
    },

    // 7. Log Completed Workout Session with JWT
    async logWorkout(workoutData, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/workouts/log?username=${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(workoutData),
        });
        if (!res.ok) throw new Error(`Failed to log workout: ${res.statusText}`);
        return await res.json();
    },

    // 8. Recalibrate Hunter after Awakening or Rank Promotion Exam with JWT
    async recalibrateHunter(recalibrateData, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/hunters/recalibrate?username=${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(recalibrateData),
        });
        if (!res.ok) throw new Error(`Failed to recalibrate: ${res.statusText}`);
        return await res.json();
    },
};
