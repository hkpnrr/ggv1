import React from 'react';
import { Calendar, Clock, MapPin, Users, UserPlus, CheckCircle } from 'lucide-react';

const EventCard = ({ event, onClick, onJoinEvent, isJoining, hasJoined }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const attendeePercentage = (event.attendees / event.maxAttendees) * 100;
  
  // Dynamic progress bar color based on attendance
  const getProgressColor = () => {
    if (attendeePercentage >= 70) return 'bg-green-500';
    if (attendeePercentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const canJoin = event.attendees < event.maxAttendees;

  const handleJoinClick = (e) => {
    e.stopPropagation();
    if (canJoin && !hasJoined && !isJoining) {
      onJoinEvent(event.id);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1"
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event);
        }
      }}
      aria-label={`View details for ${event.name}`}
    >
      {/* Event Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.image || `https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop`}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Attendee count overlay */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Users size={14} />
          <span>{event.attendees}/{event.maxAttendees}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Header with Title and Tags */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cream-300 transition-colors duration-200 line-clamp-2 mb-3">
            {event.name}
          </h3>
          
          {/* Event Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {event.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cream-100 dark:bg-gray-700 text-cream-300 dark:text-cream-300 border border-cream-200 dark:border-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Attendee Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{event.attendees} joined</span>
            <span>{event.maxAttendees - event.attendees} spots left</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed text-sm">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-100 dark:bg-gray-700 rounded-lg">
              <Calendar size={14} className="text-cream-300" />
            </div>
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-100 dark:bg-gray-700 rounded-lg">
              <Clock size={14} className="text-cream-300" />
            </div>
            <span className="font-medium">{event.time}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-100 dark:bg-gray-700 rounded-lg">
              <MapPin size={14} className="text-cream-300" />
            </div>
            <span className="font-medium">{event.location}</span>
          </div>
        </div>

        {/* Footer with Creator and Join Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            by <span className="font-semibold text-gray-700 dark:text-gray-300">{event.creator}</span>
          </div>
          
          {/* Join Button */}
          <button
            onClick={handleJoinClick}
            disabled={!canJoin || hasJoined || isJoining}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
              hasJoined
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                : canJoin
                ? 'bg-cream-300 hover:bg-cream-300/80 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Joining...</span>
              </>
            ) : hasJoined ? (
              <>
                <CheckCircle size={16} />
                <span>Joined</span>
              </>
            ) : canJoin ? (
              <>
                <UserPlus size={16} />
                <span>Join Now</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span>Full</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;