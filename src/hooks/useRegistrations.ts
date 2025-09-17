import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Registration, getTechnicalEvents, getNonTechnicalEvents } from '@/types/registration';

export const useRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [technicalCount, setTechnicalCount] = useState(0);
  const [nonTechnicalCount, setNonTechnicalCount] = useState(0);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
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
      
      // Calculate category counts
      const technicalEvents = getTechnicalEvents();
      const nonTechnicalEvents = getNonTechnicalEvents();
      
      const techCount = data?.filter(reg => technicalEvents.includes(reg.event_name as any))?.length || 0;
      const nonTechCount = data?.filter(reg => nonTechnicalEvents.includes(reg.event_name as any))?.length || 0;
      
      setTechnicalCount(techCount);
      setNonTechnicalCount(nonTechCount);
      
      // Calculate per-event counts
      const counts: Record<string, number> = {};
      data?.forEach(reg => {
        counts[reg.event_name] = (counts[reg.event_name] || 0) + 1;
      });
      setEventCounts(counts);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async (registration: Omit<Registration, 'id' | 'created_at'>) => {
    try {
      // Check if event is full before submitting
      const currentCount = eventCounts[registration.event_name] || 0;
      if (currentCount >= 20) {
        return {
          success: false,
          error: `${registration.event_name} is full. Maximum 20 registrations allowed.`
        };
      }

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

  const getEventRegistrationCount = (eventName: string) => {
    return eventCounts[eventName] || 0;
  };

  const isEventFull = (eventName: string) => {
    return getEventRegistrationCount(eventName) >= 20;
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return {
    registrations,
    totalCount,
    technicalCount,
    nonTechnicalCount,
    eventCounts,
    loading,
    submitRegistration,
    checkEmailExists,
    getEventRegistrationCount,
    isEventFull,
    refetch: fetchRegistrations
  };
};