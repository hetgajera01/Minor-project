import React from 'react';
import { FaBuilding, FaClock, FaMapMarkerAlt, FaCogs, FaBell, FaPlus, FaUserCircle, FaChartLine, FaBoxOpen, FaCog, FaEdit, FaTrash, FaShoppingCart, FaEnvelope, FaCheck, FaTimes, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';
import Analytics from './Analytics';
import { useNavigate } from 'react-router-dom';

// Toast notification component
const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  const styles = {
    position: 'fixed', top: 24, right: 24, zIndex: 9999,
    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
    border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
    color: type === 'error' ? '#dc2626' : '#16a34a',
    borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    maxWidth: 340,
  };
  return (
    <div style={styles}>
      <span>{type === 'error' ? '❌' : '✅'} {msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'inherit', marginLeft: 6 }}>×</button>
    </div>
  );
};

const AgroDashboard = () => {
  const agroName = localStorage.getItem('agroName');
  const agroEmail = localStorage.getItem('agroEmail');
  const agroId = localStorage.getItem('agroId');
  const navigate = useNavigate();
  const [, setLoading] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [toast, setToast] = React.useState({ msg: '', type: 'success' });
  const [productSubmitting, setProductSubmitting] = React.useState(false);
  // Dashboard data states
  const [metrics, setMetrics] = React.useState({ products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [, setMetricsError] = React.useState('');
  const [profile, setProfile] = React.useState(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [services, setServices] = React.useState([]);
  const [servicesLoading, setServicesLoading] = React.useState(false);
  const [servicesError, setServicesError] = React.useState('');
  const [recentProducts, setRecentProducts] = React.useState([]);
  const [recentOrders, setRecentOrders] = React.useState([]);
  const [recentNotifications, setRecentNotifications] = React.useState([]);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [recentError, setRecentError] = React.useState('');
  // Service modal
  const [, setShowServiceModal] = React.useState(false);
  const [serviceInput, setServiceInput] = React.useState('');
  const [showProductModal, setShowProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [productForm, setProductForm] = React.useState({
    name: '',
    category: 'Seed',
    price: '',
    quantity: '',
    discount: '',
    description: '',
    image: null
  });

  React.useEffect(() => {
    if (!(agroId || agroEmail)) return;
    const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
    const loadFallbackDashboard = async () => {
      try {
        console.log('Loading fallback dashboard data...');
        const res = await axios.get('/api/user/agro/dashboard', { params: idOrEmail });
        const d = res.data || {};
        console.log('Fallback dashboard data:', d);
        
        // Map summary to profile-like shape
        setProfile(p => p || {
          agroType: d?.summary?.agroType,
          businessType: d?.summary?.agroType,
          city: d?.summary?.city,
          location: d?.summary?.city,
          workingHours: d?.summary?.workingHours,
          logoPath: d?.summary?.logoPath,
        });
        setServices(s => (s && s.length ? s : (d?.services || [])));
        // Only update if we don't already have data
        setRecentProducts(rp => {
          console.log('Fallback - Recent products:', { existing: rp?.length || 0, fallback: d?.recent?.products?.length || 0 });
          if (rp && rp.length > 0) return rp; // Keep existing data
          return d?.recent?.products || [];
        });
        setRecentOrders(ro => {
          console.log('Fallback - Recent orders:', { existing: ro?.length || 0, fallback: d?.recent?.orders?.length || 0 });
          if (ro && ro.length > 0) return ro; // Keep existing data
          return d?.recent?.orders || [];
        });
        setRecentNotifications(rn => {
          console.log('Fallback - Recent notifications:', { existing: rn?.length || 0, fallback: d?.recent?.notifications?.length || 0 });
          if (rn && rn.length > 0) return rn; // Keep existing data
          return d?.recent?.notifications || [];
        });
        
        // Clear the error if fallback succeeded
        if (d?.recent?.products || d?.recent?.orders) {
          setRecentError('');
        }
      } catch (error) {
        console.error('Fallback dashboard also failed:', error);
        setRecentError('Failed to load recent data from all sources');
      }
    };
    const loadAll = async () => {
      try {
        setLoading(true);
        let anyFailed = false;
        await Promise.all([
          (async () => {
            try {
              setMetricsLoading(true);
              const r = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
              setMetrics(r.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
            } catch (e) {
              setMetricsError('Failed to load metrics');
              anyFailed = true;
            } finally { setMetricsLoading(false); }
          })(),
          (async () => {
            try {
              setProfileLoading(true);
              let prof = null;
              try {
                const r = await axios.get('/api/user/agro/profile', { params: idOrEmail });
                prof = r.data || null;
              } catch (_) { /* try fallbacks below */ }

              // Fallback: fetch by direct id endpoint if available
              if ((!prof || Object.keys(prof || {}).length === 0) && agroId) {
                try {
                  const r2 = await axios.get(`/api/user/agro/${agroId}`);
                  prof = r2.data || prof;
                } catch (_) { /* ignore */ }
              }

              // Last resort: use summary from aggregated dashboard endpoint
              if (!prof || Object.keys(prof || {}).length === 0) {
                try {
                  const agg = await axios.get('/api/user/agro/dashboard', { params: idOrEmail });
                  const d = agg.data || {};
                  prof = {
                    agroType: d?.summary?.agroType,
                    businessType: d?.summary?.agroType,
                    city: d?.summary?.city,
                    location: d?.summary?.city,
                    workingHours: d?.summary?.workingHours,
                    logoPath: d?.summary?.logoPath,
                  };
                } catch (_) { /* ignore */ }
              }

              setProfile(prof || null);
            } catch (e) {
              setProfileError('Failed to load profile');
              anyFailed = true;
            } finally { setProfileLoading(false); }
          })(),
          (async () => {
            try {
              setServicesLoading(true);
              const r = await axios.get('/api/user/agro/services', { params: idOrEmail });
              setServices(r.data?.services || []);
            } catch (e) {
              setServicesError('Failed to load services');
              anyFailed = true;
            } finally { setServicesLoading(false); }
          })(),
          (async () => {
            try {
              setRecentLoading(true);
              setRecentError(''); // Clear previous errors
              
              // Try to load each endpoint individually with better error handling
              const loadRecentProducts = async () => {
                try {
                  const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
                  console.log('Recent products loaded:', response.data?.length || 0);
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent products:', err);
                  // Fallback: try to load all products
                  try {
                    const fallbackRes = await axios.get('/api/user/product', { params: { email: agroEmail } });
                    return (fallbackRes.data || []).slice(0, 10);
                  } catch (fallbackErr) {
                    console.error('Fallback also failed:', fallbackErr);
                    return [];
                  }
                }
              };
              
              const loadRecentOrders = async () => {
                try {
                  const response = await axios.get('/api/user/agro/orders/recent', { params: { ...idOrEmail, limit: 5 } });
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent orders:', err);
                  return [];
                }
              };
              
              const loadRecentNotifications = async () => {
                try {
                  const response = await axios.get('/api/user/agro/notifications', { params: { ...idOrEmail, limit: 5 } });
                  return response.data || [];
                } catch (err) {
                  console.error('Error loading recent notifications:', err);
                  return [];
                }
              };
              
              const [products, orders, notifications] = await Promise.all([
                loadRecentProducts(),
                loadRecentOrders(),
                loadRecentNotifications()
              ]);
              
              setRecentProducts(products);
              setRecentOrders(orders);
              setRecentNotifications(notifications);
              
              console.log('Loaded data:', { products: products.length, orders: orders.length, notifications: notifications.length });
              
              // Only mark as failed if ALL endpoints failed to load any data
              if (products.length === 0 && orders.length === 0 && notifications.length === 0) {
                console.log('All endpoints returned empty data, will try fallback');
                anyFailed = true;
              } else {
                // If we got some data, don't trigger fallback
                console.log('Got some data, skipping fallback');
                anyFailed = false;
              }
            } catch (e) {
              console.error('Error loading recent data:', e);
              setRecentError('Failed to load recent data');
              anyFailed = true;
            } finally { setRecentLoading(false); }
          })(),
        ]);
        // If any failed, try fallback aggregation endpoint
        if (anyFailed) {
          console.log('Some endpoints failed, trying fallback dashboard endpoint...');
          await loadFallbackDashboard();
        } else {
          console.log('All endpoints succeeded, no fallback needed');
        }
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [agroId, agroEmail]);

  // Load data based on active tab
  React.useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'notifications') {
      // Load latest notifications when viewing All Notifications
      (async () => {
        try {
          setRecentLoading(true);
          let list = [];
          if (agroEmail) {
            try {
              const r = await axios.get('/api/user/notifications', { params: { email: agroEmail, userRole: 'agro' } });
              list = r.data || [];
            } catch (_) { /* try fallback */ }
          }
          if ((!list || list.length === 0) && agroId) {
            try {
              const r2 = await axios.get('/api/user/agro/notifications', { params: { id: agroId, limit: 100 } });
              list = r2.data || list;
            } catch (_) { /* ignore */ }
          }
          setRecentNotifications(list || []);
        } catch (e) {
          setRecentError('Failed to load notifications');
        } finally {
          setRecentLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, agroEmail, agroId]);

  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/user/product', { params: { email: agroEmail } });
      const allProducts = res.data || [];
      setProducts(allProducts);
      console.log('Loaded products:', allProducts.length);
      // Log product dates for debugging
      if (allProducts.length > 0) {
        const oldestProduct = allProducts[allProducts.length - 1];
        const newestProduct = allProducts[0];
        console.log(`Product date range - Oldest: ${oldestProduct.createdAt}, Newest: ${newestProduct.createdAt}`);
        console.log(`Total products loaded: ${allProducts.length}`);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get('/api/user/agro/orders', { params: { email: agroEmail } });
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Service handler - kept for future use
  // eslint-disable-next-line no-unused-vars
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceInput.trim()) return;
    try {
      const payload = agroId ? { id: agroId, service: serviceInput } : { email: agroEmail, service: serviceInput };
      const r = await axios.post('/api/user/agro/services', payload);
      setServices(r.data?.services || []);
      setServiceInput('');
      setShowServiceModal(false);
    } catch (e) {
      // Keep modal open to let user retry
    }
  };

  const loadRequests = async () => {
    try {
      const res = await axios.get('/api/user/agro/requests', { params: { email: agroEmail } });
      setRequests(res.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (key !== 'image') {
          // Always append all non-image fields (discount defaults to 0 if empty)
          formData.append(key, key === 'discount' ? (productForm[key] || '0') : (productForm[key] || ''));
        }
      });
      formData.append('email', agroEmail);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      if (editingProduct) {
        await axios.put(`/api/user/product/${editingProduct._id}`, formData);
        showToast('Product updated successfully!');
      } else {
        await axios.post('/api/user/product', formData);
        showToast('Product added successfully!');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Seed', price: '', quantity: '', discount: '', description: '', image: null });
      // Reload products and metrics
      await loadProducts();
      try {
        const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
        const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
        setRecentProducts(response.data || []);
        const metricsRes = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
        setMetrics(metricsRes.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
      } catch (err) {
        console.error('Error reloading recent products:', err);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(error.response?.data?.message || 'Failed to save product. Please try again.', 'error');
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      discount: product.discount,
      description: product.description,
      image: null
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/user/product/${productId}`, { data: { email: agroEmail } });
        showToast('Product deleted successfully');
        await loadProducts();
        try {
          const idOrEmail = agroId ? { id: agroId } : { email: agroEmail };
          const response = await axios.get('/api/user/agro/products/recent', { params: { ...idOrEmail, limit: 10 } });
          setRecentProducts(response.data || []);
          const metricsRes = await axios.get('/api/user/agro/dashboard/metrics', { params: idOrEmail });
          setMetrics(metricsRes.data || { products: 0, orders: 0, pendingOrders: 0, revenue: 0 });
        } catch (err) {
          console.error('Error reloading recent products:', err);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast(error.response?.data?.message || 'Failed to delete product.', 'error');
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.patch(`/api/user/order/${orderId}/status`, {
        email: agroEmail,
        status
      });
      showToast(`Order status updated to ${status}`);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  const handleRequestResponse = async (requestId, response, status) => {
    try {
      await axios.patch(`/api/user/request/${requestId}/respond`, {
        email: agroEmail,
        response,
        status
      });
      showToast('Response sent to farmer');
      loadRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      showToast('Failed to send response', 'error');
    }
  };

  if (!agroName) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '40px 48px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Please log in</div>
          <a href="/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Go to Login →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="ab-dashboard-shell" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

      {/* Mobile overlay */}
      {sidebarOpen && <div className="ab-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`ab-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        <div className="ab-sidebar-logo">
          <div className="ab-sidebar-logo-icon">
            <FaBuilding style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span className="ab-sidebar-logo-text">AgriBudget</span>
        </div>
        <nav className="ab-sidebar-nav">
          <div className="ab-sidebar-section-label">Business</div>
          {[
            { icon: <FaChartLine />, label: 'Dashboard',      tab: 'dashboard' },
            { icon: <FaBoxOpen />,   label: 'My Products',    tab: 'products' },
            { icon: <FaShoppingCart />, label: 'Orders',      tab: 'orders' },
            { icon: <FaEnvelope />,  label: 'Requests',       tab: 'requests' },
            { icon: <FaChartBar />,  label: 'Analytics',      tab: 'analytics' },
            { icon: <FaBell />,      label: 'Notifications',  tab: 'notifications' },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`ab-sidebar-item${activeTab === item.tab ? ' active' : ''}`}
              onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
            >
              <span className="ab-sidebar-icon">{item.icon}</span>
              <span className="ab-sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="ab-sidebar-footer">
          <button className="ab-sidebar-item" onClick={() => navigate('/settings')}>
            <span className="ab-sidebar-icon"><FaCog /></span>
            <span className="ab-sidebar-label">Settings</span>
          </button>
          <button
            className="ab-sidebar-item"
            style={{ color: '#dc2626' }}
            onClick={() => {
              localStorage.removeItem('agroName');
              localStorage.removeItem('agroEmail');
              localStorage.removeItem('agroId');
              localStorage.removeItem('role');
              navigate('/login');
            }}
          >
            <span className="ab-sidebar-icon"><FaSignOutAlt /></span>
            <span className="ab-sidebar-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ab-main">
        {/* Header */}
        <header className="ab-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}
              aria-label="Open sidebar"
            >
              <span style={{ fontSize: 17 }}>☰</span>
            </button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                🏭 Welcome, {agroName}
              </h1>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 2 }}>Manage your agro-business</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dbeafe', color: '#1d4ed8', borderRadius: 9999, padding: '3px 10px', fontSize: 11.5, fontWeight: 600 }}>
              <FaBuilding style={{ fontSize: 10 }} /> Agro-Business
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <NotificationCenter userRole="agro" userId={agroId} userEmail={agroEmail} onViewAll={() => setActiveTab('notifications')} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#374151', maxWidth: 220, overflow: 'hidden' }}>
              <FaUserCircle style={{ fontSize: 15, color: '#9ca3af', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agroEmail}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="ab-main-body">
          {activeTab === 'dashboard' && (
            <>
              {/* KPI Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { title: 'Total Products', value: metricsLoading ? '...' : metrics.products, accent: '#16a34a', iconBg: '#dcfce7', icon: <FaBoxOpen style={{ fontSize: 15, color: '#16a34a' }} /> },
                  { title: 'Total Orders', value: metricsLoading ? '...' : metrics.orders, accent: '#d97706', iconBg: '#fef3c7', icon: <FaShoppingCart style={{ fontSize: 15, color: '#d97706' }} /> },
                  { title: 'Pending Orders', value: metricsLoading ? '...' : metrics.pendingOrders, accent: '#dc2626', iconBg: '#fee2e2', icon: <FaBell style={{ fontSize: 15, color: '#dc2626' }} /> },
                  { title: 'Revenue', value: metricsLoading ? '...' : `₹${Number(metrics.revenue || 0).toLocaleString('en-IN')}`, accent: '#2563eb', iconBg: '#dbeafe', icon: <FaChartLine style={{ fontSize: 15, color: '#2563eb' }} /> },
                ].map((c, i) => (
                  <div key={i} className="pro-stat-card" style={{ borderLeft: `4px solid ${c.accent}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span className="pro-stat-label">{c.title}</span>
                      <div style={{ width: 34, height: 34, background: c.iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
                    </div>
                    <div className="pro-stat-value">{c.value}</div>
                  </div>
                ))}
              </div>

              {/* Summary + Services */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div className="pro-card" style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Business Summary</div>
                  {profileLoading ? <div style={{ fontSize: 13, color: '#9ca3af' }}>Loading...</div> : profileError ? (
                    <div style={{ fontSize: 13, color: '#dc2626' }}>{profileError}</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#374151' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><FaCogs style={{ color: '#d97706', fontSize: 12 }} /> Type: {profile?.agroType || profile?.businessType || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><FaMapMarkerAlt style={{ color: '#dc2626', fontSize: 12 }} /> Location: {profile?.city || profile?.location || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><FaClock style={{ color: '#2563eb', fontSize: 12 }} /> Hours: {profile?.workingHours?.range || profile?.workingHours || '—'}</div>
                      {profile?.logoPath && <img src={profile.logoPath} alt="logo" style={{ marginTop: 8, width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />}
                    </div>
                  )}
                  <button style={{ marginTop: 14, background: '#d97706', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
                </div>

                <div className="pro-card" style={{ padding: '20px 24px', gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Services Offered</div>
                    <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><FaPlus style={{ fontSize: 10 }} /> Add Service</button>
                  </div>
                  {servicesLoading ? <div style={{ fontSize: 13, color: '#9ca3af' }}>Loading...</div> : servicesError ? (
                    <div style={{ fontSize: 13, color: '#dc2626' }}>{servicesError}</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(services || []).length === 0 ? <span style={{ fontSize: 13, color: '#9ca3af' }}>None added yet</span> : (
                        services.map((s, i) => (
                          <span key={i} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>{s}</span>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent products and orders */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 20 }}>
                {/* Recent Products */}
                <div className="pro-card">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaBoxOpen style={{ fontSize: 13, color: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Products</span>
                    </div>
                    <button onClick={() => setActiveTab('products')} style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View All →</button>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {recentLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>Loading…</div>
                    ) : recentError ? (
                      <div style={{ padding: '16px 20px', fontSize: 13, color: '#dc2626' }}>{recentError}</div>
                    ) : (recentProducts || []).length > 0 ? (
                      (recentProducts || []).slice(0, 6).map((p, idx) => (
                        <div key={p._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #f9fafb' }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                            <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                              <span className="pro-badge pro-badge-gray" style={{ fontSize: 10 }}>{p.category || '—'}</span>
                              <span style={{ marginLeft: 6, fontWeight: 700, color: '#16a34a' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          {p.imagePath && <img src={p.imagePath} alt="prod" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />}
                        </div>
                      ))
                    ) : (
                      <div className="pro-empty-state" style={{ padding: '28px 20px' }}>
                        <div className="pro-empty-icon" style={{ fontSize: 20 }}>📦</div>
                        <div className="pro-empty-title">No products yet</div>
                        <button className="pro-btn pro-btn-primary pro-btn-sm" onClick={() => setShowProductModal(true)}><FaPlus style={{ fontSize: 10 }} /> Add Product</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="pro-card">
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: '#fef3c7', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaShoppingCart style={{ fontSize: 13, color: '#d97706' }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Orders</span>
                    </div>
                    <button onClick={() => setActiveTab('orders')} style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View All →</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    {recentLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>Loading…</div>
                    ) : recentError ? (
                      <div style={{ padding: '16px 20px', fontSize: 13, color: '#dc2626' }}>{recentError}</div>
                    ) : (recentOrders || []).length > 0 ? (
                      <table className="pro-table">
                        <thead><tr><th>Product</th><th>Farmer</th><th>Qty</th><th>Status</th></tr></thead>
                        <tbody>
                          {(recentOrders || []).slice(0, 6).map((o, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600, fontSize: 13 }}>{o.productId?.name || o.productName}</td>
                              <td style={{ fontSize: 12.5, color: '#6b7280' }}>{o.farmerId?.name || o.farmerName}</td>
                              <td style={{ fontSize: 12.5 }}>{o.quantity}</td>
                              <td>
                                <span className={`pro-badge ${o.status === 'Completed' ? 'pro-badge-green' : o.status === 'Shipped' ? 'pro-badge-blue' : o.status === 'Rejected' ? 'pro-badge-red' : 'pro-badge-gray'}`}>{o.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="pro-empty-state" style={{ padding: '28px 20px' }}>
                        <div className="pro-empty-icon" style={{ fontSize: 20 }}>🛒</div>
                        <div className="pro-empty-title">No orders yet</div>
                        <div className="pro-empty-desc">Orders from farmers will appear here.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="text-lg font-bold text-[#2F855A] mb-3">Notifications</div>
                <div className="space-y-2">
                  {recentLoading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                  ) : recentError ? (
                    <div className="text-sm text-red-600">{recentError}</div>
                  ) : (recentNotifications || []).map((n, idx) => (
                    <div key={idx} className={`p-3 rounded border ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                      <div className="font-semibold text-gray-800 text-sm">{n.title}</div>
                      <div className="text-xs text-gray-600">{n.body}</div>
                    </div>
                  ))}
                  {(!recentNotifications || recentNotifications.length === 0) && !recentLoading && !recentError && <div className="text-sm text-gray-500">No notifications.</div>}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">All Notifications</h2>
              <div className="space-y-3">
                {(recentNotifications || []).map((n, idx) => (
                  <div key={idx} className={`p-3 rounded border ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-800 text-sm">{n.title}</div>
                      <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-gray-600">{n.body}</div>
                  </div>
                ))}
                {(!recentNotifications || recentNotifications.length === 0) && (
                  <div className="text-sm text-gray-500">No notifications.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2F855A]">My Products ({products.length} total)</h2>
                <button 
                  onClick={() => setShowProductModal(true)}
                  className="bg-[#2F855A] text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Product
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      {product.imagePath && (
                        <img src={product.imagePath} alt={product.name} className="w-full h-48 object-cover rounded mb-4" />
                      )}
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <p className="text-sm text-gray-700 mb-2">{product.description || 'No description'}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-[#2F855A]">₹{product.price}/kg</span>
                        {product.discount > 0 && (
                          <span className="text-sm text-red-600">-{product.discount}%</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Stock: {product.quantity} kg</p>
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p className="mb-4">No products added yet.</p>
                    <button 
                      onClick={() => setShowProductModal(true)}
                      className="bg-[#2F855A] text-white px-4 py-2 rounded-lg"
                    >
                      Add Your First Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Farmer</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {order.productId?.imagePath && (
                              <img src={order.productId.imagePath} alt={order.productId.name} className="w-10 h-10 object-cover rounded mr-3" />
                            )}
                            <div>
                              <div className="font-semibold">{order.productId?.name}</div>
                              <div className="text-sm text-gray-600">{order.productId?.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold">{order.farmerId?.name || order.farmerName}</div>
                            <div className="text-sm text-gray-600">{order.farmerId?.phone || order.farmerPhone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{order.quantity}</td>
                        <td className="py-3 px-4">₹{order.totalPrice}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Accepted' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {order.status === 'Placed' && (
                              <>
                                <button 
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Accepted')}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  <FaCheck className="inline mr-1" /> Accept
                                </button>
                                <button 
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Rejected')}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  <FaTimes className="inline mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {order.status === 'Accepted' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order._id, 'Shipped')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Ship
                              </button>
                            )}
                            {order.status === 'Shipped' && (
                              <button 
                                onClick={() => handleOrderStatusUpdate(order._id, 'Completed')}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-[#2F855A] mb-6">Farmer Requests</h2>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {request.productId?.imagePath && (
                          <img src={request.productId.imagePath} alt={request.productId.name} className="w-12 h-12 object-cover rounded mr-3" />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{request.productId?.name}</h3>
                          <p className="text-sm text-gray-600">Category: {request.productId?.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'Responded' ? 'bg-green-100 text-green-700' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Farmer: {request.farmerId?.name || request.farmerName}</p>
                      <p className="text-sm text-gray-600 mb-1">Contact: {request.farmerId?.phone || request.farmerPhone}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-semibold text-sm mb-1">Message:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
                    </div>
                    
                    {request.response && (
                      <div className="mb-3">
                        <p className="font-semibold text-sm mb-1">Your Response:</p>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{request.response}</p>
                      </div>
                    )}
                    
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            const response = prompt('Enter your response:');
                            if (response) {
                              handleRequestResponse(request._id, response, 'Responded');
                            }
                          }}
                          className="bg-green-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Respond
                        </button>
                        <button 
                          onClick={() => handleRequestResponse(request._id, 'Request rejected', 'Rejected')}
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No requests yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}
        </main>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
                setProductForm({ name: '', category: 'Seed', price: '', quantity: '', discount: '', description: '', image: null });
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#2F855A] mb-4 text-center">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none"
                  placeholder="Enter product name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none" required>
                  <option value="Seed">Seed</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none"
                    placeholder="Price" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
                  <input type="number" min="0" value={productForm.quantity} onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none"
                    placeholder="Qty" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Discount % <span style={{fontWeight:400,color:'#9ca3af'}}>(optional, default 0)</span></label>
                <input type="number" min="0" max="100" value={productForm.discount} onChange={(e) => setProductForm({...productForm, discount: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:outline-none"
                  placeholder="Product description" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image {editingProduct && <span style={{fontWeight:400,color:'#9ca3af'}}>(leave empty to keep current)</span>}</label>
                <input type="file" accept="image/*" onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm" />
              </div>
              <button type="submit" disabled={productSubmitting}
                className="w-full bg-[#2F855A] text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-xl hover:bg-[#246a46] transition-all duration-200"
                style={{ opacity: productSubmitting ? 0.7 : 1 }}>
                {productSubmitting ? 'Saving…' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroDashboard;
