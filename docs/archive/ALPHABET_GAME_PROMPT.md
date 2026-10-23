
# Comprehensive Technical Specification: Alphabet Bible Quiz Engine

## 1. System Architecture (Zustand Store)
Create a `useGameStore` using Zustand with `persist` middleware. It must manage the following core state objects:

### A. Game State & Settings
- `settings`: { teamsCount (2-5), teamNames (string[]), gameMode (WITH_QUESTIONS | WITHOUT_QUESTIONS), timers (flip, levelSelect, answer) }.
- `gameStatus`: { phase (settings | playing | victory), isPaused (boolean), currentTeamIndex (number), teamScores (number[]) }.
- `cards`: Array of 66 objects: `{ id, letter, isFlipped, isMatched }`. Use 33 pairs of the Russian Alphabet.

### B. Questions Management
- `questions`: { currentSuite (QuestionsSuite), answeredQuestionIds (number[]) }.
- `temp`: Transient state for UI: `firstSelectedCardId`, `secondSelectedCardId`, `currentQuestion`, `isProcessing` (block clicks), `showLevelSelect`, `showQuestionModal`.

### C. Logic Hooks (Actions)
- `flipCard(id)`: 
    1. Check `isProcessing`. 
    2. Flip 1st card -> store ID. 
    3. Flip 2nd card -> compare letters. 
    4. **Match**: +5 pts, if `gameMode` is `WITH_QUESTIONS` -> trigger `showLevelSelect`, else keep turn. 
    5. **No Match**: wait 1s, flip back, `nextTurn()`.
- `answerQuestion(isCorrect, level)`: 
    - Correct: Add bonus (+3/6/9), keep turn. 
    - Wrong: Pass turn.
- `finishGame()`: Set `phase: victory`, reset all tool flags (editor, library).

---

## 2. Component Blueprint (shadcn/ui + Tailwind)

### A. The Game Board (`Board.tsx`)
- **Grid**: Responsive grid (`grid-cols-6` to `grid-cols-11`).
- **Card**: Use `framer-motion` for a 3D flip. 
    - Front: White, border-slate-300, showing `ID`.
    - Back: Amber-400 (if active) or Emerald-500 (if matched), showing `Letter` (Inter Black font).
- **Progress Bar**: Sticky progress bar showing percentage of matched cards (Emerald shadow).

### B. Interactive Modals (shadcn `Dialog`)
- **`LevelSelectModal`**: Big buttons for Easy (+3), Medium (+6), Hard (+9). Includes a countdown timer. Default choice is "Easy" if time expires.
- **`QuestionModal`**: 
    - Header: complexity level and point value.
    - Body: support for 2 types:
        1. `ID`: Multiple choice (4 large buttons).
        2. `String`: Text input field (auto-focus) + Submit button.
    - Results: Full-screen overlay "ПРАВИЛЬНО" (Emerald) or "НЕВЕРНО" (Red) for 2 seconds.

### C. ScoreBoard (`ScoreBoard.tsx`)
- Sticky header.
- Team cards: Active team has a Blue-600 background, ring-4, and "floating" animation.
- Controls: "Pause" (blurs board), "Finish Early" (with confirmation).

---

## 3. AI Content Engine (`AIGenerator.tsx`)

### A. Integration
- Provider: Google Gemini (`gemini-3-flash-preview`) or OpenRouter (free models fallback: Qwen, Mistral).
- **Safety**: Math CAPTCHA before the "Generate" call.

### B. Prompt Engineering
"Act as a Protestant Bible Teacher. Generate exactly 200 questions in valid JSON.
Topic: {topic}. Audience Level: {1-7}.
Strict Constraints: 
- 85% multiple choice, 15% text input (max 9 chars).
- Easy/Medium/Hard distribution.
- Language: {lang}. 
- Theology: No icons, no saints, no church tradition. Use SVD (RU) or ESV/NIV (EN).
JSON Structure: 
{ 
  title: string, 
  questionsList: [{ 
    id, questionContent, complexityLevel, answerType: 'ID'|'String', 
    answersList: [{id, value}] | null, rightAnswerId, rightAnswerString 
  }] 
}"

### C. Post-Processing
- Cleanup AI output using Regex to extract JSON from Markdown.
- Auto-save generated suite to Library with a 72-hour TTL.

---

## 4. Advanced Tools & Persistence

### A. Suite Library (`LibraryPage.tsx`)
- Tabbed view: "System" (Read-only, bundled) vs "User" (LocalStorage).
- Actions: Activate, Edit (CRUD), Export to JSON, Delete.
- TTL Logic: Auto-delete user suites where `Date.now() > expiresAt`.

### B. Admin Core (`AdminSettings.tsx`)
- Protected by key `19082006!`.
- Toggle between Google SDK and OpenRouter API.
- Select specific models for generation.

### C. Navigation
- **Home Button**: Global fixed button (z-200), visible during game or in tools. Resets game with confirmation.

---

## 5. Visual Style (Aesthetics)
- **Colors**: Blue-900 (Text), Slate-50 (Bg), Emerald-500 (Success), Amber-400 (Accent).
- **Typography**: Inter (UI), Inter Black (Cards/Headings).
- **Animations**: Subtle spring physics for cards, stagger-fade for lists, backdrop-blur-md for all overlays.
- **Projector mode**: High contrast, font size >= 18px, large clickable areas.
