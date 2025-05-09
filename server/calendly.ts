
import axios from 'axios';

const CALENDLY_BASE_URL = 'https://api.calendly.com/';
const CALENDLY_ACCESS_TOKEN = process.env.CALENDLY_ACCESS_TOKEN;
const CALENDLY_USER_URI = process.env.CALENDLY_USER_URI;

// Initialize axios instance for Calendly API
const calendlyApi = axios.create({
  baseURL: CALENDLY_BASE_URL,
  headers: {
    'Authorization': `Bearer ${CALENDLY_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get user information
export async function getCurrentUser() {
  try {
    if (!CALENDLY_USER_URI) {
      throw new Error('Missing Calendly user URI');
    }
    const userUuid = CALENDLY_USER_URI.split('/').pop();
    const response = await calendlyApi.get(`users/${userUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly user:', error);
    throw error;
  }
}

// Get scheduled events
export async function getScheduledEvents(startTime?: string, endTime?: string) {
  try {
    if (!CALENDLY_USER_URI) {
      throw new Error('Missing Calendly user URI');
    }
    
    const params: any = {
      user: CALENDLY_USER_URI,
      count: 100
    };
    
    if (startTime) params.min_start_time = startTime;
    if (endTime) params.max_start_time = endTime;
    
    const response = await calendlyApi.get('scheduled_events', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly events:', error);
    throw error;
  }
}

// Get event types (appointment types)
export async function getEventTypes() {
  try {
    if (!CALENDLY_USER_URI) {
      throw new Error('Missing Calendly user URI');
    }
    
    const response = await calendlyApi.get('event_types', { 
      params: { user: CALENDLY_USER_URI }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly event types:', error);
    throw error;
  }
}

// Get event details
export async function getEventDetails(eventUuid: string) {
  try {
    const response = await calendlyApi.get(`scheduled_events/${eventUuid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly event details:', error);
    throw error;
  }
}

// Get event invitees (attendees)
export async function getEventInvitees(eventUuid: string) {
  try {
    const response = await calendlyApi.get(`scheduled_events/${eventUuid}/invitees`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Calendly event invitees:', error);
    throw error;
  }
}

// Create a webhook subscription to receive event notifications
export async function createWebhook(url: string, events: string[] = ['invitee.created', 'invitee.canceled']) {
  try {
    const response = await calendlyApi.post('webhook_subscriptions', {
      url,
      events,
      organization: CALENDLY_USER_URI?.replace('users', 'organizations'),
      scope: 'user',
      user: CALENDLY_USER_URI
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Calendly webhook:', error);
    throw error;
  }
}

// Sync Calendly events to local database
export async function syncCalendlyEvents() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get events from today onwards
    const events = await getScheduledEvents(today.toISOString());
    
    // Return the events (in a real implementation, you would save these to your database)
    return events;
  } catch (error) {
    console.error('Error syncing Calendly events:', error);
    throw error;
  }
}

export default {
  getCurrentUser,
  getScheduledEvents,
  getEventTypes,
  getEventDetails,
  getEventInvitees,
  createWebhook,
  syncCalendlyEvents
};
