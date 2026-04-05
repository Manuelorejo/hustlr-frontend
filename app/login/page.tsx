"use client";
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        alert(error.message);
      } else {
        router.push('/jobs');
      }
    } catch (err: any) {
      // This catches the "Failed to fetch" network error before it crashes the console
      console.warn("Network Handshake Interrupted:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/jobs` }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nexus AI</h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">Authentication Protocol</p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Email </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 pl-12 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-600">
              <span className="bg-slate-900 px-4 tracking-widest">OR</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5" alt="google" />
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          New to the Nexus? <Link href="/signup" className="text-indigo-400 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}