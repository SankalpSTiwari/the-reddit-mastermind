"use client";

import { ContentCalendar, Post, Comment } from "@/lib/types";
import { format } from "date-fns";
import {
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface CalendarViewProps {
  calendar: ContentCalendar;
  weekNumber: number;
}

export function CalendarView({ calendar, weekNumber }: CalendarViewProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const togglePost = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const getCommentsForPost = (postId: string): Comment[] => {
    return calendar.comments.filter((c) => c.postId === postId);
  };

  const personaColors: Record<string, string> = {};
  const colors = [
    "text-orange-400",
    "text-blue-400",
    "text-emerald-400",
    "text-amber-400",
    "text-pink-400",
    "text-violet-400",
  ];
  const bgColors = [
    "bg-orange-400/10 border-orange-400/30",
    "bg-blue-400/10 border-blue-400/30",
    "bg-emerald-400/10 border-emerald-400/30",
    "bg-amber-400/10 border-amber-400/30",
    "bg-pink-400/10 border-pink-400/30",
    "bg-violet-400/10 border-violet-400/30",
  ];

  // Assign colors to personas
  const allUsernames = [
    ...new Set([
      ...calendar.posts.map((p) => p.authorUsername),
      ...calendar.comments.map((c) => c.username),
    ]),
  ];
  allUsernames.forEach((username, i) => {
    personaColors[username] = colors[i % colors.length];
  });

  const getBgColorForUsername = (username: string) => {
    const idx = allUsernames.indexOf(username);
    return bgColors[idx % bgColors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-100">
            Week {weekNumber} Content Calendar
          </h2>
          <p className="text-surface-400 mt-1">
            {format(new Date(calendar.weekStartDate), "MMM d")} -{" "}
            {format(new Date(calendar.weekEndDate), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700">
            <MessageSquare className="w-4 h-4 text-surface-400" />
            <span className="text-surface-200 font-medium">
              {calendar.posts.length} posts
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700">
            <Hash className="w-4 h-4 text-surface-400" />
            <span className="text-surface-200 font-medium">
              {calendar.comments.length} comments
            </span>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <QualityMetricsCard metrics={calendar.qualityMetrics} />

      {/* Posts Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-surface-200 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-reddit-orange" />
          Content Timeline
        </h3>

        <div className="space-y-3">
          {calendar.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              comments={getCommentsForPost(post.id)}
              isExpanded={expandedPosts.has(post.id)}
              onToggle={() => togglePost(post.id)}
              personaColors={personaColors}
              getBgColor={getBgColorForUsername}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QualityMetricsCard({
  metrics,
}: {
  metrics: ContentCalendar["qualityMetrics"];
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="reddit-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-reddit-orange" />
        <h3 className="text-lg font-semibold text-surface-200">Quality Metrics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <MetricItem
          label="Overall Score"
          value={`${metrics.overallScore}/10`}
          subtext={getScoreLabel(metrics.overallScore)}
          className={getScoreColor(metrics.overallScore)}
        />
        <MetricItem
          label="Naturalness"
          value={`${metrics.naturalness}/10`}
          subtext="Conversation flow"
          className={getScoreColor(metrics.naturalness)}
        />
        <MetricItem
          label="Diversity"
          value={`${metrics.diversityScore}/10`}
          subtext="Content variety"
          className={getScoreColor(metrics.diversityScore)}
        />
        <MetricItem
          label="Keyword Coverage"
          value={`${Math.round(metrics.keywordCoverage)}%`}
          subtext="Keywords used"
          className={metrics.keywordCoverage >= 50 ? "text-emerald-400" : "text-amber-400"}
        />
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-surface-400 mb-2">Subreddit Distribution</p>
          <div className="space-y-2">
            {Object.entries(metrics.subredditDistribution).map(([sub, count]) => (
              <div key={sub} className="flex items-center gap-2">
                <span className="text-xs text-surface-300 w-32 truncate">{sub}</span>
                <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-reddit-orange rounded-full"
                    style={{
                      width: `${(count / Math.max(...Object.values(metrics.subredditDistribution))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-surface-400 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-surface-400 mb-2">Persona Activity</p>
          <div className="space-y-2">
            {Object.entries(metrics.personaDistribution).map(([persona, count]) => (
              <div key={persona} className="flex items-center gap-2">
                <span className="text-xs text-surface-300 w-32 truncate">{persona}</span>
                <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${(count / Math.max(...Object.values(metrics.personaDistribution))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-surface-400 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {metrics.warnings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-700">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Warnings</span>
          </div>
          <ul className="space-y-1">
            {metrics.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-surface-400">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MetricItem({
  label,
  value,
  subtext,
  className,
}: {
  label: string;
  value: string;
  subtext: string;
  className?: string;
}) {
  return (
    <div className="p-3 bg-surface-800/50 rounded-lg">
      <p className="text-xs text-surface-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${className || "text-surface-100"}`}>{value}</p>
      <p className="text-xs text-surface-500">{subtext}</p>
    </div>
  );
}

function PostCard({
  post,
  comments,
  isExpanded,
  onToggle,
  personaColors,
  getBgColor,
}: {
  post: Post;
  comments: Comment[];
  isExpanded: boolean;
  onToggle: () => void;
  personaColors: Record<string, string>;
  getBgColor: (username: string) => string;
}) {
  const formatTimestamp = (date: Date | string) => {
    return format(new Date(date), "EEE, MMM d 'at' h:mm a");
  };

  const engagementTypeBadge = {
    question: { label: "Question", class: "bg-blue-400/10 text-blue-400 border-blue-400/30" },
    discussion: { label: "Discussion", class: "bg-violet-400/10 text-violet-400 border-violet-400/30" },
    "recommendation-seeking": {
      label: "Seeking Recs",
      class: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    },
    comparison: { label: "Comparison", class: "bg-amber-400/10 text-amber-400 border-amber-400/30" },
  };

  const badge = engagementTypeBadge[post.engagementType];

  return (
    <div className="reddit-card overflow-hidden">
      {/* Post Header */}
      <div
        className="p-4 cursor-pointer hover:bg-surface-800/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="subreddit-badge px-2 py-0.5 rounded text-xs font-medium text-reddit-orange">
                {post.subreddit}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs border ${badge.class}`}
              >
                {badge.label}
              </span>
              <span className="text-xs text-surface-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(post.timestamp)}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-surface-100 font-medium text-lg mb-2">
              {post.title}
            </h4>

            {/* Body preview */}
            <p className="text-surface-400 text-sm line-clamp-2">{post.body}</p>

            {/* Author & Keywords */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${getBgColor(
                  post.authorUsername
                )}`}
              >
                <User className="w-3 h-3" />
                <span className={personaColors[post.authorUsername]}>
                  u/{post.authorUsername}
                </span>
              </span>
              <div className="flex items-center gap-1">
                {post.keywordIds.slice(0, 3).map((kid) => (
                  <span
                    key={kid}
                    className="px-1.5 py-0.5 bg-surface-800 rounded text-[10px] text-surface-400"
                  >
                    {kid}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Expand indicator */}
          <div className="flex items-center gap-2 text-surface-400">
            <span className="text-sm">{comments.length} comments</span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Comments Thread */}
      {isExpanded && comments.length > 0 && (
        <div className="border-t border-surface-700 bg-surface-900/50 p-4">
          <div className="space-y-3">
            {comments.map((comment, idx) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                personaColors={personaColors}
                getBgColor={getBgColor}
                depth={comment.parentCommentId ? 1 : 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  personaColors,
  getBgColor,
  depth,
}: {
  comment: Comment;
  personaColors: Record<string, string>;
  getBgColor: (username: string) => string;
  depth: number;
}) {
  const formatTimestamp = (date: Date | string) => {
    return format(new Date(date), "h:mm a");
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-8" : ""}`}>
      {depth > 0 && (
        <div className="thread-line self-stretch" />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium ${personaColors[comment.username]}`}
          >
            u/{comment.username}
          </span>
          <span className="text-xs text-surface-500">
            {formatTimestamp(comment.timestamp)}
          </span>
          {comment.mentionsProduct && (
            <span className="px-1.5 py-0.5 bg-emerald-400/10 border border-emerald-400/30 rounded text-[10px] text-emerald-400">
              Product mention
            </span>
          )}
        </div>
        <p className="text-sm text-surface-300">{comment.commentText}</p>
      </div>
    </div>
  );
}

