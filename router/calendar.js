import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';


const calendarEl = document.getElementById('calendar');

const calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, googleCalendarPlugin],
  googleCalendarApiKey: 'TON_API_KEY_GOOGLE', // Clé API Google Calendar
  events: {
    googleCalendarId: 'ton_id_google_calendar@group.calendar.google.com', // ID du calendrier Google
  },
  initialView: 'dayGridMonth', // Vue par défaut (mois)
});

calendar.render();
