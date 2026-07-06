'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlertStore } from '@/stores/alertStore';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

export default function CreateAlertPage() {
  const router = useRouter();
  const createAlert = useAlertStore((s) => s.createAlert);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocLoading(false);
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setError('Location access denied. Please enable location services.');
      }
    );
  }, []);

  const handleSubmit = async () => {
    if (!location) {
      setError('Please wait for your location to be detected.');
      return;
    }
    setLoading(true);
    try {
      const alert = await createAlert({
        description: description.trim() || undefined,
        latitude: location.lat,
        longitude: location.lng,
      });
      if (alert) {
        router.push(`/alerts/${alert.id}`);
      } else {
        setError('Failed to create alert. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Hero */}
        <div className="bg-purple-dark rounded-3xl p-6 text-center">
          <span className="text-6xl block mb-2"> </span>
          <h1 className="text-2xl font-extrabold text-white">Spotted a Roach?</h1>
          <p className="text-purple-light text-sm mt-1">Post an alert and nearby Roach Roasters will come to your rescue!</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <label className="text-sm font-semibold text-purple-ink">What&apos;s the situation? (optional)</label>
          <textarea
            placeholder="e.g. There's a huge cockroach in my kitchen and I'm terrified..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-4 text-base bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-purple-mid"
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-sm font-semibold text-purple-ink block mb-2">Your Location</label>
          {locLoading ? (
            <p className="text-sm text-gray-500">Detecting location...</p>
          ) : location ? (
            <p className="text-sm text-gray-600">Location detected ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</p>
          ) : (
            <p className="text-sm text-coral-dark">Location not available. Please enable location services.</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        <Button
          title="Post Roach Alert"
          onClick={handleSubmit}
          variant="coral"
          size="lg"
          loading={loading}
          disabled={!location}
          className="w-full"
        />
      </div>
    </div>
  );
}
