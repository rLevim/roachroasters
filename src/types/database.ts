export type UserRole = 'bugaphobe' | 'roach_roaster';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type AlertStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';

export type JobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string | null;
  bio: string | null;
  role: UserRole;
  city: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  roaches_killed: number;
  price: number | null;
  paypal_email: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  stripe_payment_method_id: string | null;
  stripe_card_last4: string | null;
  stripe_card_brand: string | null;
  xp: number;
  level: string;
  streak_days: number;
  streak_freeze_tokens: number;
  last_job_date: string | null;
  bravery_score: number;
  terms_accepted_at: string | null;
  onboarding_completed: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoachAlert {
  id: string;
  bugaphobe_id: string;
  description: string | null;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  radius_km: number;
  status: AlertStatus;
  created_at: string;
  updated_at: string;
}

export interface AlertResponse {
  id: string;
  alert_id: string;
  roaster_id: string;
  message: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  alert_id: string | null;
  bugaphobe_id: string;
  roaster_id: string;
  status: JobStatus;
  price: number;
  platform_fee: number;
  total_charged: number;
  location_lat: number | null;
  location_lng: number | null;
  location_shared_at: string | null;
  completed_at: string | null;
  payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'location' | 'image' | 'system';
  metadata: Record<string, unknown> | null;
  is_flagged: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  content: string | null;
  is_removed: boolean;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  job_id: string;
  bugaphobe_id: string;
  roaster_id: string;
  amount_charged: number;
  roaster_payout: number;
  platform_fee: number;
  stripe_payment_intent_id: string;
  stripe_transfer_id: string | null;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payout_status: 'pending' | 'paid' | null;
  payout_date: string | null;
  created_at: string;
}
