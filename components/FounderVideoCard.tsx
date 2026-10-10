'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';

const block = (e: React.SyntheticEvent) => e.preventDefault();

// Founder video for the About row: full vertical video (not cropped) in a glass frame.
// Loops silently on the page; a tap opens the full video with music (browsers allow sound only after a tap).
export function FounderVideoFrame() {
  const fullRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const f = fullRef.current;
    if (f) {
      f.currentTime = 0;
      f.muted = false;
      f.play().catch(() => {});
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="fvc-wrap">
        <div
          className="fvc-frame"
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setOpen(true);
          }}
          onContextMenu={block}
          onDragStart={block}
          aria-label="Play founder's reel with music"
        >
          <video
            src="/videos/founder-full.mp4"
            poster="/videos/founder-full-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
          />
          <span className="fvc-play"><Play className="w-5 h-5" /></span>
        </div>
      </div>

      {open &&
        createPortal(
          <div className="fv-modal" onClick={() => setOpen(false)} onContextMenu={block}>
            <video
              ref={fullRef}
              src="/videos/founder-full.mp4"
              poster="/videos/founder-full-poster.jpg"
              playsInline
              controls
              disablePictureInPicture
              controlsList="nodownload noremoteplayback"
              onClick={(e) => e.stopPropagation()}
              onEnded={() => setOpen(false)}
            />
            <button type="button" className="fv-close" onClick={() => setOpen(false)} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
