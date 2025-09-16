import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Registration } from '@/types/registration';

export const useRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
      setTotalCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async (registration: Omit<Registration, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([registration])
        .select()
        .single();

      if (error) throw error;
      await fetchRegistrations(); // Refresh data
      return { success: true, data };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return {
    registrations,
    totalCount,
    loading,
    submitRegistration,
    checkEmailExists,
    refetch: fetchRegistrations
  };
};