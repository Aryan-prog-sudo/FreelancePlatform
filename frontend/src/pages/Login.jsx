import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role_id: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleRoutes = { 1: '/customer', 2: '/freelancer', 3: '/artist' };
  const roles = [
    { id: 1, label: 'Customer', icon: '🛒', desc: 'Post projects & hire' },
    { id: 2, label: 'Freelancer', icon: '💻', desc: 'Bid & get hired' },
    { id: 3, label: 'Artist', icon: '🎨', desc: 'Showcase your work' }
  ];

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.role_id) { setError('Please select your role first'); return; }
    if (!form.email || !form.password) { setError('Please enter email and password'); return; }
    if (isSignup && !form.name) { setError('Please enter your full name'); return; }

    setLoading(true);
    try {
      if (isSignup) {
        await axios.post('http://localhost:3001/api/users/signup', form);
        alert('Account created! Please log in.');
        setIsSignup(false);
        setForm({ ...form, name: '', password: '', phone: '' });
      } else {
        const res = await axios.post('http://localhost:3001/api/users/login', {
          email: form.email, password: form.password, role_id: form.role_id
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate(roleRoutes[res.data.role_id]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or wrong role selected');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', width: '100%', maxWidth: '440px',
        padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px', height: '60px', background: 'linear-gradient(135deg, #e94560, #c62a47)',
            borderRadius: '16px', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(233,69,96,0.4)'
          }}>🚀</div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.3rem' }}>
            FreelancePlatform
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>
            {isSignup ? 'Create your account' : 'Welcome back! Please login'}
          </p>
        </div>

        {/* Role Selector */}
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>
          I AM A {!form.role_id && <span style={{ color: '#e94560' }}>*</span>}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {roles.map(r => (
            <button key={r.id} onClick={() => setForm({ ...form, role_id: String(r.id) })}
              style={{
                flex: 1, padding: '12px 6px', border: '2px solid',
                borderColor: form.role_id == r.id ? '#e94560' : 'rgba(255,255,255,0.1)',
                background: form.role_id == r.id ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                color: form.role_id == r.id ? 'white' : 'rgba(255,255,255,0.6)',
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'center'
              }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{r.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>{r.label}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Selected role confirmation */}
        {form.role_id && (
          <div style={{
            background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
            borderRadius: '8px', padding: '8px 12px', marginBottom: '1rem',
            color: '#e94560', fontSize: '0.85rem', textAlign: 'center'
          }}>
            ✓ {isSignup ? 'Signing up' : 'Logging in'} as {roles.find(r => r.id == form.role_id)?.label}
          </div>
        )}

        {/* Signup extra fields */}
        {isSignup && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <input name="name" placeholder="Full Name *" value={form.name} onChange={handle}
                style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handle}
                style={inputStyle} />
            </div>
          </>
        )}

        {/* Email */}
        <div style={{ marginBottom: '12px' }}>
          <input name="email" placeholder="Email *" value={form.email} onChange={handle}
            style={inputStyle} />
        </div>

        {/* Password with show/hide */}
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <input
            name="password"
            placeholder="Password *"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handle}
            style={{ ...inputStyle, paddingRight: '45px' }}
          />
          <button onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', padding: '0'
            }}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem',
            color: '#e94560', fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button onClick={submit} disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(233,69,96,0.5)' : 'linear-gradient(135deg, #e94560, #c62a47)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(233,69,96,0.4)', transition: 'all 0.2s'
          }}>
          {loading ? '⏳ Please wait...' : isSignup ? 'Create Account' : 'Login'}
        </button>

        {/* Switch */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#e94560', cursor: 'pointer', fontWeight: '700', marginLeft: '6px' }}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.07)', color: 'white',
  fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.2s'
};