import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, createEventSchema, updateEventSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all events with optional filtering
router.get('/', optionalAuth, (req, res) => {
  const { search, tag, location, date, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT 
      e.*,
      u.name as creator_name,
      COUNT(ea.user_id) as attendee_count,
      GROUP_CONCAT(et.tag) as tags
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    LEFT JOIN event_attendees ea ON e.id = ea.event_id
    LEFT JOIN event_tags et ON e.id = et.event_id
  `;
  
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(e.name LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (tag) {
    conditions.push('e.id IN (SELECT event_id FROM event_tags WHERE tag = ?)');
    params.push(tag);
  }

  if (location) {
    conditions.push('e.location LIKE ?');
    params.push(`%${location}%`);
  }

  if (date) {
    conditions.push('e.date = ?');
    params.push(date);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += `
    GROUP BY e.id, u.name
    ORDER BY e.date ASC, e.time ASC
    LIMIT ? OFFSET ?
  `;
  
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Format events data
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
      creatorId: event.creator_id,
      tags: event.tags ? event.tags.split(',') : [],
      createdAt: event.created_at,
      updatedAt: event.updated_at
    }));

    res.json({
      events: formattedEvents,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedEvents.length
      }
    });
  });
});

// Get single event by ID
router.get('/:id', optionalAuth, (req, res) => {
  const eventId = req.params.id;

  const query = `
    SELECT 
      e.*,
      u.name as creator_name,
      u.email as creator_email,
      COUNT(ea.user_id) as attendee_count,
      GROUP_CONCAT(et.tag) as tags
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    LEFT JOIN event_attendees ea ON e.id = ea.event_id
    LEFT JOIN event_tags et ON e.id = et.event_id
    WHERE e.id = ?
    GROUP BY e.id, u.name, u.email
  `;

  db.get(query, [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch event' });
    }

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if current user is attending
    let isAttending = false;
    if (req.user) {
      db.get(
        'SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?',
        [eventId, req.user.id],
        (err, attendance) => {
          if (!err && attendance) {
            isAttending = true;
          }

          // Get attendees list
          db.all(
            `SELECT u.id, u.name, u.avatar, ea.joined_at 
             FROM event_attendees ea 
             JOIN users u ON ea.user_id = u.id 
             WHERE ea.event_id = ? 
             ORDER BY ea.joined_at ASC`,
            [eventId],
            (err, attendees) => {
              const formattedEvent = {
                id: event.id,
                name: event.name,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                image: event.image,
                maxAttendees: event.max_attendees,
                attendees: event.attendee_count || 0,
                creator: {
                  id: event.creator_id,
                  name: event.creator_name,
                  email: event.creator_email
                },
                tags: event.tags ? event.tags.split(',') : [],
                isAttending,
                attendeesList: attendees || [],
                createdAt: event.created_at,
                updatedAt: event.updated_at
              };

              res.json({ event: formattedEvent });
            }
          );
        }
      );
    } else {
      const formattedEvent = {
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image,
        maxAttendees: event.max_attendees,
        attendees: event.attendee_count || 0,
        creator: {
          id: event.creator_id,
          name: event.creator_name,
          email: event.creator_email
        },
        tags: event.tags ? event.tags.split(',') : [],
        isAttending: false,
        attendeesList: [],
        createdAt: event.created_at,
        updatedAt: event.updated_at
      };

      res.json({ event: formattedEvent });
    }
  });
});

// Create new event
router.post('/', authenticateToken, validate(createEventSchema), (req, res) => {
  const { name, description, date, time, location, image, maxAttendees, tags } = req.body;
  const creatorId = req.user.id;

  // Validate date is not in the past
  const eventDate = new Date(`${date}T${time}`);
  if (eventDate < new Date()) {
    return res.status(400).json({
      error: 'Invalid date',
      message: 'Event date cannot be in the past'
    });
  }

  db.run(
    `INSERT INTO events (name, description, date, time, location, image, max_attendees, creator_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description, date, time, location, image || null, maxAttendees, creatorId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create event' });
      }

      const eventId = this.lastID;

      // Insert tags if provided
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tag => 
          new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO event_tags (event_id, tag) VALUES (?, ?)',
              [eventId, tag.trim()],
              (err) => err ? reject(err) : resolve()
            );
          })
        );

        Promise.all(tagInserts)
          .then(() => {
            // Automatically join creator to the event
            db.run(
              'INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)',
              [eventId, creatorId],
              (err) => {
                if (err) {
                  console.error('Failed to add creator as attendee:', err);
                }

                res.status(201).json({
                  message: 'Event created successfully',
                  event: {
                    id: eventId,
                    name,
                    description,
                    date,
                    time,
                    location,
                    image,
                    maxAttendees,
                    attendees: 1,
                    creator: req.user.name,
                    creatorId,
                    tags: tags || []
                  }
                });
              }
            );
          })
          .catch(() => {
            res.status(500).json({ error: 'Failed to add event tags' });
          });
      } else {
        // No tags, just add creator as attendee
        db.run(
          'INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)',
          [eventId, creatorId],
          (err) => {
            if (err) {
              console.error('Failed to add creator as attendee:', err);
            }

            res.status(201).json({
              message: 'Event created successfully',
              event: {
                id: eventId,
                name,
                description,
                date,
                time,
                location,
                image,
                maxAttendees,
                attendees: 1,
                creator: req.user.name,
                creatorId,
                tags: []
              }
            });
          }
        );
      }
    }
  );
});

// Join event
router.post('/:id/join', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if event exists and get current attendee count
  db.get(
    `SELECT e.*, COUNT(ea.user_id) as current_attendees 
     FROM events e 
     LEFT JOIN event_attendees ea ON e.id = ea.event_id 
     WHERE e.id = ? 
     GROUP BY e.id`,
    [eventId],
    (err, event) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!event) {
        return res.status(404).json({ 
          error: 'Event not found',
          message: 'The requested event does not exist'
        });
      }

      // Check if event is full
      if (event.current_attendees >= event.max_attendees) {
        return res.status(400).json({
          error: 'Event is full',
          message: 'This event has reached maximum capacity'
        });
      }

      // Check if user is already attending
      db.get(
        'SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?',
        [eventId, userId],
        (err, existingAttendance) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (existingAttendance) {
            return res.status(400).json({
              error: 'Already joined',
              message: 'You are already attending this event'
            });
          }

          // Add user to event
          db.run(
            'INSERT INTO event_attendees (event_id, user_id) VALUES (?, ?)',
            [eventId, userId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to join event' });
              }

              res.json({
                message: 'Successfully joined event',
                attendeeId: this.lastID
              });
            }
          );
        }
      );
    }
  );
});

// Leave event
router.delete('/:id/leave', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if user is attending
  db.get(
    'SELECT id FROM event_attendees WHERE event_id = ? AND user_id = ?',
    [eventId, userId],
    (err, attendance) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!attendance) {
        return res.status(400).json({
          error: 'Not attending',
          message: 'You are not attending this event'
        });
      }

      // Remove user from event
      db.run(
        'DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?',
        [eventId, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to leave event' });
          }

          res.json({
            message: 'Successfully left event'
          });
        }
      );
    }
  );
});

// Update event (only creator can update)
router.put('/:id', authenticateToken, validate(updateEventSchema), (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if user is the creator
  db.get('SELECT creator_id FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    if (event.creator_id !== userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the event creator can update this event'
      });
    }

    const { name, description, date, time, location, image, maxAttendees, tags } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }
    if (time) {
      updates.push('time = ?');
      params.push(time);
    }
    if (location) {
      updates.push('location = ?');
      params.push(location);
    }
    if (image !== undefined) {
      updates.push('image = ?');
      params.push(image);
    }
    if (maxAttendees) {
      updates.push('max_attendees = ?');
      params.push(maxAttendees);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(eventId);

    if (updates.length === 1) { // Only timestamp update
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide at least one field to update'
      });
    }

    const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update event' });
      }

      // Update tags if provided
      if (tags) {
        // Delete existing tags
        db.run('DELETE FROM event_tags WHERE event_id = ?', [eventId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update event tags' });
          }

          // Insert new tags
          if (tags.length > 0) {
            const tagInserts = tags.map(tag => 
              new Promise((resolve, reject) => {
                db.run(
                  'INSERT INTO event_tags (event_id, tag) VALUES (?, ?)',
                  [eventId, tag.trim()],
                  (err) => err ? reject(err) : resolve()
                );
              })
            );

            Promise.all(tagInserts)
              .then(() => {
                res.json({ message: 'Event updated successfully' });
              })
              .catch(() => {
                res.status(500).json({ error: 'Failed to update event tags' });
              });
          } else {
            res.json({ message: 'Event updated successfully' });
          }
        });
      } else {
        res.json({ message: 'Event updated successfully' });
      }
    });
  });
});

// Delete event (only creator can delete)
router.delete('/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  // Check if user is the creator
  db.get('SELECT creator_id FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    if (event.creator_id !== userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the event creator can delete this event'
      });
    }

    // Delete event (cascading will handle attendees and tags)
    db.run('DELETE FROM events WHERE id = ?', [eventId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete event' });
      }

      res.json({ message: 'Event deleted successfully' });
    });
  });
});

export default router;