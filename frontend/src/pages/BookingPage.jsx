import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const BookingPage = ({ user }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests')) || 1;

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/listings/${id}`);
      const data = await response.json();
      setListing(data.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
    }
  };

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    return calculateNights() * (listing?.price_per_night || 0);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: parseInt(id),
          start_date: checkIn,
          end_date: checkOut,
          num_guests: guests
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking request submitted successfully!');
        navigate('/profile');
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Details */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Dates</p>
                <p className="font-semibold">
                  {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-semibold">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
            <p className="text-gray-600 mb-3">{listing.location}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{listing.bedrooms} bedrooms</span>
              <span>·</span>
              <span>{listing.bathrooms} bathrooms</span>
              <span>·</span>
              <span>{listing.max_guests} max guests</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Price Details</h2>
            
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span>${listing.price_per_night} x {calculateNights()} nights</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service fee</span>
                <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total (USD)</span>
              <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full bg-rose-500 text-white py-3 rounded-md hover:bg-rose-600 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : listing.instant_book ? 'Confirm Booking' : 'Request to Book'}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;