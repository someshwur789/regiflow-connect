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
      
      // Send on-duty email after successful registration
      try {
        const { error: emailError } = await supabase.functions.invoke('send-on-duty-email', {
          body: {
            studentName: registration.student_name,
            email: registration.email,
            collegeName: registration.college_name,
            eventName: registration.event_name,
          },
        });
        
        if (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't fail the registration if email fails
        }
      } catch (emailError) {
        console.error('Email function call failed:', emailError);
        // Don't fail the registration if email fails
      }
      
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