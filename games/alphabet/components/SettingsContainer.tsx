'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { DEFAULT_SETTINGS } from '@/games/alphabet/constants';
import { useGameStore } from '@/games/alphabet/store';
import {
  GameMode,
  type GameSettings as SettingsType,
} from '@/games/alphabet/types';
import { useGameT } from '@/games/alphabet/i18n/use-game-t';
import { useLocale } from '@/shared/i18n/I18nProvider';
import { SettingsPanel, StepperInput, TeamsSetup } from '@/shared/game-kit';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

export function SettingsContainer() {
  const {
    initializeGame,
    setShowPrompt,
    setAIGeneratorOpen,
    setLibraryOpen,
    setGuideOpen,
    loadCustomQuestions,
    saveToLibrary,
    questions,
    library,
    systemSuites,
  } = useGameStore();
  const locale = useLocale();
  const t = useGameT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTimers, setShowTimers] = useState(false);
  const totalSuitesCount =
    library.filter((suite) => suite.language === locale).length +
    (systemSuites?.filter((suite) => suite.language === locale).length ?? 0);

  const [settings, setSettings] = useState<SettingsType>({
    ...DEFAULT_SETTINGS,
    questionsTopic: questions.currentSuite?.title ?? t.defaultTopic,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const json = JSON.parse(loadEvent.target?.result as string);
        if (json.questionsList && Array.isArray(json.questionsList)) {
          loadCustomQuestions(json);
          saveToLibrary(json);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch {
        // invalid JSON — operator feedback via library flow
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-bg px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6 text-fg shadow-card">
          <div>
            <h1 className="text-lg font-bold">{t.title}</h1>
            <p className="text-sm text-fg-muted">{t.subtitle}</p>
          </div>
          <Button variant="secondary" onClick={() => setAIGeneratorOpen(true)}>
            {t.aiGenerator}
          </Button>
          <Button variant="secondary" onClick={() => setLibraryOpen(true)}>
            {t.library} ({totalSuitesCount})
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".json"
            onChange={handleFileUpload}
          />
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            {t.importJson}
          </Button>
          <a href="#rules" className="text-sm font-semibold text-primary hover:underline">
            {t.rules}
          </a>
          <Button variant="ghost" onClick={() => setGuideOpen(true)}>
            {t.guide}
          </Button>
          <Button variant="ghost" onClick={() => setShowPrompt(true)}>
            {t.prompt}
          </Button>
        </aside>

        <SettingsPanel
          title={t.settings}
          startLabel={t.start}
          onStart={() => initializeGame(settings, locale)}
        >
          <div>
            <p className="mb-2 text-sm font-semibold text-fg-muted">{t.mode}</p>
            <div className="flex gap-2">
              {[GameMode.WITH_QUESTIONS, GameMode.WITHOUT_QUESTIONS].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSettings({ ...settings, gameMode: mode })}
                  className={cn(
                    'h-10 flex-1 rounded-ctl px-3 text-sm font-semibold',
                    settings.gameMode === mode
                      ? 'bg-primary text-primary-fg'
                      : 'border border-border bg-surface text-fg-muted',
                  )}
                >
                  {mode === GameMode.WITH_QUESTIONS ? t.withQuestions : t.withoutQuestions}
                </button>
              ))}
            </div>
          </div>

          {settings.gameMode === GameMode.WITH_QUESTIONS ? (
            <div className="rounded-ctl border border-border bg-bg p-3">
              <p className="text-sm font-semibold text-fg-muted">{t.activeSuite}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-bold text-fg">
                  {questions.currentSuite?.title ?? t.notSelected}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setLibraryOpen(true)}>
                  {t.change}
                </Button>
              </div>
            </div>
          ) : null}

          <TeamsSetup
            value={{ count: settings.teamsCount, names: settings.teamNames }}
            min={2}
            max={5}
            onChange={({ count, names }) =>
              setSettings({ ...settings, teamsCount: count, teamNames: names })
            }
          />

          <div>
            <button
              type="button"
              className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary"
              aria-expanded={showTimers}
              onClick={() => setShowTimers((value) => !value)}
            >
              {t.timers}
              <ChevronDown
                className={cn('size-4 transition-transform', showTimers && 'rotate-180')}
                aria-hidden
              />
            </button>
            {showTimers ? (
              <div className="grid gap-4 md:grid-cols-3">
                <StepperInput
                  label={t.flipTimer}
                  value={settings.flipTimer}
                  min={5}
                  max={60}
                  step={5}
                  onChange={(value) => setSettings({ ...settings, flipTimer: value })}
                />
                {settings.gameMode === GameMode.WITH_QUESTIONS ? (
                  <>
                    <StepperInput
                      label={t.levelTimer}
                      value={settings.levelSelectTimer}
                      min={3}
                      max={30}
                      step={1}
                      onChange={(value) =>
                        setSettings({ ...settings, levelSelectTimer: value })
                      }
                    />
                    <StepperInput
                      label={t.answerTimerLabel}
                      value={settings.answerTimer}
                      min={10}
                      max={120}
                      step={5}
                      onChange={(value) => setSettings({ ...settings, answerTimer: value })}
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
