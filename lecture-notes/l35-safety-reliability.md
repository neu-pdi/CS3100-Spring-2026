---
sidebar_position: 35
lecture_number: 35
title: "Safety and Reliability"
---

You've spent this semester building software that works — software that is correct, testable, maintainable, and performant. Today we ask a different question: **what happens when it doesn't work?** And more specifically: **who gets hurt?**

The tools you've learned this semester — race condition prevention ([L31](/lecture-notes/l31-concurrency1)), error handling ([L32](/lecture-notes/l32-concurrency2)), consistency models ([L33](/lecture-notes/l33-event-architecture)), profiling ([L34](/lecture-notes/l34-performance)) — are not just performance or reliability tools. They are **safety mechanisms.** The difference is not the mechanism; it is the consequence of getting it wrong.

## Distinguish safety from reliability and explain why both are architectural drivers (12 minutes)

### Three Related but Distinct Concepts

These terms are often used interchangeably, but they mean different things — and the differences matter:

**Reliability** is whether the system does what it is supposed to do, consistently. A reliable system works. You measure it in error rates, mean time between failures (MTBF), and successful operation counts. A SceneItAll hub that correctly activates scenes 99.99% of the time is highly reliable.

**Availability** is whether the system is accessible when users need it. A highly available system is there when you call. You measure it in "nines" — 99.9% (8.7 hours of downtime per year), 99.99% (52 minutes), 99.999% (5 minutes). GitHub experienced [multiple major outages in February–March 2026](https://github.blog/news-insights/company-news/addressing-githubs-recent-availability-issues-2/) — a core authentication database overloaded when client apps drove a tenfold increase in read traffic, and GitHub Actions failed due to insufficient failover. That's an availability failure — significant downtime — but not a safety failure (nobody was physically harmed).

**Safety** is whether the system avoids causing unacceptable harm, even when it fails. A safe system fails without hurting people. You measure it not in uptime but in incident severity — did anyone get hurt? Did anyone lose data? Did anyone lose money?

The critical insight: **a system can be reliable and unsafe.** The [Therac-25](https://en.wikipedia.org/wiki/Therac-25) radiation therapy machine delivered correct doses the vast majority of the time — it was reliable. But its failure mode was lethal. Conversely, **a system can be safe but unreliable.** If SceneItAll's hub crashes frequently but always preserves device state and fails to a safe default (lights on, doors locked), it is much less likely that someone will be harmed, but it is still possible (locked out of the house?) — even though the system is unreliable.

:::note Recall
In [L18 (Thinking Architecturally)](/lecture-notes/l18-architecture-design), we introduced quality attributes as the drivers that shape architecture. Safety and reliability are quality attributes, just like performance, scalability, and changeability. They don't get added as features — they emerge from (or fail to emerge from) architectural decisions made early and maintained throughout.
:::

### Safety Isn't a Feature — It's a Property That Emerges (or Doesn't)

You can't add safety the way you add a search bar. Safety is not a feature you build in Sprint 4 — it is a property that emerges from how every other feature is built. This should sound familiar, because you've heard this exact pattern all semester, applied to different quality attributes:

- In [L7 (Design for Change)](/lecture-notes/l7-design-for-change), we argued that changeability comes from coupling and cohesion decisions made *during* design, not from a refactoring sprint later. Low coupling doesn't happen by accident — it happens because someone chose the right module boundaries before the code was tangled.
- In [L16 (Designing for Testability)](/lecture-notes/l16-testing2), we showed that testability requires hexagonal architecture — separating domain logic from infrastructure — and that bolting tests onto code that wasn't designed for testability is painful and incomplete.
- In [L18 (Thinking Architecturally)](/lecture-notes/l18-architecture-design), we introduced "just enough architecture": decide the hard-to-reverse things up front, design the system so deferred decisions stay cheap. The cost of getting those early decisions wrong grows exponentially over time.
- In [L20 (Networks and Security)](/lecture-notes/l20-networks), we stated it directly: "Security isn't a feature you bolt on at the end — it's an architectural concern that shapes design decisions throughout."
- In [L28 (Accessibility)](/lecture-notes/l28-accessibility), we showed that accessibility designed in from the start is straightforward; accessibility retrofitted onto an inaccessible interface is expensive, incomplete, and often patronizing.

Safety follows the same rule — and the stakes are higher. When SceneItAll's firmware update uses an atomic write with rollback, that's not a "safety feature" — it's a firmware update that was *designed safely.* When it doesn't use an atomic write, the firmware update still works in the happy path. The safety gap only becomes visible when the Zigbee connection drops mid-write and the device is bricked.

This is why safety concerns change as a system grows:

| Stage | What happens | SceneItAll example |
|-------|-------------|-------------------|
| **Launch** | Happy paths work; few users, limited blast radius | 50 beta homes, firmware updates pushed manually |
| **Growth** | Users interact in ways you didn't design for | 10,000 homes; users trigger scene activations during firmware updates — a race condition you never tested |
| **Scale** | Edge cases surface in production; safety debt compounds | A firmware bug bricks 200 devices in one push; staged rollout would have caught it at 10 |
| **Maturity** | Regulatory requirements change; what was "safe enough" no longer complies | UL/CE certification requires hardware watchdog timer; your software-only safety was grandfathered in |

The cost of addressing safety at each stage grows exponentially. Designing in an atomic firmware write on day one is moderate engineering effort. Adding it after 10,000 devices are deployed requires a migration. Adding it after a bricking incident requires that migration *plus* legal costs, customer replacements, and reputational damage.

### Software Affects Human Safety in Ways You Don't Expect

**Direct safety** is straightforward: SceneItAll controls a smart door lock. A bug in the lock firmware lets an unauthorized person enter. Software controls a physical actuator, and the failure causes immediate physical harm. Medical devices, autonomous vehicles, and industrial control systems fall in this category.

**Indirect safety** is harder to see. A recommendation algorithm affects mental health — not because it was designed to, but because optimizing for engagement selects for outrage. An automated hiring tool screens out qualified candidates — not because it's biased by design, but because its training data reflects historical bias. SceneItAll's usage analytics reveal when a home is occupied and when it isn't — not a safety concern at launch, but a burglary risk at scale. Moreover, at scale, SceneItAll might have potential users with real safety concerns about this data.

These are fundamentally missing-stakeholder problems. In [L9 (Requirements)](/lecture-notes/l9-requirements), we discussed three dimensions of requirements risk. Indirect safety hazards are what happens when the *understanding* dimension fails — when we don't understand who our stakeholders are or how our system affects them.

The same patterns appear in AI systems. In [L13](/lecture-notes/l13-intro-ai-agents), we discussed AI coding agents generating code with security vulnerabilities. An AI system that makes safety-relevant decisions (medical diagnosis, content moderation, autonomous driving) replaces human judgment with software — like Therac-25. It may lack redundancy — like Boeing's single sensor. And its blast radius scales with deployment — like CrowdStrike. If a developer uses AI to generate safety-critical code and cannot evaluate the output, they have removed a Swiss cheese layer (human code review) without adding a replacement. Don't just take our word for it, see [David Parnas' ICSE 2025 Keynote](https://www.youtube.com/watch?v=YyFouLdwxY0).

:::note Recall
In [L24 (Usability)](/lecture-notes/l24-usability), we introduced three types of human error — slips, lapses, and mistakes — and how poor usability increases their likelihood. The same error patterns apply at a larger scale: the slip that makes a user click the wrong button in a recipe app can make an operator misconfigure a safety-critical system, or a [developer deploy untested code to production](https://www.henricodolfing.ch/en/case-study-4-the-440-million-software-error-at-knight-capital/).
:::

## Apply the Swiss cheese model to analyze layered defenses (13 minutes)

### The Swiss Cheese Model of Failure

:::note Recall
You've been building Swiss cheese layers all semester without naming them. Preconditions ([L4](/lecture-notes/l4-specs-contracts)) reject bad inputs. Tests ([L15](/lecture-notes/l15-testing)) catch bugs before deployment. Hexagonal architecture ([L16](/lecture-notes/l16-testing2)) isolates domain logic from infrastructure failures. Resilience patterns ([L20](/lecture-notes/l20-networks)) handle network failures. Idempotent consumers ([L33](/lecture-notes/l33-event-architecture)) handle duplicate messages. Today we name this pattern and analyze what happens when layers are removed.
:::

The Swiss cheese model (James Reason) is the most useful framework for thinking about safety in systems. The idea: every safety mechanism is a layer of defense — a slice of Swiss cheese. Each layer has holes (failure modes). **Harm occurs only when holes in multiple layers align** — when every defense fails simultaneously.

A single layer with holes is not dangerous on its own. Multiple layers with non-aligned holes provide robust protection. The problem is when someone removes a layer entirely, or when holes grow larger over time without anyone noticing.

### Case Study: Therac-25

The Therac-25 was a radiation therapy machine that killed at least six patients between 1985 and 1987. The bug was a race condition — the same kind you studied in [L31](/lecture-notes/l31-concurrency1).

Earlier models (the Therac-20) had **hardware interlocks** — physical mechanisms that prevented the machine from delivering lethal radiation doses regardless of what the software did. The hardware was a Swiss cheese layer with very small holes. The Therac-25 replaced those interlocks with **software safety checks.** Cheaper, lighter, more flexible — but it **removed an entire layer of Swiss cheese.** The software had race conditions that the hardware interlocks would have caught. When operators reported errors, the manufacturer dismissed them: the software was "thoroughly tested."

**Swiss cheese analysis:**

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Hardware interlocks** | Physical mechanism prevents lethal dose | **Removed entirely** in Therac-25 |
| **Software safety checks** | Software validates beam energy before firing | Race condition allowed high-energy beam in electron mode |
| **Operator training** | Operators trained to recognize error codes | Operators learned to dismiss frequent, cryptic error messages |
| **Incident reporting** | Operators report anomalies to manufacturer | Manufacturer dismissed reports — "software is thoroughly tested" |

All remaining holes aligned. Lethal radiation reached patients.

### Case Study: Boeing 737 MAX

Two crashes in 2018–2019 killed 346 people. The cause was a software system called MCAS (Maneuvering Characteristics Augmentation System) that overrode pilot control based on a single sensor input.

The 737 MAX's larger engines changed the plane's aerodynamics, creating a tendency to pitch up. Rather than redesign the airframe (expensive, would require recertification), Boeing added MCAS to automatically push the nose down. MCAS relied on a **single angle-of-attack sensor** — no redundancy. When that sensor failed, MCAS repeatedly forced the nose down. Pilots fought the automation until the planes crashed.

The crucial detail: Boeing offered a dual-sensor configuration with an "Angle of Attack Disagree" indicator as an **optional upgrade.** Airlines that paid extra got redundancy; airlines that didn't got a single point of failure. Both crashed aircraft (Lion Air and Ethiopian Airlines) had the basic single-sensor configuration.

**Swiss cheese analysis:**

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Airframe design** | Aerodynamic stability without software intervention | **Replaced** — new engines changed aerodynamics; MCAS compensates in software |
| **Sensor redundancy** | Dual angle-of-attack sensors with disagree indicator | **Optional upgrade** — not present on crashed aircraft |
| **Pilot training** | Pilots trained to recognize and override MCAS | **Minimized** — Boeing marketed "no retraining needed" as a selling point |
| **Pilot override** | Pilots can disable automation and fly manually | Inadequate — pilots didn't know MCAS existed, couldn't diagnose the failure |

All holes aligned. Software pushed the nose down, pilots couldn't override, planes crashed.

### Case Study: CrowdStrike Falcon Update (July 2024)

On July 19, 2024, CrowdStrike pushed a content update to its Falcon security agent — a kernel-level driver running on approximately 8.5 million Windows machines worldwide ([Microsoft, *Helping our customers through the CrowdStrike outage*](https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/), corporate blog, as of 2024-07-20). Technical root cause and mitigations are documented in CrowdStrike’s [Channel File 291 root cause analysis](https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf) (dated 2024-08-06). The update contained a bug that caused an out-of-bounds read in the kernel, triggering a Blue Screen of Death on boot. Because the driver loads early in the boot process, affected machines entered an unrecoverable boot loop. Manual intervention — physically accessing each machine, booting into Safe Mode, and deleting the offending file — was required for every single one.

Airlines grounded flights. Hospitals delayed surgeries. 911 dispatch systems went offline. Banks could not process transactions. Economic-loss estimates were in the billions of dollars: insurer Parametrix estimated $5.4 billion in financial losses for US Fortune 500 companies ([Reuters, *Fortune 500 firms to see $5.4 bln in CrowdStrike losses, says insurer Parametrix*](https://www.reuters.com/technology/fortune-500-firms-see-54-bln-crowdstrike-losses-says-insurer-parametrix-2024-07-24/), 2024-07-24); the same Reuters report quoted Parametrix’s CEO estimating ~$15 billion globally (as of 2024-07-24).

**Swiss cheese analysis:**

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Content validation** | Automated testing before distribution | Test did not catch the null pointer read |
| **Staged rollout** | Push to 1% first, monitor, then expand | Not used for "content updates" — only for "sensor updates." The update went to all 8.5M machines simultaneously |
| **Automatic rollback** | Revert if failures spike | Machines could not boot to receive the rollback |
| **Fail-safe boot** | If driver crashes, boot without it | CrowdStrike loads too early in boot — crash prevents any recovery |
| **Monitoring** | Detect crash spike and halt rollout | With simultaneous push, crashes happened faster than monitoring could react |

This is the SceneItAll firmware update scenario from earlier in this lecture — but at planetary scale. The blast radius of skipping staged rollout was not "1000 devices" but "every Windows machine in every hospital, airline, and emergency dispatch center running CrowdStrike Falcon."

### The Comparison

| Aspect | Therac-25 | Boeing 737 MAX | CrowdStrike Falcon |
|--------|-----------|----------------|-------------------|
| **What was replaced?** | Hardware interlocks | Airframe redesign + pilot training | Manual security review |
| **Replaced with?** | Software safety checks | MCAS software automation | Automated content update pipeline |
| **Why?** | Cheaper, lighter | Cheaper, faster certification | Speed — security threats require rapid response |
| **Swiss cheese layer removed?** | Hardware interlock layer | Sensor redundancy + training | Staged rollout for content updates |
| **Critical flaw?** | Race conditions | Single point of failure | No rollback path when kernel driver crashes |
| **Could system recover?** | Yes — operators could restart | No — planes crashed | No — boot loop required manual access to each machine |

**The recurring lesson:** When we replace hardware safety or human judgment with software (because it's cheaper), we must ask:
1. What failure modes does software introduce that the original system didn't have?
2. Is there redundancy? What happens when the single sensor/input/assumption fails?
3. Can humans override the automation when it's wrong? Do they know how?

### Safety as a Premium Feature

Boeing sold sensor redundancy as an optional upgrade. Airlines serving price-sensitive passengers in developing countries flew with less redundancy. The cost savings accrued to airlines and Boeing; the risk was borne disproportionately by passengers who had no idea their ticket price reflected a safety tradeoff.

This reveals a pattern we'll explore further in [L36 (Sustainability)](/lecture-notes/l36-sustainability): **who profits from removing a safety mechanism, and who bears the risk?** If the answer is "different people," you have an ethical problem — those making the cost/benefit calculation aren't the ones who suffer the consequences.

## Analyze blast radius and fail-safe design in your own systems (15 minutes)

### Blast Radius: How Much Breaks When Something Fails?

**Blast radius** is how much of the system — and the world — is affected when a component fails. It is the single most important factor in determining how many Swiss cheese layers you need.

:::note Recall
In [L19 (Architectural Qualities)](/lecture-notes/l19-monoliths), we noted that a monolith's deployment risk is "all-or-nothing: a bug in one feature can take down everything." That's blast radius language — L19 implicitly introduced the concept. A monolith has the maximum blast radius: every feature shares a single deployment unit.
:::

Low coupling ([L7](/lecture-notes/l7-design-for-change)) limits blast radius: when modules are loosely coupled, a failure in one does not propagate to others. High coupling means a bug in the authentication module can crash the gradebook.

The Citicorp Tower in Manhattan (1978) illustrates this. A student's question about the building's unusual column placement prompted structural engineer William LeMessurier to investigate quartering winds — winds hitting the corner at 45°, which the NYC building code didn't require analyzing. He discovered that a contractor had substituted bolted joints for the specified welded joints (cheaper, but weaker in tension), and that nobody had recalculated for quartering winds after the substitution. The combination meant the building could collapse in a storm that occurs roughly every 16 years. Hurricane season was approaching.

LeMessurier didn't fix it quietly. He brought in every stakeholder: the architect (Hugh Stubbins), Citicorp's CEO (Walter Wriston), an independent structural consultant (Leslie Robertson, who had consulted on the World Trade Center), the contractor, NYC's Acting Building Commissioner and nine senior city officials, the American Red Cross, police, and the Mayor's Office of Emergency Management. He told the city the whole truth — "the failure of his own office to perceive and communicate the danger" — for over an hour. City officials commended him. Emergency welding was completed during a newspaper strike, so there was no public panic. The building was rebuilt to withstand a 700-year storm. Nobody was hurt.

Why did he act? Not because he was uniquely virtuous — but because the **blast radius left no other responsible option.** A collapsed skyscraper in midtown Manhattan would endanger thousands of people. When your system's blast radius is that large, you have a professional obligation to understand and mitigate every failure mode you discover — even when disclosure is personally costly. As project manager Arthur Nusbaum put it: "It started with a guy who stood up and said, 'I got a problem, I made the problem, let's fix the problem.' If you're gonna kill a guy like LeMessurier, why should anybody ever talk?"

The [ACM Code of Ethics](https://www.acm.org/code-of-ethics) formalizes this: Principle 1.2 states 'Avoid harm,' and Principle 2.5 requires 'comprehensive and thorough evaluations of computer systems and their impacts, including analysis of possible risks.' Blast radius analysis IS that evaluation.

In his [ICSE 2025 keynote](https://www.youtube.com/watch?v=YyFouLdwxY0), David Parnas — who invented the information hiding concepts you learned in [L6](/lecture-notes/l6-immutability-abstraction) — put it simply: "It's not the AI that's liable. It's either the people who made it or the people who use it or both. The people who made it have a duty to have a specification for it and to make sure it meets that specification. People who use it have to make sure that they have read the specification and they're not using it outside of the specification." This is the same contracts framework from [L4](/lecture-notes/l4-specs-contracts) — preconditions and postconditions — applied to professional accountability. It doesn't matter whether your system uses AI, event-driven architecture, or a single `for` loop. If its blast radius includes human safety, you are responsible for specifying what it does and verifying that it does it.

**Blast radius determines how many Swiss cheese layers you need:**

| System | Blast radius of failure | Layers needed |
|--------|------------------------|---------------|
| SceneItAll brightness control | One room's lights are wrong | Error handling + UI feedback |
| SceneItAll door lock | Unauthorized person enters | Strong consistency ([L33](/lecture-notes/l33-event-architecture)) + redundant sensors + human override |
| SceneItAll firmware update | Device bricked, needs replacement | Rollback mechanism + staged rollout + integrity verification |
| Pawtograder gradebook | Every student's GPA in the course | Audit trails + human-in-the-loop + fail-safe defaults |
| Citicorp Tower | Midtown Manhattan skyscraper | Physical redundancy + independent verification + immediate remediation |
| Boeing 737 MAX MCAS | Everyone on the aircraft | Sensor redundancy + pilot training + override capability |

### Fail-Safe vs. Fail-Operational

SceneItAll's hub loses its connection to a smart light mid-scene-activation. What should the light do?

**Fail-safe:** The light stays at its current brightness. Nothing changes. The user notices the scene didn't fully apply, but no harm is done. **When in doubt, do nothing harmful.**

**Fail-operational:** The hub falls back to local control via Zigbee, bypassing the cloud. The system continues in a degraded mode — no remote access, no analytics — but the user can still control their lights.

| Failure mode | Fail-safe behavior | Fail-dangerous behavior |
|-------------|-------------------|------------------------|
| Firmware update fails mid-write | Roll back to previous firmware | Continue with partially written firmware (bricked device) |
| Autograder crashes mid-run | Report "internal error, needs manual review" | Silently assign zero |
| Door lock loses connection | Lock stays in current state (locked or unlocked) | Lock resets to unlocked default |
| Scene activation: 1 of 15 devices fails | Report "14/15 updated — shade didn't respond" | Report "Scene activated!" (silent failure) |

Most software should be **fail-safe.** Fail-operational is harder to get right and is reserved for systems that cannot afford to stop — airplanes, pacemakers, nuclear reactor cooling.

Boeing's MCAS was **neither.** It didn't stop when the sensor failed (not fail-safe). It didn't degrade gracefully by alerting pilots and giving them manual control (not fail-operational). It kept pushing the nose down — fail-dangerous.

### SceneItAll Safety Scenarios

Let's apply the Swiss cheese model and blast radius to SceneItAll — the system you've been building all semester:

**Scenario 1: Firmware update bricks a device**

A SceneItAll hub pushes a firmware update to a smart light. The update involves writing firmware in chunks ([L31](/lecture-notes/l31-concurrency1), cooperative interrupts). Halfway through, the Zigbee connection drops.

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Integrity check** | Verify firmware checksum before applying | Catches corrupt downloads |
| **Atomic write** | Write new firmware to a staging partition, swap only after verification | Prevents partial writes from bricking |
| **Rollback** | If new firmware fails to boot, revert to previous version | Catches bad firmware that passes checksum |
| **Staged rollout** | Update 10% of devices first, monitor for failures, then roll out to rest | Limits blast radius to 10% |
| **Dead letter queue** | Failed updates queue for human review ([L33](/lecture-notes/l33-event-architecture)) | Nothing is silently lost |

Remove any one layer and the failure mode gets worse. Remove the atomic write AND the rollback? The device is bricked. Blast radius: one device (manageable). But if you skip the staged rollout and push to all 1000 devices at once? Blast radius: every device in the deployment.

**Scenario 2: Race condition on a door lock**

Two users send conflicting commands to the same smart lock simultaneously — one locks, one unlocks. This is the same race condition from [L31](/lecture-notes/l31-concurrency1) (Alice and Bob activating different scenes), but with safety-critical consequences.

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Sequential consistency** | Lock commands use strong consistency ([L33](/lecture-notes/l33-event-architecture)) — no eventual | Prevents stale lock state |
| **Atomic operations** | `synchronized` on the lock device — no interleaving | Prevents mixed state |
| **Audit trail** | Every lock/unlock is logged with timestamp and user | Accountability after the fact |
| **Physical override** | Physical key always works regardless of software state | Human can always recover |

For brightness controls, eventual consistency is fine — a roommate seeing 100% for 5 seconds is harmless. For a door lock, it's not. The blast radius difference (annoyance vs unauthorized entry) drives the consistency model choice.

**Scenario 3: Silent failure in scene activation**

A user activates "Evening" scene. The hub sends 15 async device commands ([L32](/lecture-notes/l32-concurrency2)). One command fails silently — no `.exceptionally()` handler. The user sees "Scene activated!" but one shade is still open.

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Error handling** | `.exceptionally()` on every async chain ([L32](/lecture-notes/l32-concurrency2)) | Catches device failures |
| **Timeout** | `.orTimeout(5, SECONDS)` — don't wait forever | Catches hung devices |
| **Status verification** | After activation, read back device states and compare | Catches silent failures |
| **User notification** | Show "14/15 devices updated — shade in bedroom did not respond" | User can investigate |

Without error handling, the hole in Layer 1 means the failure is invisible. The user thinks the shade is closed. If the shade is a window on the ground floor, this is a security issue. Blast radius: one room's security.

### Pawtograder: When the Autograder Crashes

Pawtograder's autograder runs student code in a containerized environment. If the autograder process crashes mid-run — out of memory, network timeout to the GitHub API, or a bug in the grading script itself — what grade does the student see?

| Layer | Defense | Hole? |
|-------|---------|-------|
| **Error classification** | Distinguish "student tests failed" from "grader infrastructure failed" | If both produce exit code 1, they are conflated |
| **Fail-safe default** | Infrastructure failure → "internal error, needs manual review" (not zero) | Only works if the system classifies the failure correctly |
| **Retry** | Automatically retry infrastructure failures once | Helps with transient failures; doesn't help with deterministic crashes |
| **Audit trail** | Log every grading run with exit code, stderr, timing | Enables after-the-fact investigation |
| **Student notification** | Tell the student what happened — "your submission is being re-graded" vs "0/100" | "0/100" with no explanation is fail-dangerous |

The fail-safe default matters: "internal error, needs manual review" is fail-safe. "0" is fail-dangerous. The blast radius of getting this wrong: one student's grade in the best case, every student's grade if the bug is systematic.

### Pawtograder: When a Human Accidentally Overwrites the Gradebook

Not every safety incident is a software bug. Pawtograder's gradebook stores every student's grades for the course. A staff member accidentally updates the wrong column — overwriting 200 students' homework scores with zeros. The staff member doesn't realize the mistake. A student notices their grade dropped and flags a concern.

This actually happened. The initial report looked like a software bug — "grades changed without any submission." But the audit trail told a different story.

| Layer | Defense | What it caught |
|-------|---------|---------------|
| **Audit table** | Every grade update is logged with timestamp, user, old value, new value | Showed exactly which staff member made the change, when, and what the previous values were |
| **Student visibility** | Students can see their own grades in real time | Student noticed the discrepancy within hours, not weeks |
| **Flag/concern mechanism** | Students can flag grade concerns to instructors | The student's flag triggered the investigation |
| **Professor audit view** | Professors can view full audit history for any student or assignment | Confirmed the change was a single bulk update by one staff member, not a software bug |
| **Reversibility** | Old values stored in audit table enable rollback | All 200 grades were restored from audit history |

:::note Recall
In [L24 (Usability)](/lecture-notes/l24-usability), we introduced three types of human error: slips (intended the right action, did the wrong one), lapses (forgot a step), and mistakes (wrong mental model). This was a **slip** — the staff member intended to update one column but selected the wrong one. The audit trail doesn't prevent the slip, but it makes the slip **detectable, attributable, and reversible.**
:::

Without the audit trail, this incident would have been invisible until final grades were submitted — and then it would have looked like a software bug, triggering a costly investigation into code that was working correctly. The audit trail is a Swiss cheese layer that catches **both** machine errors (autograder crash) **and** human errors (accidental overwrite). Blast radius without audit trail: 200 students' grades, potentially discovered only at end of semester. Blast radius with audit trail: 200 students' grades, detected in hours, reversed in minutes.

## Recognize prior course concepts as safety mechanisms (12 minutes)

You've learned these tools as performance, reliability, and concurrency mechanisms. Every one of them is also a safety mechanism. The difference is the consequence of getting it wrong:

| What you learned | Where | Its reliability function | Its **safety** function |
|------------------|-------|------------------------|------------------------|
| Preconditions/contracts | [L4](/lecture-notes/l4-specs-contracts) | Rejects invalid inputs at boundaries | Prevents unsafe states from being reachable — a restrictive precondition is a Swiss cheese layer |
| Testing (unit, integration, E2E) | [L15](/lecture-notes/l15-testing) | Catches bugs before deployment | Prevents safety-critical defects from reaching production — tests are a Swiss cheese layer with their own holes (incomplete coverage, flaky tests) |
| `synchronized` | [L31](/lecture-notes/l31-concurrency1) | Prevents race conditions | Prevents safety-critical state corruption (door lock mixed state) |
| `.exceptionally()` / `.orTimeout()` | [L32](/lecture-notes/l32-concurrency2) | Handles async errors | Ensures failures are visible, not silent (shade left open) |
| Sequential consistency | [L33](/lecture-notes/l33-event-architecture) | All nodes agree | Prevents operations on stale data (lock shows "locked" when unlocked) |
| Circuit breaker | [L20](/lecture-notes/l20-networks) | Prevents cascade failures | Stops a failing component from triggering harm in others |
| Idempotent operations | [L33](/lecture-notes/l33-event-architecture) | Makes retries safe | Prevents duplicate actions from causing harm (door locks twice = fine; alarm disarms twice = fine) |
| Audit trails | [L12](/lecture-notes/l12-domain-modeling) | Enables debugging | Enables accountability, reversibility, incident investigation |
| Fail-safe defaults | Today | Graceful degradation | System fails toward safety (lights on, doors locked) not toward harm |
| Redundancy | [L33](/lecture-notes/l33-event-architecture), Today | Survives component failure | Eliminates single points of failure (Boeing's single sensor) |
| Blast radius analysis | Today | Scopes failure impact | Determines how many defense layers you need |

**The key insight:** You didn't learn "safety tools" and "reliability tools" separately. They are the same tools. The engineering is the same. The difference is the stakes — and the stakes are determined by the blast radius.

## Connect safety to sustainability (8 minutes)

Safety is one dimension of the sustainability framework we'll explore in [L36](/lecture-notes/l36-sustainability). The connections:

### Safety debt compounds like technical debt

Every Swiss cheese hole you leave unfixed is a bet that no other holes will align with it. That bet gets worse over time.

SceneItAll ships without staged rollout for firmware updates. At 50 homes, this is fine — if an update bricks a device, support replaces it. At 10,000 homes, a bad update bricks 200 devices in one push. At 100,000 homes, it's a CrowdStrike-scale event. The code didn't change — the blast radius did. Safety debt is not the code getting worse; it is the consequences getting larger while the same holes remain open.

### Who profits, and who bears the risk?

Boeing sold sensor redundancy as an optional upgrade. Budget airlines — often serving price-sensitive passengers in developing countries — flew with less redundancy. The cost savings accrued to Boeing and airlines; the risk fell on passengers who didn't know their ticket price reflected a safety tradeoff.

This pattern recurs. [L36](/lecture-notes/l36-sustainability) will formalize it: **who profits from a design decision, and who bears the risk?** If the answer is "different people," the decision deserves extra scrutiny. The same logic applies to [L28 (Accessibility)](/lecture-notes/l28-accessibility): the people who decide not to invest in accessibility are rarely the people excluded by that decision.

## Evaluate safety trade-offs and explain why professional judgment is currently the primary safety mechanism in most software (8 minutes)

### Safety Is Always in Tension

Safety is never free. Every safety mechanism costs something, and ignoring those costs leads to safety mechanisms that get stripped out under pressure:

| Safety mechanism | What it costs | Example |
|-----------------|--------------|---------|
| **Strong consistency** | Performance — sequential consistency is slower than eventual | SceneItAll door lock: sequential consistency adds latency to every lock/unlock command |
| **Error handling** | Complexity — `.exceptionally()` on every async chain, timeout logic, retry policies | L32's scene activation: 15 device commands each need error handling, timeouts, and status verification |
| **Staged rollout** | Deployment speed — rolling out to 1% first and monitoring adds hours or days | CrowdStrike skipped staged rollout for "content updates" to push security patches faster |
| **Redundant sensors** | Money — dual sensors, disagree indicators, additional wiring | Boeing sold sensor redundancy as an optional upgrade to save airlines money |
| **Automatic memory management** | Performance — GC pauses, memory overhead | [L34](/lecture-notes/l34-performance): Java's GC trades performance for safety (no use-after-free bugs) |
| **Human-in-the-loop** | Throughput — humans are slow | Pawtograder: "internal error, needs manual review" is safer than auto-assigning zero, but requires a TA to act |

In every case, safety costs something: performance, complexity, money, or time. The question is not "can we afford safety?" but "can we afford the consequences of not having it?" The answer depends on the blast radius.

### From Citicorp to Code: Who Regulates Software?

LeMessurier was a **licensed professional engineer.** Building codes required specific structural analyses. Inspectors reviewed the work. Professional boards could revoke his license. When he disclosed the Citicorp flaw, city officials had the authority and expertise to evaluate his analysis and coordinate the response.

Most software has none of that. Avionics software must comply with DO-178C. Medical device software goes through FDA review. These are the exceptions. Banking software, social media algorithms, smart home firmware, autograders, hiring tools — all unregulated. There is no professional licensing requirement for writing software that controls door locks, manages student grades, or recommends content to billions of users.

In his [ICSE 2025 keynote](https://www.youtube.com/watch?v=YyFouLdwxY0), David Parnas — who invented the information hiding concepts you learned in [L6](/lecture-notes/l6-immutability-abstraction) — argued that we should **regulate critical software the same way we regulate bridges:** licensed engineers, accredited education, required specifications, independent testing. Not because it's "AI" or "not AI," but because "the amount of regulation doesn't depend on what we call it or how it's built — it depends on how important the answer is."

Until that happens, the last Swiss cheese layer is **you.** Your professional judgment. Your willingness to ask "what's the blast radius?" before you ship, and to disclose when you find a hole. That's not a great safety mechanism — it depends on individual conscience and employer culture rather than institutional enforcement. It's why Parnas argues for regulation. But right now, it's what we have.

### Want to go deeper?

- **David Parnas, [ICSE 2025 Keynote: "Regulation of AI and AI-Enabled Software"](https://www.youtube.com/watch?v=YyFouLdwxY0)** — The argument for regulating critical software, not "AI"
- **Joe Morgenstern, ["The Fifty-Nine-Story Crisis,"](https://www.newyorker.com/magazine/1995/05/29/the-fifty-nine-story-crisis) *The New Yorker*, 1995** — The full Citicorp Tower story
- **[CS 4973: Accessibility and Disability](https://actlab.sites.northeastern.edu/teaching/)** — Safety and accessibility as interconnected quality attributes
- **[CS 4730: Distributed Systems](https://4730.network/)** — Formal treatment of fault tolerance, consensus, and safety in distributed systems
- **Nancy Leveson, *Engineering a Safer World*:** The definitive academic treatment of systems safety engineering
