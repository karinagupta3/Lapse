import * as Calendar from 'expo-calendar';
import { Task } from '../types/tasks';

async function getOrCreateCalendar() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find(cal => 
    cal.accessLevel === 'owner' && 
    cal.source.name === 'Default'
  );

  if (defaultCalendar) {
    return defaultCalendar;
  }

  // Create a new calendar
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'Lapse Calendar',
    color: '#6366F1',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: calendars?.[0]?.source.id,
    source: {
      isLocalAccount: true,
      name: 'Lapse Calendar',
      type: 'LOCAL',
    },
    name: 'Lapse Calendar',
    ownerAccount: 'personal',
    accessLevel: 'owner',
  });

  const allCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return allCalendars.find(cal => cal.id === newCalendarID);
}

export async function addTasksToCalendar(tasks: Task[]) {
  try {
    const calendar = await getOrCreateCalendar();
    if (!calendar) {
      console.log('Could not access or create calendar');
      return false;
    }

    // Start from tomorrow at 9 AM
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0);

    for (const task of tasks) {
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + task.duration);

      await Calendar.createEventAsync(calendar.id, {
        title: task.title,
        startDate,
        endDate,
        notes: task.description,
        timeZone: 'America/New_York',
        alarms: [{
          relativeOffset: -15, // Reminder 15 minutes before
          method: Calendar.AlarmMethod.ALERT,
        }],
      });

      // Next task starts 30 minutes after the previous one ends
      startDate.setTime(endDate.getTime() + 30 * 60000);
    }

    return true;
  } catch (error) {
    console.error('Error adding tasks to calendar:', error);
    return false;
  }
}
