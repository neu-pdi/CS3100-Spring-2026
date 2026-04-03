---
sidebar_position: 1
path: /
image: /img/assignments/web/overview.png
---

# Cook Your Books: Project Overview


Throughout this semester, you will build CookYourBooks, a comprehensive desktop application for managing digital cookbooks and recipes. This real-world application addresses a common problem: how to efficiently digitize, organize, and use recipes from physical cookbooks and websites. The final product will feature recipe import from images via the Gemini API, a rich domain model for representing complex recipe structures, intelligent scaling and unit conversion, and both command-line and graphical user interfaces. By the end of the course, you'll have created a fully-functional application that could genuinely be used by home cooks and professional chefs alike—something substantial enough for your portfolio that demonstrates your ability to design and implement complex software systems. For inspiration on what a real-world application might look like, refer to existing products [EatYourBooks](https://eatyourbooks.com/), [ChefSteps' Recipe Interface](https://www.chefsteps.com/activities/skillet-apple-pie), and [CookShelf](https://www.cookshelf.app/). 

![Cook Your Books: Project Overview](/img/assignments/web/overview.png)

The project follows a carefully scaffolded approach where each weekly assignment builds upon the previous one, with our solution to each assignment provided as the foundation for the next. You'll begin in Module 1 (Design in the Small) by implementing the core domain model—learning to design rich object hierarchies for ingredients, quantities, and recipes while practicing fundamental OO principles like inheritance, polymorphism, and encapsulation. As you progress into Module 2 (Design in the Large), you'll add persistence through custom JSON serialization, build comprehensive test suites with mocking, create service layers that separate business logic from infrastructure concerns, and explore architecture patterns for distributed systems. Starting in Assignment 3 (Week 5-6), you'll incorporate AI coding assistants into your workflow, learning to leverage these tools effectively while maintaining code quality and understanding.

The final phase of the project (Module 3: Design for Users) emphasizes user-centered design, team collaboration, and building complete systems. You'll implement both CLI and GUI interfaces, focusing on usability, accessibility, and user experience while managing the complexity of asynchronous operations such as Gemini API–based recipe import. Working in teams of four (or three; see the 3-person-team exception below), each team member takes ownership of one core GUI feature while collaborating on shared infrastructure, integration, and optional "menu" features. Teams establish working agreements through a **team charter**, align on user-facing terminology for consistent naming, and practice the HRT (Humility, Respect, Trust) principles from professional software development. The group assignments are structured to enable individual accountability—each core feature has a defined ViewModel interface that all implementations must satisfy—while still requiring meaningful collaboration on design, code review, and integration. Throughout this journey, you'll not only master Java and JavaFX, but also develop crucial software engineering skills: interpreting requirements, designing for change, writing maintainable code, and collaborating effectively in a team.

Assignments are structured to provide a steady, manageable pace throughout the semester. Each assignment is due on a Thursday at 11:59 PM, with a minimum of 3-4 days between assignment due dates to ensure adequate time for implementation, testing, and reflection. Some weeks' tasks have been intentionally merged to combine related concepts and create more substantial programming tasks that better reflect real-world development work. 

**Notes:**
- Each assignment builds on the provided solution from the previous week. Students are trusted to not share these solutions, or to seek them out.
- AI coding assistants are introduced in Week 5 (Assignment 3) and encouraged thereafter. Students are strongly discouraged from using them in the first two assignments.
- Group work begins in Week 10 (teams of 4 formed by Week 8, or teams of 3). Each team member owns one core GUI feature while collaborating on shared infrastructure and the Feature Buffet. **3-person teams:** You may omit the Search & Filter core feature; each member then owns one of the remaining three (Library View, Recipe Editor, Import Interface). Ownership and grading apply only to the features you implement. Feature Buffet and process-grading expectations are unchanged for 3- and 4-person teams.
- The group project (GA1+GA2+Final) is released as **one specification** with accountability checkpoints. **Features must be delivered incrementally**—it is not possible to complete the project at the last minute. Core features are graded individually based on the defined ViewModel interfaces for the features your team implements (four, or three if you use the 3-person-team exception). Feature Buffet items are graded primarily on **process** (design iteration, code review quality, documentation) rather than product.
- Labs complement but don't depend on the main project assignments - they always build on a solution from a week earlier.


## **Module 1: Design in the Small**

### **Weeks 1-2: Java Fundamentals & Domain Modeling**
- [**Assignment 1: Recipe Domain Model**](/assignments/cyb1-recipes) (Due 2026-01-15)
  - Implement `Unit`, `UnitSystem`, `UnitDimension` enums with fields and methods
  - Implement `Quantity` hierarchy: `ExactQuantity`, `FractionalQuantity`, `RangeQuantity`
  - Implement `Ingredient` hierarchy: `MeasuredIngredient`, `VagueIngredient`
  - Practice inheritance, polymorphism, and composition
  - Write Javadoc specifications with preconditions and postconditions
  - Write comprehensive unit tests with JUnit 5
- [**Lab 1: Java Tooling and Setup**](/labs/lab1-java-setup)
  - Set up development environment, practice with Gradle, Git
- [**Lab 2: Polymorphism and Collections**](/labs/lab2-polymorphism-and-collections)
  - Practice with abstract classes vs interfaces

### **Weeks 3-4: Specifications, Contracts, and Information Hiding**
- [**Assignment 2: Unit Conversion, Recipe and Instruction Classes**](/assignments/cyb2-unit-conversion) (Due 2026-01-29)
  - Build on A1 solution (provided)
  - Implement `ConversionRule` record and `ConversionRegistry` interface with `LayeredConversionRegistry`
  - Implement priority-based unit conversion (house > recipe-specific > global)
  - Implement `Recipe` (with scaling and conversion), `Instruction`, and `RecipeBuilder`
  - Design recipe note representation (internal design decision left to students)
  - Implement `equals()` and `hashCode()` for value objects
  - Focus on immutable transformations, encapsulation, and information hiding
  - Practice making principled design decisions with documented tradeoffs
- [**Lab 3: Developer Toolkit**](/labs/lab3-dev-toolkit)
  - Evaluate and improve method specifications
- [**Lab 4: Changeability**](/labs/lab4-changeability)
  - Analyze coupling/cohesion in provided code samples

### **Week 5: Exam Week**
- No homework assignment
- [**Lab 5: Requirements Engineering**](/labs/lab5-requirements)
  - Experience how ambiguous requirements lead to divergent interpretations

### **Weeks 5-6: Domain Extensions, JSON Persistence & AI Workflow**
- [**Assignment 3: JSON Serialization Layer**](/assignments/cyb3-json-serialization) (Due 2026-02-13)
  - Build on A2 solution (provided)
  - **Domain Modeling:**
    - Implement `CookbookImpl`, `PersonalCollectionImpl`, `WebCollectionImpl` following provided reference implementation
    - Complete `UserLibraryImpl` search methods
    - Design relationships between recipes, collections, and the user library
  - **JSON Persistence (interfaces provided, you implement):**
    - Complete `JsonRecipeRepository` and `JsonRecipeCollectionRepository` adapters
    - Handle polymorphic serialization using pre-configured Jackson annotations
    - Ensure round-trip correctness for all domain types
  - **Export Adapter:**
    - Implement `MarkdownExporter` for recipe and collection export
  - **First assignment where AI assistants are allowed/encouraged**
    - Practice using AI for boilerplate generation and pattern replication
    - Reflect on AI strengths/weaknesses for different task types
- [**Lab 6: AI Coding Agents**](/labs/lab6-copilot)
  - Learn to effectively prompt AI for code generation


## **Module 2: Design in the Large**

### **Week 7-8: Application Services and Testing with Mocks**
- [**Assignment 4: Cookbook and Library Model, Comprehensive Test Suite**](/assignments/cyb4-testing) (Due 2026-02-26)
  - Build on A3 solution (provided)
  - **Comprehensive `RecipeService`:**
    - Single service with import, transformation, aggregation, and search capabilities
    - Import recipes from JSON files and plain text (parsing challenge)
    - Scale recipes to different serving sizes
    - Convert recipes between unit systems (metric ↔ imperial)
    - Generate shopping lists by aggregating ingredients across recipes
    - Search recipes by ingredient
  - **Internal Design Decisions:**
    - Students decide how to structure the service internally
    - Extract helper classes (IngredientParser, RecipeScaler, etc.) or keep inline?
    - Significant evaluation of design quality in manual grading
  - **Testing with Mocks:**
    - Use Mockito to test service with mock `RecipeRepository`, `RecipeCollectionRepository`, and `ConversionRegistry`
    - Mock `ConversionRegistry` to test edge cases (missing conversion paths)
    - Write parameterized tests for ingredient parsing
  - AI assistants encouraged
- [**Lab 7: Debugging**](/labs/lab7-debugging)
  - Practice systematic debugging strategies
- [**Lab 8: Architecture**](/labs/lab8-architecture)
  - Design architecture diagrams for recipe system
- [**Team Forming Survey**](/assignments/team-forming) (Due 2026-02-26)
  - Find your group of 4

### **Week 9: Spring Break**
- No assignments, prepare for group project to begin next week

### **Weeks 10-11: Rich Command-Line Interface**
- [**Assignment 5: Service Layer Architecture, CLI Interface**](/assignments/cyb5-service-architecture) (Due 2026-03-19)
  - Build on A4 solution (provided)
  - **CLI as a Driving Adapter:**
    - Implement the CLI as a Hexagonal "driving adapter"
    - CLI controller depends on application services, not domain directly
    - Apply MVC pattern: CLI views, controllers, and service-backed model
  - **Rich Interactive Features:**
    - Multi-level command hierarchy (library → cookbook → recipe navigation)
    - Tab completion for commands, cookbook names, recipe titles
    - Command history and editing (JLine or similar library)
    - Contextual help system (`help`, `help <command>`)
    - Progress indicators for long-running operations
  - **Usability and Polish:**
    - Apply Nielsen's usability heuristics to CLI design
    - Consistent command grammar and feedback patterns
    - Graceful error handling with actionable error messages
    - Support for both interactive and scripted (non-interactive) modes
  - **Import/Export Workflows:**
    - Import recipes from JSON files through CLI
    - Export recipes to markdown
- [**Lab 9: Network & CLI**](/labs/lab9-network-cli)
  - Practice with JLine3 and the Command pattern
- [**Lab 10: Usability**](/labs/lab10-usability) (Week 11)
  - Conduct heuristic evaluation on provided interfaces

## **Module 3: Design for Users (Group Work Begins)**

Group assignments are structured around **individual accountability with team collaboration**. Each team member owns one of four core GUI features, implementing against a provided ViewModel interface. Teams also collaborate on shared infrastructure, integration, and choose additional "menu" features to implement together.

**Weekly collaboration surveys** are due Mar 23, Mar 30, Apr 6, and Apr 13—submit via Pawtograder. These brief check-ins factor into individual accountability adjustments.

**Important:** The group project (GA1+GA2+Final) is released as a single specification with two accountability checkpoints. **You cannot wait until the end to complete this project**—features must be delivered incrementally, and each checkpoint requires working functionality. Plan your work from day one and use your team's code review process for iterative improvement.

### Mandatory Group Processes

Two recurring processes run throughout the group project and are **required** for full credit:

**Weekly Team Collaboration Surveys** — Due each Monday (Mar 23, Mar 30, Apr 6, Apr 13) via Pawtograder. Each survey asks you to briefly reflect on the team's dynamics, your own contributions that week, and any blockers or tensions. Responses are not shared with teammates but are visible to your TA group mentor, who uses them to lead retrospectives and guide team dynamics. They feed directly into the individual accountability adjustments for GA1, GA2, and the Final Report.

**Weekly TA Mentor Meetings** — Your team meets with your assigned TA mentor for 30 minutes each week (Mon–Tue). Every team member is expected to attend and to explain what they worked on—including the design decisions behind their code. The meeting also covers progress relative to upcoming checkpoints and next steps. These meetings are not a scheduling formality; they are the primary mechanism by which TA mentors verify that each team member understands their own code and is contributing meaningfully.

| Meeting | Week | Dates | Project Phase | Applies to | Graded? |
|---------|------|-------|---------------|-----------|---------|
| 1 | 12 | Mar 23–24 | Design Sprint (GA0 due Mar 26) | — | No — introductory "slow walk" |
| 2 | 13 | Mar 30–31 | Design Sprint walk-through | GA0 | Yes — up to -5 pts |
| 3 | 14 | Apr 6–7 | Core Features progress check-in | GA1 | Yes — up to -2 pts |
| 4 | 15 | Apr 13–14 | Core Features submission walk-through | GA1 | Yes — up to -5 pts |

Starting with Meeting 2, your TA assesses each student on code comprehension, process & workflow, collaboration evidence, and forward planning. Code walk scores function as **deductions only** — demonstrating comprehension means no deduction; inability to explain your own code results in a downward adjustment applied to the assignment the meeting covers. See the GA1 and GA2 assignment pages for the full rubric.

Before your first meeting, make sure your team has read the **[Git Workflow for Team Projects](/assignments/git-workflow)** guide and set up your branching strategy.

- **If you can attend:** show up prepared to walk through your code and explain why you made the choices you made.
- **If you cannot attend:** notify your TA *before* the meeting and send a written update covering your work status. This demonstrates accountability.
- **Missing without prior notice** signals a lack of accountability and will likely result in a zero for that week's individual accountability component.

### Accountability Overview

The group project is structured so that **individual contributions are independently verifiable at every stage**, even within a team grade. This reflects how accountability works in professional software teams: you are responsible for your own work and for being someone your teammates can rely on (see [L22: Teams and Collaboration](/lecture-notes/l22-teams) for the full accountability framework).

Individual accountability is assessed through three lenses and affects your grade directly:

| Mechanism | What it measures |
|-----------|-----------------|
| **TA mentor meeting observations** | Can you explain your code and design decisions? Are you contributing week to week? |
| **Weekly collaboration surveys** | Is the team working well? Are contributions equitable? |
| **Peer evaluation (final report only)** | How do your teammates assess your collaboration and contribution? |

Each checkpoint rubric includes an **Individual Accountability Adjustment** of up to **-20 points**, or an **upward adjustment of up to +20 points**. Deductions address cases where a team member is not pulling their weight. The upward adjustment exists for a specific scenario: if your team's project isn't fully complete, but you went above and beyond to support struggling teammates, you can still earn full marks. This is **not an extra credit mechanism** — it is unlikely to bring a student above the assignment's total points. Doing your own work well is the expected baseline. Note also that, as part of the [Final Report](/assignments/cyb13-final-report), the individual reflection is a **mandatory submission gate**: your team and individual grades are not released until your reflection is submitted.

The accountability adjustments exist to protect teammates who carry their weight from being penalized by those who don't, and to recognize collaborative behavior that isn't always visible in code alone.

---

### **Week 11-12: Design Sprint and Team Formation**
- [**Group Assignment 0: Design Sprint**](/assignments/cyb10-design-sprint) (Due 2026-03-26)
  - Build on A5 solution (provided)
  - **Team Foundation:**
    - Create **Team Charter**: communication norms, availability, decision-making process, conflict resolution plan, accountability expectations
    - Assign feature ownership: each member claims one of the four core features (or three if your team has three members and omits Search & Filter)
  - **Individual Deliverables (per team member):**
    - User persona for your feature area (who uses this feature? what are their goals?)
    - Low-fidelity wireframes for your feature
    - Accessibility considerations: how will your feature support keyboard navigation, screen readers, etc.?
  - **Team Deliverables:**
    - Architecture diagram: how do ViewModels connect to existing services from A5?
    - Integrated wireframe document showing navigation flow and shared UI elements
    - **Feature Buffet selection**: choose 2-3 features for Checkpoint 2 with rationale
    - **"Our Feature" concept**: design a custom feature (not on buffet) to present in final demo
  - *Grading: 50% individual, 50% team*
- [**Lab 11: User-Centered Design**](/labs/lab11-ucd) (Week 12)
  - Practice UCD techniques and user research methods

### **Week 12-15: Group Project**
- [**Group Project: CookYourBooks GUI**](/assignments/cyb11-core-features) (Released 2026-03-23)

  This is a **single project** with two accountability checkpoints. The full specification is available from day one—plan your work accordingly. **Checkpoints require working features**; later checkpoints build on earlier ones, so it is impossible to leave everything until the final week.

  **TA Mentor Meeting schedule during group project:**

  | Week | Meeting | Dates | Focus | Applies to | Graded? |
  |------|---------|-------|-------|-----------|---------|
  | 12 | Meeting 1 | Mar 23–24 | Design sprint check-in, team intros, workflow setup | — | No |
  | 13 | Meeting 2 | Mar 30–31 | Design sprint walk-through | GA0 | Yes (up to -5 pts) |
  | 14 | Meeting 3 | Apr 6–7 | Core features progress check-in | GA1 | Yes (up to -2 pts) |
  | 15 | Meeting 4 | Apr 13–14 | Core features submission walk-through | GA1 | Yes (up to -5 pts) |

- [**Lab 12: GUI Programming**](/labs/lab12-gui) (Week 13)
  - JavaFX workshop
- [**Lab 13: Asynchronous Programming**](/labs/lab13-async) (Week 14)
  - Practice with CompletableFutures

  #### **Checkpoint 1: Core Features** (Due 2026-04-09)
  - **You are provided:** ViewModel interfaces (contracts) for each of the four core features (or three if your team uses the 3-person exception and omits Search & Filter).
  - **Core Features (one owner per team member):**
    1. **Library View**: Browse cookbooks/collections, navigation, collection management
    2. **Recipe Details/Editor**: View and edit recipe content, ingredient list, validation
    3. **Import Interface**: Image upload, Gemini-based import progress feedback, error handling, async operations
    4. **Search & Filter**: Search by title/ingredient, tag filtering, keyboard navigation *(3-person teams omit this feature; each member owns one of 1–3)*
  - **Individual Deliverables:**
    - ViewModel implementation for your feature
    - View implementation (FXML + controller) that binds to your ViewModel
    - Additional unit tests beyond the provided suite
  - **Team Deliverables:**
    - Integrated application with all implemented core features working together (four, or three for 3-person teams)
    - Shared infrastructure: navigation, theming, error handling components (for implemented features)
    - Integration tests verifying interactions between implemented core features
    - Evidence of code review (meaningful PR comments applying HRT principles)
  - *Checkpoint grading: 70% individual (ViewModel + View), 30% team (integration). Same for 3- and 4-person teams; grading applies only to implemented features.*

- [**Lab 14: Prep for Future of Programming**](/labs/lab14-future-prep) (Week 15)
  - Explore emerging trends in software development

  #### **Checkpoint 2: Feature Buffet** (Due 2026-04-16)
  - **Choose 2-3 features from the menu** (see [GA2: Feature Buffet](/assignments/cyb12-feature-buffet) for full descriptions):
    - *Standard:* Recipe Scaling, Shopping List, Export to PDF, Unit Conversion, Keyboard Shortcuts, Dark Mode, Cooking Timer, Cooking Mode
    - *Advanced:* Multi-Page Import, Recipe Chatbot, Meal Planning, Nutritional Info
  - **Process Portfolio (required for each feature):**
    - Design rationale: why this feature? what user need?
    - Design artifacts: show iteration (at least 2 versions with rationale for changes)
    - Implementation journal: git history, PR reviews, documented decisions
    - Testing evidence: unit tests, accessibility check
  - *Checkpoint grading: 20% individual, 80% team (with individual accountability adjustment of up to ±20 points)*

  #### **Final Submission** (Due 2026-04-20)
  See [Final Report](/assignments/cyb13-final-report) for full details, but in summary:
  - **Application:** Full CookYourBooks application with all core features + Feature Buffet selections integrated
  - **Written Report** (3-4 pages): architecture decisions, team reflection, sustainability assessment, "Our Feature" design concept
  - **Infographic Poster:** single landscape page visual summary (opt-in to public course showcase)
  - **Demo Video** (2-3 min): screen capture showcasing your application
  - Peer evaluation survey submitted