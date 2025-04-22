import { create } from 'zustand';
import { scheduleEvents, ScheduleEvent } from './scheduleData';

interface ScheduleState {
  events: ScheduleEvent[];
  setEvents: (events: ScheduleEvent[]) => void;
  addEvent: (event: ScheduleEvent) => void;
  updateEvent: (id: string, event: Partial<ScheduleEvent>) => void;
  removeEvent: (id: string) => void;
  findAvailableTimeSlot: (duration: number, preferredType?: string) => { startTime: Date, endTime: Date } | null;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  events: [...scheduleEvents], // Initialize with sample data
  
  setEvents: (events) => set({ events }),
  
  addEvent: (event) => set((state) => {
    // Add the new event
    const newEvents = [...state.events, event];
    
    // Sort events by start time
    const sortedEvents = newEvents
      .filter(e => e.startTime && e.endTime) // Filter out invalid events
      .sort((a, b) => {
        try {
          return a.startTime.getTime() - b.startTime.getTime();
        } catch (error) {
          console.error('Error sorting events:', error);
          return 0;
        }
      });
    
    return { events: sortedEvents };
  }),
  
  updateEvent: (id, updatedEvent) => set((state) => ({
    events: state.events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    )
  })),
  
  removeEvent: (id) => set((state) => ({
    events: state.events.filter(event => event.id !== id)
  })),
  
  findAvailableTimeSlot: (duration, preferredType) => {
    try {
      const { events } = get();
      
      // Sort events by start time
      const sortedEvents = [...events]
        .filter(event => event.startTime && event.endTime) // Ensure dates are defined
        .sort((a, b) => 
          a.startTime.getTime() - b.startTime.getTime()
        );
      
      // Define the day's boundaries (6 AM to 10 PM)
      const today = new Date();
      const dayStart = new Date(today);
      dayStart.setHours(6, 0, 0, 0);
      
      const dayEnd = new Date(today);
      dayEnd.setHours(22, 0, 0, 0);
      
      // If it's already past 6 PM, suggest time for tomorrow
      const now = new Date();
      if (now.getHours() >= 18) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // Start at 9 AM tomorrow
        
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(tomorrow.getHours() + Math.floor(duration / 60), duration % 60, 0, 0);
        
        return { startTime: tomorrow, endTime: tomorrowEnd };
      }
      
      // Check for available slots between now and end of day
      let currentTime = now.getTime() > dayStart.getTime() ? now : dayStart;
      
      // Special handling for preferred types
      if (preferredType) {
        switch (preferredType.toLowerCase()) {
          case 'gym':
          case 'exercise':
          case 'workout': {
            // Preferred times for gym: early morning or evening
            const morningGymStart = new Date(today);
            morningGymStart.setHours(6, 0, 0, 0);
            const morningGymEnd = new Date(today);
            morningGymEnd.setHours(8, 0, 0, 0);
            
            const eveningGymStart = new Date(today);
            eveningGymStart.setHours(17, 0, 0, 0);
            const eveningGymEnd = new Date(today);
            eveningGymEnd.setHours(20, 0, 0, 0);
            
            // Check if morning slot is available and not in the past
            if (morningGymEnd.getTime() > now.getTime() && isTimeSlotAvailable(morningGymStart, morningGymEnd, sortedEvents, duration)) {
              const start = morningGymStart.getTime() < now.getTime() ? now : morningGymStart;
              const end = new Date(start.getTime() + duration * 60 * 1000);
              return { startTime: start, endTime: end };
            }
            
            // Check if evening slot is available
            if (isTimeSlotAvailable(eveningGymStart, eveningGymEnd, sortedEvents, duration)) {
              const start = eveningGymStart.getTime() < now.getTime() ? now : eveningGymStart;
              const end = new Date(start.getTime() + duration * 60 * 1000);
              return { startTime: start, endTime: end };
            }
            
            break;
          }
          case 'work':
          case 'focus':
          case 'study': {
            // Preferred times for focused work: morning
            const morningWorkStart = new Date(today);
            morningWorkStart.setHours(9, 0, 0, 0);
            const morningWorkEnd = new Date(today);
            morningWorkEnd.setHours(12, 0, 0, 0);
            
            // Check if morning slot is available and not in the past
            if (morningWorkEnd.getTime() > now.getTime() && isTimeSlotAvailable(morningWorkStart, morningWorkEnd, sortedEvents, duration)) {
              const start = morningWorkStart.getTime() < now.getTime() ? now : morningWorkStart;
              const end = new Date(start.getTime() + duration * 60 * 1000);
              return { startTime: start, endTime: end };
            }
            
            break;
          }
          case 'meeting':
          case 'call': {
            // Preferred times for meetings: afternoon
            const afternoonStart = new Date(today);
            afternoonStart.setHours(13, 0, 0, 0);
            const afternoonEnd = new Date(today);
            afternoonEnd.setHours(16, 0, 0, 0);
            
            // Check if afternoon slot is available and not in the past
            if (afternoonEnd.getTime() > now.getTime() && isTimeSlotAvailable(afternoonStart, afternoonEnd, sortedEvents, duration)) {
              const start = afternoonStart.getTime() < now.getTime() ? now : afternoonStart;
              const end = new Date(start.getTime() + duration * 60 * 1000);
              return { startTime: start, endTime: end };
            }
            
            break;
          }
        }
      }
      
      // If we get here, either there's no preferred type or the preferred slot wasn't available
      // Find any available slot
      for (let i = 0; i <= sortedEvents.length; i++) {
        const slotEnd = i < sortedEvents.length ? sortedEvents[i].startTime : dayEnd;
        
        // Calculate if this slot has enough time
        const availableDuration = (slotEnd.getTime() - currentTime.getTime()) / (60 * 1000);
        
        if (availableDuration >= duration) {
          // Found a slot with enough time
          const startTime = new Date(currentTime);
          const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
          return { startTime, endTime };
        }
        
        // Move to the end of this event for the next iteration
        if (i < sortedEvents.length) {
          currentTime = new Date(sortedEvents[i].endTime);
        }
      }
      
      // If no slot found today, suggest tomorrow morning
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // Start at 9 AM tomorrow
      
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(tomorrow.getHours() + Math.floor(duration / 60), duration % 60, 0, 0);
      
      return { startTime: tomorrow, endTime: tomorrowEnd };
    } catch (error) {
      console.error('Error finding available time slot:', error);
      return null;
    }
  },
}));

// Helper function to check if a time slot is available
function isTimeSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  events: ScheduleEvent[],
  durationMinutes: number
): boolean {
  // Check if the slot has enough duration
  const slotDuration = (slotEnd.getTime() - slotStart.getTime()) / (60 * 1000);
  if (slotDuration < durationMinutes) return false;
  
  // Filter out events with undefined dates
  const validEvents = events.filter(event => 
    event.startTime && event.endTime
  );
  
  // Check for conflicts with existing events
  for (const event of validEvents) {
    // If event overlaps with the slot
    if (
      (event.startTime >= slotStart && event.startTime < slotEnd) ||
      (event.endTime > slotStart && event.endTime <= slotEnd) ||
      (event.startTime <= slotStart && event.endTime >= slotEnd)
    ) {
      return false;
    }
  }
  
  return true;
}
