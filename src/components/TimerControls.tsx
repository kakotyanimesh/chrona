import { Button } from './ui/Button';

interface TimerControlsProps {
    isRunning: boolean;
    onStart: () => void;
    onStop: () => void;
    onRestart: () => void;
}

export default function TimerControls({ isRunning, onStart, onStop, onRestart }: TimerControlsProps) {
    return (
        <div className="flex gap-6 justify-center">
            {isRunning ? (
                <>
                    <Button onClick={onStop} variant="primary" size="lg">
                        pause session
                    </Button>
                    <Button onClick={onRestart} variant="secondary" size="lg">
                        restart session
                    </Button>
                </>
            ) : (
                <Button onClick={onStart} variant="primary" size="lg">
                    start session
                </Button>
            )}
        </div>
    );
}