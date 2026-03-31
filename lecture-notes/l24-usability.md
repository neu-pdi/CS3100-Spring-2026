---
sidebar_position: 24
lecture_number: 24
title: "L24: Usability"
---

# Usability

## Define usability and describe the five key aspects of usability (15 minutes)

There's a significant gap between software that *works* and software that people *want to use*. You can build a system that passes every test, implements every requirement, and never crashes—and still end up with software that users hate, avoid, or misuse. This gap is what usability addresses.

Consider our CookYourBooks application. From a purely functional perspective, we might say it "works" if:
- Users can import recipes from various formats
- Recipes can be organized into cookbooks
- Unit conversion and scaling work correctly

But working correctly is table stakes. The real questions are: Can a home cook figure out how to import their first recipe without reading a manual? Can they quickly find a recipe when guests are waiting? Will they remember how to adjust settings a month from now? Do they *enjoy* using the app, or do they dread it?

**Usability** is a measure of how well an artifact (software, device, interface) supports humans in achieving their goals. It's not a single property but rather a collection of related qualities that together determine whether software serves its users well.

### The Five Aspects of Usability

Usability researchers have identified five key aspects that together capture what makes software usable:

**1. Learnability**: How easy is it for users to accomplish tasks the first time they encounter the system?

A highly learnable interface allows new users to become productive quickly. For CookYourBooks, high learnability might mean a new user can figure out how to import a recipe within seconds of opening the app—without any tutorial or documentation.

Learnability often depends on how well the interface matches users' existing mental models. If CookYourBooks uses terminology and interactions that feel natural based on users' experience with physical cookbooks and other apps, it will be more learnable.

**2. Effectiveness**: Can users successfully complete their intended tasks?

An effective system allows users to achieve their goals. This sounds obvious, but it's surprisingly easy to build interfaces where users *think* they've completed a task but haven't, or where certain tasks are technically possible but practically impossible to discover.

For CookYourBooks, effectiveness means: Can a user actually scale a recipe to serve 8 people instead of 4? If users consistently fail at this task—even when they're trying—the system has an effectiveness problem.

**3. Productivity**: How efficiently can users accomplish tasks once they've learned the system?

Productivity measures the ongoing cost of using the system. Even if users *can* accomplish tasks, how much time and effort does it take? A productive interface minimizes unnecessary steps, provides shortcuts for common operations, and doesn't waste users' time.

Consider two CookYourBooks interfaces for finding a chocolate cake recipe:
- **Interface A**: Open app → Browse cookbooks → Select "Desserts" → Scroll through 200 recipes → Find chocolate cake (12+ interactions)
- **Interface B**: Open app → Type "chocolate cake" in search → Select from results (3 actions)

Both are *effective* (the task gets done), but Interface B is far more *productive*.

**4. Retainability**: How well do users maintain their proficiency over time?

Users don't interact with most software constantly. They learn it, then come back days, weeks, or months later. Retainable interfaces are ones where users can pick up where they left off without having to re-learn the system.

If a CookYourBooks user imports recipes in January, then tries to export one in March, will they remember how? Retainability is closely related to learnability—interfaces that match natural mental models tend to be both easier to learn initially and easier to remember later.

**5. Satisfiability**: How pleasant is the experience of using the system?

Satisfiability captures the subjective, emotional response to using software. Do users enjoy the experience? Do they feel confident and in control, or frustrated and confused? Would they recommend the app to a friend?

This might seem "soft" compared to the other aspects, but it matters enormously. Users who find software satisfying will use it more, explore its features, and forgive occasional problems. Users who find it frustrating will use it minimally, miss useful features, and switch to alternatives at the first opportunity.

### Trade-offs Between Aspects

These five aspects don't always align. Design decisions that improve one aspect may harm another:

| Decision | Helps | Hurts |
|----------|-------|-------|
| Add a detailed tutorial on first launch | Learnability | Satisfiability (for impatient users) |
| Provide keyboard shortcuts for power users | Productivity | Learnability (more to discover) |
| Use creative, app-specific icons | Satisfiability (distinctive brand) | Learnability (unfamiliar symbols) |
| Show all recipe options on one screen | Productivity (fewer navigations) | Learnability (overwhelming for beginners) |

Good usability design requires understanding which aspects matter most for your users and your context—which depends on understanding who your stakeholders are.

### Example: CLI vs. GUI for CookYourBooks

Imagine two interfaces for CookYourBooks:

**Command-Line Interface (CLI)**:
```
> import recipe --from image --file cookbook-page-42.jpg
Importing recipe from image...
Recipe "Chocolate Cake" imported successfully.
```

**Graphical Interface (GUI)**: A desktop app with drag-and-drop import, visual recipe cards, and intuitive navigation.

How do these score across the five aspects?

| Aspect | CLI | GUI |
|--------|-----|-----|
| Learnability | Low (must learn commands) | High (visual, explorable) |
| Effectiveness | High (if you know commands) | High (guided interactions) |
| Productivity | Very high (for experts) | Medium (more clicks, but discoverable) |
| Retainability | Low (easy to forget syntax) | High (visual cues aid memory) |
| Satisfiability | Varies (some love CLIs) | Generally higher for most users |

Neither is universally "better"—it depends on who's using it and for what. A power user who manages thousands of recipes might prefer the CLI for its productivity. A casual home cook would likely prefer the GUI for its learnability and retainability.

This analysis also suggests a possible design direction: provide both, with the GUI as the default and CLI available for power users. This is an example of *flexibility*, which we'll see again when we discuss Nielsen's heuristics.

### Mental Models: Why Usability Depends on User Expectations

We've mentioned "mental models" several times. A **mental model** is a user's internal representation of how something works—their understanding of the system's structure and behavior. Usability problems often arise when the system's actual behavior diverges from the user's mental model.

**CookYourBooks mental model example**: Suppose a user creates two versions of the same recipe: "Mom's Chocolate Cake (Original)" and "Mom's Chocolate Cake (Scaled for Party)". They edit an ingredient in the original. 

Different users might have different mental models:
- "These are independent copies, so the scaled version stays unchanged"
- "These are linked versions, so the scaled version updates too"
- "Editing creates a new version and keeps both old versions intact"

Whatever behavior CookYourBooks actually implements, it will violate *someone's* mental model. Good usability design means either (a) choosing behavior that matches the most common mental model, (b) making the actual behavior clearly visible in the interface, or (c) both.

## Identify stakeholders and their usability concerns (10 minutes)

We've been talking about "users" as if they're a single, homogeneous group. But real software serves multiple stakeholders with different goals, contexts, and usability needs. Failing to identify all relevant stakeholders—especially indirect ones—is a common source of usability failures.

### Who Are the Stakeholders?

A **stakeholder** is anyone who is affected by the system or has an interest in its success. For usability purposes, we care about anyone who *interacts* with the system or is *impacted* by others' interactions with it.

**Direct stakeholders** interact with the software themselves:
- **Primary users**: People who use the system regularly to accomplish their main goals
- **Secondary users**: People who use the system occasionally or for specific tasks
- **Operators/administrators**: People who configure, maintain, or support the system

**Indirect stakeholders** don't use the software but are affected by it:
- People in the environment where the software is used
- People whose data is managed by the system
- People who depend on the system's outputs

### CookYourBooks Stakeholders

| Stakeholder | Type | Primary Goals | Key Usability Concerns |
|-------------|------|---------------|------------------------|
| Home cook (daily) | Primary user | Find and use recipes | Productivity, satisfiability |
| Home cook (setup) | Secondary user | Import recipes, organize cookbooks | Effectiveness, learnability |
| Recipe contributor | Secondary user | Add and edit recipes | Effectiveness, productivity |
| Family members | Indirect | Eat the food! | Quality of exported recipes |
| Cookbook author | Indirect | Their recipes are used correctly | Recipe integrity, attribution |

### Different Stakeholders, Different Priorities

Each stakeholder group may prioritize the five usability aspects differently:

**New user** (extreme learnability): A new user has never used CookYourBooks before. They just want to import a recipe. If the interface requires any learning at all, they might give up. For this stakeholder, *learnability* dominates everything else.

**Power user** (productivity over learnability): Someone who manages hundreds of recipes will invest time learning the system because that investment pays off repeatedly. They want keyboard shortcuts, batch operations, and power-user features. *Productivity* matters far more than learnability.

**Occasional user** (balanced, but retainability matters): Someone who uses the app once a week needs to remember how things work between sessions. They want a satisfying experience because they chose this product. *Retainability* and *satisfiability* matter more than for other stakeholders.

## Recognize the relationship between usability and safety (5 minutes)

**Safety** is a property of a system that ensures it does not cause unacceptable harm to people, property, or the environment. Note that safety is defined in terms of *harm*, not *correctness*. A system can be correct (doing exactly what it was specified to do) and still be unsafe.

For CookYourBooks, safety concerns might seem minimal—it's a cookbook app, not a medical device. But consider:
- Allergy information: If a user can't easily see that a recipe contains peanuts, and they serve it to someone with a severe peanut allergy, that's a safety issue.
- Unit conversion errors: If a recipe calls for "1 tablespoon of salt" but a bug displays "1 cup of salt," the resulting dish could be inedible or even harmful.
- Cooking temperatures: If imported recipes don't preserve temperature information correctly, undercooked food could cause illness.

Poor usability increases the probability that humans will make errors. Users might:
- **Slip**: Intend to do the right thing but accidentally do something else (click "Delete" instead of "Edit" because the buttons are adjacent)
- **Lapse**: Forget to complete an action due to interruption (start importing a recipe, get distracted, leave it incomplete)
- **Mistake**: Intentionally take an action that's wrong for their goal due to a mismatched mental model

:::note Looking Ahead
We'll return to safety in more depth in [Lecture 35 (Safety and Reliability)](/lecture-notes/l35-safety-reliability), when we examine larger-scale systems where the safety implications of software design decisions become even more apparent. You'll see how the same human error categories (slips, lapses, mistakes) inform architectural tactics for building safety-critical systems.
:::

## Introduce approaches to evaluating usability (5 minutes)

So we want usable software. How do we know if we have it?

There's a fundamental tension in evaluating usability: we want to find problems *early* (when they're cheap to fix), but the best evidence about usability comes from *real users* interacting with *real software* (which comes late). Different evaluation approaches navigate this trade-off differently:

**User studies and usability testing**: Observe actual users attempting real tasks with your software. This provides the highest-fidelity feedback—you see exactly where users struggle, what confuses them, and how they actually behave (as opposed to how they *say* they behave). The downsides: you need working software, recruiting users takes time and money, and you can only test with a limited number of people.

**Surveys and feedback mechanisms**: Ask users about their experience through questionnaires, interviews, or in-app feedback tools. This scales better than observation and can capture subjective satisfaction. The downside: users often can't articulate *why* something is hard to use, and self-reported behavior doesn't always match actual behavior.

**Heuristic evaluation**: Have experts (or even non-expert reviewers following a checklist) examine the interface against established usability principles. This can be done early—even on paper prototypes or wireframes—without recruiting users. The downside: experts may miss problems that real users would encounter, or flag issues that don't actually matter in practice.

In the next lecture, we'll explore **user-centered design**—a process that integrates user feedback throughout development using techniques like prototyping and iterative testing.

For the remainder of *this* lecture, we'll focus on **heuristic evaluation**: a technique you can apply right now, on any interface, without needing to recruit users.

## Apply Nielsen's 10 Usability Heuristics to evaluate an interface (15 minutes)

Jakob Nielsen's 10 usability heuristics are a widely-used checklist for evaluating interfaces. They were developed in the 1990s but remain remarkably relevant. When conducting a heuristic evaluation, you systematically examine an interface against each principle, noting violations and their severity.

### H1: Visibility of System Status

The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.

*CookYourBooks example*: When a user initiates OCR import from an image, does the app immediately show progress? If the user clicks "Import" and nothing visibly changes for several seconds, they don't know if the command was received, is in progress, or failed.

### H2: Match Between System and the Real World

The system should speak the users' language, with words, phrases, and concepts familiar to the user, rather than system-oriented terms.

*CookYourBooks example*: Does the app use "ConversionRegistry" (developer concept) or "Unit Preferences" (user concept)? Are ingredients described by their technical types ("MeasuredIngredient") or by their natural names ("2 cups flour")?

### H3: User Control and Freedom

Users often choose system functions by mistake and need a clearly marked "emergency exit" to leave the unwanted state without having to go through an extended dialogue.

*CookYourBooks example*: If a user accidentally deletes a recipe, is there an obvious way to undo? A prominent "Undo" button or a trash/archive system provides that emergency exit.

### H4: Consistency and Standards

Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.

*CookYourBooks example*: If clicking on a recipe in one view opens it for editing, clicking on a recipe in every view should do the same thing—not sometimes edit and sometimes delete.

### H5: Error Prevention

Even better than good error messages is a careful design which prevents a problem from occurring in the first place.

*CookYourBooks example*: When entering a quantity, can the user type "half a cup"? A design that accepts natural language and converts it prevents formatting errors.

### H6: Recognition Rather Than Recall

Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another.

*CookYourBooks example*: When scaling a recipe, does the user have to remember the original servings, or does the app show "Scale from 4 servings to ___"?

### H7: Flexibility and Efficiency of Use

Accelerators—unseen by the novice user—may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users.

*CookYourBooks example*: A novice might navigate through menus to find import. An expert might use Ctrl+I or drag-and-drop. The interface should support both.

### H8: Aesthetic and Minimalist Design

Dialogues should not contain information which is irrelevant or rarely needed. Every extra unit of information in a dialogue competes with the relevant units of information and diminishes their relative visibility.

*CookYourBooks example*: The recipe view should emphasize ingredients and instructions—not clutter it with metadata like "Created date" or "Internal recipe ID."

### H9: Help Users Recognize, Diagnose, and Recover from Errors

Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.

*CookYourBooks example*: **Bad**: "Error: ParseException in RecipeParser line 42." **Good**: "Couldn't understand the ingredient '1/2 c butter'—did you mean '1/2 cup butter'?"

### H10: Help and Documentation

Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation. Any such information should be easy to search, focused on the user's task, list concrete steps, and not be too large.

*CookYourBooks example*: When a user is learning to import via OCR, contextual help ("What image formats work best?") is more useful than a 50-page PDF manual.

---

These heuristics overlap and reinforce each other. An interface that violates H1 (visibility) often also violates H9 (error recovery)—if users can't see what's happening, they can't tell when something goes wrong. Use the heuristics as a systematic checklist, but don't treat them as completely independent concerns.

