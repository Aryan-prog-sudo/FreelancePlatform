import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/contracts').then(res => setContracts(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Contract Dashboard</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#1a1a2e', color: 'white' }}>
          <tr><th>Project</th><th>Client</th><th>Freelancer</th><th>Status</th><th>Escrow</th><th>Payment</th></tr>
        </thead>
        <tbody>
          {contracts.map((c, i) => (
            <tr key={i}>
              <td>{c.project_title}</td>
              <td>{c.client_name}</td>
              <td>{c.freelancer_assigned}</td>
              <td>{c.contract_status}</td>
              <td>${c.escrow_amount}</td>
              <td>{c.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}