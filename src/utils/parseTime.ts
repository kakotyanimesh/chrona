export interface TimeParts {
    hours: string;
    minutes: string;
    seconds: string;
}

export function parseTime(totalSeconds: number): TimeParts {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: secs.toString().padStart(2, "0"),
    };
}
