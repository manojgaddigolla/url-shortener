import React, { useState } from "react";
import { createShortUrl } from "../services/apiService";
import Spinner from "../components/Spinner";

const HomePage = () => {

  const [longUrl, setLongUrl] = useState('');
  const [shortUrlData, setShortUrlData] = useState(null);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setIsCopied(false);
    setError('');
    setIsLoading(true);
    if (!longUrl) {
      setError('Please enter a URL to shorten.');
      setShortUrlData(null);
      return;
    }

    try {
      setError('');
      const response = await createShortUrl(longUrl);
      setShortUrlData(response.data);

    } catch (err) {

      const errorMessage = err.error || 'An unexpected error occurred.';
      setError(errorMessage);
      setShortUrlData(null);

      console.error('Error from API:', err);
    } finally {
      setIsLoading(false);
    }

  //   try {
  //     const data = await apiService.shortenUrl({ longUrl });
  //     setShortUrlData(data);
  //   } catch (err) {
  //     setError(err.message || 'An error occurred.');
  //   } 
  // };
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
    <div className="max-w-2xl mx-auto text-center">
       <h1 className="text-4xl font-bold mb-2">URL Shortener</h1>
       <p className="text-lg text-slate-600">Enter a long URL to make it short and easy to share!</p>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">

      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        
          
          <input
            type="url"
            placeholder="https://example.com"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            disabled={isLoading}
            className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        
        <button type="submit" disabled={isLoading}  className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 w-full sm:w-auto">
          {isLoading ? <Spinner size="small" /> : 'Shorten'}
        </button>
      </form>

   

      {shortUrlData && (
        <div className="mt-6 pt-6 border-t text-left" >

        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-md" >
          

            <a
              href={shortUrlData.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-600 break-all"
            >
              {shortUrlData.shortUrl}
            </a>
          <button type="button" className="bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-md text-sm font-semibold ml-4" onClick={handleCopy}>
               {isCopied ? 'Copied!' : 'Copy'}
            </button>
         
        </div>
        </div>
      )}

         {error && (
        <p className="mt-4 text-red-500" >
           {error}
        </p>
      )}
      </div>
    </div>
  );
};

export default HomePage;