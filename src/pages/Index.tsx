import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRegistrations } from '@/hooks/useRegistrations';
import { RegistrationForm } from '@/components/RegistrationForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { EVENTS, type EventName } from '@/types/registration';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventName>('Paper Quest');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  const { totalCount, loading } = useRegistrations();
  
  const isCapacityReached = totalCount >= 100;

  const handleAdminLogin = () => {
    if (adminPassword === 'somesh1420') {
      setShowAdmin(true);
      setAdminError('');
    } else {
      setAdminError('Invalid password');
    }
  };

  const handleAdminLogout = () => {
    setShowAdmin(false);
    setAdminPassword('');
    setAdminError('');
  };

  if (showAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Event Registration Portal
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant={isCapacityReached ? "destructive" : "default"} className="text-sm px-3 py-1">
              {loading ? 'Loading...' : `${totalCount}/100 Registrations`}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-xs"
            >
              Admin Login
            </Button>
          </div>
          
          {isCapacityReached && (
            <Alert className="mb-6 max-w-md mx-auto">
              <AlertDescription>
                Registration is now closed. The maximum capacity of 100 participants has been reached.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Admin Login Modal */}
        {!showAdmin && adminPassword !== '' && (
          <Card className="max-w-sm mx-auto mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              {adminError && (
                <p className="text-sm text-destructive">{adminError}</p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAdminLogin} size="sm" className="flex-1">
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setAdminPassword(''); setAdminError(''); }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Events</CardTitle>
            <CardDescription>
              Choose an event to register for. Each participant can only register for one event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedEvent} onValueChange={(value) => setSelectedEvent(value as EventName)}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                {EVENTS.map((event) => (
                  <TabsTrigger 
                    key={event} 
                    value={event} 
                    disabled={isCapacityReached}
                    className="text-xs sm:text-sm"
                  >
                    {event}
                  </TabsTrigger>
                ))}
              </TabsList>

              {EVENTS.map((event) => (
                <TabsContent key={event} value={event}>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{event}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {event === 'Paper Quest' && 'Present your research or project ideas. File upload required.'}
                      {event === 'Hack\'n\'Hammer' && 'Coding competition with exciting challenges.'}
                      {event === 'Byte Fest' && 'Technology showcase and innovation event.'}
                      {event === 'Cinephile' && 'Movie and film-related competitions and discussions.'}
                      {event === 'e-sports' && 'Gaming tournaments across multiple game titles.'}
                    </p>
                    {event === 'Paper Quest' && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>Note:</strong> Paper Quest requires uploading a presentation file (PPT, PPTX, or PDF).
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <RegistrationForm 
                    selectedEvent={event} 
                    isDisabled={isCapacityReached}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Registration deadline and event details will be announced soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
