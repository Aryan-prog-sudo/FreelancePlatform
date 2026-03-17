import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Artists() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/artists').then(res => setArtists(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Artists</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
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
                <td>{a.bio}</td>
                <td>{a.reputation_score}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}