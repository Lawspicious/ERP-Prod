'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar'; // Import Google Calendar plugin
import { useAuth } from '@/context/user/userContext';
import useCalendarEvents from '@/hooks/useCalendarHook';

export const CalendarTest = () => {
  const { calendarEvents, adminCalendarEvents } = useCalendarEvents();
  const { authUser } = useAuth();

  const events = [
    ...calendarEvents.map((event) => ({
      title: event.title,
      start: event.start,
      url: event.url,
      color: event.color,
    })),
    ...adminCalendarEvents.map((event) => ({
      title: event.title,
      start: event.start,
      url: event.url,
      color: event.color,
    })),
  ];

  return (
    <div className="">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          listPlugin,
          googleCalendarPlugin,
        ]}
        googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY} // Use API key from environment
        eventSources={[
          {
            // googleCalendarId: authUser?.email as string, // Replace with your calendar ID
            googleCalendarId: authUser?.email as string,
            // className: 'gcal-event', // Optional class name for styling
          },

          { events },
        ]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        initialView="dayGridMonth"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
      />
    </div>
  );
};
