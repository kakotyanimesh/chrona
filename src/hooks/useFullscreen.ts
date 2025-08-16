/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Check if fullscreen is supported
    const isSupported =
        typeof document !== "undefined" &&
        (document.fullscreenEnabled ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (document as any).webkitFullscreenEnabled ||
            (document as any).mozFullScreenEnabled ||
            (document as any).msFullscreenEnabled);

    // Update fullscreen state
    const updateFullscreenState = useCallback(() => {
        const fullscreenElement =
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement;

        setIsFullscreen(!!fullscreenElement);
    }, []);

    // Enter fullscreen
    const enterFullscreen = useCallback(async () => {
        if (!isSupported) return;

        try {
            const element = document.documentElement;

            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen();
            } else if ((element as any).mozRequestFullScreen) {
                await (element as any).mozRequestFullScreen();
            } else if ((element as any).msRequestFullscreen) {
                await (element as any).msRequestFullscreen();
            }
        } catch (error) {
            console.error("Error entering fullscreen:", error);
        }
    }, [isSupported]);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        if (!isSupported) return;

        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
        } catch (error) {
            console.error("Error exiting fullscreen:", error);
        }
    }, [isSupported]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
        if (isFullscreen) {
            await exitFullscreen();
        } else {
            await enterFullscreen();
        }
    }, [isFullscreen, enterFullscreen, exitFullscreen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // F11 key
            if (event.key === "F11") {
                event.preventDefault();
                toggleFullscreen();
            }
            // Escape key (only exit fullscreen)
            else if (event.key === "Escape" && isFullscreen) {
                exitFullscreen();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [toggleFullscreen, exitFullscreen, isFullscreen]);

    // Listen for fullscreen changes
    useEffect(() => {
        if (!isSupported) return;

        const events = [
            "fullscreenchange",
            "webkitfullscreenchange",
            "mozfullscreenchange",
            "msfullscreenchange",
        ];

        events.forEach((event) => {
            document.addEventListener(event, updateFullscreenState);
        });

        // Initial check
        updateFullscreenState();

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, updateFullscreenState);
            });
        };
    }, [updateFullscreenState, isSupported]);

    return {
        isFullscreen,
        isSupported,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
    };
}
