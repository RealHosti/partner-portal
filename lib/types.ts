import { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyMembership = Database['public']['Tables']['company_memberships']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row']
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row']
export type ForumPost = Database['public']['Tables']['forum_posts']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogComment = Database['public']['Tables']['blog_comments']['Row']

export type MessageType = 'request' | 'inquiry' | 'feedback'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PortalRole = 'partner' | 'staff' | 'moderator' | 'admin'
export type CompanyStatus = 'pending' | 'approved' | 'rejected'
export type CompanyMembershipStatus = 'pending' | 'approved' | 'rejected'
export type CompanyRelationshipType = 'employee' | 'agency' | 'influencer' | 'founder' | 'freelancer' | 'other'

export interface CompanyMembershipWithCompany extends CompanyMembership {
  company: Company
}

export interface MessageWithSender extends Message {
  sender: Profile
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: Profile
}

export interface ChatRoomWithParticipants extends ChatRoom {
  participant_1_profile: Profile
  participant_2_profile: Profile
  last_message?: ChatMessage
}

export interface ForumTopicWithAuthor extends ForumTopic {
  author: Profile
  category: ForumCategory
  post_count: number
}

export interface ForumPostWithAuthor extends ForumPost {
  author: Profile
}

export interface BlogPostWithAuthor extends BlogPost {
  author: Profile
  comment_count: number
}

export interface BlogCommentWithAuthor extends BlogComment {
  author: Profile
}
