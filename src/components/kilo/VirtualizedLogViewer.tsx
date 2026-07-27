import React, { useRef, useEffect, useState } from 'react';

interface LogItem {
  id?: string;
  time?: string;
  msg: string;
  type?: 'info' | 'warn' | 'success' | 'err' | string;
}

interface VirtualizedLogViewerProps {
  logs: (string | LogItem)[];
  height: number;
  width?: number | string;
}

export function VirtualizedLogViewer({ logs, height, width = '100%' }: VirtualizedLogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const ITEM_HEIGHT = 24;
  const OVERSCAN = 5;

  const totalHeight = logs.length * ITEM_HEIGHT;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(logs.length, Math.ceil((scrollTop + height) / ITEM_HEIGHT) + OVERSCAN);

  const visibleItems = logs.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  const typeColors: Record<string, string> = {
    info: 'text-zinc-400',
    warn: 'text-amber-500',
    success: 'text-emerald-400',
    err: 'text-red-500',
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height, width }}
      className="w-full bg-black/20 rounded-lg overflow-y-auto custom-scrollbar touch-pan-y relative"
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}>
          {visibleItems.map((item, idx) => {
            const actualIndex = startIndex + idx;
            const isString = typeof item === 'string';
            const msg = isString ? item : item.msg;
            const time = isString ? '' : item.time;
            const type = isString ? 'info' : item.type || 'info';

            return (
              <div
                key={actualIndex}
                style={{ height: ITEM_HEIGHT }}
                className="flex gap-2 items-center hover:bg-zinc-900/30 px-2 rounded transition-colors font-mono text-[10px] border-b border-zinc-900/50 box-border"
              >
                <span className="text-zinc-600 select-none shrink-0">&gt;</span>
                {time && <span className="text-zinc-500 shrink-0">{time}</span>}
                <span className={`leading-normal truncate ${typeColors[type] || 'text-zinc-400'}`}>
                  {msg}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

