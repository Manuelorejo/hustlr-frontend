"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Sparkles, Database, ShieldAlert, Target } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AnalyzePage() {
  const [user, setUser] = useState<any>(null);
  // Default to a placeholder, but let them type anything
  const [targetField, setTargetField] = useState(''); 
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Specifically check if 'content' is not empty
        const { data, error } = await supabase
          .from('resumes')
          .select('content')
          .eq('user_id', user.id)
          .single();
  
        // Only set to true if the row exists AND has actual text
        if (data && data.content && data.content.trim().length > 0) {
          setHasExistingResume(true);
        } else {
          setHasExistingResume(false);
        }
      }
    };
    init();
  }, [supabase]);

  const runAnalysis = async (freshText?: string) => {
    if (!targetField.trim()) {
      alert("Please specify a career field first (e.g., 'Product Manager')");
      return;
    }

    if (!freshText && !hasExistingResume) {
      alert("No resume found. Please upload a PDF first.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/ai-lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          target_field: targetField,
          resume_text: freshText || null 
        }),
      });
      
      const data = await response.json();
      if (data && data.report) {
        setAnalysis(data.report);
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/analyze-resume', { method: 'POST', body: formData });
      if (res.ok) {
        setHasExistingResume(true);
        await runAnalysis();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayScore = Number(analysis?.score || 0);
  const circumference = 2 * Math.PI * 70; 
  const offset = circumference - (circumference * Math.min(Math.max(displayScore, 0), 100)) / 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Input & Controls */}
        <div className="space-y-8">
          <header>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">AI Analysis Lab</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-2">Universal Career Optimization</p>
          </header>

          {/* DYNAMIC TEXT INPUT */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <Target size={14} className="text-indigo-500" />
              What is your target role?
            </label>
            <div className="relative">
              <input 
                type="text"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                placeholder="e.g. Senior Architect, Nurse, Chef, UX Designer..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-lg font-medium"
              />
              {targetField && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500/40 uppercase tracking-tighter">
                  Field Locked
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {hasExistingResume && (
              <button 
                onClick={() => runAnalysis()}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-8 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl hover:bg-indigo-600/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="font-bold text-white">Scan Existing Resume</p>
                  <p className="text-[10px] text-indigo-300/60 uppercase">Run analysis for {targetField || 'chosen field'}</p>
                </div>
              </button>
            )}

            <label className="flex items-center justify-center gap-3 p-8 bg-slate-900/40 border border-white/10 border-dashed rounded-3xl hover:border-indigo-500/50 transition-all cursor-pointer group">
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" disabled={loading} />
              <Upload className="text-slate-500 group-hover:text-indigo-400" />
              <div className="text-left">
                <p className="font-bold text-slate-300">Upload & Analyze New</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Fresh PDF extraction</p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Output (Remains the same as previous) */}
        <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden min-h-[600px]">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center px-6">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
              <p className="text-xs font-mono text-indigo-400 animate-pulse uppercase tracking-[0.2em]">Analyzing Alignment for {targetField}...</p>
            </div>
          )}

          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20">
              <Sparkles className="text-slate-800" size={64} />
              <p className="text-slate-600 text-sm italic">Define your target role to initiate the scan</p>
            </div>
          )}

          {analysis && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold text-white tracking-tight text-lg uppercase tracking-widest text-xs">Analysis Report</h3>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black border border-indigo-500/20 uppercase">
                  {targetField}
                </span>
              </div>

              {/* Score Circle */}
              <div className="flex flex-col items-center mb-12">
                <div className="relative w-40 h-40 flex items-center justify-center rounded-full">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                    <circle
                      cx="80" cy="80" r="70"
                      fill="transparent"
                      stroke="rgb(99 102 241)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="text-5xl font-black text-white relative z-10">{displayScore}</span>
                </div>
                <p className="text-[10px] font-mono text-indigo-400 mt-6 tracking-[0.3em] uppercase">Market Readiness</p>
              </div>

              {/* Insights Section */}
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-emerald-500 mb-4 uppercase tracking-widest">Key Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.strengths || []).map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] font-medium text-emerald-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-rose-500 mb-4 uppercase tracking-widest">Growth Opportunities</p>
                  <ul className="space-y-3">
                    {(analysis.weaknesses || []).map((text: string, i: number) => (
                      <li key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl group hover:bg-rose-500/10 transition-colors">
                        <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={14} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}