import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventsAPI } from '../services/api';
import { Calendar, MapPin, Users, FileText, Plus, Image, Tag } from 'lucide-react';

const createEventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().min(1, 'Event time is required'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  maxAttendees: z.number().min(1, 'Maximum attendees must be at least 1').max(1000, 'Maximum attendees cannot exceed 1000'),
  image: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');

  const availableTags = [
    'Tech', 'Networking', 'Photography', 'Casual', 'Business', 'Art', 
    'Music', 'Food', 'Sports', 'Education', 'Health', 'Travel'
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      maxAttendees: 20,
      tags: []
    }
  });

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag].slice(0, 3); // Limit to 3 tags
    
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 3) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      setValue('tags', newTags);
      setCustomTag('');
    }
  };
  const onSubmit = async (data) => {
    console.log('Create event form data:', data);
    setIsLoading(true);

    try {
      const eventData = {
        ...data,
        maxAttendees: parseInt(data.maxAttendees),
        tags: selectedTags
      };
      
      const newEvent = await eventsAPI.createEvent(eventData);
      console.log('Event created:', newEvent);
      alert('Event created successfully!');
      navigate('/');
    } catch (error) {
      setError('root', {
        message: 'Failed to create event. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Create New Event</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Share your event with the community and bring people together
          </p>
        </div>

        {/* Form */}
        <div className="bg-cream-100 dark:bg-gray-800 shadow-2xl rounded-2xl border border-cream-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <FileText className="h-5 w-5 mr-2 text-cream-300" />
                Event Name
              </label>
              <input
                {...register('name')}
                type="text"
                className={`w-full px-4 py-4 border ${
                  errors.name ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner`}
                placeholder="Enter event name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Event Image */}
            <div>
              <label htmlFor="image" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Image className="h-5 w-5 mr-2 text-cream-300" />
                Event Image URL (Optional)
              </label>
              <input
                {...register('image')}
                type="url"
                className="w-full px-4 py-4 border border-cream-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Add a cover image URL for your event (recommended: 800x400px)
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <FileText className="h-5 w-5 mr-2 text-cream-300" />
                Description
              </label>
              <textarea
                {...register('description')}
                rows="5"
                className={`w-full px-4 py-4 border ${
                  errors.description ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner`}
                placeholder="Describe your event in detail..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Event Tags */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Tag className="h-5 w-5 mr-2 text-cream-300" />
                Event Tags (Select up to 3)
              </label>
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-cream-300 text-white shadow-md'
                        : 'bg-cream-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-gray-600'
                    }`}
                    disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  placeholder="Add custom tag..."
                  className="flex-1 px-3 py-2 border border-cream-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  disabled={selectedTags.length >= 3}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim() || selectedTags.length >= 3}
                  className="px-4 py-2 bg-cream-300 text-white rounded-lg hover:bg-cream-300/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cream-200 dark:bg-gray-700 text-cream-300 dark:text-cream-300"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className="ml-2 text-cream-300 hover:text-cream-300/80"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="h-5 w-5 mr-2 text-cream-300" />
                  Event Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  min={today}
                  className={`w-full px-4 py-4 border ${
                    errors.date ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner`}
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="h-5 w-5 mr-2 text-cream-300" />
                  Event Time
                </label>
                <input
                  {...register('time')}
                  type="time"
                  className={`w-full px-4 py-4 border ${
                    errors.time ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-inner`}
                />
                {errors.time && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <MapPin className="h-5 w-5 mr-2 text-cream-300" />
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                className={`w-full px-4 py-4 border ${
                  errors.location ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner`}
                placeholder="Enter event location"
              />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
              )}
            </div>

            {/* Max Attendees */}
            <div>
              <label htmlFor="maxAttendees" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Users className="h-5 w-5 mr-2 text-cream-300" />
                Maximum Attendees
              </label>
              <input
                {...register('maxAttendees', { valueAsNumber: true })}
                type="number"
                min="1"
                max="1000"
                className={`w-full px-4 py-4 border ${
                  errors.maxAttendees ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner`}
                placeholder="20"
              />
              {errors.maxAttendees && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.maxAttendees.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Set the maximum number of people who can join your event
              </p>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-5 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-400">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-6 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-4 px-6 border border-cream-200 dark:border-gray-600 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cream-300 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-cream-300 hover:bg-cream-300/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cream-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-3" />
                    Create Event
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-cream-200 dark:bg-gray-800 rounded-2xl p-8 border border-cream-300 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Tips for a great event:</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>• Be specific about the location and provide landmarks if needed</li>
            <li>• Include what attendees should bring or expect</li>
            <li>• Set a realistic capacity based on your venue</li>
            <li>• Consider the time zone and local weather</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;