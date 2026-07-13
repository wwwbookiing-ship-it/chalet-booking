const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

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
      /* واجهات الموقع */
      if (url.pathname === "/api/config" && request.method === "GET") {
        return getPublicConfig(env);
      }

      if (url.pathname === "/api/bookings" && request.method === "POST") {
        return createBooking(request, env);
      }

      if (
        url.pathname === "/api/payment/card" &&
        request.method === "POST"
      ) {
        return prepareCardPayment(request, env);
      }

      /* Webhook بوت الإدارة */
      if (
        url.pathname === "/telegram" &&
        request.method === "POST"
      ) {
        return handleTelegramWebhook(request, env, url);
      }

      /* ربط Webhook */
      if (
        url.pathname === "/setup-webhook" &&
        request.method === "GET"
      ) {
        return setupTelegramWebhook(request, env, url);
      }

      /* فحص قاعدة البيانات */
      if (
        url.pathname === "/api/status" &&
        request.method === "GET"
      ) {
        const row = await env.DB
          .prepare("SELECT COUNT(*) AS count FROM settings")
          .first();

        return jsonResponse({
          ok: true,
          service: "chalet-booking",
          database: true,
          settingsCount: Number(row?.count || 0)
        });
      }

      /*
        بقية الطلبات، ومنها الصفحة الرئيسية،
        يتعامل معها Assets المرتبط بمجلد public.
      */
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error("Worker error:", error);

      return jsonResponse(
        {
          ok: false,
          error: "internal_error",
          message: String(error?.message || error)
        },
        500
      );
    }
  }
};

/* =========================================
   أدوات الرد
========================================= */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function cleanText(value, maximumLength = 1000) {
  return String(value ?? "")
    .trim()
    .slice(0, maximumLength);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toInteger(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function isEnabled(value) {
  return String(value) === "1";
}

function formatPaymentAmount(amount) {
  return `SAR ${Number(amount).toFixed(2)}`;
}

function formatRiyal(amount) {
  return `${Number(amount).toLocaleString("en-US")} ريال`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* =========================================
   قراءة الإعدادات
========================================= */

async function getSettingsMap(env) {
  const result = await env.DB
    .prepare("SELECT key, value FROM settings")
    .all();

  const settings = {};

  for (const row of result.results || []) {
    settings[row.key] = row.value;
  }

  return settings;
}

async function setSetting(env, key, value) {
  await env.DB
    .prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key)
      DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(key, String(value))
    .run();
}

/* =========================================
   إعدادات الموقع العامة
========================================= */

async function getPublicConfig(env) {
  const settings = await getSettingsMap(env);

  const servicesResult = await env.DB
    .prepare(`
      SELECT
        id,
        name,
        description,
        price,
        visible,
        sort_order
      FROM services
      WHERE visible = 1
      ORDER BY sort_order ASC, id ASC
    `)
    .all();

  const periodsResult = await env.DB
    .prepare(`
      SELECT
        id,
        type,
        name,
        start_date,
        end_date,
        price,
        visible
      FROM special_periods
      WHERE visible = 1
      ORDER BY start_date ASC
    `)
    .all();

  const occasions = [];
  const seasons = [];

  for (const period of periodsResult.results || []) {
    const item = {
      id: Number(period.id),
      name: period.name,
      start: period.start_date,
      end: period.end_date,
      price: Number(period.price),
      enabled: Number(period.visible) === 1
    };

    if (period.type === "season") {
      seasons.push(item);
    } else {
      occasions.push(item);
    }
  }

  return jsonResponse({
    ok: true,

    site: {
      enabled: isEnabled(settings.site_enabled),
      title: settings.site_title || "طلب حجز",
      subtitle: settings.site_subtitle || "",
      maintenanceMessage:
        settings.maintenance_message ||
        "الموقع تحت الصيانة حاليًا."
    },

    pricing: {
      weekdays: {
        name: settings.weekday_name || "أيام الأسبوع",
        price: toNumber(settings.weekday_price, 300),
        visible: isEnabled(settings.weekday_visible)
      },

      thursday: {
        name: settings.thursday_name || "الخميس",
        price: toNumber(settings.thursday_price, 450),
        visible: isEnabled(settings.thursday_visible)
      },

      friday: {
        name: settings.friday_name || "الجمعة",
        price: toNumber(settings.friday_price, 550),
        visible: isEnabled(settings.friday_visible)
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
      visible: isEnabled(settings.insurance_visible),
      amount: toNumber(settings.insurance_amount, 400),
      title:
        settings.insurance_title ||
        "تفاصيل التأمين المسترد",
      description:
        settings.insurance_description || ""
    },

    services: (servicesResult.results || []).map(service => ({
      id: Number(service.id),
      name: service.name,
      description: service.description || "",
      price: Number(service.price),
      visible: Number(service.visible) === 1
    })),

    payment: {
      card: {
        visible: isEnabled(settings.card_payment_visible),
        name:
          settings.card_payment_name ||
          "بطاقة ائتمان",
        description:
          settings.card_payment_description || ""
      },

      bank: {
        visible: isEnabled(settings.bank_payment_visible),
        name:
          settings.bank_payment_name ||
          "تحويل بنكي",
        description:
          settings.bank_payment_description || "",
        whatsappNumber:
          settings.bank_whatsapp_number || "",
        whatsappMessage:
          settings.bank_whatsapp_message || ""
      }
    }
  });
}

/* =========================================
   إنشاء الحجز
========================================= */

async function createBooking(request, env) {
  const settings = await getSettingsMap(env);

  if (!isEnabled(settings.site_enabled)) {
    return jsonResponse(
      {
        ok: false,
        error: "maintenance",
        message:
          settings.maintenance_message ||
          "الموقع تحت الصيانة حاليًا."
      },
      503
    );
  }

  const body = await request.json();

  const customer = body.customer || {};
  const booking = body.booking || {};
  const amounts = body.amounts || {};

  const bookingNumber =
    cleanText(body.bookingNumber, 40) ||
    generateBookingNumber();

  const fullName = cleanText(customer.fullName, 150);
  const phone = cleanText(customer.phone, 40);
  const city = cleanText(customer.city, 100);
  const district = cleanText(customer.district, 100);
  const bookingType = cleanText(customer.bookingType, 40);

  const checkInDate = cleanText(booking.checkInDate, 20);
  const checkInTime = cleanText(booking.checkInTime, 30);
  const checkOutDate = cleanText(booking.checkOutDate, 20);
  const checkOutTime = cleanText(booking.checkOutTime, 30);

  if (
    !fullName ||
    !phone ||
    !city ||
    !checkInDate ||
    !checkOutDate
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "missing_required_fields"
      },
      400
    );
  }

  const adults = Math.max(1, toInteger(customer.adults, 1));
  const children = Math.max(0, toInteger(customer.children, 0));
  const peopleTotal = adults + children;

  const nights = Array.isArray(booking.nights)
    ? booking.nights
    : [];

  const services = Array.isArray(booking.services)
    ? booking.services
    : [];

  const stayAmount = Math.max(0, toNumber(amounts.stay));
  const servicesAmount = Math.max(
    0,
    toNumber(amounts.services)
  );
  const insuranceAmount = Math.max(
    0,
    toNumber(amounts.insurance)
  );
  const totalAmount = Math.max(
    0,
    toNumber(amounts.total)
  );

  /*
    حماية أساسية: المبلغ الكامل يجب أن يساوي
    الإقامة + الخدمات + التأمين.
  */
  const expectedTotal =
    stayAmount +
    servicesAmount +
    insuranceAmount;

  if (Math.abs(expectedTotal - totalAmount) > 0.01) {
    return jsonResponse(
      {
        ok: false,
        error: "invalid_total"
      },
      400
    );
  }

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM bookings
      WHERE booking_number = ?
      LIMIT 1
    `)
    .bind(bookingNumber)
    .first();

  if (existing) {
    return jsonResponse(
      {
        ok: false,
        error: "duplicate_booking_number"
      },
      409
    );
  }

  const insertResult = await env.DB
    .prepare(`
      INSERT INTO bookings (
        booking_number,
        full_name,
        phone,
        city,
        district,
        booking_type,
        adults,
        children,
        people_total,
        check_in_date,
        check_in_time,
        check_out_date,
        check_out_time,
        nights_count,
        notes,
        stay_amount,
        services_amount,
        insurance_amount,
        total_amount,
        payment_status,
        booking_status,
        nights_json,
        services_json
      )
      VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        'pending',
        'pending',
        ?, ?
      )
    `)
    .bind(
      bookingNumber,
      fullName,
      phone,
      city,
      district,
      bookingType || "عائلات",
      adults,
      children,
      peopleTotal,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      Math.max(1, toInteger(booking.nightsCount, nights.length)),
      cleanText(customer.notes, 5000),
      stayAmount,
      servicesAmount,
      insuranceAmount,
      totalAmount,
      JSON.stringify(nights),
      JSON.stringify(services)
    )
    .run();

  const bookingId =
    Number(insertResult.meta?.last_row_id || 0);

  let telegramResult = null;

  try {
    telegramResult = await sendBookingToAdmin(env, {
      bookingId,
      bookingNumber,
      customer: {
        fullName,
        phone,
        city,
        district,
        bookingType,
        adults,
        children,
        peopleTotal,
        notes: cleanText(customer.notes, 5000)
      },
      booking: {
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        nightsCount:
          Math.max(1, toInteger(booking.nightsCount, nights.length)),
        nights,
        services
      },
      amounts: {
        stay: stayAmount,
        services: servicesAmount,
        insurance: insuranceAmount,
        total: totalAmount
      },
      invoiceImage: body.invoiceImage || ""
    });

    if (telegramResult?.messageId) {
      await env.DB
        .prepare(`
          UPDATE bookings
          SET
            telegram_message_id = ?,
            telegram_chat_id = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          telegramResult.messageId,
          String(env.ADMIN_CHAT_ID),
          bookingId
        )
        .run();
    }
  } catch (error) {
    /*
      لا نفشل إنشاء الحجز إذا تعذر إرسال Telegram،
      لأن الطلب محفوظ في D1.
    */
    console.error("Telegram invoice error:", error);
  }

  return jsonResponse({
    ok: true,
    bookingId,
    bookingNumber,
    total: totalAmount,
    telegramSent: Boolean(telegramResult)
  });
}

function generateBookingNumber() {
  const timePart = Date.now()
    .toString()
    .slice(-6);

  const randomPart = Math.floor(
    100 + Math.random() * 900
  );

  return `BK-${timePart}${randomPart}`;
}

/* =========================================
   إرسال الفاتورة لبوت الإدارة
========================================= */

async function sendBookingToAdmin(env, data) {
  if (!env.ADMIN_BOT_TOKEN || !env.ADMIN_CHAT_ID) {
    throw new Error(
      "ADMIN_BOT_TOKEN أو ADMIN_CHAT_ID غير موجود"
    );
  }

  const caption = buildBookingCaption(data);

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ قبول الحجز",
          callback_data: `booking_accept:${data.bookingId}`
        },
        {
          text: "❌ رفض الحجز",
          callback_data: `booking_reject:${data.bookingId}`
        }
      ],
      [
        {
          text: "💳 حالة الدفع",
          callback_data: `booking_payment:${data.bookingId}`
        },
        {
          text: "📋 عرض التفاصيل",
          callback_data: `booking_view:${data.bookingId}`
        }
      ]
    ]
  };

  /*
    إذا وصلتنا صورة فاتورة Base64 من الموقع،
    نرسلها كصورة. وإلا نرسل رسالة نصية.
  */
  if (
    typeof data.invoiceImage === "string" &&
    data.invoiceImage.startsWith("data:image/")
  ) {
    const image = dataUrlToBytes(data.invoiceImage);

    const form = new FormData();

    form.append("chat_id", String(env.ADMIN_CHAT_ID));
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    form.append(
      "reply_markup",
      JSON.stringify(keyboard)
    );

    form.append(
      "photo",
      new Blob([image.bytes], {
        type: image.mimeType
      }),
      `invoice-${data.bookingNumber}.png`
    );

    const response = await fetch(
      `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: form
      }
    );

    const result = await response.json();

    if (!result.ok) {
      throw new Error(
        result.description ||
        "فشل إرسال صورة الفاتورة"
      );
    }

    return {
      messageId: result.result.message_id,
      type: "photo"
    };
  }

  const response = await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: env.ADMIN_CHAT_ID,
      text: caption,
      parse_mode: "HTML",
      reply_markup: keyboard
    }
  );

  return {
    messageId: response.result.message_id,
    type: "text"
  };
}

function buildBookingCaption(data) {
  const location = data.customer.district
    ? `${data.customer.city}، ${data.customer.district}`
    : data.customer.city;

  const servicesText =
    data.booking.services.length > 0
      ? data.booking.services
          .map(service => service.name)
          .join("، ")
      : "بدون خدمات إضافية";

  return [
    "🏡 <b>طلب حجز جديد</b>",
    "",
    `🔖 <b>رقم الحجز:</b> ${escapeHtml(data.bookingNumber)}`,
    `👤 <b>العميل:</b> ${escapeHtml(data.customer.fullName)}`,
    `📱 <b>الجوال:</b> ${escapeHtml(data.customer.phone)}`,
    `📍 <b>الموقع:</b> ${escapeHtml(location)}`,
    `👥 <b>نوع الحجز:</b> ${escapeHtml(data.customer.bookingType)}`,
    `🧑‍🤝‍🧑 <b>عدد الأشخاص:</b> ${data.customer.peopleTotal}`,
    "",
    `📅 <b>الدخول:</b> ${escapeHtml(data.booking.checkInDate)} — ${escapeHtml(data.booking.checkInTime)}`,
    `📅 <b>الخروج:</b> ${escapeHtml(data.booking.checkOutDate)} — ${escapeHtml(data.booking.checkOutTime)}`,
    `🌙 <b>عدد الليالي:</b> ${data.booking.nightsCount}`,
    "",
    `🛎 <b>الخدمات:</b> ${escapeHtml(servicesText)}`,
    `📝 <b>الملاحظات:</b> ${escapeHtml(data.customer.notes || "لا توجد")}`,
    "",
    `🏠 <b>الإقامة:</b> ${formatRiyal(data.amounts.stay)}`,
    `➕ <b>الخدمات:</b> ${formatRiyal(data.amounts.services)}`,
    `🔐 <b>التأمين:</b> ${formatRiyal(data.amounts.insurance)}`,
    `💰 <b>المبلغ الكامل:</b> ${formatRiyal(data.amounts.total)}`,
    "",
    "⏳ <b>الحالة:</b> بانتظار الدفع"
  ].join("\n");
}

function dataUrlToBytes(dataUrl) {
  const match = dataUrl.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
  );

  if (!match) {
    throw new Error("صيغة صورة الفاتورة غير صحيحة");
  }

  const mimeType = match[1];
  const binary = atob(match[2]);

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    mimeType,
    bytes
  };
}

/* =========================================
   تجهيز الدفع بالبطاقة
========================================= */

async function prepareCardPayment(request, env) {
  const body = await request.json();

  const bookingNumber = cleanText(
    body.bookingNumber,
    40
  );

  if (!bookingNumber) {
    return jsonResponse(
      {
        ok: false,
        error: "missing_booking_number"
      },
      400
    );
  }

  const booking = await env.DB
    .prepare(`
      SELECT
        id,
        booking_number,
        total_amount,
        booking_status,
        payment_status
      FROM bookings
      WHERE booking_number = ?
      LIMIT 1
    `)
    .bind(bookingNumber)
    .first();

  if (!booking) {
    return jsonResponse(
      {
        ok: false,
        error: "booking_not_found"
      },
      404
    );
  }

  if (
    booking.booking_status === "rejected" ||
    booking.booking_status === "cancelled"
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "booking_unavailable"
      },
      409
    );
  }

  const settings = await getSettingsMap(env);

  if (!isEnabled(settings.card_payment_visible)) {
    return jsonResponse(
      {
        ok: false,
        error: "card_payment_disabled"
      },
      409
    );
  }

  const paymentPageUrl =
    env.PAYMENT_PAGE_URL ||
    settings.card_payment_url ||
    "";

  if (!paymentPageUrl) {
    return jsonResponse(
      {
        ok: false,
        error: "payment_url_missing"
      },
      500
    );
  }

  /*
    يرسل المبلغ من بوت الإدارة مباشرة إلى بوت الدفع.
  */
  const formattedAmount = await sendAmountToPaymentBot(
    env,
    booking.total_amount
  );

  await env.DB
    .prepare(`
      UPDATE bookings
      SET
        payment_method = 'card',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(booking.id)
    .run();

  return jsonResponse({
    ok: true,
    bookingNumber: booking.booking_number,
    amount: formattedAmount,
    paymentUrl: paymentPageUrl
  });
}

async function sendAmountToPaymentBot(env, amount) {
  if (!env.ADMIN_BOT_TOKEN) {
    throw new Error("ADMIN_BOT_TOKEN غير موجود");
  }

  if (!env.PAYMENT_BOT_USERNAME) {
    throw new Error("PAYMENT_BOT_USERNAME غير موجود");
  }

  const text = formatPaymentAmount(amount);

  const result = await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: env.PAYMENT_BOT_USERNAME,
      text
    }
  );

  if (!result.ok) {
    throw new Error(
      result.description ||
      "تعذر إرسال مبلغ الدفع"
    );
  }

  return text;
}

/* =========================================
   Telegram API
========================================= */

async function telegramApi(env, method, payload) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();

  if (!result.ok) {
    throw new Error(
      result.description ||
      `Telegram ${method} failed`
    );
  }

  return result;
}

/* =========================================
   إعداد Webhook
========================================= */

async function setupTelegramWebhook(request, env, url) {
  const key = url.searchParams.get("key") || "";

  if (
    !env.SETUP_SECRET ||
    key !== env.SETUP_SECRET
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "unauthorized"
      },
      401
    );
  }

  const webhookSecret =
    env.TELEGRAM_WEBHOOK_SECRET || "";

  if (!webhookSecret) {
    return jsonResponse(
      {
        ok: false,
        error: "TELEGRAM_WEBHOOK_SECRET_missing"
      },
      500
    );
  }

  const webhookUrl =
    `${url.origin}/telegram` +
    `?secret=${encodeURIComponent(webhookSecret)}`;

  const result = await telegramApi(
    env,
    "setWebhook",
    {
      url: webhookUrl,
      allowed_updates: [
        "message",
        "callback_query"
      ],
      drop_pending_updates: true
    }
  );

  return jsonResponse({
    ok: true,
    webhookUrl,
    telegram: result
  });
}

/* =========================================
   Webhook بوت الإدارة
========================================= */

async function handleTelegramWebhook(
  request,
  env,
  url
) {
  const secret =
    url.searchParams.get("secret") || "";

  if (
    !env.TELEGRAM_WEBHOOK_SECRET ||
    secret !== env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "invalid_webhook_secret"
      },
      401
    );
  }

  const update = await request.json();

  if (update.callback_query) {
    await handleCallbackQuery(
      env,
      update.callback_query
    );

    return jsonResponse({ ok: true });
  }

  if (update.message) {
    await handleBotMessage(
      env,
      update.message
    );

    return jsonResponse({ ok: true });
  }

  return jsonResponse({ ok: true });
}

async function handleBotMessage(env, message) {
  const chatId = String(message.chat?.id || "");
  const text = cleanText(message.text, 2000);

  if (!chatId) {
    return;
  }

  /*
    لا يسمح بالتحكم إلا لحساب الإدارة.
  */
  if (String(env.ADMIN_CHAT_ID) !== chatId) {
    return;
  }

  if (
    text === "/start" ||
    text === "/menu" ||
    text === "القائمة"
  ) {
    await sendAdminMenu(env, chatId);
    return;
  }

  const state = await getBotState(env, chatId);

  if (state) {
    await handleAdminState(
      env,
      chatId,
      text,
      state
    );
    return;
  }

  await sendAdminMenu(env, chatId);
}

async function sendAdminMenu(env, chatId) {
  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "⚙️ <b>إدارة موقع حجز الشاليه</b>\n\n" +
        "اختر القسم المطلوب:",

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📋 طلبات الحجز",
              callback_data: "admin_bookings"
            },
            {
              text: "📊 الإحصائيات",
              callback_data: "admin_stats"
            }
          ],
          [
            {
              text: "💰 الأسعار",
              callback_data: "admin_prices"
            },
            {
              text: "🛎 الخدمات",
              callback_data: "admin_services"
            }
          ],
          [
            {
              text: "🔐 التأمين",
              callback_data: "admin_insurance"
            },
            {
              text: "💳 رابط الدفع",
              callback_data: "admin_payment"
            }
          ],
          [
            {
              text: "🟢 تشغيل/إيقاف الموقع",
              callback_data: "admin_toggle_site"
            }
          ]
        ]
      }
    }
  );
}

/* =========================================
   أزرار الإدارة
========================================= */

async function handleCallbackQuery(env, query) {
  const chatId = String(
    query.message?.chat?.id || ""
  );

  if (
    !chatId ||
    String(env.ADMIN_CHAT_ID) !== chatId
  ) {
    return;
  }

  await telegramApi(
    env,
    "answerCallbackQuery",
    {
      callback_query_id: query.id
    }
  );

  const data = query.data || "";

  if (data === "admin_bookings") {
    await sendRecentBookings(env, chatId);
    return;
  }

  if (data === "admin_stats") {
    await sendStatistics(env, chatId);
    return;
  }

  if (data === "admin_prices") {
    await sendPricesMenu(env, chatId);
    return;
  }

  if (data === "admin_services") {
    await sendServicesList(env, chatId);
    return;
  }

  if (data === "admin_insurance") {
    await sendInsuranceMenu(env, chatId);
    return;
  }

  if (data === "admin_payment") {
    await sendPaymentMenu(env, chatId);
    return;
  }

  if (data === "admin_toggle_site") {
    await toggleSite(env, chatId);
    return;
  }

  if (data.startsWith("booking_view:")) {
    const id = toInteger(data.split(":")[1]);
    await sendBookingDetails(env, chatId, id);
    return;
  }

  if (data.startsWith("booking_accept:")) {
    const id = toInteger(data.split(":")[1]);
    await updateBookingStatus(
      env,
      chatId,
      id,
      "accepted"
    );
    return;
  }

  if (data.startsWith("booking_reject:")) {
    const id = toInteger(data.split(":")[1]);
    await updateBookingStatus(
      env,
      chatId,
      id,
      "rejected"
    );
    return;
  }

  if (data.startsWith("booking_payment:")) {
    const id = toInteger(data.split(":")[1]);
    await sendPaymentStatus(env, chatId, id);
    return;
  }

  if (data.startsWith("price_edit:")) {
    const key = data.split(":")[1];

    await saveBotState(env, chatId, "edit_setting", {
      key
    });

    await telegramApi(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "أرسل السعر الجديد بالأرقام فقط.\n" +
          "مثال: <code>450</code>",
        parse_mode: "HTML"
      }
    );

    return;
  }

  if (data === "insurance_edit_amount") {
    await saveBotState(env, chatId, "edit_setting", {
      key: "insurance_amount"
    });

    await telegramApi(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text: "أرسل قيمة التأمين الجديدة بالأرقام فقط."
      }
    );

    return;
  }

  if (data === "payment_edit_url") {
    await saveBotState(env, chatId, "edit_setting", {
      key: "card_payment_url"
    });

    await telegramApi(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text: "أرسل رابط بوابة الدفع الكامل."
      }
    );
  }
}

/* =========================================
   حالة بوت الإدارة
========================================= */

async function saveBotState(
  env,
  chatId,
  state,
  payload = {}
) {
  await env.DB
    .prepare(`
      INSERT INTO bot_states (
        chat_id,
        state,
        payload,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(chat_id)
      DO UPDATE SET
        state = excluded.state,
        payload = excluded.payload,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      String(chatId),
      state,
      JSON.stringify(payload)
    )
    .run();
}

async function getBotState(env, chatId) {
  const row = await env.DB
    .prepare(`
      SELECT state, payload
      FROM bot_states
      WHERE chat_id = ?
      LIMIT 1
    `)
    .bind(String(chatId))
    .first();

  if (!row) {
    return null;
  }

  let payload = {};

  try {
    payload = JSON.parse(row.payload || "{}");
  } catch {
    payload = {};
  }

  return {
    state: row.state,
    payload
  };
}

async function clearBotState(env, chatId) {
  await env.DB
    .prepare(`
      DELETE FROM bot_states
      WHERE chat_id = ?
    `)
    .bind(String(chatId))
    .run();
}

async function handleAdminState(
  env,
  chatId,
  text,
  state
) {
  if (state.state !== "edit_setting") {
    await clearBotState(env, chatId);
    await sendAdminMenu(env, chatId);
    return;
  }

  const key = state.payload?.key;

  if (!key) {
    await clearBotState(env, chatId);
    return;
  }

  const numericKeys = new Set([
    "weekday_price",
    "thursday_price",
    "friday_price",
    "insurance_amount"
  ]);

  let value = text;

  if (numericKeys.has(key)) {
    const number = Number(text);

    if (
      !Number.isFinite(number) ||
      number < 0
    ) {
      await telegramApi(
        env,
        "sendMessage",
        {
          chat_id: chatId,
          text:
            "❌ القيمة غير صحيحة.\n" +
            "أرسل رقمًا صحيحًا فقط."
        }
      );

      return;
    }

    value = String(number);
  }

  if (
    key === "card_payment_url" &&
    !/^https:\/\//i.test(value)
  ) {
    await telegramApi(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "❌ الرابط غير صحيح.\n" +
          "يجب أن يبدأ بـ https://"
      }
    );

    return;
  }

  await setSetting(env, key, value);
  await clearBotState(env, chatId);

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text: "✅ تم حفظ التعديل بنجاح."
    }
  );

  await sendAdminMenu(env, chatId);
}

/* =========================================
   قوائم الإدارة
========================================= */

async function sendRecentBookings(env, chatId) {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        booking_number,
        full_name,
        check_in_date,
        total_amount,
        booking_status,
        payment_status
      FROM bookings
      ORDER BY id DESC
      LIMIT 10
    `)
    .all();

  if (!result.results?.length) {
    await telegramApi(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text: "لا توجد طلبات حجز حتى الآن."
      }
    );

    return;
  }

  const keyboard = result.results.map(row => [
    {
      text:
        `${row.booking_number} — ` +
        `${row.full_name} — ` +
        `${formatRiyal(row.total_amount)}`,

      callback_data:
        `booking_view:${row.id}`
    }
  ]);

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text: "📋 <b>آخر طلبات الحجز</b>",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );
}

async function sendBookingDetails(
  env,
  chatId,
  bookingId
) {
  const row = await env.DB
    .prepare(`
      SELECT *
      FROM bookings
      WHERE id = ?
      LIMIT 1
    `)
    .bind(bookingId)
    .first();

  if (!row) {
    return;
  }

  const text = [
    `🏡 <b>${escapeHtml(row.booking_number)}</b>`,
    "",
    `👤 ${escapeHtml(row.full_name)}`,
    `📱 ${escapeHtml(row.phone)}`,
    `📍 ${escapeHtml(row.city)} ${escapeHtml(row.district || "")}`,
    "",
    `📅 الدخول: ${escapeHtml(row.check_in_date)} — ${escapeHtml(row.check_in_time)}`,
    `📅 الخروج: ${escapeHtml(row.check_out_date)} — ${escapeHtml(row.check_out_time)}`,
    `🌙 الليالي: ${row.nights_count}`,
    "",
    `💰 الإجمالي: ${formatRiyal(row.total_amount)}`,
    `📌 حالة الحجز: ${escapeHtml(row.booking_status)}`,
    `💳 حالة الدفع: ${escapeHtml(row.payment_status)}`,
    "",
    `📝 ${escapeHtml(row.notes || "لا توجد ملاحظات")}`
  ].join("\n");

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ قبول",
              callback_data:
                `booking_accept:${bookingId}`
            },
            {
              text: "❌ رفض",
              callback_data:
                `booking_reject:${bookingId}`
            }
          ],
          [
            {
              text: "💳 حالة الدفع",
              callback_data:
                `booking_payment:${bookingId}`
            }
          ]
        ]
      }
    }
  );
}

async function updateBookingStatus(
  env,
  chatId,
  bookingId,
  status
) {
  await env.DB
    .prepare(`
      UPDATE bookings
      SET
        booking_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(status, bookingId)
    .run();

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        status === "accepted"
          ? "✅ تم قبول الحجز."
          : "❌ تم رفض الحجز."
    }
  );
}

async function sendPaymentStatus(
  env,
  chatId,
  bookingId
) {
  const row = await env.DB
    .prepare(`
      SELECT
        booking_number,
        payment_status,
        total_amount
      FROM bookings
      WHERE id = ?
      LIMIT 1
    `)
    .bind(bookingId)
    .first();

  if (!row) {
    return;
  }

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        `💳 الحجز: ${row.booking_number}\n` +
        `الحالة: ${row.payment_status}\n` +
        `المبلغ: ${formatRiyal(row.total_amount)}`
    }
  );
}

async function sendStatistics(env, chatId) {
  const row = await env.DB
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(
          CASE
            WHEN booking_status = 'pending'
            THEN 1 ELSE 0
          END
        ) AS pending,
        SUM(
          CASE
            WHEN booking_status = 'accepted'
            THEN 1 ELSE 0
          END
        ) AS accepted,
        COALESCE(SUM(total_amount), 0) AS amount
      FROM bookings
    `)
    .first();

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "📊 <b>إحصائيات الحجوزات</b>\n\n" +
        `جميع الطلبات: ${Number(row?.total || 0)}\n` +
        `قيد الانتظار: ${Number(row?.pending || 0)}\n` +
        `المقبولة: ${Number(row?.accepted || 0)}\n` +
        `إجمالي المبالغ: ${formatRiyal(row?.amount || 0)}`,
      parse_mode: "HTML"
    }
  );
}

async function sendPricesMenu(env, chatId) {
  const settings = await getSettingsMap(env);

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "💰 <b>إدارة الأسعار</b>\n\n" +
        `أيام الأسبوع: ${formatRiyal(settings.weekday_price)}\n` +
        `الخميس: ${formatRiyal(settings.thursday_price)}\n` +
        `الجمعة: ${formatRiyal(settings.friday_price)}`,

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "تعديل أيام الأسبوع",
              callback_data:
                "price_edit:weekday_price"
            }
          ],
          [
            {
              text: "تعديل الخميس",
              callback_data:
                "price_edit:thursday_price"
            }
          ],
          [
            {
              text: "تعديل الجمعة",
              callback_data:
                "price_edit:friday_price"
            }
          ]
        ]
      }
    }
  );
}

async function sendServicesList(env, chatId) {
  const result = await env.DB
    .prepare(`
      SELECT id, name, price, visible
      FROM services
      ORDER BY sort_order ASC, id ASC
    `)
    .all();

  const lines = (result.results || []).map(service => {
    const status =
      Number(service.visible) === 1
        ? "🟢"
        : "🔴";

    return (
      `${status} ${service.name} — ` +
      `${formatRiyal(service.price)}`
    );
  });

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "🛎 <b>الخدمات الإضافية</b>\n\n" +
        (lines.join("\n") || "لا توجد خدمات"),
      parse_mode: "HTML"
    }
  );
}

async function sendInsuranceMenu(env, chatId) {
  const settings = await getSettingsMap(env);

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "🔐 <b>التأمين المسترد</b>\n\n" +
        `القيمة: ${formatRiyal(settings.insurance_amount)}\n` +
        `الحالة: ${
          isEnabled(settings.insurance_visible)
            ? "مفعل"
            : "متوقف"
        }`,

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "تعديل قيمة التأمين",
              callback_data:
                "insurance_edit_amount"
            }
          ]
        ]
      }
    }
  );
}

async function sendPaymentMenu(env, chatId) {
  const settings = await getSettingsMap(env);

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,

      text:
        "💳 <b>إعدادات بوابة الدفع</b>\n\n" +
        `الرابط الحالي:\n` +
        `<code>${escapeHtml(
          settings.card_payment_url ||
          env.PAYMENT_PAGE_URL ||
          "غير محدد"
        )}</code>`,

      parse_mode: "HTML",

      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "تعديل رابط الدفع",
              callback_data:
                "payment_edit_url"
            }
          ]
        ]
      }
    }
  );
}

async function toggleSite(env, chatId) {
  const settings = await getSettingsMap(env);

  const newValue =
    isEnabled(settings.site_enabled)
      ? "0"
      : "1";

  await setSetting(
    env,
    "site_enabled",
    newValue
  );

  await telegramApi(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        newValue === "1"
          ? "✅ تم تشغيل الموقع."
          : "🛠 تم إيقاف الموقع وتفعيل وضع الصيانة."
    }
  );
  }
