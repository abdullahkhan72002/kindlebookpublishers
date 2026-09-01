import { getStoredTracking } from "@/lib/tracking";

export type SubmitManuscriptResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitManuscriptForm(
  form: HTMLFormElement,
): Promise<SubmitManuscriptResult> {
  const payload = new FormData(form);
  payload.set("pageUrl", window.location.href);
  payload.set("pageTitle", document.title);
  payload.set("tracking", JSON.stringify(getStoredTracking()));

  try {
    const response = await fetch("/api/manuscript", {
      method: "POST",
      body: payload,
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      return { ok: false, error: data.error ?? "Unable to submit your manuscript." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
