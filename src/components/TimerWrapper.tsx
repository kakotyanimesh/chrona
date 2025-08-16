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

    // Check for day change and reset
    useEffect(() => {
        const checkDayChange = () => {
            const today = getTodayDate();
            const logs = getDailyLogs();
            const todayLog = logs.find(log => log.date === today);

            if (!todayLog && seconds > 0) {
                // New day detected, save yesterday's progress and reset
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayDate = yesterday.toISOString().split('T')[0];

                const updatedLogs = [
                    ...logs.filter(log => log.date !== yesterdayDate),
                    {
                        date: yesterdayDate,
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
        <div className="min-h-screen  flex flex-col pt-10 w-full mb-4">
            <TimerDisplay seconds={seconds} />
            <TimerControls
                isRunning={isRunning}
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
            />
            <LogsList logs={dailyLogs} />
            <div className='text-center text-xs mt-5 flex flex-row justify-center gap-1 items-center'>
                <h1>made with</h1>
                <LoveIcon/>
                <h1>by <Link target='_blank' href={"https://x.com/_animeshkakoty"} className='text-primary'>@animesh</Link></h1>
            </div>
        </div>
    );
}