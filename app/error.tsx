'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Application Error Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="w-16 h-1 bg-[#38e8ff] mb-6" />
      <span className="text-xs text-[#38e8ff] tracking-widest uppercase mb-2">
        SYSTEM RECOVERY // ACTIVE
      </span>
      <h1 className="text-2xl font-bold text-white mb-4">
        Transient Interface Interruption
      </h1>
      <p className="text-slate-400 max-w-md text-xs mb-8 font-sans">
        A client runtime exception occurred. The interface can be re-synchronized safely without reloading the entire session.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#38e8ff] text-[#05070a] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#38e8ff]/90 transition-colors cursor-pointer"
      >
        Re-synchronize Interface
      </button>
    </div>
  );
}
