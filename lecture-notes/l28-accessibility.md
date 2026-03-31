---
sidebar_position: 28
lecture_number: 28
title: "L28: Accessibility and Inclusivity"
---

# Accessibility and Inclusivity

## Describe common accessibility and inclusivity requirements and their importance (25 minutes)

In [L24 (Usability)](./l24-usability.md) and [L27 (User-Centered Design)](./l27-ucd.md), we explored usability—how well software supports humans in achieving their goals—and user-centered design—a process for ensuring we build software that truly serves users. We examined Nielsen's heuristics and learned techniques for prototyping and evaluating interfaces with real users.

But there's a critical question we haven't yet addressed: **which users?**

When we design software, we inevitably make assumptions about who will use it. We assume users can see the screen, use a mouse, read English, and process information in certain ways. These assumptions are so embedded in our mental models that we often don't notice them—until someone who doesn't fit those assumptions tries to use our software and can't.

This lecture extends our usability framework to explicitly consider **accessibility** (ensuring software works for users with disabilities) and **inclusivity** (ensuring software works for users across all dimensions of human diversity). These aren't separate concerns from usability—they're essential aspects of building software that actually works for the people who need to use it.

### The Spectrum from Accessibility to Inclusivity

**Accessibility** traditionally focuses on users with disabilities: visual impairments, hearing loss, motor difficulties, cognitive differences. Accessibility is a legal requirement in many jurisdictions (such as the United States).

**Inclusivity** broadens this lens to consider all dimensions of human diversity that might affect how people interact with software: age, gender, cultural background, language, education level, technical expertise, and situational factors like stress or distraction. Inclusivity is not a common legal requirement, but may be a social requirement. Moreover, it may be a business requirement for many companies that seek to market to the broadest market.

These concepts exist on a spectrum rather than as distinct categories. Consider a few scenarios:

| Scenario | Accessibility or Inclusivity? |
|----------|------------------------------|
| A blind user navigating CookYourBooks with a screen reader | Accessibility |
| An elderly user struggling with small touch targets | Both |
| A user in bright sunlight who can't see their phone screen | Situational accessibility |
| A user who prefers step-by-step instructions over exploratory learning | Inclusivity |
| A non-native English speaker confused by idiomatic button labels | Inclusivity |

The **curb cut effect** illustrates why this distinction matters less than we might think. Curb cuts—the small ramps at street corners—were originally mandated for wheelchair users. But they benefit everyone: people pushing strollers, pulling luggage, riding bikes, or simply walking without having to step up. Similarly, accessibility features in software often improve the experience for all users:

- Captions help deaf users *and* people watching videos in noisy environments
- Keyboard navigation helps users with motor impairments *and* power users who prefer not to use a mouse
- Clear, simple language helps users with cognitive disabilities *and* non-native speakers *and* users in a hurry
- High-contrast interfaces help users with low vision *and* anyone using their phone outdoors

When we design for the margins, we often improve the experience for everyone.

### Accessibility Requirements: The POUR Principles

The Web Content Accessibility Guidelines (WCAG), maintained by the World Wide Web Consortium (W3C), provide the most widely-adopted framework for accessibility. While originally focused on web content, WCAG's principles apply broadly to software interfaces.

WCAG organizes accessibility around four principles, remembered by the acronym **POUR**:

**Perceivable**: Information and interface components must be presentable to users in ways they can perceive.

Users interact with software through their senses—primarily vision and hearing. If information is only available through one sense, users who lack that sense are excluded.

*CookYourBooks example*: The app shows recipe difficulty using colored icons—green for "easy," red for "hard." A colorblind user cannot distinguish these. **Fix**: Add text labels ("Easy"/"Hard") or use shapes in addition to colors.

**Operable**: Interface components and navigation must be operable by users.

Users interact with software through input devices—mice, keyboards, touchscreens, voice commands, switches. If the interface only responds to one input method, users who can't use that method are excluded.

*CookYourBooks example*: Recipe scaling requires a precise slider drag gesture. A user with tremors cannot reliably perform this gesture. **Fix**: Provide alternative input methods (text field, +/- buttons).

**Understandable**: Information and operation of the interface must be understandable.

Even if users can perceive and physically interact with an interface, they must also be able to understand what they're perceiving and predict what their actions will do.

*CookYourBooks example*: The app uses technical terminology ("Parse OCR output to Recipe model") instead of user-friendly language ("Convert image to recipe"). **Fix**: Use plain language that matches users' mental models.

**Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

Software doesn't exist in isolation—it runs on various devices, operating systems, and browsers, and may be accessed through assistive technologies like screen readers. Robust software works correctly across this ecosystem.

*CookYourBooks example*: Custom UI components don't expose their role and state to the accessibility API, so screen readers can't announce them properly. **Fix**: Use semantic UI widgets or properly configure accessibility attributes.

### Supporting Assistive Technologies

Users with disabilities often rely on **assistive technologies** to interact with software:

**Screen readers** convert visual interfaces to audio. They read aloud the content of the screen, announce interactive elements, and allow navigation via keyboard commands. For screen readers to work, software must provide semantic information about its structure and state. 

**Keyboard navigation** allows users to operate software without a mouse. Users press Tab to move between interactive elements, Enter to activate buttons, arrow keys to navigate within components, and Escape to dismiss dialogs.

**Voice control** allows users to operate software through speech. Users can speak commands like "Click Import" or "Press Tab three times."

For CookYourBooks, supporting assistive technologies means:

1. **Using semantic structure**: Screen readers understand that Button widgets are clickable. Custom UI widgets with click handlers are invisible to assistive technology unless properly labeled with accessibility attributes.

2. **Providing text alternatives**: Images need `alt` text. Icons need accessible labels. Status conveyed through color needs text equivalents.

3. **Ensuring keyboard operability**: Every action possible with a mouse must also be possible with a keyboard. Focus must be visible and move in a logical order.

4. **Managing focus**: When a dialog opens, focus should move into it. When it closes, focus should return to the element that opened it.

5. **Announcing dynamic changes**: When content updates without a page reload (common in modern apps), screen readers need to be notified.

## Evaluate the validity of an accessibility evaluation (20 minutes)

Suppose a company claims their software is "fully accessible" or "WCAG compliant." How would you know if that claim is credible? Accessibility evaluations vary enormously in rigor and validity.

### Types of Accessibility Evaluation

**Automated Testing**: Software tools that scan code or interfaces for accessibility violations.

| Strengths | Limitations |
|-----------|-------------|
| Fast and cheap | Catches only ~30% of accessibility issues |
| Consistent and repeatable | Cannot assess user experience |
| Good for catching obvious errors | May produce false positives |

Automated testing is valuable for catching low-hanging fruit—missing alt text, insufficient color contrast, missing form labels. But passing automated tests does not mean software is accessible.

**Expert Heuristic Evaluation**: Trained evaluators review software against accessibility guidelines and use assistive technologies to test key workflows.

| Strengths | Limitations |
|-----------|-------------|
| Catches issues automated tools miss | Requires trained evaluators |
| Can assess user experience and workflows | Evaluators may not share users' disabilities |
| Provides actionable recommendations | Quality depends heavily on evaluator expertise |

**Evaluation with Disabled Users**: Real users with disabilities attempt to complete tasks with the software, while evaluators observe and gather feedback.

| Strengths | Limitations |
|-----------|-------------|
| Reveals actual user experience | Time-consuming and expensive |
| Catches issues experts miss | Requires recruiting participants |
| Provides ground truth about accessibility | Small samples may not represent all users |

### What Doesn't Count as Accessibility Evaluation

Some practices that might seem like accessibility evaluation provide little or no valid evidence:

**Compliance checklists without testing**: Marking checkboxes on a WCAG compliance form doesn't demonstrate that software is accessible—only that someone believes specific guidelines were followed.

**Simulation or empathy exercises**: Valuable for building awareness, but not evidence of accessibility. "We had everyone on the team try using the app blindfolded" tells you how sighted people experience artificial vision loss, not how blind users experience your software.

**Testimonials without methodology**: "A blind user said they could use it" is anecdotal, not evaluation. Without systematic task completion, multiple participants, and consideration of diverse experiences, individual testimonials don't generalize.

### For more information

Consider enrolling in CS 4973: "Accessibility and Disability"

