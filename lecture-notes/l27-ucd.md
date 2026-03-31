---
sidebar_position: 27
lecture_number: 27
title: "L27: User-Centered Design"
---

# User-Centered Design

## Describe the value of user-centered design in software development (10 minutes)

In [Lecture 24 (Usability)](l24-usability.md), we introduced usability and heuristic evaluation—a technique for finding usability problems by examining an interface against established principles. Heuristic evaluation is valuable because you can do it early, without users. But it has a fundamental limitation: **experts evaluating against heuristics are not the same as real users trying to accomplish real goals**.

Heuristic evaluation catches obvious violations, but it misses problems that emerge from the gap between the designer's mental model and the user's mental model. An expert might look at CookYourBooks' recipe import flow and find no heuristic violations—while a real home cook struggles for ten minutes trying to figure out how to import from an image.

**User-Centered Design (UCD)** is a design philosophy and process that addresses this limitation by putting real users at the center of the design process. The core principle is simple: **design *with* users, not *for* users**.

### The Participatory Approach, Revisited

This idea should sound familiar. In [Lecture 9](l9-requirements.md), we contrasted the extractive approach to requirements ("What features do you need?") with the participatory approach ("Tell me about your cooking challenges. Can you show me?"). We argued that treating users as design partners rather than requirement sources leads to better solutions—ones that neither party would have imagined alone.

UCD extends this participatory philosophy beyond initial requirements gathering into the entire design and development process. Users aren't consulted once at the beginning and then again at the end for acceptance testing. Instead, they're involved continuously: reviewing designs, testing prototypes, and providing feedback at every stage.

### The Timing Problem

There's a fundamental tension in software development:

- **We want to find problems early**, when they're cheap to fix
- **The best evidence about usability comes from real users with real software**, which comes late

If we wait until we have working software to get user feedback, we've already invested significant effort. Discovering at that point that users can't figure out the basic workflow means expensive rework.

UCD's answer to this tension is **iterative development with increasing fidelity**. We get user feedback throughout development using prototypes of increasing realism:

| Stage | Prototype Fidelity | Investment to Create | Cost to Change |
|-------|-------------------|---------------------|----------------|
| Early | Paper sketches | Minutes | Zero |
| Middle | Interactive mockups | Hours | Low |
| Late | Working prototypes | Days | Medium |
| Final | Production software | Weeks/Months | High |

By testing with users at each stage, we catch problems when they're still cheap to fix. A paper prototype might reveal that our entire approach to recipe import is confusing—better to discover that before writing any code.

## Describe the UCD process: prototyping and evaluation for usability (20 minutes)

UCD follows an iterative cycle: **Understand → Design → Prototype → Evaluate → Repeat**. Each iteration increases our understanding of users' needs and moves us closer to a solution that truly serves them.

### The Iterative Cycle

**1. Understand**: Who are the users? What are their goals? What's their context? This builds on the stakeholder analysis from [Lecture 24](l24-usability.md)—we need to know who we're designing for before we can design effectively.

**2. Design**: Based on our understanding, create a design that addresses user needs. Early designs might be conceptual ("the user will import recipes by selecting a file"); later designs become specific interface layouts.

**3. Prototype**: Build a representation of the design that users can interact with. This doesn't need to be working software—even paper sketches can be "interactive" if a facilitator simulates system responses.

**4. Evaluate**: Put the prototype in front of real users and observe what happens. Where do they struggle? What surprises them? What do they try to do that the design doesn't support?

**5. Repeat**: Incorporate findings into the next iteration. Maybe we need to go back to understanding (we discovered a stakeholder we missed), or just refine the design based on specific feedback.

### Prototyping Approaches

Different prototype fidelities serve different purposes:

#### Paper Prototypes (Low Fidelity)

Hand-drawn sketches of screens, with a human "playing computer" to respond to user actions.

**How it works**: The facilitator shows a paper screen. When the user "taps" a button, the facilitator swaps in a new paper screen showing the result. The facilitator can simulate any system behavior—including behaviors that haven't been implemented or even fully designed.

**CookYourBooks paper prototype session**:

> *Facilitator shows sketch of main screen with cookbook list*
> 
> "You want to add a new recipe from a photo of your grandmother's cookbook. What would you do?"
> 
> *User*: "I'd tap... is this an import button? Or do I tap on a cookbook first?"
> 
> *Facilitator*: "What would you expect each to do?"
> 
> *User*: "If I tap the button, maybe it lets me import anywhere? If I tap a cookbook, maybe it imports into that one?"
> 
> *Facilitator shows import screen*: "You tapped the import button. Here's what you see."
> 
> *User*: "Oh, 'From Image' is here. I'll tap that."

**What we learn**: Users weren't sure whether to select a cookbook first or use the import button. Maybe we need clearer visual hierarchy or a workflow that asks "which cookbook?" as part of import.

**Advantages**: 
- Extremely fast to create (minutes)
- Easy to modify during the session ("What if it looked like this instead?")
- Users feel comfortable criticizing paper ("This is just a sketch")
- Forces focus on concepts, not visual polish

**Limitations**:
- Can't test detailed interactions (drag-and-drop feel, animation timing)
- Facilitator responses may not match what software would actually do
- Some users have trouble imagining the paper as real software

#### Wizard-of-Oz Prototypes (Medium Fidelity)

The interface looks realistic, but a human behind the scenes simulates system responses.

**How it works**: The user sees what appears to be a working app (could be a clickable mockup, a slide deck, or even a real UI). But instead of actual code processing their inputs, a hidden "wizard" observes and triggers appropriate responses.

**CookYourBooks Wizard-of-Oz example**:

The user sees a realistic-looking app interface. They click "Import from Image," select a photo of a handwritten recipe, and click "Process." Behind a partition, a facilitator watches via screen share and manually types a parsed recipe into the app to simulate OCR.

**What we learn**: With realistic-looking interfaces, users behave more naturally. We can test whether the actual terminology and visual design work. The realistic responses reveal whether users trust the feedback they're seeing.

#### Working Prototypes (High Fidelity)

Real code that implements the user interface, but with limited or simulated backend functionality.

**How it works**: The UI is fully implemented and responsive. But instead of connecting to real OCR APIs, it might use mock data, hardcoded responses, or simplified logic.

**CookYourBooks working prototype**:

A real desktop app that lets users import images and view recipes. The import "OCR" actually just returns a predefined recipe regardless of the image content. The recipe editor works fully.

**What we learn**: Working prototypes reveal issues that only emerge with real interaction—scroll performance, drag-and-drop feel, keyboard navigation. They also test whether the implementation matches the design intent.

#### Using AI as a Prototyping Accelerator

AI tools can significantly speed up prototype creation—but with important caveats aligned with our course principles about thoughtful AI usage.

What AI is good for:

- Generating UI code quickly: "Create an HTML/CSS mockup of a recipe import wizard with image upload and progress indicator"
- Creating realistic sample data: "Generate 20 realistic recipe titles and ingredient lists for a cookbook app"
- Producing design variations: "Show me three different layouts for a recipe card"
- Writing Wizard-of-Oz scripts: "Write a simple server that returns mock parsed recipe data"

What AI cannot do:

- Replace actual user testing: AI can generate prototypes, but it cannot tell you whether real users will understand them. The entire point of UCD is that *you can't predict user behavior from first principles*—you must observe it.
- Know your specific users: AI generates "average" designs based on training data. Your users (power home cooks? beginners? professional chefs?) have specific needs AI doesn't know.

### User Evaluation Methods

Once we have a prototype, how do we learn from users interacting with it?

#### Think-Aloud Protocol

Users verbalize their thoughts while using the prototype.

**How it works**: "As you use this, please tell me what you're thinking. What are you looking at? What are you trying to do? What do you expect to happen?"

**Example think-aloud transcript**:

> "OK, I want to import a recipe from this cookbook photo... I see this import button... I'll click it... 'From Image,' that makes sense... Now it's asking me to select a file... OK, uploaded... Now it's processing... this is taking a while, I hope it didn't freeze... Oh, there's the recipe! But wait, it says '2 cups flower'—that should be 'flour.' Can I fix that?"

**What we learn**: Think-aloud reveals the user's mental model in real-time. We hear their expectations, confusions ("I hope it didn't freeze"), and immediate feedback ("should be 'flour'").

#### Task Completion Testing

Give users specific tasks and observe whether they can complete them.

**Example tasks for CookYourBooks**:
1. Import a recipe from this cookbook photo
2. Scale the recipe to serve 8 people instead of 4
3. Export the recipe as a PDF to print
4. Find all recipes that contain chocolate

**Metrics**:
- **Success rate**: What percentage completed the task?
- **Time on task**: How long did it take?
- **Error rate**: How many wrong paths did they try?
- **Assistance needed**: Did they ask for help?

**What we learn**: Quantitative data on where users succeed and fail. If 80% can import a recipe but only 30% can scale one, we know where to focus improvement.

### Incorporating Findings

Evaluation produces findings. Turning findings into improvements requires:

**1. Prioritization**: Not every problem is equally important. Prioritize by:
- Severity (prevents task completion vs. minor annoyance)
- Frequency (affects most users vs. rare edge case)
- Cost to fix (quick change vs. architectural restructure)

**2. Root cause analysis**: Users said "the scale button is confusing." But why? Options:
- The button is too small (visual design fix)
- Users don't know what "scale" means (terminology fix)
- Users expect scaling to work differently (conceptual model fix)

**3. Validation**: After implementing changes, test again to confirm the fix works without introducing new problems.

## Apply UCD as a requirements elicitation technique (15 minutes)

Here's the insight that elevates UCD from "usability technique" to "essential development practice": **when you put real users in front of real (or simulated) interfaces, you discover all kinds of requirements—not just usability concerns**.

### What UCD Reveals

#### Functional Requirements

During a CookYourBooks prototype session:

> *User tries to import a recipe*
> 
> "Wait, this recipe has two variations—one with nuts and one without. Can I import both as one recipe with variations?"
> 
> *Facilitator*: "So you want recipes to have variations?"
> 
> *User*: "Yes! Or at least notes about substitutions."

This is a functional requirement (recipe variations or substitution notes) that emerged only because the user was actually trying to import a recipe.

#### Edge Cases and Error Handling

> *User imports a recipe from a blurry image*
> 
> *System shows recipe with garbled text*
> 
> "What happened here? It says '1/z cup' instead of '1/2 cup.' Can I fix this?"

This reveals requirements for OCR confidence indicators, easy editing of parsed content, and graceful handling of uncertain recognition.

#### Workflow Mismatches

> *User creates a recipe with 12 ingredients*
> 
> "This is taking forever. I have to enter each ingredient one at a time?"
> 
> *Facilitator*: "How would you prefer to do it?"
> 
> *User*: "Just let me paste the whole ingredient list and have it parse it."

This reveals that the design assumes ingredient-by-ingredient entry, but users think in terms of pasting whole lists.

### UCD Reduces All Three Risk Dimensions

In [Lecture 9](l9-requirements.md), we identified three dimensions of requirements risk:

**Understanding Risk**: UCD directly reduces understanding risk. Instead of interpreting requirements documents, you watch users interpret your interface. Having a representative set of users test your prototype is key to reducing this risk.

**Scope Risk**: Prototyping reveals hidden complexity. The "simple" recipe import feature turns out to need variation support, OCR error correction, bulk ingredient entry, and substitution notes. Better to discover this scope expansion during paper prototyping than during implementation.

**Volatility Risk**: Early user feedback lets you pivot before committing. If prototype testing reveals that users fundamentally misunderstand your import workflow, you can redesign the concept before building it.

When done well, UCD creates a continuous feedback loop between users, requirements, domain understanding, and implementation. The result isn't just more usable software—it's software that more accurately solves the real problem.

