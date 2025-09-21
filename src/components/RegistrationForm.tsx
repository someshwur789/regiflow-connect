import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRegistrations } from '@/hooks/useRegistrations';
import { supabase } from '@/integrations/supabase/client';
import { getEventConfig, type EventName, type Registration } from '@/types/registration';
import { Upload, Users, FileText } from 'lucide-react';
interface RegistrationFormProps {
  selectedEvent: EventName;
  isDisabled: boolean;
}
export function RegistrationForm({
  selectedEvent,
  isDisabled
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    student_name: '',
    college_name: '',
    department: '',
    year: '',
    phone: '',
    team_member1: '',
    team_member2: '',
    team_member3: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    submitRegistration,
    checkEmailExists
  } = useRegistrations();
  const {
    toast
  } = useToast();
  const eventConfig = getEventConfig(selectedEvent);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'];
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
    const {
      data,
      error
    } = await supabase.storage.from('paper-quest-uploads').upload(fileName, file);
    if (error) throw error;
    return data.path;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate phone number - must be exactly 10 digits
      if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        toast({
          variant: 'destructive',
          title: 'Invalid phone number',
          description: 'Phone number must be exactly 10 digits.'
        });
        setSubmitting(false);
        return;
      }

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

      // Validate team member requirements
      if (eventConfig.maxTeamMembers === 2 && formData.team_member3.trim()) {
        toast({
          variant: 'destructive',
          title: 'Team size exceeded',
          description: `${selectedEvent} allows maximum ${eventConfig.maxTeamMembers} team members.`
        });
        return;
      }
      let uploadedFilePath = null;
      if (eventConfig.requiresFile && file) {
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
          description: `You have been registered for ${selectedEvent}. Check your email for the "On-Duty" request letter.`,
          duration: 5000
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
          team_member3: ''
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
  return <Card className="w-full max-w-3xl mx-auto border-0 shadow-elevated">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className={`p-2 rounded-lg ${eventConfig.category === 'Technical' ? 'bg-technical/10' : 'bg-non-technical/10'}`}>
              {eventConfig.requiresFile ? <FileText className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            Register for {selectedEvent}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={eventConfig.category === 'Technical' ? 'bg-technical text-technical-foreground' : 'bg-non-technical text-non-technical-foreground'}>
              {eventConfig.category}
            </Badge>
            
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required disabled={isDisabled} className="mt-1" placeholder="your.email@college.edu" />
              </div>
              
              <div>
                <Label htmlFor="student_name" className="text-sm font-medium">Full Name *</Label>
                <Input id="student_name" value={formData.student_name} onChange={e => handleInputChange('student_name', e.target.value)} required disabled={isDisabled} className="mt-1" placeholder="Your full name" />
              </div>
              
              <div>
                <Label htmlFor="college_name" className="text-sm font-medium">College/University *</Label>
                <Input id="college_name" value={formData.college_name} onChange={e => handleInputChange('college_name', e.target.value)} required disabled={isDisabled} className="mt-1" placeholder="Your college name" />
              </div>
              
              <div>
                <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                <Input id="department" value={formData.department} onChange={e => handleInputChange('department', e.target.value)} required disabled={isDisabled} className="mt-1" placeholder="e.g., Artificial Intelligence & Data Science" />
              </div>
              
              <div>
                <Label htmlFor="year" className="text-sm font-medium">Academic Year *</Label>
                <Select onValueChange={value => handleInputChange('year', value)} disabled={isDisabled} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your year" />
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
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={e => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange('phone', value);
                  }} 
                  disabled={isDisabled} 
                  className="mt-1" 
                  placeholder="9876543210" 
                  type="tel"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Enter 10-digit phone number</p>
              </div>
            </div>
          </div>
          
          {/* Team Information */}
          
          
          {/* File Upload for Paper Showcase */}
          {eventConfig.requiresFile && <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Presentation Upload
              </h3>
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription>
                  <strong>Required:</strong> Upload your presentation file (PPT, PPTX, or PDF). 
                  This file will be available for download in the admin panel.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="file" className="text-sm font-medium">Upload Presentation (PPT, PPTX, PDF) *</Label>
                <Input id="file" type="file" accept=".ppt,.pptx,.pdf" onChange={handleFileChange} required={eventConfig.requiresFile} disabled={isDisabled} className="mt-1" />
                {file && <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Selected: {file.name}
                    </p>
                  </div>}
              </div>
            </div>}
          
          <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 transition-opacity" disabled={isDisabled || submitting}>
            {submitting ? <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registering...
              </div> : `Register for ${selectedEvent}`}
          </Button>
          
          {isDisabled && <Alert className="border-destructive/20 bg-destructive/5">
              <AlertDescription className="text-destructive">
                Registration is currently closed for {selectedEvent}. Maximum capacity of 20 participants has been reached.
              </AlertDescription>
            </Alert>}
        </form>
      </CardContent>
    </Card>;
}
