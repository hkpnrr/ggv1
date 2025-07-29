import React, { useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, UserPlus } from 'lucide-react';

const EventModal = ({ event, isOpen, onClose, onJoinEvent, isJoining, hasJoined }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canJoin = event.attendees < event.maxAttendees;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-[#F0E4D3] dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Header */}
        <div className="p-8 pb-6">
          <h2 
            id="modal-title"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4 pr-12"
          >
            {event.name}
          </h2>
          
          <div className="flex items-center space-x-2 text-[#D9A299] mb-6">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">
              Created by {event.creator}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              About this event
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#DCC5B2] dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#D9A299]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#DCC5B2] dark:bg-gray-700 rounded-lg">
                  <Clock className="h-5 w-5 text-[#D9A299]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.time}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#DCC5B2] dark:bg-gray-700 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#D9A299]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#DCC5B2] dark:bg-gray-700 rounded-lg">
                  <UserPlus className="h-5 w-5 text-[#D9A299]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendees</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.attendees} / {event.maxAttendees}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={() => onJoinEvent(event.id)}
              disabled={!canJoin || hasJoined || isJoining}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                hasJoined
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                  : canJoin
                  ? 'bg-[#D9A299] hover:bg-[#D9A299]/80 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <UserPlus className="h-5 w-5" />
              <span>
                {isJoining ? 'Joining...' : hasJoined ? 'Already Joined' : canJoin ? 'Request to Join' : 'Event Full'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;