import React from 'react';
import { FaMoneyBillWave, FaChartPie, FaSeedling, FaUserCircle, FaPlus, FaFileAlt, FaSun, FaUsers, FaSignOutAlt, FaHome, FaCog, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GiFarmTractor, GiWheat } from 'react-icons/gi';
import axios from "axios";
import Reports from './Reports';
import IndividualFinanceTracker from './IndividualFinanceTracker';
import CropTracker from './CropTracker';
import CostAnalysis from './CostAnalysis';
import NotificationCenter from './NotificationCenter';
import { WeatherWidgetInline, WeatherWidgetCard } from './WeatherWidget';

const FarmerDashboard = () => {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState('en');
  const [offline, setOffline] = React.useState(false);
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [expenseForm, setExpenseForm] = React.useState({
    amount: '',
    category: '',
    crop: '',
    date: '',
    note: '',
  });
  const [expenseList, setExpenseList] = React.useState([]);
  const [expenseMsg, setExpenseMsg] = React.useState("");
  const [expenseError, setExpenseError] = React.useState("");
  const [showIncomeModal, setShowIncomeModal] = React.useState(false);
  const [incomeForm, setIncomeForm] = React.useState({
    amount: '',
    category: '',
    crop: '',
    date: '',
    note: '',
  });
  const [incomeList, setIncomeList] = React.useState([]);
  const [incomeMsg, setIncomeMsg] = React.useState("");
  const [incomeError, setIncomeError] = React.useState("");
  const [showReports, setShowReports] = React.useState(false);
  const [showIndividualTracker, setShowIndividualTracker] = React.useState(false);
  const [showCropTracker, setShowCropTracker] = React.useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = React.useState(false);
  const [showYieldPrediction, setShowYieldPrediction] = React.useState(false);
  const [showCropRecommendation, setShowCropRecommendation] = React.useState(false);
  const [alerts, setAlerts] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [loadingAlerts, setLoadingAlerts] = React.useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = React.useState(false);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [dashboardStats, setDashboardStats] = React.useState({
    income: 0,
    expenses: 0,
    budgetUtilizationPercent: null,
    topCrop: { name: null, percent: null },
  });
  const [showAllExpenses, setShowAllExpenses] = React.useState(false);
  const [showAllIncome, setShowAllIncome] = React.useState(false);
  const [crops, setCrops] = React.useState([]); // for crop dropdown in forms

  // Fetch transactions when component mounts
  React.useEffect(() => {
    if (userEmail) {
      fetchTransactions();
      fetchAlerts();
      fetchReportStats();
      fetchCrops();
      
      // Check if this is a new user and show profile prompt
      const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';
      if (isFirstLogin) {
        setShowProfilePrompt(true);
        localStorage.setItem('isFirstLogin', 'false'); // Mark as not first login anymore
      }
    }
  }, [userEmail]);

  // Fallback UI if not logged in
  if (!userName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#f7fafc] to-[#e6fffa]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-[#2F855A] mb-4">404 - User Not Found</h1>
          <p className="text-lg text-gray-700 mb-6">You must be logged in to view the dashboard.</p>
          <a href="/login" className="inline-block bg-[#D69E2E] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#B7791F] transition-all duration-200">Go to Login</a>
        </div>
      </div>
    );
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.post('/api/user/all-transactions', { email: userEmail });
      setIncomeList(response.data.income);
      setExpenseList(response.data.expenses);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await axios.get('/api/user/alerts', { 
        params: { email: userEmail } 
      });
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const res = await axios.get('/api/user/crop', { params: { email: userEmail } });
      setCrops(res.data || []);
    } catch (e) {
      console.error('Failed to fetch crops:', e);
    }
  };

  const fetchReportStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.post('/api/user/reports', {
        email: userEmail,
        filterType: 'month',
      });
      const { totalIncome = 0, totalExpenses = 0, cropSummaries = [] } = response.data || {};

      const totals = cropSummaries.reduce(
        (acc, c) => {
          acc.planned += Number(c.plannedBudget || 0);
          acc.spent += Number(c.totalSpent || 0);
          return acc;
        },
        { planned: 0, spent: 0 }
      );

      const budgetUtilizationPercent = totals.planned > 0
        ? Math.round((totals.spent / totals.planned) * 100)
        : null;

      const usableCrops = cropSummaries.filter(c => Number(c.plannedBudget) > 0);
      let topCrop = { name: null, percent: null };
      if (usableCrops.length > 0) {
        const ranked = usableCrops
          .map(c => ({ name: c.name, percent: (Number(c.totalSpent || 0) / Number(c.plannedBudget)) * 100 }))
          .sort((a, b) => b.percent - a.percent);
        topCrop = { name: ranked[0].name, percent: Math.round(ranked[0].percent) };
      }

      setDashboardStats({
        income: Number(totalIncome) || 0,
        expenses: Number(totalExpenses) || 0,
        budgetUtilizationPercent,
        topCrop,
      });
    } catch (error) {
      console.error('Error fetching monthly report stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      // Refresh all data in parallel
      await Promise.all([
        fetchTransactions(),
        fetchAlerts(),
        fetchReportStats()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isFirstLogin");
    
    // Redirect to login page
    window.location.href = "/login";
  };

  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
  else if (hour >= 18) greeting = 'Good Evening';

  // Motivational quotes
  const quotes = [
    '"The future belongs to those who prepare for it today."',
    '"A good farmer is nothing more nor less than a handy man with a sense of humus."',
    '"Sow the seeds of hard work, and reap the fruits of success."',
    '"Every blade of grass has its angel that bends over it and whispers, Grow, Grow."',
  ];
  const quote = quotes[new Date().getDate() % quotes.length];

  // Real stats from backend
  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const statsCards = [
    {
      title: "This Month's Income",
      value: formatCurrency(dashboardStats.income),
      icon: <FaMoneyBillWave className="text-4xl text-green-500" />,
      gradient: 'from-green-200 to-emerald-100',
    },
    {
      title: "This Month's Expenses",
      value: formatCurrency(dashboardStats.expenses),
      icon: <FaChartPie className="text-4xl text-yellow-500" />,
      gradient: 'from-yellow-200 to-orange-100',
    },
    {
      title: 'Budget Utilization',
      value: dashboardStats.budgetUtilizationPercent == null ? '—' : `${dashboardStats.budgetUtilizationPercent}%`,
      icon: <FaSeedling className="text-4xl text-emerald-500" />,
      gradient: 'from-emerald-200 to-green-100',
    },
    {
      title: dashboardStats.topCrop.name ? `Top Crop: ${dashboardStats.topCrop.name}` : 'Top Crop',
      value: dashboardStats.topCrop.percent == null ? '—' : `${dashboardStats.topCrop.percent}%`,
      icon: <GiWheat className="text-4xl text-yellow-600" />,
      gradient: 'from-yellow-100 to-amber-100',
    },
  ];

  // Add Expense handler
  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseMsg("");
    setExpenseError("");
    try {
      const res = await axios.post('/api/user/expense', {
        email: userEmail,
        ...expenseForm,
      });
      setExpenseMsg("Expense added successfully!");
      setExpenseList([res.data.expense, ...expenseList]);
      setShowExpenseModal(false);
      setExpenseForm({ amount: '', category: '', crop: '', date: '', note: '' });
      fetchReportStats();
    } catch (err) {
      setExpenseError(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/user/expense/${expenseId}`, { data: { email: userEmail } });
      setExpenseList(expenseList.filter(e => e._id !== expenseId));
      fetchReportStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  // Add Income handler
  const handleIncomeChange = (e) => {
    setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  };
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setIncomeMsg("");
    setIncomeError("");
    try {
      const res = await axios.post('/api/user/income', {
        email: userEmail,
        ...incomeForm,
      });
      setIncomeMsg("Income added successfully!");
      setIncomeList([res.data.income, ...incomeList]);
      setShowIncomeModal(false);
      setIncomeForm({ amount: '', category: '', crop: '', date: '', note: '' });
      fetchReportStats();
    } catch (err) {
      setIncomeError(err.response?.data?.message || "Failed to add income");
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    if (!window.confirm('Delete this income entry?')) return;
    try {
      await axios.delete(`/api/user/income/${incomeId}`, { data: { email: userEmail } });
      setIncomeList(incomeList.filter(i => i._id !== incomeId));
      fetchReportStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete income');
    }
  };

  // Notification handlers
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/read`, { email: userEmail });
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await axios.patch(`/api/user/alerts/${alertId}/dismiss`, { email: userEmail });
      setAlerts(alerts.filter(alert => alert._id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Helper function to get alert type styling
  const getAlertTypeStyle = (alertType) => {
    switch (alertType) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'over-budget':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'custom-threshold':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Helper function to get alert icon
  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'warning':
        return '🟡';
      case 'over-budget':
        return '🔴';
      case 'custom-threshold':
        return '🟢';
      default:
        return 'ℹ️';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      {/* ===== HEADER ===== */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: '#dcfce7', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserCircle style={{ fontSize: 26, color: '#16a34a' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{greeting}, {userName}!</h1>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Here's your farm's financial health at a glance.</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', borderRadius: 9999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
              <GiFarmTractor style={{ fontSize: 12 }} /> Farmer
            </span>
            <WeatherWidgetInline />
          </div>
          <div style={{ fontStyle: 'italic', fontSize: 13, color: '#9ca3af', maxWidth: 320, textAlign: 'right' }}>"{quote}"</div>
        </div>
      </section>

      {/* Welcome Banner */}
      {localStorage.getItem('isFirstLogin') === 'true' && (
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '12px 24px' }} className="animate-slide-in-top">
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Welcome to AgriBudget!</div>
                <div style={{ fontSize: 12, color: '#16a34a' }}>Your account has been created successfully. Start managing your farm finances today!</div>
              </div>
            </div>
            <button onClick={() => localStorage.setItem('isFirstLogin', 'false')} style={{ background: 'none', border: 'none', fontSize: 13, color: '#15803d', cursor: 'pointer', fontWeight: 500 }}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Top-right nav buttons */}
      <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate('/')} title="Home" aria-label="Go to Home"
          style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background='#fff'}>
          <FaHome style={{ fontSize: 14 }} />
        </button>
        <button onClick={() => navigate('/settings')} title="Settings" aria-label="Open Settings"
          style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background='#fff'}>
          <FaCog style={{ fontSize: 14 }} />
        </button>
        <button onClick={handleLogout} title="Logout"
          style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background='#fff'}>
          <FaSignOutAlt style={{ fontSize: 14 }} />
        </button>
        <NotificationCenter userRole="farmer" userId={userEmail} userEmail={userEmail} />
      </div>

      {/* ===== STAT CARDS ===== */}
      <section style={{ maxWidth: 1200, margin: '24px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, padding: '0 24px' }}>
        {[
          { title: "This Month's Income", val: statsLoading ? '...' : statsCards[0]?.value, accent: '#16a34a', icon: <FaMoneyBillWave style={{ fontSize: 20, color: '#16a34a' }} /> },
          { title: "This Month's Expenses", val: statsLoading ? '...' : statsCards[1]?.value, accent: '#d97706', icon: <FaChartPie style={{ fontSize: 20, color: '#d97706' }} /> },
          { title: 'Budget Utilization', val: statsLoading ? '...' : statsCards[2]?.value, accent: '#2563eb', icon: <FaSeedling style={{ fontSize: 20, color: '#2563eb' }} /> },
          { title: statsCards[3]?.title || 'Top Crop', val: statsLoading ? '...' : statsCards[3]?.value, accent: '#7c3aed', icon: <GiWheat style={{ fontSize: 20, color: '#7c3aed' }} /> },
        ].map((s, i) => (
          <div key={i} className="pro-stat-card" style={{ borderLeft: `4px solid ${s.accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.title}</span>
              <div style={{ width: 34, height: 34, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{s.val}</div>
          </div>
        ))}
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section style={{ maxWidth: 1200, margin: '20px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 4 }}>Quick Actions</span>
          <button onClick={() => setShowExpenseModal(true)} style={{ display:'flex',alignItems:'center',gap:5,background:'#16a34a',color:'#fff',border:'none',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#15803d'} onMouseLeave={e=>e.currentTarget.style.background='#16a34a'}><FaPlus style={{fontSize:10}} /> Add Expense</button>
          <button onClick={() => setShowIncomeModal(true)} style={{ display:'flex',alignItems:'center',gap:5,background:'#d97706',color:'#fff',border:'none',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#b45309'} onMouseLeave={e=>e.currentTarget.style.background='#d97706'}><FaPlus style={{fontSize:10}} /> Add Income</button>
          <button onClick={() => setShowReports(true)} style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaFileAlt style={{fontSize:10}} /> Reports</button>
          <a href="/marketplace" style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,textDecoration:'none' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaShoppingCart style={{fontSize:10}} /> Marketplace</a>
          <a href="/my-orders" style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,textDecoration:'none' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaShoppingCart style={{fontSize:10}} /> My Orders</a>
          <button onClick={() => setShowCropTracker(true)} title="Crop-wise Tracking" style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><GiWheat style={{fontSize:12}} /> Crop Tracker</button>
          <button onClick={() => setShowCostAnalysis(true)} title="Crop-wise Cost Analysis" style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><GiWheat style={{fontSize:12}} /> Cost Analysis</button>
          <button onClick={() => setShowIndividualTracker(true)} title="Individual Finance Tracker" style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaUsers style={{fontSize:10}} /> Finance Tracker</button>
          <button onClick={() => setShowYieldPrediction(true)} style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaSeedling style={{fontSize:10}} /> Yield Prediction</button>
          <button onClick={() => setShowCropRecommendation(true)} style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}><FaSeedling style={{fontSize:10}} /> Crop Recommendation</button>
          <button onClick={refreshAllData} style={{ display:'flex',alignItems:'center',gap:5,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,padding:'7px 14px',fontSize:13,fontWeight:500,cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>&#8635; Refresh</button>
        </div>
      </section>

      {/* ===== ADD EXPENSE MODAL ===== */}
      {showExpenseModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', width:'100%', maxWidth:460, position:'relative' }}>
            <button onClick={() => setShowExpenseModal(false)} aria-label="Close" style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:22, color:'#9ca3af', cursor:'pointer' }}>&times;</button>
            <div style={{ padding:'22px 28px 14px', borderBottom:'1px solid #f3f4f6' }}><h2 style={{ fontSize:17, fontWeight:700, color:'#111827' }}>Add Expense</h2></div>
            <form onSubmit={handleExpenseSubmit} style={{ padding:'20px 28px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[{l:'Amount',n:'amount',t:'number',p:'Enter amount'},{l:'Category',n:'category',t:'text',p:'e.g. Fertilizer, Labor'},{l:'Date',n:'date',t:'date',p:''},{l:'Note',n:'note',t:'text',p:'Optional note'}].map(f=>(
                <div key={f.n}>
                  <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>{f.l}</label>
                  <input type={f.t} name={f.n} value={expenseForm[f.n]} onChange={handleExpenseChange} placeholder={f.p} required={['amount','category'].includes(f.n)}
                    style={{width:'100%',border:'1px solid #d1d5db',borderRadius:7,padding:'9px 12px',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box'}} />
                </div>
              ))}
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Crop (optional)</label>
                <select name="crop" value={expenseForm.crop} onChange={handleExpenseChange}
                  style={{width:'100%',border:'1px solid #d1d5db',borderRadius:7,padding:'9px 12px',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box'}}>
                  <option value="">No crop (general expense)</option>
                  {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background:'#16a34a', color:'#fff', padding:'10px 0', borderRadius:8, border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='#15803d'} onMouseLeave={e=>e.currentTarget.style.background='#16a34a'}>Add Expense</button>
              {expenseError && <div style={{color:'#dc2626',fontSize:13,fontWeight:600,textAlign:'center'}}>{expenseError}</div>}
              {expenseMsg && <div style={{color:'#16a34a',fontSize:13,fontWeight:600,textAlign:'center'}}>{expenseMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* ===== ADD INCOME MODAL ===== */}
      {showIncomeModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', width:'100%', maxWidth:460, position:'relative' }}>
            <button onClick={() => setShowIncomeModal(false)} aria-label="Close" style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:22, color:'#9ca3af', cursor:'pointer' }}>&times;</button>
            <div style={{ padding:'22px 28px 14px', borderBottom:'1px solid #f3f4f6' }}><h2 style={{ fontSize:17, fontWeight:700, color:'#111827' }}>Add Income</h2></div>
            <form onSubmit={handleIncomeSubmit} style={{ padding:'20px 28px 28px', display:'flex', flexDirection:'column', gap:14 }}>
              {[{l:'Amount',n:'amount',t:'number',p:'Enter amount'},{l:'Category',n:'category',t:'text',p:'e.g. Crop Sale, Subsidy'},{l:'Date',n:'date',t:'date',p:''},{l:'Note',n:'note',t:'text',p:'Optional note'}].map(f=>(
                <div key={f.n}>
                  <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>{f.l}</label>
                  <input type={f.t} name={f.n} value={incomeForm[f.n]} onChange={handleIncomeChange} placeholder={f.p} required={['amount','category'].includes(f.n)}
                    style={{width:'100%',border:'1px solid #d1d5db',borderRadius:7,padding:'9px 12px',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box'}} />
                </div>
              ))}
              <div>
                <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:4}}>Crop (optional)</label>
                <select name="crop" value={incomeForm.crop} onChange={handleIncomeChange}
                  style={{width:'100%',border:'1px solid #d1d5db',borderRadius:7,padding:'9px 12px',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box'}}>
                  <option value="">No crop (general income)</option>
                  {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ background:'#d97706', color:'#fff', padding:'10px 0', borderRadius:8, border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='#b45309'} onMouseLeave={e=>e.currentTarget.style.background='#d97706'}>Add Income</button>
              {incomeError && <div style={{color:'#dc2626',fontSize:13,fontWeight:600,textAlign:'center'}}>{incomeError}</div>}
              {incomeMsg && <div style={{color:'#16a34a',fontSize:13,fontWeight:600,textAlign:'center'}}>{incomeMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Floating action icon for Individual Finance Tracker */}
      <button
        className="fixed bottom-20 right-6 z-40 bg-[#2F855A] text-white p-4 rounded-full shadow-xl hover:bg-[#246a46] focus:ring-4 focus:ring-green-300"
        title="Open Individual Finance Tracker"
        onClick={() => setShowIndividualTracker(true)}
      >
        <FaUsers size={22} />
      </button>

      {/* Expense List */}
      <section className="max-w-6xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2F855A] flex items-center"><FaChartPie className="mr-2 text-[#D69E2E]" /> Recent Expenses</h2>
          {expenseList.length > 6 && (
            <button
              className="text-sm text-[#2F855A] hover:text-[#D69E2E] font-semibold"
              onClick={() => setShowAllExpenses(!showAllExpenses)}
            >
              {showAllExpenses ? 'Show Top 6' : 'View All'}
            </button>
          )}
        </div>
        {expenseList.length === 0 ? (
          <div className="text-gray-500 text-center">No expenses added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Crop</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Note</th>
                  <th className="py-2 px-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {(showAllExpenses ? expenseList : expenseList.slice(0, 6)).map((exp, idx) => (
                  <tr key={exp._id || idx} className="text-center">
                    <td className="py-2 px-4 border-b font-semibold text-red-600">₹{exp.amount}</td>
                    <td className="py-2 px-4 border-b">{exp.category}</td>
                    <td className="py-2 px-4 border-b">{exp.crop || '—'}</td>
                    <td className="py-2 px-4 border-b">{exp.date ? new Date(exp.date).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-4 border-b">{exp.note || '—'}</td>
                    <td className="py-2 px-4 border-b">
                      {exp._id && <button onClick={() => handleDeleteExpense(exp._id)} style={{background:'none',border:'none',cursor:'pointer',color:'#dc2626',fontSize:14}} title="Delete">🗑</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Income List */}
      <section className="max-w-6xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2F855A] flex items-center"><FaMoneyBillWave className="mr-2 text-[#D69E2E]" /> Recent Incomes</h2>
          {incomeList.length > 0 && (
            <button
              className="text-sm text-[#2F855A] hover:text-[#D69E2E] font-semibold"
              onClick={() => setShowAllIncome(!showAllIncome)}
            >
              {showAllIncome ? 'Show Top 6' : 'View All'}
            </button>
          )}
        </div>
        {incomeList.length === 0 ? (
          <div className="text-gray-500 text-center">No incomes added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Crop</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Note</th>
                  <th className="py-2 px-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {(showAllIncome ? incomeList : incomeList.slice(0, 6)).map((inc, idx) => (
                  <tr key={inc._id || idx} className="text-center">
                    <td className="py-2 px-4 border-b font-semibold text-green-600">₹{inc.amount}</td>
                    <td className="py-2 px-4 border-b">{inc.category}</td>
                    <td className="py-2 px-4 border-b">{inc.crop || '—'}</td>
                    <td className="py-2 px-4 border-b">{inc.date ? new Date(inc.date).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-4 border-b">{inc.note || '—'}</td>
                    <td className="py-2 px-4 border-b">
                      {inc._id && <button onClick={() => handleDeleteIncome(inc._id)} style={{background:'none',border:'none',cursor:'pointer',color:'#dc2626',fontSize:14}} title="Delete">🗑</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analytics Placeholders */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[220px]">
          <h2 className="text-xl font-bold text-[#2F855A] mb-4 flex items-center"><FaMoneyBillWave className="mr-2 text-[#D69E2E]" /> Income Trend</h2>
          {incomeList.length > 0 ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{incomeList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-xs text-gray-500 mt-1">{incomeList.length} transactions</div>
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-r from-[#2F855A]/10 to-[#D69E2E]/10 rounded-lg flex items-center justify-center text-gray-400">
              <span>No income data yet</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[220px]">
          <h2 className="text-xl font-bold text-[#2F855A] mb-4 flex items-center"><FaChartPie className="mr-2 text-[#D69E2E]" /> Expense Breakdown</h2>
          {expenseList.length > 0 ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                ₹{expenseList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-gray-500 mt-1">{expenseList.length} transactions</div>
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-r from-[#D69E2E]/10 to-[#2F855A]/10 rounded-lg flex items-center justify-center text-gray-400">
              <span>No expense data yet</span>
            </div>
          )}
        </div>
      </section>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h4 className="font-bold text-gray-800 mb-3">Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.length === 0 && expenseList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-sm font-medium">No transactions yet</p>
                      <p className="text-xs text-gray-400">Start by adding your first income or expense</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Income Transactions */}
                  {incomeList.map((income, index) => (
                    <tr key={`income-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Income</span>
                      </td>
                      <td className="py-2 font-semibold">₹{income.amount.toLocaleString()}</td>
                      <td className="py-2">{income.category}</td>
                      <td className="py-2">{income.note || '-'}</td>
                    </tr>
                  ))}
                  {/* Expense Transactions */}
                  {expenseList.map((expense, index) => (
                    <tr key={`expense-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expense</span>
                      </td>
                      <td className="py-2 font-semibold">₹{expense.amount.toLocaleString()}</td>
                      <td className="py-2">{expense.category}</td>
                      <td className="py-2">{expense.note || '-'}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#111827', color: '#9ca3af', padding: '16px 24px', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy','Help','Feedback'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }} onMouseEnter={e => e.target.style.color='#e5e7eb'} onMouseLeave={e => e.target.style.color='#9ca3af'}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 12 }}>&copy; {new Date().getFullYear()} AgriBudget. Empowering Farmers.</div>
      </footer>

      {/* Reports Modal */}
      {showReports && (
        <Reports onClose={() => setShowReports(false)} />
      )}
      {/* Crop Tracker Modal */}
      {showCropTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCropTracker(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CropTracker />
          </div>
        </div>
      )}
      {/* Cost Analysis Modal */}
      {showCostAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-7xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCostAnalysis(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CostAnalysis />
          </div>
        </div>
      )}
      {/* Individual Finance Tracker Modal */}
      {showIndividualTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowIndividualTracker(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <IndividualFinanceTracker />
          </div>
        </div>
      )}

      {/* Crop Yield Prediction Modal */}
      {showYieldPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowYieldPrediction(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* CropYieldPrediction component */}
            {React.createElement(require('./CropYieldPrediction').default)}
          </div>
        </div>
      )}

      {/* Crop Recommendation Modal */}
      {showCropRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowCropRecommendation(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* CropRecommendation component */}
            {React.createElement(require('./CropRecommendation').default)}
          </div>
        </div>
      )}

      {/* Profile Update Prompt Modal */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-bounce-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FaUserCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to AgriBudget!</h3>
              <p className="text-gray-600 mb-6">
                To provide you with the best experience, please update your profile information including:
              </p>
              <div className="text-left space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Contact details and location
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Farm size and crop preferences
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Financial goals and budget settings
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowProfilePrompt(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowProfilePrompt(false);
                    // You can add navigation to a profile settings page here
                    // navigate('/profile-settings');
                  }}
                  className="flex-1 bg-[#2F855A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1F5F3F] transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard; 