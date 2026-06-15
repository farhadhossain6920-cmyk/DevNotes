import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Profile, Post } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ShieldCheck, ShieldAlert, Trash2, Search } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function AdminDashboard() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetEmail, setTargetEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('admin');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [roleMessage, setRoleMessage] = useState({ type: '', text: '' });

  const isSuperAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
    if (isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch posts limit
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles:user_id (email, display_name)')
      .order('created_at', { ascending: false });
    
    if (postsData) setPosts(postsData as unknown as Post[]);

    // Fetch users (Super Admin only for managing roles)
    if (isSuperAdmin) {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersData) setUsers(usersData as Profile[]);
    }
    
    setIsLoading(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    
    setUpdatingRole(true);
    setRoleMessage({ type: '', text: '' });

    const targetUser = users.find(u => u.email === targetEmail);
    if (!targetUser) {
      setRoleMessage({ type: 'error', text: 'User not found.' });
      setUpdatingRole(false);
      return;
    }

    try {
      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: targetUser.id,
        new_role: newRole,
        super_admin_email: import.meta.env.VITE_SUPER_ADMIN_EMAIL
      });

      if (error) throw error;
      
      setRoleMessage({ type: 'success', text: `Role updated to ${newRole} for ${targetEmail}` });
      fetchData(); // Refresh list
    } catch (err: any) {
      setRoleMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingRole(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <ShieldAlert className="w-8 h-8 text-violet-400" />
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        {isSuperAdmin && <span className="ml-2 px-3 py-1 bg-violet-600/20 text-violet-300 text-xs rounded-full border border-violet-500/20">Super Admin</span>}
      </div>

      <div className="flex gap-4">
        <Button 
          variant={activeTab === 'posts' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('posts')}
        >
          Manage Posts
        </Button>
        {isSuperAdmin && (
          <Button 
            variant={activeTab === 'users' ? 'primary' : 'secondary'} 
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </Button>
        )}
      </div>

      {activeTab === 'posts' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-black/20 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{post.title}</td>
                    <td className="px-6 py-4">{post.profiles?.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-black/40 rounded text-xs font-mono">{post.language}</span>
                    </td>
                    <td className="px-6 py-4">{formatDate(post.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="danger" size="sm" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && isSuperAdmin && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Change Role</h2>
              <form onSubmit={handleUpdateRole} className="space-y-4">
                <Input
                  label="User Email"
                  placeholder="user@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">New Role</label>
                  <select 
                    className="flex h-10 w-full rounded-lg glass-input px-3 py-2 text-sm [&>option]:bg-[#1A1040] [&>option]:text-white"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {roleMessage.text && (
                  <div className={`text-sm p-3 rounded-lg border ${roleMessage.type === 'error' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-green-400 bg-green-400/10 border-green-400/20'}`}>
                    {roleMessage.text}
                  </div>
                )}

                <Button type="submit" className="w-full" isLoading={updatingRole}>
                  Update Role
                </Button>
              </form>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-black/10">
                <h2 className="font-semibold text-white">All Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-black/20 text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Display Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4">{u.display_name || '-'}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-600/20 text-violet-300' : 'bg-slate-500/20 text-slate-300'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
