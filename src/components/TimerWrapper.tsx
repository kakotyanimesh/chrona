'use client';

import { useEffect, useRef, useCallback, useReducer, useState } from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import LogsList from './LogsList';
import { AlarmSettingsPanel } from './AlarmSettings';
import { Button } from './ui/Button';
import { Bell, X } from 'lucide-react';
import { getTodayDate } from '@/utils/getTodayDate';
import {
    getDailyLogs,
    saveDailyLogs,
    getCurrentSession,
    saveCurrentSession,
    DailyLog,
    getAlarmSettings,
    saveAlarmSettings,
} from '@/utils/localStorageHelpers';
import Link from 'next/link';
import { FullscreenButton } from './ui/FullscreenButton';

type TimerState = {
    totalSeconds: number;
    isRunning: boolean;
    segmentStartSeconds: number;
    segmentStartedAt: number | null; // timestamp ms
};

type TimerAction =
    | { type: 'INIT'; payload: TimerState }
    | { type: 'START'; payload: { startedAt: number } }
    | { type: 'STOP' }
    | { type: 'RESTART' }
    | { type: 'TICK' };

const initialState: TimerState = {
    totalSeconds: 0,
    isRunning: false,
    segmentStartSeconds: 0,
    segmentStartedAt: null,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
        case 'INIT':
            return { ...state, ...action.payload };
        case 'START':
            return {
                ...state,
                isRunning: true,
                segmentStartedAt: action.payload.startedAt,
                segmentStartSeconds: state.totalSeconds,
            };
        case 'STOP':
            return {
                ...state,
                isRunning: false,
                segmentStartedAt: null,
            };
        case 'RESTART':
            return {
                totalSeconds: 0,
                isRunning: false,
                segmentStartSeconds: 0,
                segmentStartedAt: null,
            };
        case 'TICK':
            return state.isRunning
                ? { ...state, totalSeconds: state.totalSeconds + 1 }
                : state;
        default:
            return state;
    }
}

export default function TimerWrapper() {
    const [state, dispatch] = useReducer(timerReducer, initialState);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [exportMessage, setExportMessage] = useState<string | null>(null);
    const [alarmSettings, setAlarmSettings] = useState(getAlarmSettings());
    const lastAlarmCountRef = useRef(0);
    const [showAlarmPanel, setShowAlarmPanel] = useState(false);

    const { totalSeconds, isRunning, segmentStartSeconds, segmentStartedAt } = state;

    // Load initial state from localStorage
    useEffect(() => {
        const session = getCurrentSession();
        const logs = getDailyLogs();

        let totalSeconds = session.seconds;
        let segmentStartedAt = session.lastStartTime;
        let segmentStartSeconds = session.seconds;

        if (session.isRunning && session.lastStartTime) {
            const elapsed = Math.floor((Date.now() - session.lastStartTime) / 1000);
            totalSeconds += elapsed;
            segmentStartedAt = session.lastStartTime;
            segmentStartSeconds = Math.max(session.seconds, totalSeconds - elapsed);
        }

        dispatch({
            type: 'INIT',
            payload: {
                totalSeconds,
                isRunning: session.isRunning && !!segmentStartedAt,
                segmentStartSeconds,
                segmentStartedAt: session.isRunning ? segmentStartedAt : null,
            },
        });

        setDailyLogs(logs);
        setAlarmSettings(getAlarmSettings());
    }, []);

    // Timer effect
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                dispatch({ type: 'TICK' });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    // Persist session state
    useEffect(() => {
        saveCurrentSession({
            seconds: totalSeconds,
            isRunning,
            lastStartTime: segmentStartedAt,
        });
    }, [totalSeconds, isRunning, segmentStartedAt]);

    // Persist alarm settings when they change
    useEffect(() => {
        saveAlarmSettings(alarmSettings);
        // Reset alarm counter when interval or enablement changes
        lastAlarmCountRef.current = 0;
    }, [alarmSettings]);

    // Check for day change and reset - only when crossing midnight
    useEffect(() => {
        let lastCheckedDate = getTodayDate();

        const checkDayChange = () => {
            const today = getTodayDate();

            // Only reset if we've actually crossed midnight (date changed from yesterday to today)
            if (lastCheckedDate !== today && totalSeconds > 0) {
                const logs = getDailyLogs();
                const existingLog = logs.find(log => log.date === lastCheckedDate);

                // Preserve any recorded pause sessions and keep the larger of stored vs in-memory totals
                const updatedLog = {
                    date: lastCheckedDate,
                    totalSeconds: Math.max(totalSeconds, existingLog?.totalSeconds ?? 0),
                    pauseSessions: existingLog?.pauseSessions ?? []
                };

                const updatedLogs = [
                    ...logs.filter(log => log.date !== lastCheckedDate),
                    updatedLog
                ];

                saveDailyLogs(updatedLogs);
                setDailyLogs(updatedLogs);
                dispatch({ type: 'RESTART' });
                saveCurrentSession({ seconds: 0, isRunning: false, lastStartTime: null });

                lastCheckedDate = today; // Update the last checked date
            }
        };

        const interval = setInterval(checkDayChange, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [totalSeconds]);
    const handleStart = useCallback(() => {
        dispatch({ type: 'START', payload: { startedAt: Date.now() } });
    }, []);

    const handleStop = useCallback(() => {
        // Calculate session duration
        const sessionDuration = totalSeconds - segmentStartSeconds;

        // Get current time for pause timestamp
        const now = new Date();
        const pauseTime = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Update today's log with pause session
        const today = getTodayDate();
        const logs = getDailyLogs();
        const existingTodayLog = logs.find(log => log.date === today);

        const newPauseSession = {
            pauseTime,
            studyDuration: sessionDuration
        };

        let updatedLogs;
        if (existingTodayLog) {
            // Update existing log
            updatedLogs = logs.map(log =>
                log.date === today
                    ? {
                        ...log,
                        totalSeconds,
                        pauseSessions: [...(log.pauseSessions || []), newPauseSession]
                    }
                    : log
            );
        } else {
            // Create new log
            updatedLogs = [
                ...logs,
                {
                    date: today,
                    totalSeconds,
                    pauseSessions: [newPauseSession]
                }
            ];
        }

        saveDailyLogs(updatedLogs);
        setDailyLogs(updatedLogs);

        dispatch({ type: 'STOP' });
    }, [segmentStartSeconds, totalSeconds]);

    const handleRestart = useCallback(() => {
        dispatch({ type: 'RESTART' });
        lastAlarmCountRef.current = 0;
    }, []);

    const handleClearLogs = useCallback(() => {
        saveDailyLogs([]);
        setDailyLogs([]);
        dispatch({ type: 'RESTART' });
        lastAlarmCountRef.current = 0;
    }, []);

    const handleExportLogs = useCallback(async () => {
        const data = JSON.stringify(dailyLogs, null, 2);

        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(data);
                setExportMessage('Logs JSON copied to clipboard');
            } else {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'chrona-logs.json';
                link.click();
                URL.revokeObjectURL(url);
                setExportMessage('Logs JSON downloaded');
            }
        } catch (error) {
            console.error('Error exporting logs', error);
            setExportMessage('Failed to export logs');
        }

        setTimeout(() => setExportMessage(null), 3000);
    }, [dailyLogs]);

    // Alarm playback when interval hits
    useEffect(() => {
        if (!alarmSettings.enabled || !alarmSettings.audioDataUrl) return;
        if (!isRunning) return;
        const intervalSeconds = alarmSettings.intervalMinutes * 60;
        if (intervalSeconds <= 0) return;

        const currentCount = Math.floor(totalSeconds / intervalSeconds);
        if (currentCount > lastAlarmCountRef.current) {
            lastAlarmCountRef.current = currentCount;
            const audio = new Audio(alarmSettings.audioDataUrl);
            audio.play().catch(err => {
                console.error('Failed to play alarm', err);
            });
        }
    }, [alarmSettings, isRunning, totalSeconds]);

    // Keyboard shortcuts for quick control: Space toggles start/pause, "r" restarts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const tagName = target?.tagName;

            // Avoid hijacking typing inside inputs/textareas/content editable
            if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target?.isContentEditable) {
                return;
            }

            if (event.code === 'Space') {
                event.preventDefault();
                if (isRunning) {
                    handleStop();
                } else {
                    handleStart();
                }
            } else if (event.key.toLowerCase() === 'r') {
                event.preventDefault();
                handleRestart();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRunning, handleStart, handleStop, handleRestart]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative">
            {/* Alarm toggle & panel (floating, right) */}
            <div className="fixed z-40 flex flex-col items-end gap-3 right-3 bottom-4 left-3 md:left-auto md:bottom-auto md:right-4 md:top-20">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full md:w-auto"
                    aria-expanded={showAlarmPanel}
                    onClick={() => setShowAlarmPanel(prev => !prev)}
                >
                    {showAlarmPanel ? <X className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    Pomodoro alarm
                </Button>

                {showAlarmPanel && (
                    <div className="w-full max-w-sm md:w-[320px] drop-shadow-2xl animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-right-4 duration-200 bg-black/80 backdrop-blur-sm rounded-2xl">
                        <AlarmSettingsPanel
                            settings={alarmSettings}
                            onChange={setAlarmSettings}
                        />
                    
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <TimerDisplay seconds={totalSeconds} />
                <TimerControls
                    isRunning={isRunning}
                    onStart={handleStart}
                    onStop={handleStop}
                    onRestart={handleRestart}
                />
                <LogsList
                    logs={dailyLogs}
                    onClear={handleClearLogs}
                    onExport={handleExportLogs}
                    exportMessage={exportMessage}
                />
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center">
                <p className="text-secondary font-array text-sm opacity-70">
                    Made with ❤️ by{' '}
                    <Link
                        href="https://x.com/_animeshkakoty"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-none hover:text-[#E55A0B] transition-colors duration-200"
                    >
                        @animesh
                    </Link>
                </p>
            </footer>

            {/* Fullscreen Button */}
            <FullscreenButton />
        </div>
    );
}