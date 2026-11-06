import type { Category } from './category';
import type { Program } from './program';

export interface BannerSlide {
  image_url: string;
  link: string;
  is_new_tab: boolean;
}

export interface HomeBannerItem {
  name: string;
  image_url: string;
  link: string;
}

export interface MitraInfo {
  id: number;
  name: string;
  image: string;
  location: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  nominal_target: number;
  nominal_achieved: number;
  nominal_used: number;
  excecution_time: string;
  image: string;
  beneficiary: string;
  location: string;
  status: string;
  activity: string;
  mitra: MitraInfo;
  description: string;
  reason: string | null;
}

export interface HomeLastUpdate {
  id: number;
  feed_type: 'blog' | 'laporan' | string;
  title: string;
  content: string;
  image: string;
  date: string;
  date_string: string;
}

export interface HomePageData {
  banner_slides: BannerSlide[];
  main_banner: HomeBannerItem;
  second_banner: HomeBannerItem;
  third_banner: HomeBannerItem;
  project_list: ProjectItem[];
  program_category: Category[];
  program_list: Program[];
  program_rutin: Program[];
  last_update?: HomeLastUpdate[];
}
