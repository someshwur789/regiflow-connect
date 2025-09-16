import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRegistrations } from '@/hooks/useRegistrations';
import { supabase } from '@/integrations/supabase/client';
import type { EventName, Registration } from '@/types/registration';

interface RegistrationFormProps {
  selectedEvent: EventName;
  isDisabled: boolean;
}

export function RegistrationForm({ selectedEvent, isDisabled }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    student_name: '',
    college_name: '',
    department: '',
    year: '',
    phone: '',
    team_member1: '',
    team_member2: '',
    team_member3: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { submitRegistration, checkEmailExists } = useRegistrations();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload only PPT, PPTX, or PDF files.'
        });
        e.target.value = '';
      }
    }
  };

  const uploadFile = async (file: File, email: string) => {
    const fileName = `${email}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('paper-quest-uploads')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast({
          variant: 'destructive',
          title: 'Email already registered',
          description: 'This email is already registered for an event.'
        });
        return;
      }

      let uploadedFilePath = null;
      if (selectedEvent === 'Paper Quest' && file) {
        uploadedFilePath = await uploadFile(file, formData.email);
      }

      const registration: Omit<Registration, 'id' | 'created_at'> = {
        ...formData,
        year: parseInt(formData.year),
        event_name: selectedEvent,
        uploaded_file_path: uploadedFilePath
      };

      const result = await submitRegistration(registration);
      
      if (result.success) {
        toast({
          title: 'Registration successful!',
          description: `You have been registered for ${selectedEvent}.`
        });
        
        // Reset form
        setFormData({
          email: '',
          student_name: '',
          college_name: '',
          department: '',
          year: '',
          phone: '',
          team_member1: '',
          team_member2: '',
          team_member3: '',
        });
        setFile(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: result.error || 'An error occurred during registration.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'An unexpected error occurred.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isPaperQuest = selectedEvent === 'Paper Quest';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {selectedEvent}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="student_name">Student Name *</Label>
              <Input
                id="student_name"
                value={formData.student_name}
                onChange={(e) => handleInputChange('student_name', e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="college_name">College Name *</Label>
              <Input
                id="college_name"
                value={formData.college_name}
                onChange={(e) => handleInputChange('college_name', e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select onValueChange={(value) => handleInputChange('year', value)} disabled={isDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="team_member1">Team Member 1 *</Label>
              <Input
                id="team_member1"
                value={formData.team_member1}
                onChange={(e) => handleInputChange('team_member1', e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="team_member2">Team Member 2</Label>
              <Input
                id="team_member2"
                value={formData.team_member2}
                onChange={(e) => handleInputChange('team_member2', e.target.value)}
                disabled={isDisabled}
              />
            </div>
            
            <div>
              <Label htmlFor="team_member3">Team Member 3</Label>
              <Input
                id="team_member3"
                value={formData.team_member3}
                onChange={(e) => handleInputChange('team_member3', e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
          
          {isPaperQuest && (
            <div>
              <Label htmlFor="file">Upload Presentation (PPT, PPTX, PDF) *</Label>
              <Input
                id="file"
                type="file"
                accept=".ppt,.pptx,.pdf"
                onChange={handleFileChange}
                required={isPaperQuest}
                disabled={isDisabled}
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isDisabled || submitting}
          >
            {submitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}