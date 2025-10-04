// frontend/src/pages/HostDashboard.jsx
import React, { useState, useEffect } from 'react';

const HostDashboard = ({ user }) => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch host's listings
      const listingsResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/listings`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const listingsData = await listingsResponse.json();
      setListings(listingsData.listings || []);

      // Fetch bookings for host's listings
      const bookingsResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings?role=host`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Error fetching host data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: action })
        }
      );

      if (response.ok) {
        alert(`Booking ${action} successfully!`);
        fetchHostData();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const calculateTotalEarnings = () => {
    return bookings
      .filter(b => b.status === 'accepted' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_price), 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <button className="bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600 transition font-semibold">
          Create New Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Listings</p>
          <p className="text-3xl font-bold text-rose-500">{listings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Pending Bookings</p>
          <p className="text-3xl font-bold text-yellow-500">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Accepted Bookings</p>
          <p className="text-3xl font-bold text-green-500">
            {bookings.filter(b => b.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-rose-500">
            ${calculateTotalEarnings().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'listings'
                  ? 'border-b-2 border-rose-500 text-rose-500'
                  : 'text-gray-600'
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-rose-500 text-rose-500'
                  : 'text-gray-600'
              }`}
            >
              Booking Requests
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : activeTab === 'listings' ? (
            <div>
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't created any listings yet</p>
                  <button className="bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600 transition">
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                      <div className="h-48 bg-gray-200">
                        {listing.primary_photo ? (
                          <img
                            src={listing.primary_photo}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-rose-500">
                            ${listing.price_per_night}/night
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600">
                            Edit
                          </button>
                          <button className="flex-1 bg-gray-500 text-white py-1 rounded text-sm hover:bg-gray-600">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No booking requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{booking.listing_title}</h3>
                          <p className="text-sm text-gray-600">
                            Guest: {booking.guest_first_name} {booking.guest_last_name}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-semibold">
                            {new Date(booking.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-semibold">
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-semibold">{booking.num_guests}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Price</p>
                          <p className="font-semibold text-rose-500">
                            ${booking.total_price}
                          </p>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleBookingAction(booking.id, 'accepted')}
                            className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'rejected')}
                            className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;