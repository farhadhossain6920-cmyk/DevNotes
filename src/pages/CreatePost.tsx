import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input, Textarea, Select } from '../components/Input';
import { Upload, X } from 'lucide-react';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'PHP', 'HTML', 'CSS', 'React', 'SQL', 'Bash', 'Go', 'Rust', 'Other'
];

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [codeContent, setCodeContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user && !isLoading) {
    navigate('/login');
    return null;
  }

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
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      let previewImageUrl = null;

      // 1. Upload image if exists
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

        previewImageUrl = publicUrlData.publicUrl;
      }

      // 2. Insert post
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title,
          description,
          language,
          code_content: codeContent,
          preview_image_url: previewImageUrl,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      
      navigate(`/post/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="glass p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Create Snippet</h1>
        
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
              Publish Snippet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
