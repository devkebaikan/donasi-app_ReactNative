export interface OrganizationStats {
  programs: number;
  donatur: number;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  phone: string;
  joinedAt: string;
  description: string;
  stats: OrganizationStats;
  isVerified: boolean;
}

export interface OrganizationReport {
  id: string;
  title: string;
  periodLabel: string;
  publishedAt: string;
  fileUrl: string;
}

// Bentuk mentah response GET /organizations/:id — snake_case, mengikuti
// konvensi wire format yang sama dengan ProgramDetailApiResponse.
export interface OrganizationProfileApiResponse {
  id: number;
  name: string;
  logo: string;
  location: string;
  phone: string;
  joined_at: string;
  description: string;
  total_programs: number;
  total_donatur: number;
  is_verified: boolean;
}

// Bentuk mentah response GET /organizations/:id/reports
export interface OrganizationReportApiResponse {
  id: number;
  title: string;
  period: string;
  published_at: string;
  file_url: string;
}
