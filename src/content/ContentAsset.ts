export type ContentType = 
  | "problem-solving"
  | "complete-guide"
  | "comparison"
  | "industry-resource"
  | "use-case";

export type ResourceCategory = 
  | "blog"
  | "guides"
  | "comparisons"
  | "checklists"
  | "templates"
  | "glossary"
  | "use-cases";

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface ContentAsset {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  contentType: ContentType;
  category: ResourceCategory;
  cluster: string;
  publishedAt: string;
  readMinutes: number;
  
  // AI Search Content Rules
  definition?: string;
  quickAnswer?: string;
  summary?: string;
  useCases?: string[];
  stepByStep?: { name: string; text: string }[];
  
  // The actual body
  body: BlogBlock[];
  
  // Structured data fields
  faq?: { q: string; a: string }[];
  examples?: { title: string; description: string }[];
  comparisons?: { feature: string; us: string; them: string }[];
  
  // Internal linking rules
  parentToolSlug: string; // 1 parent tool
  relatedToolSlugs: [string, string, string]; // exactly 3 related tools
  relatedAssetSlugs: [string, string]; // exactly 2 related blogs/assets
  relatedProgrammaticSlug: string; // 1 programmatic page
}
