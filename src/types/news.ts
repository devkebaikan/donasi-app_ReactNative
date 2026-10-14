export type NewsFilter = 'recommended' | 'popular' | 'newest';

export interface Article {
  id: string;
  title: string;
  coverImageUrl: string;
  publishedAt: string; // ISO date — dirender via formatRelativeTime
  likeCount: number;
  isLiked: boolean; // dari sudut pandang user yang sedang login; selalu false untuk guest
}

// Field `partner` sengaja bukan `mitra` (beda dari Program/ProgramDetail yang
// sudah ada) — mengikuti standar identifier Bahasa Inggris di CLAUDE.md
// untuk tipe baru.
export interface ArticleDetail extends Article {
  content: string; // HTML — dirender via HtmlContent (paragraf, <br>, <img>)
  partner: {
    id: string;
    name: string;
    logoUrl: string;
  } | null;
}
