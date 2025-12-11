import { NextRequest, NextResponse } from "next/server";
import { generateContentCalendar, updateCalendarHistory, createEmptyHistory } from "@/lib/algorithm";
import { ContentCalendarInput, CalendarHistory } from "@/lib/types";

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

    // Update history for subsequent weeks
    const updatedHistory = updateCalendarHistory(calendarHistory, calendar);

    return NextResponse.json({
      calendar,
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

