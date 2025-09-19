-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  phone TEXT,
  team_member1 TEXT NOT NULL,
  team_member2 TEXT,
  team_member3 TEXT,
  event_name TEXT NOT NULL,
  uploaded_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS as requested
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for showcase uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('showcase-uploads', 'showcase-uploads', false);

-- Create storage policies for file uploads
CREATE POLICY "Allow public file uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'showcase-uploads');

CREATE POLICY "Allow public file downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'showcase-uploads');

-- Create index for better query performance
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_event ON public.registrations(event_name);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at);