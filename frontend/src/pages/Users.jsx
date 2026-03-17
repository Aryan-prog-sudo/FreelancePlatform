import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ user_id: '', name: '', email: '', password: '', phone: '', role_id: '' });

  useEffect(() => {
    axios.get('http://localhost:3001/api/users').then(res => setUsers(res.data));
  }, []);

  const submit = async () => {
    await axios.post('http://localhost:3001/api/users', form);
    alert('User created!');
    const res = await axios.get('http://localhost:3001/api/users');
    setUsers(res.data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>All Users</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#1a1a2e', color: 'white' }}>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>Add a New User</h3>
      {['user_id', 'name', 'email', 'password', 'phone', 'role_id'].map(field => (
        <div key={field} style={{ marginBottom: '6px' }}>
          <input
            placeholder={field}
            value={form[field]}
            type={field === 'password' ? 'password' : 'text'}
            onChange={e => setForm({ ...form, [field]: e.target.value })}
            style={{ padding: '6px', width: '300px' }}
          />
        </div>
      ))}
      <button onClick={submit} style={{ marginTop: '8px', padding: '8px 20px', background: '#1a1a2e', color: 'white', border: 'none', cursor: 'pointer' }}>
        Add User
      </button>
    </div>
  );
}