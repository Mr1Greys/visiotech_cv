import { logger } from "./logger";

export type LeadPayload = {
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

export async function sendLeadToTelegram(lead: LeadPayload): Promise<void> {
  const token = process.env["TELEGRAM_BOT_TOKEN"]?.trim();
  const chatId = process.env["TELEGRAM_CHAT_ID"]?.trim();

  if (!token || !chatId) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured",
    );
  }

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

  const body = (await response.json()) as {
    ok?: boolean;
    description?: string;
  };

  if (!response.ok || !body.ok) {
    logger.error({ status: response.status, body }, "Telegram API error");
    throw new Error(body.description ?? "Failed to send Telegram message");
  }
}
