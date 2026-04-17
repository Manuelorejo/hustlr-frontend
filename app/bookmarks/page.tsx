"use client";
import React, { useEffect, useState } from 'react';
import { Briefcase, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const response = await fetch(`https://hustlr-backend-b83l.onrender.com/bookmarks/${user.id}`);
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error("Failed to fetch bookmarks", error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks(bookmarks.filter((b: any) => b.id !== id));
    } catch (error) {
      alert("Failed to remove bookmark");
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-12 text-slate-200">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight italic">Saved Signal</h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Repository of tracked opportunities</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : (
          <div className="space-y-4">
            {(Array.isArray(bookmarks) ? bookmarks : []).map((job: any) => (
              <div key={job.id} className="group flex items-center justify-between p-6 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all backdrop-blur-sm">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{job.title}</h3>
                    <p className="text-slate-400 text-sm">{job.company} • <span className="text-slate-600 italic">{job.location}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => removeBookmark(job.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <a href={job.link} target="_blank" className="p-3 bg-white text-black rounded-xl hover:bg-indigo-400 transition-all">
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            ))}
            {bookmarks.length === 0 && <p className="text-center py-20 text-slate-700 font-mono">No data points saved yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
