import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")!;

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function sendPush(
  externalUserIds: string[],
  title: string,
  message: string,
  url?: string
) {
  if (!externalUserIds.length) return;

  const body: Record<string, unknown> = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: externalUserIds },
    target_channel: "push",
    headings: { en: title },
    contents: { en: message },
  };

  if (url) {
    body.url = url;
  }

  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  console.log("OneSignal response:", JSON.stringify(result));
  return result;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, record, table } = payload;

    if (type !== "INSERT") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (table === "messages") {
      const { sender_id, job_id, content, message_type } = record;
      if (message_type === "system") {
        return new Response(JSON.stringify({ skipped: "system message" }), {
          status: 200,
        });
      }

      const { data: job } = await supabase
        .from("jobs")
        .select("bugaphobe_id, roaster_id")
        .eq("id", job_id)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: "job not found" }), {
          status: 200,
        });
      }

      const recipientId =
        sender_id === job.bugaphobe_id ? job.roaster_id : job.bugaphobe_id;

      const { data: sender } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", sender_id)
        .single();

      const senderName = sender?.display_name || "Someone";
      const truncated =
        content.length > 100 ? content.substring(0, 100) + "..." : content;

      await sendPush(
        [recipientId],
        `Message from ${senderName}`,
        truncated,
        `https://www.roachroasters.com/chat/${job_id}`
      );
    }

    if (table === "roach_alerts") {
      const { bugaphobe_id, description, latitude, longitude } = record;

      const { data: roasters } = await supabase
        .from("profiles")
        .select("id, latitude, longitude, notification_radius_km")
        .eq("role", "roach_roaster")
        .neq("id", bugaphobe_id)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (roasters && roasters.length > 0) {
        const nearbyIds = roasters
          .filter((r: { id: string; latitude: number; longitude: number; notification_radius_km: number | null }) => {
            const radius = r.notification_radius_km ?? 10;
            const dist = haversineKm(latitude, longitude, r.latitude, r.longitude);
            return dist <= radius;
          })
          .map((r: { id: string }) => r.id);

        if (nearbyIds.length > 0) {
          const desc = description || "A cockroach needs handling!";
          await sendPush(
            nearbyIds,
            "New Roach Alert nearby!",
            desc,
            `https://www.roachroasters.com/alerts/${record.id}`
          );
        }

        console.log(
          `Alert proximity filter: ${roasters.length} roasters total, ${nearbyIds.length} within range`
        );
      }
    }

    if (table === "alert_responses") {
      const { alert_id, roaster_id } = record;

      const { data: alert } = await supabase
        .from("roach_alerts")
        .select("bugaphobe_id, description")
        .eq("id", alert_id)
        .single();

      if (alert) {
        const { data: roaster } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", roaster_id)
          .single();

        const roasterName = roaster?.display_name || "A Roach Roaster";

        await sendPush(
          [alert.bugaphobe_id],
          `${roasterName} responded to your alert!`,
          alert.description || "Someone is coming to help!",
          `https://www.roachroasters.com/alerts/${alert_id}`
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 200,
    });
  }
});
