import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Get user stats
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM events WHERE creator_id = ?) as events_created,
      (SELECT COUNT(*) FROM event_attendees WHERE user_id = ?) as events_joined,
      (SELECT COUNT(DISTINCT ea2.user_id) 
       FROM events e 
       JOIN event_attendees ea1 ON e.id = ea1.event_id 
       JOIN event_attendees ea2 ON e.id = ea2.event_id 
       WHERE ea1.user_id = ? AND ea2.user_id != ?) as connections
  `;

  db.get(statsQuery, [userId, userId, userId, userId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }

    // Get recent activity
    const activityQuery = `
      SELECT 
        'created' as type,
        e.name as event_name,
        e.id as event_id,
        e.created_at as timestamp
      FROM events e
      WHERE e.creator_id = ?
      
      UNION ALL
      
      SELECT 
        'joined' as type,
        e.name as event_name,
        e.id as event_id,
        ea.joined_at as timestamp
      FROM event_attendees ea
      JOIN events e ON ea.event_id = e.id
      WHERE ea.user_id = ? AND e.creator_id != ?
      
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    db.all(activityQuery, [userId, userId, userId], (err, activities) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user activity' });
      }

      res.json({
        user: req.user,
        stats: {
          eventsCreated: stats.events_created || 0,
          eventsJoined: stats.events_joined || 0,
          connections: stats.connections || 0
        },
        recentActivity: activities || []
      });
    });
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { name, bio, location } = req.body;

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    params.push(bio);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    params.push(location);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      error: 'No updates provided',
      message: 'Please provide at least one field to update'
    });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(userId);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Get updated user data
    db.get(
      'SELECT id, name, email, avatar, bio, location FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated profile' });
        }

        res.json({
          message: 'Profile updated successfully',
          user
        });
      }
    );
  });
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'New password must be at least 6 characters long'
    });
  }

  // Get current password hash
  db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid current password',
          message: 'The current password you entered is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }

          res.json({ message: 'Password updated successfully' });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Server error during password update' });
    }
  });
});

// Get user's created events
router.get('/events/created', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { limit = 10, offset = 0 } = req.query;

  const query = `
    SELECT 
      e.*,
      COUNT(ea.user_id) as attendee_count,
      GROUP_CONCAT(et.tag) as tags
    FROM events e
    LEFT JOIN event_attendees ea ON e.id = ea.event_id
    LEFT JOIN event_tags et ON e.id = et.event_id
    WHERE e.creator_id = ?
    GROUP BY e.id
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [userId, parseInt(limit), parseInt(offset)], (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch created events' });
    }

    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      maxAttendees: event.max_attendees,
      attendees: event.attendee_count || 0,
      tags: event.tags ? event.tags.split(',') : [],
      createdAt: event.created_at,
      updatedAt: event.updated_at
    }));

    res.json({ events: formattedEvents });
  });
});

// Get user's joined events
router.get('/events/joined', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { limit = 10, offset = 0 } = req.query;

  const query = `
    SELECT 
      e.*,
      u.name as creator_name,
      COUNT(ea2.user_id) as attendee_count,
      GROUP_CONCAT(et.tag) as tags,
      ea.joined_at
    FROM event_attendees ea
    JOIN events e ON ea.event_id = e.id
    JOIN users u ON e.creator_id = u.id
    LEFT JOIN event_attendees ea2 ON e.id = ea2.event_id
    LEFT JOIN event_tags et ON e.id = et.event_id
    WHERE ea.user_id = ?
    GROUP BY e.id, u.name, ea.joined_at
    ORDER BY ea.joined_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [userId, parseInt(limit), parseInt(offset)], (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch joined events' });
    }

    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      maxAttendees: event.max_attendees,
      attendees: event.attendee_count || 0,
      creator: event.creator_name,
      tags: event.tags ? event.tags.split(',') : [],
      joinedAt: event.joined_at,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    }));

    res.json({ events: formattedEvents });
  });
});

export default router;