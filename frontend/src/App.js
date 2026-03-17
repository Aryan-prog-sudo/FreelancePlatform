import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Projects from './pages/Projects';
import Bids from './pages/Bids';
import Contracts from './pages/Contracts';
import Freelancers from './pages/Freelancers';
import Artists from './pages/Artists';
import Users from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: '#1a1a2e', display: 'flex', gap: '1.5rem' }}>
        <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.2rem' }}>FreelancePlatform</span>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/">Projects</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/bids">Bids</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/contracts">Contracts</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/freelancers">Freelancers</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/artists">Artists</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to="/users">Users</Link>
      </nav>
      <Routes>
        <Route path="/"            element={<Projects />} />
        <Route path="/bids"        element={<Bids />} />
        <Route path="/contracts"   element={<Contracts />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/artists"     element={<Artists />} />
        <Route path="/users"       element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}