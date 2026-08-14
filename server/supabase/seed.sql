-- Seed dummy admin user (Password: password123)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'authenticated',
    'authenticated',
    'admin@roadtrip.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin RoadTrip","avatar_url":"https://i.pravatar.cc/150?u=admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
-- Note: The trigger public.handle_new_user() will automatically insert a row into public.user_profiles

-- Seed a sample trip
INSERT INTO trip_schema.trips (id, owner_id, title, description, start_date, end_date, budget)
VALUES (
    'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'Chuyến Đi Đà Lạt Mộng Mơ',
    'Hành trình 3 ngày 2 đêm lên vùng cao tránh nóng',
    '2026-09-01',
    '2026-09-03',
    5000000
);

-- Make the owner a member
INSERT INTO trip_schema.trip_members (trip_id, user_id, role)
VALUES (
    'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'OWNER'
);

-- Seed all 3 trip days
INSERT INTO trip_schema.trip_days (id, trip_id, date, day_index)
VALUES
('d1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-01', 1),
('d2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-02', 2),
('d3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-03', 3);

-- Seed a few trip stops
INSERT INTO trip_schema.trip_stops (trip_id, day_id, place_id, name, address, lat, lng, stop_index, notes)
VALUES
('b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_1', 'Cổng Trời Bali', 'Đèo Prenn, Đà Lạt', 11.9404, 108.4583, 1, 'Nhớ mang theo áo khoác'),
('b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_2', 'Quảng Trường Lâm Viên', 'Phường 10, Đà Lạt', 11.9388, 108.4444, 2, 'Ghé mua bánh tráng nướng');
