'use client';

import { Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Button } from './Button';

export function FullscreenButton() {
    const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();

    // Don't render if fullscreen is not supported
    if (!isSupported) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="icon"
                className="bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:text-primary transition-all duration-200"
                title={isFullscreen ? 'Exit Fullscreen (F11 or Esc)' : 'Enter Fullscreen (F11)'}
            >
                {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                ) : (
                    <Maximize className="h-5 w-5" />
                )}
            </Button>
        </div>
    );
}