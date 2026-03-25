"use client";

import { useState, useEffect, useCallback } from "react";

type FullscreenDocument = Document & {
    webkitFullscreenEnabled?: boolean;
    webkitFullscreenElement?: Element | null;
    mozFullScreenEnabled?: boolean;
    mozFullScreenElement?: Element | null;
    msFullscreenEnabled?: boolean;
    msFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
};

export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Check if fullscreen is supported
    const isSupported = (() => {
        if (typeof document === "undefined") return false;
        const doc = document as FullscreenDocument;
        return (
            !!doc.fullscreenEnabled ||
            !!doc.webkitFullscreenEnabled ||
            !!doc.mozFullScreenEnabled ||
            !!doc.msFullscreenEnabled
        );
    })();

    // Update fullscreen state
    const updateFullscreenState = useCallback(() => {
        const doc = document as FullscreenDocument;

        const fullscreenElement =
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement;

        setIsFullscreen(!!fullscreenElement);
    }, []);

    // Enter fullscreen
    const enterFullscreen = useCallback(async () => {
        if (!isSupported) return;

        try {
            const element = document.documentElement as FullscreenElement;

            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (error) {
            console.error("Error entering fullscreen:", error);
        }
    }, [isSupported]);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        if (!isSupported) return;

        try {
            const doc = document as FullscreenDocument;

            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                await doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                await doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                await doc.msExitFullscreen();
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
