---
sidebar_position: 36
lecture_number: 36
title: "L36: Sustainability"
---

# Sustainability

[Background Material](https://dl.acm.org/doi/10.1145/3639060) and [this article](https://arxiv.org/abs/2305.00436)

## Define software sustainability and its importance in software development (10 minutes)

At the start of this course, we introduced the idea that software engineering is "the integral of programming over time." Throughout the semester, we've seen this principle manifest in many ways:

**Technical concerns that compound over time:**
- Code readable only to authors becomes unmaintainable (L5)
- Exposed internal state becomes API constraints that limit changeability (L6)
- Missing stakeholders and requirements may become expensive retrofits (L9)
- Domain assumptions become large-scale rewrite triggers affecting the entire system (L12)
- AI training biases become system biases (L13)
- License choices become strategic constraints (L23)
- Performance shortcuts become environmental costs (L34)
- Safety gaps become human harm (L35)

Each of these is both an ethical concern *and* a cost concern. That's not a coincidence: ethics and engineering economics align over sufficiently long time horizons. Cutting corners affects people; eventually, affecting people affects the bottom line.

Today we bring these threads together under the framework of **sustainability** - the meta-quality attribute that asks: "Will this system continue to provide beneficial value over time, and to whom?"

- Build on existing knowledge: "You've learned about performance, scalability, security..."
- The problem: These traditional QAs assume a stable context
- Sustainability: The meta-quality attribute about system endurance

"Software sustainability is the preservation of the long-term and beneficial use of software, and its appropriate evolution, in a context that continuously changes" (Lago 2023 Digital society is already here)
- Discuss: Why "beneficial"? (long-term...)

## Identify the four dimensions of software sustainability and explain how they interconnect (15 minutes)
- Technical: Maintainability, evolvability (connects to modular design lecture)
    - Discuss how technical decisions affect different stakeholder roles (developers, end users, indirect stakeholders)
- Economic: Total cost of ownership (connects to networks/distributed systems and software architecture lectures)
    - Hidden costs, hidden benefits
    - Vendor lock-in vs operational costs
- Environmental: Resource consumption (new consideration)
    - Externalities: making delivery of burritos easier has externalities on the environment. Pre-ordering meals on a flight also has externalities on the environment.
- Social: Accessibility, inclusivity, usability (connects to user experience lectures, plus new considerations for society at large)
    - Critical addition on indirect stakeholders
    - Culture? How does TikTok influence society, and society influence TikTok?
        - How does GenAI influence society, and society influence GenAI?

- First, second, third-order effects
    - How to recognize these cascading effects?
        - Some: domain knowledge, common patterns
        - Hints and clues of how to look for novel ones, and how to integrate these concerns into operations and monitoring?

- What are our responsibilities to future us (or future people)?
    - Any decision (or non-decision) reflects a certain value judgement, it is in fact possible to discuss those values and make an informed judgement about the trade-offs involved.
    - Are you choosing as if you are the future, and you should pick what you think you will want? Or do we take an atittude that people in the future are equally important as today, but we may not know what they will want?
    - How does the Overton window of social values and what is possible change over time?
    - Jevons' paradox
    - Veil of ignorance
    - Precautionary risks


- Examples

## Evaluate trade-offs between competing sustainability concerns in software design decisions (10 minutes)

[Translating values into requirements is HARD and an open research challenge](https://research.vu.nl/ws/portalfiles/portal/426353263/Exploring_ethical_values_in_software_systems.pdf#page25).

### Example: Pawtograder

Identifying Direct vs. Indirect Stakeholders
- Direct: Students submitting code, TAs grading, instructors managing course
- Indirect: Future employers, educational equity, broader academic community

Mapping Stakeholder Concerns to Values (using VSD):
- Security: Privacy (student code), safety (reliable grading)
- Benevolence: Trust (fair assessment), transparency (clear feedback)
- Universalism: Fairness (equal access), welfare (student learning outcomes)
- Self-direction: Autonomy (students control submissions)

Value Conflicts in Pawtograder:
- Privacy vs. Transparency: Should we log all submissions for debugging?
- Autonomy vs. Safety: Should we limit submission attempts to prevent system abuse?
- Efficiency vs. Fairness: Should we prioritize faster grading for some assignments?

Technical Dimension:
- Maintainability: Open-source, modular design
- Evolution: Serverless allows scaling without infrastructure changes
- GitHub Actions: Standard tooling reduces custom code

Economic Dimension:
- Serverless: Pay only for actual grading runs (vs. always-on servers)
- Universities maintaining self-hosted graders = hidden costs
- Open-source: No licensing costs for universities
- Trade-off: Potential vendor lock-in to GitHub

Environmental Dimension:
- 3-12k daily submissions × average 2-minute runtime = significant compute
- Self-hosted runners: Universities can use renewable energy?
- On-demand resources: No idle servers

Social Dimension:
- WCAG compliance planned but not validated
- GPL ensures any institution can use it
- But: Requires GitHub access
- Knowledge barrier: Need expertise to self-host
- Community: Open-source enables contributions

#### Real Decision: Response to the Azure Outage from October 2025

Option A: Add Fallback to Self-Hosted Infrastructure

- Technical: Complex failover logic, maintenance burden
- Economic: Duplicate infrastructure costs
- Environmental: Idle resources most of the time
- Social: Requires expertise not all schools have

Option B: Stay GitHub-Dependent

- Technical: Simpler architecture
- Economic: Leverage free tier
- Environmental: Efficient resource sharing
- Social: Equal access for all institutions


## Evaluate the long-term architectural impacts of design decisions beyond immediate technical requirements (15 minutes)
[Relate ethical values to quality attributes](https://research.vu.nl/ws/portalfiles/portal/426353263/Exploring_ethical_values_in_software_systems.pdf#page25)

### Speculate on the long-term impacts of Pawtograder's design decisions
