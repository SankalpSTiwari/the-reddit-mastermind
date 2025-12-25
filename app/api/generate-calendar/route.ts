import { NextRequest, NextResponse } from 'next/server';
import {
  generateContentCalendar,
  updateCalendarHistory,
  createEmptyHistory,
} from '@/lib/algorithm';
import { ContentCalendarInput, CalendarHistory } from '@/lib/types';
import { getServerSupabaseClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, history } = body as {
      input: ContentCalendarInput;
      history?: CalendarHistory;
    };

    // Validate input
    if (!input.company || !input.personas || input.personas.length < 2) {
      return NextResponse.json(
        { error: 'Invalid input: company and at least 2 personas required' },
        { status: 400 }
      );
    }

    if (!input.subreddits || input.subreddits.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: at least one subreddit required' },
        { status: 400 }
      );
    }

    if (!input.keywords || input.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: at least one keyword required' },
        { status: 400 }
      );
    }

    // Parse date if it's a string
    const weekStartDate = new Date(input.weekStartDate);
    const inputWithDate: ContentCalendarInput = {
      ...input,
      weekStartDate,
    };

    // Use provided history or create empty
    // Reset history if company changed (namespace per company)
    let calendarHistory = history || createEmptyHistory();
    if (
      calendarHistory.companyName &&
      calendarHistory.companyName !== input.company.name
    ) {
      // Company changed, reset history to avoid cross-contamination
      calendarHistory = createEmptyHistory();
    }
    // Set current company name in history
    calendarHistory.companyName = input.company.name;

    // Generate the calendar structure (planning algorithm)
    const calendar = generateContentCalendar(inputWithDate, calendarHistory);

    // Generate original content with Claude if API key is set, otherwise use templates
    const finalCalendar = await generateContentWithClaude(
      calendar,
      inputWithDate,
      calendarHistory
    );

    // Update history for subsequent weeks
    const updatedHistory = updateCalendarHistory(
      calendarHistory,
      finalCalendar
    );

    // Persist to Supabase if configured (best-effort, non-blocking)
    persistCalendar(finalCalendar).catch((err) =>
      console.error('Supabase persistence error (non-blocking):', err)
    );

    return NextResponse.json({
      calendar: finalCalendar,
      history: updatedHistory,
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}

async function generateContentWithClaude(
  calendar: any,
  input: ContentCalendarInput,
  history: CalendarHistory
) {
  // Try CLAUDE_API_KEY first, then fall back to ANTHROPIC_API_KEY (standard env var)
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No API key, use template-based content as-is
    console.log('⚠️  No Claude API key found - using template-based content');
    return calendar;
  }

  console.log(`🔑 Claude API key found (length: ${apiKey.length})`);
  const client = new Anthropic({ apiKey });

  // Use claude-3-haiku-20240307 which we know works with this API key
  const workingModel = 'claude-3-haiku-20240307';
  console.log(`🤖 Using Claude model: ${workingModel} for content generation`);

  // Generate original posts with Claude
  const generatedPosts = await Promise.all(
    calendar.posts.map(async (post: any) => {
      try {
        console.log(`📝 Generating post ${post.id} with Claude...`);
        // Find the author persona for context
        const author = input.personas.find(
          (p) => p.username === post.authorUsername
        );

        // Get keywords for this post
        const postKeywords = input.keywords
          .filter((k) => post.keywordIds.includes(k.id))
          .map((k) => k.keyword)
          .join(', ');

        // Build context about the company
        const companyContext = `${
          input.company.name
        }: ${input.company.description.substring(0, 300)}...`;

        const personaContext = author
          ? `Author persona: ${
              author.writingStyle
            }. Background: ${author.background.substring(0, 300)}...`
          : '';

        // Get used topics to avoid repetition
        const usedTopicsContext =
          history.usedTopics.length > 0
            ? `\nAvoid repeating these topics: ${history.usedTopics
                .slice(-10)
                .join(', ')}`
            : '';

        const response = await client.messages.create({
          model: workingModel!,
          max_tokens: 1024,
          system: `You are an expert Reddit content creator. Generate ORIGINAL, authentic Reddit posts that sound like real users wrote them naturally.

CRITICAL RULES - NEVER USE THESE PHRASES:
- "Just like it says in the title"
- "I'm looking for something that works well and saves time"
- "Any recommendations appreciated"
- "What do you all use?"
- "Ideally something that's not too complicated"
- Generic template language

Guidelines:
- Create TRULY ORIGINAL content - write as if you're a real person with a specific situation
- Keep titles under 180 characters and bodies under 1200 characters
- Sound like a real Reddit user - conversational, authentic, with personality
- Match the engagement type but make it feel genuine, not formulaic
- Use specific details, scenarios, or pain points when relevant
- Vary your language - don't use the same phrases repeatedly
- Make it feel organic and natural, like someone actually typed it
- Return valid JSON only: {"title": "...", "body": "..."}`,
          messages: [
            {
              role: 'user',
              content: `Generate a COMPLETELY ORIGINAL Reddit post. Write it as if you're a real person posting to this subreddit, not using any templates.

Subreddit: ${post.subreddit}
Engagement Type: ${post.engagementType}
Keywords to incorporate naturally: ${postKeywords}
${personaContext ? `\n${personaContext}` : ''}
${
  companyContext
    ? `\nCompany context (mention naturally if relevant): ${companyContext}`
    : ''
}
${usedTopicsContext}

IMPORTANT: 
- Write as a real person would - with specific details, context, or a story
- DO NOT use generic phrases like "Just like it says in the title" or "Any recommendations appreciated"
- Make it conversational and varied - each post should feel unique
- If asking a question, make it a REAL question with context
- If seeking recommendations, explain WHY you need it
- Be creative and write something that sounds genuinely human

Return JSON with an original title and body.`,
            },
          ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const text = content.text;
          console.log(`✅ Claude response received for post ${post.id}`);
          // Extract JSON from the response (handle cases where Claude adds explanation)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              // Clean the JSON string to handle control characters
              let jsonStr = jsonMatch[0];
              // Remove control characters except for escaped ones
              jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, '');
              const parsed = JSON.parse(jsonStr);
              const generatedTitle = parsed.title
                ? String(parsed.title).slice(0, 180).trim()
                : post.title;
              const generatedBody = parsed.body
                ? String(parsed.body).slice(0, 1200).trim()
                : post.body;
              console.log(
                `✅ Post ${post.id} generated: "${generatedTitle.substring(
                  0,
                  50
                )}..."`
              );
              return {
                ...post,
                title: generatedTitle,
                body: generatedBody,
              };
            } catch (parseError: any) {
              console.error(
                `❌ JSON parse error for post ${post.id}:`,
                parseError.message
              );
              console.log(`Raw response snippet: ${text.substring(0, 200)}...`);
              // Try to extract title and body directly from text if JSON parsing fails
              const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
              const bodyMatch = text.match(/"body"\s*:\s*"([^"]+)"/);
              if (titleMatch && bodyMatch) {
                return {
                  ...post,
                  title: titleMatch[1].slice(0, 180).trim(),
                  body: bodyMatch[1].slice(0, 1200).trim(),
                };
              }
            }
          } else {
            console.warn(
              `⚠️  No JSON found in Claude response for post ${post.id}`
            );
          }
        }
        console.warn(`⚠️  Unexpected response format for post ${post.id}`);
        return post;
      } catch (err) {
        console.error(
          'Claude generation failed for post, using template fallback',
          err
        );
        // Log that we're using template fallback so user knows LLM isn't working
        console.warn(
          `Post ${post.id}: Using template fallback - LLM generation failed`
        );
        return post;
      }
    })
  );

  // Generate original comments with Claude
  const generatedComments = await Promise.all(
    calendar.comments.map(async (comment: any) => {
      try {
        // Find the commenter persona for context
        const commenter = input.personas.find(
          (p) => p.username === comment.username
        );

        // Find the related post for context
        const relatedPost = generatedPosts.find(
          (p: any) => p.id === comment.postId
        );

        const personaContext = commenter
          ? `Commenter persona: ${
              commenter.writingStyle
            }. Background: ${commenter.background.substring(0, 300)}...`
          : '';

        const companyContext = input.company.name;

        const response = await client.messages.create({
          model: workingModel!,
          max_tokens: 512,
          system: `You are an expert Reddit commenter. Generate ORIGINAL, authentic Reddit comments that sound like real users wrote them naturally.

CRITICAL RULES - NEVER USE THESE PHRASES:
- "+1 [product name]"
- "Seconding [product name]"
- "Same, [product name] has been solid for me too"
- "I've tried a bunch of tools. [Product] is the only one..."
- Generic agreement phrases

Guidelines:
- Create TRULY ORIGINAL comments - write as if you're a real person responding
- Keep comments under 500 characters
- Sound like a real Reddit user - conversational, authentic, with personality
- Match the sentiment but express it naturally, not formulaically
- If mentioning a product, make it feel organic - like you actually use it
- Use specific details, experiences, or context when relevant
- Vary your language - don't use the same phrases repeatedly
- Make it feel like a genuine human response
- Return valid JSON only: {"commentText": "..."}`,
          messages: [
            {
              role: 'user',
              content: `Generate a COMPLETELY ORIGINAL Reddit comment. Write it as if you're a real person responding naturally to this post.

Subreddit: ${relatedPost?.subreddit || 'unknown'}
Post Title: ${relatedPost?.title || 'Unknown'}
Post Body: ${relatedPost?.body?.substring(0, 300) || 'Unknown'}...
${personaContext ? `\n${personaContext}` : ''}
Should mention product: ${
                comment.mentionsProduct
                  ? 'Yes - naturally mention ' +
                    input.company.name +
                    ' in an organic, genuine way (like you actually use it)'
                  : 'No'
              }
Sentiment: ${comment.sentimentType}
${
  comment.parentCommentId
    ? 'This is a reply to another comment'
    : 'This is a direct reply to the post'
}

IMPORTANT:
- Write as a real person would respond - with specific details or experiences
- DO NOT use generic phrases like "+1 [product]" or "Seconding [product]"
- Make it conversational and varied - each comment should feel unique
- If mentioning a product, explain WHY you like it or HOW you use it
- Be creative and write something that sounds genuinely human

Return JSON with an original comment text.`,
            },
          ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const text = content.text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              // Clean the JSON string to handle control characters
              let jsonStr = jsonMatch[0];
              jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, '');
              const parsed = JSON.parse(jsonStr);
              return {
                ...comment,
                commentText: parsed.commentText
                  ? String(parsed.commentText).slice(0, 500).trim()
                  : comment.commentText,
              };
            } catch (parseError: any) {
              console.error(
                `❌ JSON parse error for comment ${comment.id}:`,
                parseError.message
              );
              // Try to extract commentText directly
              const commentMatch = text.match(/"commentText"\s*:\s*"([^"]+)"/);
              if (commentMatch) {
                return {
                  ...comment,
                  commentText: commentMatch[1].slice(0, 500).trim(),
                };
              }
            }
          }
        }
        return comment;
      } catch (err) {
        console.error(
          'Claude generation failed for comment, using template',
          err
        );
        return comment;
      }
    })
  );

  return { ...calendar, posts: generatedPosts, comments: generatedComments };
}

async function persistCalendar(calendar: any) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return; // no-op if env vars not provided

  await supabase.from('calendars').insert({
    week_number: calendar.weekNumber,
    week_start_date: calendar.weekStartDate,
    payload: calendar,
  });
}
