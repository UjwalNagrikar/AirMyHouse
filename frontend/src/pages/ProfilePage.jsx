import React, { useState, useEffect } from 'react';

const ProfilePage = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookings?role=guest`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
              <h2 className="text-xl font-bold">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-600">@{user.username}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-semibold capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-gray-600">Member since</p>
                <p className="font-semibold">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button className="w-full mt-6 bg-rose-500 text-white py-2 rounded-md hover:bg-rose-600 transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === 'bookings'
                      ? 'border-b-2 border-rose-500 text-rose-500'
                      : 'text-gray-600'
                  }`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-rose-500 text-rose-500'
                      : 'text-gray-600'
                  }`}
                >
                  Reviews
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'bookings' && (
                <div>
                  {loading ? (
                    <p className="text-center py-8">Loading bookings...</p>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">No bookings yet</p>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600 transition"
                      >
                        Start Exploring
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">
                                {booking.listing_title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {booking.listing_location}
                              </p>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>
                                  Check-in: {new Date(booking.start_date).toLocaleDateString()}
                                </span>
                                <span>
                                  Check-out: {new Date(booking.end_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="font-semibold">Total: </span>
                                <span className="text-lg font-bold text-rose-500">
                                  ${booking.total_price}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-12 text-gray-600">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;