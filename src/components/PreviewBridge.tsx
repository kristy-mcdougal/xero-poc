"use client";

import { HygraphPreview } from "@hygraph/preview-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type ChainLink = { fieldApiId: string; instanceId: string };

type FieldUpdateMessage = {
  type: "field-update";
  entryId: string;
  fieldApiId: string;
  fieldType: string;
  newValue: unknown;
  transformedValue?: unknown;
  componentChain?: ChainLink[];
  isList?: boolean;
};

function lastInstanceId(chain?: ChainLink[]): string | null {
  if (!chain || chain.length === 0) return null;
  return chain[chain.length - 1]?.instanceId ?? null;
}

function chainLastInstance(el: Element): string | null {
  const raw = el.getAttribute("data-hygraph-component-chain");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ChainLink[];
    return parsed[parsed.length - 1]?.instanceId ?? null;
  } catch {
    return null;
  }
}

/** Reorder a component-array container's children to match the new order. */
function reorderContainer(container: Element, components: unknown) {
  if (!Array.isArray(components) || components.length === 0) return;
  const byInstance = new Map<string, Element>();
  for (const child of Array.from(container.children)) {
    const inst = chainLastInstance(child);
    if (inst) byInstance.set(inst, child);
  }
  const frag = document.createDocumentFragment();
  let moved = 0;
  for (const comp of components as { id?: string }[]) {
    const el = comp?.id ? byInstance.get(comp.id) : undefined;
    if (el) {
      frag.appendChild(el);
      moved++;
    }
  }
  if (moved > 0) {
    container.innerHTML = "";
    container.appendChild(frag);
  }
}

/**
 * Live-update fallback for variant previews.
 *
 * The preview SDK matches Studio `field-update` messages strictly by
 * `data-hygraph-entry-id`. When previewing a PageVariant, the Studio keys those
 * messages by a different entry than the variant id we render on, so the SDK
 * finds no element and the change only appears after Save.
 *
 * This listener runs alongside the SDK and ONLY acts when the SDK's strict
 * match would fail (no element carries the message's entry id + field). Because
 * a variant preview renders exclusively that variant's blocks, matching by
 * field api id + the component instance is unambiguous and safe. Non-variant
 * chrome (header, footer, banner) keeps using the SDK untouched.
 */
function useVariantLiveSync(active: boolean, studioUrl?: string) {
  useEffect(() => {
    if (!active) return;

    let studioHost: string | null = null;
    try {
      studioHost = studioUrl ? new URL(studioUrl).origin : null;
    } catch {
      studioHost = null;
    }

    const onMessage = (event: MessageEvent) => {
      if (studioHost && event.origin !== studioHost) return;
      const msg = event.data as FieldUpdateMessage | undefined;
      if (!msg || msg.type !== "field-update" || typeof msg.fieldApiId !== "string") return;

      // If the SDK can match this message by its own entry id, let it handle it.
      const strict = document.querySelector(
        `[data-hygraph-entry-id="${CSS.escape(msg.entryId)}"][data-hygraph-field-api-id="${CSS.escape(
          msg.fieldApiId
        )}"]`
      );
      if (strict) return;

      // Entry-agnostic match: field api id + the component instance it lives in.
      const last = lastInstanceId(msg.componentChain);
      const candidates = Array.from(
        document.querySelectorAll(`[data-hygraph-field-api-id="${CSS.escape(msg.fieldApiId)}"]`)
      ).filter((el) =>
        last ? chainLastInstance(el) === last : !el.getAttribute("data-hygraph-component-chain")
      );
      if (candidates.length === 0) return;

      for (const el of candidates) {
        if (msg.fieldType === "COMPONENT_ARRAY") {
          reorderContainer(el, msg.transformedValue ?? msg.newValue);
        } else if (msg.fieldType === "RICHTEXT") {
          el.innerHTML = String(msg.newValue ?? "");
        } else if (msg.isList && Array.isArray(msg.newValue)) {
          el.textContent = (msg.newValue as unknown[]).map(String).join(", ");
        } else {
          el.textContent = msg.newValue == null ? "" : String(msg.newValue);
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [active, studioUrl]);
}

/**
 * Initializes the Hygraph Preview SDK (click-to-edit overlays + live updates)
 * only while preview mode is active. The SDK scans the whole document, so it is
 * mounted as a sibling with no children; unmounting it (when preview is off)
 * tears down all overlays.
 */
export function PreviewBridge() {
  const router = useRouter();
  const params = useSearchParams();
  const isPreview = params.get("preview") === "1" || params.get("preview") === "true";
  const variantId = params.get("variant");
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const studioUrl = process.env.NEXT_PUBLIC_HYGRAPH_STUDIO_URL;

  useVariantLiveSync(Boolean(isPreview && variantId), studioUrl);

  if (!endpoint || !isPreview) return null;

  return (
    <HygraphPreview
      endpoint={endpoint}
      studioUrl={studioUrl}
      mode="auto"
      overlayEnabled
      debug={process.env.NODE_ENV === "development"}
      onSave={() => router.refresh()}
      sync={{ fieldFocus: true, fieldUpdate: true }}
      overlay={{
        style: { borderColor: "#13b5ea", borderWidth: "2px", borderRadius: "6px" },
        button: { backgroundColor: "#13b5ea", color: "#0b2239", borderRadius: "6px" },
      }}
      standalone={{ studioUrl, openInNewTab: true, fallbackToNewTab: true }}
    >
      <span style={{ display: "none" }} aria-hidden />
    </HygraphPreview>
  );
}
