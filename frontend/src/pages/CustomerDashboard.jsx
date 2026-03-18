import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [p, c, e] = await Promise.all([
      axios.get('http://localhost:3001/api/projects'),
      axios.get('http://localhost:3001/api/contracts'),
      axios.get('http://localhost:3001/api/contracts/escrow')
    ]);
    setProjects(p.data);
    setContracts(c.data);
    setEscrows(e.data);
  };

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const postProject = async () => {
    if (!form.title || !form.budget || !form.deadline) {
      alert('Please fill in title, budget and deadline');
      return;
    }
    if (parseFloat(form.budget) <= 0) {
      alert('Budget must be greater than 0');
      return;
    }
    if (new Date(form.deadline) < new Date()) {
      alert('Deadline cannot be in the past');
      return;
    }
    try {
      const project_id = Math.floor(Math.random() * 900000) + 100000;
      await axios.post('http://localhost:3001/api/projects', {
        ...form, project_id, customer_id: user.user_id
      });
      alert('Project posted!');
      setForm({ title: '', description: '', budget: '', deadline: '', category_id: '1' });
      fetchAll();
      setTab('projects');
    } catch (err) {
      // Shows trigger error message if validation fails in database
      alert(err.response?.data?.message || 'Error posting project');
    }
  };

  const viewBids = async (project) => {
    setSelectedProject(project);
    const res = await axios.get(`http://localhost:3001/api/contracts/bids/${project.project_id}`);
    setBids(res.data);
    setTab('bids');
  };

  const acceptBid = async (bid) => {
    if (!window.confirm(`Accept bid from ${bid.freelancer_name} for $${bid.amount}?`)) return;
    try {
      await axios.post('http://localhost:3001/api/contracts/accept-bid', {
        project_id: selectedProject.project_id,
        freelancer_id: bid.freelancer_id
      });
      alert('✅ Bid accepted! Contract created and escrow funded automatically.');
      fetchAll();
      setTab('escrow');
    } catch (err) {
      alert('Error accepting bid');
    }
  };

  const updateEscrow = async (escrow_id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this escrow payment?`)) return;
    await axios.post('http://localhost:3001/api/contracts/escrow/update', { escrow_id, status });
    alert(`✅ Escrow ${status} successfully!`);
    fetchAll();
  };

  const myContracts = contracts.filter(c => c.client_name === user.name);
  const myEscrows = escrows.filter(e => 
    myContracts.some(c => c.project_title === e.project_title)
  );

  const navStyle = active => ({
    padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
    background: active ? '#e94560' : '#f0f0f0',
    color: active ? 'white' : '#333', borderRadius: '6px'
  });

  const tableHead = { background: '#1a1a2e', color: 'white' };
  const table = { borderCollapse: 'collapse', width: '100%', background: 'white' };

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
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button style={navStyle(tab === 'projects')}  onClick={() => setTab('projects')}>All Projects</button>
          <button style={navStyle(tab === 'post')}      onClick={() => setTab('post')}>Post a Project</button>
          <button style={navStyle(tab === 'contracts')} onClick={() => setTab('contracts')}>My Contracts</button>
          <button style={navStyle(tab === 'escrow')}    onClick={() => setTab('escrow')}>Escrow & Payments</button>
        </div>

        {/* All Projects */}
        {tab === 'projects' && (
          <div>
            <h2>All Projects</h2>
            <table border="1" cellPadding="8" style={table}>
              <thead style={tableHead}>
                <tr><th>Title</th><th>Budget</th><th>Deadline</th><th>Client</th><th>Category</th><th>Action</th></tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.project_id}>
                    <td>{p.title}</td>
                    <td>${p.budget}</td>
                    <td>{p.deadline?.slice(0, 10)}</td>
                    <td>{p.client}</td>
                    <td>{p.category_name}</td>
                    <td>
                      {p.client === user.name && (
                        <button
                          onClick={() => viewBids(p)}
                          style={{ padding: '6px 12px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          View Bids
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Bids for a Project */}
        {tab === 'bids' && selectedProject && (
          <div>
            <button onClick={() => setTab('projects')} style={{ marginBottom: '1rem', padding: '6px 12px', cursor: 'pointer' }}>← Back</button>
            <h2>Bids for: {selectedProject.title}</h2>
            {bids.length === 0 ? (
              <p>No bids yet for this project.</p>
            ) : (
              <table border="1" cellPadding="8" style={table}>
                <thead style={tableHead}>
                  <tr><th>Freelancer</th><th>Reputation</th><th>Bid Amount</th><th>Proposal</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {bids.map(b => (
                    <tr key={b.bid_id}>
                      <td>{b.freelancer_name}</td>
                      <td>⭐ {b.reputation_score ?? 'N/A'}</td>
                      <td>${b.amount}</td>
                      <td>{b.proposal}</td>
                      <td>
                        <button
                          onClick={() => acceptBid(b)}
                          style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          ✅ Accept
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Post Project */}
        {tab === 'post' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>Post a New Project</h2>
            <input placeholder="Title *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            <textarea placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            <input placeholder="Budget *" type="number" value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            <input placeholder="Deadline *" type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
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
            <table border="1" cellPadding="8" style={table}>
              <thead style={tableHead}>
                <tr><th>Project</th><th>Freelancer</th><th>Status</th><th>Escrow</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {myContracts.length === 0
                  ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No contracts yet</td></tr>
                  : myContracts.map((c, i) => (
                    <tr key={i}>
                      <td>{c.project_title}</td>
                      <td>{c.freelancer_assigned}</td>
                      <td>{c.contract_status}</td>
                      <td>${c.escrow_amount ?? 'N/A'}</td>
                      <td>{c.payment_status ?? 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Escrow & Payments */}
        {tab === 'escrow' && (
          <div>
            <h2>Escrow & Payments</h2>
            <table border="1" cellPadding="8" style={table}>
              <thead style={tableHead}>
                <tr><th>Project</th><th>Freelancer</th><th>Amount</th><th>Escrow Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {escrows.length === 0
                  ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No escrow payments yet</td></tr>
                  : escrows.filter(e => e.escrow_status !== 'Released' && e.escrow_status !== 'Refunded').map((e, i) => (
                    <tr key={i}>
                      <td>{e.project_title}</td>
                      <td>{e.freelancer_name}</td>
                      <td>${e.amount}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold',
                          background: e.escrow_status === 'Funded' ? '#d4edda' : e.escrow_status === 'Released' ? '#cce5ff' : e.escrow_status === 'Refunded' ? '#f8d7da' : '#fff3cd',
                          color: e.escrow_status === 'Funded' ? '#155724' : e.escrow_status === 'Released' ? '#004085' : e.escrow_status === 'Refunded' ? '#721c24' : '#856404'
                        }}>
                          {e.escrow_status}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        {e.escrow_status !== 'Released' && e.escrow_status !== 'Refunded' && (
                          <>
                            <button onClick={() => updateEscrow(e.escrow_id, 'Released')}
                              style={{ padding: '6px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              ✅ Release
                            </button>
                            <button onClick={() => updateEscrow(e.escrow_id, 'Refunded')}
                              style={{ padding: '6px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              🔄 Refund
                            </button>
                          </>
                        )}
                        {(e.escrow_status === 'Released' || e.escrow_status === 'Refunded') && (
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
              ✅ <strong>Release</strong> — pays the freelancer | 🔄 <strong>Refund</strong> — refunds you and auto-opens a dispute
            </p>
          </div>
        )}
      </div>
    </div>
  );
}