import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegistrations } from '@/hooks/useRegistrations';
import { EVENTS } from '@/types/registration';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { registrations, loading } = useRegistrations();
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;

    if (eventFilter !== 'all') {
      filtered = filtered.filter(reg => reg.event_name === eventFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.college_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [registrations, eventFilter, searchTerm]);

  const exportToExcel = () => {
    const data = filteredRegistrations.map(reg => ({
      Email: reg.email,
      'Student Name': reg.student_name,
      College: reg.college_name,
      Department: reg.department,
      Year: reg.year,
      Phone: reg.phone || '',
      'Team Member 1': reg.team_member1,
      'Team Member 2': reg.team_member2 || '',
      'Team Member 3': reg.team_member3 || '',
      'Event Name': reg.event_name,
      'Uploaded File': reg.uploaded_file_path || '',
      'Created At': new Date(reg.created_at || '').toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    
    const fileName = `registrations_${eventFilter !== 'all' ? eventFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF('landscape');
    
    pdf.setFontSize(16);
    pdf.text('Event Registrations', 14, 22);
    
    const headers = [
      'Email', 'Student Name', 'College', 'Department', 'Year', 
      'Phone', 'Team Member 1', 'Team Member 2', 'Team Member 3', 
      'Event Name', 'Created At'
    ];
    
    const data = filteredRegistrations.map(reg => [
      reg.email,
      reg.student_name,
      reg.college_name,
      reg.department,
      reg.year.toString(),
      reg.phone || '',
      reg.team_member1,
      reg.team_member2 || '',
      reg.team_member3 || '',
      reg.event_name,
      new Date(reg.created_at || '').toLocaleDateString()
    ]);

    pdf.autoTable({
      head: [headers],
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 }, // Email
        1: { cellWidth: 20 }, // Student Name
        2: { cellWidth: 20 }, // College
        3: { cellWidth: 15 }, // Department
        4: { cellWidth: 10 }, // Year
        5: { cellWidth: 15 }, // Phone
        6: { cellWidth: 15 }, // Team Member 1
        7: { cellWidth: 15 }, // Team Member 2
        8: { cellWidth: 15 }, // Team Member 3
        9: { cellWidth: 15 }, // Event Name
        10: { cellWidth: 15 }, // Created At
      }
    });
    
    const fileName = `registrations_${eventFilter !== 'all' ? eventFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Admin Dashboard</CardTitle>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="Search by name, email, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {EVENTS.map(event => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={exportToExcel} variant="outline">
                Export Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                Export PDF
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Team Member 1</TableHead>
                  <TableHead>Team Member 2</TableHead>
                  <TableHead>Team Member 3</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-mono text-xs">{registration.email}</TableCell>
                    <TableCell>{registration.student_name}</TableCell>
                    <TableCell>{registration.college_name}</TableCell>
                    <TableCell>{registration.department}</TableCell>
                    <TableCell>{registration.year}</TableCell>
                    <TableCell>{registration.phone || '-'}</TableCell>
                    <TableCell>{registration.team_member1}</TableCell>
                    <TableCell>{registration.team_member2 || '-'}</TableCell>
                    <TableCell>{registration.team_member3 || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-sm text-xs">
                        {registration.event_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {registration.uploaded_file_path ? (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            // Generate signed URL for file download
                            const { data } = supabase.storage
                              .from('paper-quest-uploads')
                              .getPublicUrl(registration.uploaded_file_path!);
                            window.open(data.publicUrl, '_blank');
                          }}
                          className="h-auto p-0 text-xs"
                        >
                          View File
                        </Button>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(registration.created_at || '').toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No registrations found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}