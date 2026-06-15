import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, Post } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input, Textarea, Select } from '../components/Input';
import { Upload, X, ArrowLeft } from 'lucide-react';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'PHP', 'HTML', 'CSS', 'React', 'SQL', 'Bash', 'Go', 'Rust', 'Other'
];

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [codeContent, setCodeContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      setError('Post not found.');
    } else {
      setPost(data as Post);
      setTitle(data.title);
      setDescription(data.description || '');
      setLanguage(data.language);
      setCodeContent(data.code_content);
      setPreviewUrl(data.preview_image_url);
    }
    setIsFetching(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;
    
    setIsLoading(true);
    setError('');

    try {
      let finalImageUrl = previewUrl;

      // If a NEW file was selected, upload it
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-previews')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('post-previews')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // Update post
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title,
          description,
          language,
          code_content: codeContent,
          preview_image_url: finalImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);
      
      navigate(`/post/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20 glass rounded-2xl max-w-2xl mx-auto">
        <p className="text-xl text-slate-300">{error}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const isSuperAdmin = user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;
  const canEdit = post.user_id === user?.id || isAdmin;

  if (!canEdit) {
    return (
      <div className="text-center py-20 glass rounded-2xl max-w-2xl mx-auto">
        <p className="text-xl text-red-400">You do not have permission to edit this snippet.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          Back to Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="glass p-8 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Edit Snippet</h1>
        </div>
        
        {error && <div className="mb-6 text-sm text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Title" 
            placeholder="e.g. Supabase Auth Helper" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <Textarea 
            label="Description (Optional)" 
            placeholder="Briefly describe what this code does..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Select 
            label="Language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </Select>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Code</label>
            <div className="relative rounded-lg glass-input focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50">
              <textarea
                required
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Enter your code here..."
                className="w-full h-64 min-h-[16rem] bg-transparent border-none p-4 text-sm font-mono text-slate-200 focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Preview Image (Optional)</label>
            {previewUrl ? (
              <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-white/10 group">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full max-w-sm">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 hover:border-violet-500/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" size="lg" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
