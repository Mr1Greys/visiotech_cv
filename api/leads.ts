import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeadPayload = {
  name: string;
  company: string;
  task: string;
  city?: string;
  locations?: string;
  email: string;
  contact?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatLeadMessage(lead: LeadPayload): string {
  const lines = [
    "<b>Новая заявка — visiotech_cv</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Точка / сеть:</b> ${escapeHtml(lead.company)}`,
    `<b>Что считать:</b> ${escapeHtml(lead.task)}`,
    `<b>Email:</b> ${escapeHtml(lead.email)}`,
  ];

  if (lead.city) lines.push(`<b>Город:</b> ${escapeHtml(lead.city)}`);
  if (lead.locations) {
    lines.push(`<b>Точек:</b> ${escapeHtml(lead.locations)}`);
  }
  if (lead.contact) {
    lines.push(`<b>Telegram / WhatsApp:</b> ${escapeHtml(lead.contact)}`);
  }

  return lines.join("\n");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as Partial<LeadPayload>;
  const lead: LeadPayload = {
    name: String(body.name ?? "").trim(),
    company: String(body.company ?? "").trim(),
    task: String(body.task ?? "").trim(),
    email: String(body.email ?? "").trim(),
    city: String(body.city ?? "").trim() || undefined,
    locations: String(body.locations ?? "").trim() || undefined,
    contact: String(body.contact ?? "").trim() || undefined,
  };

  if (!lead.name || !lead.company || !lead.task || !isEmail(lead.email)) {
    return res.status(400).json({
      ok: false,
      error: "Некорректные данные формы",
    });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    return res.status(503).json({
      ok: false,
      error:
        "Telegram ещё не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.",
    });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatLeadMessage(lead),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    const payload = (await response.json()) as {
      ok?: boolean;
      description?: string;
    };

    if (!response.ok || !payload.ok) {
      console.error("Telegram API error", payload);
      return res.status(502).json({
        ok: false,
        error: "Не удалось отправить заявку. Попробуйте ещё раз чуть позже.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Lead delivery failed", error);
    return res.status(502).json({
      ok: false,
      error: "Не удалось отправить заявку. Попробуйте ещё раз чуть позже.",
    });
  }
}
