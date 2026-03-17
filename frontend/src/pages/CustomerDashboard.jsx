import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tab, setTab] = useState('projects');
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', category_id: '1' });

  useEffect(() => {
    axios.get('http://localhost:3001/api/projects').then(res => setProjects(res.data));
    axios.get('http://localhost:3001/api/contracts').then(res => setContracts(res.data));
  }, []);

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const postProject = async () => {
    const project_id = Date.now() % 100000;
    await axios.post('http://localhost:3001/api/projects', { ...form, project_id, customer_id: user.user_id });
    alert('Project posted!');
    const res = await axios.get('http://localhost:3001/api/projects');
    setProjects(res.data);
    setForm({ title: '', description: '', budget: '', deadline: '', category_id: '1' });
  };

  const myContracts = contracts.filter(c => c.client_name === user.name);

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
          <span style={{ color: 'white' }}>👤 {user.name} (Customer)</span>
          <button onClick={logout} style={{ padding: '6px 14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <button style={navStyle(tab === 'projects')} onClick={() => setTab('projects')}>All Projects</button>
          <button style={navStyle(tab === 'post')} onClick={() => setTab('post')}>Post a Project</button>
          <button style={navStyle(tab === 'contracts')} onClick={() => setTab('contracts')}>My Contracts</button>
        </div>

        {/* All Projects */}
        {tab === 'projects' && (
          <div>
            <h2>All Projects</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Title</th><th>Budget</th><th>Deadline</th><th>Client</th><th>Category</th></tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.project_id}>
                    <td>{p.title}</td><td>${p.budget}</td>
                    <td>{p.deadline?.slice(0, 10)}</td>
                    <td>{p.client}</td><td>{p.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Post Project */}
        {tab === 'post' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>Post a New Project</h2>
            {['title', 'description', 'budget', 'deadline'].map(field => (
              <div key={field} style={{ marginBottom: '10px' }}>
                <input
                  placeholder={field}
                  type={field === 'deadline' ? 'date' : 'text'}
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button onClick={postProject}
              style={{ width: '100%', padding: '12px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Post Project
            </button>
          </div>
        )}

        {/* My Contracts */}
        {tab === 'contracts' && (
          <div>
            <h2>My Contracts</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Project</th><th>Freelancer</th><th>Status</th><th>Escrow</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {myContracts.length === 0
                  ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No contracts yet</td></tr>
                  : myContracts.map((c, i) => (
                    <tr key={i}>
                      <td>{c.project_title}</td><td>{c.freelancer_assigned}</td>
                      <td>{c.contract_status}</td><td>${c.escrow_amount}</td>
                      <td>{c.payment_status}</td>
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