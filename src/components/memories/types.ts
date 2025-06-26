
export interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  created_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  content: string;
  author: string;
  created_at: string;
}
