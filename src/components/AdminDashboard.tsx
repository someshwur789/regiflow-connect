import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRegistrations } from '@/hooks/useRegistrations';
import { EVENTS, getTechnicalEvents, getNonTechnicalEvents, getEventConfig } from '@/types/registration';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, FileText, Users, Calendar, Search, Filter, LogOut } from 'lucide-react';

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
  const { registrations, totalCount, technicalCount, nonTechnicalCount, loading } = useRegistrations();
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

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('paper-quest-uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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
      'Event Category': getEventConfig(reg.event_name as any).category,
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
    
    pdf.setFontSize(18);
    pdf.text('Event Registration Dashboard', 14, 22);
    
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    pdf.text(`Total Records: ${filteredRegistrations.length}`, 14, 38);
    
    const headers = [
      'Email', 'Student Name', 'College', 'Department', 'Year', 
      'Phone', 'Team Member 1', 'Team Member 2', 'Team Member 3', 
      'Event Name', 'Category', 'Created At'
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
      getEventConfig(reg.event_name as any).category,
      new Date(reg.created_at || '').toLocaleDateString()
    ]);

    pdf.autoTable({
      head: [headers],
      body: data,
      startY: 45,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 22 }, // Email
        1: { cellWidth: 18 }, // Student Name
        2: { cellWidth: 18 }, // College
        3: { cellWidth: 15 }, // Department
        4: { cellWidth: 8 }, // Year
        5: { cellWidth: 15 }, // Phone
        6: { cellWidth: 15 }, // Team Member 1
        7: { cellWidth: 15 }, // Team Member 2
        8: { cellWidth: 15 }, // Team Member 3
        9: { cellWidth: 15 }, // Event Name
        10: { cellWidth: 12 }, // Category
        11: { cellWidth: 15 }, // Created At
      }
    });
    
    const fileName = `registrations_${eventFilter !== 'all' ? eventFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'all'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <Card className="border-0 shadow-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Admin Dashboard
                </CardTitle>
                <p className="text-muted-foreground mt-1">Manage and monitor event registrations</p>
              </div>
              <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalCount}</div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-card bg-gradient-tech text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{technicalCount}/50</div>
              <p className="text-sm opacity-90">Technical Events</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-card bg-gradient-non-tech text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{nonTechnicalCount}/50</div>
              <p className="text-sm opacity-90">Non-Technical Events</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">
                {registrations.filter(r => r.uploaded_file_path).length}
              </div>
              <p className="text-sm text-muted-foreground">Files Uploaded</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Card className="border-0 shadow-elevated">
          <CardHeader>
            <CardTitle className="text-xl">Registration Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or college..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-48 pl-10">
                      <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="technical">Technical Events</SelectItem>
                      <SelectItem value="non-technical">Non-Technical Events</SelectItem>
                      {EVENTS.map(event => (
                        <SelectItem key={event} value={event}>
                          {event}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Showing {filteredRegistrations.length} of {registrations.length} registrations
            </div>
            
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Student Details</TableHead>
                    <TableHead className="font-semibold">College</TableHead>
                    <TableHead className="font-semibold">Team Members</TableHead>
                    <TableHead className="font-semibold">Event</TableHead>
                    <TableHead className="font-semibold">File</TableHead>
                    <TableHead className="font-semibold">Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => {
                    const eventConfig = getEventConfig(registration.event_name as any);
                    return (
                      <TableRow key={registration.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{registration.student_name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{registration.email}</div>
                            <div className="text-sm text-muted-foreground">{registration.phone || 'No phone'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{registration.college_name}</div>
                            <div className="text-sm text-muted-foreground">{registration.department}</div>
                            <Badge variant="outline" className="text-xs">Year {registration.year}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium">1.</span> {registration.team_member1}</div>
                            {registration.team_member2 && (
                              <div><span className="font-medium">2.</span> {registration.team_member2}</div>
                            )}
                            {registration.team_member3 && (
                              <div><span className="font-medium">3.</span> {registration.team_member3}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-medium">{registration.event_name}</div>
                            <Badge 
                              className={`text-xs ${
                                eventConfig.category === 'Technical' 
                                  ? 'bg-technical/10 text-technical' 
                                  : 'bg-non-technical/10 text-non-technical'
                              }`}
                            >
                              {eventConfig.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {registration.uploaded_file_path ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const fileName = registration.uploaded_file_path!.split('/').pop() || 'file';
                                downloadFile(registration.uploaded_file_path!, fileName);
                              }}
                              className="flex items-center gap-2 text-xs h-8"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(registration.created_at || '').toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No registrations found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}