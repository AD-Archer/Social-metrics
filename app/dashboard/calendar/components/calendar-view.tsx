/**
 * Calendar View component for displaying events in a monthly calendar.
 * Supports date selection, event highlighting, event click actions, and markdown rendering.
 * Provides a clean, accessible interface for viewing calendar events with rich text support.
 */
"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarEvent } from "@/store/calendar-store"
import { DayContent, DayContentProps } from "react-day-picker"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface CalendarViewProps {
  events: CalendarEvent[]
  isLoading: boolean
  onDateSelect: (date: Date) => void
  onEventSelect: (event: CalendarEvent) => void
  selectedDate: Date
}

export function CalendarView({
  events,
  isLoading,
  onDateSelect,
  onEventSelect,
  selectedDate
}: CalendarViewProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([])

  // Handle hydration mismatch by mounting after first render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update events for the selected date
  useEffect(() => {
    if (events.length > 0) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const filteredEvents = events.filter(event => {
        const eventDateStr = event.startDate.split('T')[0]
        return eventDateStr === dateStr
      })
      setSelectedDateEvents(filteredEvents)
    } else {
      setSelectedDateEvents([])
    }
  }, [selectedDate, events])

  // Function to render the content for each day cell
  const renderDayContent = (day: Date | null) => {
    if (!day || !events.length) return null

    const dateStr = format(day, 'yyyy-MM-dd')
    const dayEvents = events.filter(event => {
      const eventDateStr = event.startDate.split('T')[0]
      return eventDateStr === dateStr
    })

    if (dayEvents.length === 0) return null

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
        <Badge variant="outline" className="h-1 w-1 rounded-full bg-primary border-0 p-0" />
      </div>
    )
  }

  // Custom day content component that adds event indicators
  const CustomDayContent = (props: DayContentProps) => {
    return (
      <div className="relative h-full w-full">
        <DayContent {...props} />
        {props.date && renderDayContent(props.date)}
      </div>
    );
  };

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : (
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-md border"
          components={{
            DayContent: CustomDayContent
          }}
        />
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-1">
            <h3 className="font-medium">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDateEvents.length === 0 
                ? "No events scheduled" 
                : `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? 's' : ''} scheduled`}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onEventSelect(event)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="text-sm text-muted-foreground max-h-10 overflow-hidden prose-sm dark:prose-invert">
                        {event.source === 'ai' ? (
                          <div className="line-clamp-2">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Simplified inline components for preview
                                p: ({...props}) => <span {...props} />,
                                strong: ({...props}) => <span className="font-medium" {...props} />,
                                em: ({...props}) => <span className="italic" {...props} />,
                                h1: ({...props}) => <span className="font-bold" {...props} />,
                                h2: ({...props}) => <span className="font-bold" {...props} />,
                                h3: ({...props}) => <span className="font-bold" {...props} />,
                                ul: ({...props}) => <span {...props} />,
                                li: ({...props}) => <span {...props} />,
                              }}
                            >
                              {event.description}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={event.source === 'ai' ? 'secondary' : 'default'}
                      className="ml-2 capitalize flex-shrink-0"
                    >
                      {event.source}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No events scheduled for this day.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}