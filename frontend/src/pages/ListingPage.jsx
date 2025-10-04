// frontend/src/pages/ListingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ListingPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

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
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    return calculateNights() * (listing?.price_per_night || 0);
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!listing) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Listing not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title and Location */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
        <p className="text-gray-600">
          {listing.city}, {listing.state} {listing.country}
        </p>
        {listing.avg_rating && (
          <div className="flex items-center mt-2">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 font-semibold">{parseFloat(listing.avg_rating).toFixed(1)}</span>
            <span className="ml-1 text-gray-600">({listing.review_count} reviews)</span>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-4 gap-2 mb-8 h-96">
        {listing.photos && listing.photos.length > 0 ? (
          <>
            <div className="col-span-2 row-span-2">
              <img
                src={listing.photos[0]?.photo_url}
                alt="Main"
                className="w-full h-full object-cover rounded-l-lg"
              />
            </div>
            {listing.photos.slice(1, 5).map((photo, idx) => (
              <div key={idx} className={idx === 3 ? 'rounded-tr-lg overflow-hidden' : ''}>
                <img
                  src={photo.photo_url}
                  alt={`Photo ${idx + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-4 bg-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-400">No photos available</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2">
          {/* Host Info */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              Hosted by {listing.host_first_name} {listing.host_last_name}
            </h2>
            <div className="flex gap-4 text-gray-600">
              <span>{listing.max_guests} guests</span>
              <span>·</span>
              <span>{listing.bedrooms} bedrooms</span>
              <span>·</span>
              <span>{listing.bathrooms} bathrooms</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-semibold mb-3">About this place</h3>
            <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {listing.reviews && listing.reviews.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Reviews ({listing.review_count})
              </h3>
              <div className="space-y-4">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-semibold">
                          {review.first_name} {review.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Card */}
        <div className="col-span-1">
          <div className="bg-white border rounded-lg shadow-lg p-6 sticky top-20">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-2xl font-bold">${listing.price_per_night}</span>
                <span className="text-gray-600"> / night</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  max={listing.max_guests}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!checkIn || !checkOut}
              className="w-full bg-rose-500 text-white py-3 rounded-md hover:bg-rose-600 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {listing.instant_book ? 'Book Now' : 'Request to Book'}
            </button>

            {checkIn && checkOut && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>${listing.price_per_night} x {calculateNights()} nights</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;