-- Seed test fixture users (Password: password123 for all test accounts)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES
(
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
    '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'a2b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'authenticated',
    'authenticated',
    'moderator@roadtrip.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Moderator RoadTrip","avatar_url":"https://i.pravatar.cc/150?u=moderator"}',
    NOW(),
    NOW(),
    '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'a3b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'authenticated',
    'authenticated',
    'partner@roadtrip.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Partner RoadTrip","avatar_url":"https://i.pravatar.cc/150?u=partner"}',
    NOW(),
    NOW(),
    '', '', '', ''
),
(
    '00000000-0000-0000-0000-000000000000',
    'a4b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'authenticated',
    'authenticated',
    'traveler@roadtrip.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Traveler RoadTrip","avatar_url":"https://i.pravatar.cc/150?u=traveler"}',
    NOW(),
    NOW(),
    '', '', '', ''
)
ON CONFLICT (id) DO NOTHING;

-- Assign platform roles for test fixtures
UPDATE public.user_profiles SET role = 'ADMIN' WHERE id = 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';
UPDATE public.user_profiles SET role = 'MODERATOR' WHERE id = 'a2b2c3d4-e5f6-4a5b-8c9d-0123456789ab';
UPDATE public.user_profiles SET role = 'PARTNER' WHERE id = 'a3b2c3d4-e5f6-4a5b-8c9d-0123456789ab';
UPDATE public.user_profiles SET role = 'USER' WHERE id = 'a4b2c3d4-e5f6-4a5b-8c9d-0123456789ab';


-- Seed sample published trips
INSERT INTO trip_schema.trips (id, owner_id, title, description, start_date, end_date, budget_amount, visibility, published_at)
VALUES (
    'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'Chuyến Đi Đà Lạt Mộng Mơ',
    'Hành trình 3 ngày 2 đêm lên vùng cao tránh nóng, săn mây và thưởng thức ẩm thực bản địa.',
    '2026-09-01',
    '2026-09-03',
    5000000,
    'PUBLISHED',
    NOW()
),
(
    'b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'Vòng Lặp Hà Giang 5 Ngày 4 Đêm',
    'Chinh phục cao nguyên đá Đồng Văn, đèo Mã Pí Lèng hùng vĩ và trải nghiệm văn hóa H’Mông.',
    '2026-10-01',
    '2026-10-05',
    6500000,
    'PUBLISHED',
    NOW()
),
(
    'b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab',
    'Di Sản Miền Trung: Đà Nẵng — Hội An — Huế',
    'Khám phá bờ biển tuyệt đẹp, phố cổ đèn lồng trầm mặc và kinh thành Huế cổ kính.',
    '2026-11-10',
    '2026-11-14',
    8000000,
    'PUBLISHED',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
  visibility = EXCLUDED.visibility,
  published_at = EXCLUDED.published_at;

-- Make the owner a member
INSERT INTO trip_schema.trip_members (trip_id, user_id, role, permission)
VALUES
    ('b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'OWNER', 'EDIT'),
    ('b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'OWNER', 'EDIT'),
    ('b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'OWNER', 'EDIT')
ON CONFLICT (trip_id, user_id) DO NOTHING;

-- Seed trip days
INSERT INTO trip_schema.trip_days (id, trip_id, date, day_index)
VALUES
('d1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-01', 1),
('d2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-02', 2),
('d3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-09-03', 3),
('d4b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-10-01', 1),
('d5b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-10-02', 2),
('d6b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-11-10', 1),
('d7b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', '2026-11-11', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed trip stops
INSERT INTO trip_schema.trip_stops (trip_id, day_id, place_id, name, address, latitude, longitude, stop_index, notes)
VALUES
('b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_1', 'Cổng Trời Bali', 'Đèo Prenn, Đà Lạt', 11.9404, 108.4583, 1, 'Nhớ mang theo áo khoác'),
('b1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_2', 'Quảng Trường Lâm Viên', 'Phường 10, Đà Lạt', 11.9388, 108.4444, 2, 'Ghé mua bánh tráng nướng'),
('b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd4b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_hg1', 'Cổng Trời Quản Bạ', 'Quản Bạ, Hà Giang', 23.0567, 104.9928, 1, 'Ngắm núi Đôi Quản Bạ'),
('b2b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd5b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_hg2', 'Đèo Mã Pí Lèng', 'Mèo Vạc, Hà Giang', 23.2422, 105.4167, 1, 'Chụp ảnh hẻm Tu Sản'),
('b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd6b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_dn1', 'Bán đảo Sơn Trà', 'Sơn Trà, Đà Nẵng', 16.1167, 108.2833, 1, 'Thăm chùa Linh Ứng'),
('b3b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'd7b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'place_ha1', 'Phố Cổ Hội An', 'Hội An, Quảng Nam', 15.8801, 108.3380, 1, 'Thả đèn hoa đăng trên sông Hoài')
ON CONFLICT (id) DO NOTHING;
