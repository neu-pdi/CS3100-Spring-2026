---
sidebar_position: 35
lecture_number: 35
title: "L35: Safety and Reliability"
---

# Safety and Reliability

[Background Material](https://learning.oreilly.com/library/view/software-architecture-in/9780136885979/ch10.xhtml#ch10)

## Define common factors that contribute to the "Reliability" and "Availability" of a software system (10 minutes)

Safety isn't a feature you add - it's a property that must be maintained over the system's lifetime.

**Safety concerns evolve:**
- Year 1: System handles happy paths safely. Relatively few users, small enough sample that most errors are caught by manual inspection and have limited impact.
- Year 2: Growing adoption. More users are using the system in ways that we did not build for, particularly when considering social and environmental externalities.
- Year 3: Edge cases discovered in production; safety debt accumulates
- Year 5: Regulatory requirements change; what was "safe enough" no longer complies

**The cost of safety retrofitting:**
- Safety designed in: moderate upfront investment
- Safety added later: expensive refactoring + audit + migration
- Safety after incident: astronomical (legal, reputational, human costs)

### Human Safety in Software Systems

:::note Recall
In [Lecture 24 (Usability)](/lecture-notes/l24-usability), we introduced three types of human error—slips, lapses, and mistakes—and how poor usability increases their likelihood. Those concepts apply here at a larger scale: the same human error patterns that cause a user to click the wrong button can cause an operator to misconfigure a safety-critical system, or a developer to deploy untested code to production.
:::

Software affects human safety in ways that may not be obvious at development time:

**Direct safety (obvious):**
- Medical devices, autonomous vehicles, industrial control

**Indirect safety (emerging over time):**
- Recommendation algorithms affecting mental health (not designed to, but do)
- Automated hiring affecting livelihoods (seemed efficient, created bias)
- Social features enabling harassment (worked as designed, but design was incomplete)

**Key principle:** Safety analysis must include "how might this system affect humans in ways we didn't intend?" These unintended effects often only become visible over time, at scale.

### Case Study: Pawtograder and Academic Safety

An autograder might not seem "safety-critical"—it's not a medical device or autonomous vehicle. But consider the real consequences when Pawtograder fails:

**Academic consequences:**
- A race condition causes a student's resubmission to overwrite their graded work, losing TA feedback and requiring re-grading (you saw this exact scenario in [Lecture 12](/lecture-notes/l12-domain-modeling))
- A grade calculation bug systematically under-reports scores by 2%, dropping borderline students below passing thresholds
- A timezone bug marks submissions as "late" for students in certain regions, applying penalties incorrectly

**Cascading effects:**
- A student fails a required course due to a grading bug → delayed graduation → lost job offer → financial hardship
- A pattern of "late" penalties (actually a bug) triggers academic probation → loss of financial aid → student drops out
- Anxiety about unreliable autograder feedback affects student mental health and learning outcomes

**The indirect safety lesson:** Pawtograder doesn't control radiation doses, but it *does* control information that affects academic standing, which affects financial aid, which affects whether students can continue their education. The causal chain from "software bug" to "human harm" is longer than Therac-25, but it's real.

**Design implications for Pawtograder:**
- **Audit trails**: Every grade change must be logged with timestamps and actor identity (the TA who changed it, or the system process)
- **Human-in-the-loop**: Final grades require instructor review before posting to the registrar
- **Fail-safe defaults**: If the autograder crashes mid-run, default to "internal error, needs manual review" rather than silently asisgning a grade of "zero"
- **Redundancy**: Store submission history, not just latest submission, so no student work is ever truly "lost"

### Case Study: Therac-25 and Boeing 737 MAX

These two disasters, separated by 30 years, share a chilling pattern.

**Therac-25 (1985-1987):** A radiation therapy machine that killed at least six patients due to software bugs.
- Earlier Therac models had **hardware interlocks** that physically prevented lethal radiation doses
- The Therac-25 replaced hardware safety with **software safety** (cheaper, lighter, more flexible!)
- The software had race conditions that hardware interlocks would have caught
- Operators reported errors, but the manufacturer dismissed them—the software was "thoroughly tested"

**Boeing 737 MAX (2018-2019):** Two crashes killed 346 people due to a software system called MCAS.
- The 737 MAX's larger engines changed the plane's aerodynamics, causing a tendency to pitch up
- Rather than redesign the airframe (expensive!), Boeing added **MCAS software** to automatically push the nose down
- In its default configuration, MCAS relied on a **single sensor**—no redundancy. When that sensor failed, MCAS repeatedly forced the nose down
- Pilots weren't adequately trained on MCAS (Boeing marketed minimal retraining to airlines as a selling point)
- Pilots fought the software until the planes crashed

**The crucial detail:** Boeing offered a dual-sensor configuration with an "Angle of Attack Disagree" indicator as an **optional upgrade**. Airlines that paid extra got redundancy; airlines that didn't got single-point-of-failure. Both crashed aircraft (Lion Air and Ethiopian Airlines) had the basic single-sensor configuration. Meanwhile, most US and European carriers had purchased the dual-sensor option.

**This reveals a disturbing pattern:** Safety became a premium feature. Budget-conscious airlines—often serving price-sensitive passengers in developing countries—flew with less redundancy. The cost savings accrued to airlines and Boeing; the risk was borne disproportionately by passengers who had no idea their ticket price reflected a safety tradeoff.

**The pattern:**

| Aspect | Therac-25 | Boeing 737 MAX |
|--------|-----------|----------------|
| **What was replaced?** | Hardware interlocks | Airframe redesign + pilot training |
| **Replaced with?** | Software safety checks | MCAS software automation |
| **Why?** | Cheaper, lighter | Cheaper, faster certification |
| **Critical flaw?** | Race conditions | Single point of failure (one sensor) |
| **Human-in-the-loop?** | Operator warnings ignored | Pilots not trained to override |

**The recurring lesson:** When we replace hardware safety or human judgment with software (because it's cheaper!), we must ask:
1. What failure modes does software introduce that the original system didn't have?
2. Is there redundancy? What happens when the single sensor/input/assumption fails?
3. Can humans override the automation when it's wrong? Do they know how?
4. **Who profits from removing the safety mechanism, and who bears the risk?** If the answer is "different people," you have an ethical problem—those making the cost/benefit calculation aren't the ones who suffer the consequences.

## Describe architectural tactics for achieving reliability and availability (10 minutes)

## Define common factors that contribute to "Safety" of a software system (10 minutes)

## Describe architectural tactics for achieving safety (10 minutes)

## Describe patterns for achieving safety (10 minutes)


