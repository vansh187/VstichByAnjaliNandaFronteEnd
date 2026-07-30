// Shared with OrdersPage's live-tracking overlay and TrackOrderPage's
// standalone lookup, so both read the same GET /orders/{id}/tracking shape
// the same way instead of drifting apart.

export function getStatusMeta(status) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  if (normalized.includes("deliv") || normalized === "completed") {
    return { label: "Delivered", rank: 4, tone: "bg-emerald-100 text-emerald-800" };
  }

  if (normalized.includes("out") || normalized.includes("delivery")) {
    return { label: "Out for Delivery", rank: 3, tone: "bg-sky-100 text-sky-800" };
  }

  if (
    normalized.includes("ship") ||
    normalized.includes("transit") ||
    normalized.includes("pickup") ||
    normalized.includes("pickedup")
  ) {
    return { label: "Shipped", rank: 2, tone: "bg-violet-100 text-violet-800" };
  }

  if (normalized.includes("fail") || normalized.includes("cancel")) {
    return { label: "Failed", rank: 5, tone: "bg-rose-100 text-rose-800" };
  }

  if (normalized.includes("pend") || normalized.includes("process") || normalized.includes("confirm")) {
    return { label: "Placed", rank: 1, tone: "bg-amber-100 text-amber-800" };
  }

  return { label: "Placed", rank: 1, tone: "bg-amber-100 text-amber-800" };
}

// Pulls everything useful out of the tracking payload shape documented for
// GET /orders/{id}/tracking: an array whose single entry is keyed by
// shipment id, wrapping Shiprocket's raw `tracking_data` object.
export function extractTrackingDetails(response) {
  const entry = Array.isArray(response) ? response[0] : null;
  const shipment = entry ? Object.values(entry)[0] : null;
  const trackingData = shipment?.tracking_data;
  const track = trackingData?.shipment_track?.[0] ?? null;

  const currentStatus = track?.current_status ? String(track.current_status).trim() : "";
  const activities = Array.isArray(trackingData?.shipment_track_activities)
    ? trackingData.shipment_track_activities
        .map((activity) => ({
          date: activity?.date ?? null,
          status: activity?.status ?? activity?.["sr-status-label"] ?? "",
          activityText: activity?.activity ?? "",
          location: activity?.location ?? "",
        }))
        .filter((activity) => activity.status || activity.activityText)
    : [];

  return {
    currentStatus,
    statusMeta: currentStatus ? getStatusMeta(currentStatus) : null,
    courierName: track?.courier_name ?? null,
    awbCode: track?.awb_code ?? null,
    estimatedDelivery: track?.edd ?? null,
    activities,
  };
}
