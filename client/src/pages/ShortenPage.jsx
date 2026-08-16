import React, { useState } from "react";
import QRCode from "react-qr-code";
import { createShortUrl } from "../services/apiService";
import { suggestAliases } from "../services/linkService";
import Spinner from "../components/Spinner";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ShortenPage = () => {
  const [longUrl, setLongUrl] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrlData, setShortUrlData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { getToken } = useAuth();

  const handleSuggestAliases = async () => {
    if (!longUrl) {
      toast.error("Please enter a Long URL first.");
      return;
    }
    const urlPattern = new RegExp('^(https?:\\/\\/)' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))', 'i');
    if (!urlPattern.test(longUrl)) {
      toast.error("Please enter a valid URL to get suggestions.");
      return;
    }

    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const token = await getToken();
      const res = await suggestAliases(token, longUrl);
      if (res.success && res.suggestions) {
        setSuggestions(res.suggestions);
        toast.success("AI generated suggestions!");
      }
    } catch (err) {
      toast.error(err.error || err.message || "Failed to generate suggestions.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const validateUrl = () => {
    const errors = {};
    const urlPattern = new RegExp('^(https?:\\/\\/)' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$', 'i');

    if (!longUrl) {
      errors.longUrl = 'URL field cannot be empty.';
    } else if (!urlPattern.test(longUrl)) {
      errors.longUrl = 'Please enter a valid URL (e.g., https://example.com).';
    }

    if (customAlias) {
      const aliasRegex = /^[a-zA-Z0-9-]+$/;
      if (!aliasRegex.test(customAlias)) {
        errors.customAlias = 'Only letters, numbers, and hyphens are allowed.';
      } else if (customAlias.length > 30) {
        errors.customAlias = 'Cannot exceed 30 characters.';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCopied(false);
    setShortUrlData(null); 
    setIsLoading(true);

    const validationErrors = validateUrl();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsLoading(false); 
      return;
    }

    try {
      const token = await getToken();
      const data = await createShortUrl(longUrl, expiresInDays || undefined, customAlias || undefined, token);
      setShortUrlData(data);
      toast.success('URL shortened successfully!');
    } catch (err) {
      toast.error(err.error || err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrlData || !shortUrlData.shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrlData.shortUrl);
      setIsCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      toast.error('Failed to copy URL.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
          Create New Link
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Paste your long URL below to instantly generate a short link and QR code.
        </p>
      </div>

      {/* Enterprise Form Container */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-200 overflow-hidden mb-8 transition-all hover:shadow-indigo-200/50">
        <form onSubmit={handleSubmit} noValidate>
          
          {/* TOP SECTION: Massive Unified Input */}
          <div className="p-3 bg-white">
            <div className={`flex flex-col md:flex-row relative bg-white rounded-2xl border transition-all overflow-hidden ${formErrors.longUrl ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50'}`}>
              
              <div className="hidden md:flex items-center pl-6 text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>

              <input
                type="url"
                placeholder="https://example.com/my-long-url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                disabled={isLoading}
                className="flex-grow text-lg md:text-xl py-6 px-6 md:pl-4 bg-transparent outline-none placeholder-slate-400 text-slate-900 w-full transition-all"
              />

              <button 
                type="submit" 
                disabled={isLoading} 
                className="m-2 md:my-2 md:mr-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-colors whitespace-nowrap shadow-md shadow-indigo-200 flex items-center justify-center min-w-[160px]"
              >
                {isLoading ? <Spinner size="small" /> : 'Shorten URL'}
              </button>
            </div>
            {formErrors.longUrl && <p className="text-red-500 text-sm mt-3 ml-4 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {formErrors.longUrl}</p>}
          </div>

          {/* BOTTOM SECTION: Settings */}
          <div className="border-t border-slate-100 bg-slate-50 p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Link Settings
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Custom Alias */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Custom Alias (Optional)</label>
                <div className={`flex bg-white rounded-xl border overflow-hidden transition-all ${formErrors.customAlias ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-50'}`}>
                  <span className="bg-slate-100 text-slate-500 px-4 py-3.5 border-r border-slate-200 font-mono text-sm flex items-center select-none">
                    sho.rt/
                  </span>
                  <input
                    type="text"
                    placeholder="my-brand-name"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    disabled={isLoading}
                    className="flex-grow px-4 py-3.5 outline-none font-mono text-slate-800 placeholder-slate-300 w-full min-w-[120px]"
                  />
                  <button
                    type="button"
                    onClick={handleSuggestAliases}
                    disabled={isSuggesting || isLoading}
                    className="px-4 py-2 m-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    {isSuggesting ? <Spinner size="small" /> : '✨ Suggest'}
                  </button>
                </div>
                
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setCustomAlias(sug); setFormErrors(prev => ({...prev, customAlias: null})) }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-full shadow-sm transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {formErrors.customAlias && (
                  <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {formErrors.customAlias}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">Use letters, numbers, and hyphens only.</p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Expiration Date</label>
                <div className="relative">
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white rounded-xl border border-slate-300 px-4 py-3.5 appearance-none outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all font-medium text-slate-700 cursor-pointer shadow-sm"
                  >
                    <option value="">Never Expires</option>
                    <option value="1">Expires in 1 Day</option>
                    <option value="7">Expires in 7 Days</option>
                    <option value="30">Expires in 30 Days</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Automatically delete this link from the database.</p>
              </div>

            </div>

          </div>
        </form>
      </div>

      {/* Result Section */}
      {shortUrlData && (
        <div className="bg-white border border-indigo-100 rounded-[2rem] p-8 shadow-xl shadow-indigo-100/30 animate-[fade-in_0.4s_ease-out] mb-8">
          <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Your Link is Ready
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* QR Code Container */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm ring-4 ring-slate-50">
                <QRCode 
                  id={`qr-${shortUrlData.urlCode}`}
                  value={shortUrlData.shortUrl}
                  size={128}
                  className="w-32 h-32 object-contain"
                  viewBox={`0 0 256 256`}
                />
              </div>
              <button 
                onClick={() => {
                  const svg = document.getElementById(`qr-${shortUrlData.urlCode}`);
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `qr-${shortUrlData.urlCode}.svg`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download QR
              </button>
            </div>
            
            <div className="flex-grow w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner" >
                <a
                  href={shortUrlData.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xl text-indigo-600 break-all hover:text-indigo-800 hover:underline transition-colors font-semibold"
                >
                  {shortUrlData.shortUrl}
                </a>
                <button 
                  type="button" 
                  className={`mt-4 sm:mt-0 w-full sm:w-auto px-8 py-3 rounded-xl text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${isCopied ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-indigo-600'}`} 
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-600">
                <svg className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-slate-800">Pro Tip:</span> This link is now active globally. Log in to your Dashboard to track click analytics, visitor geography, and device types in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center pb-12">
        <Link to="/" className="text-slate-500 hover:text-indigo-600 font-medium hover:underline inline-flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ShortenPage;
