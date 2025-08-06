import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, createEventSchema, updateEventSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all events with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, tag, location, date, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (date) {
      query.date = date;
    }

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .populate('attendees.user', 'name avatar')
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Format events data
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
      creator: event.creator.name,
      creatorId: event.creator._id,
      tags: event.tags,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json({
      events: formattedEvents,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedEvents.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees.user', 'name avatar');

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if current user is attending
    let isAttending = false;
    if (req.user) {
      isAttending = event.attendees.some(
        attendee => attendee.user._id.toString() === req.user._id.toString()
      );
    }

    const formattedEvent = {
      id: event._id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      maxAttendees: event.maxAttendees,
      attendees: event.attendeeCount,
      creator: {
        id: event.creator._id,
        name: event.creator.name,
        email: event.creator.email
      },
      tags: event.tags,
      isAttending,
      attendeesList: event.attendees.map(attendee => ({
        id: attendee.user._id,
        name: attendee.user.name,
        avatar: attendee.user.avatar,
        joinedAt: attendee.joinedAt
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };

    res.json({ event: formattedEvent });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', authenticateToken, validate(createEventSchema), async (req, res) => {
  try {
    const { name, description, date, time, location, image, maxAttendees, tags } = req.body;

    // Validate date is not in the past
    const eventDate = new Date(`${date}T${time}`);
    if (eventDate < new Date()) {
      return res.status(400).json({
        error: 'Invalid date',
        message: 'Event date cannot be in the past'
      });
    }

    const event = new Event({
      name,
      description,
      date,
      time,
      location,
      image: image || null,
      maxAttendees,
      tags: tags || [],
      creator: req.user._id,
      attendees: [{ user: req.user._id }] // Creator automatically joins
    });

    await event.save();
    await event.populate('creator', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event: {
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
        creatorId: event.creator._id,
        tags: event.tags
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Join event
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if event is full
    if (event.attendeeCount >= event.maxAttendees) {
      return res.status(400).json({
        error: 'Event is full',
        message: 'This event has reached maximum capacity'
      });
    }

    // Check if user is already attending
    const isAlreadyAttending = event.attendees.some(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (isAlreadyAttending) {
      return res.status(400).json({
        error: 'Already joined',
        message: 'You are already attending this event'
      });
    }

    // Add user to event
    event.attendees.push({ user: req.user._id });
    await event.save();

    res.json({
      message: 'Successfully joined event'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Leave event
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user is attending
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user._id.toString()
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        error: 'Not attending',
        message: 'You are not attending this event'
      });
    }

    // Remove user from event
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json({
      message: 'Successfully left event'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({ error: 'Failed to leave event' });
  }
});

// Update event (only creator can update)
router.put('/:id', authenticateToken, validate(updateEventSchema), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the event creator can update this event'
      });
    }

    const { name, description, date, time, location, image, maxAttendees, tags } = req.body;
    
    // Update fields if provided
    if (name) event.name = name;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (image !== undefined) event.image = image;
    if (maxAttendees) event.maxAttendees = maxAttendees;
    if (tags) event.tags = tags;

    await event.save();

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (only creator can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the event creator can delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ 
        error: 'Event not found',
        message: 'Invalid event ID'
      });
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;