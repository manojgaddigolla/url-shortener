import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { getUserLinks, deleteUserLink, updateUserLink } from '../services/linkService';
import Spinner from '../components/Spinner';
import LinkAnalyticsModal from '../components/LinkAnalyticsModal';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState(null);
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [newExpiryDays, setNewExpiryDays] = useState('');
  const [selectedQRLink, setSelectedQRLink] = useState(null);

  const { getToken, isLoaded } = useAuth();

  const fetchLinks = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await getUserLinks(token);
        const normalizedData = Array.isArray(response) ? response : 
                               (response?.data && Array.isArray(response.data) ? response.data :
                                response?.links && Array.isArray(response.links) ? response.links : []);
        setLinks(normalizedData);
      } else {
        setError('You are not authorized to view this page. Please log in.');
      }
    } catch (err) {
      console.error("Failed to fetch links:", err);
      setError(err.error || err.message || JSON.stringify(err) || 'Could not load your links at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    fetchLinks();
  }, [isLoaded]);


  const handleCopy = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setCopiedLinkId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      toast.error('Failed to copy URL.');
    }
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;
    setIsDeletingId(linkToDelete);
    try {
      const token = await getToken();
      await deleteUserLink(token, linkToDelete);
      setLinks((prevLinks) => prevLinks.filter(link => link._id !== linkToDelete));
      toast.success('Link deleted successfully!');
    } catch (err) {
      console.error('Failed to delete URL: ', err);
      toast.error(err.message || 'Failed to delete URL.');
    } finally {
      setIsDeletingId(null);
      setLinkToDelete(null);
    }
  };

  const handleUpdateExpiry = async (id) => {
    try {
      if (!newExpiryDays) {
        setEditingExpiryId(null);
        return;
      }
      const token = await getToken();
      const updatedLinkResponse = await updateUserLink(token, id, { expiresInDays: newExpiryDays });
      if (updatedLinkResponse.success) {
        const updatedLinks = links.map(link => 
          link._id === id ? updatedLinkResponse.data : link
        );
        setLinks(updatedLinks);
        setEditingExpiryId(null);
        toast.success('Expiry updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update expiry', err);
      toast.error('Failed to update expiry');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const downloadQR = (shortUrl, urlCode) => {
    try {
      const svg = document.getElementById(`qr-${urlCode}`);
      if (!svg) {
        toast.error('Please view the QR code first before downloading.');
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-${urlCode}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('QR Code downloaded!');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      toast.error('Failed to download QR code.');
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
  let topCountries = {};
  let topCities = {};
  let deviceTypes = { Desktop: 0, mobile: 0, tablet: 0, smarttv: 0, Other: 0 };

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

        if (visit.country && visit.country !== 'Unknown') {
          topCountries[visit.country] = (topCountries[visit.country] || 0) + 1;
        }

        if (visit.city && visit.city !== 'Unknown') {
          topCities[visit.city] = (topCities[visit.city] || 0) + 1;
        }

        const device = visit.deviceType || 'Desktop';
        if (deviceTypes[device] !== undefined) {
          deviceTypes[device]++;
        } else {
          deviceTypes.Other++;
        }
      });
    }
  });

  const maxClicksInDay = Math.max(...last7Days.map(d => d.count), 1);

  const sortedOS = Object.entries(topOS).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedBrowsers = Object.entries(topBrowsers).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedCountries = Object.entries(topCountries).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedCities = Object.entries(topCities).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedDevices = Object.entries(deviceTypes).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="saas-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Links</h3>
            <p className="text-4xl font-extrabold text-slate-900">{totalLinks}</p>
          </div>
          <div className="saas-card p-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Clicks</h3>
            <p className="text-4xl font-extrabold text-indigo-600">{totalClicks}</p>
          </div>
          
          <div className="saas-card p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Top Cities</h3>
            <div className="flex flex-col gap-2">
              {sortedCities.length > 0 ? sortedCities.map(([city, count]) => (
                <div key={city} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{city}</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="h-2 bg-sky-100 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(count / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              )) : <span className="text-sm text-slate-400">No data yet</span>}
            </div>
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

          <div className="saas-card p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Device Types</h3>
            <div className="flex flex-col gap-2">
              {sortedDevices.length > 0 ? sortedDevices.map(([device, count]) => (
                <div key={device} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium capitalize">{device}</span>
                  <div className="flex items-center gap-2 w-1/2">
                    <div className="h-2 bg-amber-100 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                </div>
              )) : <span className="text-sm text-slate-400">No data yet</span>}
            </div>
          </div>

          <div className="saas-card p-6 lg:col-span-3">
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
                            <QRCode 
                              id={`qr-thumb-${link.urlCode}`}
                              value={link.shortUrl} 
                              size={40}
                              className="w-10 h-10 border border-slate-200 rounded p-1 bg-white hidden sm:block cursor-pointer hover:border-indigo-300 transition-colors" 
                              onClick={() => setSelectedQRLink(link)}
                              viewBox={`0 0 256 256`}
                            />
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
                          {editingExpiryId === link._id ? (
                            <div className="flex items-center justify-center gap-1">
                              <select 
                                value={newExpiryDays}
                                onChange={(e) => setNewExpiryDays(e.target.value)}
                                className="text-xs border border-slate-300 rounded py-1 px-1 text-slate-700 bg-white"
                              >
                                <option value="">Select...</option>
                                <option value="1">1 Day</option>
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="never">Never</option>
                              </select>
                              <button onClick={() => handleUpdateExpiry(link._id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              </button>
                              <button onClick={() => setEditingExpiryId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Cancel">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center justify-center gap-2 group cursor-pointer" 
                              onClick={() => { setEditingExpiryId(link._id); setNewExpiryDays(''); }}
                              title="Click to edit expiry"
                            >
                              {link.expiresAt ? (
                                isExpired ? (
                                  <span className="text-red-600 font-medium">Expired</span>
                                ) : (
                                  formatDate(link.expiresAt)
                                )
                              ) : (
                                <span className="text-slate-400">Never</span>
                              )}
                              <svg className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            className="p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                            onClick={() => setSelectedLinkAnalytics(link)}
                            title="View Analytics"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                          </button>
                          <button 
                            className="p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                            onClick={() => {
                              setSelectedQRLink(link);
                              setTimeout(() => downloadQR(link.shortUrl, link.urlCode), 50);
                            }}
                            title="Download QR Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </button>
                          <button 
                            className={`p-2 rounded-md transition-all ${copiedLinkId === link._id ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50'}`} 
                            onClick={() => handleCopy(link.shortUrl, link._id)}
                            title="Copy Link"
                          >
                            {copiedLinkId === link._id ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                            )}
                          </button>
                          <button 
                            className="p-2 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                            onClick={() => setLinkToDelete(link._id)}
                            disabled={isDeletingId === link._id}
                            title="Delete Link"
                          >
                            {isDeletingId === link._id ? (
                               <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            ) : (
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            )}
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

      {selectedLinkAnalytics && (
        <LinkAnalyticsModal 
          link={selectedLinkAnalytics} 
          onClose={() => setSelectedLinkAnalytics(null)} 
        />
      )}

      {selectedQRLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedQRLink(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scan QR Code</h3>
            <p className="text-sm text-slate-500 mb-6 truncate px-4" title={selectedQRLink.shortUrl}>{selectedQRLink.shortUrl}</p>
            <div className="flex justify-center mb-6">
              <QRCode 
                id={`qr-${selectedQRLink.urlCode}`}
                value={selectedQRLink.shortUrl} 
                size={256}
                className="w-64 h-64 border-2 border-slate-100 rounded-xl p-2"
                viewBox={`0 0 256 256`}
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => downloadQR(selectedQRLink.shortUrl, selectedQRLink.urlCode)}
                className="flex-1 bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Download
              </button>
              <button 
                onClick={() => setSelectedQRLink(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-medium py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" onClick={() => setLinkToDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Link</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete this link? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
              >
                Delete
              </button>
              <button 
                onClick={() => setLinkToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;