import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { isSupabaseConfigured } from './lib/supabase';

// Pages
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import SetupGuide from './pages/SetupGuide';

import EditPost from './pages/EditPost';

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupGuide />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="edit/:id" element={<EditPost />} />
            <Route path="new" element={<CreatePost />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
