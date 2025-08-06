import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user stats
    const [eventsCreated, eventsJoined, totalEvents] = await Promise.all([
      Event.countDocuments({ creator: userId }),
      Event.countDocuments({ 'attendees.user': userId }),
      Event.find({ 'attendees.user': userId }).populate('attendees.user', '_id')
    ]);

    // Calculate connections (unique users from events the user has joined)
    const connections = new Set();
    totalEvents.forEach(event => {
      event.attendees.forEach(attendee => {
        if (attendee.user._id.toString() !== userId.toString()) {
          connections.add(attendee.user._id.toString());
        }
      });
    });

    // Get recent activity
    const recentCreated = await Event.find({ creator: userId })
      .select('name _id createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJoined = await Event.find({ 
      'attendees.user': userId,
      creator: { $ne: userId }
    })
      .select('name _id attendees')
      .sort({ 'attendees.joinedAt': -1 })
      .limit(5);

    const activities = [
      ...recentCreated.map(event => ({
        type: 'created',
        event_name: event.name,
        event_id: event._id,
        timestamp: event.createdAt
      })),
      ...recentJoined.map(event => {
        const userAttendee = event.attendees.find(
          a => a.user.toString() === userId.toString()
        );
        return {
          type: 'joined',
          event_name: event.name,
          event_id: event._id,
          timestamp: userAttendee ? userAttendee.joinedAt : new Date()
        };
      })
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      user: req.user,
      stats: {
        eventsCreated,
        eventsJoined,
        connections: connections.size
      },
      recentActivity: activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, location } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide at least one field to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

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

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'The current password you entered is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during password update' });
  }
});

// Get user's created events
router.get('/events/created', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const userId = req.user._id;

    const events = await Event.find({ creator: userId })
      .populate('attendees.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedEvents = events.map(event => ({
      id: event._id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      maxAttendees: event.maxAttendees,
      attendees: event.attendeeCount,
      tags: event.tags,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json({ events: formattedEvents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch created events' });
  }
});

// Get user's joined events
router.get('/events/joined', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const userId = req.user._id;

    const events = await Event.find({ 'attendees.user': userId })
      .populate('creator', 'name')
      .populate('attendees.user', 'name avatar')
      .sort({ 'attendees.joinedAt': -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedEvents = events.map(event => {
      const userAttendee = event.attendees.find(
        a => a.user._id.toString() === userId.toString()
      );
      
      return {
        id: event._id,
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image,
        maxAttendees: event.maxAttendees,
        attendees: event.attendeeCount,
        creator: event.creator.name,
        tags: event.tags,
        joinedAt: userAttendee ? userAttendee.joinedAt : null,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };
    });

    res.json({ events: formattedEvents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch joined events' });
  }
});

export default router;