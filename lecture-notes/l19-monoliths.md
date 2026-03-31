---
sidebar_position: 19
lecture_number: 19
title: "L19: Architectural Styles: From Hexagons to Monoliths"
---

# Architectural Styles: From Hexagons to Monoliths

Suggested background reading for a deeper dive:
- [Fundamentals of Software Architecture, 2nd Edition by Mark Richards and Neal Ford](https://learning.oreilly.com/library/view/fundamentals-of-software/9781098175504/ch09.html#id72) - especially Chapter 9

## Learning Objectives

After this lecture, you will be able to:

1. Define **quality attributes** that architectural styles affect: maintainability, scalability, deployability, fault tolerance, and more
2. Distinguish between **architectural styles** and **architectural patterns**
3. **Recognize and compare** architectural styles like **Hexagonal**, **Layered**, **Pipelined**, and **Monolithic**
4. Explain the tradeoffs of **monoliths**, **modular monoliths**, and **microservices**
5. Analyze how architectural choices **affect quality attributes differently** for specific scenarios

:::note Important Framing
You are **not** expected to become a master architect by the end of this lecture. The goal is to *understand systems that use these styles* and reason about how architectural decisions impact quality attributes. When you encounter a hexagonal or layered architecture in the wild, you'll be able to read it—not necessarily design it from scratch.

Junior engineers read existing architectures far more than they design new ones. Understanding *why* a system is structured a certain way is 90% of the skill. Design skills come later with experience—comprehension comes first.
:::

In [L16 (Design for Testability)](./l16-testing2.md), we introduced **Hexagonal Architecture** (Ports and Adapters) as a way to separate domain logic from infrastructure, making code testable. That was architecture in service of a specific quality attribute: testability. In [L18](./l18-architecture-design.md), we identified component boundaries for Pawtograder's autograder—the Solution Repo, Grading Action, and Pawtograder API—by applying heuristics about rate of change, actors, interface segregation, and testability.

Now we zoom out to look at architectural styles more broadly—recurring structures that help organize entire applications. We'll continue with our **Pawtograder** and **Bottlenose** running examples to see how these styles apply in practice.

Architecture is fundamentally about tradeoffs. Every architectural choice affects multiple quality attributes: maintainability (how easy is it to change?), scalability (how does it handle growth?), performance (how fast is it?), and increasingly, energy efficiency (how much power does it consume?). There's no universally "best" architecture—only architectures that are better or worse fits for particular constraints and priorities. Our goal is to develop vocabulary for discussing these tradeoffs and intuition for recognizing them.

## How Do We Organize Our Code?

This is the question at the heart of every architectural decision—from your first class project to production systems serving millions of users. Every pattern and style we study today is an answer to this question.

Not every system has a discernible architecture. Some systems grow organically without any guiding structure, accumulating features and fixes until no one understands how the pieces fit together. Architects call this a **Big Ball of Mud**. Brian Foote and Joseph Yoder named this antipattern in their famous 1997 paper:

> "A Big Ball of Mud is a haphazardly structured, sprawling, sloppy, duct-tape-and-baling-wire, spaghetti-code jungle. These systems show unmistakable signs of unregulated growth, and repeated, expedient repair. Information is shared promiscuously among distant elements of the system, often to the point where nearly all the important information becomes global or duplicated."

Nobody designs a Big Ball of Mud on purpose. It emerges from thousands of small decisions made under pressure: "just put it here for now," "we'll refactor later," "it's faster to copy-paste." The real cost isn't aesthetics—it's every quality attribute we'll discuss:

- **Changeability**: "Where does this feature go?" → "Everywhere and nowhere"
- **Testability**: Can't test in isolation when everything depends on everything
- **Deployability**: Can't deploy safely when any change might break anything
- Eventually: cheaper to rewrite than to maintain

Every architectural style we study—layered, hexagonal, pipelined, monolith, modular monolith—is a strategy to prevent this. As we discuss each style, we'll ask: "How does this style help us organize our code?"

## The Monolith: Where Most Projects Start

Here's a foundational insight: **you've been building monoliths your entire programming career**. Every Java project, every Python script—all monoliths. The term only becomes meaningful in contrast to systems that *aren't* monoliths.

A **monolith** is a system deployed as a single unit. All functionality—user interface, business logic, data access—lives in one codebase, compiles into one artifact, and runs in one process (or a cluster of identical processes). This is where most projects start—and for many successful systems, where they stay.

**Characteristics of monoliths:**
- **Single deployment unit**: One build, one deploy, one running process. Fix a typo in the grading UI? Redeploy the whole app.
- **Shared memory**: Components communicate via method calls, not network requests. Method calls take nanoseconds. Transactions can span the entire system.
- **Single database**: All data lives in one schema, managed by one application
- **Unified codebase**: All code in one repository, one build system, one language ecosystem. Rename a method and your IDE finds every caller.

**Bottlenose is a classic monolith.** It's a Rails application where:
- Controllers, models, views, and jobs all deploy together
- Grader subclasses share a database with submissions, courses, and users
- Adding a feature means changing the monolith and redeploying the whole application
- The entire team works in one codebase

**Benefits of monoliths:**
- **Simplicity**: One thing to build, test, deploy, and monitor
- **Performance**: In-process calls are orders of magnitude faster than network calls
- **Consistency**: Transactions span the entire system; no distributed coordination needed
- **Debugging**: One log file, one stack trace, one debugger session

**Drawbacks of monoliths:**
- **Scaling constraints**: Must scale the entire application, even if only one feature is bottlenecked
- **Deployment risk**: Every deploy is all-or-nothing; a bug in one feature can take down everything
- **Team coupling**: Large teams stepping on each other's changes in a single codebase
- **Technology lock-in**: The whole system uses one language, one framework, one set of dependencies
- **Modularity by convention only**: Nothing prevents developers from bypassing intended structure—without discipline, a monolith tends toward the Big Ball of Mud

:::tip The Monolith-First Approach
Martin Fowler and many experienced architects recommend starting with a monolith. Why? Because monoliths are *simple*. You can understand the whole system. You can refactor freely. You can deploy with confidence.

The alternative—microservices—adds significant complexity that's only justified when you have specific scaling, team, or deployment problems that a monolith can't solve. We'll see exactly what that complexity looks like in the next lecture.
:::

### The Modular Monolith: A Middle Ground

Between "monolith" and "microservices" lies an increasingly popular middle ground: the **modular monolith**. This architecture maintains the single deployment unit of a monolith but enforces strict module boundaries *within* the codebase—the answer to the modularity problem above.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Modular Monolith                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Courses   │  │ Submissions │  │   Grading   │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │              │
│  │ │ Domain  │ │  │ │ Domain  │ │  │ │ Domain  │ │              │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │              │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │              │
│  │ │   API   │ │  │ │   API   │ │  │ │   API   │ │              │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              │    Shared Database    │                          │
│              │  (but separate schemas)│                         │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                   Single Deployment Unit
```

**Key characteristics:**
- **Single deployment**: Still one build, one deploy—operationally simple
- **Strong module boundaries**: Modules communicate through explicit public APIs, not by reaching into each other's internals
- **Separate schemas (often)**: Each module owns its database tables; cross-module queries go through APIs
- **Enforced encapsulation**: Build tools or linters prevent modules from importing each other's private code

**Why is this valuable?**

The modular monolith gives you **optionality**. If the Grading module eventually needs independent scaling, you can extract it to a separate service—the boundaries are already clean. But you don't pay the distributed systems tax until you need to. Many teams discover they *never* need to extract: the module boundaries solve their maintainability and team ownership problems without the complexity of network communication.

**The tradeoff**: enforcing boundaries within a monolith requires discipline. There's nothing stopping a developer from bypassing the API and querying another module's tables directly—except code review, linting rules, and team norms. Microservices enforce boundaries through network calls; modular monoliths enforce them through convention and tooling.

:::note LO4 checkpoint
You now have the vocabulary to explain the tradeoffs of monoliths and modular monoliths. We'll return to microservices after covering the other architectural styles.
:::

## Technical vs. Domain Partitioning

Beyond choosing an architectural style, we face another fundamental question: how do we organize our code into modules or packages? There are two dominant approaches, and the choice has implications for how teams work.

**Technical partitioning** organizes code by its technical role. All controllers go in one package, all services in another, all parsers in a third:

```
autograder/
├── api/
│   └── SupabaseAPI.java
├── grading/
│   ├── OverlayGrader.java
│   └── GradingService.java
├── builders/
│   ├── GradleBuilder.java
│   └── PythonScriptBuilder.java
├── parsers/
│   ├── SurefireParser.java
│   ├── PitestParser.java
│   └── CheckstyleParser.java
└── config/
    └── PawtograderConfig.java
```

**Domain partitioning** organizes code by business capability. Everything related to Java grading goes in a `java/` module—the builder, parsers, and language-specific logic:

```
autograder/
├── grading/
│   ├── OverlayGrader.java
│   ├── GradingService.java
│   └── PawtograderConfig.java
├── languages/
│   ├── java/
│   │   ├── GradleBuilder.java
│   │   ├── SurefireParser.java
│   │   ├── PitestParser.java
│   │   └── CheckstyleParser.java
│   └── python/
│       ├── PythonScriptBuilder.java
│       └── PytestParser.java
└── platform/
    └── SupabaseAPI.java
```

The tradeoffs become clear when you ask practical questions:

**Where do you look to understand "how Java grading works"?**
- Technical: Jump between `builders/`, `parsers/`, and `grading/`
- Domain: Everything is in `languages/java/`

**Which approach minimizes cross-package changes?**
- Technical: Adding Rust support requires new files in `builders/`, `parsers/`, and changes to `grading/`
- Domain: All Rust changes stay within `languages/rust/`

**Which supports team independence?**
- Technical: Every language requires coordination between "builder team," "parser team," and "grading team"
- Domain: A "Rust support team" can own their vertical slice independently

**Bottlenose uses technical partitioning** (the Rails convention):
```
bottlenose/
├── controllers/
├── models/
│   └── graders/
├── views/
│   └── graders/
└── jobs/
```

This means adding a new `RustGrader` requires changes in `models/graders/`, `views/graders/`, and potentially `controllers/`. The Rails convention prioritizes consistency across the entire application over isolation of individual features.

:::tip Conway's Law (preview)
Organizations design systems that mirror their communication structure. If you have a "frontend team" and "backend team," you'll tend toward technical partitioning. If you have a "grading team" and "courses team," you'll tend toward domain partitioning. We'll explore this in [L22 (Teams and Collaboration)](./l22-teams.md).
:::

## Quality Attributes: The "-ilities"

How do we decide if an architecture is "good"? Not by how it looks—by how it behaves. **Quality attributes** are the measurable properties of a system that stakeholders care about. You've already met some of these. Now we'll build a complete vocabulary and use it throughout to evaluate every architectural style we encounter.

| Group | Attributes |
|-------|-----------|
| Structure | **Simplicity**, **Modularity**, **Testability** |
| Change | **Maintainability**, **Changeability**, **Deployability** |
| Runtime | **Scalability**, **Responsiveness**, **Fault Tolerance** |

**Simplicity** — How easy is the system to understand and reason about? Fewer moving parts, fewer deployment units, fewer technologies. (Review: L7's low coupling and high cohesion principles scale up to architecture.)

**Modularity** — How well is the system divided into independent, interchangeable components? High cohesion within modules, low coupling between them.

**Testability** — How easy is it to verify that the system behaves correctly? Introduced in L16 via Hexagonal Architecture, which made the grading engine testable in isolation by separating domain logic from infrastructure.

**Maintainability** — How easily can the system be changed over time? This includes fixing bugs, adding features, updating dependencies, and adapting to new requirements. Different from changeability: maintainability is about the ongoing cost of ownership.

**Changeability** — How easily can specific types of changes be made? Where Maintainability is broad, Changeability asks: "Given *this* change, how many places do I have to touch?" (Review: L7-L8, coupling, cohesion, SOLID.)

**Deployability** — How easily and safely can the system be deployed? How quickly can a bug fix reach production? A monolith deploys everything at once; microservices let you deploy one service at a time but add coordination complexity.

**Scalability** — How does the system handle growth in load, data, or users? Systems scale *vertically* (bigger hardware) or *horizontally* (more instances). The key nuance: "scalable" means different things depending on the scenario.

**Responsiveness** — How quickly does the system respond to requests? In a monolith, in-process method calls take nanoseconds and database transactions are cheap. In a distributed system, every network hop adds latency and uncertainty.

**Fault Tolerance** — How well does the system continue operating when components fail? In a monolith, a crash anywhere crashes everything. In a distributed system, failures can be isolated—but can also cascade unpredictably.

### Specifying Quality Attributes: Scenarios

"The system should be scalable" is as useless a requirement as "the system should be fair." To make quality attributes actionable, we use **quality attribute scenarios**—a structured way to make every attribute testable and unambiguous:

| Part | Question | Example |
|------|----------|---------|
| **Source** | Who causes it? | 200 students |
| **Stimulus** | What event arrives? | Submit near deadline |
| **Environment** | Under what conditions? | Normal operation |
| **Artifact** | What part of the system? | Grading pipeline |
| **Response** | What should happen? | All submissions graded |
| **Measure** | How do we know it's good enough? | < 30 minutes total |

Consider what "scalable" actually means for a grading system:

- **Scenario A (Spike)**: 200 students submit *all at once* at 11:59pm. 200 parallel GitHub Actions runners spin up simultaneously. The API receives 200 results at once.
- **Scenario B (Sustained)**: 1800 students submit over 1 hour during an exam. ~30 new runners start every minute—sustained load, not a spike.
- **Scenario C (Trickle)**: 1800 students submit over 24 hours for a homework. 1–2 runners active at any time.

A system designed only for Scenario C might completely fail at Scenario A. This is why we need precise vocabulary—and why architectural decisions must be tied to specific scenarios, not vague promises.

:::note LO1 checkpoint
You now have vocabulary for all nine quality attributes and can describe them using the six-part scenario format.
:::

## Architectural Styles vs. Patterns

Before diving into specific styles, let's clarify vocabulary that architects use (and sometimes confuse).

An **architectural style** describes a bundle of characteristics about a system. When we name a style, we're capturing several dimensions at once: how components and their dependencies are organized (the *component topology*), whether the system runs as a single deployment unit or as multiple networked services (the *physical architecture*), how frequently and in what pieces the system gets deployed, how components communicate with each other (method calls? REST? message queues?), and whether data is centralized or spread across multiple stores.

Naming a style gives us shorthand for this complex bundle. When you say "microservices," other architects immediately understand implications about deployment, communication, team structure, and more. When you say "layered architecture," they picture horizontal strata with rules about which layers can call which. The name is a handle for a whole worldview.

An **architectural pattern**, by contrast, is a contextualized solution to a recurring problem. Patterns are more specific and tactical. "Circuit Breaker" is a pattern for handling failures in distributed systems. "Repository" is a pattern for abstracting data access. You might use many patterns within a single architectural style.

The distinction matters: styles describe the overall shape and constraints of a system; patterns are reusable solutions you apply within that system.

:::tip Where Do Architectural Styles Come From?
There's no official committee that decides what architectural styles exist. Styles emerge from practice. A clever architect notices that new ecosystem capabilities—better DevOps tooling, reliable containers, domain-driven design principles—enable new ways to solve old problems. They combine these capabilities, others copy the approach, and eventually it gets a name.

**Microservices** is a perfect example: the name emerged as a reaction to the "big service" architectures that preceded it, not as a prescription to build the smallest services possible. The style became possible because of improvements in deployment automation, container orchestration, and API design practices.

This is the software engineering version of [piecemeal growth](./l18-architecture-design.md)—Christopher Alexander's observation that good architecture emerges through gradual adaptation rather than top-down master plans. Architectural styles aren't invented in ivory towers; they evolve from the ecosystem.
:::

:::note LO2 checkpoint
You can now distinguish between an architectural style (the overall shape and constraints of a system) and an architectural pattern (a reusable solution applied within a system).
:::

## Continuing Our Running Examples: Pawtograder and Bottlenose

In [L18](./l18-architecture-design.md), we identified component boundaries for Pawtograder's autograder and compared them to Bottlenose's architecture. We discovered that both systems solve the same fundamental problem—grade student code automatically—but make different architectural choices based on different requirements.

Now let's see how architectural *styles* help us understand and describe these different approaches.

As a reminder, both systems must:
- Accept student code submissions
- Run tests against student implementations
- Compute scores based on test results
- Report feedback to students

But they do so with different architectural approaches:
- **Pawtograder**: A "thick action" architecture where the Grading Action normalizes results before sending them through a narrow API
- **Bottlenose**: A Rails monolith with platform-driven grading logic, delegating execution to Orca (a Docker-based microservice)

These differences create architectural challenges that manifest differently in each system:
- How to isolate grading logic from infrastructure (testability)
- How to handle multiple programming languages (extensibility)
- How to manage communication between components (coupling)
- How to scale to many concurrent submissions (scalability)

Let's see how Hexagonal Architecture—which we first met in L16—manifests in these real systems.

## Hexagonal Architecture in Pawtograder

In L16, we saw Hexagonal Architecture (Ports and Adapters) applied to a smart home energy optimizer. The pattern separated domain logic from infrastructure, making the code testable. Now let's see how this same pattern manifests in Pawtograder's Grading Action.

### The Core Domain

Pawtograder's grading logic doesn't care *how* results are sent to the API or *where* the grader tarball comes from—it only cares about grading submissions:

```java
// Domain: Pure grading logic, no infrastructure
public class OverlayGrader implements Grader {
    private final Builder builder;
    private final Logger logger;
    
    public OverlayGrader(Builder builder, Logger logger) {
        this.builder = builder;
        this.logger = logger;
    }
    
    public AutograderFeedback grade(Path solutionDir, Path submissionDir, 
                                     PawtograderConfig config) {
        // 1. Copy solution to grading directory
        // 2. Overlay student files onto solution
        // 3. Build and run tests
        BuildResult buildResult = builder.build(gradingDir, config.getBuild());
        if (!buildResult.success()) {
            return createBuildFailureFeedback(buildResult);
        }
        
        // 4. Parse test results and compute scores
        List<TestResult> testResults = builder.parseTestResults(gradingDir);
        List<TestFeedback> feedback = gradeUnits(config.getGradedParts(), testResults);
        
        // 5. Return normalized feedback
        return new AutograderFeedback(feedback, lintResult, output, score);
    }
}
```

This code knows nothing about GitHub Actions, HTTP APIs, or database connections. It's pure domain logic: given a solution and a submission, grade it according to the config.

### Ports Define What the Domain Needs

Ports are interfaces that describe what the grading engine needs from the outside world—without specifying how:

```java
// Port: How do we build and test? (not WHICH build tool)
public interface Builder {
    BuildResult build(Path projectDir, BuildConfig config);
    List<TestResult> parseTestResults(Path reportDir);
    Optional<LintResult> lint(Path projectDir, LinterConfig config);
    Optional<List<MutantResult>> mutationTest(Path projectDir, MutationConfig config);
}

// Port: How do we register submissions? (not WHICH platform)
public interface SubmissionAPI {
    SubmissionRegistration register(String oidcToken);
}

// Port: How do we submit feedback? (not HOW it's stored)
public interface FeedbackAPI {
    void submit(String submissionId, AutograderFeedback feedback);
}

// Port: How do we log output? (not WHERE it goes)
public interface Logger {
    void log(String message, Visibility visibility);
}
```

### Adapters Connect to Real Infrastructure

Adapters implement the ports for specific technologies:

```java
// Adapter: Gradle builds (Java)
public class GradleBuilder implements Builder {
    @Override
    public BuildResult build(Path projectDir, BuildConfig config) {
        // Run ./gradlew test with appropriate arguments
        ProcessResult result = runGradle(projectDir, "test", config.getTimeouts());
        return new BuildResult(result.exitCode() == 0, result.output());
    }
    
    @Override
    public List<TestResult> parseTestResults(Path reportDir) {
        // Parse Surefire XML format
        return SurefireParser.parse(reportDir.resolve("build/test-results"));
    }
    
    @Override
    public Optional<LintResult> lint(Path projectDir, LinterConfig config) {
        // Run checkstyle, parse XML output
        runGradle(projectDir, "checkstyleMain");
        return Optional.of(CheckstyleParser.parse(reportDir));
    }
}

// Adapter: Python script builds
public class PythonScriptBuilder implements Builder {
    @Override
    public BuildResult build(Path projectDir, BuildConfig config) {
        // Run configured Python test command
        ProcessResult result = runPython(projectDir, config.getCmd());
        return new BuildResult(result.exitCode() == 0, result.output());
    }
    // ... parse pytest output ...
}

// Adapter: Pawtograder's Supabase backend
public class SupabaseAPI implements SubmissionAPI, FeedbackAPI {
    private final HttpClient client;
    private final String baseUrl;
    
    @Override
    public SubmissionRegistration register(String oidcToken) {
        // POST to createSubmission endpoint with OIDC token
        // Returns submission ID, grader URL, and SHA for verification
    }
    
    @Override
    public void submit(String submissionId, AutograderFeedback feedback) {
        // POST normalized feedback to submitFeedback endpoint
        // Includes retry logic with exponential backoff
    }
}
```

### Services Orchestrate Domain and Adapters

The main entry point coordinates between the grading domain and infrastructure adapters:

```java
public class GradingPipeline {
    private final SubmissionAPI submissionApi;
    private final FeedbackAPI feedbackApi;
    private final Grader grader;
    
    public GradingPipeline(SubmissionAPI submissionApi, 
                           FeedbackAPI feedbackApi,
                           Grader grader) {
        this.submissionApi = submissionApi;
        this.feedbackApi = feedbackApi;
        this.grader = grader;
    }
    
    public void run(String oidcToken, Path submissionDir) {
        // 1. Register submission (infrastructure concern)
        SubmissionRegistration reg = submissionApi.register(oidcToken);
        
        // 2. Download and extract grader (infrastructure concern)
        Path solutionDir = downloadGrader(reg.graderUrl(), reg.graderSha());
        
        // 3. Grade (pure domain logic)
        PawtograderConfig config = parseConfig(solutionDir);
        AutograderFeedback feedback = grader.grade(solutionDir, submissionDir, config);
        
        // 4. Submit results (infrastructure concern)
        feedbackApi.submit(reg.submissionId(), feedback);
    }
}
```

### Why This Structure Matters

| Concern | Where It Lives | Can Change Without Affecting... |
|---------|----------------|--------------------------------|
| "Grade a submission against tests" | Domain (OverlayGrader) | Any adapter |
| "Build Java with Gradle" | Adapter (GradleBuilder) | Domain logic, other builders |
| "Send results to Pawtograder" | Adapter (SupabaseAPI) | Domain logic, build adapters |
| "Parse Surefire XML" | Adapter (SurefireParser) | Domain logic, other parsers |
| "Run in GitHub Actions" | Adapter (Main.java) | Domain logic, could run locally |

This is the payoff of Hexagonal Architecture: the grading logic is protected from infrastructure churn. When we add Python support, we add a `PythonScriptBuilder` adapter—the grading domain never changes. When we want to test locally without Pawtograder, we swap in mock APIs—the grader doesn't know the difference.

**This is why the Grading Action can run locally** via `java -jar grader.jar -s /path/to/solution -u /path/to/submission`. The grading engine has no dependency on GitHub Actions or the Pawtograder API—those are adapters that can be swapped out for local testing.

## Other Common Architectural Styles

Now that we've seen Hexagonal Architecture in depth, let's survey two other foundational styles. As you read architectural diagrams and documentation, you'll encounter these constantly.

### Layered Architecture

The **layered architecture** organizes code into horizontal strata, each with a distinct responsibility. The classic formulation has four layers: Presentation (user interface), Application/Service (orchestration and use cases), Domain (business logic and rules), and Infrastructure (databases, external services, file I/O).

The key rule is that dependencies flow downward: Presentation can call Service, Service can call Domain, Domain can call Infrastructure—but not the reverse. This creates clear separation of concerns. You can swap your database without touching your business rules. You can change your UI framework without rewriting your services.

How does this relate to Hexagonal Architecture? Both achieve separation of domain logic from infrastructure, but through different lenses. Hexagonal emphasizes the *direction of dependencies* (domain at the center, infrastructure at the edges). Layered emphasizes *horizontal strata* with strict rules about which layer can call which. In practice, you'll often see both perspectives applied to the same system.

In Pawtograder's Grading Action, we can identify these layers:
- **Presentation**: GitHub Actions entry point (`Main.java`), job summary generation
- **Application/Service**: `GradingPipeline` (orchestration), config parsing
- **Domain**: `OverlayGrader`, score calculation, dependency resolution
- **Infrastructure**: `SupabaseAPI`, `GradleBuilder`, report parsers

In Bottlenose, the layers look different because it's a Rails monolith:
- **Presentation**: ERB views, web controllers, REST API endpoints
- **Application/Service**: `SubmissionsController`, `GradingJob` orchestration
- **Domain**: `Grader` subclasses, `Submission#compute_grade!`
- **Infrastructure**: ActiveRecord (PostgreSQL), Beanstalkd queue, Orca HTTP client

The benefits are clear: separation of concerns, improved testability, and the ability to replace components. But layered architectures have pitfalls too. Changes that span multiple layers (adding a new grading field that flows from config to API) require touching every layer. Hence, while the layered architecture is an important style to study, it should not be blindly and strictly applied—the hexagonal architecture is often a better way to think about the problem.

### Pipelined Architecture

The **pipelined architecture** (sometimes called "pipes and filters") organizes processing as a series of stages. Data flows through the pipeline, with each stage transforming its input into output for the next stage. Stages are independent and composable—you can add, remove, or reorder them without rewriting the whole system.

Compilers are classic examples: source code flows through lexing, parsing, type checking, optimization, and code generation stages. Data processing workflows (ETL jobs, stream processing) often follow this pattern.

**Pawtograder's grading pipeline** is a perfect example:

```
Submission → [Overlay Files] → Merged Project → [Build] → Build Result
    → [Run Tests] → Test Results → [Parse Reports] → TestFeedback[]
    → [Grade Units] → Scored Units → [Apply Dependencies] → Final Feedback
```

Each stage can be developed and tested independently. The grading action actually makes two passes: Pass 1 grades all units, Pass 2 applies dependencies (if Part 1 failed, Part 2 doesn't run). Adding mutation testing meant inserting a stage between "Run Tests" and "Grade Units"—the rest of the pipeline remained unchanged.

The benefits are modularity and flexibility. The constraint is that the pattern works best when data truly flows in one direction—it's awkward for interactive or bidirectional workflows.

:::note LO3 checkpoint
You can now recognize and compare four architectural styles: Hexagonal (domain at center, ports/adapters at edges), Layered (horizontal strata, downward dependencies), Pipelined (sequential stages, composable), and Monolithic (single deployment unit). All three of the first styles describe organization *within* a single deployment unit—they are styles you apply inside a monolith.
:::

## Two Big Families: Monolith vs. Microservices

So far, all the architectural styles we've examined—Hexagonal, Layered, Pipelined—describe how to organize code *within a single deployment unit*. They all assume that components communicate via method calls in shared memory, that transactions can span the entire system, and that debugging means following one stack trace.

This is the world of the **monolith**. But there's a contrasting family of architectures that splits the system across multiple deployment units.

### Where Do Our Running Examples Fall?

You've probably heard the term **microservices**—it's one of the most discussed architectural styles today. A microservices architecture decomposes a system into small, independently deployable services, each responsible for a specific business capability.

**Characteristics of microservices:**
- **Independent deployment**: Each service has its own build pipeline and deploy cycle
- **Network communication**: Services call each other via APIs, not method calls
- **Decentralized data**: Each service owns its data; no shared database
- **Polyglot friendly**: Different services can use different languages, frameworks, or databases

The promise is compelling: independent scaling, isolated failures, team autonomy, technology flexibility. But look at that second characteristic again: *network communication*. Services don't share memory—they talk over the network.

| Aspect | Bottlenose | Pawtograder |
|--------|------------|-------------|
| **Core application** | Monolith (Rails) | Multiple independent services |
| **Grading execution** | Separate service (Orca) | Leverages GitHub Actions |
| **Data ownership** | Shared PostgreSQL database | API owns data; action is stateless |
| **Deployment** | Single deploy (mostly) | Each service deploys independently |
| **Communication** | Method calls + one HTTP boundary | HTTP APIs between all components |

**Bottlenose is a monolith with a microservice bolted on.** The core Rails application is a classic monolith, but Orca (the Docker execution service) is a separate service. Why? Because grading needs isolation that a monolith can't provide—you don't want student code running in your main web process.

**Pawtograder is a distributed system.** The Grading Action runs on GitHub's infrastructure. It calls the Pawtograder API over HTTP. There's a network in between.

And that network changes *everything*.

### The Network Changes Everything

When you call a method in a monolith, you know it will execute. The call takes nanoseconds. If something goes wrong, you get an exception with a stack trace.

When you call an API over a network:
- The call might take milliseconds... or seconds... or never return at all
- The server might be down, overloaded, or unreachable
- The request might succeed but the response might get lost
- You might retry and accidentally perform the operation twice
- You can't wrap the whole thing in a database transaction

Consider what happens when Pawtograder's Grading Action tries to submit feedback to the API:

```java
feedbackApi.submit(submissionId, feedback);  // What could go wrong?
```

What if the API times out? What if it returns an error? What if the request succeeds but the response never arrives? The grading action actually implements retry logic with exponential backoff—complexity that simply doesn't exist in a monolith.

This is why architects say "microservices" really means "distributed systems"—and distributed systems are *hard*.

**In the next lecture**, we'll explore what makes distributed systems so challenging: the **Fallacies of Distributed Computing** (eight assumptions developers make about networks that are all false), **client-server architecture** and its variants, and the security implications of components communicating across trust boundaries. We'll see how both Pawtograder and Bottlenose handle these challenges—and why even Bottlenose, our "monolith," couldn't stay entirely monolithic.

## Architecture and Quality Attributes

:::note Recall
In [Lecture 8 (Changeability III)](/lecture-notes/l8-design-for-change-2), we introduced the SOLID principles for individual classes and noted they scale to entire systems. Now we see that scaling in action: Single Responsibility becomes service boundaries (Solution Repo, Grading Action, and API each have one reason to change), Open/Closed becomes plugin architectures (new `Builder` implementations without modifying existing code), and Dependency Inversion becomes the foundation of Hexagonal Architecture (domain depends on abstractions, not concrete adapters).
:::

Now that we've seen several architectural styles, let's examine how they affect quality attributes in practice. These aren't abstract concerns—they have real consequences for teams, users, and the environment.

### Maintainability

Maintainability is about how easily a system can be changed over time. This includes fixing bugs, adding features, updating dependencies, and adapting to new requirements.

Hexagonal and layered architectures excel at maintainability *within* their boundaries. Because the domain is isolated from infrastructure, you can swap storage mechanisms or update API clients without rewriting business logic. The tradeoff is that changes spanning multiple layers (a new field flowing from config to API) touch many files.

Pipelined architectures are highly maintainable for their intended use case—adding a new processing stage is straightforward. But if you need to add cross-cutting concerns (logging, error handling, transactions), you may need to modify every stage.

**Comparing maintainability in our running examples:**

| Change | Pawtograder Impact | Bottlenose Impact |
|--------|-------------------|-------------------|
| Add Rust language support | Add one `RustCargoBuilder` class; no API changes | Add `RustGrader` subclass + UI views + Docker image + registration |
| Change how scores are calculated | Modify `OverlayGrader`; no API or config changes | Modify `Submission#compute_grade!`; affects all graders |
| Add a new feedback format | Modify `AutograderFeedback` record; requires API coordination | Add fields to `InlineComment`; database migration |

Pawtograder's "thick action, narrow API" architecture isolates most changes to a single component. Bottlenose's monolithic architecture means changes often ripple across multiple concerns. Neither is inherently better—the tradeoffs depend on which changes are most frequent and which teams own which components.

### Scalability

Scalability is about handling growth—more users, more data, more requests. Systems can scale *vertically* (bigger hardware) or *horizontally* (more instances).

**Pawtograder** leverages GitHub Actions for horizontal scaling:
- Each submission triggers an independent GitHub Actions runner
- GitHub handles scheduling, VM provisioning, and parallelism automatically
- Near-deadline traffic spikes are absorbed by GitHub's infrastructure
- The Pawtograder API just receives results—it doesn't coordinate grading

**Bottlenose** uses a different approach:
- Backburner/Beanstalkd limits concurrent grading jobs (15 max) to stay within database connection limits
- Orca runs Docker containers for isolation, but scales with dedicated infrastructure
- The platform must manage the queue and handle backpressure during high-traffic periods

The architectural choice between "leverage someone else's infrastructure" (Pawtograder) versus "run your own infrastructure" (Bottlenose) has profound scaling implications. Pawtograder trades control for simplicity; Bottlenose retains control but must manage operational complexity.

### Energy Efficiency

Energy efficiency is an increasingly important quality attribute that architects often overlook. Software doesn't consume energy directly, but the hardware it runs on does—and architectural choices determine how much.

**Consider the grading pipeline:**
- **Pawtograder**: Each grading run triggers a GitHub Actions workflow that spins up a fresh Docker container. GitHub's infrastructure adds overhead—runners, orchestration, logging—on top of the container itself. The container runs for the duration of grading (typically 1-5 minutes), then is discarded. This is operationally simple but comes with significant infrastructure overhead we don't control.
- **Bottlenose + Orca**: Orca also uses Docker containers, but with less surrounding infrastructure. Orca caches Docker images by SHA hash, avoiding redundant image builds. However, Orca runs on dedicated servers that consume power even when idle, while GitHub amortizes infrastructure costs across millions of users.

For a course with 200 students submitting 3 times per assignment across 10 assignments, that's 6,000 grading runs per semester. The energy difference between "spin up a VM every time" and "reuse cached containers" could be significant—though GitHub's shared infrastructure may amortize the overhead across millions of users.

For a course grading system, these concerns are modest compared to consumer-scale applications. But the principle applies broadly: architectural decisions have energy implications that compound.

### The Tradeoffs Are Real

These quality attributes often conflict:
- Pawtograder's narrow API is highly maintainable but requires the action to do more work (less energy-efficient per run)
- Bottlenose's monolithic architecture is harder to change but can optimize across components
- GitHub Actions' horizontal scaling is effortless but potentially wasteful; Bottlenose's controlled queue is efficient but creates bottlenecks

There's no free lunch. The architect's job is to understand the priorities for a particular system and make informed tradeoffs. For Pawtograder, the priorities are testability (run grading locally without infrastructure) and maintainability (instructors iterate on config without touching the action). For Bottlenose, the priorities may have been different—centralized control, institutional integration, and comprehensive course management.

:::note LO5 checkpoint
You can now analyze how architectural choices affect quality attributes differently for specific scenarios. The same "add language support" change has very different impact depending on whether the system uses domain partitioning (Pawtograder) or technical partitioning in a monolith (Bottlenose).
:::

### Architecture and Team Topologies

In [L22 (Teams and Collaboration)](./l22-teams.md), we discuss Brooks' Law and how communication overhead grows quadratically with team size. Architecture decisions directly affect how teams can be organized—and vice versa.

Consider how different team structures might own different parts of our running examples:

**Pawtograder** has clear ownership boundaries:
- **Instructor**: Owns the solution repo + `pawtograder.yml` (changes weekly)
- **Action maintainers**: Own the Grading Action code (changes monthly)
- **Sysadmin team**: Own the Pawtograder API (changes rarely)

Each team can work relatively independently because the interfaces between them are narrow and stable. Your system's architecture will tend to mirror your team's communication structure.

### Preventing the Big Ball of Mud

We opened with the Big Ball of Mud as the motivating problem. Having now studied several architectural styles and quality attributes, we can be specific about how to prevent it:

- **Discipline and code review** catch architectural violations early
- **Continuous refactoring** pays down technical debt incrementally
- **The coupling and cohesion metrics** from L7-L8 serve as early warning systems
- **Clear ownership** gives someone an incentive to keep each module clean
- **Tests that enforce boundaries** fail when code bypasses the intended architecture
- **Narrow, stable interfaces** (like Pawtograder's two-endpoint API) make violations obvious

The architectural styles we've studied—Hexagonal, Layered, Pipelined, and especially the Modular Monolith—are all answers to the question we started with: *how do we organize our code* so it stays organized over time?
