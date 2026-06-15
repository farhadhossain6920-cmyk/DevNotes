import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Code2, LogOut, Plus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

export function Layout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isSuperAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0 rounded-none bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
            <Code2 className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white">DevNotes</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/new">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Snippet</span>
                  </Button>
                </Link>
                <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>
                <div className="text-sm text-slate-300 hidden sm:block">
                  {profile?.display_name || user.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Log out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
