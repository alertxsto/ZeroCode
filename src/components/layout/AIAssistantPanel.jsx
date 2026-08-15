import { useState, useRef, useEffect } from 'react';
import { RiCloseLine, RiSendPlaneFill } from 'react-icons/ri';
import { Bot, Sparkles, Zap, Activity, Cpu, Code, Bug, ArrowRight, Terminal } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../../lib/geminiService';

export default function AIAssistantPanel({ isOpen, onClose, currentCode = "", taskDescription = "" }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "NEURAL_UPLINK_ESTABLISHED. I am **Nebula**, your tactical coding surrogate. Pulse your inquiries into the matrix." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = `Task: ${taskDescription}\n\nCurrent Code:\n\`\`\`\n${currentCode}\n\`\`\``.trim();
            const response = await geminiService.getResponse(textToSend, context);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "CRITICAL_ERROR: Neural path collapsed. Re-authenticate uplink." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-black border-l border-cyan-500/20 shadow-[-10px_0_50px_rgba(0,0,0,0.9)] z-[60] flex flex-col font-mono transition-all duration-500 ease-in-out overflow-hidden">
            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(34,211,238,0.01)_1.5px,rgba(34,211,238,0.01)_2px)] pointer-events-none z-0" />

            {/* Tactical Header */}
            <div className="flex items-center justify-between p-5 border-b border-cyan-500/10 bg-zinc-950/50 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-md animate-pulse" />
                        <div className="relative w-10 h-10 bg-black border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Cpu size={22} className="animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase flex items-center gap-2">
                            NEURAL_LINK_V4
                            <Activity size={12} className="text-cyan-500 animate-pulse" />
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1 h-1 bg-emerald-500 animate-ping" />
                            <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">SYNERGY_OVERRIDE_ENABLED</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-zinc-600 hover:text-cyan-400 transition-colors"
                >
                    <RiCloseLine size={24} />
                </button>
            </div>

            {/* Tactical Briefing (if empty) */}
            {messages.length <= 1 && (
                <div className="px-5 py-8 bg-cyan-950/5 border-b border-cyan-500/10 relative z-10">
                    <h3 className="text-[9px] font-bold text-cyan-500/30 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                        <Terminal size={12} />
                        DIRECT_INJECTION_MODULES
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSend("Analyze my current code and explain its architecture.")}
                            className="w-full bg-black border border-zinc-900 hover:border-cyan-500/50 hover:bg-cyan-500/5 p-4 rounded-sm flex items-center gap-4 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all border border-cyan-500/20">
                                <Code size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[10px] font-bold text-zinc-300 mb-0.5 group-hover:text-cyan-400 tracking-wider">ARCH_DECONSTRUCT</span>
                                <span className="block text-[9px] text-zinc-600 uppercase">Map logic flows & patterns</span>
                            </div>
                            <ArrowRight size={14} className="text-zinc-800 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </button>

                        <button
                            onClick={() => handleSend("I suspect a bug in my logic. Help me perform a deep diagnostic.")}
                            className="w-full bg-black border border-zinc-900 hover:border-red-500/50 hover:bg-red-500/5 p-4 rounded-sm flex items-center gap-4 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-red-500/10 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-all border border-red-500/20">
                                <Bug size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[10px] font-bold text-zinc-300 mb-0.5 group-hover:text-red-400 tracking-wider">DIAGNOSTIC_VOID</span>
                                <span className="block text-[9px] text-zinc-600 uppercase">Isolate anomalous segments</span>
                            </div>
                            <ArrowRight size={14} className="text-zinc-800 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            )}

            {/* Data Stream Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-cyber relative z-10">
                {messages.map((msg, idx) => (
                    <div key={idx} className={clsx("flex gap-4 group", msg.role === 'user' ? "flex-row-reverse text-right" : "flex-row")}>
                        {/* Biometric Node */}
                        <div className={clsx(
                            "w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-1 transition-all group-hover:scale-110",
                            msg.role === 'user'
                                ? "bg-zinc-900 text-zinc-400 border border-zinc-800"
                                : "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        )}>
                            {msg.role === 'user' ? <Zap size={16} /> : <Bot size={16} />}
                        </div>

                        {/* Data Packet */}
                        <div className={clsx(
                            "max-w-[92%] px-6 py-4 relative transition-all",
                            msg.role === 'user'
                                ? "bg-zinc-950 border-r-2 border-zinc-700 text-zinc-300"
                                : "bg-zinc-900/40 border-l-2 border-cyan-500 text-zinc-200"
                        )}>
                            <div className={clsx(
                                "text-[8px] font-bold mb-4 tracking-[0.2em] opacity-30 uppercase",
                                msg.role === 'user' ? "text-zinc-400" : "text-cyan-400"
                            )}>
                                {msg.role === 'user' ? 'AUTH_USER_TX' : 'NEBULA_DECRYPTED_STREAM'}
                            </div>

                            {msg.role === 'user' ? (
                                <span className="text-xs leading-relaxed">{msg.content}</span>
                            ) : (
                                <div className="prose prose-invert prose-xs max-w-none prose-p:my-0 prose-pre:my-0 prose-headings:text-white prose-a:text-cyan-400 prose-code:text-cyan-300">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                return !inline ? (
                                                    <div className="bg-black/20 py-4 my-2 font-mono text-[10px] overflow-x-auto relative border-y border-cyan-500/5 px-2">
                                                        <code className={clsx(className, "text-cyan-300/80")} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                ) : (
                                                    <code className="text-cyan-400 font-mono font-bold" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            p: ({ children }) => <p className="mb-4 last:mb-0 text-[11px] leading-relaxed text-zinc-300/90">{children}</p>,
                                            strong: ({ children }) => <strong className="text-cyan-400 font-bold tracking-tight">{children}</strong>
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* Timestamp Sub-Link */}
                            <div className={clsx(
                                "mt-2 pt-2 border-t border-zinc-800/50 text-[8px] font-bold text-zinc-700 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                msg.role === 'user' ? "text-right" : "text-left"
                            )}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} // TX_SYNC_SUCCESS
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                            <Activity size={12} className="text-cyan-500 animate-spin" />
                        </div>
                        <div className="bg-zinc-950 border-l-2 border-cyan-500/30 p-4 h-12 w-32 flex items-center justify-center gap-3">
                            <span className="w-1 h-1 bg-cyan-500 animate-bounce" />
                            <span className="w-1 h-1 bg-cyan-500 animate-bounce delay-150" />
                            <span className="w-1 h-1 bg-cyan-500 animate-bounce delay-300" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Ingress Terminal Area */}
            <div className="p-6 bg-zinc-950 border-t border-cyan-500/20 relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-cyan-500/5 blur opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
                    <div className="relative bg-black border border-zinc-800 focus-within:border-cyan-500/50 transition-all shadow-2xl overflow-hidden">
                        <textarea
                            rows="1"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="INPUT_COMMAND_SEQUENCE..."
                            className="w-full bg-transparent border-none py-4 px-5 text-xs text-white placeholder-zinc-800 focus:ring-0 resize-none min-h-[56px] max-h-32 font-mono scrollbar-cyber"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-zinc-500 hover:text-cyan-400 disabled:opacity-30 transition-all cursor-pointer border border-transparent hover:border-cyan-500/20"
                        >
                            <RiSendPlaneFill size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[8px] font-bold text-zinc-700 tracking-[0.2em] uppercase px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        <span>NEURAL_LINK_STABLE</span>
                    </div>
                    <span>CORE_MODEL: GEMINI_UPLINK</span>
                </div>
            </div>
        </div>
    );
}
