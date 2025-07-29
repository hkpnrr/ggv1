import axios from 'axios';

// Mock data
const mockEvents = [
  {
    id: 1,
    name: 'Tech Meetup Istanbul',
    description: 'Join us for an exciting tech meetup in the heart of Istanbul. Network with fellow developers and learn about the latest trends.',
    date: '2025-02-15',
    time: '18:00',
    location: 'Beyoğlu, Istanbul',
    creator: 'Ahmet Yılmaz',
    attendees: 12,
    maxAttendees: 30,
    image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tags: ['Tech', 'Networking', 'Business']
  },
  {
    id: 2,
    name: 'Coffee & Code',
    description: 'Casual coding session over coffee. Bring your laptop and work on personal projects while meeting new people.',
    date: '2025-02-12',
    time: '14:00',
    location: 'Kadıköy, Istanbul',
    creator: 'Zeynep Kaya',
    attendees: 8,
    maxAttendees: 15,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tags: ['Tech', 'Casual']
  },
  {
    id: 3,
    name: 'Startup Pitch Night',
    description: 'Present your startup ideas or listen to innovative pitches from aspiring entrepreneurs.',
    date: '2025-02-20',
    time: '19:30',
    location: 'Şişli, Istanbul',
    creator: 'Mehmet Demir',
    attendees: 25,
    maxAttendees: 50,
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tags: ['Business', 'Networking']
  },
  {
    id: 4,
    name: 'Photography Walk',
    description: 'Explore the beautiful streets of Istanbul while practicing photography skills. All levels welcome!',
    date: '2025-02-18',
    time: '10:00',
    location: 'Sultanahmet, Istanbul',
    creator: 'Elif Özkan',
    attendees: 6,
    maxAttendees: 20,
    image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tags: ['Photography', 'Art', 'Casual']
  }
];

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

// Create axios instance
const api = axios.create({
  baseURL: 'https://api.gelengelsin.com', // Mock URL
  timeout: 5000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock API functions
export const authAPI = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password
    };
    
    mockUsers.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + newUser.id
    };
  }
};

export const eventsAPI = {
  getEvents: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEvents;
  },

  createEvent: async (eventData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newEvent = {
      id: mockEvents.length + 1,
      ...eventData,
      creator: 'Current User', // In real app, this would come from auth
      attendees: 1,
      maxAttendees: eventData.maxAttendees || 50
    };
    
    mockEvents.push(newEvent);
    return newEvent;
  },

  joinEvent: async (eventId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const event = mockEvents.find(e => e.id === eventId);
    if (event && event.attendees < event.maxAttendees) {
      event.attendees += 1;
      return event;
    } else {
      throw new Error('Cannot join event');
    }
  }
};

export default api;