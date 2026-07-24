import { ContentAsset } from "../ContentAsset";
import { COMPRESS_CLUSTER } from "./compress-cluster";
import { MERGE_CLUSTER } from "./merge-cluster";
import { SPLIT_CLUSTER } from "./split-cluster";
import { PROTECT_CLUSTER } from "./protect-cluster";
import { ROTATE_CLUSTER } from "./rotate-cluster";
import { EDIT_CLUSTER } from "./edit-cluster";
import { PDF_TO_WORD_CLUSTER } from "./pdf-to-word-cluster";
import { WORD_TO_PDF_CLUSTER } from "./word-to-pdf-cluster";
import { ESIGN_CLUSTER } from "./esign-cluster";
import { WATERMARK_CLUSTER } from "./watermark-cluster";
import { PHOTO_TO_PDF_CLUSTER } from "./photo-to-pdf-cluster";
import { REORDER_CLUSTER } from "./reorder-cluster";
import { EXPORT_CLUSTER } from "./export-cluster";
import { ADDPAGES_CLUSTER } from "./addpages-cluster";
import { REMOVEWATERMARK_CLUSTER } from "./removewatermark-cluster";
import { REMOVE_CLUSTER } from "./remove-cluster";
import { TEMPLATES_CLUSTER } from "./templates/templates-cluster";

export const RESOURCES: ContentAsset[] = [
  ...COMPRESS_CLUSTER,
  ...MERGE_CLUSTER,
  ...SPLIT_CLUSTER,
  ...PROTECT_CLUSTER,
  ...ROTATE_CLUSTER,
  ...EDIT_CLUSTER,
  ...PDF_TO_WORD_CLUSTER,
  ...WORD_TO_PDF_CLUSTER,
  ...ESIGN_CLUSTER,
  ...WATERMARK_CLUSTER,
  ...PHOTO_TO_PDF_CLUSTER,
  ...REORDER_CLUSTER,
  ...EXPORT_CLUSTER,
  ...ADDPAGES_CLUSTER,
  ...REMOVEWATERMARK_CLUSTER,
  ...REMOVE_CLUSTER,
  ...TEMPLATES_CLUSTER,
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getResource(slug: string): ContentAsset | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}
