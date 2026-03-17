import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [artists, setArtists] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    axios.get('http://localhost:3001/api/artists').then(res => setArtists(res.data));
    axios.get('http://localhost:3001/api/artists/portfolios').then(res => setPortfolios(res.data));
  }, []);

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const myProfile = artists.find(a => a.name === user.name);

  const navStyle = active => ({
    padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
    background: active ? '#e94560' : '#f0f0f0', color: active ? 'white' : '#333',
    borderRadius: '6px'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.2rem' }}>FreelancePlatform</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'white' }}>👤 {user.name} (Artist)</span>
          <button onClick={logout} style={{ padding: '6px 14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <button style={navStyle(tab === 'profile')} onClick={() => setTab('profile')}>My Profile</button>
          <button style={navStyle(tab === 'portfolio')} onClick={() => setTab('portfolio')}>Portfolios</button>
          <button style={navStyle(tab === 'artists')} onClick={() => setTab('artists')}>All Artists</button>
        </div>

        {/* My Profile */}
        {tab === 'profile' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>My Profile</h2>
            {myProfile ? (
              <div>
                <p><strong>Name:</strong> {myProfile.name}</p>
                <p><strong>Email:</strong> {myProfile.email}</p>
                <p><strong>Bio:</strong> {myProfile.bio || 'No bio yet'}</p>
                <p><strong>Reputation Score:</strong> {myProfile.reputation_score ?? 'N/A'}</p>
              </div>
            ) : (
              <p style={{ color: '#666' }}>Profile info will appear here once set up.</p>
            )}
          </div>
        )}

        {/* Portfolios */}
        {tab === 'portfolio' && (
          <div>
            <h2>Artist Portfolios</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Artist</th><th>Portfolio Description</th></tr>
              </thead>
              <tbody>
                {portfolios.length === 0
                  ? <tr><td colSpan="2" style={{ textAlign: 'center' }}>No portfolios yet</td></tr>
                  : portfolios.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.portfolio_description}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* All Artists */}
        {tab === 'artists' && (
          <div>
            <h2>All Artists</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Name</th><th>Email</th><th>Bio</th><th>Reputation</th></tr>
              </thead>
              <tbody>
                {artists.length === 0
                  ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>No artists yet</td></tr>
                  : artists.map((a, i) => (
                    <tr key={i}>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.bio || 'N/A'}</td>
                      <td>{a.reputation_score ?? 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}