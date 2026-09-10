export function getLeadEmailTo(fallback: string) {
  const raw = process.env.LEAD_EMAIL_TO ?? fallback;
  const addresses = raw
    .split(/[,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  return addresses.length > 0 ? addresses : [fallback];
}
