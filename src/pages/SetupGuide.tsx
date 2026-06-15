import React from 'react';
import { Code2 } from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="glass p-8 rounded-2xl max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
          <Code2 className="w-10 h-10 text-violet-400" />
          <h1 className="text-3xl font-bold">DevNotes Setup Required</h1>
        </div>
        
        <div className="space-y-4 text-slate-300">
          <p>
            It looks like your Supabase environment variables are missing. To run DevNotes, you need to configure your database connection.
          </p>
          
          <div className="bg-black/30 p-4 rounded-lg my-4 font-mono text-sm">
            <p>VITE_SUPABASE_URL=...</p>
            <p>VITE_SUPABASE_ANON_KEY=...</p>
            <p>VITE_SUPER_ADMIN_EMAIL=...</p>
          </div>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">Supabase</a>.</li>
            <li>Run the SQL script found in <code>supabase/schema.sql</code> in your Supabase SQL Editor.</li>
            <li>Copy your Project URL and Anon API Key from Settings &gt; API.</li>
            <li>Add them as Secrets in AI Studio, or place them in a <code>.env</code> file if running locally.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
