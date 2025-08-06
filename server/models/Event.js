import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  time: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/
  },
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  image: {
    type: String,
    default: null
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
    default: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['joined', 'pending', 'cancelled'],
      default: 'joined'
    }
  }]
}, {
  timestamps: true
});

// Index for better performance
eventSchema.index({ creator: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'attendees.user': 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(attendee => attendee.status === 'joined').length;
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Event', eventSchema);