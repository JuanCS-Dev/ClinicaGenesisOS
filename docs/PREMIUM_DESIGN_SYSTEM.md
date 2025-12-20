# 💎 CLINICA GENESIS - SYSTEM ONE DESIGN LANGUAGE (2025)

> **"The interface should disappear. The doctor should feel like they are touching the data directly."**
> Based on analysis of: Linear, Apple Health, Carbon Health, and Epic Hyperdrive (2025 updates).

---

## 1. Core Philosophy: "Clinical Density vs. Cognitive Clarity"

Medical software suffers from two extremes:
1.  **Excel Sheets on Steroids (Epic/Cerner):** 100% Density, 0% Clarity. Causes burnout.
2.  **Dribbble Toys:** 100% Clarity, 5% Density. Usable only for fake patients.

**The "Genesis Way" (Linear-Inspired):**
*   **Progressive Disclosure:** Show only what is needed for the *current clinical context*.
*   **High Information Density (Hidden):** Data is there, but grouped in logical clusters (Collapsible/Accordion).
*   **Keyboard First:** Doctors hate mice. `Cmd+K` for everything. `Cmd+S` to save.

---

## 2. Typography System (The Voice of Authority)

*   **Primary Font:** `Inter` (Variable). Optimized for screen legibility at small sizes.
*   **Data/Code Font:** `JetBrains Mono` or `Geist Mono`. For lab results, dosages, and AI confidence scores.
*   **Display Font:** `SF Pro Display` (Apple ecosystem feel).

**Hierarchy Rules:**
*   **H1 (Page Title):** 24px, Bold, Tracking -0.02em.
*   **H2 (Section):** 18px, Semibold, Tracking -0.01em.
*   **Body:** 14px, Regular, Height 1.5.
*   **Micro-Label:** 11px, Medium, Uppercase, Tracking +0.05em (The "Linear" Look).

---

## 3. Color Palette: "Sterile Premium"

Avoid "Hospital Blue". Embrace "Tech Precision".

### Light Mode (Clinical Day)
*   **Surface:** `#FFFFFF` (Pure White)
*   **Background:** `#F5F5F7` (Apple Gray)
*   **Border:** `#E5E5E5`
*   **Text Primary:** `#111827` (Not Black)
*   **Text Secondary:** `#6B7280`
*   **Accent (Genesis):** `#007AFF` (International Blue) -> Used sparingly for Primary Actions.

### Dark Mode (Radiology/Night Shift)
*   **Surface:** `#1C1C1E` (Not #000000)
*   **Background:** `#000000`
*   **Border:** `#2C2C2E`
*   **Text Primary:** `#F2F2F7`
*   **Text Secondary:** `#8E8E93`
*   **Accent:** `#0A84FF` (Dark Mode Blue)

### Semantic Status (Traffic Lights)
*   **Critical/High Risk:** `#FF3B30` (Apple Red)
*   **Warning/Medium:** `#FF9500` (Apple Orange)
*   **Normal/Low:** `#34C759` (Apple Green)
*   **AI Suggestion:** `#AF52DE` (Purple - Distinct from human data)

---

## 4. Visual Components (The Building Blocks)

### A. The "Glass Card"
Used for grouping related data (ex: Vitals, Allergies).
*   **Border:** 1px solid `rgba(0,0,0, 0.05)` (Light) / `rgba(255,255,255, 0.1)` (Dark)
*   **Shadow:** `0px 1px 2px rgba(0,0,0, 0.05)` (Ultra subtle)
*   **Radius:** `12px` (Smooth)

### B. The "Ghost Input"
Inputs shouldn't look like boxes until focused.
*   **Idle:** Transparent background, gray text.
*   **Hover:** Light gray background.
*   **Focus:** White background, subtle shadow, blue caret.

### C. The "AI Presence"
How do we show AI without it being annoying?
*   **Sparkle Icon:** `✨` next to fields auto-filled by AI.
*   **Confidence Bar:** A micro line below the text (Green/Yellow/Red) indicating certainty.
*   **Ghost Text:** Suggestions appear in gray, `Tab` to accept.

---

## 5. Micro-Interactions (The "Feel")

*   **Optimistic UI:** Clicking "Save" instantly updates the UI. If the server fails 2s later, show a toaster. Never make the doctor wait.
*   **Skeleton Screens:** Never show a spinning wheel for the whole page. Show the layout bones.
*   **Enter/Exit:** `animate-in fade-in zoom-in-95 duration-200`. Subtle pop-in for modals and panels.

---

## 6. Layout Grid: The "Z-Pattern"

Doctors scan information in a specific way:
1.  **Top Left:** Patient Demographics (Who am I treating?)
2.  **Top Right:** Critical Alerts (Allergies, Vitals)
3.  **Center:** Current Note/Complaint (The "Why")
4.  **Bottom:** Action Plan (Prescription, Orders)

**Genesis Dashboard Layout:**
*   **Sidebar (Collapsed by default):** Navigation (64px -> 240px).
*   **Patient Ribbon (Sticky Top):** Name, Age, Allergies. Always visible.
*   **Workspace (Center):** The "Infinite Canvas" for the SOAP note.
*   **Assistant Panel (Right - Collapsible):** AI suggestions, reference materials, history.

---

## 7. Implementation Checklist (Refactor)

- [ ] **Normalize Colors:** Update `tailwind.config.js` with semantic names (`surface-primary`, `text-subtle`).
- [ ] **Component Library:** Create `Button`, `Card`, `Input` following System One rules.
- [ ] **Layout Shell:** Rewrite `AppLayout` to support the sticky Patient Ribbon.
- [ ] **Dark Mode:** Verify all colors have dark variants.

**Approved by:** Juan Carlos (Chief Architect)
**Status:** Ready for Implementation
