import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, Post, Profile } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserCircle, Trash2, Edit, FileCode2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>('profile');
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
    
    if (activeTab === 'posts' && posts.length === 0) {
      fetchMyPosts();
    }
  }, [user, profile, activeTab, navigate]);

  const fetchMyPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles(display_name, email)`)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdatingProfile(true);
    setProfileMessage({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);
        
      if (error) throw error;
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setProfileMessage({ text: err.message, type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="glass p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-violet-600/20 text-violet-400 rounded-full flex items-center justify-center">
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {profile?.display_name || 'Anonymous Developer'}
            </h1>
            <p className="text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10">
          <button 
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'profile' ? 'bg-white/5 text-white border-b-2 border-violet-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'posts' ? 'bg-white/5 text-white border-b-2 border-violet-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('posts')}
          >
            My Snippets
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          {activeTab === 'profile' ? (
            <div className="max-w-md">
              <h2 className="text-xl font-semibold text-white mb-6">Update Profile</h2>
              {profileMessage.text && (
                 <div className={`mb-6 p-4 rounded-lg border text-sm ${
                   profileMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                 }`}>
                   {profileMessage.text}
                 </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email (Read Only)</label>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed">
                    {user.email}
                  </div>
                </div>
                <Input 
                  label="Display Name" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Enter your display name"
                />
                <Button type="submit" isLoading={isUpdatingProfile}>
                  Save Changes
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">My Snippets</h2>
                <Link to="/new">
                  <Button size="sm">Create New</Button>
                </Link>
              </div>
              
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
                  <FileCode2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">You haven't created any snippets yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="p-4 border border-white/10 rounded-xl bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex flex-col">
                        <Link to={`/post/${post.id}`} className="text-lg font-medium text-white hover:text-violet-400 transition-colors">
                          {post.title}
                        </Link>
                        <span className="text-sm text-slate-400 flex items-center gap-2">
                          <span className="text-violet-400">{post.language}</span>
                          &bull;
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/edit/${post.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:bg-white/10 hover:text-white"
                            title="Edit snippet"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete snippet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
