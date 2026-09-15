import { Router, type IRouter } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { sendLeadToTelegram } from "../lib/telegram";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(200),
  task: z.string().trim().min(1).max(2000),
  city: z.string().trim().max(120).optional(),
  locations: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(200),
  contact: z.string().trim().max(200).optional(),
});

const router: IRouter = Router();

router.post("/leads", async (req, res) => {
  const parsed = leadSchema.safeParse({
    ...req.body,
    city: req.body?.city || undefined,
    locations: req.body?.locations || undefined,
    contact: req.body?.contact || undefined,
  });

  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "Некорректные данные формы",
      details: parsed.error.flatten(),
    });
    return;
  }

  const lead = {
    name: parsed.data.name,
    company: parsed.data.company,
    task: parsed.data.task,
    email: parsed.data.email,
    city: parsed.data.city || undefined,
    locations: parsed.data.locations || undefined,
    contact: parsed.data.contact || undefined,
  };

  try {
    await sendLeadToTelegram(lead);
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to deliver lead");
    const message =
      err instanceof Error ? err.message : "Не удалось отправить заявку";
    const isConfig =
      message.includes("TELEGRAM_BOT_TOKEN") ||
      message.includes("TELEGRAM_CHAT_ID");

    res.status(isConfig ? 503 : 502).json({
      ok: false,
      error: isConfig
        ? "Telegram ещё не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID."
        : "Не удалось отправить заявку. Попробуйте ещё раз чуть позже.",
    });
  }
});

export default router;
