// Looks up city/state for an Indian 6-digit PIN code via the free,
// keyless India Post API. Returns null (never throws) on any failure —
// callers treat that as "couldn't auto-fill, let the user type it in."
// A genuine "no such pincode" (API responds but finds nothing) is silent,
// since that's an expected, common case; a broken integration (network
// error, non-OK response, unparseable body) is logged so it doesn't
// masquerade as "every pincode today is invalid" with zero dev signal.
export async function lookupPincode(pincode) {
  let res;
  try {
    res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  } catch (err) {
    console.error("Pincode lookup request failed:", err);
    return null;
  }

  if (!res.ok) {
    console.error(`Pincode lookup returned HTTP ${res.status}`);
    return null;
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error("Pincode lookup returned unparseable JSON:", err);
    return null;
  }

  const entry = Array.isArray(data) ? data[0] : null;
  if (entry?.Status !== "Success" || !entry.PostOffice?.length) return null;

  const [office] = entry.PostOffice;
  return {
    city: office.District || office.Block || office.Name || "",
    state: office.State || "",
    country: office.Country || "India",
  };
}
