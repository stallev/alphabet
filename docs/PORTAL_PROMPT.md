
# Master Prompt: Christian Web Game Portal "EdenGames" (React + shadcn/ui)

## Role & Context
Act as a Senior Fullstack Developer and UI/UX Designer with expertise in React 19, TypeScript, Tailwind CSS, and shadcn/ui. You are building a professional Christian Game Portal for youth ministries. The platform should be modern, fast, and extensible.

## Core Objective
Create a web application that serves as a catalog for browser-based Christian games. The first and primary game to implement is **"Alphabet"** — a complex Memory + Bible Quiz game.

## Tech Stack Requirements
- **Framework**: React 19 (Vite or Next.js App Router).
- **Styling**: Tailwind CSS + shadcn/ui components (Button, Card, Dialog, Tabs, Table, Badge, Input, Toast).
- **State Management**: Zustand (with persist middleware).
- **Animations**: Framer Motion.
- **Icons**: Lucide-react.
- **AI Integration**: @google/genai (Gemini 3 Flash) for dynamic question generation.

---

## Part 1: Portal Architecture
1. **Home Page (Catalog)**:
   - A welcoming hero section with a "Biblical" but modern aesthetic (clean typography, soft blue/amber palette).
   - A grid-based catalog of games.
   - Game Card: Image, Title, Description, "Play Now" button.
   - Only the "Alphabet" game is currently active; others should show a "Coming Soon" badge.
2. **Navigation**: 
   - Sticky header with Portal Logo, "Games", "About", and "Admin" (protected by a simple key).
3. **Global State**:
   - Store user preferences and shared library of question suites.

---

## Part 2: Detailed Specification for "Alphabet" Game
The game must exactly replicate the functionality of the existing "Alphabet" project:

### 1. Game Mechanics (Memory + Quiz)
- **Grid**: 66 cards (33 pairs of Russian alphabet letters).
- **Turn Flow**:
  1. Team flips 2 cards.
  2. If Match: Team gets +5 points AND a Bonus Question prompt.
  3. Bonus Question: Choose complexity (Easy +3, Medium +6, Hard +9).
  4. Correct Answer: Points added, team continues turn.
  5. Wrong Answer: No points, turn passes.
  6. No Match: Cards flip back after 1s, turn passes.

### 2. Multi-Team Engine
- Support for 2-5 teams with customizable names.
- Active team highlighting and live score tracking.
- Turn-based timer (configurable).

### 3. AI Question Generator (Crucial)
- Integrate Gemini API using `@google/genai`.
- **Logic**: Generate exactly 200 questions in JSON format based on a specific Bible topic and audience level (1-7).
- **Constraint**: Strict Protestant theology (exclude icons, saints, traditions). Use Synodal translation for RU, ESV/NIV for EN.
- **Safety**: Math Captcha before generation to prevent bot abuse.

### 4. Advanced Management
- **Question Editor**: Full CRUD for the current suite.
- **Library**: LocalStorage-based persistence with 72-hour TTL for user-generated suites.
- **Import/Export**: Support for .json files.
- **Admin Core**: Protected panel to switch between Google Native and OpenRouter.

---

## Part 3: UI/UX Guidelines (shadcn style)
- **Theme**: Light theme by default. `slate-900` for text, `blue-600` for primary actions, `amber-500` for warnings/stars.
- **Cards**: Use `aspect-[4/5]` for game cards with a 3D flip animation.
- **Modals**: Use shadcn `Dialog` with `backdrop-blur-md`.
- **Accessibility**: ARIA labels, keyboard navigation for the quiz.

---

## Part 4: Project Structure
Organize the code into:
- `/components/portal/*` (Layout, Catalog)
- `/components/games/alphabet/*` (Game specific components)
- `/store/*` (Zustand stores)
- `/hooks/*` (useTimer, useGeminiAI)
- `/lib/*` (utils, constants, alphabet-data)

## Part 5: Initialization Data
Include a starting "System Suite" for the Alphabet game covering "Acts of the Apostles" or "Parables of Jesus" as a pre-bundled JSON to ensure the game is playable offline.

---

**Generate the full code for this application now, ensuring all files are connected and the "Alphabet" game is 100% functional with the AI generator enabled.**
