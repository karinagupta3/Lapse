import { OPENAI_API_KEY } from '@env';
import OpenAI from 'openai';

// For demo purposes, we'll use the fallback system instead of the API
const USE_FALLBACK_ONLY = false;

// Check if API key is valid
if (!USE_FALLBACK_ONLY && (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '' || OPENAI_API_KEY.includes('your-api-key'))) {
  console.error('Invalid OpenAI API key. Please check your .env file.');
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Provide a fallback response when API is unavailable
function getFallbackResponse(message: string, scheduleInfo?: string): string {
  const lowerMessage = message.toLowerCase();
  
  // General knowledge and advice responses
  
  // Productivity advice
  if (lowerMessage.includes('productivity') || lowerMessage.includes('efficient') || lowerMessage.includes('get more done')) {
    return `To boost productivity, try the Pomodoro technique (25 minutes of focused work followed by a 5-minute break), 
      minimize distractions by turning off notifications, and prioritize your most important tasks early in the day 
      when your energy is highest. For neurodivergent individuals, creating a structured environment with visual cues 
      and reminders can be especially helpful.`;
  }
  
  // Mental health advice
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('overwhelm')) {
    return `When feeling overwhelmed, try the 5-4-3-2-1 grounding technique: acknowledge 5 things you see, 
      4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste. 
      Deep breathing exercises and short mindfulness breaks can also help reduce stress. 
      Remember that it's okay to take breaks and practice self-compassion.`;
  }
  
  // ADHD specific advice
  if (lowerMessage.includes('adhd') || lowerMessage.includes('focus') || lowerMessage.includes('distract')) {
    return `For ADHD management, try body doubling (working alongside someone else), using timers for tasks, 
      breaking large tasks into smaller steps, and creating external structure through visual schedules. 
      The "body scan" technique can help you notice when you're getting distracted. Also, incorporating 
      movement breaks can help maintain focus during longer work sessions.`;
  }
  
  // Autism specific advice
  if (lowerMessage.includes('autism') || lowerMessage.includes('asd') || lowerMessage.includes('sensory')) {
    return `For sensory management, consider creating a dedicated low-stimulus workspace, using noise-cancelling 
      headphones, adjustable lighting, and comfortable seating. Having a consistent routine can reduce cognitive 
      load, and using visual schedules can help with transitions between activities. Remember to schedule regular 
      breaks to prevent sensory overload.`;
  }
  
  // Sleep advice
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('rest')) {
    return `For better sleep, maintain a consistent sleep schedule, create a relaxing bedtime routine, 
      limit screen time before bed, ensure your sleeping environment is comfortable, dark and quiet, 
      and avoid caffeine and heavy meals close to bedtime. If racing thoughts keep you awake, 
      try a "brain dump" journal before sleeping.`;
  }
  
  // Exercise advice
  if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
    return `Regular exercise is crucial for both physical and mental health. Even short 10-minute movement 
      breaks throughout the day can boost mood and energy. Find activities you enjoy - walking, dancing, 
      yoga, or strength training. For neurodivergent individuals, activities with predictable patterns 
      like swimming laps or cycling can be particularly beneficial.`;
  }
  
  // Nutrition advice
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
    return `Balanced nutrition supports brain function and energy levels. Try to include protein with each 
      meal for sustained energy, stay hydrated, and consider meal planning to reduce decision fatigue. 
      Some neurodivergent individuals benefit from setting meal reminders and keeping easy-to-prepare 
      options available for low-energy days.`;
  }
  
  // Social advice
  if (lowerMessage.includes('social') || lowerMessage.includes('friend') || lowerMessage.includes('people') || lowerMessage.includes('talk')) {
    return `Social connections are important for wellbeing. Quality matters more than quantity - focus on 
      relationships that feel supportive and energizing. It's okay to set boundaries and take breaks from 
      social activities when needed. Consider scheduling regular check-ins with friends to maintain 
      connections without feeling overwhelmed.`;
  }
  
  // If schedule info is provided, use it to give context-aware responses
  if (scheduleInfo) {
    // Check if this is a follow-up question
    const isFollowUp = scheduleInfo.includes('is_follow_up: true');
    const previousContext = scheduleInfo.includes('previous_context:') ? 
      scheduleInfo.split('previous_context: ')[1].split('|')[0] : '';
    
    // Handle follow-up questions specifically
    if (isFollowUp) {
      // Study-related follow-up
      if (lowerMessage.includes('study') || lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
        const workSlot = scheduleInfo.includes('work slot available:') ? 
          scheduleInfo.split('work slot available: ')[1].split('|')[0] :
          'in the morning between 9-11 AM';
          
        if (previousContext.includes('friend') || previousContext.includes('hang out')) {
          return `If you need to study today, I'd recommend doing it ${workSlot} before hanging out with friends. Morning hours are typically better for focused work when your mind is fresh.`;
        } else {
          return `For studying, I'd recommend blocking out time ${workSlot}. This is typically when your brain is most alert for focused work.`;
        }
      }
      
      // Friend-related follow-up
      if (lowerMessage.includes('friend') || lowerMessage.includes('hang out')) {
        const busyTimes = scheduleInfo.includes('busy times:') ? 
          scheduleInfo.split('busy times: ')[1].split('|')[0] :
          'your scheduled events';
          
        if (previousContext.includes('study') || previousContext.includes('work')) {
          return `After you finish studying, you could hang out with friends in the evening. If ${busyTimes === 'none' ? 'your schedule is open' : `you're busy with ${busyTimes}`}, I'd suggest meeting friends around 7 PM.`;
        }
      }
    }
    
    // For hangout/friend related questions
    if (lowerMessage.includes('friend') || lowerMessage.includes('hang out') || lowerMessage.includes('social')) {
      const busyTimes = scheduleInfo.includes('busy times:') ? 
        scheduleInfo.split('busy times: ')[1].split('|')[0] :
        'your scheduled events';
      
      if (busyTimes === 'none') {
        return "Your schedule is completely open today! You can hang out with friends anytime. Evening hours (after 6 PM) are often best for social activities.";
      } else {
        return `Based on your schedule, you're busy with ${busyTimes}. I'd recommend hanging out with friends after your commitments are done, perhaps in the evening around 7 PM.`;
      }
    }
    
    // For gym/exercise related questions
    if (lowerMessage.includes('gym') || lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      const availableSlot = scheduleInfo.includes('gym slot available') ? 
        scheduleInfo.split('gym slot available: ')[1].split('|')[0] :
        'between 5-7 PM today';
      
      return `Based on your schedule, I recommend going to the gym ${availableSlot}. This time slot is free and would be perfect for a workout session.`;
    }
    
    // For work/focus related questions
    if (lowerMessage.includes('work') || lowerMessage.includes('focus') || lowerMessage.includes('productive')) {
      const busyTimes = scheduleInfo.includes('busy times:') ? 
        scheduleInfo.split('busy times: ')[1].split('|')[0] :
        'your morning meetings';
      
      if (busyTimes === 'none') {
        return "Your schedule is completely open! For focused work, I recommend the morning hours between 9-11 AM when your mind is typically freshest.";
      } else {
        return `Looking at your schedule, you should plan focused work around ${busyTimes}. Try to block out at least 90 minutes of uninterrupted time.`;
      }
    }
    
    // For meeting/call related questions
    if (lowerMessage.includes('meeting') || lowerMessage.includes('call') || lowerMessage.includes('team')) {
      const meetingCount = scheduleInfo.includes('meeting count:') ? 
        scheduleInfo.split('meeting count: ')[1].split('|')[0] : 
        '0';
      
      if (meetingCount === '0') {
        return "You don't have any meetings scheduled today. If you need to schedule one, afternoons between 1-4 PM are typically good for team availability.";
      } else {
        return `I see you already have ${meetingCount} meeting(s) scheduled today. If you need to schedule another one, try finding a slot that doesn't conflict with your existing commitments.`;
      }
    }
    
    // For schedule overview questions
    if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('today') || lowerMessage.includes('what') || lowerMessage.includes('do i have')) {
      const summary = scheduleInfo.includes('schedule summary:') ? 
        scheduleInfo.split('schedule summary: ')[1].split('|')[0] : 
        'No events scheduled';
      
      if (summary === 'No events scheduled') {
        return "You don't have anything scheduled today! Your day is completely open for whatever you'd like to do.";
      } else {
        return `Here's what your day looks like: ${summary}.`;
      }
    }
    
    // For free time questions
    if (lowerMessage.includes('free') || lowerMessage.includes('available') || lowerMessage.includes('when can i')) {
      const busyTimes = scheduleInfo.includes('busy times:') ? 
        scheduleInfo.split('busy times: ')[1].split('|')[0] :
        'none';
      
      if (busyTimes === 'none') {
        return "You're completely free today! You can schedule anything you'd like at any time.";
      } else {
        return `You're busy with ${busyTimes}. Any other time today would be free for you to schedule something new.`;
      }
    }
  }
  
  // Default responses when no schedule info is available or no specific match
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I help with your schedule today? I can also provide advice on productivity, mental health, and neurodivergent-friendly strategies.';
  }
  
  // App-related questions
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('how do you work') || lowerMessage.includes('help me with')) {
    return 'I can help you manage your schedule, suggest optimal times for activities based on your calendar, provide advice on productivity, mental health, and neurodivergent-friendly strategies. Try asking me when to schedule a workout, how to manage stress, or for tips on staying focused with ADHD.';
  }
  
  // Time management questions
  if (lowerMessage.includes('time management') || lowerMessage.includes('manage my time') || lowerMessage.includes('prioritize')) {
    return `Effective time management starts with identifying your most important tasks (MITs) and tackling 
      them when your energy is highest. Consider using time blocking to dedicate specific periods for different 
      types of work. For neurodivergent individuals, visual timers and breaking tasks into 25-minute Pomodoro 
      sessions can be particularly helpful.`;
  }
  
  // Motivation questions
  if (lowerMessage.includes('motivation') || lowerMessage.includes('procrastinate') || lowerMessage.includes('start working')) {
    return `To boost motivation, try the "5-minute rule" - commit to just 5 minutes of a task, after which 
      you can decide whether to continue. Make tasks more appealing by connecting them to your values or adding 
      elements of play. Body doubling (working alongside someone else) can also help overcome procrastination.`;
  }
  
  // Executive function questions
  if (lowerMessage.includes('executive function') || lowerMessage.includes('planning') || lowerMessage.includes('organize')) {
    return `To support executive function, externalize as much as possible: use visual schedules, set timers 
      for transitions, create templates for recurring tasks, and use checklists. Breaking tasks into very 
      specific steps removes the cognitive load of figuring out "how" to do something. Consider using apps 
      like Lapse to provide external structure and reminders.`;
  }
  
  // App features questions
  if (lowerMessage.includes('points') || lowerMessage.includes('streak') || lowerMessage.includes('achievement')) {
    return `Lapse uses a points system to make productivity more engaging. You earn points by completing tasks, 
      with bonus points for maintaining streaks. These gamification elements tap into reward pathways that can 
      be especially motivating for neurodivergent brains. Check your achievements on the profile screen!`;
  }
  
  if (lowerMessage.includes('friend') || lowerMessage.includes('hang out') || lowerMessage.includes('social')) {
    return `For social activities, evenings after 6 PM are typically best when work commitments are done. 
      Weekends are also great for longer hangouts with friends. If you have specific friends in mind, consider 
      their schedules too - maybe suggest a few time options when inviting them.`;
  }
  
  if (lowerMessage.includes('gym') || lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
    return `For gym sessions, I recommend early morning (6-8 AM) or evening (5-7 PM). These times are great 
      for energy and consistency.`;
  }
  
  if (lowerMessage.includes('work') || lowerMessage.includes('focus') || lowerMessage.includes('productive')) {
    return `For focused work, try scheduling blocks between 9-11 AM when your mind is fresh. Use the Pomodoro 
      technique: 25 minutes of work followed by a 5-minute break.`;
  }
  
  if (lowerMessage.includes('meeting') || lowerMessage.includes('call') || lowerMessage.includes('team')) {
    return `Meetings are best scheduled in the afternoon (2-4 PM) when people have completed their focused 
      morning work. Keep them short and have a clear agenda.`;
  }
  
  if (lowerMessage.includes('break') || lowerMessage.includes('rest') || lowerMessage.includes('relax')) {
    return `Short breaks (5-15 minutes) should be taken every 1-2 hours. For longer breaks, try after lunch 
      when energy naturally dips.`;
  }
  
  if (lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('organize')) {
    return `When planning your day, start with your most important tasks in the morning. Group similar activities 
      together to minimize context switching. Leave buffer time between tasks for unexpected interruptions.`;
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('rest') || lowerMessage.includes('tired')) {
    return `Aim for 7-9 hours of sleep each night. Try to go to bed and wake up at consistent times. Avoid 
      screens 1 hour before bedtime for better sleep quality.`;
  }
  
  // Generic response for other queries
  return `I can help you find the best time for activities based on your schedule. Try asking about specific 
    activities like "When should I work out?" or "When do I have free time today?"`;
}

export async function callChatGPT(message: string, scheduleInfo?: string): Promise<string> {
  try {
    // Always use fallback for demo purposes
    if (USE_FALLBACK_ONLY) {
      return getFallbackResponse(message, scheduleInfo);
    }
    
    // Check if API key is available
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      return getFallbackResponse(message, scheduleInfo);
    }
    
    // Prepare system message with schedule context if available
    let systemContent = `You are a helpful productivity assistant integrated into the Lapse app. 
      When users mention activities like "gym", "work", or "study", suggest specific time slots based on these guidelines:
      - Early morning (6-8 AM) is good for gym and exercise
      - Mid-morning (9-11 AM) is ideal for focused work
      - Afternoon (2-4 PM) works well for meetings and collaborative tasks
      - Evening (5-7 PM) can be for gym or light work
      
      Keep your responses concise and friendly. Provide practical advice for time management, productivity, and maintaining flow state.
      
      IMPORTANT: Keep responses under 3-4 sentences maximum. Be direct and to the point.`;
    
    // Add schedule information if available
    if (scheduleInfo) {
      systemContent += `\n\nHere is the user's current schedule information:\n${scheduleInfo}`;
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() ?? 'No response from AI';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Use fallback response on error
    return getFallbackResponse(message, scheduleInfo);
  }
}
