"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, FileText, Upload, CheckCircle, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const supabase = createClient();

  // 1. Fetch User Session
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  // 2. SESSION CHECK: Advanced Validation with Regex and Length checks
  useEffect(() => {
    const checkExistingResume = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('content, name, role, updated_at')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If no row exists (PGRST116), we just set state to null
          if (error.code !== 'PGRST116') console.error("DB Fetch Error:", error);
          setResumeData(null);
          return;
        }

        // --- THE VALIDATION LOGIC ---
        // 1. Check if content exists
        // 2. Check if content contains at least one letter or number (prevents whitespace false-positives)
        // 3. Check if content is long enough to be a real resume (>50 chars)
        const hasActualContent = data?.content && /[a-zA-Z0-9]/.test(data.content);
        const isLongEnough = data?.content?.trim().length > 50;

        if (data && hasActualContent && isLongEnough) {
          setResumeData({
            name: data.name,
            role: data.role,
            last_updated: data.updated_at,
            isExisting: true 
          });
        } else {
          // Explicitly reset to null if the DB row is just a blank placeholder
          setResumeData(null);
        }
      } catch (err) {
        console.error("Session sync failed:", err);
        setResumeData(null);
      }
    };

    checkExistingResume();
  }, [user, supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
  
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.id);
  
    try {
      const response = await fetch('https://hustlr-backend-b83l.onrender.com/analyze-resume', {
      method: 'POST',
      body: formData, 
    });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }
      
      const data = await response.json();
      
      // Update UI state immediately
      setResumeData({
        ...data,
        last_updated: new Date().toISOString(),
        isExisting: false
      });
      
      alert("Resume Processed and Synced Successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Verify FastAPI is active.");
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">USER PROFILE</h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2 italic"></p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl sticky top-24">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner">
                <User size={40} strokeWidth={1.5} />
              </div>
              
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">User Profile</h2>
              
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Authenticated Email</p>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-white truncate">{user.email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-emerald-400/80">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Session Encryption: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Control Center */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Resume Upload</h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">Upload resume for AI analysis</p>
                </div>
                <div className={`p-3 rounded-2xl ${resumeData ? 'bg-emerald-500/10' : 'bg-slate-800/50'}`}>
                  <FileText className={resumeData ? "text-emerald-500" : "text-slate-600"} size={24} />
                </div>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  id="resume-upload-input" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".pdf" 
                  disabled={uploading} 
                />
                <label 
                  htmlFor="resume-upload-input" 
                  className={`group relative flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed rounded-[2.5rem] transition-all duration-700 cursor-pointer overflow-hidden ${
                    resumeData 
                    ? 'border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]' 
                    : 'border-white/5 bg-black/20 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center p-6 relative z-10">
                    {uploading ? (
                      <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                    ) : resumeData ? (
                      <div className="relative">
                        <CheckCircle className="text-emerald-500 mb-4" size={44} strokeWidth={1.5} />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl -z-10" />
                      </div>
                    ) : (
                      <Upload className="text-slate-700 group-hover:text-indigo-500 mb-4 transition-all duration-500 group-hover:scale-110" size={40} strokeWidth={1.5} />
                    )}
                    
                    <p className="text-sm font-bold text-slate-300 max-w-[240px] leading-relaxed">
                      {uploading 
                        ? "Decoding PDF structure..." 
                        : resumeData 
                        ? "Resume Uploaded" 
                        : "Upload Base Resume to begin"}
                    </p>
                    
                    <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-widest">
                      {resumeData ? "Double-click to overwrite" : "Supports PDF format only"}
                    </p>
                  </div>
                </label>
              </div>

              {/* Data Preview Section */}
              {resumeData && (
                <div className="mt-10 p-8 bg-black/40 rounded-[2rem] border border-white/5 animate-in fade-in zoom-in duration-700">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">
                        {resumeData.isExisting ? "Persistent Link Active" : "Resume Uploaded"}
                      </span>
                    </div>
                    {resumeData.last_updated && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-mono tracking-tighter">
                          {new Date(resumeData.last_updated).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
