---
title: "Group Assignment 2: Feature Buffet"
sidebar_position: 11
image: /img/assignments/web/ga2.png
---


## Overview

In this final implementation assignment, your team selects and implements 2-3 features from a provided menu. Unlike GA1, this assignment is graded primarily on **process rather than product**—demonstrating thoughtful design iteration, quality code review, and professional documentation matters more than feature completeness.

![8-bit lo-fi pixel art illustration for a programming assignment cover. Kitchen/bakery setting with warm wooden cabinets and countertops in browns and tans. Scene composition: A grand kitchen buffet table stretching across the scene from left to right, laden with serving stations — each station represents a selectable software feature displayed as an appetizing pixel art dish on a labeled platter. STANDARD TIER (silver platters on the left half): "Recipe Scaling" shows a recipe card with a size slider growing from small to large, "Shopping List" displays a notepad with aggregated ingredient checkboxes, "Export to PDF" features a printer outputting a formatted page, "Unit Conversion" shows a balance scale with metric weights on one side and imperial on the other, "Keyboard Shortcuts" displays a glowing keyboard with highlighted keys, "Dark Mode" shows a monitor split half-light half-dark, "Cooking Timer" has a pixel stopwatch with steam rising. ADVANCED TIER (golden platters on the right half, slightly elevated): "Multi-Page Import" shows a stack of cookbook pages feeding into a scanner, "Recipe Chatbot" features a chat window with a friendly chatbot giving recipe suggestions, "Meal Planning" displays a weekly calendar grid with recipe thumbnails in each day slot, "Nutritional Info" shows a pie chart with macronutrient segments. FOREGROUND - Floating process portfolio documents are visible above the platters: wireframe sketches showing Version 1 and Version 2 iterations, a git log with commit messages, PR review comment bubbles with checkmarks, and a testing checklist. A sign at the buffet entrance reads "Choose wisely — process over product!" POST-IT NOTE: "Document your journey, not just the destination." TOP BANNER: Metallic blue banner with white pixel text "GA2: Feature Buffet". BOTTOM TEXT: "CS 3100: Program Design & Implementation 2". Color palette: Warm browns/tans for kitchen, silver and gold for platters, cyan/teal for selection highlights and process document accents, cream for recipe cards. 8-bit lo-fi pixel art style, clean outlines, retro game aesthetic with subtle CRT screen texture, 16:9 aspect ratio.](/img/assignments/web/ga2.png)

This approach reflects real-world software development: a well-documented, well-tested partial feature is more valuable than a hastily-implemented complete feature with no documentation or tests.

**Due:** Thursday, April 16, 2026 at 11:59 PM Boston Time

**Prerequisites:** GA1 (Core Features) must be complete. Your core features should be integrated and working. You will build on this foundation for your GA2 features.

## Learning Outcomes

By completing this assignment, you will demonstrate proficiency in:

- **Iterative design** through documented design evolution ([L27: User-Centered Design](/lecture-notes/l27-ucd))
- **Professional documentation** of design decisions and implementation choices
- **Quality code review** that improves code and spreads knowledge ([L22: Teams and Collaboration](/lecture-notes/l22-teams))
- **Process reflection** that identifies lessons learned and areas for improvement

## AI Policy for This Assignment

AI tools are **encouraged**, but remember: we're grading process, not just product. AI can help you implement features quickly, but it cannot:
- Make design decisions for your specific users
- Document why you made the choices you made
- Provide meaningful code review
- Reflect on what you learned

Use AI as a tool, but ensure the *thinking* is yours.

## TA Mentor Meetings

Throughout GA2, your team will have **weekly 30-minute meetings** with your assigned TA mentor. **These meetings are an accountability mechanism, not just a scheduling requirement.** If you cannot attend, notify your TA *before* the meeting and provide a written update on your work status—this demonstrates accountability. Missing a meeting without prior notice signals a lack of accountability and will likely result in a penalty for that week's individual accountability component. These meetings serve multiple purposes:

- **Code walks:** Each team member explains what they worked on and their design choices
- **Progress check-ins:** Are you on track? Stuck anywhere?
- **Collaboration verification:** Is the team working well together?
- **Debugging support:** Your TA can help unblock technical issues

**Meeting schedule for GA2:**

| Meeting | Target Dates | Focus |
|---------|-------------|-------|
| 4 | Apr 13–14 | Feature buffet progress, integration deep dive, architecture decisions — graded code walk |

Each student earns up to **10 points** based on code comprehension, process/workflow adherence, collaboration evidence, and forward planning.

These meetings are also an opportunity to demonstrate your understanding of your code. If you used AI tools to help with implementation, you should still be able to explain how the code works and why you made certain design decisions.

## The Feature Buffet

Choose **2-3 features** from the buffet below.

### Standard Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Recipe Scaling** | Adjust serving sizes with automatic ingredient recalculation | Medium |
| **Shopping List** | Generate aggregated shopping list from selected recipes | Medium |
| **Export to PDF** | Create nicely formatted PDF exports of recipes | Medium |
| **Unit Conversion** | Toggle between metric and imperial throughout the app | Medium |
| **Keyboard Shortcuts** | Comprehensive keyboard navigation and shortcuts | Medium |
| **Dark Mode** | Theme switcher with system preference detection | Low-Medium |
| **Cooking Timer** | Timers linked to recipe instruction steps | Medium-High |
| **Cooking Mode** | Step-by-step cooking interface: one instruction per screen with referenced ingredients, large easy-to-tap navigation buttons, and previous/next step controls | Medium |

### Advanced Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multi-Page Import** | Import multiple files at once, multi-page PDF support, detect recipe continuation across pages | Medium-High |
| **Recipe Chatbot** | "What should I make?" meal suggestion assistant using Gemini API | Medium-High |
| **Meal Planning** | Calendar-based meal planning with recipe scheduling | High |
| **Nutritional Info** | API integration for nutritional data | High |

## Process Portfolio

For **each feature from the buffet**, your team must submit a Process Portfolio demonstrating thoughtful development. This is the primary grading artifact.

### 1. Design Rationale (10% of feature grade)

Document (1/2 page):
- Why did you choose this feature?
- What user need does it address? (Reference a persona from GA0)
- What alternatives did you consider?

### 2. Design Artifacts (25% of feature grade)

Show your design evolution:
- **Version 1:** Initial wireframe/mockup
- **Version 2+:** At least one iteration with documented changes
- **Rationale:** Why did you change the design? What feedback prompted it?

Photos of whiteboard sketches are fine. The goal is showing *iteration*, not polish.

### 3. Implementation Journal (20% of feature grade)

Document your implementation process:
- **Git history:** Show incremental progress (not one giant commit at the end)
- **PR history:** Link to PRs with meaningful review comments
- **Decision log:** At least one documented technical decision with alternatives considered

### 4. Testing & Quality (20% of feature grade)

- Unit tests for the feature
- Brief accessibility check: Does it support keyboard navigation?
- Known limitations documented

### 5. Demo & Reflection (25% of feature grade)

- **Demo video:** 1-2 minute video showing the feature working
- **What worked well?** What aspects of your process were effective?
- **What would you do differently?** Specific, actionable lessons learned
- **Integration notes:** How does this feature connect to the rest of the app?

## Grading Philosophy

**A well-documented partial feature scores higher than a complete feature with no process evidence.**

| Scenario | Score (out of 40) | Letter Grade Equivalent |
|----------|-------------------|------------------------|
| Feature complete, excellent process documentation, meaningful iteration | 36–40 | A |
| Feature partially complete, excellent process documentation | 32–36 | B+ |
| Feature complete, minimal process documentation | 28–32 | B- |
| Feature generally broken, but excellent documentation of what was attempted | 28–32 | B- |
| Feature partially complete, minimal process documentation | 24–28 | C+ |
| Feature complete, no documentation | 20–24 | C- |

## Grading Rubric

**Total: 50 points** — 40 points team (Process Portfolios) + 10 points individual (contribution evidence).

### Team: Process Portfolio (40 points)

Each feature is scored out of 40 points. If your team implements 2–3 features, scores are **averaged** to produce the 40-point team component. Components scored zero (entirely missing) will produce grades below the philosophy ranges above.

| Component | Points | Excellent | Satisfactory | Needs Improvement |
|-----------|--------|-----------|--------------|-------------------|
| **Design Rationale** | 4 | Clear user need, thoughtful alternatives considered | User need stated | Generic or missing rationale |
| **Design Iteration** | 10 | 3+ versions with clearly documented evolution | 2 versions shown | Single design, no iteration |
| **Implementation Journal** | 8 | Regular commits, quality PRs, decisions documented | Some commits, basic PRs | Large commits, no discussion |
| **Testing & Quality** | 8 | Comprehensive tests; known limitations documented | Basic tests present | Minimal or no testing |
| **Demo & Reflection** | 10 | Insightful reflection with specific lessons; demo shows working feature *or* thoroughly documents what was attempted for incomplete/broken features | Generic reflection; demo present | Superficial reflection; no demo |
| **Total** | **40** | | | |

### Individual Contribution (10 points)

Scored per team member based on evidence of personal engagement:

| Component | Points | Excellent | Satisfactory | Needs Improvement |
|-----------|--------|-----------|--------------|-------------------|
| **Commit history & PR activity** | 5 | Regular, meaningful commits; substantive PR participation | Some commits and PRs | Minimal commits; one large dump at the end |
| **Code review quality** | 5 | Substantive, specific review comments | Reviews present but surface-level | "LGTM" only or no reviews |
| **Total** | **10** | | | |

### Individual Accountability Adjustment

TA meeting observations, collaboration surveys, and peer evaluation can adjust an individual's final grade by up to **-20 points** or award an **upward adjustment of up to +20 points**. If a team member cannot explain their code in TA meetings while the rest of the team succeeds, their grade may be reduced. The upward adjustment exists for a specific scenario: if your team's project isn't fully complete, but you went above and beyond to support struggling teammates — helping them get unblocked, taking on extra integration work, providing thorough code reviews — you can still earn full marks. This is **not an extra credit mechanism**; it is unlikely to bring a student above the assignment's total points. Simply doing your own work well is the expected baseline, not grounds for an upward adjustment. The weekly collaboration surveys (due Mar 23, Mar 30, Apr 6, Apr 13) and peer evaluation submitted after the assignment inform this adjustment.

## Submission

All deliverables should be merged to `main` following the [Git Workflow for Team Projects](/assignments/git-workflow). Your `main` branch is automatically submitted to Pawtograder.

### Repository Contents

```text
/menu-features/
  /feature-name-1/
    RATIONALE.md
    design/
      v1-wireframe.png
      v2-wireframe.png
      design-evolution.md
    IMPLEMENTATION_JOURNAL.md
    DEMO.md (with link to video)
  /feature-name-2/
    ...
```

### Checklist

- [ ] 2-3 features selected from the buffet
- [ ] Process portfolio complete for each feature
- [ ] Demo videos recorded and linked
- [ ] Peer evaluation survey completed (separate submission via Pawtograder)

## Reflection Questions for Team Discussion

Before submitting, discuss as a team:

1. Which feature had the smoothest development process? Why?
2. Where did your GA0 design artifacts help most? Where did they fall short?
3. What would you do differently if starting the group project over?
4. What's one thing each team member learned from another team member?

These don't need to be submitted, but inform your individual reflections in the weekly team collaboration surveys and the final individual reflection.