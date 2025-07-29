import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const EventCard = ({ event, onClick }) => {

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

  return (
    <div 
      className="bg-cream-100 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-cream-200 dark:border-gray-700 overflow-hidden group cursor-pointer transform hover:scale-105"
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
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cream-300 transition-colors duration-200 line-clamp-2">
            {event.name}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
            <Users size={16} />
            <span>{event.attendees}/{event.maxAttendees}</span>
          </div>
        </div>

        {/* Attendee Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-cream-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cream-300 dark:bg-cream-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-200 dark:bg-gray-700 rounded-lg">
              <Calendar size={14} className="text-cream-300" />
            </div>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-200 dark:bg-gray-700 rounded-lg">
              <Clock size={14} className="text-cream-300" />
            </div>
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="p-1.5 bg-cream-200 dark:bg-gray-700 rounded-lg">
              <MapPin size={14} className="text-cream-300" />
            </div>
            <span>{event.location}</span>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center justify-between pt-6 border-t border-cream-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Created by <span className="font-semibold text-gray-800 dark:text-gray-200">{event.creator}</span>
          </div>
          
          {/* Click indicator */}
          <div className="text-xs text-cream-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to view
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;