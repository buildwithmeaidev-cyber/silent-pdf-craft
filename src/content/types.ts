// src/content/types.ts

/** Base asset shared by all content types */
export interface ContentAsset {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  contentType: "problem-solving" | "complete-guide" | "comparison" | "industry-resource" | "use-case";
  category: string;
  cluster: string;
  publishedAt: string;
  readMinutes: number;
  definition: string;
  quickAnswer: string;
  summary: string;
  useCases: string[];
  stepByStep: { name: string; text: string }[];
  body: unknown[]; // can be rich text blocks
  faq: unknown[];
  parentToolSlug: string;
  relatedToolSlugs: [string, string, string];
  relatedAssetSlugs: [string, string];
  relatedProgrammaticSlug: string;
}

/** Specific asset types extend the base */
export interface ProblemGuide extends ContentAsset {
  contentType: "problem-solving";
}

export interface CompleteGuide extends ContentAsset {
  contentType: "complete-guide";
  // additional fields for long‑form content can be added here
}

export interface ComparisonArticle extends ContentAsset {
  contentType: "comparison";
  comparisonTable: Record<string, { feature: string; toolA: string; toolB: string }>;
}

export interface IndustryResource extends ContentAsset {
  contentType: "industry-resource";
  // e.g., calculator script references can be added
}

export interface UseCaseGuide extends ContentAsset {
  contentType: "use-case";
}
