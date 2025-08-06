import User from '../models/User.js';
import Event from '../models/Event.js';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Tech enthusiast and event organizer',
        location: 'Istanbul, Turkey'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Photography lover and community builder',
        location: 'Ankara, Turkey'
      },
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        password: 'password123',
        bio: 'Startup founder and networking expert',
        location: 'Istanbul, Turkey'
      }
    ]);

    console.log('✅ Sample users created');

    // Create sample events
    const events = [
      {
        name: 'Tech Meetup Istanbul',
        description: 'Join us for an exciting tech meetup in the heart of Istanbul. Network with fellow developers and learn about the latest trends in technology, AI, and web development.',
        date: '2025-02-15',
        time: '18:00',
        location: 'Beyoğlu, Istanbul',
        image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        maxAttendees: 30,
        tags: ['Tech', 'Networking', 'Business'],
        creator: users[0]._id,
        attendees: [
          { user: users[0]._id },
          { user: users[1]._id },
          { user: users[2]._id }
        ]
      },
      {
        name: 'Coffee & Code',
        description: 'Casual coding session over coffee. Bring your laptop and work on personal projects while meeting new people in the tech community.',
        date: '2025-02-12',
        time: '14:00',
        location: 'Kadıköy, Istanbul',
        image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        maxAttendees: 15,
        tags: ['Tech', 'Casual'],
        creator: users[0]._id,
        attendees: [
          { user: users[0]._id },
          { user: users[1]._id }
        ]
      },
      {
        name: 'Startup Pitch Night',
        description: 'Present your startup ideas or listen to innovative pitches from aspiring entrepreneurs. Great networking opportunity for founders and investors.',
        date: '2025-02-20',
        time: '19:30',
        location: 'Şişli, Istanbul',
        image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        maxAttendees: 50,
        tags: ['Business', 'Networking'],
        creator: users[1]._id,
        attendees: [
          { user: users[1]._id },
          { user: users[0]._id }
        ]
      },
      {
        name: 'Photography Walk',
        description: 'Explore the beautiful streets of Istanbul while practicing photography skills. All levels welcome! We\'ll visit historic neighborhoods and capture stunning shots.',
        date: '2025-02-18',
        time: '10:00',
        location: 'Sultanahmet, Istanbul',
        image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
        maxAttendees: 20,
        tags: ['Photography', 'Art', 'Casual'],
        creator: users[2]._id,
        attendees: [
          { user: users[2]._id },
          { user: users[0]._id },
          { user: users[1]._id }
        ]
      }
    ];

    await Event.create(events);
    console.log('✅ Sample events created');
    console.log('✅ Database seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};