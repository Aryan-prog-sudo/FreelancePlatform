import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tab, setTab] = useState('projects');
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', project_id: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [p, b, c] = await Promise.all([
      axios.get(`${API}/projects`),
      axios.get(`${API}/bids`),
      axios.get(`${API}/contracts`)
    ]);
    setProjects(p.data);
    setBids(b.data);
    setContracts(c.data);
    const notifs = [];
    c.data.filter(x => x.freelancer_assigned === user.name).forEach(c => {
      if (c.contract_status === 'Signed') notifs.push({ msg: `New contract signed for "${c.project_title}"`, type: 'success' });
      if (c.payment_status === 'Released') notifs.push({ msg: `Payment released for "${c.project_title}"!`, type: 'success' });
      if (c.payment_status === 'Refunded') notifs.push({ msg: `Payment refunded for "${c.project_title}"`, type: 'error' });
    });
    setNotifications(notifs);
  };

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const submitBid = async () => {
    if (!bidForm.project_id || !bidForm.amount || !bidForm.proposal) { alert('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/bids`, { ...bidForm, freelancer_id: user.user_id });
      setNotifications(prev => [{ msg: 'Bid submitted successfully!', type: 'success' }, ...prev]);
      setBidForm({ amount: '', proposal: '', project_id: '' });
      fetchAll();
      setTab('mybids');
    } catch (err) {
      alert('Error submitting bid');
    } finally { setLoading(false); }
  };

  const myBids = bids.filter(b => b.freelancer === user.name);
  const myContracts = contracts.filter(c => c.freelancer_assigned === user.name);

  const tabs = [
    { id: 'projects', label: 'Browse Projects', icon: '▦' },
    { id: 'bid', label: 'Submit Bid', icon: '+' },
    { id: 'mybids', label: 'My Bids', icon: '◈' },
    { id: 'contracts', label: 'My Contracts', icon: '📄' },
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
              width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
            }}>🚀</div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>FreelancePlatform</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#161622', borderRadius: '10px', padding: '10px 12px'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
            }}>{user.name[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '500' }}>Freelancer</div>
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
              borderLeft: tab === t.id ? '2px solid #10b981' : '2px solid transparent'
            }}>
              <span style={{ fontSize: '0.8rem', color: tab === t.id ? '#10b981' : '#4b5563' }}>{t.icon}</span>
              {t.label}
              {t.id === 'mybids' && myBids.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#10b981', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: '700' }}>{myBids.length}</span>
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
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{tabs.find(t => t.id === tab)?.label}</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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
                  background: '#10b981', color: 'white', borderRadius: '50%',
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
                  <span onClick={() => { setNotifications([]); setShowNotif(false); }} style={{ color: '#10b981', fontSize: '0.8rem', cursor: 'pointer' }}>Clear all</span>
                </div>
                {notifications.length === 0
                  ? <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem' }}>All caught up! 🎉</div>
                  : notifications.map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e2e', display: 'flex', gap: '10px' }}>
                      <span>{n.type === 'success' ? '✅' : '❌'}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{n.msg}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '32px', flex: 1 }}>

          {/* Stats */}
          {tab === 'projects' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Available Projects', value: projects.length, color: '#10b981' },
                { label: 'My Bids', value: myBids.length, color: '#7c3aed' },
                { label: 'Active Contracts', value: myContracts.length, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px 24px' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Browse Projects */}
          {tab === 'projects' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Available Projects</span>
                <button onClick={() => setTab('bid')} style={{
                  padding: '7px 14px', background: '#10b981', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                }}>+ Submit Bid</button>
              </div>
              {projects.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No projects available</div>
                : projects.map(p => (
                  <div key={p.project_id} style={{ padding: '20px 24px', borderTop: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{p.title}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '8px' }}>By {p.client} · Due {p.deadline?.slice(0, 10)}</div>
                      <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', background: '#10b98118', color: '#10b981', border: '1px solid #10b98130' }}>{p.category_name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>${parseFloat(p.budget).toLocaleString()}</div>
                      <button onClick={() => { setBidForm({ ...bidForm, project_id: String(p.project_id) }); setTab('bid'); }} style={{
                        padding: '6px 16px', background: 'transparent', color: '#10b981',
                        border: '1px solid #10b98140', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                      }}>Bid Now →</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Submit Bid */}
          {tab === 'bid' && (
            <div style={{ maxWidth: '560px' }}>
              <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '28px' }}>
                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '24px' }}>Submit a Bid</div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Project *</label>
                  <select value={bidForm.project_id} onChange={e => setBidForm({ ...bidForm, project_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                    <option value="">-- Choose a project --</option>
                    {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.title} (Budget: ${p.budget})</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Bid Amount ($) *</label>
                  <input type="number" placeholder="e.g. 950" value={bidForm.amount}
                    onChange={e => setBidForm({ ...bidForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposal *</label>
                  <textarea placeholder="Describe why you're the best fit for this project..." value={bidForm.proposal}
                    onChange={e => setBidForm({ ...bidForm, proposal: e.target.value })}
                    rows={4} style={{ width: '100%', padding: '10px 14px', background: '#161622', border: '1px solid #1e1e2e', borderRadius: '8px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <button onClick={submitBid} disabled={loading} style={{
                  width: '100%', padding: '12px', background: loading ? '#4b5563' : '#10b981',
                  color: 'white', border: 'none', borderRadius: '9px',
                  fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer'
                }}>{loading ? 'Submitting...' : 'Submit Bid'}</button>
              </div>
            </div>
          )}

          {/* My Bids */}
          {tab === 'mybids' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>My Bids</span>
              </div>
              {myBids.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No bids submitted yet</div>
                : myBids.map((b, i) => (
                  <div key={i} style={{ padding: '20px 24px', borderTop: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{b.project}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{b.proposal}</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>${b.amount}</div>
                  </div>
                ))}
            </div>
          )}

          {/* My Contracts */}
          {tab === 'contracts' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>My Contracts</span>
              </div>
              {myContracts.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No contracts yet</div>
                : myContracts.map((c, i) => (
                  <div key={i} style={{ padding: '20px 24px', borderTop: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{c.project_title}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '8px' }}>Client: {c.client_name}</div>
                      <Badge status={c.contract_status} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>${c.escrow_amount ?? 'N/A'}</div>
                      <Badge status={c.payment_status} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}