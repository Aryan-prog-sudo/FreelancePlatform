import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tab, setTab] = useState('projects');
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', project_id: '' });

  useEffect(() => {
    axios.get('http://localhost:3001/api/projects').then(res => setProjects(res.data));
    axios.get('http://localhost:3001/api/bids').then(res => setBids(res.data));
    axios.get('http://localhost:3001/api/contracts').then(res => setContracts(res.data));
  }, []);

  const logout = () => { localStorage.removeItem('user'); navigate('/'); };

  const submitBid = async () => {
    const bid_id = Date.now() % 100000;
    await axios.post('http://localhost:3001/api/bids', {
      ...bidForm,
      bid_id,
      freelancer_id: user.user_id
    });
    alert('Bid submitted!');
    const res = await axios.get('http://localhost:3001/api/bids');
    setBids(res.data);
    setBidForm({ amount: '', proposal: '', project_id: '' });
  };

  const myBids = bids.filter(b => b.freelancer === user.name);
  const myContracts = contracts.filter(c => c.freelancer_assigned === user.name);

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
          <span style={{ color: 'white' }}>👤 {user.name} (Freelancer)</span>
          <button onClick={logout} style={{ padding: '6px 14px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <button style={navStyle(tab === 'projects')} onClick={() => setTab('projects')}>Browse Projects</button>
          <button style={navStyle(tab === 'bid')} onClick={() => setTab('bid')}>Submit a Bid</button>
          <button style={navStyle(tab === 'mybids')} onClick={() => setTab('mybids')}>My Bids</button>
          <button style={navStyle(tab === 'contracts')} onClick={() => setTab('contracts')}>My Contracts</button>
        </div>

        {/* Browse Projects */}
        {tab === 'projects' && (
          <div>
            <h2>Available Projects</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>ID</th><th>Title</th><th>Budget</th><th>Deadline</th><th>Client</th><th>Category</th></tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.project_id}>
                    <td>{p.project_id}</td>
                    <td>{p.title}</td>
                    <td>${p.budget}</td>
                    <td>{p.deadline?.slice(0, 10)}</td>
                    <td>{p.client}</td>
                    <td>{p.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Bid */}
        {tab === 'bid' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px' }}>
            <h2>Submit a Bid</h2>
            <select
              value={bidForm.project_id}
              onChange={e => setBidForm({ ...bidForm, project_id: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <option value="">-- Select a Project --</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>{p.title} (Budget: ${p.budget})</option>
              ))}
            </select>
            <input
              placeholder="Your Bid Amount"
              value={bidForm.amount}
              onChange={e => setBidForm({ ...bidForm, amount: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Your Proposal"
              value={bidForm.proposal}
              onChange={e => setBidForm({ ...bidForm, proposal: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
            <button onClick={submitBid}
              style={{ width: '100%', padding: '12px', background: '#e94560', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Submit Bid
            </button>
          </div>
        )}

        {/* My Bids */}
        {tab === 'mybids' && (
          <div>
            <h2>My Bids</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Project</th><th>Amount</th><th>Proposal</th></tr>
              </thead>
              <tbody>
                {myBids.length === 0
                  ? <tr><td colSpan="3" style={{ textAlign: 'center' }}>No bids yet</td></tr>
                  : myBids.map((b, i) => (
                    <tr key={i}>
                      <td>{b.project}</td>
                      <td>${b.amount}</td>
                      <td>{b.proposal}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My Contracts */}
        {tab === 'contracts' && (
          <div>
            <h2>My Contracts</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
              <thead style={{ background: '#1a1a2e', color: 'white' }}>
                <tr><th>Project</th><th>Client</th><th>Status</th><th>Escrow</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {myContracts.length === 0
                  ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No contracts yet</td></tr>
                  : myContracts.map((c, i) => (
                    <tr key={i}>
                      <td>{c.project_title}</td>
                      <td>{c.client_name}</td>
                      <td>{c.contract_status}</td>
                      <td>${c.escrow_amount}</td>
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