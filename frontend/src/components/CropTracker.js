import React from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaBell, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const categories = ['Seeds', 'Fertilizer', 'Pesticide', 'Labor', 'Irrigation', 'Other'];

const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  const bg = type === 'error' ? '#fef2f2' : '#f0fdf4';
  const border = type === 'error' ? '#fecaca' : '#bbf7d0';
  const color = type === 'error' ? '#dc2626' : '#16a34a';
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, borderRadius: 10,
      padding: '12px 20px', color, fontWeight: 600, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      <span>{type === 'error' ? '❌' : '✅'} {msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 16 }}>×</button>
    </div>
  );
};

const CropTracker = () => {
  const userEmail = localStorage.getItem('userEmail');

  const [crops, setCrops] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState({ msg: '', type: 'success' });

  // Crop form
  const [showAddCrop, setShowAddCrop] = React.useState(false);
  const [editingCrop, setEditingCrop] = React.useState(null);
  const [cropForm, setCropForm] = React.useState({ name: '', startDate: '', expectedHarvestDate: '', plannedBudget: '' });
  const [cropLoading, setCropLoading] = React.useState(false);

  // Expense form
  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [expenseForm, setExpenseForm] = React.useState({ crop: '', category: categories[0], amount: '', date: '', note: '' });
  const [expenseLoading, setExpenseLoading] = React.useState(false);

  // Threshold
  const [showThresholdModal, setShowThresholdModal] = React.useState(false);
  const [selectedCrop, setSelectedCrop] = React.useState(null);
  const [thresholdForm, setThresholdForm] = React.useState({ threshold: '' });
  const [thresholdMsg, setThresholdMsg] = React.useState('');

  // Summary
  const [summaries, setSummaries] = React.useState([]);
  const [totals, setTotals] = React.useState({ plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
  const [expandedCrop, setExpandedCrop] = React.useState('');
  const [cropExpenses, setCropExpenses] = React.useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  React.useEffect(() => {
    fetchCrops();
    fetchSummary();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/user/crop', { params: { email: userEmail } });
      setCrops(res.data || []);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to load crops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get('/api/user/crop/summary', { params: { email: userEmail } });
      setSummaries(res.data.summaries || []);
      setTotals(res.data.totals || { plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
    } catch (e) { /* silent */ }
  };

  const toggleCropExpand = async (name) => {
    if (expandedCrop === name) {
      setExpandedCrop('');
      return;
    }
    setExpandedCrop(name);
    if (!cropExpenses[name]) {
      try {
        const res = await axios.get('/api/user/crop/expenses', { params: { email: userEmail, crop: name } });
        setCropExpenses(prev => ({ ...prev, [name]: res.data || [] }));
      } catch (e) {
        setCropExpenses(prev => ({ ...prev, [name]: [] }));
      }
    }
  };

  // === CROP CRUD ===
  const openAddCrop = () => {
    setEditingCrop(null);
    setCropForm({ name: '', startDate: '', expectedHarvestDate: '', plannedBudget: '' });
    setShowAddCrop(true);
  };

  const openEditCrop = (crop) => {
    setEditingCrop(crop);
    const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
    setCropForm({
      name: crop.name,
      startDate: fmt(crop.startDate),
      expectedHarvestDate: fmt(crop.expectedHarvestDate),
      plannedBudget: crop.plannedBudget,
    });
    setShowAddCrop(true);
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    setCropLoading(true);
    try {
      if (editingCrop) {
        await axios.put(`/api/user/crop/${editingCrop._id}`, { email: userEmail, ...cropForm });
        showToast('Crop updated successfully');
      } else {
        await axios.post('/api/user/crop', { email: userEmail, ...cropForm });
        showToast('Crop added successfully');
      }
      setShowAddCrop(false);
      setEditingCrop(null);
      setCropForm({ name: '', startDate: '', expectedHarvestDate: '', plannedBudget: '' });
      fetchCrops();
      fetchSummary();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save crop', 'error');
    } finally {
      setCropLoading(false);
    }
  };

  const handleDeleteCrop = async (crop) => {
    if (!window.confirm(`Delete crop "${crop.name}"? This will also delete all its expenses.`)) return;
    try {
      await axios.delete(`/api/user/crop/${crop._id}`, { data: { email: userEmail } });
      showToast('Crop deleted');
      fetchCrops();
      fetchSummary();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete crop', 'error');
    }
  };

  // === EXPENSE CRUD ===
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setExpenseLoading(true);
    try {
      await axios.post('/api/user/expense', { email: userEmail, ...expenseForm });
      showToast('Expense added successfully');
      setShowAddExpense(false);
      setExpenseForm({ crop: '', category: categories[0], amount: '', date: '', note: '' });
      // Refresh the crop expenses if expanded
      if (expenseForm.crop && expandedCrop === expenseForm.crop) {
        const res = await axios.get('/api/user/crop/expenses', { params: { email: userEmail, crop: expenseForm.crop } });
        setCropExpenses(prev => ({ ...prev, [expenseForm.crop]: res.data || [] }));
      }
      fetchSummary();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to add expense', 'error');
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId, cropName) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/user/expense/${expenseId}`, { data: { email: userEmail } });
      showToast('Expense deleted');
      // Refresh expenses for this crop
      const res = await axios.get('/api/user/crop/expenses', { params: { email: userEmail, crop: cropName } });
      setCropExpenses(prev => ({ ...prev, [cropName]: res.data || [] }));
      fetchSummary();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  // === THRESHOLD ===
  const openThresholdModal = (crop) => {
    setSelectedCrop(crop);
    setThresholdForm({ threshold: crop.customThreshold || '' });
    setThresholdMsg('');
    setShowThresholdModal(true);
  };

  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/user/crop/${selectedCrop._id}/threshold`, {
        email: userEmail,
        threshold: Number(thresholdForm.threshold)
      });
      showToast(`Alert threshold set to ${thresholdForm.threshold}% for ${selectedCrop.name}`);
      setTimeout(() => setShowThresholdModal(false), 1500);
    } catch (e) {
      setThresholdMsg(e.response?.data?.message || 'Failed to set threshold');
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#15803d', margin: 0 }}>🌾 Crop-wise Tracking</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openAddCrop} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FaPlus style={{ fontSize: 10 }} /> Add Crop
          </button>
          <button onClick={() => { setShowAddExpense(true); setExpenseForm({ crop: crops[0]?.name || '', category: categories[0], amount: '', date: '', note: '' }); }}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FaPlus style={{ fontSize: 10 }} /> Add Expense
          </button>
        </div>
      </div>

      {/* Budget Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Planned', value: fmtMoney(totals.plannedBudget), color: '#2563eb' },
          { label: 'Total Spent', value: fmtMoney(totals.totalSpent), color: '#dc2626' },
          { label: 'Remaining', value: fmtMoney(totals.remainingBudget), color: '#16a34a' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Crops List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading crops…</div>
      ) : crops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12, border: '2px dashed #d1d5db' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No crops added yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Start tracking your crops and their budgets</div>
          <button onClick={openAddCrop} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>+ Add Your First Crop</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {summaries.map((s, idx) => {
            const cropDoc = crops.find(c => c.name === s.name);
            const pct = s.plannedBudget > 0 ? Math.min(100, Math.round((s.totalSpent / s.plannedBudget) * 100)) : 0;
            const barColor = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#16a34a';
            const isExpanded = expandedCrop === s.name;
            const expenses = cropExpenses[s.name] || [];

            return (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                {/* Crop Header */}
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{s.name}</span>
                      {pct >= 100 && <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: '2px 8px', border: '1px solid #fecaca' }}>Over Budget!</span>}
                      {pct >= 80 && pct < 100 && <span style={{ background: '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: '2px 8px', border: '1px solid #fde68a' }}>Near Limit</span>}
                    </div>
                    {cropDoc && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                        {fmtDate(cropDoc.startDate)} → {fmtDate(cropDoc.expectedHarvestDate)}
                      </div>
                    )}
                    {/* Budget Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 38 }}>{pct}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      <span>Planned: <strong style={{ color: '#2563eb' }}>{fmtMoney(s.plannedBudget)}</strong></span>
                      <span>Spent: <strong style={{ color: '#dc2626' }}>{fmtMoney(s.totalSpent)}</strong></span>
                      <span>Left: <strong style={{ color: '#16a34a' }}>{fmtMoney(s.remainingBudget)}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {cropDoc && (
                      <>
                        <button onClick={() => openThresholdModal(cropDoc)} title="Set Alert Threshold"
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#2563eb', fontSize: 12 }}>
                          <FaBell />
                        </button>
                        <button onClick={() => openEditCrop(cropDoc)} title="Edit Crop"
                          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#16a34a', fontSize: 12 }}>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteCrop(cropDoc)} title="Delete Crop"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>
                          <FaTrash />
                        </button>
                      </>
                    )}
                    <button onClick={() => toggleCropExpand(s.name)}
                      style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#374151', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      <span>{isExpanded ? 'Hide' : 'Expenses'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Expenses */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 18px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Expenses for {s.name}</span>
                      <button onClick={() => { setShowAddExpense(true); setExpenseForm({ crop: s.name, category: categories[0], amount: '', date: '', note: '' }); }}
                        style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        + Add
                      </button>
                    </div>
                    {expenses.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>No expenses recorded yet</div>
                    ) : (
                      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {['Date', 'Category', 'Amount', 'Note', ''].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((exp) => (
                            <tr key={exp._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '7px 8px', color: '#374151' }}>{fmtDate(exp.date)}</td>
                              <td style={{ padding: '7px 8px', color: '#374151' }}>{exp.category}</td>
                              <td style={{ padding: '7px 8px', fontWeight: 700, color: '#dc2626' }}>{fmtMoney(exp.amount)}</td>
                              <td style={{ padding: '7px 8px', color: '#6b7280' }}>{exp.note || '—'}</td>
                              <td style={{ padding: '7px 8px' }}>
                                <button onClick={() => handleDeleteExpense(exp._id, s.name)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '2px 6px' }}>
                                  <FaTrash style={{ fontSize: 11 }} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Crop Modal */}
      {showAddCrop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 440, position: 'relative' }}>
            <button onClick={() => setShowAddCrop(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <div style={{ padding: '22px 28px 14px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h2>
            </div>
            <form onSubmit={handleCropSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'Crop Name', n: 'name', t: 'text', p: 'e.g. Wheat, Rice, Cotton' },
                { l: 'Start Date', n: 'startDate', t: 'date', p: '' },
                { l: 'Expected Harvest Date', n: 'expectedHarvestDate', t: 'date', p: '' },
                { l: 'Planned Budget (₹)', n: 'plannedBudget', t: 'number', p: 'e.g. 50000' },
              ].map(f => (
                <div key={f.n}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.l}</label>
                  <input type={f.t} name={f.n} value={cropForm[f.n]} onChange={e => setCropForm({ ...cropForm, [e.target.name]: e.target.value })}
                    placeholder={f.p} required
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button type="submit" disabled={cropLoading}
                style={{ background: '#16a34a', color: '#fff', padding: '10px 0', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: cropLoading ? 0.7 : 1 }}>
                {cropLoading ? 'Saving…' : (editingCrop ? 'Update Crop' : 'Add Crop')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 440, position: 'relative' }}>
            <button onClick={() => setShowAddExpense(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <div style={{ padding: '22px 28px 14px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Add Crop Expense</h2>
            </div>
            <form onSubmit={handleAddExpense} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Crop *</label>
                <select name="crop" value={expenseForm.crop} onChange={e => setExpenseForm({ ...expenseForm, crop: e.target.value })} required
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select crop</option>
                  {crops.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category *</label>
                <select name="category" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Amount (₹) *</label>
                <input type="number" name="amount" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount" required min="1"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Date</label>
                <input type="date" name="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Note (optional)</label>
                <input name="note" value={expenseForm.note} onChange={e => setExpenseForm({ ...expenseForm, note: e.target.value })} placeholder="Optional note"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={expenseLoading}
                style={{ background: '#d97706', color: '#fff', padding: '10px 0', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: expenseLoading ? 0.7 : 1 }}>
                {expenseLoading ? 'Saving…' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Threshold Modal */}
      {showThresholdModal && selectedCrop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={() => setShowThresholdModal(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            <div style={{ padding: '22px 28px 14px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>🔔 Set Alert Threshold</h2>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#1e40af' }}>
                <strong>{selectedCrop.name}</strong> · Budget: {fmtMoney(selectedCrop.plannedBudget)}<br />
                <span style={{ fontSize: 12, color: '#3b82f6' }}>Get notified when spending reaches a % of your planned budget</span>
              </div>
              <form onSubmit={handleThresholdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Alert at (%) *</label>
                  <input type="number" min="1" max="200" value={thresholdForm.threshold} onChange={e => setThresholdForm({ threshold: e.target.value })}
                    placeholder="e.g. 80 for 80%" required
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 7, padding: '9px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>You'll receive an in-app alert when this threshold is reached</p>
                </div>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '10px 0', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Set Alert Threshold
                </button>
                {thresholdMsg && <div style={{ textAlign: 'center', fontSize: 13, color: thresholdMsg.includes('Failed') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{thresholdMsg}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropTracker;
