import { ContentAsset } from "../ContentAsset";
import { COMPRESS_CLUSTER } from "./compress-cluster";
import { MERGE_CLUSTER } from "./merge-cluster";

export const RESOURCES: ContentAsset[] = [...COMPRESS_CLUSTER, ...MERGE_CLUSTER].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getResource(slug: string): ContentAsset | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}
