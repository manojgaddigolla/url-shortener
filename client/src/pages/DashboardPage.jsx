import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserLinks, deleteUserLink } from '../services/linkService';
import Spinner from '../components/Spinner';

const DashboardPage = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { token, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchLinks = async () => {
    if (token) {
      try {
        const response = await getUserLinks(token);
        const normalizedData = Array.isArray(response) ? response : 
                               (response?.data && Array.isArray(response.data) ? response.data :
                                response?.links && Array.isArray(response.links) ? response.links : []);
        setLinks(normalizedData);
      } catch (err) {
        console.error("Failed to fetch links:", err);
        const errorMessage = err.error || 'Could not load your links at this time.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setError('You are not authorized to view this page. Please log in.');
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchLinks();
  }, [token, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCopy = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => {
        setCopiedLinkId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      alert('Failed to copy URL.');
    }
  };

  const handleDelete = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    
    setIsDeletingId(linkId);
    try {
      await deleteUserLink(token, linkId);
      setLinks(links.filter(link => link._id !== linkId));
    } catch (err) {
      console.error('Failed to delete URL: ', err);
      alert(err.message || 'Failed to delete URL.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const downloadQR = async (shortUrl, urlCode) => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shortUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-${urlCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download QR code:', err);
      alert('Failed to download QR code.');
    }
  };

  const filteredLinks = links.filter(link => 
    link.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.longUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate analytics data
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  
  // Calculate clicks for last 7 days
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // 6 to 0 days ago
    return { 
      date: d.toISOString().split('T')[0], 
      count: 0, 
      label: d.toLocaleDateString('en-US', {weekday: 'short'}) 
    };
  });

  let topOS = { Windows: 0, macOS: 0, iOS: 0, Android: 0, Linux: 0, Other: 0 };
  let topBrowsers = { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0, Other: 0 };

  links.forEach(link => {
    if (link.analytics && link.analytics.length > 0) {
      link.analytics.forEach(visit => {
        const visitDateStr = new Date(visit.timestamp).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.date === visitDateStr);
        if (dayMatch) {
          dayMatch.count++;
        }

        const ua = visit.userAgent ? visit.userAgent.toLowerCase() : '';
        if (ua.includes('win')) topOS.Windows++;
        else if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipad')) topOS.macOS++;
        else if (ua.includes('iphone') || ua.includes('ipad')) topOS.iOS++;
        else if (ua.includes('android')) topOS.Android++;
        else if (ua.includes('linux')) topOS.Linux++;
        else topOS.Other++;

        if (ua.includes('edg')) topBrowsers.Edge++;
        else if (ua.includes('chrome')) topBrowsers.Chrome++;
        else if (ua.includes('safari') && !ua.includes('chrome')) topBrowsers.Safari++;
        else if (ua.includes('firefox')) topBrowsers.Firefox++;
        else topBrowsers.Other++;
      });
    }
  });

  const maxClicksInDay = Math.max(...last7Days.map(d => d.count), 1);

  const sortedOS = Object.entries(topOS).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedBrowsers = Object.entries(topBrowsers).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            My Dashboard
          </h2>
          <p className="text-slate-500">Manage your shortened URLs and track their performance.</p>
        </div>
      </div>

      {/* Analytics Overview */}
      {!isLoading && !error && links.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="saas-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Links</h3>
            <p className="text-4xl font-extrabold text-slate-900">{totalLinks}</p>
          </div>
          <div className="saas-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Clicks</h3>
            <p className="text-4xl font-extrabold text-indigo-600">{totalClicks}</p>
          </div>
          
          <div className="saas-card p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Top OS</h3>
            <div className="flex flex-col gap-2">
              {sortedOS.length > 0 ? sortedOS.map(([os, count]) => (
                <div key={os} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{os}</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="h-2 bg-indigo-100 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              )) : <span className="text-sm text-slate-400">No data yet</span>}
            </div>
          </div>

          <div className="saas-card p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Top Browsers</h3>
            <div className="flex flex-col gap-2">
              {sortedBrowsers.length > 0 ? sortedBrowsers.map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{browser}</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="h-2 bg-emerald-100 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              )) : <span className="text-sm text-slate-400">No data yet</span>}
            </div>
          </div>

          <div className="saas-card p-6 lg:col-span-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Clicks (Last 7 Days)</h3>
            <div className="flex items-end justify-between h-24 gap-2">
              {last7Days.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group h-full">
                  <div className="w-full relative flex justify-center h-full items-end">
                    <div 
                      className="w-full bg-indigo-100 hover:bg-indigo-300 rounded-t-sm transition-all duration-300 relative group-hover:bg-indigo-400"
                      style={{ height: `${(day.count / maxClicksInDay) * 100}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                        {day.count} clicks
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 font-medium">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 mt-12 gap-4">
        <h3 className="text-xl font-bold text-slate-900">Your Links</h3>
        {links.length > 0 && (
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search links..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saas-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        )}
      </div>
      <div className="saas-card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center">
            <Spinner />
          </div>
        ) :
          error ? (
            <div className="p-8 text-center bg-red-50 text-red-600 border-b border-red-100">{error}</div>
          ) :
            links.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Short Link</th>
                      <th className="px-6 py-4 font-semibold hidden md:table-cell">Original URL</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                      <th className="px-6 py-4 font-semibold text-center">Clicks</th>
                      <th className="px-6 py-4 font-semibold text-center hidden md:table-cell">Expires</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredLinks.length > 0 ? filteredLinks.map((link) => {
                      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                      return (
                      <tr key={link._id} className={`transition-colors ${isExpired ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${encodeURIComponent(link.shortUrl)}`} alt="QR" className="w-10 h-10 border border-slate-200 rounded p-1 bg-white hidden sm:block" />
                            <div>
                              <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                {link.shortUrl.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell max-w-[200px] lg:max-w-[300px] truncate">
                          <a href={link.longUrl} title={link.longUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 hover:underline">
                            {link.longUrl}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(link.date)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {link.clicks}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 hidden md:table-cell">
                          {link.expiresAt ? (
                            isExpired ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : (
                              formatDate(link.expiresAt)
                            )
                          ) : (
                            <span className="text-slate-400">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            className="px-3 py-1.5 text-xs rounded-md font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
                            onClick={() => downloadQR(link.shortUrl, link.urlCode)}
                            title="Download QR Code"
                          >
                            <svg className="w-3.5 h-3.5 inline-block -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </button>
                          <button 
                            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${copiedLinkId === link._id ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`} 
                            onClick={() => handleCopy(link.shortUrl, link._id)}
                          >
                            {copiedLinkId === link._id ? 'Copied' : 'Copy'}
                          </button>
                          <button 
                            className="px-3 py-1.5 text-xs rounded-md font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            onClick={() => handleDelete(link._id)}
                            disabled={isDeletingId === link._id}
                          >
                            {isDeletingId === link._id ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          No links match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No links created yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Go to the homepage and create your first short link. All your generated links will appear here.</p>
                <button onClick={() => navigate('/')} className="saas-btn-primary px-6 py-2.5 inline-flex mx-auto">
                  Create a Link
                </button>
              </div>
            )}
      </div>

    </div>
  );
};

export default DashboardPage;