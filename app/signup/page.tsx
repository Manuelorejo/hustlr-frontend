"use client";
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Correct for Next.js 13/14/15

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    // 1. Create the account
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
  
    // 2. The "Force Login" Trick
    if (data.user) {
      // Initialize their DB profile first
      await supabase.from('resumes').upsert({
          user_id: data.user.id,
          name: "New User",
          role: "Applicant",
          content: ""
      }, { onConflict: 'user_id' });
  
      // IMMEDIATELY SIGN OUT the auto-created session
      await supabase.auth.signOut();
  
      // 3. Redirect to Login with a success message
      alert("Account created successfully! Please sign in with your credentials.");
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Join the Network</h1>
          <p className="text-slate-500 text-sm mt-2">Access AI career intelligence in 60 seconds.</p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com" 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Min. 6 characters" 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <Sparkles size={18} />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already registered? <Link href="/login" className="text-indigo-400 hover:underline font-bold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}