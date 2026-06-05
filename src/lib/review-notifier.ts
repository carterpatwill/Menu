import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import type { ReviewNotifier } from "./review-service";

interface ResendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

async function sendViaResend(apiKey: string, payload: ResendPayload) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createReviewNotifier(): ReviewNotifier {
  return {
    async notifyOwnerOfReview({ restaurantId, nfcTagId, rating, body }) {
      const resendKey = process.env.RESEND_API_KEY;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const fromAddress = process.env.RESEND_FROM_ADDRESS ?? "Tappi <reviews@tappi.app>";

      if (!resendKey || !serviceRoleKey || !supabaseUrl) return;

      const admin = createAdminClient<Database>(supabaseUrl, serviceRoleKey);

      const { data: restaurant } = await admin
        .from("restaurants")
        .select("name, owner_id")
        .eq("id", restaurantId)
        .single();
      if (!restaurant) return;

      const { data: userData } = await admin.auth.admin.getUserById(restaurant.owner_id);
      const ownerEmail = userData?.user?.email;
      if (!ownerEmail) return;

      const { data: tag } = await admin
        .from("nfc_tags")
        .select("label")
        .eq("id", nfcTagId)
        .single();

      const tagLabel = tag?.label ?? "Unknown tag";
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

      await sendViaResend(resendKey, {
        from: fromAddress,
        to: ownerEmail,
        subject: `New ${rating}-star review for ${restaurant.name}`,
        html: `<p><strong>${stars}</strong> &nbsp; <em>${escapeHtml(tagLabel)}</em></p><p>${escapeHtml(body)}</p>`,
      });
    },
  };
}
