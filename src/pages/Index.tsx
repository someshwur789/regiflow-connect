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
  
  const { totalCount, technicalCount, nonTechnicalCount, loading } = useRegistrations();
  
  const technicalEvents = getTechnicalEvents();
  const nonTechnicalEvents = getNonTechnicalEvents();
  
  const isTechnicalFull = technicalCount >= 50;
  const isNonTechnicalFull = nonTechnicalCount >= 50;
  
  const selectedEventConfig = EVENT_CONFIGS.find(config => config.name === selectedEvent);
  const isSelectedEventFull = selectedEventConfig?.category === 'Technical' ? isTechnicalFull : isNonTechnicalFull;

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

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Event Registration Portal
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join exciting technical and non-technical events. Register now and showcase your skills!
          </p>
          
          {/* Registration Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-card bg-gradient-tech text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Technical Events</h3>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : technicalCount}/50</div>
                <Progress value={(technicalCount / 50) * 100} className="mb-2 bg-white/20" />
                <Badge variant={isTechnicalFull ? "destructive" : "secondary"} className="text-xs">
                  {isTechnicalFull ? 'Registration Closed' : 'Open for Registration'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-card bg-gradient-non-tech text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Non-Technical Events</h3>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : nonTechnicalCount}/50</div>
                <Progress value={(nonTechnicalCount / 50) * 100} className="mb-2 bg-white/20" />
                <Badge variant={isNonTechnicalFull ? "destructive" : "secondary"} className="text-xs">
                  {isNonTechnicalFull ? 'Registration Closed' : 'Open for Registration'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Total Registrations</h3>
                <div className="text-3xl font-bold mb-2">{loading ? '...' : totalCount}/100</div>
                <Progress value={(totalCount / 100) * 100} className="mb-2" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAdminLogin(true)}
                  className="text-xs"
                >
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {(isTechnicalFull && isNonTechnicalFull) && (
            <Alert className="mb-8 max-w-md mx-auto border-destructive">
              <AlertDescription className="text-destructive">
                All events are now closed. Maximum capacity has been reached for both categories.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <Card className="max-w-sm mx-auto mb-8 shadow-elevated">
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
                  onClick={() => { 
                    setAdminPassword(''); 
                    setAdminError(''); 
                    setShowAdminLogin(false);
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Overview */}
        <Card className="mb-8 border-0 shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Event</CardTitle>
            <CardDescription className="text-lg">
              Select an event category and register for your preferred event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedEvent} onValueChange={(value) => setSelectedEvent(value as EventName)}>
              <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
                {EVENTS.map((event) => {
                  const config = EVENT_CONFIGS.find(c => c.name === event)!;
                  const isEventCategoryFull = config.category === 'Technical' ? isTechnicalFull : isNonTechnicalFull;
                  
                  return (
                    <TabsTrigger 
                      key={event} 
                      value={event} 
                      disabled={isEventCategoryFull}
                      className="text-xs sm:text-sm relative flex flex-col gap-1 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
                    >
                      <span>{event}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${config.category === 'Technical' ? 'bg-technical/10 text-technical' : 'bg-non-technical/10 text-non-technical'}`}
                      >
                        {config.category}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {EVENTS.map((event) => {
                const config = EVENT_CONFIGS.find(c => c.name === event)!;
                return (
                  <TabsContent key={event} value={event} className="space-y-6">
                    <Card className="border-0 shadow-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {event}
                            <Badge className={config.category === 'Technical' ? 'bg-technical text-technical-foreground' : 'bg-non-technical text-non-technical-foreground'}>
                              {config.category}
                            </Badge>
                          </CardTitle>
                          <Badge variant="outline" className="text-sm">
                            Max Team Size: {config.maxTeamMembers}
                          </Badge>
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
                        {event === 'Paper Quest' && (
                          <Alert className="mb-6 border-primary/20 bg-primary/5">
                            <AlertDescription>
                              <strong>Special Requirement:</strong> Paper Quest requires uploading a presentation file (PPT, PPTX, or PDF) showcasing your research or project.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {isSelectedEventFull && (
                          <Alert className="mb-6 border-destructive/20 bg-destructive/5">
                            <AlertDescription className="text-destructive">
                              Registration is closed for {config.category.toLowerCase()} events. The maximum capacity of 50 participants has been reached.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <RegistrationForm 
                          selectedEvent={event} 
                          isDisabled={isSelectedEventFull}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Ready to showcase your skills? Register now and join the competition!</p>
          <p className="text-sm mt-2">For queries, contact the organizing committee.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;