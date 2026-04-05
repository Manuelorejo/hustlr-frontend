"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-fade-in">
          <Sparkles size={16} /> Now powered by LLaMA 3.3
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
          Stop applying. <br />
          <span className="text-blue-600">Start landing.</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one AI career portal for Data Scientists and Engineers. 
          Find roles across 5+ platforms and tailor your resume in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/jobs" 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2"
          >
            Start Searching <ArrowRight size={20} />
          </Link>
          <Link 
            href="/analyze" 
            className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition"
          >
            Analyze My Resume
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white w-full py-20 border-t">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Multi-Source Search</h3>
            <p className="text-slate-500">We scrape LinkedIn, Jobberman, and more so you don't have to waste time switching tabs.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold">AI Tailoring</h3>
            <p className="text-slate-500">Our LLaMA-powered engine identifies missing keywords and adapts your experience to the job description.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center text-white">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold">Secure Profiles</h3>
            <p className="text-slate-500">Store your resumes and track your application history securely using Supabase and PostgreSQL.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center text-slate-400 text-sm border-t bg-slate-50">
        © 2026 Hustlr Portal • Built for Data Scientists
      </footer>
    </div>
  );
}