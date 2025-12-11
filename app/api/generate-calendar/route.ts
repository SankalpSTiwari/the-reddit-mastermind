import { NextRequest, NextResponse } from "next/server";
import { generateContentCalendar, updateCalendarHistory, createEmptyHistory } from "@/lib/algorithm";
import { ContentCalendarInput, CalendarHistory } from "@/lib/types";
import { getServerSupabaseClient } from "@/lib/supabase";
import OpenAI from "openai";

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
        { error: "Invalid input: company and at least 2 personas required" },
        { status: 400 }
      );
    }

    if (!input.subreddits || input.subreddits.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: at least one subreddit required" },
        { status: 400 }
      );
    }

    if (!input.keywords || input.keywords.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: at least one keyword required" },
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
    const calendarHistory = history || createEmptyHistory();

    // Generate the calendar
    const calendar = generateContentCalendar(inputWithDate, calendarHistory);

    // Optional: LLM polish for titles/bodies if OPENAI_API_KEY is set
    const polishedCalendar = await maybePolishWithLLM(calendar);

    // Update history for subsequent weeks
    const updatedHistory = updateCalendarHistory(calendarHistory, polishedCalendar);

    // Persist to Supabase if configured (best-effort, non-blocking)
    persistCalendar(polishedCalendar).catch((err) =>
      console.error("Supabase persistence error (non-blocking):", err)
    );

    return NextResponse.json({
      calendar: polishedCalendar,
      history: updatedHistory,
    });
  } catch (error) {
    console.error("Error generating calendar:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}

async function maybePolishWithLLM(calendar: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return calendar;

  const client = new OpenAI({ apiKey });

  const polishedPosts = await Promise.all(
    calendar.posts.map(async (post: any) => {
      try {
        const res = await client.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are an editor. Rewrite the Reddit post title/body to sound natural, concise, and human. Keep intent the same. Return JSON: {\"title\": \"...\", \"body\": \"...\"}.",
            },
            {
              role: "user",
              content: JSON.stringify({ title: post.title, body: post.body }),
            },
          ],
        });

        const parsed = JSON.parse(res.choices[0]?.message?.content ?? "{}");
        return {
          ...post,
          title: parsed.title ? String(parsed.title).slice(0, 180) : post.title,
          body: parsed.body ? String(parsed.body).slice(0, 1200) : post.body,
        };
      } catch (err) {
        console.error("LLM polish failed, using original post", err);
        return post;
      }
    })
  );

  return { ...calendar, posts: polishedPosts };
}

async function persistCalendar(calendar: any) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return; // no-op if env vars not provided

  await supabase.from("calendars").insert({
    week_number: calendar.weekNumber,
    week_start_date: calendar.weekStartDate,
    payload: calendar,
  });
}

