'use client';

import React, { useRef, useState } from 'react';
import { projectsData, ProjectItemData, ProjectArtKey } from '@/data/projects';
import { useLanguage } from '@/context/LanguageContext';
import { FolderGit2, ExternalLink, AlertCircle, Clock, ArrowUpRight, Lock } from 'lucide-react';
import { ProjectArt, projectArtCss } from '@/components/projects/ProjectArt';

type TabKey = 'all' | 'live' | 'in-progress' | 'future-idea';

const ACCENT: Record<ProjectArtKey, string> = {
  mehendi: '#e7c46e',
  'web-studio': '#a78bfa',
  technology: '#38e8ff',
  bridge: '#fb923c',
  quantum: '#2dd4bf',
  orbit: '#818cf8',
};

function openProject(url?: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function ProjectCard({
  project,
  index,
  operationalLabel,
}: {
  project: ProjectItemData;
  index: number;
  operationalLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isLive = project.status === 'live' && !!project.url;
  const accent = ACCENT[project.art ?? 'technology'];
  const serif = project.banner?.style === 'serif';

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    el.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * 9}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  const linkProps = isLive
    ? {
        role: 'link' as const,
        tabIndex: 0,
        'aria-label': `${project.title} — open website`,
        onClick: () => openProject(project.url),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProject(project.url);
          }
        },
      }
    : {};

  return (
    <div className="hp-card-in" style={{ animationDelay: `${index * 0.12}s` }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        {...linkProps}
        style={{ ['--accent' as string]: accent }}
        className={`hp-card group relative h-full rounded-xl p-[1.5px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#38e8ff] ${
          isLive ? 'cursor-pointer' : 'cursor-default'
        } hover:shadow-[0_0_40px_-8px_var(--accent)]`}
      >
        {/* animated glowing border */}
        <div
          className={`hp-border transition-opacity duration-500 ${
            isLive ? 'opacity-70 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-80'
          }`}
        />
        <div className="absolute inset-0 rounded-xl border border-white/10" />

        <div className="relative h-full flex flex-col rounded-[11px] bg-[#070b12] overflow-hidden">
          {/* ───── animated banner ───── */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
              <ProjectArt art={project.art} />
            </div>
            {/* readability gradient behind the text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070b12] to-transparent" />
            <div className="hp-scan" />
            <div className="hp-shine" />

            {/* banner text */}
            {project.banner && (
              <div className="absolute left-4 top-4 right-1/3 sm:left-5 sm:top-5">
                <div
                  className={`leading-[0.95] ${
                    serif
                      ? 'font-serif text-[1.7rem] sm:text-[2rem] hp-gold-text'
                      : 'font-bold tracking-tight text-[1.6rem] sm:text-[1.85rem] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]'
                  }`}
                  style={!serif ? { textShadow: `0 0 18px ${accent}66` } : undefined}
                >
                  {project.banner.line1}
                </div>
                <div
                  className={`mt-1 ${
                    serif && project.art === 'mehendi'
                      ? 'font-serif uppercase tracking-[0.18em] text-[0.8rem] sm:text-[0.9rem] text-[#f1d58c]'
                      : serif
                      ? 'font-serif text-[1.7rem] sm:text-[2rem] hp-gold-text leading-[0.95]'
                      : 'font-bold tracking-tight text-[1.6rem] sm:text-[1.85rem] leading-[0.95]'
                  }`}
                  style={!serif ? { color: accent, textShadow: `0 0 18px ${accent}88` } : undefined}
                >
                  {project.banner.line2}
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-white/80 max-w-[12rem] leading-snug drop-shadow">
                  {project.banner.tagline}
                </p>
              </div>
            )}

            {/* HUD corners */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: accent }} />
            <span className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: accent }} />
          </div>

          {/* ───── spotlight that follows the mouse ───── */}
          <div className="hp-spot absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* ───── card body ───── */}
          <div className="relative flex-1 flex flex-col p-5 pt-3">
            <div className="mb-3">
              {isLive ? (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] font-mono uppercase tracking-widest">
                  <span className="relative flex w-2 h-2">
                    <span className="hp-ping absolute inset-0 rounded-full bg-emerald-400" />
                    <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  Live · {operationalLabel}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest"
                  style={{ borderColor: `${accent}66`, background: `${accent}14`, color: accent }}
                >
                  <span className="relative flex w-2 h-2">
                    <span className="hp-ping absolute inset-0 rounded-full" style={{ background: accent }} />
                    <span className="relative w-2 h-2 rounded-full" style={{ background: accent }} />
                  </span>
                  Upcoming
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-white">{project.title ?? project.id}</h3>
            {project.description && (
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-3">
              {project.techTags.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[10px] font-mono text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-5 flex items-stretch gap-2.5">
              {isLive ? (
                <>
                  <span
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-md text-xs font-mono font-semibold uppercase tracking-wider text-[#05070a] transition-all group-hover:tracking-[0.18em]"
                    style={{
                      background: 'linear-gradient(90deg,#38e8ff,#7df9ff)',
                      boxShadow: '0 0 20px rgba(56,232,255,0.45)',
                    }}
                  >
                    View Project
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="inline-flex items-center justify-center w-11 min-h-[44px] rounded-md border border-[#38e8ff]/50 text-[#38e8ff] group-hover:bg-[#38e8ff]/10">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-md border text-xs font-mono uppercase tracking-wider"
                    style={{ borderColor: `${accent}55`, color: accent }}
                  >
                    <Clock className="w-4 h-4" />
                    Coming Soon
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-11 min-h-[44px] rounded-md border border-[#1e293b] text-slate-500"
                    aria-hidden
                  >
                    <Lock className="w-4 h-4" />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const liveProjects = projectsData.filter((p) => p.status === 'live');
  const inProgressProjects = projectsData.filter((p) => p.status === 'in-progress');
  const futureIdeasProjects = projectsData.filter((p) => p.status === 'future-idea');

  const currentList: ProjectItemData[] =
    activeTab === 'all'
      ? projectsData
      : activeTab === 'live'
      ? liveProjects
      : activeTab === 'in-progress'
      ? inProgressProjects
      : futureIdeasProjects;

  const allLabel = (t.projects.tabs as { all?: string }).all ?? 'All Projects';

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'all', label: allLabel, count: projectsData.length },
    { key: 'live', label: t.projects.tabs.live, count: liveProjects.length },
    { key: 'in-progress', label: t.projects.tabs.inProgress, count: inProgressProjects.length },
    { key: 'future-idea', label: t.projects.tabs.futureIdeas, count: futureIdeasProjects.length },
  ];

  return (
    <section
      id="projects"
      aria-label={t.projects.title}
      className="relative isolate py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      <style>{projectArtCss}</style>

      {/* moving grid in the background */}
      <div className="hp-grid-bg absolute inset-0 -z-10 pointer-events-none" aria-hidden />

      {/* Section Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <FolderGit2 className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.projects.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.projects.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.projects.subtitle}
        </p>
      </div>

      {/* Grouping Tabs */}
      <div className="relative z-0 flex items-center gap-3 mb-10 pb-4 border-b border-[#1e293b] overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
                : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#070a0f] border border-[#1e293b]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid or Coming Soon State */}
      {currentList.length > 0 ? (
        <div key={activeTab} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              operationalLabel={t.common.operational}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 bg-[#0b0f17] border border-[#1e293b] text-center max-w-2xl mx-auto hud-frame">
          <div className="w-12 h-12 bg-[#070a0f] border border-[#ffb020]/40 flex items-center justify-center text-[#ffb020] mx-auto mb-4">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider mb-2">
            {t.projects.pendingNotice}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto mb-6">
            {activeTab === 'live'
              ? t.projects.emptyLive
              : activeTab === 'in-progress'
              ? t.projects.emptyInProgress
              : t.projects.emptyIdeas}
          </p>
          <div className="p-4 bg-[#070a0f] border border-[#1e293b] text-[11px] font-mono text-slate-400 flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-[#38e8ff] shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block mb-0.5">
                {t.common.status}: {t.common.operational}
              </span>
              <span>{t.projects.pendingNotice}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
