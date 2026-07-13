PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS special_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('occasion', 'season')),
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT NOT NULL UNIQUE,

  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT DEFAULT '',
  booking_type TEXT NOT NULL,

  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  people_total INTEGER NOT NULL DEFAULT 1,

  check_in_date TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  check_out_time TEXT NOT NULL,
  nights_count INTEGER NOT NULL DEFAULT 1,

  notes TEXT DEFAULT '',

  stay_amount REAL NOT NULL DEFAULT 0,
  services_amount REAL NOT NULL DEFAULT 0,
  insurance_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,

  payment_method TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'pending',

  nights_json TEXT NOT NULL DEFAULT '[]',
  services_json TEXT NOT NULL DEFAULT '[]',

  admin_note TEXT DEFAULT '',
  telegram_message_id INTEGER,
  telegram_chat_id TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_states (
  chat_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  payload TEXT DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status
ON bookings(payment_status);

CREATE INDEX IF NOT EXISTS idx_bookings_dates
ON bookings(check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS idx_special_periods_dates
ON special_periods(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates
ON blocked_dates(start_date, end_date);

INSERT OR IGNORE INTO settings (key, value) VALUES
('site_enabled', '1'),
('site_title', 'طلب حجز'),
('site_subtitle', 'اختر موعد الحجز وعدد الأشخاص والخدمات المطلوبة، ثم راجع تفاصيل الطلب والمبلغ الكامل قبل اختيار طريقة الدفع.'),

('weekday_name', 'أيام الأسبوع'),
('weekday_price', '300'),
('weekday_visible', '1'),

('thursday_name', 'الخميس'),
('thursday_price', '450'),
('thursday_visible', '1'),

('friday_name', 'الجمعة'),
('friday_price', '550'),
('friday_visible', '1'),

('insurance_visible', '1'),
('insurance_amount', '400'),
('insurance_title', 'تفاصيل التأمين المسترد'),
('insurance_description', 'يتم تحصيل مبلغ التأمين للمحافظة على المكان ومحتوياته. يعاد المبلغ بعد انتهاء الحجز وفحص المكان والتأكد من عدم وجود تلفيات أو فقدان للممتلكات أو مخالفة لشروط الحجز.'),

('card_payment_visible', '1'),
('card_payment_name', 'بطاقة ائتمان'),
('card_payment_description', 'الدفع باستخدام بطاقة بنكية عبر بوابة دفع آمنة.'),
('card_payment_url', ''),

('bank_payment_visible', '1'),
('bank_payment_name', 'تحويل بنكي'),
('bank_payment_description', 'تواصل مع الإدارة لاستلام الحساب البنكي المخصص للتحويل.'),
('bank_whatsapp_number', '966500000000'),
('bank_whatsapp_message', 'السلام عليكم، أرغب بإكمال دفع الحجز رقم {booking_number} عن طريق التحويل البنكي. المبلغ المطلوب {amount} ريال.'),

('maintenance_message', 'الموقع تحت الصيانة حاليًا، يرجى المحاولة لاحقًا.');

INSERT OR IGNORE INTO services
(name, description, price, visible, sort_order)
VALUES
('تدفئة المسبح', 'تشغيل تدفئة المسبح خلال فترة الحجز.', 100, 1, 1),
('تجهيز مناسبة', 'تجهيز أساسي للمناسبات والاحتفالات.', 250, 1, 2),
('تزيين بالبالونات', 'تنسيق بالونات مناسب للاحتفال.', 150, 1, 3),
('تنسيق ورد', 'تنسيق ورد للجلسة أو المناسبة.', 150, 1, 4),
('قهوة وضيافة', 'قهوة عربية وشاي ومياه للضيوف.', 120, 1, 5),
('مستلزمات شواء', 'فحم وأدوات وتجهيز منطقة الشواء.', 50, 1, 6),
('فطور صباحي', 'تجهيز فطور خفيف حسب عدد الأشخاص.', 180, 1, 7),
('تسجيل دخول مبكر', 'الدخول قبل الموعد الرسمي حسب التوفر.', 100, 1, 8),
('تسجيل خروج متأخر', 'تمديد وقت الخروج حسب التوفر.', 100, 1, 9);

INSERT OR IGNORE INTO special_periods
(type, name, start_date, end_date, price, visible)
VALUES
('season', 'موسم الصيف', '2026-07-15', '2026-08-31', 1000, 1),
('occasion', 'إجازة خاصة', '2026-09-20', '2026-09-25', 600, 1);
