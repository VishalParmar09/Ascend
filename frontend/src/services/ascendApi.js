const API_BASE_URL = "http://localhost:8085/api/v1";

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

    // 2. Fetch Hunter Profile (Level, Rank, Total XP, Attributes)
    async getProfile(username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/hunters/profile?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error(`Failed to load profile: ${res.statusText}`);
        return await res.json();
    },

    // 3. Fetch Today's Daily Quests from PostgreSQL
    async getTodayQuests(username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/quests?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error(`Failed to load quests: ${res.statusText}`);
        return await res.json();
    },

    // 4. Mark Quest as Complete (Awards Server-Side XP & evaluates level up)
    async completeQuest(questId, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/quests/${questId}/complete?username=${encodeURIComponent(username)}`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error(`Failed to complete quest: ${res.statusText}`);
        return await res.json();
    },

    // 5. Log Completed Workout Session
    async logWorkout(workoutData, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/workouts/log?username=${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutData),
        });
        if (!res.ok) throw new Error(`Failed to log workout: ${res.statusText}`);
        return await res.json();
    },

    // 6. Recalibrate Hunter after Awakening or Rank Promotion Exam
    async recalibrateHunter(recalibrateData, username = 'ShadowMonarch') {
        const res = await fetch(`${API_BASE_URL}/hunters/recalibrate?username=${encodeURIComponent(username)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recalibrateData),
        });
        if (!res.ok) throw new Error(`Failed to recalibrate: ${res.statusText}`);
        return await res.json();
    },
}