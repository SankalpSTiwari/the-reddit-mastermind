// Core types for the Reddit Mastermind content calendar system

export interface CompanyInfo {
  name: string;
  website: string;
  description: string;
  icp: string; // Ideal Customer Profile
}

export interface Persona {
  username: string;
  background: string;
  expertise: string[];
  writingStyle: string;
  subredditAffinities: string[]; // Subreddits this persona naturally fits
}

export interface Keyword {
  id: string;
  keyword: string;
}

export interface ContentCalendarInput {
  company: CompanyInfo;
  personas: Persona[];
  subreddits: string[];
  keywords: Keyword[];
  postsPerWeek: number;
  weekStartDate: Date;
  weekNumber?: number; // For tracking which week we're generating
}

export interface Post {
  id: string;
  subreddit: string;
  title: string;
  body: string;
  authorUsername: string;
  timestamp: Date;
  keywordIds: string[];
  engagementType: "question" | "discussion" | "recommendation-seeking" | "comparison";
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null; // null if direct reply to post
  commentText: string;
  username: string;
  timestamp: Date;
  mentionsProduct: boolean;
  sentimentType: "supportive" | "neutral" | "curious" | "adds-context";
}

export interface ContentCalendar {
  weekNumber: number;
  weekStartDate: Date;
  weekEndDate: Date;
  posts: Post[];
  comments: Comment[];
  qualityMetrics: QualityMetrics;
}

export interface QualityMetrics {
  overallScore: number; // 1-10
  naturalness: number; // 1-10
  diversityScore: number; // 1-10
  subredditDistribution: Record<string, number>;
  personaDistribution: Record<string, number>;
  keywordCoverage: number; // percentage
  warnings: string[];
}

export interface CalendarHistory {
  calendars: ContentCalendar[];
  usedTopics: string[]; // Track to avoid repetition
  usedSubredditPostCounts: Record<string, number>; // Track posting frequency
}

// Templates for generating natural content
export interface PostTemplate {
  type: Post["engagementType"];
  titlePatterns: string[];
  bodyPatterns: string[];
}

export interface CommentTemplate {
  type: Comment["sentimentType"];
  patterns: string[];
  productMentionPatterns: string[];
}

