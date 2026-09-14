import React from 'react';
import {
  FaMoneyBillWave, FaChartPie, FaSeedling, FaUserCircle, FaPlus,
  FaFileAlt, FaUsers, FaSignOutAlt, FaCog,
  FaShoppingCart, FaRobot, FaBug, FaChartLine, FaBell, FaTh,
  FaBars, FaLeaf, FaArrowUp, FaArrowDown, FaTrash, FaSync,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GiFarmTractor, GiWheat } from 'react-icons/gi';
import axios from 'axios';
import Reports from './Reports';
import IndividualFinanceTracker from './IndividualFinanceTracker';
import CropTracker from './CropTracker';
import CostAnalysis from './CostAnalysis';
import NotificationCenter from './NotificationCenter';
import { WeatherWidgetInline } from './WeatherWidget';
import AgriAI from './AgriAI';
import DiseaseDetection from './DiseaseDetection';
import CropYieldPrediction from './CropYieldPrediction';
import CropRecommendation from './CropRecommendation';

/* ── Sidebar nav items ─────────────────────────────────── */
const NAV_ITEMS = [
  { key: 'overview',     icon: <FaTh />,           label: 'Dashboard',        section: 'main' },
  { key: 'finance',      icon: <FaMoneyBillWave />, label: 'Finance',          section: 'main' },
  { key: 'cropTracker',  icon: <GiWheat />,         label: 'Crop Tracker',     section: 'main' },
  { key: 'costAnalysis', icon: <FaChartLine />,     label: 'Cost Analysis',    section: 'main' },
  { key: 'finTracker',   icon: <FaUsers />,         label: 'Finance Tracker',  section: 'main' },
  { key: 'reports',      icon: <FaFileAlt />,       label: 'Reports',          section: 'main' },
  { key: 'agriAI',       icon: <FaRobot />,         label: 'AgriAI',           section: 'ai' },
  { key: 'disease',      icon: <FaBug />,           label: 'Disease Detect',   section: 'ai' },
  { key: 'yieldPred',    icon: <FaSeedling />,      label: 'Yield Prediction', section: 'ai' },
  { key: 'cropRec',      icon: <FaLeaf />,          label: 'Crop Recommend',   section: 'ai' },
];

const FarmerDashboard = () => {
  const userName  = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const navigate  = useNavigate();

  /* ── sidebar state ────────────────────────────────────── */
  const [sidebarOpen,     setSidebarOpen]     = React.useState(false);
  const [activeView,      setActiveView]      = React.useState('overview');

  /* ── form / modal state (unchanged) ──────────────────── */
  const [showExpenseModal,      setShowExpenseModal]      = React.useState(false);
  const [expenseForm,           setExpenseForm]           = React.useState({ amount: '', category: '', crop: '', date: '', note: '' });
  const [expenseList,           setExpenseList]           = React.useState([]);
  const [expenseMsg,            setExpenseMsg]            = React.useState('');
  const [expenseError,          setExpenseError]          = React.useState('');
  const [showIncomeModal,       setShowIncomeModal]       = React.useState(false);
  const [incomeForm,            setIncomeForm]            = React.useState({ amount: '', category: '', crop: '', date: '', note: '' });
  const [incomeList,            setIncomeList]            = React.useState([]);
  const [incomeMsg,             setIncomeMsg]             = React.useState('');
  const [incomeError,           setIncomeError]           = React.useState('');
  const [showReports,           setShowReports]           = React.useState(false);
  const [showIndividualTracker, setShowIndividualTracker] = React.useState(false);
  const [showCropTracker,       setShowCropTracker]       = React.useState(false);
  const [showCostAnalysis,      setShowCostAnalysis]      = React.useState(false);
  const [showYieldPrediction,   setShowYieldPrediction]   = React.useState(false);
  const [showCropRecommendation,setShowCropRecommendation]= React.useState(false);
  const [showAgriAI,            setShowAgriAI]            = React.useState(false);
  const [showDiseaseDetection,  setShowDiseaseDetection]  = React.useState(false);
  const [alerts,                setAlerts]                = React.useState([]);
  const [showNotifications,     setShowNotifications]     = React.useState(false);
  const [loadingAlerts,         setLoadingAlerts]         = React.useState(false);
  const [showProfilePrompt,     setShowProfilePrompt]     = React.useState(false);
  const [statsLoading,          setStatsLoading]          = React.useState(false);
  const [dashboardStats,        setDashboardStats]        = React.useState({ income: 0, expenses: 0, budgetUtilizationPercent: null, topCrop: { name: null, percent: null } });
  const [showAllExpenses,       setShowAllExpenses]       = React.useState(false);
  const [showAllIncome,         setShowAllIncome]         = React.useState(false);
  const [crops,                 setCrops]                 = React.useState([]);

  /* ── data fetching (unchanged) ────────────────────────── */
  React.useEffect(() => {
    if (userEmail) {
      fetchTransactions();
      fetchAlerts();
      fetchReportStats();
      fetchCrops();
      const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';
      if (isFirstLogin) { setShowProfilePrompt(true); localStorage.setItem('isFirstLogin', 'false'); }
    }
  }, [userEmail]);

  if (!userName) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 400, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>🌱</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Not Logged In</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Please log in to access your dashboard.</p>
          <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '11px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.post('/api/user/all-transactions', { email: userEmail });
      setIncomeList(response.data.income);
      setExpenseList(response.data.expenses);
    } catch (error) { console.error('Error fetching transactions:', error); }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await axios.get('/api/user/alerts', { params: { email: userEmail } });
      setAlerts(response.data || []);
    } catch (error) { console.error('Error fetching alerts:', error); setAlerts([]); }
    finally { setLoadingAlerts(false); }
  };

  const fetchCrops = async () => {
    try {
      const res = await axios.get('/api/user/crop', { params: { email: userEmail } });
      setCrops(res.data || []);
    } catch (e) { console.error('Failed to fetch crops:', e); }
  };

  const fetchReportStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.post('/api/user/reports', { email: userEmail, filterType: 'month' });
      const { totalIncome = 0, totalExpenses = 0, cropSummaries = [] } = response.data || {};
      const totals = cropSummaries.reduce((acc, c) => { acc.planned += Number(c.plannedBudget || 0); acc.spent += Number(c.totalSpent || 0); return acc; }, { planned: 0, spent: 0 });
      const budgetUtilizationPercent = totals.planned > 0 ? Math.round((totals.spent / totals.planned) * 100) : null;
      const usableCrops = cropSummaries.filter(c => Number(c.plannedBudget) > 0);
      let topCrop = { name: null, percent: null };
      if (usableCrops.length > 0) {
        const ranked = usableCrops.map(c => ({ name: c.name, percent: (Number(c.totalSpent || 0) / Number(c.plannedBudget)) * 100 })).sort((a, b) => b.percent - a.percent);
        topCrop = { name: ranked[0].name, percent: Math.round(ranked[0].percent) };
      }
      setDashboardStats({ income: Number(totalIncome) || 0, expenses: Number(totalExpenses) || 0, budgetUtilizationPercent, topCrop });
    } catch (error) { console.error('Error fetching monthly report stats:', error); }
    finally { setStatsLoading(false); }
  };

  const refreshAllData = async () => { await Promise.all([fetchTransactions(), fetchAlerts(), fetchReportStats()]); };

  const handleLogout = () => {
    ['userName', 'userEmail', 'isFirstLogin', 'role'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/login';
  };

  /* ── expense / income handlers (unchanged) ────────────── */
  const handleExpenseChange = (e) => setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  const handleExpenseSubmit = async (e) => {
    e.preventDefault(); setExpenseMsg(''); setExpenseError('');
    try {
      const res = await axios.post('/api/user/expense', { email: userEmail, ...expenseForm });
      setExpenseMsg('Expense added successfully!');
      setExpenseList([res.data.expense, ...expenseList]);
      setShowExpenseModal(false); setExpenseForm({ amount: '', category: '', crop: '', date: '', note: '' });
      fetchReportStats();
    } catch (err) { setExpenseError(err.response?.data?.message || 'Failed to add expense'); }
  };
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await axios.delete(`/api/user/expense/${expenseId}`, { data: { email: userEmail } }); setExpenseList(expenseList.filter(e => e._id !== expenseId)); fetchReportStats(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete expense'); }
  };
  const handleIncomeChange = (e) => setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  const handleIncomeSubmit = async (e) => {
    e.preventDefault(); setIncomeMsg(''); setIncomeError('');
    try {
      const res = await axios.post('/api/user/income', { email: userEmail, ...incomeForm });
      setIncomeMsg('Income added successfully!');
      setIncomeList([res.data.income, ...incomeList]);
      setShowIncomeModal(false); setIncomeForm({ amount: '', category: '', crop: '', date: '', note: '' });
      fetchReportStats();
    } catch (err) { setIncomeError(err.response?.data?.message || 'Failed to add income'); }
  };
  const handleDeleteIncome = async (incomeId) => {
    if (!window.confirm('Delete this income entry?')) return;
    try { await axios.delete(`/api/user/income/${incomeId}`, { data: { email: userEmail } }); setIncomeList(incomeList.filter(i => i._id !== incomeId)); fetchReportStats(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete income'); }
  };

  const markAsRead = async (alertId) => {
    try { await axios.patch(`/api/user/alerts/${alertId}/read`, { email: userEmail }); setAlerts(alerts.map(a => a._id === alertId ? { ...a, isRead: true } : a)); }
    catch (error) { console.error('Error marking alert as read:', error); }
  };
  const dismissAlert = async (alertId) => {
    try { await axios.patch(`/api/user/alerts/${alertId}/dismiss`, { email: userEmail }); setAlerts(alerts.filter(a => a._id !== alertId)); }
    catch (error) { console.error('Error dismissing alert:', error); }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  /* ── derived values ───────────────────────────────────── */
  const netProfit = dashboardStats.income - dashboardStats.expenses;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙';

  /* ── sidebar nav handler ──────────────────────────────── */
  const handleNav = (key) => {
    setActiveView(key);
    setSidebarOpen(false);
    if (key === 'reports')      { setShowReports(true); return; }
    if (key === 'cropTracker')  { setShowCropTracker(true); return; }
    if (key === 'costAnalysis') { setShowCostAnalysis(true); return; }
    if (key === 'finTracker')   { setShowIndividualTracker(true); return; }
    if (key === 'yieldPred')    { setShowYieldPrediction(true); return; }
    if (key === 'cropRec')      { setShowCropRecommendation(true); return; }
    if (key === 'agriAI')       { setShowAgriAI(true); return; }
    if (key === 'disease')      { setShowDiseaseDetection(true); return; }
  };

  /* ── shared input/label style ─────────────────────────── */
  const inputStyle = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };
  const focusIn  = (e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; };
  const focusOut = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };

  /* ─── KPI cards data ──────────────────────────────────── */
  const kpiCards = [
    { accent: '#16a34a', bg: '#f0fdf4', iconBg: '#dcfce7', icon: <FaMoneyBillWave style={{ fontSize: 17, color: '#16a34a' }} />, label: "This Month's Income", value: statsLoading ? '...' : formatCurrency(dashboardStats.income), trend: null },
    { accent: '#d97706', bg: '#fffbeb', iconBg: '#fef3c7', icon: <FaChartPie style={{ fontSize: 17, color: '#d97706' }} />, label: "This Month's Expenses", value: statsLoading ? '...' : formatCurrency(dashboardStats.expenses), trend: null },
    { accent: netProfit >= 0 ? '#16a34a' : '#dc2626', bg: '#f0fdf4', iconBg: '#dcfce7', icon: <FaChartLine style={{ fontSize: 17, color: netProfit >= 0 ? '#16a34a' : '#dc2626' }} />, label: 'Net Profit', value: statsLoading ? '...' : formatCurrency(netProfit), trend: netProfit >= 0 ? 'up' : 'down' },
    { accent: '#2563eb', bg: '#eff6ff', iconBg: '#dbeafe', icon: <FaSeedling style={{ fontSize: 17, color: '#2563eb' }} />, label: 'Budget Utilization', value: statsLoading ? '...' : (dashboardStats.budgetUtilizationPercent == null ? '—' : `${dashboardStats.budgetUtilizationPercent}%`), trend: null },
    { accent: '#7c3aed', bg: '#faf5ff', iconBg: '#ede9fe', icon: <GiWheat style={{ fontSize: 17, color: '#7c3aed' }} />, label: dashboardStats.topCrop.name ? `Top Crop: ${dashboardStats.topCrop.name}` : 'Top Crop', value: statsLoading ? '...' : (dashboardStats.topCrop.percent == null ? '—' : `${dashboardStats.topCrop.percent}%`), trend: null },
  ];

  /* ── quick actions ─────────────────────────────────────── */
  const quickActions = [
    { icon: <FaPlus style={{ fontSize: 11 }} />, label: 'Add Expense', color: '#16a34a', bg: '#16a34a', textColor: '#fff', onClick: () => setShowExpenseModal(true) },
    { icon: <FaPlus style={{ fontSize: 11 }} />, label: 'Add Income', color: '#d97706', bg: '#d97706', textColor: '#fff', onClick: () => setShowIncomeModal(true) },
    { icon: <FaShoppingCart style={{ fontSize: 11 }} />, label: 'Marketplace', color: '#374151', bg: '#fff', textColor: '#374151', href: '/marketplace' },
    { icon: <FaFileAlt style={{ fontSize: 11 }} />, label: 'My Orders', color: '#374151', bg: '#fff', textColor: '#374151', href: '/my-orders' },
  ];

  return (
    <div className="ab-dashboard-shell" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Mobile sidebar overlay ──────────────────────── */}
      {sidebarOpen && <div className="ab-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ════════════════════════════════════════════════════
          SIDEBAR
          ════════════════════════════════════════════════════ */}
      <aside className={`ab-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        {/* Logo */}
        <div className="ab-sidebar-logo">
          <div className="ab-sidebar-logo-icon">
            <FaLeaf style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span className="ab-sidebar-logo-text">AgriBudget</span>
        </div>

        {/* Nav */}
        <nav className="ab-sidebar-nav">
          {/* Main Section */}
          <div className="ab-sidebar-section-label">Main</div>
          {NAV_ITEMS.filter(i => i.section === 'main').map(item => (
            <button
              key={item.key}
              className={`ab-sidebar-item${activeView === item.key ? ' active' : ''}`}
              onClick={() => handleNav(item.key)}
            >
              <span className="ab-sidebar-icon">{item.icon}</span>
              <span className="ab-sidebar-label">{item.label}</span>
            </button>
          ))}

          {/* AI Section */}
          <div className="ab-sidebar-section-label" style={{ marginTop: 8 }}>AI & ML Tools</div>
          {NAV_ITEMS.filter(i => i.section === 'ai').map(item => (
            <button
              key={item.key}
              className={`ab-sidebar-item${activeView === item.key ? ' active' : ''}`}
              onClick={() => handleNav(item.key)}
              style={item.key === 'agriAI' ? { color: '#7c3aed' } : {}}
            >
              <span className="ab-sidebar-icon">{item.icon}</span>
              <span className="ab-sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="ab-sidebar-footer">
          <button className="ab-sidebar-item" onClick={() => navigate('/marketplace')} style={{ color: '#2563eb' }}>
            <span className="ab-sidebar-icon"><FaShoppingCart /></span>
            <span className="ab-sidebar-label">Marketplace</span>
          </button>
          <button className="ab-sidebar-item" onClick={() => navigate('/settings')}>
            <span className="ab-sidebar-icon"><FaCog /></span>
            <span className="ab-sidebar-label">Settings</span>
          </button>
          <button className="ab-sidebar-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
            <span className="ab-sidebar-icon"><FaSignOutAlt /></span>
            <span className="ab-sidebar-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════
          MAIN AREA
          ════════════════════════════════════════════════════ */}
      <div className="ab-main">

        {/* ── Header bar ─────────────────────────────────── */}
        <header className="ab-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}
              aria-label="Open sidebar"
            >
              <FaBars size={17} />
            </button>

            <div>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                {greetingEmoji} {greeting}, {userName?.split(' ')[0]}!
              </h1>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 2 }}>
                Here's your farm's financial health at a glance.
              </p>
            </div>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fef3c7', color: '#92400e', borderRadius: 9999, padding: '3px 10px', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>
              <GiFarmTractor style={{ fontSize: 11 }} /> Farmer
            </span>
          </div>

          {/* Header right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <WeatherWidgetInline />
            <button
              onClick={refreshAllData}
              title="Refresh data"
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              <FaSync style={{ fontSize: 13 }} />
            </button>
            <NotificationCenter userRole="farmer" userId={userEmail} userEmail={userEmail} />
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title={userEmail}>
              <FaUserCircle style={{ color: '#fff', fontSize: 18 }} />
            </div>
          </div>
        </header>

        {/* ── First-login welcome banner ──────────────────── */}
        {localStorage.getItem('isFirstLogin') === 'true' && (
          <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '10px 28px' }} className="animate-slide-in-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#15803d' }}>
                🎉 <strong>Welcome to AgriBudget!</strong> Your account has been created successfully.
              </div>
              <button onClick={() => localStorage.setItem('isFirstLogin', 'false')} style={{ background: 'none', border: 'none', fontSize: 12, color: '#16a34a', cursor: 'pointer', fontWeight: 500 }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* ── Main body ───────────────────────────────────── */}
        <main className="ab-main-body">

          {/* ══ KPI CARDS ═══════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
            {kpiCards.map((card, i) => (
              <div key={i} className="pro-stat-card" style={{
                borderLeft: `4px solid ${card.accent}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="pro-stat-label">{card.label}</span>
                  <div style={{ width: 34, height: 34, background: card.iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
                <div className="pro-stat-value">{card.value}</div>
                {card.trend && (
                  <div className={`pro-stat-trend ${card.trend}`}>
                    {card.trend === 'up' ? <FaArrowUp style={{ fontSize: 10 }} /> : <FaArrowDown style={{ fontSize: 10 }} />}
                    {card.trend === 'up' ? 'Positive' : 'Negative'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ══ QUICK ACTIONS ═══════════════════════════════ */}
          <div className="pro-card" style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 4, whiteSpace: 'nowrap' }}>Quick Actions</span>
            {quickActions.map((a, i) => (
              a.href ? (
                <a key={i} href={a.href}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: a.bg, color: a.textColor, border: a.bg === '#fff' ? '1px solid #e5e7eb' : 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = a.bg === '#fff' ? '#f9fafb' : a.color === '#16a34a' ? '#15803d' : '#b45309'}
                  onMouseLeave={e => e.currentTarget.style.background = a.bg}
                >
                  {a.icon} {a.label}
                </a>
              ) : (
                <button key={i} onClick={a.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: a.bg, color: a.textColor, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {a.icon} {a.label}
                </button>
              )
            ))}
            <button onClick={refreshAllData} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginLeft: 'auto', fontFamily: 'inherit' }}>
              <FaSync style={{ fontSize: 10 }} /> Refresh
            </button>
          </div>

          {/* ══ FINANCE TABLES ══════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20, marginBottom: 24 }}>

            {/* Recent Expenses */}
            <div className="pro-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: '#fef3c7', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaChartPie style={{ fontSize: 13, color: '#d97706' }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Expenses</h3>
                  {expenseList.length > 0 && <span className="pro-badge pro-badge-amber">{expenseList.length}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {expenseList.length > 6 && (
                    <button onClick={() => setShowAllExpenses(!showAllExpenses)}
                      style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {showAllExpenses ? 'Show Less' : 'View All'}
                    </button>
                  )}
                  <button onClick={() => setShowExpenseModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <FaPlus style={{ fontSize: 9 }} /> Add
                  </button>
                </div>
              </div>

              {expenseList.length === 0 ? (
                <div className="pro-empty-state" style={{ padding: '32px 24px' }}>
                  <div className="pro-empty-icon" style={{ fontSize: 20 }}>💸</div>
                  <div className="pro-empty-title">No expenses yet</div>
                  <div className="pro-empty-desc">Track your farming expenses to monitor where your money goes.</div>
                  <button className="pro-btn pro-btn-primary pro-btn-sm" onClick={() => setShowExpenseModal(true)}>
                    <FaPlus style={{ fontSize: 10 }} /> Add First Expense
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>Amount</th><th>Category</th><th>Crop</th><th>Date</th><th>Note</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllExpenses ? expenseList : expenseList.slice(0, 6)).map((exp, idx) => (
                        <tr key={exp._id || idx}>
                          <td><span style={{ fontWeight: 700, color: '#dc2626' }}>₹{Number(exp.amount).toLocaleString('en-IN')}</span></td>
                          <td><span className="pro-badge pro-badge-amber" style={{ fontSize: 11 }}>{exp.category}</span></td>
                          <td style={{ color: '#6b7280', fontSize: 12.5 }}>{exp.crop || '—'}</td>
                          <td style={{ color: '#6b7280', fontSize: 12.5 }}>{exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                          <td style={{ color: '#9ca3af', fontSize: 12 }}>{exp.note || '—'}</td>
                          <td>
                            {exp._id && (
                              <button onClick={() => handleDeleteExpense(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                                title="Delete expense">
                                <FaTrash style={{ fontSize: 12 }} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Income */}
            <div className="pro-card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaMoneyBillWave style={{ fontSize: 13, color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Income</h3>
                  {incomeList.length > 0 && <span className="pro-badge pro-badge-green">{incomeList.length}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {incomeList.length > 6 && (
                    <button onClick={() => setShowAllIncome(!showAllIncome)}
                      style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {showAllIncome ? 'Show Less' : 'View All'}
                    </button>
                  )}
                  <button onClick={() => setShowIncomeModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <FaPlus style={{ fontSize: 9 }} /> Add
                  </button>
                </div>
              </div>

              {incomeList.length === 0 ? (
                <div className="pro-empty-state" style={{ padding: '32px 24px' }}>
                  <div className="pro-empty-icon" style={{ fontSize: 20 }}>💰</div>
                  <div className="pro-empty-title">No income recorded</div>
                  <div className="pro-empty-desc">Add your income from crop sales, subsidies, and other farm activities.</div>
                  <button className="pro-btn pro-btn-primary pro-btn-sm" onClick={() => setShowIncomeModal(true)}>
                    <FaPlus style={{ fontSize: 10 }} /> Add First Income
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>Amount</th><th>Category</th><th>Crop</th><th>Date</th><th>Note</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllIncome ? incomeList : incomeList.slice(0, 6)).map((inc, idx) => (
                        <tr key={inc._id || idx}>
                          <td><span style={{ fontWeight: 700, color: '#16a34a' }}>₹{Number(inc.amount).toLocaleString('en-IN')}</span></td>
                          <td><span className="pro-badge pro-badge-green" style={{ fontSize: 11 }}>{inc.category}</span></td>
                          <td style={{ color: '#6b7280', fontSize: 12.5 }}>{inc.crop || '—'}</td>
                          <td style={{ color: '#6b7280', fontSize: 12.5 }}>{inc.date ? new Date(inc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                          <td style={{ color: '#9ca3af', fontSize: 12 }}>{inc.note || '—'}</td>
                          <td>
                            {inc._id && (
                              <button onClick={() => handleDeleteIncome(inc._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 4, transition: 'color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                                title="Delete income">
                                <FaTrash style={{ fontSize: 12 }} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ══ SUMMARY / ANALYTICS ROW ═════════════════════ */}
          {(() => {
            const totalIncome = incomeList.reduce((s, i) => s + Number(i.amount || 0), 0);
            const totalExpenses = expenseList.reduce((s, e) => s + Number(e.amount || 0), 0);
            const expenseRatio = totalIncome > 0 ? Math.min(Math.round((totalExpenses / totalIncome) * 100), 100) : 0;
            const savingsRatio = totalIncome > 0 ? Math.min(Math.round(((totalIncome - totalExpenses) / totalIncome) * 100), 100) : 0;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Income Summary */}
                <div className="pro-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FaMoneyBillWave style={{ color: '#16a34a', fontSize: 15 }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Income Overview</span>
                  </div>
                  {incomeList.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px', marginBottom: 4 }}>
                        ₹{totalIncome.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Total from {incomeList.length} transaction{incomeList.length !== 1 ? 's' : ''}</div>
                      <div style={{ marginTop: 14, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: 6, width: `${savingsRatio}%`, background: '#16a34a', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                        <span>Savings rate</span><span style={{ color: savingsRatio >= 50 ? '#16a34a' : '#d97706', fontWeight: 600 }}>{savingsRatio}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>No income data yet</div>
                  )}
                </div>

                {/* Expense Summary */}
                <div className="pro-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <FaChartPie style={{ color: '#d97706', fontSize: 15 }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Expense Overview</span>
                  </div>
                  {expenseList.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: '#d97706', letterSpacing: '-0.5px', marginBottom: 4 }}>
                        ₹{totalExpenses.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Total from {expenseList.length} transaction{expenseList.length !== 1 ? 's' : ''}</div>
                      <div style={{ marginTop: 14, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: 6, width: `${expenseRatio}%`, background: expenseRatio > 80 ? '#dc2626' : '#d97706', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                        <span>% of income</span><span style={{ color: expenseRatio > 80 ? '#dc2626' : expenseRatio > 60 ? '#d97706' : '#16a34a', fontWeight: 600 }}>{expenseRatio}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: 13 }}>No expense data yet</div>
                  )}
                </div>

                {/* AI Tip / Notification */}
                <div className="pro-card" style={{ padding: '20px 22px', background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '1px solid #ddd6fe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaRobot style={{ color: '#fff', fontSize: 14 }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95' }}>AgriAI Insight</span>
                    <span className="pro-badge pro-badge-purple" style={{ fontSize: 10, marginLeft: 'auto' }}>AI</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#5b21b6', lineHeight: 1.65, marginBottom: 14 }}>
                    Your farm finances are being tracked. Use AgriAI to get personalised advice on crop selection, expense reduction, and market timing.
                  </p>
                  <button onClick={() => setShowAgriAI(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <FaRobot style={{ fontSize: 11 }} /> Ask AgriAI
                  </button>
                </div>
              </div>
            );
          })()}

        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer style={{ background: '#111827', color: '#6b7280', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 18 }}>
            {['Privacy', 'Help', 'Feedback'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 12.5, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                onMouseLeave={e => e.target.style.color = '#6b7280'}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} AgriBudget — Empowering Farmers</div>
        </footer>
      </div>

      {/* ════════════════════════════════════════════════════
          MODALS (business logic untouched)
          ════════════════════════════════════════════════════ */}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="pro-modal-overlay">
          <div className="pro-modal animate-fade-in-scale">
            <div className="pro-modal-header">
              <div>
                <h2 className="pro-modal-title">💸 Add Expense</h2>
                <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 3 }}>Record a farm expense</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowExpenseModal(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="pro-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[{ l: 'Amount (₹)', n: 'amount', t: 'number', p: '0' }, { l: 'Category', n: 'category', t: 'text', p: 'e.g. Fertilizer, Labour' }, { l: 'Date', n: 'date', t: 'date', p: '' }, { l: 'Note (optional)', n: 'note', t: 'text', p: 'Brief description' }].map(f => (
                  <div key={f.n}>
                    <label style={labelStyle}>{f.l}</label>
                    <input type={f.t} name={f.n} value={expenseForm[f.n]} onChange={handleExpenseChange} placeholder={f.p} required={['amount', 'category'].includes(f.n)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Crop (optional)</label>
                  <select name="crop" value={expenseForm.crop} onChange={handleExpenseChange} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">No crop (general expense)</option>
                    {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {expenseError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>⚠️ {expenseError}</div>}
                {expenseMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>✓ {expenseMsg}</div>}
              </div>
              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="pro-btn pro-btn-primary"><FaPlus style={{ fontSize: 10 }} /> Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showIncomeModal && (
        <div className="pro-modal-overlay">
          <div className="pro-modal animate-fade-in-scale">
            <div className="pro-modal-header">
              <div>
                <h2 className="pro-modal-title">💰 Add Income</h2>
                <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 3 }}>Record a farm income</p>
              </div>
              <button className="pro-modal-close" onClick={() => setShowIncomeModal(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleIncomeSubmit}>
              <div className="pro-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[{ l: 'Amount (₹)', n: 'amount', t: 'number', p: '0' }, { l: 'Category', n: 'category', t: 'text', p: 'e.g. Crop Sale, Subsidy' }, { l: 'Date', n: 'date', t: 'date', p: '' }, { l: 'Note (optional)', n: 'note', t: 'text', p: 'Brief description' }].map(f => (
                  <div key={f.n}>
                    <label style={labelStyle}>{f.l}</label>
                    <input type={f.t} name={f.n} value={incomeForm[f.n]} onChange={handleIncomeChange} placeholder={f.p} required={['amount', 'category'].includes(f.n)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Crop (optional)</label>
                  <select name="crop" value={incomeForm.crop} onChange={handleIncomeChange} style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">No crop (general income)</option>
                    {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {incomeError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>⚠️ {incomeError}</div>}
                {incomeMsg && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>✓ {incomeMsg}</div>}
              </div>
              <div className="pro-modal-footer">
                <button type="button" className="pro-btn pro-btn-secondary" onClick={() => setShowIncomeModal(false)}>Cancel</button>
                <button type="submit" className="pro-btn" style={{ background: '#d97706', color: '#fff' }}><FaPlus style={{ fontSize: 10 }} /> Add Income</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReports && <Reports onClose={() => { setShowReports(false); setActiveView('overview'); }} />}

      {/* Crop Tracker Modal */}
      {showCropTracker && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowCropTracker(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 4, width: '100%', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowCropTracker(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <CropTracker />
          </div>
        </div>
      )}

      {/* Cost Analysis Modal */}
      {showCostAnalysis && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowCostAnalysis(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 4, width: '100%', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowCostAnalysis(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <CostAnalysis />
          </div>
        </div>
      )}

      {/* Individual Finance Tracker Modal */}
      {showIndividualTracker && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowIndividualTracker(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 4, width: '100%', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowIndividualTracker(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <IndividualFinanceTracker />
          </div>
        </div>
      )}

      {/* Yield Prediction Modal */}
      {showYieldPrediction && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowYieldPrediction(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 4, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowYieldPrediction(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <CropYieldPrediction userEmail={userEmail} />
          </div>
        </div>
      )}

      {/* Crop Recommendation Modal */}
      {showCropRecommendation && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowCropRecommendation(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 4, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowCropRecommendation(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <CropRecommendation userEmail={userEmail} />
          </div>
        </div>
      )}

      {/* AgriAI Modal */}
      {showAgriAI && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAgriAI(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowAgriAI(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <AgriAI userEmail={userEmail} userLocation={localStorage.getItem('userLocation') || ''} />
          </div>
        </div>
      )}

      {/* Disease Detection Modal */}
      {showDiseaseDetection && (
        <div className="pro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDiseaseDetection(false); setActiveView('overview'); } }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', width: '100%', maxWidth: 780, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button className="pro-modal-close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 10 }} onClick={() => { setShowDiseaseDetection(false); setActiveView('overview'); }} aria-label="Close">×</button>
            <DiseaseDetection userEmail={userEmail} />
          </div>
        </div>
      )}

      {/* Profile Prompt Modal */}
      {showProfilePrompt && (
        <div className="pro-modal-overlay">
          <div className="pro-modal animate-bounce-in">
            <div className="pro-modal-header">
              <h3 className="pro-modal-title">🌱 Welcome to AgriBudget!</h3>
              <button className="pro-modal-close" onClick={() => setShowProfilePrompt(false)} aria-label="Close">×</button>
            </div>
            <div className="pro-modal-body">
              <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 18, lineHeight: 1.65 }}>
                To provide the best experience, we recommend updating your profile with:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {['Contact details and location', 'Farm size and crop preferences', 'Financial goals and budget settings'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#374151' }}>
                    <span style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="pro-modal-footer">
              <button className="pro-btn pro-btn-secondary" onClick={() => setShowProfilePrompt(false)}>Maybe Later</button>
              <button className="pro-btn pro-btn-primary" onClick={() => { setShowProfilePrompt(false); navigate('/settings'); }}>Update Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;