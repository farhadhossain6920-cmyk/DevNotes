import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Post } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { Input, Select } from '../components/Input';
import { Search, Image as ImageIcon } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (display_name, email)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as unknown as Post[]);
    }
    setIsLoading(false);
  };

  const filteredPosts = posts
    .filter((post) => {
      const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const displayName = post.profiles?.display_name || post.profiles?.email || 'Unknown';
      const matchAuthor = displayName.toLowerCase().includes(authorQuery.toLowerCase());
      return matchSearch && matchAuthor;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Filter Bar */}
      <div className="glass p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <Input 
            className="pl-9"
            placeholder="Search posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Input 
            placeholder="Filter by author..." 
            value={authorQuery}
            onChange={(e) => setAuthorQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-slate-400">No snippets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="block group">
              <div className="glass h-full rounded-2xl overflow-hidden glass-hover flex flex-col">
                <div className="h-40 w-full bg-black/40 relative overflow-hidden flex items-center justify-center">
                  {post.preview_image_url ? (
                    <img 
                      src={post.preview_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-50">No Cover</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1040]/80 to-transparent"></div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 text-xs font-mono font-medium bg-black/60 backdrop-blur-md rounded-md text-violet-300 border border-violet-500/20">
                      {post.language}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-300">
                        {post.profiles?.display_name || post.profiles?.email || 'Unknown'}
                      </span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                  </div>
                  
                  <div className="mt-auto relative rounded-lg overflow-hidden border border-white/5 bg-[#1E1E1E]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1E1E1E] z-10 pointer-events-none"></div>
                    <SyntaxHighlighter
                      language={post.language.toLowerCase()}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, padding: '1rem', fontSize: '0.75rem', background: 'transparent' }}
                      wrapLines={true}
                    >
                      {post.code_content.split('\n').slice(0, 5).join('\n') + (post.code_content.split('\n').length > 5 ? '\n...' : '')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
