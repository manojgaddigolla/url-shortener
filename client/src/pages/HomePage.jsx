import React, { useState } from "react";
import { createShortUrl } from "../services/apiService";
import Spinner from "../components/Spinner";

const HomePage = () => {

  const [longUrl, setLongUrl] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [shortUrlData, setShortUrlData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
    return errors;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setIsCopied(false);
    setServerError('');
    setShortUrlData(null); // Clear previous result
    setIsLoading(true);

    const validationErrors = validateUrl();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsLoading(false); // Clear loading state on validation failure
      return;
    }

    try {
      const data = await createShortUrl(longUrl, expiresInDays || undefined);
      setShortUrlData(data);
    } catch (err) {
      setServerError(err.error || err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }

  };

  const handleCopy = async () => {
    if (!shortUrlData || !shortUrlData.shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrlData.shortUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      alert('Failed to copy URL.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
          Simplify Your Links
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
          Create short, memorable links in seconds. Perfect for social media, marketing campaigns, and everyday sharing.
        </p>
      </div>

      <div className="saas-card p-6 md:p-10 mb-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow flex flex-col relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
            <input
              type="url"
              placeholder="Paste your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              disabled={isLoading}
              className="saas-input w-full pl-12 pr-4 py-4 text-lg"
            />
            {formErrors.longUrl && (
              <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.longUrl}</p>
            )}
          </div>
          
          <div className="flex-grow md:max-w-[180px] flex flex-col relative">
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              disabled={isLoading}
              className="saas-input w-full px-4 py-4 text-lg appearance-none bg-white cursor-pointer"
            >
              <option value="">Never Expires</option>
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="saas-btn-primary px-8 py-4 text-lg md:w-auto w-full min-w-[140px]">
            {isLoading ? <Spinner size="small" /> : 'Shorten URL'}
          </button>
        </form>

        {shortUrlData && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-[fade-in_0.3s_ease-out]" >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your Link is Ready</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shortUrlData.shortUrl)}`} 
                    alt="QR Code" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <button 
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shortUrlData.shortUrl)}`;
                    fetch(qrUrl)
                      .then(res => res.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `qr-${shortUrlData.shortUrl.split('/').pop()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      });
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download
                </button>
              </div>
              
              <div className="flex-grow w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200" >
                  <a
                    href={shortUrlData.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-lg text-indigo-600 break-all hover:text-indigo-800 hover:underline transition-colors"
                  >
                    {shortUrlData.shortUrl}
                  </a>
                  <button type="button" className={`mt-4 sm:mt-0 w-full sm:w-auto px-6 py-2 rounded-md text-sm font-medium transition-all ${isCopied ? 'bg-emerald-500 text-white shadow-sm' : 'saas-btn-secondary'}`} onClick={handleCopy}>
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Share this link or scan the QR code to visit the destination.
                </p>
              </div>
            </div>
          </div>
        )}

        {serverError && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-medium">{serverError}</div>}
      </div>
    </div>
  );
};

export default HomePage;