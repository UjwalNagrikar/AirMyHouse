// frontend/src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    property_type: 'any',
    bedrooms: 'any',
    amenities: []
  });

  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const location = searchParams.get('location') || '';
      const checkIn = searchParams.get('checkIn') || '';
      const checkOut = searchParams.get('checkOut') || '';
      const guests = searchParams.get('guests') || '';
      
      let url = `${process.env.REACT_APP_API_URL}/listings?`;
      const params = new URLSearchParams();
      
      if (location) params.append('location', location);
      if (guests) params.append('min_guests', guests);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.property_type !== 'any') params.append('property_type', filters.property_type);
      if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));

      const response = await fetch(url + params.toString());
      const data = await response.json();
      
      let sortedListings = data.listings || [];
      
      // Apply sorting
      if (sortBy === 'price_low') {
        sortedListings.sort((a, b) => a.price_per_night - b.price_per_night);
      } else if (sortBy === 'price_high') {
        sortedListings.sort((a, b) => b.price_per_night - a.price_per_night);
      } else if (sortBy === 'rating') {
        sortedListings.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      }
      
      setListings(sortedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const applyFilters = () => {
    fetchListings();
  };

  const clearFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      property_type: 'any',
      bedrooms: 'any',
      amenities: []
    });
    setTimeout(() => fetchListings(), 100);
  };

  const amenitiesList = [
    { id: 1, name: 'WiFi', icon: '📶' },
    { id: 2, name: 'Kitchen', icon: '🍳' },
    { id: 3, name: 'Washer', icon: '🧺' },
    { id: 4, name: 'Dryer', icon: '👕' },
    { id: 5, name: 'Air Conditioning', icon: '❄️' },
    { id: 6, name: 'Heating', icon: '🔥' },
    { id: 7, name: 'TV', icon: '📺' },
    { id: 8, name: 'Pool', icon: '🏊' },
    { id: 11, name: 'Parking', icon: '🚗' },
    { id: 13, name: 'Workspace', icon: '💻' },
  ];

  const location = searchParams.get('location');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Summary Bar */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {location ? `Stays in ${location}` : 'All Listings'}
              </h1>
              {checkIn && checkOut && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    📅 {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                  </span>
                </div>
              )}
              {guests && (
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  👥 {guests} {parseInt(guests) === 1 ? 'guest' : 'guests'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setTimeout(() => fetchListings(), 100);
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Toggle Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <span>🔍</span>
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-md sticky top-32">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <p className="text-sm text-gray-500">Refine your search</p>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    💰 Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, min_price: '0', max_price: '100' }));
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      $0-$100
                    </button>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, min_price: '100', max_price: '200' }));
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      $100-$200
                    </button>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, min_price: '200', max_price: '500' }));
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      $200+
                    </button>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    🏠 Property Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'any', label: 'Any Type', icon: '🏘️' },
                      { value: 'entire', label: 'Entire Home', icon: '🏡' },
                      { value: 'private', label: 'Private Room', icon: '🚪' },
                      { value: 'shared', label: 'Shared Space', icon: '🛏️' }
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                          filters.property_type === type.value
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="property_type"
                          value={type.value}
                          checked={filters.property_type === type.value}
                          onChange={(e) => handleFilterChange('property_type', e.target.value)}
                          className="text-rose-500 focus:ring-rose-500"
                        />
                        <span className="text-xl">{type.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    🛏️ Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    ✨ Amenities
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <span className="text-lg">{amenity.icon}</span>
                        <span className="text-sm text-gray-700">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={applyFilters}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition font-semibold shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{listings.length}</span>
                    {' '}{listings.length === 1 ? 'property' : 'properties'} found
                  </>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-500 mb-4"></div>
                <p className="text-gray-600 text-lg">Finding the best properties for you...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!loading && listings.length > 0 && (
              <div className="mt-12 text-center">
                <button className="px-8 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-medium transition">
                  Load More Properties
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;