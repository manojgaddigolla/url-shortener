import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const LinkAnalyticsModal = ({ link, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Basic State
  const [timeRange, setTimeRange] = useState('7D'); // '7D', '30D', 'ALL'
  
  // Advanced State
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'raw'
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Cross-Filtering State
  const [filters, setFilters] = useState({
    os: null,
    browser: null,
    city: null,
    country: null,
    device: null,
    referrer: null
  });

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!link) return null;

  const rawAnalytics = link.analytics || [];

  // Helper to normalize user agents
  const parseVisit = (visit) => {
    const ua = visit.userAgent ? visit.userAgent.toLowerCase() : '';
    let os = 'Other';
    if (ua.includes('win')) os = 'Windows';
    else if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipad')) os = 'macOS';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('linux')) os = 'Linux';
    
    let browser = 'Other';
    if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';

    let cleanRef = visit.referrer || 'Direct';
    try {
      if (cleanRef !== 'Direct') {
         cleanRef = new URL(cleanRef).hostname.replace('www.', '');
      }
    } catch(e) {}

    const device = visit.deviceType ? visit.deviceType.charAt(0).toUpperCase() + visit.deviceType.slice(1).toLowerCase() : 'Desktop';
    const city = visit.city || 'Unknown';
    const country = visit.country || 'Unknown';

    return { ...visit, parsedOS: os, parsedBrowser: browser, parsedReferrer: cleanRef, parsedDevice: device, parsedCity: city, parsedCountry: country };
  };

  const parsedRawAnalytics = useMemo(() => rawAnalytics.map(parseVisit), [rawAnalytics]);

  // 1. Filter Analytics based on mode and cross-filters
  const filteredAnalytics = useMemo(() => {
    if (!isAdvancedMode) return parsedRawAnalytics;
    
    return parsedRawAnalytics.filter(visit => {
      // Date Filter
      const visitDate = new Date(visit.timestamp);
      const start = customStartDate ? new Date(customStartDate) : new Date(0);
      const end = customEndDate ? new Date(customEndDate) : new Date();
      end.setHours(23, 59, 59, 999);
      if (visitDate < start || visitDate > end) return false;

      // Cross-Filters
      if (filters.os && visit.parsedOS !== filters.os) return false;
      if (filters.browser && visit.parsedBrowser !== filters.browser) return false;
      if (filters.city && visit.parsedCity !== filters.city) return false;
      if (filters.country && visit.parsedCountry !== filters.country) return false;
      if (filters.device && visit.parsedDevice !== filters.device) return false;
      if (filters.referrer && visit.parsedReferrer !== filters.referrer) return false;

      return true;
    });
  }, [parsedRawAnalytics, isAdvancedMode, customStartDate, customEndDate, filters]);

  // 2. Compute Top Level Metrics
  const totalClicks = isAdvancedMode ? filteredAnalytics.length : (link.clicks || 0);
  
  const uniqueVisitors = useMemo(() => {
    const ips = new Set();
    filteredAnalytics.forEach(visit => {
      if (visit.ip) ips.add(visit.ip);
    });
    return ips.size;
  }, [filteredAnalytics]);

  // 3. Main Chart Calculation
  let chartLabels = [];
  let chartCounts = [];
  let chartUniqueCounts = [];

  if (!isAdvancedMode) {
    if (timeRange === '7D') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().split('T')[0], count: 0, label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
      });
      filteredAnalytics.forEach(v => {
        const dStr = new Date(v.timestamp).toISOString().split('T')[0];
        const match = days.find(d => d.date === dStr);
        if (match) match.count++;
      });
      chartLabels = days.map(d => d.label);
      chartCounts = days.map(d => d.count);
    } else if (timeRange === '30D') {
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return { date: d.toISOString().split('T')[0], count: 0, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      });
      filteredAnalytics.forEach(v => {
        const dStr = new Date(v.timestamp).toISOString().split('T')[0];
        const match = days.find(d => d.date === dStr);
        if (match) match.count++;
      });
      chartLabels = days.map(d => d.label);
      chartCounts = days.map(d => d.count);
    } else {
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return { key: `${d.getFullYear()}-${d.getMonth()}`, count: 0, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
      });
      filteredAnalytics.forEach(v => {
        const d = new Date(v.timestamp);
        const match = months.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
        if (match) match.count++;
      });
      chartLabels = months.map(m => m.label);
      chartCounts = months.map(m => m.count);
    }
  } else {
    // Advanced Mode Chart Calculation (Dual Axis ready)
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 90) {
      // Group by day
      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
         days.push({
           date: d.toISOString().split('T')[0],
           count: 0,
           uniqueSet: new Set(),
           label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
         });
      }
      filteredAnalytics.forEach(v => {
        const dStr = new Date(v.timestamp).toISOString().split('T')[0];
        const match = days.find(d => d.date === dStr);
        if (match) {
          match.count++;
          if (v.ip) match.uniqueSet.add(v.ip);
        }
      });
      chartLabels = days.map(d => d.label);
      chartCounts = days.map(d => d.count);
      chartUniqueCounts = days.map(d => d.uniqueSet.size);
    } else {
      // Group by month
      const monthsMap = {};
      filteredAnalytics.forEach(v => {
        const d = new Date(v.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
        if (!monthsMap[key]) {
           monthsMap[key] = {
             count: 0,
             uniqueSet: new Set(),
             label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
           };
        }
        monthsMap[key].count++;
        if (v.ip) monthsMap[key].uniqueSet.add(v.ip);
      });
      const sortedKeys = Object.keys(monthsMap).sort();
      chartLabels = sortedKeys.map(k => monthsMap[k].label);
      chartCounts = sortedKeys.map(k => monthsMap[k].count);
      chartUniqueCounts = sortedKeys.map(k => monthsMap[k].uniqueSet.size);
    }
  }

  // 4. Compute Cards & Pro Visualizations
  let topOS = { Windows: 0, macOS: 0, iOS: 0, Android: 0, Linux: 0, Other: 0 };
  let topBrowsers = { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0, Other: 0 };
  let topCities = {};
  let topCountries = {};
  let deviceTypes = { Desktop: 0, Mobile: 0, Tablet: 0, SmartTV: 0, Other: 0 };
  let topReferrers = {};
  let hourlyCounts = Array(24).fill(0);

  filteredAnalytics.forEach(visit => {
    if (topOS[visit.parsedOS] !== undefined) topOS[visit.parsedOS]++;
    if (topBrowsers[visit.parsedBrowser] !== undefined) topBrowsers[visit.parsedBrowser]++;
    
    topCities[visit.parsedCity] = (topCities[visit.parsedCity] || 0) + 1;
    topCountries[visit.parsedCountry] = (topCountries[visit.parsedCountry] || 0) + 1;
    
    if (deviceTypes[visit.parsedDevice] !== undefined) deviceTypes[visit.parsedDevice]++;
    
    topReferrers[visit.parsedReferrer] = (topReferrers[visit.parsedReferrer] || 0) + 1;
    
    const hour = new Date(visit.timestamp).getHours();
    hourlyCounts[hour]++;
  });

  const sortedOS = Object.entries(topOS).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedBrowsers = Object.entries(topBrowsers).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedCities = Object.entries(topCities).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedCountries = Object.entries(topCountries).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sortedDevices = Object.entries(deviceTypes).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  const sortedReferrers = Object.entries(topReferrers).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Chart configs
  const datasets = [
    {
      fill: true,
      label: 'Total Clicks',
      data: chartCounts,
      borderColor: 'rgb(99, 102, 241)', 
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ];

  if (isAdvancedMode) {
    datasets.push({
      fill: false,
      label: 'Unique Visitors',
      data: chartUniqueCounts,
      borderColor: 'rgb(16, 185, 129)', // emerald-500
      tension: 0.4,
      pointBackgroundColor: 'rgb(16, 185, 129)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  const chartData = { labels: chartLabels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: isAdvancedMode, position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: { family: 'Inter', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, weight: 'bold', family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: '#64748b' },
        grid: { color: '#f1f5f9', drawBorder: false },
      },
      x: {
        ticks: { color: '#64748b', maxTicksLimit: 12 },
        grid: { display: false, drawBorder: false },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  // Hourly Bar Chart
  const hourlyChartData = {
    labels: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
    datasets: [{
      label: 'Clicks',
      data: hourlyCounts,
      backgroundColor: 'rgba(139, 92, 246, 0.9)', // violet-500
      borderRadius: 4,
    }]
  };
  
  const hourlyChartOptions = {
     responsive: true, maintainAspectRatio: false,
     plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } } },
     scales: { y: { display: false }, x: { grid: { display: false }, ticks: { maxTicksLimit: 24, color: '#94a3b8', font: { size: 10 } } } }
  };

  // Device Doughnut Chart
  const deviceChartData = {
    labels: sortedDevices.map(d => d[0]),
    datasets: [{
      data: sortedDevices.map(d => d[1]),
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6'],
      borderWidth: 0,
    }]
  };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 12, family: 'Inter' }, color: '#475569', padding: 16 } } },
    cutout: '75%'
  };

  const handleDownloadCSV = () => {
    if (!filteredAnalytics || filteredAnalytics.length === 0) {
      toast.error('No data to download.');
      return;
    }

    const headers = ['Date', 'Time', 'Country', 'City', 'Device', 'OS', 'Browser', 'Referrer'];
    
    const rows = filteredAnalytics.map(visit => {
      const d = new Date(visit.timestamp);
      const date = d.toLocaleDateString();
      const time = d.toLocaleTimeString();
      return `"${date}","${time}","${visit.parsedCountry}","${visit.parsedCity}","${visit.parsedDevice}","${visit.parsedOS}","${visit.parsedBrowser}","${visit.parsedReferrer}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const linkObj = document.createElement('a');
    linkObj.href = url;
    linkObj.setAttribute('download', `analytics_${link.urlCode}.csv`);
    document.body.appendChild(linkObj);
    linkObj.click();
    document.body.removeChild(linkObj);
  };

  const toggleFilter = (type, value) => {
    if (!isAdvancedMode) {
        setIsAdvancedMode(true);
    }
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setFilters({ os: null, browser: null, city: null, country: null, device: null, referrer: null });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Close Button */}
          <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            <span className="font-medium">Close</span>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              Analytics 
              <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200/60">
                <button
                  onClick={() => setIsAdvancedMode(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${!isAdvancedMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setIsAdvancedMode(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1 ${isAdvancedMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  Pro Engine
                </button>
              </div>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline text-sm truncate max-w-xs">
                {link.shortUrl.replace(/^https?:\/\//, '')}
              </a>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-sm truncate max-w-sm">{link.longUrl}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAdvancedMode && (
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 mr-4">
                <button onClick={() => setViewMode('charts')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'charts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  Visuals
                </button>
                <button onClick={() => setViewMode('raw')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  Raw Data
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">AI Ready</span>
                </button>
             </div>
          )}
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-6 py-8">
        
        {/* Active Filters Bar */}
        {isAdvancedMode && activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
            <span className="text-sm font-semibold text-indigo-900 mr-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Active Filters:
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm animate-in zoom-in-95 duration-200">
                  <span className="capitalize text-indigo-400 font-normal">{key}:</span> {value}
                  <button onClick={() => toggleFilter(key, value)} className="ml-1 hover:text-indigo-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              );
            })}
            <button onClick={clearFilters} className="ml-auto text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">
              Clear All
            </button>
          </div>
        )}

        {/* View Router */}
        {viewMode === 'charts' ? (
          <>
            {/* Top Metrics & Chart */}
            <div className="mb-8 saas-card p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-xl font-bold text-slate-900">Traffic Activity</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {totalClicks} {isAdvancedMode ? 'Filtered Clicks' : 'Total Clicks'}
                    </span>
                    {isAdvancedMode && (
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        {uniqueVisitors} Unique
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Filters */}
                {isAdvancedMode ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <input 
                      type="date" 
                      value={customStartDate}
                      max={today}
                      onChange={(e) => { if (e.target.value <= today) setCustomStartDate(e.target.value); }}
                      className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                    <span className="text-slate-400 text-sm font-medium">to</span>
                    <input 
                      type="date" 
                      value={customEndDate}
                      max={today}
                      onChange={(e) => { if (e.target.value <= today) setCustomEndDate(e.target.value); }}
                      className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                ) : (
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['7D', '30D', 'ALL'].map(range => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                          timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {range === 'ALL' ? 'All Time' : range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="h-[400px] w-full mt-4">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Pro Exclusive Charts (Heatmap) */}
            {isAdvancedMode && (
              <div className="mb-8 saas-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Audience Activity (Time of Day)
                  <span className="text-xs font-normal text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">Local Timezone</span>
                </h3>
                <div className="h-48 w-full">
                  <Bar data={hourlyChartData} options={hourlyChartOptions} />
                </div>
              </div>
            )}

            {/* Metric Cards Grid - Cross Filtering enabled */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Render Metric Card Helper */}
              {(() => {
                const renderCard = (title, icon, data, type, colorClass, isDoughnut = false) => (
                  <div className="saas-card p-6 flex flex-col h-full">
                    <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                      {icon}
                      {title}
                    </h3>
                    
                    {isDoughnut ? (
                      <div className="h-48 w-full flex-grow flex items-center justify-center">
                         {data.length > 0 ? (
                           <div className="h-full w-full relative group">
                             {/* Hint overlay for filtering */}
                             <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full">
                                <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Click legend to filter</span>
                             </div>
                             <Doughnut 
                               data={{
                                 labels: data.map(d => d[0]),
                                 datasets: [{
                                   data: data.map(d => d[1]),
                                   backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6'],
                                   borderWidth: 0,
                                 }]
                               }} 
                               options={{
                                 ...doughnutOptions,
                                 onClick: (event, elements, chart) => {
                                    if (elements.length > 0) {
                                      const idx = elements[0].index;
                                      toggleFilter(type, data[idx][0]);
                                    }
                                 }
                               }} 
                              />
                           </div>
                         ) : (
                           <div className="text-sm text-slate-400">No data available</div>
                         )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 flex-grow justify-start">
                        {data.length > 0 ? data.map(([label, count]) => {
                          const isActive = filters[type] === label;
                          return (
                            <button 
                              key={label}
                              onClick={() => toggleFilter(type, label)}
                              className={`flex items-center justify-between text-sm group text-left transition-all p-1.5 -mx-1.5 rounded-lg ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'}`}
                            >
                              <span className={`font-semibold truncate pr-3 flex-grow ${isActive ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'} ${title === 'Top Browsers' || title === 'Top Referrers' ? 'capitalize' : ''}`}>
                                {label}
                              </span>
                              <div className="flex items-center gap-3 w-1/2 shrink-0">
                                <div className={`h-2 rounded-full w-full overflow-hidden ${isActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                  <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${(count / Math.max(totalClicks, 1)) * 100}%` }}></div>
                                </div>
                                <span className={`text-xs w-10 text-right font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>{count}</span>
                              </div>
                            </button>
                          );
                        }) : <div className="text-sm text-slate-400 py-2">No data available</div>}
                      </div>
                    )}
                  </div>
                );

                return (
                  <>
                    {isAdvancedMode && renderCard(
                      'Top Referrers', 
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>,
                      sortedReferrers, 'referrer', 'bg-purple-500'
                    )}
                    
                    {renderCard(
                      'Top Cities',
                      <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
                      sortedCities, 'city', 'bg-sky-500'
                    )}

                    {isAdvancedMode && renderCard(
                      'Top Countries',
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                      sortedCountries, 'country', 'bg-pink-500'
                    )}

                    {renderCard(
                      'Device Types',
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
                      sortedDevices, 'device', 'bg-amber-500', isAdvancedMode
                    )}

                    {renderCard(
                      'Top OS',
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
                      sortedOS, 'os', 'bg-indigo-500'
                    )}

                    {renderCard(
                      'Top Browsers',
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>,
                      sortedBrowsers, 'browser', 'bg-emerald-500'
                    )}
                  </>
                );
              })()}
            </div>
          </>
        ) : (
          /* RAW DATA TABLE VIEW */
          <div className="saas-card overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">OS & Browser</th>
                    <th className="px-6 py-4">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAnalytics.length > 0 ? filteredAnalytics.map((visit, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700 font-medium">
                         {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                         {visit.ip || 'Hidden'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{visit.parsedCity}</span>
                          <span className="text-slate-500 text-xs">{visit.parsedCountry}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 capitalize">
                         {visit.parsedDevice}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{visit.parsedOS}</span>
                          <span className="text-slate-500 text-xs">{visit.parsedBrowser}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 capitalize">
                         {visit.parsedReferrer}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                        No traffic data matches these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
              <span>Showing {filteredAnalytics.length} filtered events</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live AI Context Ready</span>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
};

export default LinkAnalyticsModal;
