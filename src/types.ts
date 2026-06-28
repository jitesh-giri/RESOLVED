export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  locality: string;
  location?: { lat: number, lng: number };
  category: 'vandalism' | 'infrastructure' | 'trash' | 'safety' | 'positive';
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  views?: number;
  status: 'Pending' | 'Escalated' | 'Resolved';
  createdAt: number;
  createdBy: string;
  createdByName?: string;
  votedUsers?: Record<string, 'up' | 'down'>; // maps userId -> vote type
  comments?: Comment[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  locality?: string;
}
