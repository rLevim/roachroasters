'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlertStore } from '@/stores/alertStore';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';
import { useI18n } from '@/lib/i18n';

export default function CreateAlertPage() {
  const router = useRouter();
  const createAlert = useAlertStore((s) => s.createAlert);
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocLoading(false);
      setError(t('createAlert.geoNotSupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setError(t('createAlert.geoDenied'));
      }
    );
  }, []);

  const handleSubmit = async () => {
    if (!location) {
      setError(t('createAlert.waitLocation'));
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
        setError(t('createAlert.failed'));
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
          <h1 className="text-2xl font-extrabold text-white">{t('createAlert.title')}</h1>
          <p className="text-purple-light text-sm mt-1">{t('createAlert.subtitle')}</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <label className="text-sm font-semibold text-purple-ink">{t('createAlert.situation')}</label>
          <textarea
            placeholder={t('createAlert.placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-4 text-base bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-purple-mid"
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-sm font-semibold text-purple-ink block mb-2">{t('createAlert.location')}</label>
          {locLoading ? (
            <p className="text-sm text-gray-500">{t('createAlert.detecting')}</p>
          ) : location ? (
            <p className="text-sm text-gray-600">{t('createAlert.detected')} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</p>
          ) : (
            <p className="text-sm text-coral-dark">{t('createAlert.noLocation')}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        <Button
          title={t('createAlert.button')}
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
