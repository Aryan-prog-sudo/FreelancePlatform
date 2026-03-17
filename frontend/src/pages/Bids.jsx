import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState({ bid_id: '', amount: '', proposal: '', project_id: '', freelancer_id: '' });

  useEffect(() => {
    axios.get('http://localhost:3001/api/bids').then(res => setBids(res.data));
  }, []);

  const submit = async () => {
    await axios.post('http://localhost:3001/api/bids', form);
    alert('Bid submitted!');
    const res = await axios.get('http://localhost:3001/api/bids');
    setBids(res.data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>All Bids</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#1a1a2e', color: 'white' }}>
          <tr><th>ID</th><th>Amount</th><th>Project</th><th>Freelancer</th><th>Proposal</th></tr>
        </thead>
        <tbody>
          {bids.map(b => (
            <tr key={b.bid_id}>
              <td>{b.bid_id}</td>
              <td>${b.amount}</td>
              <td>{b.project}</td>
              <td>{b.freelancer}</td>
              <td>{b.proposal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>Submit a New Bid</h3>
      {['bid_id', 'amount', 'proposal', 'project_id', 'freelancer_id'].map(field => (
        <div key={field} style={{ marginBottom: '6px' }}>
          <input
            placeholder={field}
            value={form[field]}
            onChange={e => setForm({ ...form, [field]: e.target.value })}
            style={{ padding: '6px', width: '300px' }}
          />
        </div>
      ))}
      <button onClick={submit} style={{ marginTop: '8px', padding: '8px 20px', background: '#1a1a2e', color: 'white', border: 'none', cursor: 'pointer' }}>
        Submit Bid
      </button>
    </div>
  );
}