const fs = require('fs');
const file = 'src/components/KudbeeTerminal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          />
        </div>
        <button`;

const replacement = `          />
          {isRecording && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[9px] text-red-400 animate-pulse font-bold tracking-wider">DICTATING</span>
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 h-3 bg-red-500 animate-[bounce_1s_infinite]"></div>
                <div className="w-0.5 h-1.5 bg-red-500 animate-[bounce_1s_infinite_0.2s]"></div>
                <div className="w-0.5 h-2 bg-red-500 animate-[bounce_1s_infinite_0.4s]"></div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          disabled={isLoading || activeTab !== 'cli'}
          className={\`px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors border \${isRecording ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300'} disabled:opacity-40\`}
          title={isRecording ? "Stop Dictation" : "Voice-to-Text Dictation"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('patched');
