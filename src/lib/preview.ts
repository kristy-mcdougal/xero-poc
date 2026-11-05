import {
  createComponentChainLink,
  createPreviewAttributes,
  type ComponentChainLink,
} from "@hygraph/preview-sdk/core";

/**
 * An edit target identifies a Hygraph field for click-to-edit:
 * the root document (`entryId`) plus the chain of component instances
 * you traverse to reach the field. Scalar fields on the root document
 * have an empty chain.
 */
export type EditTarget = { entryId: string; chain: ComponentChainLink[] };

/** Build an edit target rooted at a document entry id. */
export function root(entryId: string | null | undefined): EditTarget | null {
  return entryId ? { entryId, chain: [] } : null;
}

/** Descend into a component instance from an existing target. */
export function into(
  target: EditTarget | null,
  fieldApiId: string,
  instanceId: string | null | undefined
): EditTarget | null {
  if (!target || !instanceId) return null;
  return {
    entryId: target.entryId,
    chain: [...target.chain, createComponentChainLink(fieldApiId, instanceId)],
  };
}

/**
 * Produce the `data-hygraph-*` attributes to spread onto the DOM element
 * that renders a given field. Returns an empty object when the target is
 * unknown so it can be spread unconditionally.
 */
export function fieldAttrs(
  target: EditTarget | null,
  fieldApiId: string,
  opts?: { richText?: "html" | "markdown" | "text" }
): Record<string, string> {
  if (!target) return {};
  const attrs = createPreviewAttributes({
    entryId: target.entryId,
    fieldApiId,
    componentChain: target.chain,
  }) as unknown as Record<string, string>;
  if (opts?.richText) attrs["data-hygraph-rich-text-format"] = opts.richText;
  return attrs;
}

/**
 * Produce the `data-hygraph-*` attributes for the element that WRAPS a
 * component instance inside an array (e.g. one block in a Page/Variant
 * `blocks` list). Unlike {@link fieldAttrs} this does not tag a scalar field;
 * it only marks the instance so the SDK can reorder it. The wrapper must be a
 * direct child of the array container, which itself carries the array field
 * via `fieldAttrs(root(entryId), "<arrayField>")`.
 */
export function chainAttrs(target: EditTarget | null): Record<string, string> {
  if (!target) return {};
  return createPreviewAttributes({
    entryId: target.entryId,
    componentChain: target.chain,
  }) as unknown as Record<string, string>;
}
