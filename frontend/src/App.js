import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ArtistDashboard from './pages/ArtistDashboard';

export default function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/customer"   element={user?.role_id == 1 ? <CustomerDashboard />   : <Navigate to="/" />} />
        <Route path="/freelancer" element={user?.role_id == 2 ? <FreelancerDashboard /> : <Navigate to="/" />} />
        <Route path="/artist"     element={user?.role_id == 3 ? <ArtistDashboard />     : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}