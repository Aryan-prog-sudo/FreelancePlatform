import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [tab, setTab] = useState('projects');
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', category_id: '1' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passMsg, setPassMsg] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [p, c, e] = await Promise.all([
      axios.get(`${API}/projects`),
      axios.get(`${API}/contracts`),
      axios.get(`${API}/contracts/escrow`)
    ]);
    setProjects(p.data);
    setContracts(c.data);
    setEscrows(e.data);
    const notifs = [];
    c.data.filter(x => x.client_name === user.name).forEach(c => {
      if (c.payment_status === 'Pending') notifs.push({ msg: `Escrow pending for "${c.project_title}"`, type: 'warning' });
      if (c.payment_status === 'Released') notifs.push({ msg: `Payment released for "${c.project_title}"`, type: 'success' });
      if (c.payment_status === 'Refunded') notifs.push({ msg: `Escrow refunded for "${c.project_title}"`, type: 'error' });
    });
    setNotifications(notifs);
  };

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const postProject = async () => {
    if (!form.title || !form.budget || !form.deadline) { alert('Please fill in all required fields'); return; }
    if (parseFloat(form.budget) <= 0) { alert('Budget must be greater than 0'); return; }
    if (new Date(form.deadline) < new Date()) { alert('Deadline cannot be in the past'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/projects`, { ...form, customer_id: user.user_id });
      setNotifications(prev => [{ msg: `Project "${form.title}" posted!`, type: 'success' }, ...prev]);
      setForm({ title: '', description: '', budget: '', deadline: '', category_id: '1' });
      fetchAll();
      setTab('projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting project');
    } finally { setLoading(false); }
  };

  const viewBids = async (project) => {
    setSelectedProject(project);
    const res = await axios.get(`${API}/contracts/bids/${project.project_id}`);
    setBids(res.data);
    setTab('bids');
  };

  const acceptBid = async (bid) => {
    if (!window.confirm(`Accept bid from ${bid.freelancer_name} for $${bid.amount}?`)) return;
    try {
      await axios.post(`${API}/contracts/accept-bid`, { project_id: selectedProject.project_id, freelancer_id: bid.freelancer_id });
      setNotifications(prev => [{ msg: `Bid accepted from ${bid.freelancer_name}!`, type: 'success' }, ...prev]);
      fetchAll();
      setTab('escrow');
    } catch (err) { alert('Error accepting bid'); }
  };

  const updateEscrow = async (escrow_id, status) => {
    if (!window.confirm(`${status} this escrow payment?`)) return;
    await axios.post(`${API}/contracts/escrow/update`, { escrow_id, status });
    setNotifications(prev => [{ msg: `Escrow ${status}!`, type: status === 'Released' ? 'success' : 'error' }, ...prev]);
    fetchAll();
  };

  const changePassword = async () => {
    setPassMsg('');
    if (!passForm.old_password || !passForm.new_password || !passForm.confirm_password) {
      setPassMsg({ text: 'Please fill in all fields', type: 'error' }); return;
    }
    if (passForm.new_password !== passForm.confirm_password) {
      setPassMsg({ text: 'New passwords do not match', type: 'error' }); return;
    }
    if (passForm.new_password.length < 6) {
      setPassMsg({ text: 'Password must be at least 6 characters', type: 'error' }); return;
    }
    try {
      await axios.post(`${API}/users/change-password`, {
        user_id: user.user_id,
        old_password: passForm.old_password,
        new_password: passForm.new_password
      });
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setPassForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Error changing password', type: 'error' });
    }
  };

  const myContracts = contracts.filter(c => c.client_name === user.name);
  const pendingEscrows = escrows.filter(e => e.escrow_status !== 'Released' && e.escrow_status !== 'Refunded');

  const tabs = [
    { id: 'projects', label: 'Projects', icon: '▦' },
    { id: 'post', label: 'Post Project', icon: '+' },
    { id: 'contracts', label: 'Contracts', icon: '◈' },
    { id: 'escrow', label: 'Payments', icon: '$' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  const Badge = ({ status }) => {
    const map = {
      'Pending': '#f59e0b', 'Funded': '#10b981', 'Released': '#3b82f6',
      'Refunded': '#ef4444', 'Signed': '#10b981', 'Open': '#ef4444'
    };
    const color = map[status] || '#6b7280';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
        background: `${color}18`, color, border: `1px solid ${color}30`
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        {status}
      </span>
    );
  };

  const inputStyle = {
    width: '100%', padding: '10px 40px 10px 14px', background: '#161622',
    border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white',
    fontSize: '0.9rem', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: 'white' }}>

      {/* Sidebar */}
      <div style={{
        width: '240px', background: '#0d0d14', borderRight: '1px solid #1e1e2e',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
            }}>🚀</div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>FreelancePlatform</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#161622', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
            }}>{user.name[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: '500' }}>Customer</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: '8px' }}>Menu</div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#161622' : 'transparent',
              color: tab === t.id ? 'white' : '#6b7280',
              fontSize: '0.875rem', fontWeight: tab === t.id ? '600' : '400',
              marginBottom: '2px', textAlign: 'left', transition: 'all 0.15s',
              borderLeft: tab === t.id ? '2px solid #7c3aed' : '2px solid transparent'
            }}>
              <span style={{ fontSize: '0.8rem', color: tab === t.id ? '#7c3aed' : '#4b5563' }}>{t.icon}</span>
              {t.label}
              {t.id === 'escrow' && pendingEscrows.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#7c3aed', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: '700' }}>{pendingEscrows.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e1e2e' }}>
          <button onClick={logout} style={{
            width: '100%', padding: '9px 12px', background: 'transparent',
            color: '#6b7280', border: '1px solid #1e1e2e', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>↩</span> Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <div style={{
          padding: '16px 32px', borderBottom: '1px solid #1e1e2e',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#0a0a0f', position: 'sticky', top: 0, zIndex: 40
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
              {tabs.find(t => t.id === tab)?.label || 'Dashboard'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotif(!showNotif)} style={{
              background: '#161622', border: '1px solid #1e1e2e', borderRadius: '10px',
              padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: '1rem', position: 'relative'
            }}>
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#7c3aed', color: 'white', borderRadius: '50%',
                  width: '16px', height: '16px', fontSize: '0.65rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                }}>{notifications.length}</span>
              )}
            </button>
            {showNotif && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', width: '320px',
                background: '#0d0d14', border: '1px solid #1e1e2e',
                borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 999
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</span>
                  <span onClick={() => { setNotifications([]); setShowNotif(false); }} style={{ color: '#7c3aed', fontSize: '0.8rem', cursor: 'pointer' }}>Clear all</span>
                </div>
                {notifications.length === 0
                  ? <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem' }}>All caught up! 🎉</div>
                  : notifications.map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e2e', display: 'flex', gap: '10px' }}>
                      <span>{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : '⚠️'}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{n.msg}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '32px', flex: 1 }}>

          {/* Stats Row */}
          {tab === 'projects' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Projects', value: projects.length, icon: '▦', color: '#7c3aed' },
                { label: 'Active Contracts', value: myContracts.length, icon: '◈', color: '#10b981' },
                { label: 'Pending Payments', value: pendingEscrows.length, icon: '$', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px',
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: `${s.color}18`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.1rem', color: s.color, fontWeight: '700'
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '4px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Projects */}
          {tab === 'projects' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>All Projects</span>
                <button onClick={() => setTab('post')} style={{
                  padding: '7px 14px', background: '#7c3aed', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                }}>+ New Project</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0a0a0f' }}>
                    {['Project', 'Budget', 'Deadline', 'Client', 'Category', ''].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '0.72rem', color: '#4b5563', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0
                    ? <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No projects yet</td></tr>
                    : projects.map(p => (
                      <tr key={p.project_id} style={{ borderTop: '1px solid #1e1e2e' }}>
                        <td style={{ padding: '14px 24px', fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>{p.title}</td>
                        <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>${parseFloat(p.budget).toLocaleString()}</td>
                        <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#6b7280' }}>{p.deadline?.slice(0, 10)}</td>
                        <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: '#9ca3af' }}>{p.client}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', background: '#7c3aed18', color: '#7c3aed', border: '1px solid #7c3aed30' }}>{p.category_name}</span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          {p.client === user.name && (
                            <button onClick={() => viewBids(p)} style={{
                              padding: '6px 14px', background: 'transparent', color: '#7c3aed',
                              border: '1px solid #7c3aed40', borderRadius: '7px', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: '600'
                            }}>View Bids →</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* View Bids */}
          {tab === 'bids' && selectedProject && (
            <div>
              <button onClick={() => setTab('projects')} style={{
                background: 'transparent', border: 'none', color: '#7c3aed',
                cursor: 'pointer', fontSize: '0.875rem', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', padding: 0
              }}>← Back to Projects</button>
              <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Bids for: {selectedProject.title}</div>
                  <div style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '4px' }}>{bids.length} bid{bids.length !== 1 ? 's' : ''} received</div>
                </div>
                {bids.length === 0
                  ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No bids yet</div>
                  : bids.map(b => (
                    <div key={b.bid_id} style={{
                      padding: '20px 24px', borderTop: '1px solid #1e1e2e',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', fontSize: '0.95rem', flexShrink: 0
                        }}>{b.freelancer_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{b.freelancer_name}</div>
                          <div style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '2px' }}>⭐ {b.reputation_score ?? 'N/A'} reputation</div>
                          <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '4px' }}>{b.proposal}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>${b.amount}</div>
                        <button onClick={() => acceptBid(b)} style={{
                          marginTop: '8px', padding: '7px 16px', background: '#10b981',
                          color: 'white', border: 'none', borderRadius: '8px',
                          cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem'
                        }}>Accept Bid</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Post Project */}
          {tab === 'post' && (
            <div style={{ maxWidth: '560px' }}>
              <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '28px' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '24px' }}>Post a New Project</div>
                {[
                  { label: 'Project Title *', key: 'title', type: 'text', placeholder: 'e.g. Build a React Dashboard' },
                  { label: 'Budget ($) *', key: 'budget', type: 'number', placeholder: 'e.g. 1500' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                  <textarea placeholder="Describe your project requirements..." value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline *</label>
                  <input type="date" value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                    {[['1', 'Web Design'], ['2', 'Mobile App'], ['3', 'Graphic Design'], ['4', 'Data Science'], ['5', 'Content Writing']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <button onClick={postProject} disabled={loading} style={{
                  width: '100%', padding: '12px', background: loading ? '#4b5563' : '#7c3aed',
                  color: 'white', border: 'none', borderRadius: '9px',
                  fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer'
                }}>{loading ? 'Posting...' : 'Post Project'}</button>
              </div>
            </div>
          )}

          {/* My Contracts */}
          {tab === 'contracts' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>My Contracts</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0a0a0f' }}>
                    {['Project', 'Freelancer', 'Status', 'Escrow', 'Payment'].map(h => (
                      <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '0.72rem', color: '#4b5563', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myContracts.length === 0
                    ? <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No contracts yet</td></tr>
                    : myContracts.map((c, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #1e1e2e' }}>
                        <td style={{ padding: '14px 24px', fontWeight: '600', fontSize: '0.875rem' }}>{c.project_title}</td>
                        <td style={{ padding: '14px 24px', color: '#9ca3af', fontSize: '0.875rem' }}>{c.freelancer_assigned}</td>
                        <td style={{ padding: '14px 24px' }}><Badge status={c.contract_status} /></td>
                        <td style={{ padding: '14px 24px', color: '#10b981', fontWeight: '600', fontSize: '0.875rem' }}>${c.escrow_amount ?? 'N/A'}</td>
                        <td style={{ padding: '14px 24px' }}><Badge status={c.payment_status} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Escrow & Payments */}
          {tab === 'escrow' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Escrow & Payments</div>
                <div style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '4px' }}>{pendingEscrows.length} pending payment{pendingEscrows.length !== 1 ? 's' : ''}</div>
              </div>
              {pendingEscrows.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No pending payments 🎉</div>
                : pendingEscrows.map((e, i) => (
                  <div key={i} style={{ padding: '20px 24px', borderTop: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{e.project_title}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '3px' }}>Freelancer: {e.freelancer_name}</div>
                      <div style={{ marginTop: '6px' }}><Badge status={e.escrow_status} /></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginBottom: '10px' }}>${e.amount}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateEscrow(e.escrow_id, 'Released')} style={{
                          padding: '7px 16px', background: '#10b981', color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem'
                        }}>Release</button>
                        <button onClick={() => updateEscrow(e.escrow_id, 'Refunded')} style={{
                          padding: '7px 16px', background: 'transparent', color: '#ef4444',
                          border: '1px solid #ef444440', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem'
                        }}>Refund</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Settings */}
          {tab === 'settings' && (
            <div style={{ maxWidth: '480px' }}>
              <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '28px' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '8px' }}>Change Password</div>
                <div style={{ color: '#4b5563', fontSize: '0.82rem', marginBottom: '24px' }}>
                  Make sure your new password is at least 6 characters long.
                </div>

                {[
                  { label: 'Current Password', key: 'old_password', show: showOld, toggle: () => setShowOld(!showOld) },
                  { label: 'New Password', key: 'new_password', show: showNew, toggle: () => setShowNew(!showNew) },
                  { label: 'Confirm New Password', key: 'confirm_password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={f.show ? 'text' : 'password'}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        value={passForm[f.key]}
                        onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                        style={inputStyle}
                      />
                      <button onClick={f.toggle} style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: '1rem'
                      }}>{f.show ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                ))}

                {passMsg && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                    background: passMsg.type === 'success' ? '#10b98118' : '#ef444418',
                    color: passMsg.type === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${passMsg.type === 'success' ? '#10b98130' : '#ef444430'}`
                  }}>
                    {passMsg.type === 'success' ? '✅' : '⚠️'} {passMsg.text}
                  </div>
                )}

                <button onClick={changePassword} style={{
                  width: '100%', padding: '12px', background: '#7c3aed',
                  color: 'white', border: 'none', borderRadius: '9px',
                  fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
                }}>Update Password</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}