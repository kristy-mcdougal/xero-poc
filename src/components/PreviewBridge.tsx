"use client";

import { HygraphPreview } from "@hygraph/preview-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Initializes the Hygraph Preview SDK (click-to-edit overlays + live updates)
 * only while preview mode is active. The SDK scans the whole document, so it is
 * mounted as a sibling with no children; unmounting it (when preview is off)
 * tears down all overlays.
 *
 * Note: live (unsaved) field updates work for pages but not for variants. The
 * Studio does not emit live draft-change messages for variant field edits, so
 * variant previews refresh on Save rather than on every keystroke. Click-to-edit
 * and block reordering still work for variants.
 */
export function PreviewBridge() {
  const router = useRouter();
  const params = useSearchParams();
  const isPreview = params.get("preview") === "1" || params.get("preview") === "true";
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const studioUrl = process.env.NEXT_PUBLIC_HYGRAPH_STUDIO_URL;

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
