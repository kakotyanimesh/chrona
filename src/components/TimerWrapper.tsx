'use client';

import { useState, useEffect, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import LogsList from './LogsList';
import { getTodayDate } from '@/utils/getTodayDate';
import {
    getDailyLogs,
    saveDailyLogs,
    getCurrentSession,
    saveCurrentSession,
    DailyLog,
    // PauseSession
} from '@/utils/localStorageHelpers';
import Link from 'next/link';
import { LoveIcon } from './ui/love';
import { FullscreenButton } from './ui/FullscreenButton';

export default function TimerWrapper() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
    const [sessionStartSeconds, setSessionStartSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastStartTimeRef = useRef<number | null>(null);

    // Load initial state from localStorage
    useEffect(() => {
        const session = getCurrentSession();
        const logs = getDailyLogs();

        // Calculate elapsed time if timer was running
        if (session.isRunning && session.lastStartTime) {
            const elapsed = Math.floor((Date.now() - session.lastStartTime) / 1000);
            setSeconds(session.seconds + elapsed);
        } else {
            setSeconds(session.seconds);
        }

        setIsRunning(session.isRunning);
        setDailyLogs(logs);
        lastStartTimeRef.current = session.lastStartTime;
    }, []);

    // Timer effect
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                    const newSeconds = prev + 1;
                    // Save progress every second
                    saveCurrentSession({
                        seconds: newSeconds,
                        isRunning: true,
                        lastStartTime: lastStartTimeRef.current
                    });
                    return newSeconds;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    // Check for day change and reset - only when crossing midnight
    useEffect(() => {
        let lastCheckedDate = getTodayDate();

        const checkDayChange = () => {
            const today = getTodayDate();

            // Only reset if we've actually crossed midnight (date changed from yesterday to today)
            if (lastCheckedDate !== today && seconds > 0) {
                // Save yesterday's progress
                const updatedLogs = [
                    ...getDailyLogs().filter(log => log.date !== lastCheckedDate),
                    {
                        date: lastCheckedDate,
                        totalSeconds: seconds,
                        pauseSessions: []
                    }
                ];

                saveDailyLogs(updatedLogs);
                setDailyLogs(updatedLogs);
                setSeconds(0);
                setSessionStartSeconds(0);
                setIsRunning(false);
                saveCurrentSession({ seconds: 0, isRunning: false, lastStartTime: null });

                lastCheckedDate = today; // Update the last checked date
            }
        };

        const interval = setInterval(checkDayChange, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [seconds]);

    const handleStart = () => {
        setIsRunning(true);
        setSessionStartSeconds(seconds); // Remember when this session started
        lastStartTimeRef.current = Date.now();
        saveCurrentSession({
            seconds,
            isRunning: true,
            lastStartTime: Date.now()
        });
    };

    const handleStop = () => {
        setIsRunning(false);
        lastStartTimeRef.current = null;

        // Calculate session duration
        const sessionDuration = seconds - sessionStartSeconds;

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
                        totalSeconds: seconds,
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
                    totalSeconds: seconds,
                    pauseSessions: [newPauseSession]
                }
            ];
        }

        saveDailyLogs(updatedLogs);
        setDailyLogs(updatedLogs);

        saveCurrentSession({
            seconds,
            isRunning: false,
            lastStartTime: null
        });
    };

    const handleRestart = () => {
        setSeconds(0);
        setSessionStartSeconds(0);
        setIsRunning(false);
        lastStartTimeRef.current = null;
        saveCurrentSession({
            seconds: 0,
            isRunning: false,
            lastStartTime: null
        });
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <TimerDisplay seconds={seconds} />
                <TimerControls
                    isRunning={isRunning}
                    onStart={handleStart}
                    onStop={handleStop}
                    onRestart={handleRestart}
                />
                <LogsList logs={dailyLogs} />
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