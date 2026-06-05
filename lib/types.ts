export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  category_id: number;
  author_id: string;
  tag: string | null;
  tags: string[] | null;
  views: number;
  created_at: string;
  updated_at: string;
  // 조인/집계
  xrc_categories?: Category;
  xrc_profiles?: Profile;
  like_count?: number;
  comment_count?: number;
};

export type Comment = {
  id: number;
  post_id: number;
  author_id: string;
  content: string;
  parent_id: number | null;
  created_at: string;
  xrc_profiles?: Profile;
};
