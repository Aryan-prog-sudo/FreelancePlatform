import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/projects').then(res => setProjects(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>All Projects</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#1a1a2e', color: 'white' }}>
          <tr><th>ID</th><th>Title</th><th>Budget</th><th>Deadline</th><th>Client</th><th>Category</th></tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.project_id}>
              <td>{p.project_id}</td>
              <td>{p.title}</td>
              <td>${p.budget}</td>
              <td>{p.deadline?.slice(0,10)}</td>
              <td>{p.client}</td>
              <td>{p.category_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}