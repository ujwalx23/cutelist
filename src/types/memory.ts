
// Define interfaces for Memory and Quote types
export interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  content: string;
  author: string | null;
  created_at: string;
}
