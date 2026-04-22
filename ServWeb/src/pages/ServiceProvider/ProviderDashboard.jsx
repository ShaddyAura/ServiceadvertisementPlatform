import React, { useEffect, useState } from "react";
import { 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaStar, 
  FaUserClock,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { fetchAllBookings, fetchProfileById, GetStrikeStatus, claimDailyReward, getWallet, fetchAllServices, getServiceReviews } from "../../api/AccountApi";
import "./ProviderDashboard.css";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    completedJobs: 0,
    pointsSpent: 0,
    repeatClients: 0
  });
  
  const [smartAlerts, setSmartAlerts] = useState({ pending: 0, unpaid: 0, lowBalance: false, balance: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  
  const [earningsData, setEarningsData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const [profile, setProfile] = useState({ boostingPoints: 0, fullName: "Provider", walletId: null });
  const [strikeInfo, setStrikeInfo] = useState({ canClaim: false, currentStrike: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [topServices, setTopServices] = useState([]);

  useEffect(() => {
    const getDashboardStats = async () => {
      try {
        const res = await fetchAllBookings();
        let allBookings = res.data || [];
        
        // Fetch services to fix service title mapping issue
        try {
           const sRes = await fetchAllServices();
           const allSvc = sRes.data || [];
           allBookings = allBookings.map(b => {
              const sid = b.serviceId || b.ServiceId;
              const svc = allSvc.find(x => String(x.id||x.Id) === String(sid));
              return { ...b, service: svc || b.service };
           });
        } catch(e) { console.warn("Failed to stitch services", e); }
        
        // Ensure we only see bookings for the logged in PROVIDER
        const providerBookings = allBookings.filter(b => 
          String(b.providerProfileId || b.ProviderProfileId) === String(user?.profileId) || String(b.service?.profileId) === String(user?.profileId)
        );

        const completed = providerBookings.filter(b => {
          const s = b.status ?? b.Status;
          return s === 3 || s === 4 || s === "Completed" || s === "Paid";
        });
        const active = providerBookings.filter(b => {
          const s = b.status ?? b.Status;
          return s === 0 || s === 1 || s === 2 || s === "Pending" || s === "Confirmed" || s === "InProcess";
        });
        const earnings = completed.reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);
        // --- Repeat Customers & Smart Alerts ---
        const pendingCount = providerBookings.filter(b => (b.status ?? b.Status) === 0 || (b.status ?? b.Status) === "Pending").length;
        const unpaidCount = providerBookings.filter(b => (b.status ?? b.Status) === 3 || (b.status ?? b.Status) === "Completed").length;
        setSmartAlerts(prev => ({ ...prev, pending: pendingCount, unpaid: unpaidCount }));

        const clientCounts = {};
        providerBookings.forEach(b => {
             const pid = String(b.profileId || b.ProfileId || "unknown");
             if(!clientCounts[pid]) clientCounts[pid] = 0;
             clientCounts[pid]++;
        });
        const repeatCount = Object.values(clientCounts).filter(c => c > 1).length;

        setStats(prev => ({
          ...prev,
          totalEarnings: earnings,
          activeBookings: active.length,
          completedJobs: completed.length,
          repeatClients: repeatCount
        }));

        // --- Monthly Earnings Chart (Dynamic 6 months) ---
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthIdx = new Date().getMonth();
        
        const generatedMonthlyEarnings = [];
        for(let i=5; i>=0; i--) {
           let m = currentMonthIdx - i;
           if(m < 0) m += 12;
           generatedMonthlyEarnings.push({ month: months[m], monthIndex: m, earnings: 0 });
        }

        completed.forEach(b => {
            const d = new Date(b.scheduledEnd || b.ScheduledEnd || b.createdAt || b.CreatedAt);
            if(!isNaN(d.getTime())) {
                const bMonth = d.getMonth();
                const targetMatch = generatedMonthlyEarnings.find(m => m.monthIndex === bMonth);
                // Accept if it's within the trailing year
                if (targetMatch && d.getFullYear() >= (new Date().getFullYear() - 1)) {
                    targetMatch.earnings += (b.agreedPrice || b.AgreedPrice || 0);
                }
            }
        });
        setEarningsData(generatedMonthlyEarnings);

        // --- Weekly Jobs Chart (Group all recent jobs by Day) ---
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const generatedWeekStats = days.map(d => ({ day: d, jobs: 0 }));
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Add all jobs to the dynamic weekday graph
        providerBookings.forEach(b => {
             let rawDate = b.scheduledStart || b.ScheduledStart || b.createdAt || b.CreatedAt;
             if (typeof rawDate === 'string' && !rawDate.endsWith('Z')) {
                 rawDate += 'Z'; // Force UTC interpretation to fix timezone shift
             }
             const d = new Date(rawDate);
             if(!isNaN(d.getTime())) {
                 // Only count bookings arriving strictly within the current week bounds
                 if(d.getTime() >= startOfWeek.getTime() && d.getTime() <= endOfWeek.getTime()) {
                     generatedWeekStats[d.getDay()].jobs += 1;
                 }
             }
        });
        setWeeklyData(generatedWeekStats);

        // --- Recent Bookings Table (Top 5) ---
        const sortedDesc = [...providerBookings].sort(
            (a,b) => new Date(b.scheduledStart || b.createdAt) - new Date(a.scheduledStart || a.createdAt)
        );
        setRecentBookings(sortedDesc.slice(0, 5));

        // --- Upcoming Appointments (Top 3 ahead of now) ---
        const nowMs = now.getTime();
        const upcoming = providerBookings.filter(b => {
           let rawDate = b.scheduledStart || b.ScheduledStart || b.createdAt || b.CreatedAt;
           if (typeof rawDate === 'string' && !rawDate.endsWith('Z')) rawDate += 'Z';
           const bd = new Date(rawDate).getTime();
           
           const s = b.status ?? b.Status;
           const isPendingOrConfirmed = (s === 0 || s === 1 || s === "Pending" || s === "Confirmed");
           return isPendingOrConfirmed && bd >= (nowMs - 43200000); // 12 hours leniency
        }).sort((a,b) => {
           let da = new Date(a.scheduledStart || a.ScheduledStart || a.createdAt || a.CreatedAt).getTime();
           let db = new Date(b.scheduledStart || b.ScheduledStart || b.createdAt || b.CreatedAt).getTime();
           return da - db;
        }).slice(0, 3);
        setUpcomingAppointments(upcoming);

        // --- Top Performing Services (Top 3 by booking count) ---
        const svcGroups = {};
        providerBookings.forEach(b => {
           const sId = b.serviceId || b.ServiceId || "Unknown";
           const sTitle = b.service?.title || b.service?.Title || b.serviceListing?.title || "Unknown Service";
           if(!svcGroups[sId]) svcGroups[sId] = { title: sTitle, count: 0, revenue: 0 };
           
           svcGroups[sId].count += 1;
           const st = b.status ?? b.Status;
           if (st === 3 || st === 4 || st === "Completed" || st === "Paid") {
               svcGroups[sId].revenue += (b.agreedPrice || b.AgreedPrice || 0);
           }
        });
        const topSvc = Object.values(svcGroups).sort((a,b) => b.count - a.count).slice(0, 3);
        setTopServices(topSvc);

        // --- Fetch Live Service Reviews ---
        try {
           const mySvcObj = {};
           providerBookings.forEach(b => {
               const sid = b.serviceId || b.ServiceId;
               if(sid) mySvcObj[sid] = true;
           });
           const mySvcList = Object.keys(mySvcObj);
           const revPromises = mySvcList.map(id => getServiceReviews(id).catch(e => ({data: []})));
           const revResponses = await Promise.all(revPromises);
           
           let allRevs = [];
           revResponses.forEach(r => {
               if(r?.data && Array.isArray(r.data)) allRevs = allRevs.concat(r.data);
           });
           allRevs.sort((a,b) => new Date(b.createdAt || b.CreatedAt).getTime() - new Date(a.createdAt || a.CreatedAt).getTime());
           
           setRecentReviews(allRevs.slice(0, 4));
        } catch(e) { console.warn("Failed to stitch reviews", e); }

      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
      
      try {
        if (user?.profileId) {
          const profileRes = await fetchProfileById(user.profileId);
          const profData = profileRes.data || {};
          
          let combinedFullName = profData.fullName;
          if (!combinedFullName || ["User", "Provider", "Gamer"].includes(combinedFullName)) {
            combinedFullName = user.fullname;
          }
          if (!combinedFullName || ["User", "Provider", "Gamer"].includes(combinedFullName)) {
            if (user.email) {
              const namePart = user.email.split('@')[0].replace(/[0-9]/g, '');
              combinedFullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            } else {
              combinedFullName = "Provider";
            }
          }

          setProfile({
            ...profData,
            fullName: combinedFullName
          });
          
          if (profData.walletId) {
            const strikeRes = await GetStrikeStatus(profData.walletId);
            setStrikeInfo(strikeRes.data);
          }
          
          try {
            const walletRes = await getWallet(user.profileId);
            if (walletRes.data) {
                const w = walletRes.data;
                const spent = (w.lifetimePurchasedPoints || 0) - (w.pointsBalance || 0);
                setStats(prev => ({ ...prev, pointsSpent: Math.max(0, Math.floor(spent)) }));
                setSmartAlerts(prev => ({ ...prev, lowBalance: w.pointsBalance < 500, balance: w.pointsBalance }));
            }
          } catch(e) { console.warn("Wallet fetch failed", e); }
        }
      } catch (err) {
        console.error("Error loading profile/strike info:", err);
      }
    };
    getDashboardStats();
  }, [user]);

  const statCards = [
    { 
      label: "Total Revenue", 
      value: `Rs. ${stats.totalEarnings.toLocaleString()}`, 
      icon: <FaMoneyBillWave />, 
      trend: "+Dynamic", 
      trendUp: true,
      color: "provider-card-emerald"
    },
    { 
      label: "Active Requests", 
      value: stats.activeBookings, 
      icon: <FaUserClock />, 
      trend: `${stats.activeBookings} active`, 
      trendUp: stats.activeBookings > 0,
      color: "provider-card-blue"
    },
    { 
      label: "Completed Jobs", 
      value: stats.completedJobs, 
      icon: <FaCalendarCheck />, 
      trend: `${stats.completedJobs} total`, 
      trendUp: true,
      color: "provider-card-violet"
    },
    { 
      label: "Points Spent", 
      value: stats.pointsSpent, 
      icon: <FaStar />, 
      trend: "Total Boost Inv.", 
      trendUp: true,
      color: "provider-card-amber"
    },
  ];

  const getStatusLabel = (status) => {
    // Graceful check if status comes back dynamically configured as Int or String
    const mapStr = typeof status === 'string' ? { "Pending": 0, "Confirmed": 1, "InProcess": 2, "Completed": 3, "Paid": 4, "Cancelled": 5, "Disputed": 6 }[status] : status;
    switch (mapStr ?? status) {
      case 0: return { text: "Pending", cls: "status-pending" };
      case 1: return { text: "Confirmed", cls: "status-active" };
      case 2: return { text: "In Progress", cls: "status-active" };
      case 3: return { text: "Completed", cls: "status-completed" };
      case 4: return { text: "Paid", cls: "status-completed" };
      case 5: return { text: "Cancelled", cls: "status-cancelled" };
      case 6: return { text: "Disputed", cls: "status-cancelled" };
      default: return { text: "Pending", cls: "status-pending" };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 19) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="provider-dash">
      {/* Hero Banner */}
      <div className="provider-hero">
        <div className="provider-hero-content">
          <div className="provider-hero-text">
            <h1>{getGreeting()}, {profile?.fullName?.split(' ')[0] || "Provider"}! 👋</h1>
            <p>Here's your live dynamic data analysis for your services.</p>
          </div>
          <div className="provider-hero-badge">
            <FaStar className="provider-hero-star" />
            <span>Pro Member</span>
          </div>
          {strikeInfo.canClaim && (
            <button 
              onClick={async () => {
                setStrikeInfo(prev => ({ ...prev, canClaim: false }));
                try {
                  const res = await claimDailyReward(user.profileId);
                  setProfile(prev => ({ ...prev, boostingPoints: res.data.pointsBalance }));
                  Swal.fire({ title: 'Bonus!', text: `+2 Pts daily login added`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                } catch (err) {
                  Swal.fire({ title: 'Oops', text: err.response?.data?.message || 'Reward already claimed.', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                  setStrikeInfo(prev => ({ ...prev, canClaim: true }));
                }
              }} 
              style={{ padding: '8px 16px', background: '#ff9800', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginLeft: '20px' }}
            >
              🎯 Claim 2 Pts
            </button>
          )}
        </div>
      </div>

      {/* Smart Action Alerts */}
      {(smartAlerts.pending > 0 || smartAlerts.unpaid > 0 || smartAlerts.lowBalance) && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {smartAlerts.pending > 0 && (
            <div className="provider-stat-card" style={{ flex: 1, padding: '12px 18px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none' }}>
               <div style={{ fontSize: '1.2rem', color: '#f59e0b' }}>⚠️</div>
               <div style={{ fontSize: '0.85rem', color: '#92400e' }}><strong>{smartAlerts.pending} Pending requests</strong> waiting for your approval.</div>
            </div>
          )}
          {smartAlerts.unpaid > 0 && (
            <div className="provider-stat-card" style={{ flex: 1, padding: '12px 18px', background: '#f0fdf4', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none' }}>
               <div style={{ fontSize: '1.2rem', color: '#10b981' }}>💳</div>
               <div style={{ fontSize: '0.85rem', color: '#065f46' }}><strong>{smartAlerts.unpaid} Completed jobs</strong> waiting for the client to pay.</div>
            </div>
          )}
          {smartAlerts.lowBalance && (
            <div className="provider-stat-card" style={{ flex: 1, padding: '12px 18px', background: '#fef2f2', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'none' }}>
               <div style={{ fontSize: '1.2rem', color: '#ef4444' }}>📉</div>
               <div style={{ fontSize: '0.85rem', color: '#991b1b' }}><strong>Low Wallet Points ({smartAlerts.balance}).</strong> Consider top-up to maintain boosts.</div>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="provider-stats-grid">
        {statCards.map((card, i) => (
          <div className={`provider-stat-card ${card.color}`} key={i}>
            <div className="provider-stat-icon-circle">
              {card.icon}
            </div>
            <div className="provider-stat-details">
              <span className="provider-stat-lbl">{card.label}</span>
              <h3 className="provider-stat-val">{card.value}</h3>
              <span className="provider-stat-trend">
                {card.trendUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="provider-charts-row">
        <div className="provider-chart-card provider-chart-main">
          <div className="provider-chart-head">
            <h5>💰 Monthly Earnings (Dynamic)</h5>
          </div>
          <div className="provider-chart-area">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={earningsData} barSize={32}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                  formatter={(value) => [`Rs. ${value}`, 'Earnings']}
                />
                <Bar dataKey="earnings" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="provider-chart-card provider-chart-side">
          <div className="provider-chart-head">
            <h5>📊 Weekly Booking Count</h5>
          </div>
          <div className="provider-chart-area">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="provider-bottom-row">
        {/* Recent Bookings */}
        <div className="provider-bookings-card">
          <div className="provider-chart-head">
            <h5>📋 Recent Bookings</h5>
          </div>
          <div className="provider-bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map((b, i) => {
                  const s = getStatusLabel(b.status || b.Status || 0);
                  const custName = b.profile?.fullName || b.Profile?.FullName || "Customer";
                  const sTitle = b.service?.title || b.service?.Title || b.serviceListing?.title || b.Service?.Title || "Service Job";
                  return (
                    <tr key={i}>
                      <td className="provider-td-name">{custName}</td>
                      <td>{sTitle}</td>
                      <td className="provider-td-amount">Rs. {b.agreedPrice || b.AgreedPrice || 0}</td>
                      <td><span className={`provider-status-badge ${s.cls}`}>{s.text}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" className="provider-empty">No dynamic bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customer Reviews */}
        <div className="provider-tips-card">
          <div className="provider-chart-head">
            <h5>⭐ Recent Customer Reviews</h5>
          </div>
          <div className="provider-tips-list">
             {recentReviews.length > 0 ? recentReviews.map((r, i) => {
                const rating = r.rating || r.Rating || 5;
                const comment = r.comment || r.Comment || "Great service!";
                const profile = r.profile || r.Profile || {};
                const fName = profile.firstName || profile.FirstName || "Customer";
                const lName = profile.lastName || profile.LastName || "";
                return (
                <div className="provider-tip-item tip-purple" key={i}>
                  <div className="provider-tip-icon" style={{ marginTop: '-4px' }}>
                     <div style={{ background: '#e0e7ff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#4338ca', fontWeight: 'bold' }}>
                        {fName[0]}
                     </div>
                  </div>
                  <div style={{ flex: 1, marginLeft: '8px' }}>
                    <h6 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span>{fName} {lName}</span>
                        <span style={{ fontSize: '0.7rem' }}>
                           {'⭐'.repeat(rating)}<span style={{color: '#cbd5e1'}}>{'⭐'.repeat(5-rating)}</span>
                        </span>
                    </h6>
                    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem' }}>"{comment}"</p>
                  </div>
                </div>
             )}) : <div className="provider-empty">No reviews collected yet. Keep up the good work!</div>}
          </div>
        </div>
      </div>

      {/* Third Row (Extra Widgets) */}
      <div className="provider-bottom-row" style={{ marginTop: '1.25rem' }}>
        {/* Upcoming Appointments */}
        <div className="provider-bookings-card">
          <div className="provider-chart-head">
            <h5>⏳ Upcoming Appointments</h5>
          </div>
          <div className="provider-tips-list">
             {upcomingAppointments.length > 0 ? upcomingAppointments.map((b, i) => {
              const custName = b.profile?.fullName || b.Profile?.FullName || "Customer";
              const sTitle = b.service?.title || b.service?.Title || b.serviceListing?.title || "Service";
              const dateRaw = b.scheduledStart || b.ScheduledStart || b.createdAt || b.CreatedAt;
              const dateObj = new Date(dateRaw);
              const dateStr = dateObj.toLocaleDateString('en-GB') + " " + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              return (
                <div className="provider-tip-item tip-blue" key={i}>
                  <div className="provider-tip-icon">📅</div>
                  <div style={{ flex: 1 }}>
                    <h6 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span>{sTitle}</span>
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>{dateStr}</span>
                    </h6>
                    <p style={{ margin: 0 }}>Client: {custName}</p>
                  </div>
                </div>
              )
            }) : <div className="provider-empty">No immediate upcoming appointments found</div>}
          </div>
        </div>

        {/* Top Performing Services */}
        <div className="provider-tips-card">
          <div className="provider-chart-head">
            <h5>🏆 Top Performing Services</h5>
          </div>
          <div className="provider-tips-list">
             {topServices.length > 0 ? topServices.map((s, i) => {
              return (
                <div className="provider-tip-item tip-gold" key={i}>
                  <div className="provider-tip-icon" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>#{i+1}</div>
                  <div style={{ flex: 1, marginLeft: '10px' }}>
                    <h6 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span>{s.title}</span>
                        <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>
                          {s.count} Bookings
                        </span>
                    </h6>
                    <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>Revenue generated: Rs. {s.revenue}</p>
                  </div>
                </div>
              )
            }) : <div className="provider-empty">No performance data established yet</div>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProviderDashboard;