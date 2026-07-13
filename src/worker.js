const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const BUTTONS = {
  MAIN: "القائمة الرئيسية",
  SITE: "نصوص الموقع",
  PRICES: "الأسعار",
  SERVICES: "الخدمات",
  PERIODS: "المواسم والمناسبات",
  INSURANCE: "التأمين المسترد",
  PAYMENT: "طرق الدفع",

  BACK: "رجوع",
  CANCEL: "إلغاء",

  SITE_TOGGLE: "تشغيل أو إيقاف الموقع",
  SITE_TITLE: "تعديل عنوان الموقع",
  SITE_SUBTITLE: "تعديل وصف الموقع",
  SITE_MAINTENANCE: "تعديل نص الصيانة",

  WEEKDAY_PRICE: "سعر أيام الأسبوع",
  THURSDAY_PRICE: "سعر الخميس",
  FRIDAY_PRICE: "سعر الجمعة",

  INSURANCE_TOGGLE: "إظهار أو إخفاء التأمين",
  INSURANCE_AMOUNT: "تعديل مبلغ التأمين",
  INSURANCE_TITLE: "تعديل عنوان التأمين",
  INSURANCE_DESCRIPTION: "تعديل نص التأمين",

  CARD_TOGGLE: "إظهار أو إخفاء البطاقة",
  BANK_TOGGLE: "إظهار أو إخفاء التحويل",
  CARD_URL: "رابط بوابة الدفع",
  PAYMENT_BOT: "اسم بوت الدفع",
  CARD_NAME: "اسم دفع البطاقة",
  CARD_DESCRIPTION: "وصف دفع البطاقة",
  BANK_NAME: "اسم التحويل البنكي",
  BANK_DESCRIPTION: "وصف التحويل البنكي",
  BANK_WHATSAPP: "رقم واتساب التحويل",
  BANK_MESSAGE: "نص رسالة التحويل",

  SERVICE_ADD: "إضافة خدمة",
  SERVICE_LIST: "عرض الخدمات",
  SERVICE_EDIT: "تعديل خدمة",
  SERVICE_TOGGLE: "إظهار أو إخفاء خدمة",
  SERVICE_DELETE: "حذف خدمة",

  PERIOD_ADD_SEASON: "إضافة موسم",
  PERIOD_ADD_OCCASION: "إضافة مناسبة",
  PERIOD_LIST: "عرض الفترات",
  PERIOD_TOGGLE: "إظهار أو إخفاء فترة",
  PERIOD_DELETE: "حذف فترة"
};

const DEFAULT_SETTINGS = {
  site_enabled: "1",
  site_title: "طلب حجز",

  site_subtitle:
    "اختر موعد الحجز وعدد الأشخاص والخدمات المطلوبة، ثم راجع تفاصيل الطلب والمبلغ الكامل قبل اختيار طريقة الدفع.",

  maintenance_message:
    "الموقع تحت الصيانة حاليًا، يرجى المحاولة لاحقًا.",

  weekday_name: "أيام الأسبوع",
  weekday_price: "300",
  weekday_visible: "1",

  thursday_name: "الخميس",
  thursday_price: "450",
  thursday_visible: "1",

  friday_name: "الجمعة",
  friday_price: "550",
  friday_visible: "1",

  insurance_visible: "1",
  insurance_amount: "400",
  insurance_title: "تفاصيل التأمين المسترد",

  insurance_description:
    "يتم تحصيل مبلغ التأمين للمحافظة على المكان ومحتوياته. يعاد المبلغ بعد انتهاء الحجز وفحص المكان والتأكد من عدم وجود تلفيات أو فقدان للممتلكات أو مخالفة لشروط الحجز.",

  card_visible: "1",
  card_name: "بطاقة ائتمان",

  card_description:
    "الدفع باستخدام بطاقة بنكية عبر بوابة دفع آمنة.",

  card_url: "",

  bank_visible: "1",
  bank_name: "تحويل بنكي",

  bank_description:
    "سيتم تحويلك إلى واتساب لإكمال عملية التحويل البنكي.",

  bank_whatsapp: "",

  bank_message:
    "السلام عليكم، أرغب بإكمال دفع الحجز رقم {booking_number}. المبلغ المطلوب {amount} ريال.",

  payment_bot_username: "@mkkkooo5599_bot"
};

const DEFAULT_SERVICES = [
  [
    "تدفئة المسبح",
    "تشغيل تدفئة المسبح خلال فترة الحجز.",
    100,
    1
  ],
  [
    "تجهيز مناسبة",
    "تجهيز أساسي للمناسبات والاحتفالات.",
    250,
    2
  ],
  [
    "تزيين بالبالونات",
    "تنسيق بالونات مناسب للاحتفال.",
    150,
    3
  ],
  [
    "تنسيق ورد",
    "تنسيق ورد للجلسة أو المناسبة.",
    150,
    4
  ],
  [
    "قهوة وضيافة",
    "قهوة عربية وشاي ومياه للضيوف.",
    120,
    5
  ],
  [
    "مستلزمات شواء",
    "فحم وأدوات وتجهيز منطقة الشواء.",
    50,
    6
  ],
  [
    "فطور صباحي",
    "تجهيز فطور خفيف حسب عدد الأشخاص.",
    180,
    7
  ],
  [
    "تسجيل دخول مبكر",
    "الدخول قبل الموعد الرسمي حسب التوفر.",
    100,
    8
  ],
  [
    "تسجيل خروج متأخر",
    "تمديد وقت الخروج حسب التوفر.",
    100,
    9
  ]
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: JSON_HEADERS
      });
    }

    try {
      await ensureDatabase(env);

      if (
        url.pathname === "/api/status" &&
        request.method === "GET"
      ) {
        return json({
          ok: true,
          service: "chalet-booking",
          database: true
        });
      }

      if (
        url.pathname === "/api/config" &&
        request.method === "GET"
      ) {
        return getPublicConfig(env);
      }

      if (
        url.pathname === "/api/bookings" &&
        request.method === "POST"
      ) {
        return receiveBookingInvoice(
          request,
          env
        );
      }

      if (
        url.pathname === "/api/payment/card" &&
        request.method === "POST"
      ) {
        return prepareCardPayment(
          request,
          env
        );
      }

      if (
        url.pathname === "/telegram" &&
        request.method === "POST"
      ) {
        return handleTelegramWebhook(
          request,
          env
        );
      }

      if (
        url.pathname === "/setup-webhook" &&
        request.method === "GET"
      ) {
        return setupWebhook(
          env,
          url.origin
        );
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);

      return json(
        {
          ok: false,
          error: "internal_error",
          message: String(
            error?.message || error
          )
        },
        500
      );
    }
  }
};

/* =========================
   إنشاء الجداول
========================= */

async function ensureDatabase(env) {
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      )
    `),

    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price REAL NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      )
    `),

    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        visible INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      )
    `),

    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS bot_states (
        chat_id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        payload TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      )
    `)
  ]);

  for (
    const [key, value]
    of Object.entries(DEFAULT_SETTINGS)
  ) {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO settings (
        key,
        value
      )
      VALUES (?, ?)
    `).bind(
      key,
      value
    ).run();
  }

  const serviceCount =
    await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM services
    `).first();

  if (
    Number(serviceCount?.count || 0) === 0
  ) {
    for (
      const [
        name,
        description,
        price,
        sortOrder
      ] of DEFAULT_SERVICES
    ) {
      await env.DB.prepare(`
        INSERT INTO services (
          name,
          description,
          price,
          visible,
          sort_order
        )
        VALUES (?, ?, ?, 1, ?)
      `).bind(
        name,
        description,
        price,
        sortOrder
      ).run();
    }
  }
}

async function getSettings(env) {
  const result =
    await env.DB.prepare(`
      SELECT key, value
      FROM settings
    `).all();

  const settings = {};

  for (
    const row
    of result.results || []
  ) {
    settings[row.key] = row.value;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

async function saveSetting(
  env,
  key,
  value
) {
  await env.DB.prepare(`
    INSERT INTO settings (
      key,
      value,
      updated_at
    )
    VALUES (?, ?, CURRENT_TIMESTAMP)

    ON CONFLICT(key)
    DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    key,
    String(value)
  ).run();
}

/* =========================
   إعدادات الموقع العامة
========================= */

async function getPublicConfig(env) {
  const settings =
    await getSettings(env);

  const servicesResult =
    await env.DB.prepare(`
      SELECT
        id,
        name,
        description,
        price,
        visible
      FROM services
      WHERE visible = 1
      ORDER BY sort_order ASC, id ASC
    `).all();

  const periodsResult =
    await env.DB.prepare(`
      SELECT
        id,
        type,
        name,
        start_date,
        end_date,
        price,
        visible
      FROM periods
      WHERE visible = 1
      ORDER BY start_date ASC
    `).all();

  const occasions = [];
  const seasons = [];

  for (
    const row
    of periodsResult.results || []
  ) {
    const item = {
      id: Number(row.id),
      name: row.name,
      start: row.start_date,
      end: row.end_date,
      price: Number(row.price),
      enabled:
        Number(row.visible) === 1
    };

    if (row.type === "season") {
      seasons.push(item);
    } else {
      occasions.push(item);
    }
  }

  return json({
    ok: true,

    site: {
      enabled:
        enabled(settings.site_enabled),

      title:
        settings.site_title,

      subtitle:
        settings.site_subtitle,

      maintenanceMessage:
        settings.maintenance_message
    },

    pricing: {
      weekdays: {
        name:
          settings.weekday_name,

        price:
          number(settings.weekday_price),

        visible:
          enabled(
            settings.weekday_visible
          )
      },

      thursday: {
        name:
          settings.thursday_name,

        price:
          number(
            settings.thursday_price
          ),

        visible:
          enabled(
            settings.thursday_visible
          )
      },

      friday: {
        name:
          settings.friday_name,

        price:
          number(
            settings.friday_price
          ),

        visible:
          enabled(
            settings.friday_visible
          )
      },

      occasions: {
        name: "المناسبات",
        visible: true,
        dates: occasions
      },

      seasons: {
        name: "المواسم",
        visible: true,
        dates: seasons
      }
    },

    insurance: {
      visible:
        enabled(
          settings.insurance_visible
        ),

      amount:
        number(
          settings.insurance_amount
        ),

      title:
        settings.insurance_title,

      description:
        settings.insurance_description
    },

    services:
      (servicesResult.results || [])
        .map(row => ({
          id: Number(row.id),
          name: row.name,
          description: row.description,
          price: Number(row.price),
          visible:
            Number(row.visible) === 1
        })),

    payment: {
      card: {
        visible:
          enabled(
            settings.card_visible
          ),

        name:
          settings.card_name,

        description:
          settings.card_description
      },

      bank: {
        visible:
          enabled(
            settings.bank_visible
          ),

        name:
          settings.bank_name,

        description:
          settings.bank_description,

        whatsappNumber:
          settings.bank_whatsapp,

        whatsappMessage:
          settings.bank_message
      }
    }
  });
}

/* =========================
   استقبال فاتورة الحجز
========================= */

async function receiveBookingInvoice(
  request,
  env
) {
  const body =
    await request.json();

  if (
    !body?.customer ||
    !body?.booking ||
    !body?.amounts
  ) {
    return json(
      {
        ok: false,
        error:
          "invalid_booking_data",
        message:
          "بيانات الحجز غير مكتملة."
      },
      400
    );
  }

  const bookingNumber =
    clean(
      body.bookingNumber,
      50
    ) ||
    `BK-${Date.now()}`;

  const caption =
    buildInvoiceCaption({
      ...body,
      bookingNumber
    });

  if (
    typeof body.invoiceImage ===
      "string" &&
    body.invoiceImage.startsWith(
      "data:image/"
    )
  ) {
    await sendInvoicePhoto(
      env,
      bookingNumber,
      body.invoiceImage,
      caption
    );
  } else {
    await telegram(
      env,
      "sendMessage",
      {
        chat_id:
          env.ADMIN_CHAT_ID,

        text:
          caption,

        parse_mode:
          "HTML"
      }
    );
  }

  return json({
    ok: true,
    bookingNumber
  });
}

function buildInvoiceCaption(data) {
  const customer =
    data.customer || {};

  const booking =
    data.booking || {};

  const amounts =
    data.amounts || {};

  const services =
    Array.isArray(
      booking.services
    )
      ? booking.services
      : [];

  const servicesText =
    services.length
      ? services
          .map(
            service =>
              service.name
          )
          .join("، ")
      : "بدون خدمات إضافية";

  const location =
    customer.district
      ? `${customer.city}، ${customer.district}`
      : customer.city;

  return [
    "🏡 <b>طلب حجز جديد</b>",
    "",
    `🔖 <b>رقم الحجز:</b> ${html(data.bookingNumber)}`,
    `👤 <b>الاسم:</b> ${html(customer.fullName)}`,
    `📱 <b>الجوال:</b> ${html(customer.phone)}`,
    `📍 <b>الموقع:</b> ${html(location)}`,
    `👥 <b>نوع الحجز:</b> ${html(customer.bookingType)}`,
    `🧑‍🤝‍🧑 <b>عدد الأشخاص:</b> ${number(customer.peopleTotal)}`,
    "",
    `📅 <b>الدخول:</b> ${html(booking.checkInDate)} — ${html(booking.checkInTime)}`,
    `📅 <b>الخروج:</b> ${html(booking.checkOutDate)} — ${html(booking.checkOutTime)}`,
    `🌙 <b>عدد الليالي:</b> ${number(booking.nightsCount)}`,
    "",
    `🛎 <b>الخدمات:</b> ${html(servicesText)}`,
    `📝 <b>الملاحظات:</b> ${html(customer.notes || "لا توجد")}`,
    "",
    `🏠 <b>الإقامة:</b> ${money(amounts.stay)}`,
    `➕ <b>الخدمات:</b> ${money(amounts.services)}`,
    `🔐 <b>التأمين:</b> ${money(amounts.insurance)}`,
    `💰 <b>المبلغ الكامل:</b> ${money(amounts.total)}`
  ].join("\n");
}

async function sendInvoicePhoto(
  env,
  bookingNumber,
  dataUrl,
  caption
) {
  const image =
    decodeDataUrl(dataUrl);

  const form =
    new FormData();

  form.append(
    "chat_id",
    String(env.ADMIN_CHAT_ID)
  );

  form.append(
    "caption",
    caption
  );

  form.append(
    "parse_mode",
    "HTML"
  );

  form.append(
    "photo",
    new Blob(
      [image.bytes],
      {
        type:
          image.mimeType
      }
    ),
    `invoice-${bookingNumber}.png`
  );

  const response =
    await fetch(
      `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: form
      }
    );

  const result =
    await response.json();

  if (!result.ok) {
    throw new Error(
      result.description ||
      "فشل إرسال صورة الفاتورة"
    );
  }
}

function decodeDataUrl(dataUrl) {
  const match =
    dataUrl.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

  if (!match) {
    throw new Error(
      "صيغة الصورة غير صحيحة"
    );
  }

  const binary =
    atob(match[2]);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let index = 0;
    index < binary.length;
    index++
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  return {
    mimeType: match[1],
    bytes
  };
}

/* =========================
   تجهيز دفع البطاقة
========================= */

async function prepareCardPayment(
  request,
  env
) {
  const body =
    await request.json();

  const bookingNumber =
    clean(
      body.bookingNumber,
      60
    );

  const amount =
    number(
      body.amount ??
      body.total
    );

  if (!bookingNumber) {
    return json(
      {
        ok: false,
        error:
          "missing_booking_number",
        message:
          "رقم الحجز غير موجود."
      },
      400
    );
  }

  if (!(amount > 0)) {
    return json(
      {
        ok: false,
        error:
          "missing_payment_amount",
        message:
          "مبلغ الدفع غير موجود."
      },
      400
    );
  }

  const settings =
    await getSettings(env);

  if (
    !enabled(
      settings.card_visible
    )
  ) {
    return json(
      {
        ok: false,
        error:
          "card_payment_disabled",
        message:
          "الدفع بالبطاقة غير متاح حاليًا."
      },
      409
    );
  }

  if (!settings.card_url) {
    return json(
      {
        ok: false,
        error:
          "payment_url_missing",
        message:
          "الدفع بالبطاقة غير متاح حاليًا، يرجى اختيار طريقة دفع أخرى."
      },
      409
    );
  }

  const formattedAmount =
    `SAR ${amount.toFixed(2)}`;

  if (
    settings.payment_bot_username
  ) {
    try {
      await telegram(
        env,
        "sendMessage",
        {
          chat_id:
            settings
              .payment_bot_username,

          text:
            formattedAmount
        }
      );
    } catch (error) {
      console.error(
        "Payment message error:",
        error
      );
    }
  }

  return json({
    ok: true,
    bookingNumber,
    amount:
      formattedAmount,

    paymentUrl:
      settings.card_url
  });
}

/* =========================
   ربط Webhook
========================= */

async function setupWebhook(
  env,
  origin
) {
  const secret =
    await webhookSecret(
      env.ADMIN_BOT_TOKEN
    );

  const webhookUrl =
    `${origin}/telegram`;

  const result =
    await telegram(
      env,
      "setWebhook",
      {
        url:
          webhookUrl,

        secret_token:
          secret,

        allowed_updates: [
          "message"
        ],

        drop_pending_updates:
          true
      }
    );

  return json({
    ok: true,
    webhookUrl,
    telegram:
      result
  });
}

async function handleTelegramWebhook(
  request,
  env
) {
  const expectedSecret =
    await webhookSecret(
      env.ADMIN_BOT_TOKEN
    );

  const receivedSecret =
    request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token"
    ) || "";

  if (
    receivedSecret !==
    expectedSecret
  ) {
    return json(
      {
        ok: false,
        error:
          "unauthorized"
      },
      401
    );
  }

  const update =
    await request.json();

  if (update.message) {
    await handleMessage(
      env,
      update.message
    );
  }

  return json({
    ok: true
  });
}

/* =========================
   معالجة رسائل الإدارة
========================= */

async function handleMessage(
  env,
  message
) {
  const chatId =
    String(
      message.chat?.id || ""
    );

  const text =
    clean(
      message.text,
      6000
    );

  if (
    !chatId ||
    chatId !==
      String(env.ADMIN_CHAT_ID)
  ) {
    return;
  }

  if (
    text === "/start" ||
    text === "/menu" ||
    text === BUTTONS.MAIN
  ) {
    await clearState(
      env,
      chatId
    );

    await sendMainMenu(
      env,
      chatId
    );

    return;
  }

  if (
    text === BUTTONS.CANCEL
  ) {
    const oldState =
      await getState(
        env,
        chatId
      );

    await clearState(
      env,
      chatId
    );

    await returnToMenu(
      env,
      chatId,
      oldState?.payload
        ?.returnMenu
    );

    return;
  }

  if (
    text === BUTTONS.BACK
  ) {
    const oldState =
      await getState(
        env,
        chatId
      );

    await clearState(
      env,
      chatId
    );

    await returnToMenu(
      env,
      chatId,
      oldState?.payload
        ?.returnMenu
    );

    return;
  }

  if (
    await handleMenuButton(
      env,
      chatId,
      text
    )
  ) {
    return;
  }

  const state =
    await getState(
      env,
      chatId
    );

  if (state) {
    await processState(
      env,
      chatId,
      text,
      state
    );

    return;
  }

  await sendMainMenu(
    env,
    chatId
  );
}

async function handleMenuButton(
  env,
  chatId,
  text
) {
  switch (text) {
    case BUTTONS.SITE:
      await sendSiteMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.PRICES:
      await sendPricesMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.SERVICES:
      await sendServicesMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.PERIODS:
      await sendPeriodsMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.INSURANCE:
      await sendInsuranceMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.PAYMENT:
      await sendPaymentMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.SITE_TOGGLE:
      await toggleSetting(
        env,
        "site_enabled"
      );

      await sendSiteMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.SITE_TITLE:
      await beginSettingEdit(
        env,
        chatId,
        "site_title",
        "أرسل عنوان الموقع الجديد:",
        "site"
      );
      return true;

    case BUTTONS.SITE_SUBTITLE:
      await beginSettingEdit(
        env,
        chatId,
        "site_subtitle",
        "أرسل وصف الموقع الجديد:",
        "site"
      );
      return true;

    case BUTTONS.SITE_MAINTENANCE:
      await beginSettingEdit(
        env,
        chatId,
        "maintenance_message",
        "أرسل نص الصيانة الجديد:",
        "site"
      );
      return true;

    case BUTTONS.WEEKDAY_PRICE:
      await beginSettingEdit(
        env,
        chatId,
        "weekday_price",
        "أرسل سعر أيام الأسبوع:",
        "prices"
      );
      return true;

    case BUTTONS.THURSDAY_PRICE:
      await beginSettingEdit(
        env,
        chatId,
        "thursday_price",
        "أرسل سعر يوم الخميس:",
        "prices"
      );
      return true;

    case BUTTONS.FRIDAY_PRICE:
      await beginSettingEdit(
        env,
        chatId,
        "friday_price",
        "أرسل سعر يوم الجمعة:",
        "prices"
      );
      return true;

    case BUTTONS.INSURANCE_TOGGLE:
      await toggleSetting(
        env,
        "insurance_visible"
      );

      await sendInsuranceMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.INSURANCE_AMOUNT:
      await beginSettingEdit(
        env,
        chatId,
        "insurance_amount",
        "أرسل مبلغ التأمين الجديد:",
        "insurance"
      );
      return true;

    case BUTTONS.INSURANCE_TITLE:
      await beginSettingEdit(
        env,
        chatId,
        "insurance_title",
        "أرسل عنوان التأمين الجديد:",
        "insurance"
      );
      return true;

    case BUTTONS.INSURANCE_DESCRIPTION:
      await beginSettingEdit(
        env,
        chatId,
        "insurance_description",
        "أرسل نص التأمين الجديد:",
        "insurance"
      );
      return true;

    case BUTTONS.CARD_TOGGLE:
      await toggleSetting(
        env,
        "card_visible"
      );

      await sendPaymentMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.BANK_TOGGLE:
      await toggleSetting(
        env,
        "bank_visible"
      );

      await sendPaymentMenu(
        env,
        chatId
      );
      return true;

    case BUTTONS.CARD_URL:
      await beginSettingEdit(
        env,
        chatId,
        "card_url",
        "أرسل رابط بوابة الدفع كاملًا ويبدأ بـ https://",
        "payment"
      );
      return true;

    case BUTTONS.PAYMENT_BOT:
      await beginSettingEdit(
        env,
        chatId,
        "payment_bot_username",
        "أرسل اسم بوت الدفع ويبدأ بعلامة @",
        "payment"
      );
      return true;

    case BUTTONS.CARD_NAME:
      await beginSettingEdit(
        env,
        chatId,
        "card_name",
        "أرسل اسم طريقة دفع البطاقة:",
        "payment"
      );
      return true;

    case BUTTONS.CARD_DESCRIPTION:
      await beginSettingEdit(
        env,
        chatId,
        "card_description",
        "أرسل وصف دفع البطاقة:",
        "payment"
      );
      return true;

    case BUTTONS.BANK_NAME:
      await beginSettingEdit(
        env,
        chatId,
        "bank_name",
        "أرسل اسم طريقة التحويل البنكي:",
        "payment"
      );
      return true;

    case BUTTONS.BANK_DESCRIPTION:
      await beginSettingEdit(
        env,
        chatId,
        "bank_description",
        "أرسل وصف التحويل البنكي:",
        "payment"
      );
      return true;

    case BUTTONS.BANK_WHATSAPP:
      await beginSettingEdit(
        env,
        chatId,
        "bank_whatsapp",
        "أرسل رقم واتساب مع رمز الدولة، بدون + أو مسافات.",
        "payment"
      );
      return true;

    case BUTTONS.BANK_MESSAGE:
      await beginSettingEdit(
        env,
        chatId,
        "bank_message",
        "أرسل رسالة التحويل الجديدة. يمكنك استخدام {booking_number} و {amount}.",
        "payment"
      );
      return true;

    case BUTTONS.SERVICE_ADD:
      await beginState(
        env,
        chatId,
        "add_service",
        {
          returnMenu:
            "services"
        },
        "أرسل بيانات الخدمة بهذا الشكل:\n\nالاسم | الوصف | السعر\n\nمثال:\nتدفئة المسبح | تشغيل التدفئة خلال الحجز | 100"
      );
      return true;

    case BUTTONS.SERVICE_LIST:
      await sendServicesList(
        env,
        chatId
      );
      return true;

    case BUTTONS.SERVICE_EDIT:
      await beginState(
        env,
        chatId,
        "ask_edit_service_id",
        {
          returnMenu:
            "services"
        },
        "أرسل رقم الخدمة التي تريد تعديلها."
      );
      return true;

    case BUTTONS.SERVICE_TOGGLE:
      await beginState(
        env,
        chatId,
        "toggle_service",
        {
          returnMenu:
            "services"
        },
        "أرسل رقم الخدمة التي تريد إظهارها أو إخفاءها."
      );
      return true;

    case BUTTONS.SERVICE_DELETE:
      await beginState(
        env,
        chatId,
        "delete_service",
        {
          returnMenu:
            "services"
        },
        "أرسل رقم الخدمة التي تريد حذفها."
      );
      return true;

    case BUTTONS.PERIOD_ADD_SEASON:
      await beginState(
        env,
        chatId,
        "add_period",
        {
          type: "season",
          returnMenu:
            "periods"
        },
        "أرسل بيانات الموسم:\n\nالاسم | تاريخ البداية | تاريخ النهاية | السعر\n\nمثال:\nموسم الصيف | 2026-07-15 | 2026-08-31 | 1000"
      );
      return true;

    case BUTTONS.PERIOD_ADD_OCCASION:
      await beginState(
        env,
        chatId,
        "add_period",
        {
          type:
            "occasion",
          returnMenu:
            "periods"
        },
        "أرسل بيانات المناسبة:\n\nالاسم | تاريخ البداية | تاريخ النهاية | السعر"
      );
      return true;

    case BUTTONS.PERIOD_LIST:
      await sendPeriodsList(
        env,
        chatId
      );
      return true;

    case BUTTONS.PERIOD_TOGGLE:
      await beginState(
        env,
        chatId,
        "toggle_period",
        {
          returnMenu:
            "periods"
        },
        "أرسل رقم الفترة التي تريد إظهارها أو إخفاءها."
      );
      return true;

    case BUTTONS.PERIOD_DELETE:
      await beginState(
        env,
        chatId,
        "delete_period",
        {
          returnMenu:
            "periods"
        },
        "أرسل رقم الفترة التي تريد حذفها."
      );
      return true;

    default:
      return false;
  }
}

/* =========================
   لوحات الأزرار الثابتة
========================= */

function mainKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.SITE,
      BUTTONS.PRICES
    ],
    [
      BUTTONS.SERVICES,
      BUTTONS.PERIODS
    ],
    [
      BUTTONS.INSURANCE,
      BUTTONS.PAYMENT
    ]
  ]);
}

function siteKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.SITE_TOGGLE
    ],
    [
      BUTTONS.SITE_TITLE,
      BUTTONS.SITE_SUBTITLE
    ],
    [
      BUTTONS.SITE_MAINTENANCE
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function pricesKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.WEEKDAY_PRICE
    ],
    [
      BUTTONS.THURSDAY_PRICE,
      BUTTONS.FRIDAY_PRICE
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function insuranceKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.INSURANCE_TOGGLE
    ],
    [
      BUTTONS.INSURANCE_AMOUNT
    ],
    [
      BUTTONS.INSURANCE_TITLE,
      BUTTONS.INSURANCE_DESCRIPTION
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function paymentKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.CARD_TOGGLE,
      BUTTONS.BANK_TOGGLE
    ],
    [
      BUTTONS.CARD_URL
    ],
    [
      BUTTONS.PAYMENT_BOT
    ],
    [
      BUTTONS.CARD_NAME,
      BUTTONS.CARD_DESCRIPTION
    ],
    [
      BUTTONS.BANK_NAME,
      BUTTONS.BANK_DESCRIPTION
    ],
    [
      BUTTONS.BANK_WHATSAPP
    ],
    [
      BUTTONS.BANK_MESSAGE
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function servicesKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.SERVICE_ADD,
      BUTTONS.SERVICE_LIST
    ],
    [
      BUTTONS.SERVICE_EDIT
    ],
    [
      BUTTONS.SERVICE_TOGGLE,
      BUTTONS.SERVICE_DELETE
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function periodsKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.PERIOD_ADD_SEASON,
      BUTTONS.PERIOD_ADD_OCCASION
    ],
    [
      BUTTONS.PERIOD_LIST
    ],
    [
      BUTTONS.PERIOD_TOGGLE,
      BUTTONS.PERIOD_DELETE
    ],
    [
      BUTTONS.BACK
    ]
  ]);
}

function cancelKeyboard() {
  return replyKeyboard([
    [
      BUTTONS.CANCEL,
      BUTTONS.BACK
    ]
  ]);
}

function replyKeyboard(rows) {
  return {
    keyboard:
      rows.map(row =>
        row.map(text => ({
          text
        }))
      ),

    resize_keyboard:
      true,

    is_persistent:
      true,

    one_time_keyboard:
      false,

    input_field_placeholder:
      "اختر من الأزرار"
  };
}

/* =========================
   إرسال القوائم
========================= */

async function sendMainMenu(
  env,
  chatId
) {
  await sendMessage(
    env,
    chatId,
    "⚙️ <b>إدارة موقع الحجز</b>\n\nاختر القسم المطلوب من الأزرار الموجودة أسفل المحادثة.",
    mainKeyboard(),
    "HTML"
  );
}

async function sendSiteMenu(
  env,
  chatId
) {
  const settings =
    await getSettings(env);

  await sendMessage(
    env,
    chatId,
    "🏡 <b>إعدادات الموقع</b>\n\n" +
    `الحالة: ${
      enabled(
        settings.site_enabled
      )
        ? "🟢 يعمل"
        : "🔴 متوقف"
    }\n\n` +
    `<b>العنوان:</b>\n${html(settings.site_title)}\n\n` +
    `<b>الوصف:</b>\n${html(settings.site_subtitle)}`,
    siteKeyboard(),
    "HTML"
  );
}

async function sendPricesMenu(
  env,
  chatId
) {
  const settings =
    await getSettings(env);

  await sendMessage(
    env,
    chatId,
    "💰 <b>الأسعار الأساسية</b>\n\n" +
    `أيام الأسبوع: ${money(settings.weekday_price)}\n` +
    `الخميس: ${money(settings.thursday_price)}\n` +
    `الجمعة: ${money(settings.friday_price)}`,
    pricesKeyboard(),
    "HTML"
  );
}

async function sendInsuranceMenu(
  env,
  chatId
) {
  const settings =
    await getSettings(env);

  await sendMessage(
    env,
    chatId,
    "🔐 <b>التأمين المسترد</b>\n\n" +
    `الحالة: ${
      enabled(
        settings.insurance_visible
      )
        ? "🟢 ظاهر"
        : "🔴 مخفي"
    }\n` +
    `المبلغ: ${money(settings.insurance_amount)}\n\n` +
    `<b>${html(settings.insurance_title)}</b>\n` +
    `${html(settings.insurance_description)}`,
    insuranceKeyboard(),
    "HTML"
  );
}

async function sendPaymentMenu(
  env,
  chatId
) {
  const settings =
    await getSettings(env);

  await sendMessage(
    env,
    chatId,
    "💳 <b>طرق الدفع</b>\n\n" +
    `البطاقة: ${
      enabled(
        settings.card_visible
      )
        ? "🟢 ظاهرة"
        : "🔴 مخفية"
    }\n` +
    `التحويل: ${
      enabled(
        settings.bank_visible
      )
        ? "🟢 ظاهر"
        : "🔴 مخفي"
    }\n\n` +
    `<b>رابط البطاقة:</b>\n<code>${html(settings.card_url || "غير مضاف")}</code>\n\n` +
    `<b>رقم واتساب التحويل:</b>\n<code>${html(settings.bank_whatsapp || "غير مضاف")}</code>\n\n` +
    `<b>بوت الدفع:</b>\n<code>${html(settings.payment_bot_username || "غير مضاف")}</code>`,
    paymentKeyboard(),
    "HTML"
  );
}

async function sendServicesMenu(
  env,
  chatId
) {
  await sendMessage(
    env,
    chatId,
    "🛎 <b>إدارة الخدمات</b>\n\nيمكنك الإضافة أو التعديل أو الإظهار والإخفاء أو الحذف من الأزرار.",
    servicesKeyboard(),
    "HTML"
  );
}

async function sendPeriodsMenu(
  env,
  chatId
) {
  await sendMessage(
    env,
    chatId,
    "🎉 <b>المواسم والمناسبات</b>\n\nيمكنك إضافة موسم أو مناسبة والتحكم بالفترات الحالية.",
    periodsKeyboard(),
    "HTML"
  );
}

async function sendServicesList(
  env,
  chatId
) {
  const result =
    await env.DB.prepare(`
      SELECT
        id,
        name,
        description,
        price,
        visible
      FROM services
      ORDER BY sort_order ASC, id ASC
    `).all();

  const services =
    result.results || [];

  if (!services.length) {
    await sendMessage(
      env,
      chatId,
      "لا توجد خدمات مضافة.",
      servicesKeyboard()
    );

    return;
  }

  const lines =
    services.map(service => {
      const status =
        Number(service.visible) === 1
          ? "🟢"
          : "🔴";

      return (
        `${status} <b>رقم ${service.id}</b>\n` +
        `${html(service.name)} — ${money(service.price)}\n` +
        `${html(service.description || "بدون وصف")}`
      );
    });

  await sendMessage(
    env,
    chatId,
    lines.join("\n\n"),
    servicesKeyboard(),
    "HTML"
  );
}

async function sendPeriodsList(
  env,
  chatId
) {
  const result =
    await env.DB.prepare(`
      SELECT
        id,
        type,
        name,
        start_date,
        end_date,
        price,
        visible
      FROM periods
      ORDER BY start_date ASC
    `).all();

  const periods =
    result.results || [];

  if (!periods.length) {
    await sendMessage(
      env,
      chatId,
      "لا توجد مواسم أو مناسبات مضافة.",
      periodsKeyboard()
    );

    return;
  }

  const lines =
    periods.map(period => {
      const status =
        Number(period.visible) === 1
          ? "🟢"
          : "🔴";

      const typeName =
        period.type === "season"
          ? "موسم"
          : "مناسبة";

      return (
        `${status} <b>رقم ${period.id}</b> — ${typeName}\n` +
        `${html(period.name)}\n` +
        `${html(period.start_date)} إلى ${html(period.end_date)}\n` +
        `${money(period.price)}`
      );
    });

  await sendMessage(
    env,
    chatId,
    lines.join("\n\n"),
    periodsKeyboard(),
    "HTML"
  );
}

/* =========================
   بدء عمليات الإدخال
========================= */

async function beginSettingEdit(
  env,
  chatId,
  key,
  prompt,
  returnMenu
) {
  await setState(
    env,
    chatId,
    "edit_setting",
    {
      key,
      returnMenu
    }
  );

  await sendMessage(
    env,
    chatId,
    prompt,
    cancelKeyboard()
  );
}

async function beginState(
  env,
  chatId,
  state,
  payload,
  prompt
) {
  await setState(
    env,
    chatId,
    state,
    payload
  );

  await sendMessage(
    env,
    chatId,
    prompt,
    cancelKeyboard()
  );
}

/* =========================
   معالجة القيم المدخلة
========================= */

async function processState(
  env,
  chatId,
  text,
  state
) {
  if (!text) {
    await sendMessage(
      env,
      chatId,
      "أرسل قيمة صحيحة.",
      cancelKeyboard()
    );
    return;
  }

  if (
    state.state ===
      "edit_setting"
  ) {
    await processSettingEdit(
      env,
      chatId,
      text,
      state
    );
    return;
  }

  if (
    state.state ===
      "add_service"
  ) {
    await processAddService(
      env,
      chatId,
      text,
      state
    );
    return;
  }

  if (
    state.state ===
      "ask_edit_service_id"
  ) {
    const id =
      integer(text);

    const service =
      await env.DB.prepare(`
        SELECT *
        FROM services
        WHERE id = ?
        LIMIT 1
      `).bind(id).first();

    if (!service) {
      await sendMessage(
        env,
        chatId,
        "لم يتم العثور على هذه الخدمة. أرسل رقم خدمة صحيحًا.",
        cancelKeyboard()
      );
      return;
    }

    await setState(
      env,
      chatId,
      "edit_service_data",
      {
        id,
        returnMenu:
          "services"
      }
    );

    await sendMessage(
      env,
      chatId,
      "أرسل البيانات الجديدة بهذا الشكل:\n\nالاسم | الوصف | السعر",
      cancelKeyboard()
    );

    return;
  }

  if (
    state.state ===
      "edit_service_data"
  ) {
    await processEditService(
      env,
      chatId,
      text,
      state
    );
    return;
  }

  if (
    state.state ===
      "toggle_service"
  ) {
    const id =
      integer(text);

    const result =
      await env.DB.prepare(`
        UPDATE services
        SET
          visible = CASE
            WHEN visible = 1 THEN 0
            ELSE 1
          END,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(id).run();

    if (
      Number(
        result.meta?.changes || 0
      ) === 0
    ) {
      await sendMessage(
        env,
        chatId,
        "لم يتم العثور على الخدمة.",
        cancelKeyboard()
      );
      return;
    }

    await clearState(
      env,
      chatId
    );

    await sendMessage(
      env,
      chatId,
      "✅ تم تغيير حالة الخدمة.",
      servicesKeyboard()
    );

    return;
  }

  if (
    state.state ===
      "delete_service"
  ) {
    const id =
      integer(text);

    const result =
      await env.DB.prepare(`
        DELETE FROM services
        WHERE id = ?
      `).bind(id).run();

    if (
      Number(
        result.meta?.changes || 0
      ) === 0
    ) {
      await sendMessage(
        env,
        chatId,
        "لم يتم العثور على الخدمة.",
        cancelKeyboard()
      );
      return;
    }

    await clearState(
      env,
      chatId
    );

    await sendMessage(
      env,
      chatId,
      "✅ تم حذف الخدمة.",
      servicesKeyboard()
    );

    return;
  }

  if (
    state.state ===
      "add_period"
  ) {
    await processAddPeriod(
      env,
      chatId,
      text,
      state
    );
    return;
  }

  if (
    state.state ===
      "toggle_period"
  ) {
    const id =
      integer(text);

    const result =
      await env.DB.prepare(`
        UPDATE periods
        SET visible = CASE
          WHEN visible = 1 THEN 0
          ELSE 1
        END
        WHERE id = ?
      `).bind(id).run();

    if (
      Number(
        result.meta?.changes || 0
      ) === 0
    ) {
      await sendMessage(
        env,
        chatId,
        "لم يتم العثور على الفترة.",
        cancelKeyboard()
      );
      return;
    }

    await clearState(
      env,
      chatId
    );

    await sendMessage(
      env,
      chatId,
      "✅ تم تغيير حالة الفترة.",
      periodsKeyboard()
    );

    return;
  }

  if (
    state.state ===
      "delete_period"
  ) {
    const id =
      integer(text);

    const result =
      await env.DB.prepare(`
        DELETE FROM periods
        WHERE id = ?
      `).bind(id).run();

    if (
      Number(
        result.meta?.changes || 0
      ) === 0
    ) {
      await sendMessage(
        env,
        chatId,
        "لم يتم العثور على الفترة.",
        cancelKeyboard()
      );
      return;
    }

    await clearState(
      env,
      chatId
    );

    await sendMessage(
      env,
      chatId,
      "✅ تم حذف الفترة.",
      periodsKeyboard()
    );
  }
}

async function processSettingEdit(
  env,
  chatId,
  text,
  state
) {
  const key =
    state.payload?.key;

  const numericKeys =
    new Set([
      "weekday_price",
      "thursday_price",
      "friday_price",
      "insurance_amount"
    ]);

  if (
    numericKeys.has(key)
  ) {
    const value =
      Number(text);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      await sendMessage(
        env,
        chatId,
        "أرسل رقمًا صحيحًا فقط.",
        cancelKeyboard()
      );
      return;
    }
  }

  if (
    key === "card_url" &&
    text &&
    !/^https:\/\//i.test(text)
  ) {
    await sendMessage(
      env,
      chatId,
      "الرابط يجب أن يبدأ بـ https://",
      cancelKeyboard()
    );
    return;
  }

  if (
    key ===
      "payment_bot_username" &&
    text &&
    !text.startsWith("@")
  ) {
    await sendMessage(
      env,
      chatId,
      "اسم البوت يجب أن يبدأ بعلامة @",
      cancelKeyboard()
    );
    return;
  }

  if (
    key === "bank_whatsapp"
  ) {
    const normalized =
      text.replace(/\D/g, "");

    if (
      normalized.length < 8 ||
      normalized.length > 18
    ) {
      await sendMessage(
        env,
        chatId,
        "أرسل رقم واتساب صحيحًا مع رمز الدولة وبدون علامة +.",
        cancelKeyboard()
      );
      return;
    }

    await saveSetting(
      env,
      key,
      normalized
    );
  } else {
    await saveSetting(
      env,
      key,
      text
    );
  }

  await clearState(
    env,
    chatId
  );

  await sendMessage(
    env,
    chatId,
    "✅ تم حفظ التعديل.",
    menuKeyboard(
      state.payload
        ?.returnMenu
    )
  );

  await returnToMenu(
    env,
    chatId,
    state.payload
      ?.returnMenu
  );
}

async function processAddService(
  env,
  chatId,
  text,
  state
) {
  const parts =
    text
      .split("|")
      .map(
        item =>
          item.trim()
      );

  if (
    parts.length < 3
  ) {
    await sendMessage(
      env,
      chatId,
      "الصيغة غير صحيحة.\n\nالاسم | الوصف | السعر",
      cancelKeyboard()
    );
    return;
  }

  const price =
    Number(parts[2]);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    await sendMessage(
      env,
      chatId,
      "السعر غير صحيح.",
      cancelKeyboard()
    );
    return;
  }

  const order =
    await env.DB.prepare(`
      SELECT
        COALESCE(
          MAX(sort_order),
          0
        ) + 1 AS next_order
      FROM services
    `).first();

  await env.DB.prepare(`
    INSERT INTO services (
      name,
      description,
      price,
      visible,
      sort_order
    )
    VALUES (?, ?, ?, 1, ?)
  `).bind(
    parts[0],
    parts[1],
    price,
    Number(
      order?.next_order || 1
    )
  ).run();

  await clearState(
    env,
    chatId
  );

  await sendMessage(
    env,
    chatId,
    "✅ تمت إضافة الخدمة.",
    servicesKeyboard()
  );
}

async function processEditService(
  env,
  chatId,
  text,
  state
) {
  const parts =
    text
      .split("|")
      .map(
        item =>
          item.trim()
      );

  if (
    parts.length < 3
  ) {
    await sendMessage(
      env,
      chatId,
      "الصيغة غير صحيحة.\n\nالاسم | الوصف | السعر",
      cancelKeyboard()
    );
    return;
  }

  const price =
    Number(parts[2]);

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    await sendMessage(
      env,
      chatId,
      "السعر غير صحيح.",
      cancelKeyboard()
    );
    return;
  }

  await env.DB.prepare(`
    UPDATE services
    SET
      name = ?,
      description = ?,
      price = ?,
      updated_at =
        CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    parts[0],
    parts[1],
    price,
    state.payload.id
  ).run();

  await clearState(
    env,
    chatId
  );

  await sendMessage(
    env,
    chatId,
    "✅ تم تعديل الخدمة.",
    servicesKeyboard()
  );
}

async function processAddPeriod(
  env,
  chatId,
  text,
  state
) {
  const parts =
    text
      .split("|")
      .map(
        item =>
          item.trim()
      );

  if (
    parts.length < 4
  ) {
    await sendMessage(
      env,
      chatId,
      "الصيغة غير صحيحة.\n\nالاسم | البداية | النهاية | السعر",
      cancelKeyboard()
    );
    return;
  }

  const price =
    Number(parts[3]);

  if (
    !isDate(parts[1]) ||
    !isDate(parts[2]) ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    await sendMessage(
      env,
      chatId,
      "تأكد من كتابة التواريخ بهذا الشكل 2026-07-15 ومن كتابة سعر صحيح.",
      cancelKeyboard()
    );
    return;
  }

  if (
    parts[2] < parts[1]
  ) {
    await sendMessage(
      env,
      chatId,
      "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.",
      cancelKeyboard()
    );
    return;
  }

  await env.DB.prepare(`
    INSERT INTO periods (
      type,
      name,
      start_date,
      end_date,
      price,
      visible
    )
    VALUES (?, ?, ?, ?, ?, 1)
  `).bind(
    state.payload.type,
    parts[0],
    parts[1],
    parts[2],
    price
  ).run();

  await clearState(
    env,
    chatId
  );

  await sendMessage(
    env,
    chatId,
    "✅ تمت إضافة الفترة.",
    periodsKeyboard()
  );
}

/* =========================
   العودة إلى القوائم
========================= */

async function returnToMenu(
  env,
  chatId,
  menu
) {
  switch (menu) {
    case "site":
      await sendSiteMenu(
        env,
        chatId
      );
      return;

    case "prices":
      await sendPricesMenu(
        env,
        chatId
      );
      return;

    case "insurance":
      await sendInsuranceMenu(
        env,
        chatId
      );
      return;

    case "payment":
      await sendPaymentMenu(
        env,
        chatId
      );
      return;

    case "services":
      await sendServicesMenu(
        env,
        chatId
      );
      return;

    case "periods":
      await sendPeriodsMenu(
        env,
        chatId
      );
      return;

    default:
      await sendMainMenu(
        env,
        chatId
      );
  }
}

function menuKeyboard(menu) {
  switch (menu) {
    case "site":
      return siteKeyboard();

    case "prices":
      return pricesKeyboard();

    case "insurance":
      return insuranceKeyboard();

    case "payment":
      return paymentKeyboard();

    case "services":
      return servicesKeyboard();

    case "periods":
      return periodsKeyboard();

    default:
      return mainKeyboard();
  }
}

/* =========================
   حالات البوت
========================= */

async function setState(
  env,
  chatId,
  state,
  payload
) {
  await env.DB.prepare(`
    INSERT INTO bot_states (
      chat_id,
      state,
      payload,
      updated_at
    )
    VALUES (
      ?,
      ?,
      ?,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT(chat_id)
    DO UPDATE SET
      state =
        excluded.state,
      payload =
        excluded.payload,
      updated_at =
        CURRENT_TIMESTAMP
  `).bind(
    chatId,
    state,
    JSON.stringify(
      payload || {}
    )
  ).run();
}

async function getState(
  env,
  chatId
) {
  const row =
    await env.DB.prepare(`
      SELECT
        state,
        payload
      FROM bot_states
      WHERE chat_id = ?
      LIMIT 1
    `).bind(
      chatId
    ).first();

  if (!row) {
    return null;
  }

  let payload = {};

  try {
    payload =
      JSON.parse(
        row.payload || "{}"
      );
  } catch {
    payload = {};
  }

  return {
    state:
      row.state,
    payload
  };
}

async function clearState(
  env,
  chatId
) {
  await env.DB.prepare(`
    DELETE FROM bot_states
    WHERE chat_id = ?
  `).bind(
    chatId
  ).run();
}

async function toggleSetting(
  env,
  key
) {
  const settings =
    await getSettings(env);

  await saveSetting(
    env,
    key,
    enabled(settings[key])
      ? "0"
      : "1"
  );
}

/* =========================
   Telegram
========================= */

async function telegram(
  env,
  method,
  payload
) {
  const response =
    await fetch(
      `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/${method}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  const result =
    await response.json();

  if (!result.ok) {
    throw new Error(
      result.description ||
      `Telegram ${method} failed`
    );
  }

  return result;
}

async function sendMessage(
  env,
  chatId,
  text,
  replyMarkup,
  parseMode
) {
  const payload = {
    chat_id:
      chatId,

    text,

    reply_markup:
      replyMarkup
  };

  if (parseMode) {
    payload.parse_mode =
      parseMode;
  }

  return telegram(
    env,
    "sendMessage",
    payload
  );
}

async function webhookSecret(
  token
) {
  const bytes =
    new TextEncoder()
      .encode(token);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      bytes
    );

  return [
    ...new Uint8Array(
      digest
    )
  ]
    .map(
      value =>
        value
          .toString(16)
          .padStart(2, "0")
    )
    .join("")
    .slice(0, 64);
}

/* =========================
   الأدوات
========================= */

function json(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers:
        JSON_HEADERS
    }
  );
}

function enabled(value) {
  return String(value) === "1";
}

function number(value) {
  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}

function integer(value) {
  const result =
    Number.parseInt(
      String(value),
      10
    );

  return Number.isFinite(result)
    ? result
    : 0;
}

function clean(
  value,
  length = 1000
) {
  return String(
    value ?? ""
  )
    .trim()
    .slice(0, length);
}

function money(value) {
  return (
    `${number(value)
      .toLocaleString("en-US")} ريال`
  );
}

function html(value) {
  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/
    .test(
      String(value)
    );
}
