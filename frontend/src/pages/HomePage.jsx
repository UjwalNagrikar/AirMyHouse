// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/listings?limit=6`);
      const data = await response.json();
      setFeaturedListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(search).toString();
    navigate(`/search?${queryParams}`);
  };

  const popularDestinations = [
    { name: 'New York', image: '🗽' },
    { name: 'San Francisco', image: '🌉' },
    { name: 'Los Angeles', image: '🌴' },
    { name: 'Miami', image: '🏖️' },
    { name: 'Chicago', image: '🏙️' },
    { name: 'Seattle', image: '🌲' },
    { name: 'Austin', image: '🎸' },
    { name: 'Denver', image: '⛰️' }
  ];

  const categories = [
    { name: 'Entire Homes', icon: '🏠', description: 'Have a place to yourself' },
    { name: 'Private Rooms', icon: '🛏️', description: 'Your own room in a home' },
    { name: 'Unique Stays', icon: '✨', description: 'Spaces that are more than just a place to sleep' },
    { name: 'Pet Friendly', icon: '🐾', description: 'Bring your furry friends' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Text */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl mb-2 drop-shadow">
              Discover unique homes and experiences around the world
            </p>
            <p className="text-lg opacity-90">
              Over 1,000+ properties available for your next adventure
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-full shadow-2xl p-2 max-w-5xl mx-auto">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={search.location}
                  onChange={(e) => setSearch({ ...search, location: e.target.value })}
                  className="w-full px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={search.checkIn}
                  onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                  className="px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Check-in"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={search.checkOut}
                  onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                  className="px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Check-out"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Guests"
                  value={search.guests}
                  onChange={(e) => setSearch({ ...search, guests: e.target.value })}
                  className="w-24 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-full hover:from-rose-600 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Featured Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Listings</h2>
            <p className="text-gray-600 mt-1">Handpicked properties just for you</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-2"
          >
            View All
            <span>→</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-xl text-gray-600">No listings available yet</p>
            <p className="text-gray-500 mt-2">Check back soon for amazing properties!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Destinations Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Destinations</h2>
            <p className="text-gray-600">Explore the most visited cities</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDestinations.map((destination) => (
              <button
                key={destination.name}
                onClick={() => navigate(`/search?location=${destination.name}`)}
                className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {destination.image}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                  {destination.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">Find the perfect type of accommodation</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all transform hover:-translate-y-1 hover:shadow-xl border-2 border-rose-200 hover:border-rose-500"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-white transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-white transition-colors">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4">
            🎉 LIMITED TIME OFFER
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Summer Special!
          </h2>
          <p className="text-xl md:text-2xl mb-8 drop-shadow">
            Get 20% off your first booking with code <span className="bg-white text-purple-600 px-4 py-1 rounded-full font-bold">SUMMER20</span>
          </p>
          <button
            onClick={() => navigate('/search')}
            className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Book Now & Save
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-600">Getting started is easy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Search</h3>
            <p className="text-gray-600">
              Find your perfect place by location, dates, and amenities
            </p>
          </div>

          <div className="text-center">
            <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Book</h3>
            <p className="text-gray-600">
              Reserve your stay with just a few clicks - it's quick and secure
            </p>
          </div>

          <div className="text-center">
            <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Enjoy</h3>
            <p className="text-gray-600">
              Relax and enjoy your stay in a home away from home
            </p>
          </div>
        </div>
      </div>

      {/* Host CTA Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Become a Host
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Earn extra income by sharing your space with travelers from around the world. 
                It's easy to get started and we're here to help every step of the way.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Set your own schedule and prices</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Host protection insurance included</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>24/7 community support</span>
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                Start Hosting Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">AirMyHouse</h3>
              <p className="text-gray-600 text-sm">
                Your trusted platform for finding and booking unique accommodations worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-rose-500">About Us</a></li>
                <li><a href="#" className="hover:text-rose-500">Careers</a></li>
                <li><a href="#" className="hover:text-rose-500">Press</a></li>
                <li><a href="#" className="hover:text-rose-500">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-rose-500">Help Center</a></li>
                <li><a href="#" className="hover:text-rose-500">Safety</a></li>
                <li><a href="#" className="hover:text-rose-500">Cancellation</a></li>
                <li><a href="#" className="hover:text-rose-500">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Hosting</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-rose-500">Become a Host</a></li>
                <li><a href="#" className="hover:text-rose-500">Host Resources</a></li>
                <li><a href="#" className="hover:text-rose-500">Community Forum</a></li>
                <li><a href="#" className="hover:text-rose-500">Responsible Hosting</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 AirMyHouse. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;