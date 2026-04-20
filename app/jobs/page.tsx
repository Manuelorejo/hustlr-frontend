"use client";

import React, { useState, useEffect } from 'react';
import { Search, Heart, Loader2, Sparkles, Briefcase, Globe, Radar, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function JobsPage() {
  const [tailoringId, setTailoringId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [savedLinks, setSavedLinks] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null); // New error state
  
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    
    try {
        const response = await fetch(`https://hustlr-backend-b83l.onrender.com/search?query=${encodeURIComponent(query)}`, { cache: 'no-store' });
        const data = await response.json();
        
        // DEBUG: Look at your browser console (F12) to see exactly what this prints
        console.log("Raw API Response:", data);
    
        // FIX: Ensure we are setting an ARRAY to the state
        if (Array.isArray(data)) {
          setJobs(data);
        } else if (data && typeof data === 'object' && Array.isArray(data.jobs)) {
          // If your backend wraps it in a "jobs" key
          setJobs(data.jobs);
        } else {
          console.error("Data received is not an array. Check backend return format.");
          setJobs([]);
        }
      } catch (error) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
  };

  const handleTailor = async (job: any) => {
    // 1. Set loading state using whichever key exists in your job object
    const jobLink = job.link || job["Job Link"];
    setTailoringId(jobLink);
  
    try {
      const response = await fetch('http://https://hustlr-backend-b83l.onrender.com/tailor-live-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          job_description: job.description || job["Job Description"] || "",
          job_title: job.title || job["Job Title"] || "Untitled Role",
          // CRITICAL: Ensure company is never null/undefined to avoid 422
          company: job.company || job["Company"] || "Hiring Company"
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server responded with an error");
      }
  
      const result = await response.json();
      
      if (result.status === "success" && result.pdf_base64) {
        // --- START BASE64 TO DOWNLOAD LOGIC ---
        
        // 1. Decode the Base64 string into binary data
        const byteCharacters = atob(result.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // 2. Create the Blob (The 'Virtual File')
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // 3. Create a temporary download link in the browser memory
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // 4. Set the filename (Backend provides this)
        link.download = result.filename || "Tailored_Resume.pdf";
        
        // 5. Append, Click, and Remove (The "Silent Trigger")
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // 6. Release the memory
        window.URL.revokeObjectURL(url);
  
        // --- END DOWNLOAD LOGIC ---
      } else {
        alert("AI Error: " + (result.message || "Unknown error occurred"));
      }
    } catch (err) {
      console.error("Tailor Failed:", err);
      alert("Tailoring failed. Please check your backend connection.");
    } finally {
      setTailoringId(null); // Clear loading state
    }
  };

  
  const handleSaveJob = async (job: any) => {
    if (!user) return alert("Please log in to save jobs!");
    const jobLink = job["Job Link"] || job.link;
    if (savedLinks.includes(jobLink)) return;

    setSavedLinks((prev) => [...prev, jobLink]);

    try {
      const response = await fetch('http://localhost:8000/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          job_data: {
            title: job["Job Title"] || "Untitled Role",
            company: job["Company"] || "Private Company",
            location: job["Job Location"] || "Remote",
            link: jobLink,
            description: job["Job Description"] || "",
            source: job.Source || "Web Scraper"
          }
        }),
      });

      if (!response.ok) throw new Error("Save failed");
    } catch (error) {
      setSavedLinks((prev) => prev.filter(l => l !== jobLink));
      console.error("Save failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Search Bar Container */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-4 italic">Job Search</h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3 p-2 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md focus-within:border-indigo-500/50 transition-all shadow-2xl shadow-indigo-500/5">
            <Search className="ml-4 text-slate-500 self-center" size={20} />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query job stream (e.g. ML Engineer)..." 
              className="flex-1 bg-transparent py-3 outline-none text-white font-medium placeholder:text-slate-600"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Scanning..." : "Search"}
            </button>
          </form>
        </header>

        {/* ERROR STATE */}
        {error && (
          <div className="max-w-md mx-auto mb-10 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 1. LOADING UI */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative flex items-center justify-center">
              <Radar className="text-indigo-500 animate-spin-slow opacity-20" size={160} />
              <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse"></div>
              <Loader2 className="absolute text-white animate-spin" size={40} />
            </div>
            <div className="text-center z-10">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">Aggregating Data</h2>
              <p className="text-slate-500 font-mono text-[10px] mt-2 tracking-[0.4em]">Querying LinkedIn • Jobberman • MyJobMag</p>
            </div>
          </div>
        )}

        {/* 2. IDLE STATE */}
        {!loading && !searchPerformed && (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-[4rem] bg-slate-900/10">
            <Globe className="text-slate-800 mb-6" size={60} />
            <h2 className="text-xl font-bold text-slate-400">System Ready</h2>
            <p className="text-slate-600 max-w-xs text-center mt-2 text-sm">
              Initiate a global scan by entering a job title in the console above.
            </p>
          </div>
        )}

        {/* 3. EMPTY RESULTS STATE */}
        {!loading && searchPerformed && jobs.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="p-5 bg-slate-900 rounded-full mb-6 border border-white/5">
              <RefreshCw className="text-slate-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Zero Signals Captured</h2>
            <p className="text-slate-500 text-center mt-2 max-w-sm">
              The scraper couldn't find matching roles for "<span className="text-indigo-400">{query}</span>". Try refining your parameters.
            </p>
          </div>
        )}

        {/* 4. RESULTS GRID */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {jobs.map((job, index) => {
              const jobLink = job["Job Link"] || job.link;
              const isSaved = savedLinks.includes(jobLink);
              const isTailoring = tailoringId === jobLink; // Checks if THIS specific card is loading
              
              return (
                <div key={index} className="group relative bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-7 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all flex flex-col shadow-xl">
                  <div className="flex justify-between items-start mb-8">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">
                      {job.Source || "External"}
                    </div>
                    <button 
                      onClick={() => handleSaveJob(job)}
                      className={`p-2.5 rounded-2xl transition-all border ${
                        isSaved 
                        ? 'text-rose-500 bg-rose-500/10 border-rose-500/30' 
                        : 'text-slate-600 border-white/10 hover:text-rose-500 hover:border-rose-500/50'
                      }`}
                    >
                      <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                    {job["Job Title"]}
                  </h3>
                  <p className="text-indigo-500/80 text-xs font-black uppercase tracking-widest mb-4">
                    {job["Company"] || "Confidential"}
                  </p>
                  
                  <p className="text-slate-500 text-xs line-clamp-3 mb-8 leading-relaxed font-medium">
                    {job["Job Description"] || "Automatic description generation in progress..."}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/5 mt-auto gap-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Signal Source</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{job["Job Location"] || "Global Remote"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* NEW: Tailor Resume Button */}
                      <button
                        onClick={() => handleTailor(job)}
                        disabled={isTailoring}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isTailoring ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {isTailoring ? "Processing" : "Tailor AI"}
                      </button>

                      <a 
                        href={jobLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-black px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-white/5 uppercase tracking-widest"
                      >
                        Access Data
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}  
      </div>
    </div>
  );
}
