import React, { useState } from "react";
import { createShortUrl } from "../services/apiService";
import Spinner from "../components/Spinner";

const HomePage = () => {

  const [longUrl, setLongUrl] = useState('');
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
      const data = await createShortUrl({ longUrl });
      setShortUrlData(data);
    } catch (err) {
      setServerError(err.message || 'An error occurred.');
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
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-2">URL Shortener</h1>
      <p className="text-lg text-slate-600">Enter a long URL to make it short and easy to share!</p>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">


        <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-4">


          <input
            type="url"
            placeholder="https://example.com"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            disabled={isLoading}
            className="flex-grow p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />

          {formErrors.longUrl && (
            <p className="text-red-500 text-sm text-left mt-1">{formErrors.longUrl}</p>
          )}

          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 w-full sm:w-auto">
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

        {serverError && <p className="mt-4 text-red-500">{serverError}</p>}
      </div>
    </div>
  );
};

export default HomePage;