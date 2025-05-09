/**
 * Renders the main Content Calendar page within the dashboard.
 * This page serves as the primary user interface for managing scheduled content.
 *
 * Key functionalities include:
 * - Displaying an interactive calendar view of content events.
 * - Allowing users to create new events and view/edit details of existing events through dialog components.
 * - Fetching and managing calendar event data via the `useCalendarStore`, which interacts with Firebase.
 * - Integrating with AI-powered chat (`YoutubeAIChat`) and a bridge component (`AiCalendarBridge`)
 *   to assist users in scheduling content.
 * - Providing an .ics export feature for users to subscribe to their content calendar
 *   using external calendar applications. The export link is dynamically generated with the user's ID.
 *
 * This component relies on Firebase for user authentication and `useCalendarStore` for event state.
 * It orchestrates various sub-components like `CalendarView`, `CreateEventDialog`, and `EventDetailsDialog`
 * to deliver a comprehensive calendar management experience.
 */
"use client"

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Download, Plus, Calendar as CalendarLucide } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useCalendarStore, type CalendarEvent } from "@/store/calendar-store";
import { YoutubeAIChat } from "@/components/ai-chat";
import { AiCalendarBridge } from "@/components/ai-calendar-bridge";
import { CalendarView } from "./components/calendar-view";
import { CreateEventDialog } from "./components/create-event-dialog";
import { EventDetailsDialog } from "./components/event-details-dialog";

export default function CalendarPage() {
  const [user, loading] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility

  
  const { events, isLoading, error, fetchEvents } = useCalendarStore();

  // Fetch calendar events on mount when user is available
  useEffect(() => {
    if (user && !loading) {
      fetchEvents(user.uid);
    }
  }, [user, loading, fetchEvents]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };
  
  const handleCreateEvent = () => {
    setCreateDialogOpen(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your content with AI assistance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowAlert(true)} // Show alert on button click
          >
            <Download className="h-4 w-4" />
            <span>Export .ics</span>
          </Button>
          <Button 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCreateEvent}
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Alert for unavailable feature */}
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            The export feature is currently unavailable. Please check back later.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Content Schedule
            </CardTitle>
            <CardDescription>
              Your upcoming content schedule. Click on dates to view or add events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <CalendarView 
              events={events} 
              isLoading={isLoading || loading} 
              onDateSelect={handleDateSelect}
              onEventSelect={handleEventSelect}
              selectedDate={selectedDate}
            />
          </CardContent>
        </Card>
        
        {/* AI Chat Panel */}
        <div className="lg:col-span-1 space-y-6">
          <AiCalendarBridge className="mt-2" />
          
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarLucide className="h-4 w-4" />
                Calendar AI Assistant
              </CardTitle>
              <CardDescription>
                Chat with AI to schedule content. Try saying "Schedule a video about summer trends on June 15th"
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <YoutubeAIChat />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedDate={selectedDate}
        userId={user?.uid}
      />
      
      {selectedEvent && (
        <EventDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          event={selectedEvent}
        />
      )}
    </div>
  );
}