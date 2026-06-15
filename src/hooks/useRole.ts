import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setRole(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const isSuper = user.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
      setIsSuperAdmin(isSuper);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setIsAdmin(isSuper);
        } else if (data) {
          setRole(data.role);
          setIsAdmin(data.role === 'admin' || isSuper);
        }
      } catch (err) {
        console.error('Unexpected error fetching role:', err);
        setIsAdmin(isSuper);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { isAdmin, isSuperAdmin, role, isLoading };
}
