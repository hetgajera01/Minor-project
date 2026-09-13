import React from 'react';
import {
  FaShoppingCart, FaMapMarkerAlt, FaCheck, FaTimes, FaTruck,
  FaDownload, FaArrowLeft, FaBoxOpen, FaClock, FaStore, FaPhone, FaSync
} from 'react-icons/fa';
import axios from 'axios';

const STATUS_CONFIG = {
  Placed:    { badge: 'pro-badge-gray',   icon: <FaShoppingCart style={{ fontSize: 11 }} />, step: 0 },
  Accepted:  { badge: 'pro-badge-amber',  icon: <FaCheck style={{ fontSize: 11 }} />,        step: 1 },
  Shipped:   { badge: 'pro-badge-blue',   icon: <FaTruck style={{ fontSize: 11 }} />,         step: 2 },
  Completed: { badge: 'pro-badge-green',  icon: <FaCheck style={{ fontSize: 11 }} />,         step: 3 },
  Rejected:  { badge: 'pro-badge-red',    icon: <FaTimes style={{ fontSize: 11 }} />,          step: -1 },
};

const TIMELINE_STEPS = [
  { label: 'Order Placed',    icon: <FaShoppingCart style={{ fontSize: 13 }} /> },
  { label: 'Accepted',        icon: <FaCheck style={{ fontSize: 13 }} /> },
  { label: 'Shipped',         icon: <FaTruck style={{ fontSize: 13 }} /> },
  { label: 'Completed',       icon: <FaBoxOpen style={{ fontSize: 13 }} /> },
];

const FILTERS = ['All', 'Placed', 'Accepted', 'Shipped', 'Completed', 'Rejected'];

const MyOrders = () => {
  const farmerEmail = localStorage.getItem('userEmail');
  const farmerName  = localStorage.getItem('userName');

  const [orders,   setOrders]   = React.useState([]);
  const [loading,  setLoading]  = React.useState(false);
  const [filter,   setFilter]   = React.useState('All');
  const [expanded, setExpanded] = React.useState(null);

  React.useEffect(() => {
    if (farmerEmail) loadOrders();
  }, [farmerEmail]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/user/farmer/orders', { params: { email: farmerEmail } });
      setOrders(res.data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  if (!farmerEmail) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 380 }}>
          <div style={{ width: 60, height: 60, background: '#dcfce7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>🛒</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Please Log In</h2>
          <a href="/login" style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '10px 22px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 8 }}>Go to Login →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="/farmer-dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
              <FaArrowLeft style={{ fontSize: 11 }} /> Dashboard
            </a>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>My Orders</h1>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Track your marketplace orders</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Hello, {farmerName}</span>
            <button onClick={loadOrders} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 13px', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
              <FaSync style={{ fontSize: 11 }} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Orders', value: orders.length, accent: '#374151', iconBg: '#f3f4f6' },
              { label: 'Placed', value: orders.filter(o => o.status === 'Placed').length, accent: '#6b7280', iconBg: '#f9fafb' },
              { label: 'Accepted', value: orders.filter(o => o.status === 'Accepted').length, accent: '#d97706', iconBg: '#fef3c7' },
              { label: 'Shipped', value: orders.filter(o => o.status === 'Shipped').length, accent: '#2563eb', iconBg: '#dbeafe' },
              { label: 'Completed', value: orders.filter(o => o.status === 'Completed').length, accent: '#16a34a', iconBg: '#dcfce7' },
              { label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + (o.totalPrice || 0), 0).toLocaleString('en-IN')}`, accent: '#16a34a', iconBg: '#dcfce7' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${s.accent}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>{s.value}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, border: filter === f ? 'none' : '1px solid #e5e7eb',
              background: filter === f ? '#16a34a' : '#fff',
              color: filter === f ? '#fff' : '#374151',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
              onMouseEnter={e => { if (filter !== f) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (filter !== f) e.currentTarget.style.background = '#fff'; }}
            >
              {f}
              {f !== 'All' && (
                <span style={{ marginLeft: 5, fontSize: 10, background: filter === f ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280', borderRadius: 9999, padding: '1px 6px', fontWeight: 700 }}>
                  {orders.filter(o => o.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #dcfce7', borderTop: '3px solid #16a34a', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Loading orders…</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="pro-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🛒</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              {filter === 'All' ? 'No orders yet' : `No "${filter}" orders`}
            </div>
            <div style={{ fontSize: 13.5, color: '#9ca3af', marginBottom: 22, maxWidth: 280, margin: '0 auto 22px' }}>
              {filter === 'All' ? 'Visit the marketplace to find and order agricultural products.' : 'Try selecting a different status filter.'}
            </div>
            <a href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '10px 22px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <FaStore style={{ fontSize: 12 }} /> Browse Marketplace
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredOrders.map((order) => {
              const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.Placed;
              const isOpen = expanded === order._id;
              const step   = cfg.step;
              const isRej  = order.status === 'Rejected';

              return (
                <div key={order._id} className="pro-card" style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                  {/* Order row header */}
                  <div
                    style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                    onClick={() => setExpanded(isOpen ? null : order._id)}
                  >
                    {/* Product image */}
                    <div style={{ width: 52, height: 52, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {order.productId?.imagePath ? (
                        <img src={order.productId.imagePath} alt={order.productId?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : <span style={{ fontSize: 22 }}>📦</span>}
                    </div>

                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.productId?.name || 'Product'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaStore style={{ fontSize: 10 }} /> {order.agroId?.agroName || 'Seller'}
                        </span>
                        {order.agroId?.city && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaMapMarkerAlt style={{ fontSize: 10 }} /> {order.agroId.city}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaClock style={{ fontSize: 10 }} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Price + status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}</div>
                      <span className={`pro-badge ${cfg.badge}`}>{cfg.icon}&nbsp; {order.status}</span>
                    </div>

                    {/* Expand arrow */}
                    <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 4, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f3f4f6', padding: '20px 22px', background: '#fafafa', animationName: 'fadeIn', animationDuration: '0.2s' }}>

                      {/* Order progress timeline */}
                      {!isRej && (
                        <div style={{ marginBottom: 22 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Order Progress</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            {TIMELINE_STEPS.map((s, idx) => {
                              const done   = step > idx;
                              const active = step === idx;
                              return (
                                <React.Fragment key={idx}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <div style={{
                                      width: 34, height: 34, borderRadius: '50%',
                                      background: done ? '#16a34a' : active ? '#fff' : '#f3f4f6',
                                      border: active ? '2.5px solid #16a34a' : done ? '2.5px solid #16a34a' : '2px solid #e5e7eb',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: done ? '#fff' : active ? '#16a34a' : '#9ca3af',
                                      boxShadow: active ? '0 0 0 5px rgba(22,163,74,0.12)' : 'none',
                                      flexShrink: 0, transition: 'all 0.2s',
                                    }}>
                                      {s.icon}
                                    </div>
                                    <span style={{ fontSize: 10.5, fontWeight: 600, color: done || active ? '#111827' : '#9ca3af', whiteSpace: 'nowrap' }}>{s.label}</span>
                                  </div>
                                  {idx < TIMELINE_STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: done ? '#16a34a' : '#e5e7eb', marginBottom: 20, transition: 'background 0.3s', minWidth: 20 }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isRej && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
                          <FaTimes /> This order was rejected by the seller.
                        </div>
                      )}

                      {/* Details grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
                        {[
                          { label: 'Quantity', value: `${order.quantity} units` },
                          { label: 'Unit Price', value: `₹${Number(order.productId?.price || 0).toLocaleString('en-IN')}` },
                          { label: 'Total', value: `₹${Number(order.totalPrice || 0).toLocaleString('en-IN')}` },
                          { label: 'Payment', value: order.paymentStatus || '—' },
                          { label: 'Category', value: order.productId?.category || '—' },
                        ].map((d, i) => (
                          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 13px' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>{d.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{d.value}</div>
                          </div>
                        ))}
                      </div>

                      {order.deliveryAddress && (
                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <FaMapMarkerAlt style={{ color: '#dc2626', fontSize: 13, marginTop: 2 }} />
                          <div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Delivery Address</div>
                            <div style={{ fontSize: 13.5, color: '#374151' }}>{order.deliveryAddress}</div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {order.status === 'Completed' && order.invoicePath && (
                          <a href={order.invoicePath} download style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                            <FaDownload style={{ fontSize: 11 }} /> Invoice
                          </a>
                        )}
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <FaPhone style={{ fontSize: 11 }} /> Contact Seller
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
