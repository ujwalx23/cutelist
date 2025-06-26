
export interface Memory {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  tags?: string[];
  created_at: string;
  user_id: string;
  isDefault?: boolean;
}

export interface Quote {
  id: string;
  content: string;
  author?: string;
  created_at: string;
  user_id: string;
  isDefault?: boolean;
}
