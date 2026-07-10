export type PostStatus = 'existing' | 'planned';

export interface Post {
  id: string;
  imageUrl: string;
  status: PostStatus;
  caption?: string;
}
