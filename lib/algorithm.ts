import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours, addMinutes, format, startOfWeek } from 'date-fns';
import {
  ContentCalendarInput,
  ContentCalendar,
  Post,
  Comment,
  Persona,
  Keyword,
  QualityMetrics,
  CalendarHistory,
} from './types';

// ============================================================================
// CORE ALGORITHM: Reddit Mastermind Content Calendar Generator
// ============================================================================

/**
 * Main algorithm entry point - generates a content calendar for a given week
 */
export function generateContentCalendar(
  input: ContentCalendarInput,
  history?: CalendarHistory
): ContentCalendar {
  const weekNumber = input.weekNumber || 1;
  const weekStart = startOfWeek(input.weekStartDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 6);

  // Step 1: Plan post distribution across the week
  const postPlan = planPostDistribution(input, history);

  // Step 2: Generate posts with natural titles and bodies
  const posts = generatePosts(postPlan, input, weekStart);

  // Step 3: Generate organic comment threads for each post
  const comments = generateCommentThreads(posts, input);

  // Step 4: Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(posts, comments, input);

  return {
    weekNumber,
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
    posts,
    comments,
    qualityMetrics,
  };
}

// ============================================================================
// POST DISTRIBUTION ALGORITHM
// ============================================================================

interface PostPlan {
  dayOfWeek: number; // 0-6 (Mon-Sun)
  hourOfDay: number;
  subreddit: string;
  author: Persona;
  keywords: Keyword[];
  engagementType: Post['engagementType'];
}

function planPostDistribution(
  input: ContentCalendarInput,
  history?: CalendarHistory
): PostPlan[] {
  const plans: PostPlan[] = [];
  const { postsPerWeek, subreddits, personas, keywords } = input;

  // Track usage to ensure diversity
  const subredditUsage: Record<string, number> = {};
  const personaUsage: Record<string, number> = {};
  const chosenThisWeek = new Set<string>();

  // Initialize from history if available
  if (history) {
    Object.entries(history.usedSubredditPostCounts).forEach(([sub, count]) => {
      subredditUsage[sub] = count;
    });
  }

  // Engagement types to rotate through for variety
  const engagementTypes: Post['engagementType'][] = [
    'question',
    'recommendation-seeking',
    'comparison',
    'discussion',
  ];

  // Optimal posting times (based on Reddit engagement patterns)
  const optimalHours = [9, 10, 11, 14, 15, 18, 19, 20]; // Peak engagement hours

  // Distribute posts across weekdays (avoid weekends for B2B content)
  const postDays = distributePostsAcrossDays(postsPerWeek);

  for (let i = 0; i < postsPerWeek; i++) {
    // Select subreddit (favor less-used ones to avoid overposting, prefer fresh picks this week)
    const subreddit = selectSubreddit(
      subreddits,
      subredditUsage,
      history,
      chosenThisWeek,
      postsPerWeek
    );
    subredditUsage[subreddit] = (subredditUsage[subreddit] || 0) + 1;
    chosenThisWeek.add(subreddit);

    // Select author persona (match to subreddit + rotate for diversity)
    const author = selectAuthor(personas, subreddit, personaUsage);
    personaUsage[author.username] = (personaUsage[author.username] || 0) + 1;

    // Select keywords for this post (2-3 keywords per post)
    const postKeywords = selectKeywords(keywords, i, postsPerWeek);

    // Select engagement type (rotate through types)
    const engagementType = engagementTypes[i % engagementTypes.length];

    // Select posting time
    const dayOfWeek = postDays[i];
    const hourOfDay =
      optimalHours[Math.floor(Math.random() * optimalHours.length)];

    plans.push({
      dayOfWeek,
      hourOfDay,
      subreddit,
      author,
      keywords: postKeywords,
      engagementType,
    });
  }

  return plans;
}

function distributePostsAcrossDays(postsPerWeek: number): number[] {
  // Prefer weekdays (Mon=0 through Fri=4)
  const weekdays = [0, 1, 2, 3, 4];
  const days: number[] = [];

  for (let i = 0; i < postsPerWeek; i++) {
    // Spread posts across different days
    const dayIndex = i % weekdays.length;
    days.push(weekdays[dayIndex]);
  }

  // Shuffle to avoid predictable patterns
  return shuffleArray(days);
}

function selectSubreddit(
  subreddits: string[],
  usage: Record<string, number>,
  history?: CalendarHistory,
  chosenThisWeek?: Set<string>,
  postsPerWeek?: number
): string {
  const uniqueSubs = new Set(subreddits);
  const allowRepeatThisWeek =
    !chosenThisWeek || uniqueSubs.size < (postsPerWeek || subreddits.length);

  // Score each subreddit (lower usage = higher score)
  const scored = subreddits
    .filter((sub) => allowRepeatThisWeek || !chosenThisWeek?.has(sub))
    .map((sub) => {
      const currentUsage = usage[sub] || 0;
      const historicalUsage = history?.usedSubredditPostCounts[sub] || 0;
      // Penalize overused subreddits heavily
      const score = 100 - currentUsage * 20 - historicalUsage * 5;
      return { subreddit: sub, score };
    });

  // Sort by score and pick from top candidates with some randomness
  scored.sort((a, b) => b.score - a.score);
  const topCandidates = scored.slice(0, Math.min(5, scored.length));
  return topCandidates[Math.floor(Math.random() * topCandidates.length)]
    .subreddit;
}

function selectAuthor(
  personas: Persona[],
  subreddit: string,
  usage: Record<string, number>
): Persona {
  // Score personas based on subreddit fit and usage balance
  const scored = personas.map((persona) => {
    const currentUsage = usage[persona.username] || 0;
    const hasAffinity = persona.subredditAffinities?.includes(subreddit)
      ? 30
      : 0;
    const score = 100 - currentUsage * 15 + hasAffinity;
    return { persona, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Pick from top 2 candidates for some variety
  const topCandidates = scored.slice(0, Math.min(2, scored.length));
  return topCandidates[Math.floor(Math.random() * topCandidates.length)]
    .persona;
}

function selectKeywords(
  keywords: Keyword[],
  postIndex: number,
  totalPosts: number
): Keyword[] {
  // Better coverage: round-robin primaries, then add 1-2 additional keywords
  const shuffled = shuffleArray(keywords);
  const primary = shuffled[postIndex % shuffled.length];

  const extras: Keyword[] = [];
  const extrasNeeded = Math.max(0, Math.min(2, 3 - 1)); // up to 2 extras
  let cursor = (postIndex * 2 + 1) % shuffled.length;
  while (extras.length < extrasNeeded && extras.length + 1 < keywords.length) {
    const candidate = shuffled[cursor % shuffled.length];
    if (
      candidate.id !== primary.id &&
      !extras.find((k) => k.id === candidate.id)
    ) {
      extras.push(candidate);
    }
    cursor++;
  }

  return [primary, ...extras];
}

// ============================================================================
// POST GENERATION
// ============================================================================

function generatePosts(
  plans: PostPlan[],
  input: ContentCalendarInput,
  weekStart: Date,
  history?: CalendarHistory
): Post[] {
  const usedTitles = new Set<string>(history?.usedTopics || []);
  const usedPrimaries = new Set<string>(); // primary keyword ids used this week

  return plans.map((plan, index) => {
    const baseTimestamp = addHours(
      addDays(weekStart, plan.dayOfWeek),
      plan.hourOfDay
    );
    const timestamp = addMinutes(baseTimestamp, randomInRange(-15, 25)); // time jitter

    const { title, body, primaryKeywordId } = generatePostContent(
      plan,
      input,
      usedTitles,
      usedPrimaries
    );
    usedTitles.add(title.toLowerCase());
    if (primaryKeywordId) usedPrimaries.add(primaryKeywordId);

    return {
      id: `P${index + 1}`,
      subreddit: plan.subreddit,
      title,
      body,
      authorUsername: plan.author.username,
      timestamp,
      keywordIds: plan.keywords.map((k) => k.id),
      engagementType: plan.engagementType,
    };
  });
}

function generatePostContent(
  plan: PostPlan,
  input: ContentCalendarInput,
  avoidTitles?: Set<string>,
  usedPrimaries?: Set<string>
): { title: string; body: string; primaryKeywordId?: string } {
  const { engagementType, keywords, subreddit, author } = plan;
  const { company } = input;
  const primaryKeywordId = keywords[0]?.id;

  // Generate based on engagement type
  switch (engagementType) {
    case 'question':
      return {
        ...generateQuestionPost(keywords, subreddit, author, avoidTitles),
        primaryKeywordId,
      };
    case 'recommendation-seeking':
      return {
        ...generateRecommendationPost(
          keywords,
          subreddit,
          author,
          company,
          avoidTitles
        ),
        primaryKeywordId,
      };
    case 'comparison':
      return {
        ...generateComparisonPost(
          keywords,
          subreddit,
          author,
          company,
          avoidTitles
        ),
        primaryKeywordId,
      };
    case 'discussion':
      return {
        ...generateDiscussionPost(keywords, subreddit, author, avoidTitles),
        primaryKeywordId,
      };
    default:
      return {
        ...generateQuestionPost(keywords, subreddit, author, avoidTitles),
        primaryKeywordId,
      };
  }
}

function generateQuestionPost(
  keywords: Keyword[],
  subreddit: string,
  author: Persona,
  avoidTitles?: Set<string>
): { title: string; body: string } {
  const rawKeyword = keywords[0]?.keyword || 'tool';
  // Clean keyword - remove leading "best", "how to", etc. to avoid duplication
  const keyword = cleanKeyword(rawKeyword);

  const templates = [
    {
      title: `Best ${keyword}?`,
      body: `Just like it says in the title, what is the best ${keyword}? I'm looking for something that works well and saves time. Any recommendations appreciated.`,
    },
    {
      title: `What's your go-to for ${keyword}?`,
      body: `Been searching for a good solution for ${keyword}. What do you all use? Ideally something that's not too complicated to get started with.`,
    },
    {
      title: `${capitalizeFirst(keyword)} - what actually works?`,
      body: `Tried a few options for ${keyword} but nothing's clicked yet. What are people here actually using day-to-day?`,
    },
    {
      title: `Recommendations for ${keyword}?`,
      body: `Looking for suggestions on ${keyword}. I've heard a few names thrown around but wanted to get real opinions before committing to anything.`,
    },
  ];

  return pickTemplate(templates, avoidTitles);
}

function generateRecommendationPost(
  keywords: Keyword[],
  subreddit: string,
  author: Persona,
  company: { name: string },
  avoidTitles?: Set<string>
): { title: string; body: string } {
  const rawKeyword = keywords[0]?.keyword || 'tool';
  const keyword = cleanKeyword(rawKeyword);
  // Get a short topic for cleaner titles
  const shortTopic = extractCoreTopic(keyword);

  const templates = [
    {
      title: `Need help with ${shortTopic}`,
      body: `My team is struggling with ${keyword}. We spend way too much time on this and it's becoming a bottleneck. What tools or approaches have worked for you?`,
    },
    {
      title: `Looking for ${shortTopic} solutions`,
      body: `Currently evaluating options for ${keyword}. We need something reliable that won't require a ton of setup. Open to both free and paid options.`,
    },
    {
      title: `How do you handle ${shortTopic}?`,
      body: `Curious how others approach ${keyword}. Our current workflow is inefficient and I'm looking for better alternatives.`,
    },
  ];

  return pickTemplate(templates, avoidTitles);
}

function generateComparisonPost(
  keywords: Keyword[],
  subreddit: string,
  author: Persona,
  company: { name: string },
  avoidTitles?: Set<string>
): { title: string; body: string } {
  const rawKeyword = keywords[0]?.keyword || 'tool';
  const productName = company.name;

  // Check if keyword is already a comparison (contains "vs" or "versus")
  const isAlreadyComparison =
    rawKeyword.toLowerCase().includes(' vs ') ||
    rawKeyword.toLowerCase().includes(' versus ');

  if (isAlreadyComparison) {
    // Use the comparison keyword directly
    const templates = [
      {
        title: `${capitalizeFirst(rawKeyword)}?`,
        body: `Trying to figure out what's the best one for making presentations. Has anyone tried both?`,
      },
      {
        title: `${capitalizeFirst(rawKeyword)} - which is better?`,
        body: `Trying to decide between these two. What are people's experiences?`,
      },
      {
        title: `Anyone compared ${rawKeyword}?`,
        body: `Looking for real experiences comparing these options. Which one worked better for you?`,
      },
    ];
    return pickTemplate(templates, avoidTitles);
  }

  const keyword = cleanKeyword(rawKeyword);
  const shortTopic = extractCoreTopic(keyword);

  // Create natural comparison posts
  const competitors = getCompetitorNames(subreddit, productName);
  // Use a generic fallback that works across industries, or skip competitor-specific templates
  const competitor = competitors[0];

  // If we have a specific competitor, use competitor-specific templates
  // Otherwise, use generic comparison templates
  const templates = competitor
    ? [
        {
          title: `${productName} vs ${competitor} for ${shortTopic}?`,
          body: `Trying to figure out what's the best option for ${shortTopic}. Has anyone used both? Looking for real experiences.`,
        },
        {
          title: `${competitor} alternative for ${shortTopic}?`,
          body: `I've been using ${competitor} but wondering if there's something better for ${shortTopic}. Heard about a few alternatives but not sure what's worth trying.`,
        },
        {
          title: `Comparing options for ${shortTopic}`,
          body: `Need to pick between a few tools for ${shortTopic}. Anyone have experience comparing different solutions?`,
        },
      ]
    : [
        {
          title: `Comparing options for ${shortTopic}`,
          body: `Need to pick between a few tools for ${shortTopic}. Anyone have experience comparing different solutions?`,
        },
        {
          title: `Best ${shortTopic} solution?`,
          body: `Looking for the best option for ${shortTopic}. What are people using? Open to recommendations.`,
        },
        {
          title: `${shortTopic} - what's working for you?`,
          body: `Trying to find a good solution for ${shortTopic}. What tools or approaches have you found effective?`,
        },
      ];

  return pickTemplate(templates, avoidTitles);
}

function generateDiscussionPost(
  keywords: Keyword[],
  subreddit: string,
  author: Persona,
  avoidTitles?: Set<string>
): { title: string; body: string } {
  const rawKeyword = keywords[0]?.keyword || 'tool';
  const keyword = cleanKeyword(rawKeyword);
  const shortTopic = extractCoreTopic(keyword);

  const templates = [
    {
      title: `How has ${shortTopic} changed your workflow?`,
      body: `Been thinking about how ${shortTopic} fits into daily work. Curious to hear how others have integrated it and what impact it's had.`,
    },
    {
      title: `${capitalizeFirst(shortTopic)} - worth the investment?`,
      body: `Debating whether to invest time/money into ${shortTopic}. For those who've made the switch, was it worth it?`,
    },
    {
      title: `What I've learned about ${shortTopic}`,
      body: `After spending some time exploring ${shortTopic}, I'm curious what others have discovered. What's working? What's overrated?`,
    },
  ];

  return pickTemplate(templates, avoidTitles);
}

function getCompetitorNames(subreddit: string, exclude: string): string[] {
  const competitors: Record<string, string[]> = {
    'r/PowerPoint': ['PowerPoint', 'Google Slides', 'Keynote', 'Prezi'],
    'r/GoogleSlides': ['Google Slides', 'PowerPoint', 'Canva', 'Keynote'],
    'r/Canva': ['Canva', 'Adobe Express', 'Figma', 'PowerPoint'],
    'r/ChatGPT': ['ChatGPT', 'Claude', 'Gemini', 'Copilot'],
    'r/ClaudeAI': ['Claude', 'ChatGPT', 'Gemini', 'Perplexity'],
    default: [],
  };

  const list = competitors[subreddit] || competitors['default'];
  return list.filter((c) => c.toLowerCase() !== exclude.toLowerCase());
}

// ============================================================================
// COMMENT THREAD GENERATION
// ============================================================================

function generateCommentThreads(
  posts: Post[],
  input: ContentCalendarInput
): Comment[] {
  const allComments: Comment[] = [];
  let commentCounter = 1;

  for (const post of posts) {
    const threadComments = generateThreadForPost(post, input, commentCounter);
    allComments.push(...threadComments);
    commentCounter += threadComments.length;
  }

  return allComments;
}

function generateThreadForPost(
  post: Post,
  input: ContentCalendarInput,
  startId: number
): Comment[] {
  const comments: Comment[] = [];
  const { personas, company } = input;

  // Get available commenters (exclude post author)
  const commenters = shuffleArray(
    personas.filter((p) => p.username !== post.authorUsername)
  );
  if (commenters.length < 2) return comments;

  // Generate 2-4 comments per post
  const numComments = 2 + Math.floor(Math.random() * 3);

  // First comment: Product mention (natural recommendation)
  const firstCommenter = commenters[0];
  const firstComment: Comment = {
    id: `C${startId}`,
    postId: post.id,
    parentCommentId: null,
    commentText: generateProductMentionComment(post, company, firstCommenter),
    username: firstCommenter.username,
    timestamp: addMinutes(post.timestamp, 15 + Math.floor(Math.random() * 30)),
    mentionsProduct: true,
    sentimentType: 'supportive',
  };
  comments.push(firstComment);

  // Second comment: Agreement/+1 (builds social proof)
  if (commenters.length > 1 && numComments >= 2) {
    const secondCommenter = commenters[1];
    const secondComment: Comment = {
      id: `C${startId + 1}`,
      postId: post.id,
      parentCommentId: firstComment.id,
      commentText: generateAgreementComment(company),
      username: secondCommenter.username,
      timestamp: addMinutes(
        firstComment.timestamp,
        10 + Math.floor(Math.random() * 20)
      ),
      mentionsProduct: true,
      sentimentType: 'supportive',
    };
    comments.push(secondComment);

    // Optional third comment: OP response (closes the loop naturally)
    if (numComments >= 3) {
      const opResponse: Comment = {
        id: `C${startId + 2}`,
        postId: post.id,
        parentCommentId: secondComment.id,
        commentText: generateOPResponse(),
        username: post.authorUsername,
        timestamp: addMinutes(
          secondComment.timestamp,
          6 + Math.floor(Math.random() * 12)
        ),
        mentionsProduct: false,
        sentimentType: 'curious',
      };
      comments.push(opResponse);

      // Optional depth-2 reply from a different persona for thread variety
      if (numComments >= 4 && commenters.length > 2) {
        const depthResponder = commenters[2];
        comments.push({
          id: `C${startId + 3}`,
          postId: post.id,
          parentCommentId: opResponse.id,
          commentText: generateAgreementComment(company),
          username: depthResponder.username,
          timestamp: addMinutes(
            opResponse.timestamp,
            5 + Math.floor(Math.random() * 10)
          ),
          mentionsProduct: true,
          sentimentType: 'supportive',
        });
      }
    }
  }

  return comments;
}

function generateProductMentionComment(
  post: Post,
  company: { name: string; description: string },
  commenter: Persona
): string {
  const productName = company.name;

  const templates = [
    `I've tried a bunch of tools. ${productName} is the only one that doesn't make me fight the layout. Still fix things after, but it's a decent starting point.`,
    `${productName} has worked well for me. Not perfect but saves a lot of time compared to starting from scratch.`,
    `Been using ${productName} for a few months now. The output is pretty solid and I can always tweak it after.`,
    `Honestly, ${productName} surprised me. Expected another gimmick but it actually produces usable results.`,
    `I use ${productName} for this. It handles the structure well so I can focus on the content.`,
    `${productName} is worth checking out. It's not magic but it cuts down the tedious parts significantly.`,
  ];

  const index = hashString(commenter.username + post.id) % templates.length;
  return templates[index];
}

function generateAgreementComment(company: { name: string }): string {
  const templates = [
    `+1 ${company.name}`,
    `+1 ${company.name}. I put the output into other tools afterwards for final polish.`,
    `Same, ${company.name} has been solid for me too.`,
    `Seconding ${company.name}. Made my workflow much smoother.`,
    `+1 for ${company.name}. Simple but effective.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function generateOPResponse(): string {
  const templates = [
    `Sweet I'll check it out!!`,
    `Thanks, will give it a try!`,
    `Appreciate the rec, looking into it now.`,
    `Nice, exactly what I was looking for. Thanks!`,
    `Oh interesting, hadn't heard of that one. Thanks!`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ============================================================================
// QUALITY METRICS CALCULATION
// ============================================================================

function calculateQualityMetrics(
  posts: Post[],
  comments: Comment[],
  input: ContentCalendarInput
): QualityMetrics {
  const warnings: string[] = [];

  // Calculate subreddit distribution
  const subredditDistribution: Record<string, number> = {};
  posts.forEach((p) => {
    subredditDistribution[p.subreddit] =
      (subredditDistribution[p.subreddit] || 0) + 1;
  });

  // Check for overposting in any subreddit
  Object.entries(subredditDistribution).forEach(([sub, count]) => {
    if (count > 2) {
      warnings.push(
        `High posting frequency in ${sub}: ${count} posts this week`
      );
    }
  });

  // Calculate persona distribution
  const personaDistribution: Record<string, number> = {};
  posts.forEach((p) => {
    personaDistribution[p.authorUsername] =
      (personaDistribution[p.authorUsername] || 0) + 1;
  });
  comments.forEach((c) => {
    personaDistribution[c.username] =
      (personaDistribution[c.username] || 0) + 1;
  });

  // Check for persona imbalance
  const personaCounts = Object.values(personaDistribution);
  const maxPersonaUsage = Math.max(...personaCounts);
  const minPersonaUsage = Math.min(...personaCounts);
  if (maxPersonaUsage - minPersonaUsage > 5) {
    warnings.push(
      'Persona usage is unbalanced - consider rotating more evenly'
    );
  }

  // Calculate keyword coverage
  const usedKeywordIds = new Set(posts.flatMap((p) => p.keywordIds));
  const keywordCoverage = (usedKeywordIds.size / input.keywords.length) * 100;

  if (keywordCoverage < 50) {
    warnings.push(
      `Low keyword coverage: only ${keywordCoverage.toFixed(
        0
      )}% of keywords used`
    );
  }

  // Penalize repeated primary keywords across posts
  const primaryKeywords = posts.map((p) => p.keywordIds[0]).filter(Boolean);
  const uniquePrimaries = new Set(primaryKeywords);
  if (uniquePrimaries.size < primaryKeywords.length) {
    warnings.push('Repeated primary keywords detected; coverage could improve');
  }

  // Calculate naturalness score (based on conversation patterns)
  const naturalnessScore = calculateNaturalnessScore(posts, comments);

  // Calculate diversity score
  const diversityScore = calculateDiversityScore(
    subredditDistribution,
    personaDistribution,
    posts
  );

  // Overall score
  const overallScore = Math.round(
    (naturalnessScore + diversityScore + keywordCoverage / 10) / 3
  );

  return {
    overallScore: Math.min(10, Math.max(1, overallScore)),
    naturalness: naturalnessScore,
    diversityScore,
    subredditDistribution,
    personaDistribution,
    keywordCoverage,
    warnings,
  };
}

function calculateNaturalnessScore(posts: Post[], comments: Comment[]): number {
  let score = 10;

  // Check for repetitive patterns
  const titles = posts.map((p) => p.title.toLowerCase());
  const uniqueTitles = new Set(titles);
  if (uniqueTitles.size < titles.length) {
    score -= 2;
  }

  // Check comment timing variety
  const commentGaps = comments
    .filter((c) => c.parentCommentId === null)
    .map((c, i, arr) => {
      if (i === 0) return 0;
      const prevPost = posts.find((p) => p.id === c.postId);
      return prevPost
        ? (new Date(c.timestamp).getTime() -
            new Date(prevPost.timestamp).getTime()) /
            60000
        : 0;
    });

  const avgGap = commentGaps.reduce((a, b) => a + b, 0) / commentGaps.length;
  if (avgGap < 10 || avgGap > 60) {
    score -= 1;
  }

  // Check that OPs don't respond to their own posts first
  const selfResponses = comments.filter(
    (c) =>
      c.parentCommentId === null &&
      posts.find((p) => p.id === c.postId)?.authorUsername === c.username
  );
  score -= selfResponses.length * 2;

  return Math.max(1, Math.min(10, score));
}

function calculateDiversityScore(
  subredditDist: Record<string, number>,
  personaDist: Record<string, number>,
  posts: Post[]
): number {
  let score = 10;

  // Subreddit diversity
  const subredditCount = Object.keys(subredditDist).length;
  if (subredditCount < posts.length * 0.5) {
    score -= 2;
  }

  // Persona diversity
  const personaValues = Object.values(personaDist);
  const personaStdDev = standardDeviation(personaValues);
  if (personaStdDev > 3) {
    score -= 2;
  }

  // Engagement type diversity
  const engagementTypes = new Set(posts.map((p) => p.engagementType));
  if (engagementTypes.size < 2) {
    score -= 1;
  }

  return Math.max(1, Math.min(10, score));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Select a template while avoiding repeated titles when possible
function pickTemplate(
  templates: { title: string; body: string }[],
  avoidTitles?: Set<string>
): { title: string; body: string } {
  if (!avoidTitles || avoidTitles.size === 0) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  const shuffled = shuffleArray(templates);
  for (const tpl of shuffled) {
    if (!avoidTitles.has(tpl.title.toLowerCase())) {
      return tpl;
    }
  }

  // If everything collides, return a slightly varied fallback to reduce repetition
  const fallback = shuffled[0];
  return {
    title: `${fallback.title} (new take)`,
    body: fallback.body,
  };
}

function cleanKeyword(keyword: string): string {
  // Remove common prefixes that would cause duplication in templates
  const prefixesToRemove = [
    'best ',
    'how to ',
    'what is ',
    "what's ",
    'top ',
    'need help with ',
    'looking for ',
  ];

  let cleaned = keyword.toLowerCase();
  for (const prefix of prefixesToRemove) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length);
      break;
    }
  }
  return cleaned;
}

function extractCoreTopic(keyword: string): string {
  // Extract a shorter, cleaner topic from the keyword
  // e.g., "ai presentation maker" -> "presentations" or "slide decks"
  const words = keyword.split(' ');

  // If keyword is short enough, return as-is
  if (words.length <= 3) {
    return keyword;
  }

  // Take first 3 meaningful words
  return words.slice(0, 3).join(' ');
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function standardDeviation(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// ============================================================================
// HISTORY MANAGEMENT (for subsequent weeks)
// ============================================================================

export function updateCalendarHistory(
  history: CalendarHistory,
  newCalendar: ContentCalendar
): CalendarHistory {
  const newHistory = { ...history };

  // Add calendar to history
  newHistory.calendars = [...history.calendars, newCalendar];

  // Update used topics
  const newTopics = newCalendar.posts.map((p) => p.title.toLowerCase());
  newHistory.usedTopics = [...new Set([...history.usedTopics, ...newTopics])];

  // Update subreddit counts
  newCalendar.posts.forEach((post) => {
    newHistory.usedSubredditPostCounts[post.subreddit] =
      (newHistory.usedSubredditPostCounts[post.subreddit] || 0) + 1;
  });

  return newHistory;
}

export function createEmptyHistory(): CalendarHistory {
  return {
    calendars: [],
    usedTopics: [],
    usedSubredditPostCounts: {},
  };
}
