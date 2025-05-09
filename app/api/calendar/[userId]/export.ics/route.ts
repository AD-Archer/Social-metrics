/**
 * API route for exporting a user's content calendar as an iCalendar (.ics) file.
 * Path: /api/calendar/[userId]/export.ics
 *
 * This endpoint fetches calendar events associated with a specific userId from Firestore,
 * transforms them into the iCalendar format, and serves the resulting .ics file.
 * This allows users to subscribe to their Social Dashboard content calendar using
 * external calendar applications (e.g., Google Calendar, Outlook Calendar, Apple Calendar).
 *
 * Key functionalities:
 * - Retrieves events from the 'calendar-events' Firestore collection based on userId.
 * - Handles cases with no events by returning a valid, empty .ics file.
 * - Validates essential event data (e.g., startDate) and skips problematic events
 *   to ensure the generated ICS is valid.
 * - Maps event fields (title, description, start/end dates, creation/update times, source)
 *   to corresponding iCalendar event attributes.
 * - Uses the 'ics' library to construct the .ics file content.
 * - Sets appropriate HTTP headers for file download and cache control.
 *
 * Future developers should be aware of:
 * - The structure of `CalendarEvent` (defined in `@/store/calendar-store`) and how its fields
 *   are mapped to `ics.EventAttributes`.
 * - Firestore query performance if the number of events per user grows very large.
 * - Potential compatibility issues with various calendar clients if the ICS spec
 *   is not strictly adhered to by the 'ics' library or our mapping logic.
 * - Error handling is in place for common issues, but specific event data malformations
 *   could still lead to unexpected behavior if not caught by current validation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CalendarEvent } from '@/store/calendar-store';
import * as ics from 'ics';

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const userId = context.params.userId; // Access params synchronously

    if (!userId) {
      console.warn('ICS export: User ID missing in request');
      return new NextResponse('User ID is required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Fetch user's calendar events from Firestore
    const eventsCollection = collection(db, 'calendar-events');
    const userEventsQuery = query(eventsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(userEventsQuery);
    
    const calendarEvents: CalendarEvent[] = [];
    querySnapshot.forEach((doc) => {
      calendarEvents.push({ id: doc.id, ...doc.data() } as CalendarEvent);
    });
    
    // If no events found in Firestore, or if all events are filtered out later,
    // we should still return a valid, empty ICS file.
    if (calendarEvents.length === 0) {
      console.log(`ICS export: No calendar events found for user ${userId}. Returning empty calendar.`);
      const { error, value } = ics.createEvents([]); // Create an empty calendar
      
      // Even if ics.createEvents somehow fails for an empty array (it shouldn't),
      // we construct a minimal valid ICS response.
      const icsContent = value || 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SocialDashboard//EN\nEND:VCALENDAR';
      
      return new NextResponse(icsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="content-calendar-${userId}.ics"`,
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // Convert events to ICS format with proper validation
    const icsEvents: ics.EventAttributes[] = calendarEvents
      .map(event => {
        try {
          if (!event || !event.startDate) { // Basic check, startDate is crucial
            console.warn(`ICS export: Skipping event ${event?.id || 'unknown'} due to missing startDate for user ${userId}.`);
            return null;
          }

          const now = new Date(); // For fallbacks

          // Helper to safely convert various date inputs (Timestamp, string, number) to JS Date
          const toSafeDate = (dateFieldValue: any, fallbackDate: Date): Date => {
            if (dateFieldValue == null) return fallbackDate; // Handles undefined or null

            if (typeof dateFieldValue.toDate === 'function') { // Firestore Timestamp object
              try {
                const d = dateFieldValue.toDate();
                return isNaN(d.getTime()) ? fallbackDate : d;
              } catch (e) {
                console.warn(`ICS export: Error converting Firestore Timestamp to Date for event ${event?.id}. Value: ${JSON.stringify(dateFieldValue)}`, e);
                return fallbackDate;
              }
            }
            
            // Assuming string, number, or already a JS Date
            try {
              const d = new Date(dateFieldValue);
              return isNaN(d.getTime()) ? fallbackDate : d;
            } catch (e) {
              console.warn(`ICS export: Error converting value to Date for event ${event?.id}. Value: ${JSON.stringify(dateFieldValue)}`, e);
              return fallbackDate;
            }
          };

          const title = event.title || 'Untitled Event';
          const description = event.description || '';
          
          let startDate = toSafeDate(event.startDate, now);
          // Log if fallback was used due to invalid original date, and original date was not null/undefined
          if (startDate === now && event.startDate != null) {
             console.warn(`ICS export: Original startDate for event ${event.id} was invalid or unparsable. Using current date as fallback. Original value: ${JSON.stringify(event.startDate)}`);
          }

          let endDate: Date;
          const defaultEndDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour duration

          if (event.endDate) {
            endDate = toSafeDate(event.endDate, defaultEndDate);
            if (endDate === defaultEndDate && event.endDate != null) {
              console.warn(`ICS export: Original endDate for event ${event.id} was invalid or unparsable. Calculating fallback based on startDate. Original value: ${JSON.stringify(event.endDate)}`);
            }
          } else if (event.allDay) {
            endDate = new Date(startDate); // Duration will be used to signify all-day
          } else {
            endDate = defaultEndDate;
          }

          // Ensure end date is after start date for non-all-day events
          if (!event.allDay && endDate.getTime() <= startDate.getTime()) {
            console.warn(`ICS export: endDate is not after startDate for event ${event.id}. Adjusting endDate to 1 hour after startDate.`);
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          }
          
          let createdDate = toSafeDate(event.createdAt, now);
          if (createdDate === now && event.createdAt != null) {
            // Avoid verbose logging if createdAt is simply not set
          }
          
          let updatedDate = toSafeDate(event.updatedAt, createdDate);
          if (updatedDate === createdDate && event.updatedAt != null && event.updatedAt !== event.createdAt) {
             // Avoid verbose logging if updatedAt is simply not set or same as createdDate
          }
          
          const startArray: ics.DateArray = [
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate(),
            startDate.getHours(),
            startDate.getMinutes()
          ];
          
          let duration: ics.DurationObject | undefined = undefined;
          let endArray: ics.DateArray | undefined = undefined;

          if (event.allDay) {
            // For all-day events, we can specify just the date part for start
            // and the ics library handles it, or use a duration of 1 day.
            // Using duration is often more robust.
            startArray[3] = 0; // Hour 0
            startArray[4] = 0; // Minute 0
            duration = { days: 1 };
          } else {
            endArray = [
              endDate.getFullYear(),
              endDate.getMonth() + 1,
              endDate.getDate(),
              endDate.getHours(),
              endDate.getMinutes()
            ];
            // Calculate duration if endArray is present and valid
            const durationMillis = endDate.getTime() - startDate.getTime();
            if (durationMillis > 0) {
                duration = {
                    weeks: Math.floor(durationMillis / (1000 * 60 * 60 * 24 * 7)),
                    days: Math.floor((durationMillis % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((durationMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((durationMillis % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((durationMillis % (1000 * 60)) / 1000),
                };
            } else { // Fallback duration if calculation is off
                duration = { hours: 1 };
            }
          }
          
          const icsEvent: ics.EventAttributes = {
            title,
            description,
            start: startArray,
            startInputType: 'local', // Assuming dates from DB are local, adjust if they are UTC
            // Prefer duration for allDay, or if endDate is explicitly not set.
            // If endDate is set and not allDay, use endArray.
            // Non-null assertions are used here because the preceding logic ensures
            // duration and endArray are defined when their respective paths are taken.
            ...(event.allDay || !event.endDate 
                ? { duration: duration! } 
                : { end: endArray!, endInputType: 'local' }),
            created: [
              createdDate.getFullYear(),
              createdDate.getMonth() + 1,
              createdDate.getDate(),
              createdDate.getHours(),
              createdDate.getMinutes()
            ],
            lastModified: [
              updatedDate.getFullYear(),
              updatedDate.getMonth() + 1,
              updatedDate.getDate(),
              updatedDate.getHours(),
              updatedDate.getMinutes()
            ],
            uid: event.id || `socialdashboard-event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            categories: event.source ? [event.source === 'ai' ? 'AI Generated' : 'Manual'] : ['General'],
            status: 'CONFIRMED', // Default status, can be made dynamic if needed
            productId: 'SocialDashboard/CalendarExport',
          };
          // Add organizer if user info is available and relevant
          // Example: organizer: { name: 'User Name', email: 'user@example.com' },
          return icsEvent;

        } catch (err) {
          console.error(`ICS export: Error processing event ${event?.id} for user ${userId}:`, err);
          return null; // Skip events that cause errors
        }
      })
      .filter(event => event !== null) as ics.EventAttributes[];

    // If all events were filtered out due to errors/missing data, return an empty calendar
    if (icsEvents.length === 0) {
      console.log(`ICS export: No valid events to export for user ${userId} after processing. Returning empty calendar.`);
      const { error, value } = ics.createEvents([]);
      const icsContent = value || 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SocialDashboard//EN\nEND:VCALENDAR';
      return new NextResponse(icsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="content-calendar-${userId}.ics"`,
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      });
    }

    // Create ICS file content
    const { error, value } = ics.createEvents(icsEvents);
    
    if (error || !value) {
      console.error(`ICS export: Critical error creating ICS file for user ${userId}:`, error, { 
        originalEventCount: calendarEvents.length,
        processedEventCount: icsEvents.length
      });
      // Fallback to sending an empty calendar on critical error to avoid 500 if possible
      const icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SocialDashboard//EN\nEND:VCALENDAR';
      return new NextResponse(icsContent, {
        status: 500, // Still indicate server error, but provide a (potentially empty) ICS
        headers: { 
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="error-calendar-${userId}.ics"`,
         }
      });
    }

    // Return ICS file with appropriate headers
    return new NextResponse(value, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="content-calendar-${userId}.ics"`,
        'Cache-Control': 'no-store, max-age=0, must-revalidate' // Ensure fresh data
      }
    });

  } catch (error) {
    // Enhanced error logging for unexpected errors in the overall try-catch
    console.error(`ICS export: Unhandled exception for user ${context.params.userId || 'unknown'}:`, error);
    
    // Return a user-friendly error response, but try to provide a minimal ICS if possible
    const icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SocialDashboard//EN\nEND:VCALENDAR';
    return new NextResponse(icsContent, {
      status: 500,
      headers: { 
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="error-calendar-${context.params.userId || 'unknown'}.ics"`,
        // No Cache-Control here as it's an error response
       }
    });
  }
}