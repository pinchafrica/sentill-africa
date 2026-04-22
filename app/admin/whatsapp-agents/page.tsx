"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Clock, Activity, ShieldCheck, Play, Square,
  Zap, AlertTriangle, CheckCircle2, Server, Power,
  XCircle, Radio, Terminal
} from "lucide-react";

// --- Types ---
type AgentStatus = "idle" | "processing" | "rectifying" | "offline";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  totalResolved: number;
  uptime: number;
  currentTask: string | null;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
  agentId?: string;
}

const AGENT_NAMES = [
  "Alpha-One", "Bravo-Core", "Charlie-Net", "Delta-Sync", "Echo-Pulse",
  "Foxtrot-AI", "Gamma-Node", "Halo-Base", "Iris-Link", "Juno-Wave"
];

const ERROR_MESSAGES = [
  "Webhook timeout from WhatsApp API",
  "Invalid media type in user payload",
  "Rate limit exceeded for outbound messages",
  "Unrecognized intent in customer text",
  "Database connection pool full",
  "Payment verification delay detected",
  "Session token expired for user 2547XXXXXXXX",
  "Failed to parse incoming location pin",
  "Template message restriction triggered",
  "Concurrent request collision detected"
];

export default function WhatsAppAgentsPage() {
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(
    AGENT_NAMES.map((name, i) => ({
      id: `AGT-${(i + 1).toString().padStart(2, "0")}`,
      name,
      role: "WhatsApp AI Processor",
      status: "offline",
      totalResolved: Math.floor(Math.random() * 500) + 100,
      uptime: 0,
      currentTask: null,
    }))
  );
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "L0", timestamp: new Date().toISOString(), message: "System initialized. Agents standing by.", type: "info" }
  ]);
  const [stats, setStats] = useState({
    errorsRectified: 4192,
    activeAgents: 0,
    avgResponseTime: "45ms",
    systemHealth: 100,
  });

  // --- Simulation Logic ---
  useEffect(() => {
    if (!isSystemActive) {
      setAgents(agents.map(a => ({ ...a, status: "offline", currentTask: null })));
      setStats(prev => ({ ...prev, activeAgents: 0 }));
      return;
    }

    setAgents(agents.map(a => ({ ...a, status: "idle", currentTask: "Awaiting payload" })));
    setStats(prev => ({ ...prev, activeAgents: agents.length }));
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message: "Pro AI Agent Swarm activated. Monitoring WhatsApp pipelines.",
      type: "success" as const
    }, ...prev].slice(0, 50));

    const simInterval = setInterval(() => {
      // Randomly create an error
      if (Math.random() > 0.4) {
        const errorMsg = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
        const idleAgents = agents.filter(a => a.status === "idle");
        
        if (idleAgents.length > 0) {
          // Assign error to an agent
          const assignedAgent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
          const logId = Date.now().toString();
          
          setLogs(prev => [
            {
              id: logId + "_fix",
              timestamp: new Date().toISOString(),
              message: `Auto-rectified by ${assignedAgent.name}: ${errorMsg}`,
              type: "success" as const,
              agentId: assignedAgent.id
            },
            {
              id: logId,
              timestamp: new Date().toISOString(),
              message: `Exception detected: ${errorMsg}`,
              type: "error" as const
            },
            ...prev
          ].slice(0, 50));

          setStats(prev => ({
            ...prev,
            errorsRectified: prev.errorsRectified + 1,
            systemHealth: Math.min(100, prev.systemHealth + Math.random() * 2), // small bump string
          }));

          setAgents(prevAgents => prevAgents.map(a => {
            if (a.id === assignedAgent.id) {
              return {
                ...a,
                status: "rectifying",
                currentTask: `Resolving: ${errorMsg.substring(0, 20)}...`,
                totalResolved: a.totalResolved + 1
              };
            }
            return a;
          }));

          // Reset agent to idle after a bit
          setTimeout(() => {
            if (isSystemActive) {
              setAgents(prevAgents => prevAgents.map(a => {
                if (a.id === assignedAgent.id) {
                  return { ...a, status: "idle", currentTask: "Awaiting payload" };
                }
                return a;
              }));
            }
          }, 2000 + Math.random() * 2000);
        } else {
          // No idle agents, queue it up (simulate system health drop)
          setLogs(prev => [
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              message: `System Alert: No idle agents available for ${errorMsg}`,
              type: "warning" as const
            },
            ...prev
          ].slice(0, 50));
          setStats(prev => ({
            ...prev,
            systemHealth: Math.max(0, prev.systemHealth - Math.random() * 5),
          }));
        }
      }

      // Randomly make some agents "processing" normal traffic
      setAgents(prevAgents => prevAgents.map(a => {
        if (a.status === "idle" && Math.random() > 0.7) {
          setTimeout(() => {
            setAgents(current => current.map(ca => ca.id === a.id ? { ...ca, status: "idle", currentTask: "Awaiting payload" } : ca));
          }, 1000 + Math.random() * 3000);
          return { ...a, status: "processing", currentTask: "Processing WhatsApp inbound message" };
        }
        return a;
      }));
      
    }, 3000);

    return () => clearInterval(simInterval);
  }, [isSystemActive]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 relative overflow-hidden">
            <div className={`absolute inset-0 bg-emerald-500/20 ${isSystemActive ? 'animate-pulse' : 'hidden'}`} />
            <Bot className={`w-7 h-7 ${isSystemActive ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp AI Sub-Agents</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">10 Pro Autonomous Instances · 24/7 Operations · Auto-Rectification</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button
            onClick={() => setIsSystemActive(!isSystemActive)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              isSystemActive 
                ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 shadow-sm" 
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20"
            }`}
          >
            {isSystemActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isSystemActive ? "Halt System" : "Deploy Swarm"}
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: `${stats.activeAgents} / 10`, icon: Server, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Errors Rectified", value: stats.errorsRectified.toLocaleString(), icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Sys Health", value: `${stats.systemHealth.toFixed(1)}%`, icon: Activity, color: stats.systemHealth > 90 ? "text-emerald-600" : "text-amber-600", bg: stats.systemHealth > 90 ? "bg-emerald-100" : "bg-amber-100" },
          { label: "Avg Response", value: stats.avgResponseTime, icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat, i) => (
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             key={i} 
             className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between"
          >
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
               <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
             </div>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Radio className="w-4 h-4" /> Agent Matrix
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Offline</span>
              <span className="flex items-center gap-1 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Idle</span>
              <span className="flex items-center gap-1 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Proc</span>
              <span className="flex items-center gap-1 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span> Fix</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  agent.status === 'offline' ? 'bg-slate-50 border-slate-200 opacity-60' :
                  agent.status === 'rectifying' ? 'bg-amber-50 border-amber-200 shadow-md shadow-amber-500/10' :
                  agent.status === 'processing' ? 'bg-emerald-50 border-emerald-200 shadow-sm' :
                  'bg-white border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      agent.status === 'offline' ? 'bg-slate-200 text-slate-400' :
                      agent.status === 'rectifying' ? 'bg-amber-200 text-amber-700' :
                      agent.status === 'processing' ? 'bg-emerald-200 text-emerald-700' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{agent.id}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{agent.name}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-[6px] text-[9px] font-black uppercase tracking-widest ${
                      agent.status === 'offline' ? 'bg-slate-200 text-slate-500' :
                      agent.status === 'rectifying' ? 'bg-amber-200 text-amber-800 animate-pulse' :
                      agent.status === 'processing' ? 'bg-emerald-200 text-emerald-800' :
                      'bg-blue-100 text-blue-700'
                  }`}>
                    {agent.status}
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase">Current Task</span>
                    <span className={`font-medium ${agent.status !== 'offline' ? 'text-slate-700' : 'text-slate-400 truncate w-32 text-right'}`}>
                      {agent.currentTask || "Sleeping"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                     <span className="font-bold text-slate-400 uppercase">Resolved</span>
                     <span className="font-black text-emerald-600">{agent.totalResolved.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Logs */}
        <div className="space-y-4">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Live Action Log
            </h2>
           <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-2xl h-[calc(100vh-300px)] min-h-[500px] flex flex-col font-mono relative overflow-hidden">
             
             {/* Scanline effect overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] break-words relative z-10"
                    >
                      <span className="text-slate-500">[{log.timestamp.split('T')[1].substring(0, 8)}]</span>{" "}
                      {log.type === "info" && <span className="text-blue-400">SYS: {log.message}</span>}
                      {log.type === "error" && <span className="text-rose-400 font-bold">ERR: {log.message}</span>}
                      {log.type === "warning" && <span className="text-amber-400">WARN: {log.message}</span>}
                      {log.type === "success" && <span className="text-emerald-400 font-bold">OK: {log.message} {log.agentId && `[${log.agentId}]`}</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
             
             <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
               <div className="flex items-center gap-2 text-emerald-500">
                 <span className="relative flex h-2 w-2">
                   {isSystemActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                   <span className={`relative inline-flex rounded-full h-2 w-2 ${isSystemActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                 </span>
                 {isSystemActive ? "Stream Active" : "Disconnected"}
               </div>
               <span className="text-slate-600">Secure AES-256</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
