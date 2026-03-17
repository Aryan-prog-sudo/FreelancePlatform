import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role_id: '' });
  const [error, setError] = useState('');

  const roleRoutes = { 1: '/customer', 2: '/freelancer', 3: '/artist' };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');

    // Validation
    if (!form.role_id) {
      setError('Please select your role: Customer, Freelancer or Artist');
      return;
    }
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    if (isSignup && !form.name) {
      setError('Please enter your full name');
      return;
    }

    try {
      if (isSignup) {
        const user_id = Math.floor(Math.random() * 900000) + 100000;
        await axios.post('http://localhost:3001/api/users/signup', { ...form, user_id });
        alert('Account created! Please log in.');
        setIsSignup(false);
        setForm({ name: '', email: '', password: '', phone: '', role_id: form.role_id });
      } else {
        const res = await axios.post('http://localhost:3001/api/users/login', {
          email: form.email,
          password: form.password,
          role_id: form.role_id
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate(roleRoutes[res.data.role_id]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or wrong role selected');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <h2 style={{ textAlign: 'center', marginBottom: '0.3rem', color: '#1a1a2e' }}>
          FreelancePlatform
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
          {isSignup ? 'Create your account' : 'Welcome back! Please login'}
        </p>

        {/* Role Selector */}
        <p style={{ fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
          I am a: {!form.role_id && <span style={{ color: 'red', fontSize: '0.8rem' }}>(required)</span>}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[{ id: 1, label: '🛒 Customer' }, { id: 2, label: '💻 Freelancer' }, { id: 3, label: '🎨 Artist' }].map(r => (
            <button
              key={r.id}
              onClick={() => setForm({ ...form, role_id: String(r.id) })}
              style={{
                flex: 1, padding: '10px 6px', border: '2px solid',
                borderColor: form.role_id == r.id ? '#e94560' : '#ddd',
                background: form.role_id == r.id ? '#e94560' : 'white',
                color: form.role_id == r.id ? 'white' : '#333',
                borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                fontSize: '0.8rem'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Selected role confirmation */}
        {form.role_id && (
          <p style={{ textAlign: 'center', color: '#e94560', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
            ✓ Logging in as {form.role_id == 1 ? 'Customer' : form.role_id == 2 ? 'Freelancer' : 'Artist'}
          </p>
        )}

        {/* Signup extra fields */}
        {isSignup && (
          <>
            <input
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handle}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={handle}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </>
        )}

        <input
          name="email"
          placeholder="Email *"
          value={form.email}
          onChange={handle}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <input
          name="password"
          placeholder="Password *"
          type="password"
          value={form.password}
          onChange={handle}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />

        {/* Error message */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
            <p style={{ color: 'red', fontSize: '0.85rem', margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <button
          onClick={submit}
          style={{ width: '100%', padding: '12px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          {isSignup ? 'Create Account' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#e94560', cursor: 'pointer', fontWeight: 'bold', marginLeft: '6px' }}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}