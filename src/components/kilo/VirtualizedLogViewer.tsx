import React from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';

interface LogItem {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'warn' | 'success' | 'err';
}

interface VirtualizedLogViewerProps {
  logs: LogItem[];
  height: number;
  width: number;
}

const Row = ({ data, index, style }: { data: LogItem[], index: number, style: React.CSSProperties }) => {
  const log = data[index];
  const typeColors = {
    info: 'text-zinc-400',
    warn: 'text-amber-500',
    success: 'text-emerald-400',
    err: 'text-red-500',
  };

  return (
    <div style={style} className="font-mono text-[10px] flex items-center gap-2 border-b border-zinc-900/50 px-2">
      <span className="text-zinc-600 shrink-0">{log.time}</span>
      <span className={`${typeColors[log.type]}`}>{log.msg}</span>
    </div>
  );
};

export function VirtualizedLogViewer({ logs, height, width }: VirtualizedLogViewerProps) {
  return (
    <List
      height={height}
      itemCount={logs.length}
      itemSize={24}
      width={width}
      itemData={logs}
    >
      {Row}
    </List>
  );
}
