"use client";

import { useRef, useState, useCallback } from "react";
import { AlarmSettings } from "@/utils/localStorageHelpers";
import { Button } from "./ui/Button";
import { UploadCloud, Music2, Play } from "lucide-react";

interface AlarmSettingsProps {
    settings: AlarmSettings;
    onChange: (next: AlarmSettings) => void;
}

const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // 3MB guard for localStorage size

export function AlarmSettingsPanel({ settings, onChange }: AlarmSettingsProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

    const handleIntervalChange = (minutes: number) => {
        if (Number.isNaN(minutes) || minutes <= 0) return;
        onChange({ ...settings, intervalMinutes: minutes });
    };

    const handleToggleEnabled = (enabled: boolean) => {
        onChange({ ...settings, enabled });
    };

    const handleFileChange = useCallback(async (file?: File | null) => {
        if (!file) return;
        if (file.size > MAX_AUDIO_BYTES) {
            setError("Audio file too large (max ~3MB for storage)");
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            onChange({ ...settings, audioDataUrl: result, audioName: file.name });
        };
        reader.onerror = () => {
            setError("Failed to read audio file");
        };
        reader.readAsDataURL(file);
    }, [onChange, settings]);

    const handleClearAudio = () => {
        onChange({ ...settings, audioDataUrl: undefined, audioName: undefined });
        setPreviewAudio(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTestPlay = async () => {
        if (!settings.audioDataUrl) return;
        try {
            if (previewAudio) {
                previewAudio.pause();
            }
            const audio = new Audio(settings.audioDataUrl);
            setPreviewAudio(audio);
            await audio.play();
        } catch (err) {
            setError("Unable to play audio");
            console.error(err);
        }
    };

    return (
        <div className="w-full max-w-md bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black border border-white/10 rounded-xl p-4 space-y-4 text-secondary shadow-xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-primary">Pomodoro Alarm</h3>
                    <p className="text-xs text-gray-400">Play a sound every N minutes while the timer runs.</p>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="accent-primary h-4 w-4"
                        checked={settings.enabled}
                        onChange={(e) => handleToggleEnabled(e.target.checked)}
                    />
                    <span>Enable</span>
                </label>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300" htmlFor="interval-minutes">Interval (minutes)</label>
                <input
                    id="interval-minutes"
                    type="number"
                    min={1}
                    className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-secondary"
                    value={settings.intervalMinutes}
                    onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
                />
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-300" htmlFor="alarm-audio">Alarm sound</label>

                <div className="rounded-xl border border-dashed border-primary/40 bg-black/40 p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                            <Music2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-secondary font-medium">
                                {settings.audioName ?? "No file selected"}
                            </div>
                            <div className="text-xs text-gray-400">Upload a short MP3/WAV (≤ ~3MB)</div>
                        </div>
                        <input
                            id="alarm-audio"
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0])}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud className="h-4 w-4" />
                            Upload
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={handleTestPlay} disabled={!settings.audioDataUrl} className="gap-2">
                            <Play className="h-4 w-4" />
                            Test sound
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={handleClearAudio} disabled={!settings.audioDataUrl}>
                            Remove
                        </Button>
                    </div>
                </div>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}
        </div>
    );
}
