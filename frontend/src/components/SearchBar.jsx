import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    location: initialValues.location || '',
    checkIn: initialValues.checkIn || '',
    checkOut: initialValues.checkOut || '',
    guests: initialValues.guests || 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (search.location) queryParams.append('location', search.location);
    if (search.checkIn) queryParams.append('checkIn', search.checkIn);
    if (search.checkOut) queryParams.append('checkOut', search.checkOut);
    if (search.guests) queryParams.append('guests', search.guests);
    
    navigate(`/search?${queryParams.toString()}`);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white rounded-full shadow-2xl p-2 w-full max-w-5xl"
    >
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        {/* Location Input */}
        <div className="flex-1 min-w-[200px] relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors">
            📍
          </div>
          <input
            type="text"
            placeholder="Where are you going?"
            value={search.location}
            onChange={(e) => setSearch({ ...search, location: e.target.value })}
            className="w-full pl-12 pr-6 py-3 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Check-in Date */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors pointer-events-none">
            📅
          </div>
          <input
            type="date"
            value={search.checkIn}
            onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
            min={getTodayDate()}
            className="pl-12 pr-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition-all"
            placeholder="Check-in"
          />
        </div>

        {/* Check-out Date */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors pointer-events-none">
            📅
          </div>
          <input
            type="date"
            value={search.checkOut}
            onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
            min={search.checkIn || getTodayDate()}
            className="pl-12 pr-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition-all"
            placeholder="Check-out"
          />
        </div>

        {/* Guests Input */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors pointer-events-none">
            👥
          </div>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="Guests"
            value={search.guests}
            onChange={(e) => setSearch({ ...search, guests: e.target.value })}
            className="w-28 pl-12 pr-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-full hover:from-rose-600 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
          <span>🔍</span>
          <span>Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;