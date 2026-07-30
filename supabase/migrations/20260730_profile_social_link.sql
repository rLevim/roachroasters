-- Social / profile link shown on a user's profile to build trust.
alter table public.profiles add column if not exists social_link text;
