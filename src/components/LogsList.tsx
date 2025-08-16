import * as React from 'react';
import { formatTime } from '@/utils/formatTime';
import { DailyLog } from '@/utils/localStorageHelpers';

interface LogsListProps {
    logs: DailyLog[];
}

const LogsList = React.forwardRef<HTMLDivElement, LogsListProps>(
    ({ logs }, ref) => {
        if (logs.length === 0) {
            return null;
        }

        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
            <div
                ref={ref}
                className="mt-12 text-secondary font-array flex flex-col justify-center items-center w-full"
            >
                <div className='md:w-md'>
                    <h2 className="text-xl mb-6 text-center">Study Sessions</h2>
                    <div className="space-y-6">
                        {sortedLogs.map((log) => (
                            <div key={log.date} className="bg-gray-900 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold">{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="text-primary font-semibold">Total: {formatTime(log.totalSeconds)}</span>
                                </div>

                                {log.pauseSessions && log.pauseSessions.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm text-gray-400 mb-2">Pause Sessions:</h4>
                                        {log.pauseSessions.map((session, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm bg-gray-800 px-3 py-2 rounded">
                                                <span>Session {index + 1} - Paused at {session.pauseTime}</span>
                                                <span className="text-green-400">{formatTime(session.studyDuration)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
);

LogsList.displayName = 'LogsList';

export default LogsList;