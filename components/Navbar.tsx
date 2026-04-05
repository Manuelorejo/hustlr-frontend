"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Sparkles, LogOut, Bookmark, User, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getSession();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Briefcase className="text-white" size={18} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white italic uppercase">Hustlr</span>
        </Link>
        
        {/* Navigation Links - Only visible if logged in */}
        {user ? (
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <Link href="/jobs" className="hover:text-indigo-400 flex items-center gap-2 transition-colors">
              <Search size={14} className="text-indigo-500" /> Find Jobs
            </Link>
            <Link href="/analyze" className="hover:text-indigo-400 flex items-center gap-2 transition-colors">
              <Sparkles size={14} className="text-indigo-500" /> AI Lab
            </Link>
            <Link href="/bookmarks" className="hover:text-indigo-400 flex items-center gap-2 transition-colors">
              <Bookmark size={14} className="text-indigo-500" /> Bookmarks
            </Link>
            <Link href="/profile" className="hover:text-indigo-400 flex items-center gap-2 transition-colors">
              <User size={14} className="text-indigo-500" /> Profile
            </Link>
            
            <div className="h-4 w-[1px] bg-white/10 mx-2" />

            <button 
              onClick={handleSignOut}
              className="group flex items-center gap-2 hover:text-rose-500 transition-colors"
              title="Terminate Session"
            >
              <LogOut size={16} className="text-slate-600 group-hover:text-rose-500 transition-colors" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Login CTA for non-authenticated users */
          <div className="flex items-center gap-4">
             <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition">
               Sign In
             </Link>
             <Link href="/signup" className="bg-white text-black px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
               Get Started
             </Link>
          </div>
        )}
      </div>
    </nav>
  );
}