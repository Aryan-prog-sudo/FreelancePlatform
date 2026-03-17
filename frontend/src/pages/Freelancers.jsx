import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/freelancers/top').then(res => setFreelancers(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Top Freelancers</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#1a1a2e', color: 'white' }}>
          <tr><th>Name</th><th>Reputation</th><th>Bio</th></tr>
        </thead>
        <tbody>
          {freelancers.map((f, i) => (
            <tr key={i}>
              <td>{f.name}</td>
              <td>{f.reputation_score}</td>
              <td>{f.bio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}