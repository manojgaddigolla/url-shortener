import React from "react";
import { Link } from "react-router-dom";
import { SignedOut, SignUpButton } from "@clerk/clerk-react";

const HomePage = () => {

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION (Refined Spacing & Button) */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-slate-50">
        <div className="absolute inset-0 bg-grid-pattern -z-10 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white -z-10" />
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-200/40 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto px-4 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            Enterprise Grade URL Analytics
          </div>
          
          {/* Tighter gap on main statement */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 tracking-tighter text-slate-900 leading-[1.1]">
            Links that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500">mean business</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Build your brand, track your audience with dynamic cross-filtering analytics, and manage your links in one unified platform.
          </p>

          {/* Reduced button size */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/shorten" 
              className="saas-btn-primary px-8 py-3.5 text-lg hover:scale-105 inline-flex w-full sm:w-auto"
            >
              Start Shortening Now
              <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </Link>
            <a href="#features" className="saas-btn-secondary px-8 py-3.5 text-lg w-full sm:w-auto">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF SECTION (New) */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by modern teams and creators</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Abstract Logos using SVGs */}
             <div className="flex items-center gap-2 text-xl font-black text-slate-800"><div className="w-6 h-6 rounded bg-slate-800"></div> Acme Corp</div>
             <div className="flex items-center gap-2 text-xl font-black text-slate-800"><div className="w-6 h-6 rounded-full bg-slate-800"></div> Globex</div>
             <div className="flex items-center gap-2 text-xl font-black text-slate-800"><div className="w-6 h-6 rotate-45 bg-slate-800"></div> Initech</div>
             <div className="flex items-center gap-2 text-xl font-black text-slate-800"><div className="w-6 h-6 rounded-br-xl bg-slate-800"></div> Soylent</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION (New) */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">From long URL to deep insights in seconds</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">We've streamlined the entire process so you can focus on your marketing, not your infrastructure.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-indigo-100 -z-10"></div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm text-2xl font-black">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Paste your URL</h3>
              <p className="text-slate-600">Drop your long, messy link into our generator. You can even set a custom alias (e.g., /summer-sale) and an expiration date.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm text-2xl font-black">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Share everywhere</h3>
              <p className="text-slate-600">Instantly get a branded, secure Short.ly link and a downloadable QR code perfect for print, social, or email marketing.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-white border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm text-2xl font-black">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Track & Optimize</h3>
              <p className="text-slate-600">Watch the clicks roll in. Our Pro Analytics engine tracks geographic location, devices, and unique visitors in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The ultimate enterprise toolset</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Designed for teams that need uncompromising reliability and granular data.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic Analytics</h3>
              <p className="text-slate-600 leading-relaxed">
                Click any metric to instantly filter your entire dashboard. Analyze time-of-day activity, geographic reach, and unique visitors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Clerk Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade authentication out of the box. Your data is protected by industry-standard encryption and robust route protection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Automated TTL</h3>
              <p className="text-slate-600 leading-relaxed">
                Set expiration dates on your links. MongoDB background workers will automatically clean up expired links so you don't have to.
              </p>
            </div>

            {/* Feature 4 (New) */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Ready Architecture</h3>
              <p className="text-slate-600 leading-relaxed">
                Toggle "Raw Data" mode to view the structured event grid powering your charts. Fully prepared for our upcoming conversational AI integration.
              </p>
            </div>

            {/* Feature 5 (New) */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Custom Aliases</h3>
              <p className="text-slate-600 leading-relaxed">
                Stop using random strings. Create memorable, branded back-halves for your URLs (e.g. short.ly/spring-launch) to increase click-through rates.
              </p>
            </div>

            {/* Feature 6 (New) */}
            <div className="saas-card p-8">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic QR Codes</h3>
              <p className="text-slate-600 leading-relaxed">
                Every shortened link automatically generates a downloadable, high-res SVG QR Code. Perfect for bridging offline marketing to online tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <SignedOut>
        <section className="bg-slate-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to take control of your links?</h2>
            <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto">
              Join thousands of marketers and developers. Create an account for free today to unlock the full Pro Analytics engine.
            </p>
            <SignUpButton mode="modal">
              <button className="bg-white text-slate-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl shadow-indigo-500/10 inline-flex items-center">
                Get Started for Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </SignUpButton>
          </div>
        </section>
      </SignedOut>

    </div>
  );
};

export default HomePage;