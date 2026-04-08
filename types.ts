export enum ListingType {
  SKILL = 'Skill Exchange',
  SALE = 'For Sale',
  RENTAL = 'For Rent',
}

export enum PaymentType {
  POINTS = 'Points',
  SKILL = 'Skill Swap',
  BOTH = 'Points or Skill Swap',
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  listingType: ListingType;
  category?: string;
  location?: string;
  tradePreferences?: string;
  isVerified?: boolean; // For skills
  paymentType: PaymentType;
  pointsPrice?: number;
  pointsPriceDuration?: 'hour' | 'day' | 'week' | 'month' | 'flat';
  skillPrice?: string; 
  userId: string;
  userName: string;
  userAvatarUrl: string;
  createdAt: string;
  status?: 'active' | 'rented' | 'sold';
  rentedToUserId?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
  points: number;
  averageRating?: number;
  totalReviews?: number;
  isAccountVerified?: boolean;
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  REVOKED = 'revoked',
  IN_PROGRESS = 'in_progress'
}

export interface ListingRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  status: RequestStatus;
  createdAt: string;
  startedAt?: string;
  completedByRequester?: boolean;
  completedByOwner?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage?: string;
  updatedAt: string;
}
