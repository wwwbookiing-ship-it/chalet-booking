const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
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
    "تواصل مع الإدارة لاستلام الحساب البنكي المخصص للتحويل.",
  bank_whatsapp: "",
  bank_message:
    "السلام عليكم، أرغب بإكمال دفع الحجز رقم {booking_number}. المبلغ المطلوب {amount} ريال.",

  payment_bot_username: "@mkkkooo5599_bot"
};

const DEFAULT_SERVICES = [
  ["تدفئة المسبح", "تشغيل تدفئة المسبح خلال فترة الحجز.", 100, 1],
  ["تجهيز مناسبة", "تجهيز أساسي للمناسبات والاحتفالات.", 250, 2],
  ["تزيين بالبالونات", "تنسيق بالونات مناسب للاحتفال.", 150, 3],
  ["تنسيق ورد", "تنسيق ورد للجلسة أو المناسبة.", 150, 4],
  ["قهوة وضيافة", "قهوة عربية وشاي ومياه للضيوف.", 120, 5],
  ["مستلزمات شواء", "فحم وأدوات وتجهيز منطقة الشواء.", 50, 6],
  ["فطور صباحي", "تجهيز فطور خفيف حسب عدد الأشخاص.", 180, 7],
  ["تسجيل دخول مبكر", "الدخول قبل الموعد الرسمي حسب التوفر.", 100, 8],
  ["تسجيل خروج متأخر", "تمديد وقت الخروج حسب التوفر.", 100, 9]
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
        return receiveBookingInvoice(request, env);
      }

      if (
        url.pathname === "/api/payment/card" &&
        request.method === "POST"
      ) {
        return prepareCardPayment(request, env);
      }

      if (
        url.pathname === "/telegram" &&
        request.method === "POST"
      ) {
        return handleTelegramWebhook(request, env);
      }

      if (
        url.pathname === "/setup-webhook" &&
        request.method === "GET"
      ) {
        return setupWebhook(env, url.origin);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);

      return json(
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

/* =========================
   قاعدة البيانات
========================= */

async function ensureDatabase(env) {
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS bot_states (
        chat_id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        payload TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
  ]);

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO settings (key, value)
      VALUES (?, ?)
    `).bind(key, value).run();
  }

  const serviceCount = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM services
  `).first();

  if (Number(serviceCount?.count || 0) === 0) {
    for (const service of DEFAULT_SERVICES) {
      await env.DB.prepare(`
        INSERT INTO services (
          name,
          description,
          price,
          visible,
          sort_order
        )
        VALUES (?, ?, ?, 1, ?)
      `).bind(...service).run();
    }
  }
}

async function getSettings(env) {
  const result = await env.DB.prepare(`
    SELECT key, value FROM settings
  `).all();

  const settings = {};

  for (const row of result.results || []) {
    settings[row.key] = row.value;
  }

  return settings;
}

async function saveSetting(env, key, value) {
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
  `).bind(key, String(value)).run();
}

/* =========================
   إعدادات الموقع
========================= */

async function getPublicConfig(env) {
  const settings = await getSettings(env);

  const servicesResult = await env.DB.prepare(`
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

  const periodsResult = await env.DB.prepare(`
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

  for (const row of periodsResult.results || []) {
    const item = {
      id: Number(row.id),
      name: row.name,
      start: row.start_date,
      end: row.end_date,
      price: Number(row.price),
      enabled: Number(row.visible) === 1
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
      enabled: enabled(settings.site_enabled),
      title: settings.site_title,
      subtitle: settings.site_subtitle,
      maintenanceMessage: settings.maintenance_message
    },

    pricing: {
      weekdays: {
        name: settings.weekday_name,
        price: number(settings.weekday_price),
        visible: enabled(settings.weekday_visible)
      },

      thursday: {
        name: settings.thursday_name,
        price: number(settings.thursday_price),
        visible: enabled(settings.thursday_visible)
      },

      friday: {
        name: settings.friday_name,
        price: number(settings.friday_price),
        visible: enabled(settings.friday_visible)
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
      visible: enabled(settings.insurance_visible),
      amount: number(settings.insurance_amount),
      title: settings.insurance_title,
      description: settings.insurance_description
    },

    services: (servicesResult.results || []).map(row => ({
      id: Number(row.id),
      name: row.name,
      description: row.description,
      price: Number(row.price),
      visible: Number(row.visible) === 1
    })),

    payment: {
      card: {
        visible: enabled(settings.card_visible),
        name: settings.card_name,
        description: settings.card_description
      },

      bank: {
        visible: enabled(settings.bank_visible),
        name: settings.bank_name,
        description: settings.bank_description,
        whatsappNumber: settings.bank_whatsapp,
        whatsappMessage: settings.bank_message
      }
    }
  });
}

/* =========================
   استقبال الفاتورة
========================= */

async function receiveBookingInvoice(request, env) {
  const body = await request.json();

  if (!body?.customer || !body?.booking || !body?.amounts) {
    return json(
      {
        ok: false,
        error: "invalid_booking_data"
      },
      400
    );
  }

  const bookingNumber =
    clean(body.bookingNumber, 50) ||
    `BK-${Date.now()}`;

  const caption = buildInvoiceCaption({
    ...body,
    bookingNumber
  });

  if (
    typeof body.invoiceImage === "string" &&
    body.invoiceImage.startsWith("data:image/")
  ) {
    await sendInvoicePhoto(
      env,
      bookingNumber,
      body.invoiceImage,
      caption
    );
  } else {
    await telegram(env, "sendMessage", {
      chat_id: env.ADMIN_CHAT_ID,
      text: caption,
      parse_mode: "HTML"
    });
  }

  return json({
    ok: true,
    bookingNumber
  });
}

function buildInvoiceCaption(data) {
  const customer = data.customer || {};
  const booking = data.booking || {};
  const amounts = data.amounts || {};

  const services = Array.isArray(booking.services)
    ? booking.services
    : [];

  const servicesText = services.length
    ? services.map(service => service.name).join("، ")
    : "بدون خدمات إضافية";

  const location = customer.district
    ? `${customer.city}، ${customer.district}`
    : customer.city;

  return [
    "🏡 <b>فاتورة طلب حجز جديدة</b>",
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
  const image = decodeDataUrl(dataUrl);

  const form = new FormData();

  form.append("chat_id", String(env.ADMIN_CHAT_ID));
  form.append("caption", caption);
  form.append("parse_mode", "HTML");

  form.append(
    "photo",
    new Blob([image.bytes], {
      type: image.mimeType
    }),
    `invoice-${bookingNumber}.png`
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
}

function decodeDataUrl(dataUrl) {
  const match = dataUrl.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
  );

  if (!match) {
    throw new Error("صيغة الصورة غير صحيحة");
  }

  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    mimeType: match[1],
    bytes
  };
}

/* =========================
   إرسال مبلغ الدفع
========================= */

async function prepareCardPayment(request, env) {
  const body = await request.json();

  const bookingNumber =
    clean(body.bookingNumber, 60);

  const amount = number(
    body.amount ?? body.total
  );

  if (!bookingNumber) {
    return json(
      {
        ok: false,
        error: "missing_booking_number"
      },
      400
    );
  }

  if (!(amount > 0)) {
    return json(
      {
        ok: false,
        error: "missing_payment_amount",
        message: "مبلغ الدفع غير موجود."
      },
      400
    );
  }

  const settings = await getSettings(env);

  if (!enabled(settings.card_visible)) {
    return json(
      {
        ok: false,
        error: "card_payment_disabled"
      },
      409
    );
  }

  if (!settings.card_url) {
    return json(
      {
        ok: false,
        error: "payment_url_missing",
        message:
          "رابط بوابة الدفع غير مضاف من بوت الإدارة."
      },
      409
    );
  }

  if (!settings.payment_bot_username) {
    return json(
      {
        ok: false,
        error: "payment_bot_missing"
      },
      409
    );
  }

  const formattedAmount =
    `SAR ${amount.toFixed(2)}`;

  await telegram(env, "sendMessage", {
    chat_id: settings.payment_bot_username,
    text: formattedAmount
  });

  return json({
    ok: true,
    bookingNumber,
    amount: formattedAmount,
    paymentUrl: settings.card_url
  });
}

/* =========================
   Webhook بوت الإدارة
========================= */

async function setupWebhook(env, origin) {
  const secret = await webhookSecret(
    env.ADMIN_BOT_TOKEN
  );

  const webhookUrl =
    `${origin}/telegram`;

  const result = await telegram(
    env,
    "setWebhook",
    {
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: [
        "message",
        "callback_query"
      ],
      drop_pending_updates: true
    }
  );

  return json({
    ok: true,
    webhookUrl,
    telegram: result
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

  if (receivedSecret !== expectedSecret) {
    return json(
      {
        ok: false,
        error: "unauthorized"
      },
      401
    );
  }

  const update = await request.json();

  if (update.callback_query) {
    await handleCallback(
      env,
      update.callback_query
    );

    return json({ ok: true });
  }

  if (update.message) {
    await handleMessage(
      env,
      update.message
    );
  }

  return json({ ok: true });
}

async function handleMessage(env, message) {
  const chatId =
    String(message.chat?.id || "");

  const text =
    clean(message.text, 6000);

  if (
    !chatId ||
    chatId !== String(env.ADMIN_CHAT_ID)
  ) {
    return;
  }

  if (
    text === "/start" ||
    text === "/menu" ||
    text === "القائمة"
  ) {
    await clearState(env, chatId);
    await sendMainMenu(env, chatId);
    return;
  }

  const state =
    await getState(env, chatId);

  if (!state) {
    await sendMainMenu(env, chatId);
    return;
  }

  await processState(
    env,
    chatId,
    text,
    state
  );
}

async function handleCallback(env, query) {
  const chatId =
    String(query.message?.chat?.id || "");

  if (
    !chatId ||
    chatId !== String(env.ADMIN_CHAT_ID)
  ) {
    return;
  }

  await telegram(
    env,
    "answerCallbackQuery",
    {
      callback_query_id: query.id
    }
  );

  const action =
    String(query.data || "");

  if (action === "main") {
    await sendMainMenu(env, chatId);
    return;
  }

  if (action === "site_menu") {
    await sendSiteMenu(env, chatId);
    return;
  }

  if (action === "prices_menu") {
    await sendPricesMenu(env, chatId);
    return;
  }

  if (action === "insurance_menu") {
    await sendInsuranceMenu(env, chatId);
    return;
  }

  if (action === "payment_menu") {
    await sendPaymentMenu(env, chatId);
    return;
  }

  if (action === "services_menu") {
    await sendServicesMenu(env, chatId);
    return;
  }

  if (action === "periods_menu") {
    await sendPeriodsMenu(env, chatId);
    return;
  }

  if (action === "toggle_site") {
    await toggleSetting(
      env,
      "site_enabled"
    );

    await sendSiteMenu(env, chatId);
    return;
  }

  if (action === "toggle_insurance") {
    await toggleSetting(
      env,
      "insurance_visible"
    );

    await sendInsuranceMenu(env, chatId);
    return;
  }

  if (action === "toggle_card") {
    await toggleSetting(
      env,
      "card_visible"
    );

    await sendPaymentMenu(env, chatId);
    return;
  }

  if (action === "toggle_bank") {
    await toggleSetting(
      env,
      "bank_visible"
    );

    await sendPaymentMenu(env, chatId);
    return;
  }

  if (action.startsWith("edit:")) {
    const key =
      action.slice(5);

    await setState(
      env,
      chatId,
      "edit_setting",
      { key }
    );

    await telegram(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "أرسل القيمة الجديدة الآن.\n\n" +
          "للإلغاء أرسل: /cancel"
      }
    );

    return;
  }

  if (action === "service_add") {
    await setState(
      env,
      chatId,
      "add_service",
      {}
    );

    await telegram(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "أرسل بيانات الخدمة بهذا الترتيب:\n\n" +
          "الاسم | الوصف | السعر\n\n" +
          "مثال:\n" +
          "تدفئة المسبح | تشغيل التدفئة طوال الحجز | 100"
      }
    );

    return;
  }

  if (action.startsWith("service_toggle:")) {
    const id =
      integer(action.split(":")[1]);

    await env.DB.prepare(`
      UPDATE services
      SET
        visible = CASE
          WHEN visible = 1 THEN 0
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run();

    await sendServicesMenu(env, chatId);
    return;
  }

  if (action.startsWith("service_delete:")) {
    const id =
      integer(action.split(":")[1]);

    await env.DB.prepare(`
      DELETE FROM services
      WHERE id = ?
    `).bind(id).run();

    await sendServicesMenu(env, chatId);
    return;
  }

  if (action.startsWith("service_edit:")) {
    const id =
      integer(action.split(":")[1]);

    await setState(
      env,
      chatId,
      "edit_service",
      { id }
    );

    await telegram(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "أرسل بيانات الخدمة الجديدة:\n\n" +
          "الاسم | الوصف | السعر"
      }
    );

    return;
  }

  if (
    action === "period_add_season" ||
    action === "period_add_occasion"
  ) {
    const type =
      action === "period_add_season"
        ? "season"
        : "occasion";

    await setState(
      env,
      chatId,
      "add_period",
      { type }
    );

    await telegram(
      env,
      "sendMessage",
      {
        chat_id: chatId,
        text:
          "أرسل البيانات بهذا الترتيب:\n\n" +
          "الاسم | تاريخ البداية | تاريخ النهاية | السعر\n\n" +
          "مثال:\n" +
          "موسم الصيف | 2026-07-15 | 2026-08-31 | 1000"
      }
    );

    return;
  }

  if (action.startsWith("period_toggle:")) {
    const id =
      integer(action.split(":")[1]);

    await env.DB.prepare(`
      UPDATE periods
      SET visible = CASE
        WHEN visible = 1 THEN 0
        ELSE 1
      END
      WHERE id = ?
    `).bind(id).run();

    await sendPeriodsMenu(env, chatId);
    return;
  }

  if (action.startsWith("period_delete:")) {
    const id =
      integer(action.split(":")[1]);

    await env.DB.prepare(`
      DELETE FROM periods
      WHERE id = ?
    `).bind(id).run();

    await sendPeriodsMenu(env, chatId);
  }
}

/* =========================
   قوائم الإدارة
========================= */

async function sendMainMenu(env, chatId) {
  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "⚙️ <b>إدارة موقع الحجز</b>\n\n" +
        "اختر القسم المطلوب:",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🏡 نصوص الموقع",
              callback_data: "site_menu"
            },
            {
              text: "💰 الأسعار",
              callback_data: "prices_menu"
            }
          ],
          [
            {
              text: "🛎 الخدمات",
              callback_data: "services_menu"
            },
            {
              text: "🎉 المواسم والمناسبات",
              callback_data: "periods_menu"
            }
          ],
          [
            {
              text: "🔐 التأمين المسترد",
              callback_data: "insurance_menu"
            },
            {
              text: "💳 طرق الدفع",
              callback_data: "payment_menu"
            }
          ]
        ]
      }
    }
  );
}

async function sendSiteMenu(env, chatId) {
  const settings =
    await getSettings(env);

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "🏡 <b>إعدادات الموقع</b>\n\n" +
        `الحالة: ${enabled(settings.site_enabled) ? "🟢 يعمل" : "🔴 متوقف"}\n` +
        `العنوان: ${html(settings.site_title)}\n` +
        `الوصف: ${html(settings.site_subtitle)}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "تشغيل/إيقاف الموقع",
              callback_data: "toggle_site"
            }
          ],
          [
            {
              text: "تعديل العنوان",
              callback_data: "edit:site_title"
            },
            {
              text: "تعديل الوصف",
              callback_data: "edit:site_subtitle"
            }
          ],
          [
            {
              text: "تعديل نص الصيانة",
              callback_data: "edit:maintenance_message"
            }
          ],
          backButton()
        ]
      }
    }
  );
}

async function sendPricesMenu(env, chatId) {
  const settings =
    await getSettings(env);

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "💰 <b>الأسعار الأساسية</b>\n\n" +
        `أيام الأسبوع: ${money(settings.weekday_price)}\n` +
        `الخميس: ${money(settings.thursday_price)}\n` +
        `الجمعة: ${money(settings.friday_price)}`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "أيام الأسبوع",
              callback_data: "edit:weekday_price"
            }
          ],
          [
            {
              text: "الخميس",
              callback_data: "edit:thursday_price"
            },
            {
              text: "الجمعة",
              callback_data: "edit:friday_price"
            }
          ],
          backButton()
        ]
      }
    }
  );
}

async function sendInsuranceMenu(env, chatId) {
  const settings =
    await getSettings(env);

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "🔐 <b>التأمين المسترد</b>\n\n" +
        `الحالة: ${enabled(settings.insurance_visible) ? "🟢 ظاهر" : "🔴 مخفي"}\n` +
        `المبلغ: ${money(settings.insurance_amount)}\n\n` +
        `<b>${html(settings.insurance_title)}</b>\n` +
        html(settings.insurance_description),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "إظهار/إخفاء",
              callback_data: "toggle_insurance"
            },
            {
              text: "تعديل المبلغ",
              callback_data: "edit:insurance_amount"
            }
          ],
          [
            {
              text: "تعديل العنوان",
              callback_data: "edit:insurance_title"
            },
            {
              text: "تعديل النص",
              callback_data: "edit:insurance_description"
            }
          ],
          backButton()
        ]
      }
    }
  );
}

async function sendPaymentMenu(env, chatId) {
  const settings =
    await getSettings(env);

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "💳 <b>طرق الدفع</b>\n\n" +
        `البطاقة: ${enabled(settings.card_visible) ? "🟢 ظاهرة" : "🔴 مخفية"}\n` +
        `التحويل: ${enabled(settings.bank_visible) ? "🟢 ظاهر" : "🔴 مخفي"}\n\n` +
        `رابط البطاقة:\n<code>${html(settings.card_url || "غير مضاف")}</code>\n\n` +
        `بوت الدفع:\n<code>${html(settings.payment_bot_username)}</code>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "إظهار/إخفاء البطاقة",
              callback_data: "toggle_card"
            },
            {
              text: "إظهار/إخفاء التحويل",
              callback_data: "toggle_bank"
            }
          ],
          [
            {
              text: "رابط بوابة الدفع",
              callback_data: "edit:card_url"
            }
          ],
          [
            {
              text: "اسم بوت الدفع",
              callback_data: "edit:payment_bot_username"
            }
          ],
          [
            {
              text: "اسم دفع البطاقة",
              callback_data: "edit:card_name"
            },
            {
              text: "وصف البطاقة",
              callback_data: "edit:card_description"
            }
          ],
          [
            {
              text: "رقم واتساب التحويل",
              callback_data: "edit:bank_whatsapp"
            }
          ],
          [
            {
              text: "نص رسالة التحويل",
              callback_data: "edit:bank_message"
            }
          ],
          backButton()
        ]
      }
    }
  );
}

async function sendServicesMenu(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT
      id,
      name,
      price,
      visible
    FROM services
    ORDER BY sort_order ASC, id ASC
  `).all();

  const keyboard = [
    [
      {
        text: "➕ إضافة خدمة",
        callback_data: "service_add"
      }
    ]
  ];

  for (const service of result.results || []) {
    keyboard.push([
      {
        text:
          `${Number(service.visible) === 1 ? "🟢" : "🔴"} ` +
          `${service.name} — ${money(service.price)}`,
        callback_data:
          `service_toggle:${service.id}`
      }
    ]);

    keyboard.push([
      {
        text: `✏️ تعديل ${service.name}`,
        callback_data:
          `service_edit:${service.id}`
      },
      {
        text: "🗑 حذف",
        callback_data:
          `service_delete:${service.id}`
      }
    ]);
  }

  keyboard.push(backButton());

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "🛎 <b>إدارة الخدمات</b>\n\n" +
        "اضغط اسم الخدمة لإظهارها أو إخفائها.",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );
}

async function sendPeriodsMenu(env, chatId) {
  const result = await env.DB.prepare(`
    SELECT *
    FROM periods
    ORDER BY start_date ASC
  `).all();

  const keyboard = [
    [
      {
        text: "➕ إضافة موسم",
        callback_data: "period_add_season"
      },
      {
        text: "➕ إضافة مناسبة",
        callback_data: "period_add_occasion"
      }
    ]
  ];

  for (const period of result.results || []) {
    keyboard.push([
      {
        text:
          `${Number(period.visible) === 1 ? "🟢" : "🔴"} ` +
          `${period.name} — ${money(period.price)}`,
        callback_data:
          `period_toggle:${period.id}`
      },
      {
        text: "🗑 حذف",
        callback_data:
          `period_delete:${period.id}`
      }
    ]);
  }

  keyboard.push(backButton());

  await telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text:
        "🎉 <b>المواسم والمناسبات</b>\n\n" +
        "اضغط الاسم لتشغيله أو إخفائه.",
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );
}

/* =========================
   استقبال تعديلات الإدارة
========================= */

async function processState(
  env,
  chatId,
  text,
  state
) {
  if (text === "/cancel") {
    await clearState(env, chatId);
    await sendMainMenu(env, chatId);
    return;
  }

  if (state.state === "edit_setting") {
    const key =
      state.payload?.key;

    const numericKeys = new Set([
      "weekday_price",
      "thursday_price",
      "friday_price",
      "insurance_amount"
    ]);

    if (numericKeys.has(key)) {
      const value = Number(text);

      if (!Number.isFinite(value) || value < 0) {
        await sendText(
          env,
          chatId,
          "❌ أرسل رقمًا صحيحًا فقط."
        );
        return;
      }
    }

    if (
      key === "card_url" &&
      text &&
      !/^https:\/\//i.test(text)
    ) {
      await sendText(
        env,
        chatId,
        "❌ الرابط يجب أن يبدأ بـ https://"
      );
      return;
    }

    if (
      key === "payment_bot_username" &&
      !text.startsWith("@")
    ) {
      await sendText(
        env,
        chatId,
        "❌ اسم البوت يجب أن يبدأ بعلامة @"
      );
      return;
    }

    await saveSetting(
      env,
      key,
      text
    );

    await clearState(env, chatId);

    await sendText(
      env,
      chatId,
      "✅ تم حفظ التعديل."
    );

    await sendMainMenu(env, chatId);
    return;
  }

  if (
    state.state === "add_service" ||
    state.state === "edit_service"
  ) {
    const parts =
      text.split("|").map(item => item.trim());

    if (parts.length < 3) {
      await sendText(
        env,
        chatId,
        "❌ الصيغة غير صحيحة:\nالاسم | الوصف | السعر"
      );
      return;
    }

    const price =
      Number(parts[2]);

    if (!Number.isFinite(price) || price < 0) {
      await sendText(
        env,
        chatId,
        "❌ السعر غير صحيح."
      );
      return;
    }

    if (state.state === "add_service") {
      const order = await env.DB.prepare(`
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
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
        Number(order?.next_order || 1)
      ).run();
    } else {
      await env.DB.prepare(`
        UPDATE services
        SET
          name = ?,
          description = ?,
          price = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        parts[0],
        parts[1],
        price,
        state.payload.id
      ).run();
    }

    await clearState(env, chatId);
    await sendText(env, chatId, "✅ تم حفظ الخدمة.");
    await sendServicesMenu(env, chatId);
    return;
  }

  if (state.state === "add_period") {
    const parts =
      text.split("|").map(item => item.trim());

    if (parts.length < 4) {
      await sendText(
        env,
        chatId,
        "❌ الصيغة:\nالاسم | البداية | النهاية | السعر"
      );
      return;
    }

    const price =
      Number(parts[3]);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(parts[1]) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parts[2]) ||
      !Number.isFinite(price)
    ) {
      await sendText(
        env,
        chatId,
        "❌ تأكد من التواريخ والسعر."
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

    await clearState(env, chatId);
    await sendText(env, chatId, "✅ تمت إضافة الفترة.");
    await sendPeriodsMenu(env, chatId);
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
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(chat_id)
    DO UPDATE SET
      state = excluded.state,
      payload = excluded.payload,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    chatId,
    state,
    JSON.stringify(payload || {})
  ).run();
}

async function getState(env, chatId) {
  const row = await env.DB.prepare(`
    SELECT state, payload
    FROM bot_states
    WHERE chat_id = ?
    LIMIT 1
  `).bind(chatId).first();

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

async function clearState(env, chatId) {
  await env.DB.prepare(`
    DELETE FROM bot_states
    WHERE chat_id = ?
  `).bind(chatId).run();
}

async function toggleSetting(env, key) {
  const settings =
    await getSettings(env);

  await saveSetting(
    env,
    key,
    enabled(settings[key]) ? "0" : "1"
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

async function sendText(
  env,
  chatId,
  text
) {
  return telegram(
    env,
    "sendMessage",
    {
      chat_id: chatId,
      text
    }
  );
}

async function webhookSecret(token) {
  const bytes =
    new TextEncoder().encode(token);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      bytes
    );

  return [...new Uint8Array(digest)]
    .map(value =>
      value.toString(16).padStart(2, "0")
    )
    .join("")
    .slice(0, 64);
}

/* =========================
   أدوات
========================= */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: JSON_HEADERS
    }
  );
}

function enabled(value) {
  return String(value) === "1";
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function integer(value) {
  const result = Number.parseInt(value, 10);
  return Number.isFinite(result) ? result : 0;
}

function clean(value, length = 1000) {
  return String(value ?? "")
    .trim()
    .slice(0, length);
}

function money(value) {
  return `${number(value).toLocaleString("en-US")} ريال`;
}

function html(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function backButton() {
  return [
    {
      text: "🔙 رجوع",
      callback_data: "main"
    }
  ];
}
