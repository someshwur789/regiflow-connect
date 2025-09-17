import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRegistrations } from '@/hooks/useRegistrations';
import { RegistrationForm } from '@/components/RegistrationForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { EVENTS, EVENT_CONFIGS, getTechnicalEvents, getNonTechnicalEvents, type EventName } from '@/types/registration';
const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventName>('Paper Quest');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const {
    totalCount,
    technicalCount,
    nonTechnicalCount,
    eventCounts,
    getEventRegistrationCount,
    isEventFull,
    loading
  } = useRegistrations();
  const technicalEvents = getTechnicalEvents();
  const nonTechnicalEvents = getNonTechnicalEvents();
  const selectedEventConfig = EVENT_CONFIGS.find(config => config.name === selectedEvent);
  const isSelectedEventFull = isEventFull(selectedEvent);
  const handleAdminLogin = () => {
    if (adminPassword === 'somesh1420') {
      setShowAdmin(true);
      setShowAdminLogin(false);
      setAdminError('');
    } else {
      setAdminError('Invalid password');
    }
  };
  const handleAdminLogout = () => {
    setShowAdmin(false);
    setShowAdminLogin(false);
    setAdminPassword('');
    setAdminError('');
  };
  if (showAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }
  return <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative text-center mb-8">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Event Registration Portal
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join exciting technical and non-technical events. Register now and showcase your skills!
          </p>
          
          {/* Admin Login - Top Right */}
          <div className="absolute top-0 right-0">
            <Button variant="outline" size="sm" onClick={() => setShowAdminLogin(true)} className="text-xs">
              Admin Login
            </Button>
          </div>
        </div>

        {/* Event Tabs */}
        <div className="mb-8">
          <Tabs value={selectedEvent} onValueChange={value => setSelectedEvent(value as EventName)}>
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50 max-w-4xl mx-auto">
              {EVENTS.map(event => {
              const config = EVENT_CONFIGS.find(c => c.name === event)!;
              const isFull = isEventFull(event);
              return <TabsTrigger key={event} value={event} disabled={isFull} className="text-xs sm:text-sm relative flex flex-col gap-1 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                  <span>{event}</span>
                  <Badge variant="secondary" className={`text-xs ${config.category === 'Technical' ? 'bg-technical/10 text-technical' : 'bg-non-technical/10 text-non-technical'}`}>
                    {config.category}
                  </Badge>
                </TabsTrigger>;
            })}
            </TabsList>

        {/* Admin Login Modal */}
        {showAdminLogin && <Card className="max-w-sm mx-auto mb-8 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
              </div>
              {adminError && <p className="text-sm text-destructive">{adminError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleAdminLogin} size="sm" className="flex-1">
                  Login
                </Button>
                <Button variant="outline" onClick={() => {
                  setAdminPassword('');
                  setAdminError('');
                  setShowAdminLogin(false);
                }} size="sm">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>}

            {EVENTS.map(event => {
            const config = EVENT_CONFIGS.find(c => c.name === event)!;
            return <TabsContent key={event} value={event} className="space-y-6">
                    <Card className="border-0 shadow-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {event}
                            <Badge className={config.category === 'Technical' ? 'bg-technical text-technical-foreground' : 'bg-non-technical text-non-technical-foreground'}>
                              {config.category}
                            </Badge>
                          </CardTitle>
                          
                        </div>
                        <CardDescription className="text-base">
                          {event === 'Paper Quest' && 'Present your research or project ideas with innovative solutions. File upload required for presentation materials.'}
                          {event === 'Hack\'n\'Hammer' && 'Intensive coding competition with challenging problem statements and time constraints.'}
                          {event === 'Byte Fest' && 'Technology showcase and innovation event featuring cutting-edge projects and demonstrations.'}
                          {event === 'Cinephile' && 'Movie and film-related competitions including quizzes, discussions, and creative challenges.'}
                          {event === 'e-sports' && 'Competitive gaming tournaments across multiple popular game titles and categories.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {event === 'Paper Quest'}
                        
                        {isSelectedEventFull && <Alert className="mb-6 border-destructive/20 bg-destructive/5">
                            <AlertDescription className="text-destructive">
                              Registration is closed for {event}. The maximum capacity of 20 participants has been reached.
                            </AlertDescription>
                          </Alert>}
                        
                        <RegistrationForm selectedEvent={event} isDisabled={isSelectedEventFull} />
                      </CardContent>
                    </Card>
                  </TabsContent>;
          })}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Ready to showcase your skills? Register now and join the competition!</p>
          <p className="text-sm mt-2">For queries, contact the organizing committee.</p>
        </div>
      </div>
    </div>;
};
export default Index;