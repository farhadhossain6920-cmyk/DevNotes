import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Post } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import { Button } from '../components/Button';
import { Trash2, Copy, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:user_id (display_name, email)')
      .eq('id', id)
      .single();

    if (!error && data) {
      setPost(data as unknown as Post);
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (post) {
      navigator.clipboard.writeText(post.code_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    
    setIsDeleting(true);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    
    if (!error) {
      navigate('/');
    } else {
      alert('Failed to delete post.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 glass rounded-2xl max-w-2xl mx-auto">
        <p className="text-xl text-slate-300">Snippet not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === post.user_id;
  const isSuperAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;
  const canEditOrDelete = isAuthor || isAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="glass overflow-hidden rounded-2xl">
        {post.preview_image_url && (
          <div className="w-full h-64 md:h-96 bg-black/40 border-b border-white/10">
            <img 
              src={post.preview_image_url} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <div className="p-6 md:p-8 space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="font-medium text-slate-200">
                    {post.profiles?.display_name || post.profiles?.email || 'Unknown'}
                  </span>
                  <span>•</span>
                  <span>{formatDate(post.created_at)}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-600/20 text-violet-300 border border-violet-500/20 font-mono text-xs">
                    {post.language}
                  </span>
                </div>
              </div>
              
              {canEditOrDelete && (
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              )}
            </div>
            
            {post.description && (
              <p className="mt-6 text-slate-300 leading-relaxed">
                {post.description}
              </p>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0D0D12]">
            <div className="absolute top-0 left-0 right-0 h-12 bg-black/40 flex items-center justify-between px-4 border-b border-white/5 z-10">
              <span className="text-xs font-mono text-slate-400">{post.language}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-xs bg-white/5 hover:bg-white/10">
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="pt-12">
              <SyntaxHighlighter
                language={post.language.toLowerCase()}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem', background: 'transparent' }}
                wrapLines={true}
                showLineNumbers={true}
              >
                {post.code_content}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
