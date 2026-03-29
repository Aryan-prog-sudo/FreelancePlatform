import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [artists, setArtists] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [tab, setTab] = useState('profile');
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passMsg, setPassMsg] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [a, p] = await Promise.all([
      axios.get(`${API}/artists`),
      axios.get(`${API}/artists/portfolios`)
    ]);
    setArtists(a.data);
    setPortfolios(p.data);
  };

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const myProfile = artists.find(a => a.name === user.name);

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

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'portfolio', label: 'Portfolios', icon: '🎨' },
    { id: 'artists', label: 'All Artists', icon: '✦' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

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
              width: '32px', height: '32px', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
            }}>🚀</div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>FreelancePlatform</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#161622', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
            }}>{user.name[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '500' }}>Artist</div>
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
              borderLeft: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent'
            }}>
              <span style={{ fontSize: '0.9rem', color: tab === t.id ? '#f59e0b' : '#4b5563' }}>{t.icon}</span>
              {t.label}
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
                  background: '#f59e0b', color: 'white', borderRadius: '50%',
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
                  <span onClick={() => { setNotifications([]); setShowNotif(false); }} style={{ color: '#f59e0b', fontSize: '0.8rem', cursor: 'pointer' }}>Clear all</span>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563', fontSize: '0.85rem' }}>All caught up! 🎉</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '32px', flex: 1 }}>

          {/* My Profile */}
          {tab === 'profile' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{
                  height: '100px',
                  background: 'linear-gradient(135deg, #f59e0b22, #d9770622, #0a0a0f)',
                  borderBottom: '1px solid #1e1e2e', position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', bottom: '-30px', left: '24px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', fontSize: '1.5rem', border: '3px solid #0d0d14'
                  }}>{user.name[0]}</div>
                </div>
                <div style={{ padding: '40px 24px 24px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>{user.name}</div>
                  <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>🎨 Artist</div>
                  {myProfile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {[
                        { label: 'Email', value: myProfile.email || user.email },
                        { label: 'Reputation', value: myProfile.reputation_score ? `⭐ ${myProfile.reputation_score}` : 'N/A' },
                        { label: 'Bio', value: myProfile.bio || 'No bio added yet' },
                      ].map((f, i) => (
                        <div key={i} style={{
                          background: '#161622', borderRadius: '10px', padding: '14px 16px',
                          gridColumn: f.label === 'Bio' ? 'span 2' : 'span 1'
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.label}</div>
                          <div style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>Profile info loading...</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Artists', value: artists.length, color: '#f59e0b' },
                  { label: 'Portfolios', value: portfolios.length, color: '#10b981' },
                  { label: 'Reputation', value: myProfile?.reputation_score ?? 'N/A', color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px 20px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolios */}
          {tab === 'portfolio' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Artist Portfolios</span>
              </div>
              {portfolios.length === 0
                ? <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎨</div>
                  <div style={{ color: '#4b5563', fontSize: '0.9rem' }}>No portfolios yet</div>
                </div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '24px' }}>
                  {portfolios.map((p, i) => (
                    <div key={i} style={{ background: '#161622', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '14px' }}>🎨</div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '6px' }}>{p.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: '1.5' }}>{p.portfolio_description}</div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* All Artists */}
          {tab === 'artists' && (
            <div style={{ background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e1e2e' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>All Artists</span>
                <span style={{ marginLeft: '10px', background: '#f59e0b18', color: '#f59e0b', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>{artists.length} total</span>
              </div>
              {artists.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center', color: '#4b5563' }}>No artists yet</div>
                : artists.map((a, i) => (
                  <div key={i} style={{ padding: '18px 24px', borderTop: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.95rem', flexShrink: 0 }}>{a.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>{a.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{a.email}</div>
                      {a.bio && <div style={{ color: '#4b5563', fontSize: '0.78rem', marginTop: '4px' }}>{a.bio}</div>}
                    </div>
                    {a.reputation_score && (
                      <span style={{ background: '#f59e0b18', color: '#f59e0b', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>⭐ {a.reputation_score}</span>
                    )}
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
                  width: '100%', padding: '12px', background: '#f59e0b',
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