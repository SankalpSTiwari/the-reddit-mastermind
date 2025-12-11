"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Hash,
  Target,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { CompanyInfo, Persona, Keyword } from "@/lib/types";

interface InputFormsProps {
  company: CompanyInfo;
  setCompany: (company: CompanyInfo) => void;
  personas: Persona[];
  setPersonas: (personas: Persona[]) => void;
  subreddits: string[];
  setSubreddits: (subreddits: string[]) => void;
  keywords: Keyword[];
  setKeywords: (keywords: Keyword[]) => void;
  postsPerWeek: number;
  setPostsPerWeek: (n: number) => void;
}

export function InputForms({
  company,
  setCompany,
  personas,
  setPersonas,
  subreddits,
  setSubreddits,
  keywords,
  setKeywords,
  postsPerWeek,
  setPostsPerWeek,
}: InputFormsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["company", "personas"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Company Info Section */}
      <CollapsibleSection
        title="Company Info"
        icon={<Building2 className="w-5 h-5" />}
        isExpanded={expandedSections.has("company")}
        onToggle={() => toggleSection("company")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-400 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="form-input"
                placeholder="e.g., Slideforge"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="form-input"
                placeholder="e.g., slideforge.ai"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">
              Description
            </label>
            <textarea
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              className="form-input min-h-[120px] resize-y"
              placeholder="Describe what your product does, key features, and value proposition..."
            />
          </div>
          <div>
            <label className="block text-sm text-surface-400 mb-1.5">
              Ideal Customer Profile (ICP)
            </label>
            <textarea
              value={company.icp}
              onChange={(e) => setCompany({ ...company, icp: e.target.value })}
              className="form-input min-h-[100px] resize-y"
              placeholder="Describe your target customers, their needs, and why they'd use your product..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Personas Section */}
      <CollapsibleSection
        title={`Personas (${personas.length})`}
        icon={<Users className="w-5 h-5" />}
        isExpanded={expandedSections.has("personas")}
        onToggle={() => toggleSection("personas")}
      >
        <div className="space-y-4">
          {personas.map((persona, index) => (
            <PersonaCard
              key={index}
              persona={persona}
              index={index}
              onChange={(updated) => {
                const newPersonas = [...personas];
                newPersonas[index] = updated;
                setPersonas(newPersonas);
              }}
              onRemove={() => {
                if (personas.length > 2) {
                  setPersonas(personas.filter((_, i) => i !== index));
                }
              }}
              canRemove={personas.length > 2}
            />
          ))}
          <button
            onClick={() =>
              setPersonas([
                ...personas,
                {
                  username: "",
                  background: "",
                  expertise: [],
                  writingStyle: "",
                  subredditAffinities: [],
                },
              ])
            }
            className="w-full py-3 border-2 border-dashed border-surface-700 hover:border-surface-600 rounded-lg text-surface-400 hover:text-surface-300 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Persona
          </button>
        </div>
      </CollapsibleSection>

      {/* Subreddits Section */}
      <CollapsibleSection
        title={`Subreddits (${subreddits.length})`}
        icon={<Target className="w-5 h-5" />}
        isExpanded={expandedSections.has("subreddits")}
        onToggle={() => toggleSection("subreddits")}
      >
        <div>
          <label className="block text-sm text-surface-400 mb-1.5">
            Enter subreddits (one per line, with or without r/ prefix)
          </label>
          <textarea
            value={subreddits.join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n").filter((l) => l.trim());
              const formatted = lines.map((l) => {
                const trimmed = l.trim();
                return trimmed.startsWith("r/") ? trimmed : `r/${trimmed}`;
              });
              setSubreddits(formatted);
            }}
            className="form-input min-h-[200px] resize-y font-mono text-sm"
            placeholder="r/PowerPoint&#10;r/GoogleSlides&#10;r/consulting&#10;r/marketing&#10;r/entrepreneur"
          />
          <p className="text-xs text-surface-500 mt-2">
            {subreddits.length} subreddits configured
          </p>
        </div>
      </CollapsibleSection>

      {/* Keywords Section */}
      <CollapsibleSection
        title={`Keywords (${keywords.length})`}
        icon={<Hash className="w-5 h-5" />}
        isExpanded={expandedSections.has("keywords")}
        onToggle={() => toggleSection("keywords")}
      >
        <div>
          <label className="block text-sm text-surface-400 mb-1.5">
            Enter keywords/queries to target (one per line)
          </label>
          <textarea
            value={keywords.map((k) => k.keyword).join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n").filter((l) => l.trim());
              const newKeywords = lines.map((keyword, i) => ({
                id: `K${i + 1}`,
                keyword: keyword.trim(),
              }));
              setKeywords(newKeywords);
            }}
            className="form-input min-h-[200px] resize-y font-mono text-sm"
            placeholder="best ai presentation maker&#10;ai slide deck tool&#10;pitch deck generator&#10;alternatives to PowerPoint"
          />
          <p className="text-xs text-surface-500 mt-2">
            {keywords.length} keywords configured
          </p>
        </div>
      </CollapsibleSection>

      {/* Posts Per Week */}
      <div className="reddit-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-reddit-orange/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-reddit-orange" />
            </div>
            <div>
              <h3 className="text-surface-100 font-medium">Posts Per Week</h3>
              <p className="text-sm text-surface-400">
                How many posts to generate each week
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPostsPerWeek(Math.max(1, postsPerWeek - 1))}
              className="w-10 h-10 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors flex items-center justify-center"
            >
              -
            </button>
            <span className="text-2xl font-bold text-surface-100 w-10 text-center">
              {postsPerWeek}
            </span>
            <button
              onClick={() => setPostsPerWeek(Math.min(10, postsPerWeek + 1))}
              className="w-10 h-10 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="reddit-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-reddit-orange/10 flex items-center justify-center text-reddit-orange">
            {icon}
          </div>
          <h3 className="text-surface-100 font-medium">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-surface-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-surface-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-surface-700/50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function PersonaCard({
  persona,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  persona: Persona;
  index: number;
  onChange: (persona: Persona) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const colors = [
    "border-orange-400/30 bg-orange-400/5",
    "border-blue-400/30 bg-blue-400/5",
    "border-emerald-400/30 bg-emerald-400/5",
    "border-amber-400/30 bg-amber-400/5",
    "border-pink-400/30 bg-pink-400/5",
    "border-violet-400/30 bg-violet-400/5",
  ];

  return (
    <div className={`border rounded-lg p-4 ${colors[index % colors.length]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-surface-300 hover:text-surface-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <span className="text-surface-300 font-medium">
            Persona {index + 1}
            {persona.username && ` - u/${persona.username}`}
          </span>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-surface-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-surface-400 mb-1">
                Username
              </label>
              <input
                type="text"
                value={persona.username}
                onChange={(e) =>
                  onChange({ ...persona, username: e.target.value })
                }
                className="form-input text-sm"
                placeholder="reddit_username"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">
                Writing Style
              </label>
              <input
                type="text"
                value={persona.writingStyle}
                onChange={(e) =>
                  onChange({ ...persona, writingStyle: e.target.value })
                }
                className="form-input text-sm"
                placeholder="e.g., Professional, casual, technical..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">
              Background Story
            </label>
            <textarea
              value={persona.background}
              onChange={(e) =>
                onChange({ ...persona, background: e.target.value })
              }
              className="form-input text-sm min-h-[80px] resize-y"
              placeholder="Describe this persona's background, job, interests..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-surface-400 mb-1">
                Expertise (comma-separated)
              </label>
              <input
                type="text"
                value={persona.expertise.join(", ")}
                onChange={(e) =>
                  onChange({
                    ...persona,
                    expertise: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="form-input text-sm"
                placeholder="marketing, sales, tech"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-400 mb-1">
                Subreddit Affinities (comma-separated)
              </label>
              <input
                type="text"
                value={persona.subredditAffinities.join(", ")}
                onChange={(e) =>
                  onChange({
                    ...persona,
                    subredditAffinities: e.target.value
                      .split(",")
                      .map((s) => s.trim()),
                  })
                }
                className="form-input text-sm"
                placeholder="r/marketing, r/sales"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

