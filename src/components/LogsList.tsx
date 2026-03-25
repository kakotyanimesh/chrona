import * as React from "react";
import { formatTime } from "@/utils/formatTime";
import { DailyLog } from "@/utils/localStorageHelpers";
import { Button } from "./ui/Button";

interface LogsListProps {
    logs: DailyLog[];
    onClear?: () => void;
    onExport?: () => void;
    exportMessage?: string | null;
}

const LogsList = React.forwardRef<HTMLDivElement, LogsListProps>(
    ({ logs, onClear, onExport, exportMessage }, ref) => {
        const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

        if (logs.length === 0) {
            return null;
        }

        const sortedLogs = [...logs].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const toggleCollapse = (date: string) => {
            setCollapsed(prev => ({ ...prev, [date]: !prev[date] }));
        };

        return (
            <div
                ref={ref}
                className='mt-12 text-secondary font-array flex flex-col justify-center items-center w-full'>
                <div className='md:w-md w-full px-2 md:px-0'>
                    <h2 className='text-xl mb-4 text-center'>Study Sessions</h2>
                    <div className='flex flex-wrap gap-3 justify-center items-center mb-6'>
                        {onClear && (
                            <Button variant="secondary" size="sm" onClick={onClear}>
                                Clear logs
                            </Button>
                        )}
                        {onExport && (
                            <Button variant="outline" size="sm" onClick={onExport}>
                                Export JSON
                            </Button>
                        )}
                        {exportMessage && (
                            <span className="text-xs text-primary">{exportMessage}</span>
                        )}
                    </div>
                    <div className='space-y-6'>
                        {sortedLogs.map((log) => {
                            const isCollapsed = collapsed[log.date] ?? false;

                            return (
                                <div
                                    key={log.date}
                                    className='bg-gray-900 p-4 rounded-lg'>
                                    <div className='flex justify-between items-center mb-3 gap-4'>
                                        <div className='flex flex-col'>
                                            <span className='font-semibold'>
                                                {new Date(
                                                    log.date
                                                ).toLocaleDateString()}
                                            </span>
                                            <span className='text-primary font-semibold'>
                                                Total: {formatTime(log.totalSeconds)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCollapse(log.date)}
                                        >
                                            {isCollapsed ? "Expand" : "Collapse"}
                                        </Button>
                                    </div>

                                    {!isCollapsed && log.pauseSessions &&
                                        log.pauseSessions.length > 0 && (
                                            <div className='space-y-2'>
                                                <h4 className='text-sm text-gray-400 mb-2'>
                                                    Pause Sessions:
                                                </h4>
                                                {log.pauseSessions.map(
                                                    (session, index) => (
                                                        <div
                                                            key={index}
                                                            className='flex justify-between items-center text-sm bg-gray-800 px-3 py-2 rounded'>
                                                            <span>
                                                                Session {index + 1}{" "}
                                                                - Paused at{" "}
                                                                {session.pauseTime}
                                                            </span>
                                                            <span className='text-green-400'>
                                                                {formatTime(
                                                                    session.studyDuration
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
);

LogsList.displayName = "LogsList";

export default LogsList;
