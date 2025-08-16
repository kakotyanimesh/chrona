export interface PauseSession {
    pauseTime: string; // Time when paused (e.g., "2:20 AM")
    studyDuration: number; // Seconds studied in this session
}

export interface DailyLog {
    date: string;
    totalSeconds: number;
    pauseSessions: PauseSession[];
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setToLocalStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Handle localStorage errors silently
    }
}

export function getDailyLogs(): DailyLog[] {
    return getFromLocalStorage<DailyLog[]>("dailyLogs", []);
}

export function saveDailyLogs(logs: DailyLog[]): void {
    setToLocalStorage("dailyLogs", logs);
}

export function getCurrentSession(): {
    seconds: number;
    isRunning: boolean;
    lastStartTime: number | null;
} {
    return getFromLocalStorage("currentSession", {
        seconds: 0,
        isRunning: false,
        lastStartTime: null,
    });
}

export function saveCurrentSession(session: {
    seconds: number;
    isRunning: boolean;
    lastStartTime: number | null;
}): void {
    setToLocalStorage("currentSession", session);
}
