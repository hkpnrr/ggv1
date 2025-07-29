import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { Search, Filter, Calendar } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState(new Set());

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventsAPI.getEvents();
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleJoinEvent = async (eventId) => {
    if (joinedEvents.has(eventId) || isJoining) return;
    
    setIsJoining(true);
    try {
      const updatedEvent = await eventsAPI.joinEvent(eventId);
      setJoinedEvents(prev => new Set([...prev, eventId]));
      handleEventUpdate(updatedEvent);
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cream-300 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover amazing events happening around you
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search events, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-4 border border-cream-200 dark:border-gray-700 rounded-2xl leading-5 bg-cream-100 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-cream-300 focus:border-cream-300 sm:text-sm transition-all duration-200 shadow-lg"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              <button
                onClick={loadEvents}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={handleEventClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
              {searchTerm ? 'No events found' : 'No events available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Be the first to create an event!'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-cream-300 hover:text-cream-300/80 font-medium transition-colors duration-200"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-cream-300 mb-2">{events.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Events</div>
          </div>
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {events.reduce((sum, event) => sum + event.attendees, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Attendees</div>
          </div>
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {new Set(events.map(event => event.location)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Locations</div>
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onJoinEvent={handleJoinEvent}
          isJoining={isJoining}
          hasJoined={selectedEvent ? joinedEvents.has(selectedEvent.id) : false}
        />
      </div>
    </div>
  );
};

export default Home;