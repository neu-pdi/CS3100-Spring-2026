---
sidebar_position: 36
lecture_number: 36
title: "Sustainability"
---

In [L35](/lecture-notes/l35-safety-reliability), we asked "who profits from a design decision, and who bears the risk?" Boeing sold sensor redundancy as an optional upgrade. Budget airlines saved money; passengers bore the risk without knowing it. That question — who benefits, who pays, and over what time horizon — is the core question of **sustainability.**

In [L1](/lecture-notes/l1-intro), we defined software engineering as "the integral of programming over time." Every lecture since has been about what that integral measures: readability over time ([L5](/lecture-notes/l5-fp-readability-reusability)), changeability over time ([L6](/lecture-notes/l6-immutability-abstraction), [L7](/lecture-notes/l7-design-for-change)), correctness over time ([L15](/lecture-notes/l15-testing)), performance over time ([L34](/lecture-notes/l34-performance)), safety over time ([L35](/lecture-notes/l35-safety-reliability)). Today we name the thing the integral computes: **sustainability** — the preservation of long-term beneficial use of software, and its appropriate evolution, in a context that continuously changes.

## Define software sustainability as a meta-quality attribute and connect it to the semester's recurring themes (10 minutes)

### Sustainability Is Not a Quality Attribute — It Is the Quality Attribute About Quality Attributes

Throughout the semester, you've learned quality attributes: performance ([L34](/lecture-notes/l34-performance)), safety ([L35](/lecture-notes/l35-safety-reliability)), scalability ([L19](/lecture-notes/l19-monoliths)), changeability ([L6](/lecture-notes/l6-immutability-abstraction)), usability ([L24](/lecture-notes/l24-usability)), accessibility ([L28](/lecture-notes/l28-accessibility)). Sustainability asks a different question: **will those quality attributes hold up over time, and for whom?**

A system can be performant today and unsustainable tomorrow — if the optimization technique creates technical debt that makes future changes impossible. A system can be accessible today and exclusionary next year — if the team that understood WCAG compliance leaves and no one maintains it. A system can be safe today and dangerous at scale — if the blast radius grows while the Swiss cheese layers stay the same ([L35](/lecture-notes/l35-safety-reliability)).

Sustainability is not a feature you add in Sprint 4. Like safety, it is a property that emerges from how every other decision is made. The difference: safety asks "what happens when this fails?" Sustainability asks "what happens when this succeeds — at scale, over years, across stakeholders you haven't met yet?"

### You've Been Building Sustainability Mechanisms All Semester

You didn't learn "sustainability tools" separately. You learned tools that *produce* sustainability when applied consistently:

| What you learned | Where | What it sustains |
|-----------------|-------|-----------------|
| Information hiding | [L6](/lecture-notes/l6-immutability-abstraction) | **Changeability** — hidden internals can evolve without breaking clients |
| Low coupling | [L7](/lecture-notes/l7-design-for-change) | **Independence** — modules can be maintained, replaced, or scaled independently |
| SOLID principles | [L8](/lecture-notes/l8-design-for-change-2) | **Evolvability** — code resists "software rot" as requirements change |
| Hexagonal architecture | [L16](/lecture-notes/l16-testing2) | **Vendor independence** — swap infrastructure without rewriting domain logic |
| Open source evaluation | [L23](/lecture-notes/l23-oss) | **Supply chain health** — dependencies that won't be abandoned or relicensed |
| Accessibility | [L28](/lecture-notes/l28-accessibility) | **Inclusivity** — system serves diverse and growing user populations |
| Staged rollout | [L35](/lecture-notes/l35-safety-reliability) | **Blast radius control** — failures don't cascade to every user simultaneously |

The recurring theme: **decisions that seem like "good engineering practice" in the short term are sustainability investments in the long term.** The converse is also true: shortcuts that seem harmless today become sustainability debts that compound.

:::note Recall
In [L4 (Specifications)](/lecture-notes/l4-specs-contracts), we saw that ambiguous specifications create a "hidden decision factory" — implementers make choices the spec didn't address, and those choices compound into maintenance burden. In [L9 (Requirements)](/lecture-notes/l9-requirements), we saw that the cost of fixing a requirements error grows from 1x during requirements gathering to 100x after deployment. Both are sustainability stories: the cost of a decision grows with time.
:::

## Apply the four dimensions of sustainability to evaluate design trade-offs in familiar systems (12 minutes)

### The Four Dimensions

Sustainability is not one thing. It has four dimensions that interact and sometimes conflict:

**Technical sustainability:** Can the system be maintained and evolved? This is the dimension you've spent the most time on this semester. Low coupling, high cohesion, testability, readable code, clear contracts — all serve technical sustainability. SceneItAll's hexagonal architecture ([L16](/lecture-notes/l16-testing2)) lets the team swap the Zigbee adapter for a Matter adapter without rewriting the scene activation logic. That's technical sustainability.

**Economic sustainability:** Is the total cost of ownership viable? This goes beyond hosting costs. It includes developer time to maintain, cost of dependencies (both monetary and lock-in risk), support burden, and the opportunity cost of not building something else. Pawtograder's choice to use GitHub Actions for autograding is economically sustainable while the free tier covers the volume — but if usage grows past the free tier, we're locked into GitHub's pricing. And if GitHub changes their API, every autograder integration breaks.

:::note Recall
In [L23 (Open Source)](/lecture-notes/l23-oss), we discussed how OpenSSL — securing most of the internet's connections — was maintained by a handful of volunteers until the Heartbleed vulnerability exposed how underfunded critical infrastructure can be. Economically unsustainable open source projects are a supply chain risk for everyone who depends on them.
:::

**Environmental sustainability:** What resources does the system consume, and what externalities does it create? This includes direct compute costs (energy, hardware, cooling) and indirect effects (does the system enable behaviors that consume resources?). We'll explore this dimension in depth with Jevons' paradox below.

**Social sustainability:** Does the system serve people well — including people who aren't direct users? This includes accessibility ([L28](/lecture-notes/l28-accessibility)), inclusivity, fairness, privacy, and effects on indirect stakeholders. SceneItAll's usage analytics reveal when a home is occupied — not a concern at 50 beta homes, but a potential burglary-risk or insurance-discrimination vector at 100,000 homes.

Social sustainability also includes **data sovereignty** — the principle that communities should control their own data. One of the most widely used datasets in machine learning — known as [`PimaIndiansDiabetes2`](https://search.r-project.org/CRAN/refmans/mlbench/html/PimaIndiansDiabetes.html) in R's `mlbench` package, based on [Smith et al. 1988](https://pmc.ncbi.nlm.nih.gov/articles/PMC2245318/) — was collected from the [Akimel O'odham](https://www.gilariver.org/index.php/about/history) ("River People"), the community colonizers misnamed "Pima." In the late 1800s, [non-Native settlers and canal companies diverted the Gila River](https://uapress.arizona.edu/book/diverting-the-gila) with federal complicity, destroying the community's agricultural livelihood — they had grown over a million pounds of wheat in 1862 — and triggering [a famine that lasted from roughly 1880 to 1920](https://irp.nih.gov/catalyst/29/6/nihs-work-with-native-communities-drives-diabetes-research). The forced dietary shift from traditional agriculture to government commodity foods (canned goods, flour, lard) produced an epidemic of obesity and diabetes. Decades later, in 1965, [NIH researchers arrived to study the resulting diabetes epidemic](https://irp.nih.gov/catalyst/29/6/nihs-work-with-native-communities-drives-diabetes-research) — a health crisis whose roots traced back to the same government now studying it. The community was studied for over 40 years (the study was originally planned for 10). Their health data has been used in thousands of ML papers and tutorials since 1988 — the Smith et al. paper alone has [thousands of Google Scholar citations](https://scholar.google.com/scholar?cites=14207845629667967937), and the Kaggle version has been downloaded over 780,000 times. The dataset name erases the people; ChatGPT describes it as "an accessible and influential benchmark" without mentioning the famine, the water diversion, or the community that still lives with the consequences.

As [Dr. Kylie Ariel Bemis](https://kuwisdelu.github.io/letter-on-public-data.html) — an enrolled member of the Zuni people and a faculty member here at Khoury — argues in her open letter on public data: datasets are not neutral artifacts. They carry the context of their collection, and stripping that context is itself a form of harm. The harm is not just "no benefits" — it is extraction during crisis, erasure of context, and a system that converts human suffering into a convenient CSV file. When we talk about training data, we are talking about people — and the systems we build determine whether those people are treated as stakeholders or as raw material.

### The Dimensions Interact

The dimensions are not independent. Improving one can worsen another:

| Decision | Technical | Economic | Environmental | Social |
|----------|-----------|----------|---------------|--------|
| Migrate SceneItAll from monolith to microservices | Better: independent deployment, team autonomy | Worse: operational complexity, more infrastructure | Worse: network overhead, container sprawl ([L20](/lecture-notes/l20-networks)) | Neutral |
| Add WCAG accessibility to SceneItAll app | Moderate effort | Higher dev cost | Neutral | Better: inclusive design ([L28](/lecture-notes/l28-accessibility)) |
| Switch to serverless for SceneItAll cloud | Moderate: vendor-specific APIs | Better: pay-per-use, scale-to-zero ([L21](/lecture-notes/l21-serverless)) | Mixed: no idle waste, but cold start overhead | Worse: vendor lock-in limits who can self-host |
| Keep all device telemetry forever | Simpler: no retention policy | Worse: storage costs grow linearly | Worse: storing data consumes energy | Worse: privacy risk grows with data volume |

No decision optimizes all four dimensions simultaneously. Sustainability analysis is about making the trade-offs *visible* — not about finding the "right" answer.

Why do organizations default to single-dimension thinking? The historian of quantification [Theodore Porter explains](https://press.princeton.edu/books/paperback/9780691208411/trust-in-numbers): quantitative information is *portable*. A dashboard number — 99.9% uptime, 85% code coverage, 200ms p99 latency — travels from the engineering team to the VP to the board without needing shared context. But as [C.T. Nguyen puts it](https://www.penguinrandomhouse.com/books/735252/the-score-by-c-thi-nguyen/): "We're getting portability at the price of nuance." The uptime number doesn't show if the 0.1% downtime was concentrated during finals week when students needed Pawtograder most. The code coverage number doesn't show that the uncovered 15% is the error-handling logic where bugs actually live. Sustainability analysis is an attempt to resist that compression — to keep the four-dimensional view visible even when it's harder to put on a dashboard.

## Recognize how efficiency gains can increase total resource consumption, and identify cascading effects of design decisions (10 minutes)

### Jevons' Paradox: Efficiency Is Not Sustainability

In 1865, economist William Stanley Jevons observed that as coal-burning engines became more efficient, total coal consumption *increased* rather than decreased. Efficiency made coal-powered activities cheaper, which expanded their use faster than the per-unit savings.

The same pattern appears throughout software:

| Technology | Per-unit efficiency gain | What happened to total consumption |
|-----------|------------------------|-----------------------------------|
| Cloud computing | Dramatically cheaper per compute-hour | Total cloud energy consumption has skyrocketed |
| Web compression + CDNs | Faster delivery per byte | Average webpage grew from ~100KB (2003) to ~4MB (2025) |
| CI/CD automation | Cheaper per build | Organizations run vastly more builds than when builds were manual |
| LLM inference | Cheaper per token each quarter | Total AI compute growing far faster than efficiency gains |

**SceneItAll example:** More efficient firmware updates (faster Zigbee transfer, smaller deltas) don't mean less total update traffic — they mean the team pushes updates more frequently. The per-update cost dropped 5x; the update frequency increased 10x; total update traffic doubled.

**Pawtograder example:** Efficient automated grading enables unlimited submissions. Students submit 3-12k times per day across the course. Each submission triggers a container spin-up, test execution, and result reporting. The per-submission cost is small; the total compute is significant. Before Pawtograder, students submitted once or twice and a human graded it. The *system* is more efficient; the *total resource consumption* is higher.

The implication: **optimizing per-unit efficiency is necessary but not sufficient for environmental sustainability.** You also need to ask: "Will this efficiency enable usage patterns that increase total consumption?" If yes, that's not a reason to avoid the optimization — but it is a reason to design with consumption budgets, rate limits, and awareness of the rebound effect.

Here is a useful diagnostic: distinguish *goals* from *purposes*. In a card game, the goal is to win, but the purpose of playing with your friends is to have fun. Healthy players know the difference. What happens when a system's goal displaces its purpose? The *purpose* of making Pawtograder submissions efficient was to help students learn. The *goal* became minimizing per-submission cost. When the goal succeeds, it enables 12,000 submissions per day — and the purpose (deep learning) may be undermined as students use the autograder as a debugger instead of reasoning about their code. Digital sufficiency (Lago's question: "Should we build this at all?") is the practice of remembering the purpose and asking whether the goal still serves it.

### LLMs: Jevons' Paradox in Real Time

You are experiencing Jevons' paradox right now. Vendor-published API list prices have fallen across model generations even as total inference volume has surged. For a time-stamped, citable snapshot: Anthropic's official API pricing table lists Claude Opus 4.1 at $15 / $75 per million input/output tokens and Claude Opus 4.6 at $5 / $25 for the same ([Anthropic API pricing](https://docs.anthropic.com/en/docs/about-claude/pricing), retrieved 2026-03-31) — about 3× lower per million tokens on those flagship tiers. Lower published per-token prices can coexist with exploding aggregate use and spend.

Consider the economics of the tools you use in this course:

Anthropic's consumer documentation lists Max 5x at \$100/month and Max 20x at \$200/month and states that those plans include access to Claude Code ([What is the Max plan?](https://support.anthropic.com/en/articles/11049741-what-is-the-max-plan), checked 2026-03-31). The same vendor's metered API rates appear on the [API pricing table](https://docs.anthropic.com/en/docs/about-claude/pricing) above. Illustrative classroom estimate (approx., as of 2026-03-31): if you priced a very heavy individual coding workflow at published list API rates for premium models, a ~\$5,000/month order of magnitude is plausible on the 20x plan for back-of-envelope discussion — but it is not an official bill or guarantee; real API spend depends on models, tokens, caching, batching, and contract discounts. The strategic pattern still matches Jevons: subscription pricing can expand usage (and future revenue at scale) relative to pay-as-you-go list rates.

Every prompt hits GPU clusters, but per-query energy is not a single settled number. Early popular summaries often cited on the order of ~10× more energy than a conventional web search; those figures trace to early lifecycle-style estimates that newer analyses argue often overstated real serving energy (see the discussion and sources in [Vanderbauwhede's updated comparison](https://wimvanderbauwhede.github.io/articles/google-search-vs-chatgpt-emissions/)). Oviedo et al. ([arXiv:2509.20241](https://arxiv.org/abs/2509.20241), Sep 2025) estimate a median ~0.34 Wh per query (with wide spread) for large frontier models under realistic production-style assumptions and report that naive non-production extrapolations can overstate energy by ~4–20×. Treat any fixed multiplier (e.g. "10× a Google search") as time-bound and scenario-dependent, not a physical constant. When you ask an AI coding agent to "try a few approaches and see what works," you are still consuming meaningful compute at scale across millions of users — even if the exact factor vs a search engine is uncertain.

This doesn't mean you should stop using LLMs — the productivity gains are real. It means you should understand the full cost stack:

| Cost layer | Who pays | Who benefits |
|-----------|---------|-------------|
| GPU hardware + energy | Cloud providers (passed to AI companies) | Developers using the tools |
| Training data creation | Original authors (often unconsented); content labelers ([Kenyan workers paid $2/hr](https://time.com/6247678/openai-chatgpt-kenya-workers/) to remove toxic content) | AI companies + users |
| Subsidy gap (\$200 vs \$5,000 estimate) | AI company investors (for now) | Individual developers |
| Environmental externality | Everyone (carbon emissions) | Direct users of the service |
| Labor displacement risk | Workers in affected roles | Companies reducing headcount |

This is L35's "who profits, who bears the risk?" applied to the tools you use every day. The people benefiting from cheap LLM access are not the same people bearing the environmental and labor costs. That distributional mismatch is a sustainability concern.

:::note
In [L13](/lecture-notes/l13-intro-ai-agents), we discussed AI as a "noisy amplifier" — it amplifies expertise but also amplifies errors. The sustainability lens adds another dimension: it amplifies *resource consumption*. An AI coding agent that generates and discards 10 approaches to find one that works has consumed 10x the compute of a developer who writes the correct approach directly. The efficiency gain (faster for the developer) can mask the consumption increase (more total compute).
:::

### First, Second, and Third-Order Effects

Software design decisions cascade in ways that are hard to predict:

**First-order effects** are direct: SceneItAll's hub consumes X watts of power. Pawtograder's autograder uses Y compute-hours per semester.

**Second-order (enabling) effects** emerge from what the system makes possible: SceneItAll makes it trivially easy to leave lights on (one-tap "All On" scene) — convenience that may increase household energy use. Pawtograder's unlimited submissions change how students learn — they can use the autograder as a debugger rather than thinking through their code first.

**Third-order (systemic) effects** reshape the broader context: Smart home data — aggregated across millions of homes — becomes valuable for insurance companies, advertisers, and law enforcement in ways individual homeowners never consented to. Automated grading at scale reshapes pedagogy: if every assignment can be auto-graded, courses gravitate toward auto-gradeable assignments, potentially narrowing what students learn.

| Order | SceneItAll | Pawtograder | LLM coding agents |
|-------|-----------|-------------|-------------------|
| **First** (direct) | Hub uses power; cloud service uses compute | Autograder uses compute per submission | GPU inference per prompt |
| **Second** (enabling) | Convenience may increase energy use; data reveals occupancy | Unlimited submissions change study habits | Developers write more code, explore more approaches |
| **Third** (systemic) | Smart home data reshapes insurance, surveillance | Auto-gradeable assignments narrow curriculum | Software labor market restructures; codebases grow faster than teams can maintain |

The Pima diabetes dataset illustrates all three orders in one story. **First order:** NIH researchers collect health data from the Akimel O'odham community during a famine the US government caused. **Second order:** the data becomes a convenient ML benchmark — small, clean, binary classification — and appears in every textbook and tutorial, detached from its origins. **Third order:** the dataset becomes infrastructure. Thousands of papers cite it. ML courses teach it. The community's suffering is laundered into a `.csv` file with a name that erases them. No individual researcher intended this — but the system they collectively built converts a community's health crisis into an industry resource. That is a systemic effect.

You cannot predict all second- and third-order effects. But you can ask: "If this system is wildly successful, what behaviors does it enable, and who is affected?" That question — asked early and revisited as the system scales — is how you catch cascading effects before they become entrenched.

## Evaluate who benefits and who bears risk in software design trade-offs (18 minutes)

### The Veil of Ignorance: A Design Heuristic

Philosopher John Rawls proposed a thought experiment: design the rules of a society as if you don't know which position you'll occupy in it. If you don't know whether you'll be rich or poor, abled or disabled, majority or minority, you'll design fairer rules — because any rule that disadvantages a group might disadvantage *you.*

Applied to software design, the veil of ignorance becomes a concrete heuristic: **design as if you don't know which stakeholder you'll be.**

For SceneItAll: "If you might be any of these people, would you accept this design?"
- The developer maintaining the codebase 3 years from now
- The user with a visual impairment using the app with a screen reader
- The homeowner in a developing country with intermittent internet
- The person whose occupancy data is sold to an insurance company
- The homeowner locked out during a firmware update gone wrong

For Pawtograder: "If you were randomly assigned to be any stakeholder, would you accept the current design?"
- A student at Northeastern with fast internet and a modern laptop
- A student at a community college with limited IT support trying to self-host Pawtograder
- A student with a disability who needs accessible feedback formats
- A TA grading 200 submissions during finals week
- A student who receives a zero because the autograder crashed ([L35](/lecture-notes/l35-safety-reliability))

The veil of ignorance doesn't tell you what to build. It tells you which trade-offs deserve extra scrutiny — the ones where the people benefiting and the people bearing risk are different groups. This is the same distributional question from L35, generalized into a design practice.

### Worked Example: Pawtograder Through the Four Dimensions

Let's apply all four sustainability dimensions to a system you know well.

**Technical sustainability:**
- Open-source, modular design ([L16](/lecture-notes/l16-testing2) hexagonal architecture) — any institution can inspect, modify, and contribute back
- GitHub Actions as CI — standard tooling reduces custom infrastructure, but creates platform dependency
- Question: If GitHub changes their Actions pricing or API, how much of Pawtograder breaks?

**Economic sustainability:**
- Serverless grading ([L21](/lecture-notes/l21-serverless)): pay only for actual grading runs, not idle servers — strong for bursty academic workloads
- Open-source: no licensing costs for adopting universities
- Hidden cost: self-hosting requires expertise that under-resourced institutions may not have
- Trade-off: GitHub lock-in vs. the operational savings of not maintaining CI infrastructure

**Environmental sustainability:**
- 3,000-12,000 daily submissions across the course, each triggering container spin-up, test execution, and result reporting
- Scale-to-zero means no idle compute — but Jevons' paradox applies: unlimited submissions generate more total compute than a "submit twice and wait for a human" model
- Question: Should Pawtograder implement a cooling-off period between submissions? That would reduce compute but change the student experience.

**Social sustainability:**
- GPL license ensures any institution can use it — socially sustainable
- But: requires GitHub access, which may be restricted in some countries or institutions
- WCAG compliance planned but not yet validated — socially unsustainable for students with disabilities until it is
- Automated grading can be perceived as less fair than human grading ("the computer gave me a zero") — transparency in feedback is a social sustainability requirement

#### Real Decision: The October 2025 Azure Outage

When Azure went down and GitHub Actions stopped running, Pawtograder couldn't grade submissions. Two options:

| | Option A: Add self-hosted fallback | Option B: Stay GitHub-dependent |
|--|-----------------------------------|-------------------------------|
| **Technical** | Complex failover logic; two systems to maintain | Simpler architecture; single system |
| **Economic** | Duplicate infrastructure costs; expertise to maintain both | Leverage free tier; lower total cost |
| **Environmental** | Idle fallback resources most of the time | Shared infrastructure, higher utilization |
| **Social** | Resilient — students don't lose access during outages | Equal access for all institutions (no self-hosting expertise needed) |

There is no "right" answer. The point is that the four-dimensional analysis makes the trade-offs visible. Without it, you might choose based on technical elegance alone and miss the social or environmental implications.

### The Values-Requirements Gap

Here is the honest ending: **translating sustainability values into testable software requirements is genuinely hard.** It is, in fact, an open research problem.

You can state values clearly:
- "Pawtograder should be fair to all students"
- "SceneItAll should respect user privacy"
- "Our system should minimize environmental impact"

But operationalizing those values into requirements that engineers can implement and verify is a different challenge entirely:

| Value | Attempted requirement | Problem |
|-------|----------------------|---------|
| Fairness | "Grade all submissions identically" | Identical grading can produce inequitable outcomes (students with disabilities, students on slow connections who hit timeouts) |
| Privacy | "Don't collect unnecessary data" | What counts as "necessary" depends on who's asking — debugging needs telemetry, but telemetry is surveillance |
| Environmental | "Minimize compute" | Minimizing compute conflicts with unlimited submissions, thorough test suites, and fast feedback |

Philosopher C.T. Nguyen calls this pattern [value capture](https://philpapers.org/archive/NGUVCH.pdf): when a simplified scoring system overwrites the richer values it was meant to represent. The university that genuinely valued diverse pedagogical missions starts optimizing for U.S. News rankings instead. The developer who valued code quality starts optimizing for code coverage percentage. Value capture is not a failure of willpower — it is a structural consequence of creating portable, quantified proxies for qualitative goals. Once a metric exists, people orient toward it, and the original value recedes.

Economists have a name for this: **Goodhart's Law** — "when a measure becomes a target, it ceases to be a good measure." Code coverage is a useful *measure* of test quality. The moment it becomes a *target* (CI fails below 80%), developers write tests that hit lines without testing behavior. The metric improves; the thing it was measuring gets worse. This is why the values-requirements gap is not just an engineering challenge but a *design hazard*: the very act of operationalizing a value into a testable requirement creates the conditions for the value to be displaced by the requirement.

Every design decision encodes a value judgment — whether you think about it or not. The choice to offer unlimited submissions values learning-by-iteration over compute efficiency. The choice to require GitHub access values platform standardization over universal access. The choice to auto-grade rather than human-grade values speed and scale over the nuance a human reader provides.

The goal of sustainability analysis is not to resolve these tensions — many of them are genuinely unresolvable. The goal is to make them *visible*, so that the people making the decisions understand what they're trading off and who bears the cost.

:::note
The Karlskrona Manifesto on Sustainability Design (2015) puts it this way: "System design is never value-neutral." Every architecture, every API, every default setting reflects an assumption about who matters and what matters. Sustainability is the practice of making those assumptions explicit and revisiting them as the system and its context evolve.
:::

Parnas makes a related point about regulation: "What we should be doing is trying to regulate critical software rather than trying to make regulations that apply to AI... it doesn't matter whether you call it AI. If it's a software computer system, there should be some regulations that apply to it." The sustainability framework agrees: the question is not "is this AI?" but "what is the blast radius of this system, who are the stakeholders, and are the trade-offs visible?" Those questions apply equally to a `for` loop that processes loan applications and a neural network that does the same thing.

### Course Arc: From Programming to Engineering

This course began with a promise: software engineering is not programming. Programming is writing code that works today. Engineering is writing code that works tomorrow, next year, and for people you haven't met.

Every lecture has been a different lens on that promise:

| Lecture arc | What it sustains | Time horizon |
|------------|-----------------|-------------|
| L5-L8: Readability, coupling, SOLID | Code that future developers can understand and change | Years of maintenance |
| L9, L12: Requirements, domain modeling | Systems that solve the right problem, not just the stated one | Project lifetime |
| L15-L16: Testing, testability | Confidence that changes don't break existing behavior | Every commit |
| L18-L21: Architecture, networks, serverless | Systems that scale, evolve, and survive infrastructure changes | Organizational lifetime |
| L23: Open source | Supply chains that don't depend on abandoned projects | Industry-wide |
| L28: Accessibility | Systems that serve all users, not just the ones who look like the developers | Societal |
| L34-L35: Performance, safety | Systems that don't harm users through slowness or failure | Immediate to catastrophic |

Sustainability is not a new topic. It is the name for what all of these topics have in common: **designing software that continues to provide value over time, to the people who need it, without imposing unacceptable costs on the people who don't.**

### Want to go deeper?

- **Patricia Lago et al., ["Software Sustainability in the Digital Society"](https://dl.acm.org/doi/10.1145/3639060)** — The four-dimension framework used in this lecture
- **[The Karlskrona Manifesto on Sustainability Design](https://arxiv.org/abs/2305.00436)** — The foundational consensus document for sustainability in software engineering
- **[Exploring Ethical Values in Software Systems](https://research.vu.nl/ws/portalfiles/portal/426353263/Exploring_ethical_values_in_software_systems.pdf)** — Mapping values to requirements using Value-Sensitive Design
- **[Green Software Foundation](https://greensoftware.foundation/)** — Industry standards for measuring and reducing software carbon footprint
- **[David Parnas' ICSE 2025 Keynote](https://www.youtube.com/watch?v=YyFouLdwxY0)** — Professional responsibility in the age of AI-generated code
- **John Rawls, *A Theory of Justice*** — The original veil of ignorance thought experiment
- **[C.T. Nguyen, *The Score*](https://www.penguinrandomhouse.com/books/735252/the-score-by-c-thi-nguyen/)** — Value capture, the gap between metrics and meaning, and why scoring systems shape what we care about