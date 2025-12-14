// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// RENAMED from ProtectedRoute to ProtectedRoute for consistency
import ProtectedRoute from './components/ProtectedRoute'; 
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword.jsx';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageUsers from './pages/admin/ManageUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import Reports from './pages/admin/AdminReports'; // Assuming Reports is in AdminReports.jsx
import CreateEvent from "./pages/admin/CreateEvent";
import CreateAnnouncement from './pages/admin/CreateAnnouncement';
// Student Components
import StudentCheckIn from './components/StudentCheckIn'; // Component for check-in form
import Dashboard from './pages/student/Dashboard'; 
import Events from './pages/student/Events'; 
import Notifications from './pages/student/Notifications'; 
import Profile from './pages/student/Profile'; 

// Placeholder Pages
const About = () => <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>About Us Page</h2>;
const Contact = () => <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Contact Page</h2>;
const Blog = () => <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Blog Page</h2>;
const NotFound = () => <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'red' }}>404 - Page Not Found</h2>;

function App() {
  return (
    <Routes>
      
      {/* 1. Visitor Routes (Uses standard Layout) */}
      <Route path="/" element={<Layout> <Home /> </Layout>} />
      <Route path="/about" element={<Layout> <About /> </Layout>} />
      <Route path="/contact" element={<Layout> <Contact /> </Layout>} />
      <Route path="/blog" element={<Layout> <Blog /> </Layout>} />
      
      {/* 2. Public Auth Routes (Full screen, no Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* 3. Student Protected Routes (Uses ProtectedRoute + Layout) */}
      {/* All student routes are nested under a single check */}
      <Route element={<ProtectedRoute allowedRole='student' />}>
        <Route element={<Layout />}>
          {/* Note: /dashboard is defined here once */}
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/events" element={<Events />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* NEW: Check-in Route */}
          <Route path="/checkin" element={<StudentCheckIn />} /> 
        </Route>
      </Route>

      {/* 4. Admin Protected Routes (Uses ProtectedRoute + Layout) */}
      <Route element={<ProtectedRoute allowedRole='admin' />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/events/create" element={<CreateEvent />} />
          <Route path="/admin/announcements/create" element={<CreateAnnouncement />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/reports" element={<Reports />} />
        
        </Route>
      </Route>
      
      {/* 5. Catch All */}
      <Route path="*" element={<Layout> <NotFound /> </Layout>} />
    </Routes>
  );
}

export default App;