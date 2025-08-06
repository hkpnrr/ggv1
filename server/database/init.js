import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'events.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📦 Connected to SQLite database');
  }
});

// Initialize database tables
export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          avatar TEXT,
          bio TEXT,
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          location TEXT NOT NULL,
          image TEXT,
          max_attendees INTEGER NOT NULL DEFAULT 50,
          creator_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Event tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS event_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          tag TEXT NOT NULL,
          FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
        )
      `);

      // Event attendees table
      db.run(`
        CREATE TABLE IF NOT EXISTS event_attendees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          status TEXT DEFAULT 'joined',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(event_id, user_id)
        )
      `);

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_event_tags_event ON event_tags(event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendees_event ON event_attendees(event_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_attendees_user ON event_attendees(user_id)`);

      // Insert sample data
      insertSampleData();

      console.log('✅ Database tables initialized');
      resolve();
    });
  });
};

// Insert sample data
const insertSampleData = () => {
  // Check if users already exist
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      // Insert sample users
      const users = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          bio: 'Tech enthusiast and event organizer',
          location: 'Istanbul, Turkey'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          bio: 'Photography lover and community builder',
          location: 'Ankara, Turkey'
        },
        {
          name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          bio: 'Startup founder and networking expert',
          location: 'Istanbul, Turkey'
        }
      ];

      users.forEach((user, index) => {
        db.run(
          `INSERT INTO users (name, email, password, bio, location) VALUES (?, ?, ?, ?, ?)`,
          [user.name, user.email, user.password, user.bio, user.location],
          function(err) {
            if (err) {
              console.error('Error inserting user:', err);
            } else if (index === 0) {
              // Insert sample events for the first user
              insertSampleEvents(this.lastID);
            }
          }
        );
      });
    }
  });
};

// Insert sample events
const insertSampleEvents = (userId) => {
  const events = [
    {
      name: 'Tech Meetup Istanbul',
      description: 'Join us for an exciting tech meetup in the heart of Istanbul. Network with fellow developers and learn about the latest trends in technology, AI, and web development.',
      date: '2025-02-15',
      time: '18:00',
      location: 'Beyoğlu, Istanbul',
      image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      max_attendees: 30,
      tags: ['Tech', 'Networking', 'Business']
    },
    {
      name: 'Coffee & Code',
      description: 'Casual coding session over coffee. Bring your laptop and work on personal projects while meeting new people in the tech community.',
      date: '2025-02-12',
      time: '14:00',
      location: 'Kadıköy, Istanbul',
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      max_attendees: 15,
      tags: ['Tech', 'Casual']
    },
    {
      name: 'Startup Pitch Night',
      description: 'Present your startup ideas or listen to innovative pitches from aspiring entrepreneurs. Great networking opportunity for founders and investors.',
      date: '2025-02-20',
      time: '19:30',
      location: 'Şişli, Istanbul',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      max_attendees: 50,
      tags: ['Business', 'Networking']
    },
    {
      name: 'Photography Walk',
      description: 'Explore the beautiful streets of Istanbul while practicing photography skills. All levels welcome! We\'ll visit historic neighborhoods and capture stunning shots.',
      date: '2025-02-18',
      time: '10:00',
      location: 'Sultanahmet, Istanbul',
      image: 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      max_attendees: 20,
      tags: ['Photography', 'Art', 'Casual']
    }
  ];

  events.forEach((event) => {
    db.run(
      `INSERT INTO events (name, description, date, time, location, image, max_attendees, creator_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [event.name, event.description, event.date, event.time, event.location, event.image, event.max_attendees, userId],
      function(err) {
        if (err) {
          console.error('Error inserting event:', err);
        } else {
          // Insert tags for this event
          event.tags.forEach(tag => {
            db.run(
              `INSERT INTO event_tags (event_id, tag) VALUES (?, ?)`,
              [this.lastID, tag]
            );
          });

          // Add some sample attendees
          const attendeeCount = Math.floor(Math.random() * (event.max_attendees / 2)) + 1;
          for (let i = 0; i < attendeeCount; i++) {
            const attendeeUserId = (i % 3) + 1; // Cycle through user IDs 1, 2, 3
            if (attendeeUserId !== userId) { // Don't add creator as attendee
              db.run(
                `INSERT OR IGNORE INTO event_attendees (event_id, user_id) VALUES (?, ?)`,
                [this.lastID, attendeeUserId]
              );
            }
          }
        }
      }
    );
  });

  console.log('✅ Sample data inserted');
};

export default db;