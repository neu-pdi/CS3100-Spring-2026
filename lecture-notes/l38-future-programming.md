---
sidebar_position: 38
lecture_number: 38
title: "The Future of Programming"
---

In [L1](/lecture-notes/l1-intro), we opened the semester with Grace Hopper and the observation that every generation of programmers redefines what "automatic programming" means — and every generation's skeptics say the same thing: "that's not *real* programming." Compilers weren't real programming. High-level languages weren't real programming. Garbage collection wasn't real programming. Today, the question is whether AI-assisted development is real programming.

In [L37](/lecture-notes/l37-map-reduce), we saw how Google designed MapReduce to let thousands of engineers process data without understanding distributed systems. That's a sustainability story — a programming model that scaled by *hiding* complexity behind a clean abstraction. Today we ask: is AI doing the same thing? And if so, what are the consequences?

## Analyze what AI coding tools actually change about software engineering — and what they don't (15 minutes)

### Every Generation Redefines "Automatic Programming"

:::note Recall
In [L1](/lecture-notes/l1-intro), we discussed Grace Hopper's experience: "I kept getting told that I couldn't do that, because a computer could only do arithmetic. They couldn't write programs." Hopper's compiler was dismissed as "not real programming." The same skepticism greeted every subsequent abstraction: structured programming, object-oriented programming, garbage collection, frameworks, low-code tools.
:::

The pattern repeats: a new tool automates part of the work → practitioners dismiss it ("that's not real programming") → the tool becomes standard → the definition of "programming" shifts upward to the work the tool *can't* do → the next tool arrives.

**Reflection:** Where are we in this cycle with AI coding tools? What's the "work the tool can't do" that defines programming in 2026?

### Brooks' Essential vs. Accidental Complexity

In 1986, Fred Brooks wrote ["No Silver Bullet"](https://en.wikipedia.org/wiki/No_Silver_Bullet) — arguing that no single technology would yield an order-of-magnitude improvement in software productivity. His framework:

**Accidental complexity** is difficulty introduced by our tools and processes — boilerplate syntax, build configuration, API lookups, manual memory management. These can be engineered away. Every past "silver bullet" (compilers, high-level languages, IDEs, frameworks) attacked accidental complexity, and they worked.

**Essential complexity** is the irreducible difficulty of the problem itself — understanding requirements, making architectural tradeoffs, reasoning about edge cases, designing for change, ensuring correctness. If users need 30 features that interact in complex ways, that complexity is *inherent in the problem*, not in the tools.

At [ICSE 2018](https://www.icse2018.org/) — the 40th anniversary of the conference — Brooks acknowledged that AI would change software engineering, but restated his prediction: no single technology would deliver a ten-times productivity gain in ten years. We'll check back in 2028.

AI coding tools are spectacularly effective at removing accidental complexity. Boilerplate, syntax, API lookups, routine test generation, documentation — these are pattern-matching tasks that LLMs excel at. LLM-assisted coding is the closest thing to "goals and constraints" programming that has ever gone mainstream — you describe *what* you want in natural language, and the model figures out *how.* But essential complexity remains: understanding requirements, making architectural tradeoffs, reasoning about edge cases, designing for change. The model can pattern-match against millions of examples of how other people solved these problems, but it cannot tell you whether their solution fits your problem. The hard part was never the syntax.

So why does Brooks' prediction keep holding? Maybe it shouldn't. Maybe AI *has* delivered a 10x improvement on accidental complexity. But we can't see it — because every time tools eliminate one generation's accidental complexity, our expectations for what software should do expand to absorb the gain, expanding the essential complexity.

| Era | Tools | What "a web app" meant |
|-----|-------|----------------------|
| 2000 | Hand-written HTML, CGI scripts | Static pages with a form |
| 2008 | Rails, Django, jQuery | Dynamic CRUD app with a database |
| 2015 | React, Docker, microservices | Real-time SPA with mobile support, CI/CD, monitoring |
| 2020 | Kubernetes, serverless, design systems | Multi-platform, accessible, globally distributed, auto-scaling |
| 2026 | AI-assisted development | All of the above, plus AI features, plus built by a smaller team in less time |

Each generation's tools made the previous generation's software trivial to build. But nobody used the tools to build last generation's software faster — they used them to build *this* generation's software at all. The productivity gain was absorbed by rising expectations.

And here's the twist: **2026 has *more* accidental complexity than 2000, not less.** A 2000 web page had its own accidental complexity: browser incompatibilities, table-based layouts, manual FTP uploads. But a 2026 web application requires Kubernetes, serverless functions, CI/CD pipelines, container registries, CDNs, design systems, accessibility compliance, monitoring dashboards, and infrastructure-as-code. We solved the 2000 problems, and the ambitions those solutions enabled brought *more* accidental complexity than they removed. 

Perhaps this is why Brooks' prediction keeps holding. It's not that we can't eliminate accidental complexity: we're spectacular at it. It's that eliminating accidental complexity *creates room for more essential complexity*, which in turn requires new tooling, which introduces new accidental complexity. In [L36 (Sustainability)](/lecture-notes/l36-sustainability), we called this Jevons' paradox: efficiency gains expand usage rather than reducing cost. Perhaps the 10x gain is real: it's just invisible, because the baseline keeps moving.

In his 2018 keynote at ICSE, Brooks also explained why *The Mythical Man-Month* — published in 1975 — still sells 10,000 copies a year: "The book is not really about technology. It's really about people. The stage keeps changing, but the script doesn't change much." Brooks' prediction keeps holding because tools change (accidental), but people, communication, and the irreducible difficulty of building the right thing — those don't (essential).

**Reflection:** Think about your GA1 project. The features you built — with AI assistance, with JavaFX, with GitHub Actions, with a team — would have been a senior capstone project 15 years ago. Are you "more productive" than those students? Or are you doing something fundamentally more ambitious at roughly the same pace? What parts were accidental complexity (boilerplate, setup, syntax) that AI helped with? What parts were essential complexity (design decisions, debugging integration issues, understanding user needs) that no tool could bypass?

### What AI Actually Changes

Using this framing, here are some examples of what AI coding tools are most likely to change and what they are least:

| AI removes (accidental complexity) | AI doesn't remove (essential complexity) |
|-----------------------------------|----------------------------------------|
| Boilerplate and syntax | Understanding what to build |
| API lookups and documentation search | Designing systems that can evolve |
| Routine test generation | Reasoning about edge cases and failure modes |
| Code translation between languages | Making architectural tradeoffs ([L18](/lecture-notes/l18-architecture-design)) |
| Pattern application (design patterns, idioms) | Evaluating whether the design serves stakeholders ([L9](/lecture-notes/l9-requirements)) |
| First drafts of documentation | Professional responsibility for correctness ([L35](/lecture-notes/l35-safety-reliability)) |

**The throughline for this course:** every lecture focused on the right column. Coupling and cohesion ([L7](/lecture-notes/l7-design-for-change)), architectural quality attributes ([L18](/lecture-notes/l18-architecture-design)), testing strategy ([L15](/lecture-notes/l15-testing)), safety analysis ([L35](/lecture-notes/l35-safety-reliability)), sustainability ([L36](/lecture-notes/l36-sustainability)) — these are essential complexity. AI makes the left column cheaper. The right column is what you're paid for.

## Evaluate the real-world evidence on AI-assisted development and identify when AI helps vs. hinders (20 minutes)

### The Productivity Evidence Is Mixed — But the Perception Gap Is Not

Multiple controlled studies have measured AI coding tool productivity. They disagree on the direction — but agree on one thing: **developers consistently overestimate how much AI helps them.**

| Study | Year | Method | N | Speed effect | Perception |
|-------|------|--------|---|-------------|-----------|
| [METR RCT](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | 2025 | RCT | 16 experienced devs | **19% slower** | Believed 20% faster |
| [Microsoft "Dear Diary"](https://arxiv.org/abs/2410.18334) | 2025 | RCT | 200+ engineers | **No significant change** | 84% reported positive impact |
| [MIT/MS/Accenture](https://mit-genai.pubpub.org/pub/v5iixksv) | 2025 | RCT | 1,974 devs | **+26% PR throughput** | — |
| [Uplevel](https://resources.uplevelteam.com/gen-ai-for-coding) | 2025 | Observational | ~800 devs | No significant change | — |
| [DORA 2025](https://dora.dev/research/2025/dora-report/) | 2025 | Survey | Thousands | +21% individual tasks | **Org delivery flat** |

The METR study got the most attention: 16 experienced open-source developers working on their *own* codebases were 19% slower with AI tools — while believing they were 20% faster, a 39-percentage-point perception gap. But METR later [acknowledged serious selection bias](https://metr.org/blog/2026-02-24-uplift-update/) — developers avoided submitting tasks where they expected AI to help most — and said they no longer trust their own methodology for measuring the size of the effect.

The MIT/Microsoft/Accenture study (n=1,974) found the opposite: a 26% increase in PR throughput. Crucially, **junior developers gained 27–39% while seniors gained only 8–13%.** This makes intuitive sense: AI helps most when you're unfamiliar with the codebase, the API, or the patterns — exactly the accidental complexity that Brooks says can be engineered away.

The resolution: **individual speed and organizational throughput are different things.** DORA and [Faros](https://www.faros.ai/blog/ai-software-engineering) (10,000+ developers) both found the same pattern: individuals produce more PRs, but those PRs are 154% larger with 91% longer review times. The bottleneck shifts from writing to reviewing. Organizations don't ship faster — they just move the queue.

**Reflection:** Have you experienced the perception gap? A moment where AI seemed to help but actually cost you time — because you spent more time evaluating, rejecting, or fixing its output than you would have spent writing the code yourself?

:::note Recall
In [L13](/lecture-notes/l13-intro-ai-agents), we defined "vibe coding" as evaluating AI output only by execution ("does it seem to work?") without reading or understanding the generated code. We identified it as a trap that creates "learning debt — gaps in fundamental understanding masked by functional code, leading to long-term productivity collapse."
:::

"Vibe coding" has become a mainstream term — Collins Dictionary's Word of the Year 2025. But the concept has evolved into a spectrum:

| Level | Description | When likely appropriate |
|-------|------------|-----------------|
| **Pure vibe coding** | Accept AI output if it runs. Don't read the code. | Throwaway prototypes, personal scripts you'll delete |
| **Assisted implementation** | AI generates, you review and modify. L13's 6-step workflow. | Most development work — the course's recommended approach |
| **AI-informed design** | You design; AI helps explore options and implement. | Architectural decisions, complex integrations |
| **Manual implementation** | No AI. You write every line. | Learning new concepts, safety-critical code |

**Reflection:** Where on this spectrum did you work during GA1? During GA2? Did it change as the project got more complex? Where *should* it have been?

The quality evidence is less ambiguous than the speed evidence — and it's not good:

| Study | Method | Key finding |
|-------|--------|------------|
| [CodeRabbit](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) (2025) | 470 PRs, observational | AI-coauthored code: 1.7x more issues, 2.74x more XSS vulnerabilities |
| [Uplevel](https://resources.uplevelteam.com/gen-ai-for-coding) (2025) | ~800 devs, observational | **+41% bug rate** for Copilot users |
| [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research) (2025) | 211M lines, longitudinal | Code churn nearly doubled (3.1% → 5.7%); copy-pasted code up 48% |
| [Stanford/Boneh](https://dl.acm.org/doi/abs/10.1145/3576915.3623157) (2023) | 47 participants, controlled | AI-assisted code less secure; developers *more confident* it was secure |
| ["Debt Behind the AI Boom"](https://arxiv.org/html/2603.28592v1) (2026) | 304K commits, 6,275 repos | 15%+ of AI commits introduce issues; 24% of those issues survive unfixed |

The pattern: AI-generated code ships faster but accumulates defects and technical debt. Developers using AI are *more confident* in their code's quality despite it being *less secure* — the perception gap again.

This doesn't mean "don't use AI." It means the review step in L13's workflow is not optional — it's where the quality comes from.

The [2025 DORA Report](https://dora.dev/research/2025/dora-report/) confirmed this at organizational scale: **AI is a multiplier of existing engineering conditions.** Teams with strong engineering practices (CI/CD, code review, testing culture) saw productivity gains from AI tools. Teams without those practices saw AI amplify their existing problems — more code shipped faster, but with more defects, more rework, and more incidents. This is Brooks' prediction validated empirically: AI removes accidental complexity, but if your essential complexity is unmanaged (poor architecture, missing tests, unclear requirements), AI just helps you produce unmanageable code faster.

### Learning Debt Is a Sustainability Problem

In [L13](/lecture-notes/l13-intro-ai-agents), we introduced "learning debt" as gaps in understanding masked by functional code. In [L36](/lecture-notes/l36-sustainability), we learned that sustainability has four dimensions: technical, economic, environmental, and social. Learning debt is a sustainability challenge across all four.

**Technical sustainability:** Code you don't understand is code you can't maintain. When the AI-generated implementation breaks six months from now, will you be able to debug it? If not, you've created technical debt indistinguishable from inheriting an undocumented legacy system — except *you* wrote it. The codebase is technically unsustainable because the knowledge to evolve it was never acquired.

**Economic sustainability:** An engineer who vibe-coded their way through year one may ship fast initially. But when they can't debug, can't architect, can't evaluate tradeoffs, the team absorbs the cost. The [productivity studies](#the-productivity-evidence-is-mixed--but-the-perception-gap-is-not) showed this at the individual level — feeling fast while being slow. At the organizational level, learning debt compounds: teams that skip understanding today pay with slower, more error-prone work tomorrow.

**Social sustainability:** The entry-level job crisis (next section) hits hardest when graduates can produce artifacts but lack the judgment to evaluate them. If AI replaces the tasks that historically built foundational expertise — and learning debt means that expertise was never developed through other means — then the pipeline of capable senior engineers narrows. This is a *generational* sustainability problem: who will review the AI's output in five years if no one learned how?

**Environmental sustainability:** Learning debt drives Jevons' paradox in development itself. Developers who don't understand performance characteristics generate more code, run more builds, consume more compute to iterate on solutions they could have reasoned through. The "try it and see" loop that characterizes vibe coding is *computationally expensive* — and at scale, measurably wasteful.

The "learning tax" strategy from [L13](/lecture-notes/l13-intro-ai-agents) — deliberately implementing some things manually even when AI could generate them — is not just a pedagogical trick. It's a sustainability investment. Like [L35](/lecture-notes/l35-safety-reliability)'s Swiss cheese layers, the knowledge you build through deliberate practice is a defense layer. Remove it, and the holes in every other layer get more dangerous.

**Reflection:** Did you accumulate learning debt this semester? Is there a concept you relied on AI for that you couldn't explain to your TA? What would it take to pay that debt down — and is it worth doing before you graduate?

### The Entry-Level Job Question

A [Stanford Digital Economy Lab study](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/) (Brynjolfsson et al., 2025), analyzing ADP payroll records for millions of U.S. workers, found that employment for software developers ages 22–25 declined nearly 20% from its late-2022 peak through mid-2025. Across all highly AI-exposed occupations, early-career employment fell 13%. The mechanism is reduced hiring, not layoffs — companies stopped backfilling junior positions.

There are two ways to read this:

**The pessimistic read:** AI is eliminating entry-level positions. The jobs that historically served as on-ramps into software careers — writing simple data manipulation endpoints, fixing minor bugs, implementing well-specified features — are exactly the jobs AI does well. The ladder you were going to climb is losing its bottom rungs.

**The optimistic read:** Every major productivity improvement in software history — compilers, frameworks, CI/CD — has resulted in *more* software being built, not fewer people employed. The roles shift upward. The question is whether your education prepared you for the roles that remain.

**Reflection:** Which read do you find more convincing? What evidence would change your mind? What skills from this course are most relevant to the "roles that remain"?

### Parnas: Regulate the Software, Not the Label

David Parnas — the inventor of information hiding ([L6](/lecture-notes/l6-immutability-abstraction)) — argued in his [ICSE 2025 keynote](https://www.youtube.com/watch?v=YyFouLdwxY0) that the "AI regulation" debate asks the wrong question. The issue isn't whether something is "AI." The issue is whether software makes consequential decisions about people's lives, and whether the tradeoffs are visible and accountable.

A `for` loop that processes loan applications can deny people housing. A neural network that does the same thing can also deny people housing. The technology is different; the responsibility is the same.

**Reflection:** You used AI to help write code this semester. If that code had a bug that affected a real user — say, Pawtograder's autograder assigned a zero because of AI-generated error handling that silently swallowed an exception — who is responsible? You? The AI company? The course staff who approved the tool?

This connects directly to [L35](/lecture-notes/l35-safety-reliability): if you use AI to generate safety-critical code and cannot evaluate the output, you have removed a Swiss cheese layer (human code review) without adding a replacement. The blast radius doesn't care how the code was produced.

### Your Course AI Policy Arc Was a Model

This course's AI policy wasn't arbitrary — it was a curriculum design:

| Phase | Policy | Rationale |
|-------|--------|-----------|
| Weeks 1-4 (A1, A2) | **Not allowed** | Build foundational skills before you have AI to evaluate |
| Week 5 (L13, A3) | **Introduced** | 6-step workflow, noisy amplifier framing, learning tax |
| Weeks 6-11 (A4, A5) | **Encouraged** | AI for implementation; you own the design and review |
| Weeks 12-15 (GA1, GA2) | **Encouraged with accountability** | TA meetings verify you understand your own code |

This mirrors one increasingly common viewpoint of how AI should be adopted in professional settings: build competence first, then introduce tools, then use them with accountability structures. 

**Reflection:** Did the policy arc work for you? Was there a moment when you realized you could evaluate AI output that you couldn't have evaluated in Week 1? What was the turning point?

## Identify durable skills and concrete next steps for continuous learning (15 minutes)

### Trends Worth Watching

Beyond AI, several trends are reshaping what software engineers need to know:

**Memory safety as policy:** You've written software in Java and Python — both memory-safe languages. You've never had a use-after-free bug or a buffer overflow. That's not because you're careful; it's because the language won't let you make those mistakes. But most of the world's critical infrastructure — operating systems, browsers, network stacks, embedded systems — is written in C and C++, which *will* let you make them. Microsoft and Google both independently found that **~70% of all security vulnerabilities** in their codebases are memory safety issues.

The policy world has noticed. The White House [called out C and C++ by name](https://www.whitehouse.gov/oncd/briefing-room/2024/02/26/press-release-technical-report/) in February 2024, urging developers to adopt memory-safe languages. CISA and the FBI followed with formal guidance listing memory-unsafe languages as a ["bad practice"](https://www.cisa.gov/resources-tools/resources/product-security-bad-practices) for new development, with a January 2026 deadline for vendors to publish memory safety roadmaps. Java is on CISA's approved list — but Rust is the language getting the most attention because it achieves memory safety *without* garbage collection, making it viable for the systems code (kernels, drivers, firmware) where Java can't go. [45% of organizations](https://byteiota.com/rust-2025-survey-45-5-adoption-41-6-worry-complexity/) now use Rust in production. Microsoft has begun rewriting Windows kernel components in Rust. The Linux kernel, Android, and Windows all ship Rust code. Language choice is becoming a regulatory and liability decision, not just a technical preference — and if you take [CS 3650](https://course.khoury.northeastern.edu/cs3650/) (Systems), you'll encounter this firsthand.

**WebAssembly beyond the browser:** Wasm is quietly becoming a third runtime option alongside containers and VMs. Cloudflare Workers, Fastly Compute, and Vercel all run Wasm at the edge — with **zero cold-start time** and roughly **1/10th the memory** of a Node.js process. Akamai's [acquisition of Fermyon](https://siliconangle.com/2025/12/01/akamai-acquires-webassembly-function-service-startup-fermyon/) (December 2025) signals that CDN/edge providers see Wasm as core infrastructure. American Express runs one of the largest commercial FaaS deployments on Wasm, replacing containers. Figma uses Wasm for design tool rendering; Zoom and Google Meet use it for video processing.

Why does this matter? Wasm is a universal compile target — write in Rust, Go, C++, or TypeScript, compile to Wasm, run anywhere (browser, edge, server, embedded). The [WASI Component Model](https://component-model.bytecodealliance.org/) (finalizing in 2026) lets Wasm modules compose across language boundaries like libraries. This is information hiding ([L6](/lecture-notes/l6-immutability-abstraction)) applied at the runtime level: the module's interface is its contract, and the implementation language is hidden. It connects to [L21 (Serverless)](/lecture-notes/l21-serverless) — Wasm is what makes sub-millisecond serverless possible — and to [L33 (Event-Driven Architecture)](/lecture-notes/l33-event-architecture) — edge Wasm workers are event-driven by design, processing millions of requests at the network edge instead of routing them to a central server. The [L36 (Sustainability)](/lecture-notes/l36-sustainability) angle: 10x less memory per request means 10x less energy at scale (but: now do you use 10x as many requests?).

**AI agents as production software:** You've used AI as a coding assistant ([L13](/lecture-notes/l13-intro-ai-agents)). The next shift: AI agents as autonomous software components that take actions in production — calling APIs, modifying databases, managing infrastructure. [57% of organizations](https://www.langchain.com/state-of-agent-engineering) now have AI agents running in production. Anthropic's [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) hit 97 million monthly SDK downloads by early 2026, with adoption by OpenAI, Microsoft, and AWS. It's becoming the standard for connecting AI agents to external tools — the HTTP of the agent world.

But the failure rate is sobering. In December 2025, an AI coding agent at Amazon [autonomously deleted and recreated a live production environment](https://www.ruh.ai/blogs/amazon-kiro-ai-outage-ai-governance-failure), causing a 13-hour outage. [88% of organizations](https://www.helpnetsecurity.com/2026/03/03/enterprise-ai-agent-security-2026/) report confirmed or suspected AI agent security incidents. The organizations succeeding with AI agents are the ones applying classical software engineering discipline to a new class of component.

**Formal verification + AI:** Martin Kleppmann [argues](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html) that AI will make formal verification mainstream — not by replacing it, but by making proof generation cheap enough to be practical. If AI generates code we can't fully review, *proving* correctness becomes more valuable than *testing* for it. This extends [L15](/lecture-notes/l15-testing)'s testing spectrum: unit tests → integration tests → E2E tests → formal proofs.

**Reflection:** Which of these trends affects your career most directly? Which connects most strongly to a concept from this course?

### Learning Agility: The Skill Behind All Skills

Whatever trends emerge, one thing is certain: **the ability to learn new things quickly is your most durable asset.** Languages change, frameworks come and go, paradigms shift — but the meta-skill of learning itself compounds over your entire career.

Throughout this course, you practiced learning agility without perhaps naming it:
- You learned a new language (Java) and its ecosystem
- You adapted to new architectural concepts (hexagonal architecture, MVVM, event-driven architecture)
- You learned to work with AI coding tools using a structured workflow
- You figured out how to debug problems you'd never seen before
- You worked on a team with people who think differently than you

### What to Study Next

| If you're interested in... | Take... | Why |
|---------------------------|---------|-----|
| Distributed systems, consensus, fault tolerance | [CS 4730](https://4730.network/) | Formalize the concurrency and consistency from L31-L33 |
| Systems programming, memory safety, performance | [CS 3650](https://course.khoury.northeastern.edu/cs3650/) | Understand what Java hides — and why Rust exists |
| Security, supply chain, trust boundaries | [CS 3700](https://3700.network/) | Extend L20's security model to network-level attacks |
| Accessibility, inclusive design | [CS 4973](https://actlab.sites.northeastern.edu/teaching/) | Deepen L28's accessibility principles |
| AI/ML systems and their engineering | [CS 4100](https://catalog.northeastern.edu/search/?P=CS+4100) | Understand the tools you're using from the inside |
| Open source, real-world software at scale | [CS 4535: Software Design & Delivery](https://neu-se.github.io/cs4535-public-resources/) | Apply everything from this course to Pawtograder itself |

### The Course Arc: From Programming to Engineering

| Lecture Arc | What It Taught | What It Sustains |
|------------|---------------|-----------------|
| L1-L4: Java, contracts, specifications | Write code that means what it says | Correctness over time |
| L5-L8: Readability, coupling, SOLID | Write code others can change | Maintainability over years |
| L9, L12: Requirements, domain modeling | Build the right thing | Value over project lifetime |
| L13: AI agents | Use tools without outsourcing judgment | Competence over career |
| L15-L16: Testing, testability | Know when code is wrong | Confidence over every commit |
| L18-L21: Architecture, networks, serverless | Build systems that survive change | Adaptability over organizational lifetime |
| L22-L23: Teams, open source | Work with humans and communities | Collaboration over industry lifetime |
| L28-L30: Accessibility, GUI, MVVM | Build for all users | Inclusivity over societal timescale |
| L31-L33: Concurrency, async, events | Handle complexity at scale | Scalability under load |
| L34-L36: Performance, safety, sustainability | Don't harm users | Responsibility over consequences |
| L37: MapReduce | See it all in one real system | Synthesis |
| **L38: Today** | **What endures when everything else changes** | **Learning agility over career** |

### The Future Is Unwritten

We don't know what programming will look like in 10 years. AI might write most routine code. New paradigms might emerge. The problems worth solving will certainly change.

What we do know: the people who thrive will be those who can learn what's needed, adapt when things change, work effectively with others, and bring clear thinking to complex problems. Those are the skills this course has tried to develop — not because they're "soft skills" separate from "real" technical work, but because they *are* technical work, viewed over time.

**Final reflection:** What's one thing you learned this semester that you didn't expect to learn? What's one thing you want to learn next?

### Want to go deeper?

- **Fred Brooks, ["No Silver Bullet"](https://en.wikipedia.org/wiki/No_Silver_Bullet)** — The essential vs. accidental complexity framework (1986, still relevant)
- **Fred Brooks, [ICSE 2018 Keynote](https://www.icse2018.org/)** — Brooks traces the history of software engineering from 1944 to 2018 and restates "No Silver Bullet" for the next decade
- **David Parnas, [ICSE 2025 Keynote](https://www.youtube.com/watch?v=YyFouLdwxY0)** — Regulate critical software, not "AI"
- **[METR Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)** and [follow-up](https://metr.org/blog/2026-02-24-uplift-update/) — The RCT that found experienced devs 19% slower, then the honest self-correction on methodology
- **[MIT/Microsoft/Accenture Field Experiments](https://mit-genai.pubpub.org/pub/v5iixksv)** — The largest RCT (n=1,974): juniors +27-39%, seniors +8-13%
- **["Debt Behind the AI Boom"](https://arxiv.org/html/2603.28592v1)** — 304K commits analyzed: AI-generated code accumulates technical debt faster (March 2026)
- **[Brynjolfsson et al., "Canaries in the Coal Mine?"](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/)** — Stanford Digital Economy Lab study on AI and entry-level employment
- **Martin Kleppmann, ["AI Will Make Formal Verification Mainstream"](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html)** — The next frontier in correctness
- **[2025 DORA Report](https://dora.dev/research/2025/dora-report/)** — AI as multiplier of existing engineering conditions
- **[CS 4535: Software Design & Delivery](https://neu-se.github.io/cs4535-public-resources/)** — Apply these principles to real open-source software next semester
