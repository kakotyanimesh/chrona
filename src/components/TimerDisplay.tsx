'use client';

import { useState, useEffect } from 'react';
import { parseTime } from '@/utils/parseTime';

interface TimerDisplayProps {
    seconds: number;
}

export default function TimerDisplay({ seconds }: TimerDisplayProps) {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [prevSeconds, setPrevSeconds] = useState(seconds);

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            const dayString = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

            setCurrentTime(`TODAY : ${timeString}`);
            setCurrentDay(dayString);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    // Track seconds change for colon animation
    useEffect(() => {
        setPrevSeconds(seconds);
    }, [seconds]);

    const timeParts = parseTime(seconds);
    const shouldAnimateColon = prevSeconds !== seconds;

    return (
        <div className="text-center relative space-y-2">
            <div className='relative flex justify-center flex-row'>
                <div className='bg-primary absolute w-2 rotate-45 h-10' />

                <h1 className="text-secondary font-array text-3xl font-normal z-10">
                    Session
                </h1>
            </div>
            <div className="text-secondary font-array text-left md:space-y-0 bg-primary px-2 py-1 -space-y-1 md:text-md text-xs absolute md:right-10 right-2">
                <div>{currentTime}</div>
                <div>{currentDay}</div>
            </div>
            <div className="md:text-[170px]  text-[70px] flex justify-center items-center font-monof w-full md:mt-0 mt-10">
                <div className="flex items-center justify-center w-[500px]">
                    {/* Hours - Primary Color */}
                    <span className="text-pink-600">
                        {timeParts.hours}
                    </span>

                    {/* First Colon - Animated */}
                    <span className={`${shouldAnimateColon ? 'colon-animate' : ''} text-primary`}>
                        :
                    </span>

                    {/* Minutes - White */}
                    <span className="text-secondary">
                        {timeParts.minutes}
                    </span>

                    {/* Second Colon - Animated */}
                    <span className={`${shouldAnimateColon ? 'colon-animate' : ''} text-primary mx-2`}>
                        :
                    </span>

                    {/* Seconds - White */}
                    <span className="text-primary">
                        {timeParts.seconds}
                    </span>
                </div>
            </div>
        </div>
    );
}