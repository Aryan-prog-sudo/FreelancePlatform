import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ArtistDashboard from './pages/ArtistDashboard';

function ProtectedRoute({ element, roleId }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/" />;
  if (user.role_id != roleId) return <Navigate to="/" />;
  return element;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/customer"   element={<ProtectedRoute element={<CustomerDashboard />}   roleId={1} />} />
        <Route path="/freelancer" element={<ProtectedRoute element={<FreelancerDashboard />} roleId={2} />} />
        <Route path="/artist"     element={<ProtectedRoute element={<ArtistDashboard />}     roleId={3} />} />
      </Routes>
    </BrowserRouter>
  );
}