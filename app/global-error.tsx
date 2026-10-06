'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error Caught]:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#05070a] text-slate-100 font-mono min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-1 bg-[#38e8ff] mx-auto mb-6" />
          <h2 className="text-xl font-bold text-white mb-4">Global Matrix Boundary</h2>
          <p className="text-xs text-slate-400 mb-6 font-sans">
            A critical interface disruption was intercepted. Re-synchronize the interface to restore normal telemetry.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#38e8ff] text-[#05070a] text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Reset System
          </button>
        </div>
      </body>
    </html>
  );
}
