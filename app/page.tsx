"use client";

import { useState } from "react";
import { addWeeks, format } from "date-fns";
import {
  Sparkles,
  Calendar,
  ChevronRight,
  Loader2,
  Download,
  RefreshCw,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { InputForms } from "@/components/InputForms";
import { CalendarView } from "@/components/CalendarView";
import {
  CompanyInfo,
  Persona,
  Keyword,
  ContentCalendar,
  CalendarHistory,
} from "@/lib/types";
import {
  slideforgeCompany,
  slideforgePersonas,
  slideforgeSubreddits,
  slideforgeKeywords,
} from "@/lib/sample-data";

export default function Home() {
  // Input state
  const [company, setCompany] = useState<CompanyInfo>({
    name: "",
    website: "",
    description: "",
    icp: "",
  });
  const [personas, setPersonas] = useState<Persona[]>([
    {
      username: "",
      background: "",
      expertise: [],
      writingStyle: "",
      subredditAffinities: [],
    },
    {
      username: "",
      background: "",
      expertise: [],
      writingStyle: "",
      subredditAffinities: [],
    },
  ]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [postsPerWeek, setPostsPerWeek] = useState(3);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendars, setCalendars] = useState<ContentCalendar[]>([]);
  const [history, setHistory] = useState<CalendarHistory | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "calendar">("input");
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Load sample data
  const loadSampleData = () => {
    setCompany(slideforgeCompany);
    setPersonas(slideforgePersonas);
    setSubreddits(slideforgeSubreddits);
    setKeywords(slideforgeKeywords);
    setPostsPerWeek(3);
  };

  // Validate inputs
  const isValid = () => {
    return (
      company.name &&
      company.description &&
      personas.length >= 2 &&
      personas.every((p) => p.username && p.background) &&
      subreddits.length > 0 &&
      keywords.length > 0 &&
      postsPerWeek > 0
    );
  };

  // Generate initial calendar
  const generateCalendar = async () => {
    if (!isValid()) return;

    setIsGenerating(true);
    try {
      const weekStartDate = new Date();
      const response = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            company,
            personas,
            subreddits,
            keywords,
            postsPerWeek,
            weekStartDate: weekStartDate.toISOString(),
            weekNumber: 1,
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      setCalendars([data.calendar]);
      setHistory(data.history);
      setActiveTab("calendar");
      setSelectedWeek(0);
    } catch (error) {
      console.error("Error generating calendar:", error);
      alert("Failed to generate calendar");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate next week
  const generateNextWeek = async () => {
    if (!history || calendars.length === 0) return;

    setIsGenerating(true);
    try {
      const lastCalendar = calendars[calendars.length - 1];
      const nextWeekStart = addWeeks(new Date(lastCalendar.weekStartDate), 1);

      const response = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            company,
            personas,
            subreddits,
            keywords,
            postsPerWeek,
            weekStartDate: nextWeekStart.toISOString(),
            weekNumber: calendars.length + 1,
          },
          history,
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      setCalendars([...calendars, data.calendar]);
      setHistory(data.history);
      setSelectedWeek(calendars.length);
    } catch (error) {
      console.error("Error generating next week:", error);
      alert("Failed to generate next week");
    } finally {
      setIsGenerating(false);
    }
  };

  // Export calendar to JSON
  const exportCalendar = () => {
    const exportData = {
      company,
      calendars,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-calendar-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset everything
  const reset = () => {
    setCalendars([]);
    setHistory(null);
    setActiveTab("input");
    setSelectedWeek(0);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-reddit-orange to-reddit-orangeDark flex items-center justify-center shadow-lg glow-orange-subtle">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-100">
                  Reddit Mastermind
                </h1>
                <p className="text-xs text-surface-500">
                  Content Calendar Generator
                </p>
              </div>
            </div>

            {calendars.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportCalendar}
                  className="btn-secondary flex items-center gap-2 text-sm py-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={reset}
                  className="btn-secondary flex items-center gap-2 text-sm py-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-surface-800 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("input")}
              className={`py-4 text-sm font-medium transition-colors relative ${
                activeTab === "input"
                  ? "text-reddit-orange tab-active"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Configuration
              </span>
            </button>
            <button
              onClick={() => calendars.length > 0 && setActiveTab("calendar")}
              disabled={calendars.length === 0}
              className={`py-4 text-sm font-medium transition-colors relative ${
                activeTab === "calendar"
                  ? "text-reddit-orange tab-active"
                  : calendars.length > 0
                  ? "text-surface-400 hover:text-surface-200"
                  : "text-surface-600 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
                {calendars.length > 0 && (
                  <span className="px-2 py-0.5 bg-reddit-orange/20 text-reddit-orange text-xs rounded-full">
                    {calendars.length} week{calendars.length > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "input" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Forms */}
            <div className="lg:col-span-2">
              <InputForms
                company={company}
                setCompany={setCompany}
                personas={personas}
                setPersonas={setPersonas}
                subreddits={subreddits}
                setSubreddits={setSubreddits}
                keywords={keywords}
                setKeywords={setKeywords}
                postsPerWeek={postsPerWeek}
                setPostsPerWeek={setPostsPerWeek}
              />
            </div>

            {/* Action Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Sample Data Card */}
                <div className="reddit-card p-4">
                  <h3 className="text-surface-200 font-medium mb-2">
                    Quick Start
                  </h3>
                  <p className="text-sm text-surface-400 mb-3">
                    Load the Slideforge sample data to see how the algorithm
                    works.
                  </p>
                  <button
                    onClick={loadSampleData}
                    className="w-full btn-secondary text-sm"
                  >
                    Load Sample Data
                  </button>
                </div>

                {/* Validation Status */}
                <div className="reddit-card p-4">
                  <h3 className="text-surface-200 font-medium mb-3">
                    Configuration Status
                  </h3>
                  <div className="space-y-2">
                    <StatusItem
                      label="Company info"
                      isValid={!!company.name && !!company.description}
                    />
                    <StatusItem
                      label={`Personas (${personas.filter((p) => p.username).length})`}
                      isValid={
                        personas.length >= 2 &&
                        personas.filter((p) => p.username && p.background)
                          .length >= 2
                      }
                    />
                    <StatusItem
                      label={`Subreddits (${subreddits.length})`}
                      isValid={subreddits.length > 0}
                    />
                    <StatusItem
                      label={`Keywords (${keywords.length})`}
                      isValid={keywords.length > 0}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateCalendar}
                  disabled={!isValid() || isGenerating}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg glow-orange disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Calendar
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {!isValid() && (
                  <p className="text-xs text-surface-500 text-center">
                    Fill in all required fields to generate
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="space-y-6">
            {/* Week Selector */}
            {calendars.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {calendars.map((cal, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWeek(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedWeek === idx
                        ? "bg-reddit-orange text-white"
                        : "bg-surface-800 text-surface-300 hover:bg-surface-700"
                    }`}
                  >
                    Week {cal.weekNumber}
                    <span className="ml-2 text-xs opacity-75">
                      {format(new Date(cal.weekStartDate), "MMM d")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Calendar Content */}
            {calendars[selectedWeek] && (
              <CalendarView
                calendar={calendars[selectedWeek]}
                weekNumber={calendars[selectedWeek].weekNumber}
              />
            )}

            {/* Generate Next Week Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={generateNextWeek}
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Week {calendars.length + 1}...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Generate Week {calendars.length + 1}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Hint */}
            <p className="text-center text-sm text-surface-500">
              Click the button above to simulate generating the next week's
              calendar
              <br />
              (In production, this would run on a cron schedule)
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-800 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-surface-500">
            Reddit Mastermind — Content Calendar Generator for Organic Reddit
            Marketing
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatusItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-surface-400">{label}</span>
      <span
        className={`w-2 h-2 rounded-full ${
          isValid ? "bg-emerald-400" : "bg-surface-600"
        }`}
      />
    </div>
  );
}

