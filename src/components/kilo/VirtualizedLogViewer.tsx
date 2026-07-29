import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

interface LogItem {
  id?: string;
  time?: string;
  msg: string;
  type?: 'info' | 'warn' | 'success' | 'err' | string;
}

interface VirtualizedLogViewerProps {
  logs: (string | LogItem)[];
  height?: number | string;
  width?: number | string;
  itemHeight?: number;
}

export function VirtualizedLogViewer({
  logs,
  height = 200,
  width = '100%',
  itemHeight = 24
}: VirtualizedLogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(typeof height === 'number' ? height : 200);
  const isScrolledToBottomRef = useRef(true);

  const ITEM_HEIGHT = itemHeight;
  const OVERSCAN = 5;

  const totalHeight = logs.length * ITEM_HEIGHT;

  // Dynamically observe container viewport height
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setViewportHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(containerRef.current);
    if (containerRef.current.clientHeight > 0) {
      setViewportHeight(containerRef.current.clientHeight);
    }
    return () => observer.disconnect();
  }, []);

  // Smart auto-scroll: if user was already at/near the bottom, auto-scroll to keep up with live event stream
  useEffect(() => {
    if (containerRef.current && isScrolledToBottomRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    // Track if user is near bottom (within 40px threshold)
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 40;
    isScrolledToBottomRef.current = isAtBottom;
  };

  // Calculate visible range based on current viewport height and scroll position
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    logs.length,
    Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN
  );

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
      className="w-full bg-black/30 rounded-lg overflow-y-auto custom-scrollbar touch-pan-y relative border border-zinc-800/60"
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
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
                className="flex gap-2 items-center hover:bg-zinc-900/40 px-2 rounded transition-colors font-mono text-[10px] border-b border-zinc-900/40 box-border"
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


