import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const LinkAnalyticsModal = ({ link, onClose }) => {
  const modalRef = useRef(null);
  const [timeRange, setTimeRange] = useState('7D'); // '7D', '30D', 'ALL'

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!link) return null;

  const totalClicks = link.clicks || 0;
  const analytics = link.analytics || [];

  // Chart calculation (depends on timeRange)
  let chartLabels = [];
  let chartCounts = [];

  if (timeRange === '7D') {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: d.toISOString().split('T')[0], count: 0, label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
    });
    analytics.forEach(v => {
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
    analytics.forEach(v => {
      const dStr = new Date(v.timestamp).toISOString().split('T')[0];
      const match = days.find(d => d.date === dStr);
      if (match) match.count++;
    });
    chartLabels = days.map(d => d.label);
    chartCounts = days.map(d => d.count);
  } else {
    // ALL - group by month for the last 12 months
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return { key: `${d.getFullYear()}-${d.getMonth()}`, count: 0, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
    });
    analytics.forEach(v => {
      const d = new Date(v.timestamp);
      const match = months.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (match) match.count++;
    });
    chartLabels = months.map(m => m.label);
    chartCounts = months.map(m => m.count);
  }

  let topOS = { Windows: 0, macOS: 0, iOS: 0, Android: 0, Linux: 0, Other: 0 };
  let topBrowsers = { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0, Other: 0 };
  let topCities = {};
  let deviceTypes = { Desktop: 0, Mobile: 0, Tablet: 0, SmartTV: 0, Other: 0 };

  analytics.forEach(visit => {

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

    if (visit.city && visit.city !== 'Unknown') {
      topCities[visit.city] = (topCities[visit.city] || 0) + 1;
    }

    // Capitalize device type to match keys
    const device = visit.deviceType ? visit.deviceType.charAt(0).toUpperCase() + visit.deviceType.slice(1).toLowerCase() : 'Desktop';
    if (deviceTypes[device] !== undefined) {
      deviceTypes[device]++;
    } else {
      deviceTypes.Other++;
    }
  });

  const sortedOS = Object.entries(topOS).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedBrowsers = Object.entries(topBrowsers).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedCities = Object.entries(topCities).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sortedDevices = Object.entries(deviceTypes).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Chart data
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Clicks',
        data: chartCounts,
        borderColor: 'rgb(99, 102, 241)', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: '#94a3b8' }, // slate-400
        grid: { color: '#f1f5f9', drawBorder: false }, // slate-100
      },
      x: {
        ticks: { color: '#94a3b8' }, // slate-400
        grid: { display: false, drawBorder: false },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const handleDownloadCSV = () => {
    if (!analytics || analytics.length === 0) {
      alert('No data to download.');
      return;
    }

    const headers = ['Date', 'Time', 'Country', 'City', 'Device', 'OS', 'Browser', 'Referrer'];
    
    const rows = analytics.map(visit => {
      const d = new Date(visit.timestamp);
      const date = d.toLocaleDateString();
      const time = d.toLocaleTimeString();
      const country = visit.country || 'Unknown';
      const city = visit.city || 'Unknown';
      const device = visit.deviceType || 'Desktop';
      
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
      
      const referrer = visit.referrer || 'Direct';

      return `"${date}","${time}","${country}","${city}","${device}","${os}","${browser}","${referrer}"`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div 
        ref={modalRef} 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-slate-100 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Link Analytics</h2>
            <div className="flex items-center gap-2 mt-1">
              <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium hover:underline text-sm truncate max-w-[200px] sm:max-w-xs">
                {link.shortUrl.replace(/^https?:\/\//, '')}
              </a>
              <span className="text-slate-300">•</span>
              <a href={link.longUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 text-sm truncate max-w-[200px] sm:max-w-sm" title={link.longUrl}>
                {link.longUrl}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Main Chart */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-bold text-slate-900">Traffic Activity</h3>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hidden sm:inline-block">
                  {totalClicks} total clicks
                </span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['7D', '30D', 'ALL'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeRange === range 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {range === 'ALL' ? 'All Time' : range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72 w-full p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="border border-slate-100 rounded-xl p-5 bg-white">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Top Cities
              </h3>
              <div className="flex flex-col gap-3">
                {sortedCities.length > 0 ? sortedCities.map(([city, count]) => (
                  <div key={city} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium truncate pr-2">{city}</span>
                    <div className="flex items-center gap-3 w-1/2 shrink-0">
                      <div className="h-2 bg-sky-50 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(count / Math.max(totalClicks, 1)) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right font-medium">{count}</span>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-400 py-2">No city data available</div>}
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-white">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                Device Types
              </h3>
              <div className="flex flex-col gap-3">
                {sortedDevices.length > 0 ? sortedDevices.map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium capitalize truncate pr-2">{device}</span>
                    <div className="flex items-center gap-3 w-1/2 shrink-0">
                      <div className="h-2 bg-amber-50 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / Math.max(totalClicks, 1)) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right font-medium">{count}</span>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-400 py-2">No device data available</div>}
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-white">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Top OS
              </h3>
              <div className="flex flex-col gap-3">
                {sortedOS.length > 0 ? sortedOS.map(([os, count]) => (
                  <div key={os} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium truncate pr-2">{os}</span>
                    <div className="flex items-center gap-3 w-1/2 shrink-0">
                      <div className="h-2 bg-indigo-50 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / Math.max(totalClicks, 1)) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right font-medium">{count}</span>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-400 py-2">No OS data available</div>}
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-white">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                Top Browsers
              </h3>
              <div className="flex flex-col gap-3">
                {sortedBrowsers.length > 0 ? sortedBrowsers.map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium truncate pr-2">{browser}</span>
                    <div className="flex items-center gap-3 w-1/2 shrink-0">
                      <div className="h-2 bg-emerald-50 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / Math.max(totalClicks, 1)) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right font-medium">{count}</span>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-400 py-2">No browser data available</div>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAnalyticsModal;
