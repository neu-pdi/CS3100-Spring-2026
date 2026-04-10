---
sidebar_position: 14
image: /img/labs/web/lab14.png
---

# Lab 14: The Future of Programming

![8-bit lo-fi pixel art, retro game aesthetic, clean outlines. A cozy computer lab with students sitting in small groups of four around tables, no computers visible — just notebooks, printed articles, and coffee cups. One student is gesturing while explaining something, another is listening with a thoughtful expression, a third is scribbling notes. On the wall behind them, a timeline stretches left to right showing the evolution of programming: punch cards, a terminal, a GUI IDE, and finally a glowing chat interface with an AI. The mood is animated conversation — ideas bouncing between people. Teal and blue primary tones with warm orange accents on the articles and notebooks. Title banner: Lab 14 The Future of Programming. Bottom text: CS 3100 Program Design and Implementation 2. Tagline: Read. Discuss. Decide. 16:9 aspect ratio.](/img/labs/web/lab14.png)

## Learning Objectives

- Read and critically evaluate claims about AI's impact on software development
- Synthesize perspectives from multiple sources to form your own position
- Articulate what you've learned this semester and what you want to learn next
- Practice technical discussion skills: presenting, questioning, and building on others' ideas

## Overview

This is not a coding lab. This is a **read → pair → share → discuss** lab that prepares you for our final content lecture, [L38: The Future of Programming](/lecture-notes/l38-future-programming).

You'll pick a reading, read it in lab, discuss it with a partner, share takeaways with your table, and participate in a class-wide discussion. The goal is to walk into L38 with informed opinions — not consensus, but *positions* you can defend with evidence.

:::note For TAs
This lab has a very different energy from the coding labs. Your role shifts from debugging helper to **discussion facilitator.** Key things to do:

- **Circulate during pair discussion** (Part 2) — listen for interesting points you can call on later.
- **Keep table presentations short** — each pair gets 2 minutes max. Time it.
- **Seed the class discussion** (Part 3) with specific questions, not "what did you think?" Use the prompts below.
- **It's OK if students disagree.** The best discussions happen when they do. Your job is to make sure disagreement stays respectful and evidence-based ("what makes you think that?" not "you're wrong").
:::

---

## Part 1: Read & Annotate (15 min)

Pick **one** reading from the list below. Read it in lab. As you read, jot down three things:

1. **The core claim** — what is the author arguing? (One sentence.)
2. **The strongest evidence** — what's the most convincing data point or example?
3. **Your reaction** — do you agree? What's missing? What surprised you?

| # | Reading | Key question |
|---|---------|-------------|
| 1 | [METR: "Measuring the Impact of AI on Experienced Developer Productivity"](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — Read the blog post summary, not the full paper. | Experienced devs were 19% *slower* with AI — while believing they were 20% faster. Why? |
| 2 | ["The Debt Behind the AI Boom"](https://arxiv.org/html/2603.28592v1) — Read abstract, introduction, and conclusion (skip the methodology). | 15% of AI-generated commits introduce issues. 24% of those survive unfixed. What does this mean for codebases you'll work on? |
| 3 | [Brynjolfsson et al., "Canaries in the Coal Mine?"](https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/) — Read the summary/blog post, not the full paper. | Entry-level developer employment dropped ~20% from its 2022 peak. Is this AI, the hiring cycle, or both? What evidence would distinguish them? |
| 4 | [David Parnas, ICSE 2025 Keynote](https://www.youtube.com/watch?v=YyFouLdwxY0) — Watch 0:00–12:00. | The inventor of information hiding (L6) argues AI should be called "Imitation Intelligence." What's his point, and is he right? |
| 5 | [Martin Kleppmann: "AI Will Make Formal Verification Mainstream"](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html) | If AI generates code we can't fully review, should we *prove* it correct instead of testing it? |
| 6 | Any article or podcast shared on the **"The Future of Programming" discussion board** in Pawtograder — staff and students have been adding to this. | What did you find interesting and why? |

:::note For TAs
If students finish early, encourage them to skim a second reading — it makes the pair discussion richer when partners have read different things. Students who pick #4 (Parnas video) should use headphones or pair up to watch together.
:::

---

## Part 2: Pair Discussion (10 min)

Find a partner — ideally someone who read a **different** article than you.

Take turns:
1. **Summarize** your reading for your partner (2 min each)
2. **React** to what your partner shared (1 min each)
3. **Find a connection** between your readings — do they agree, disagree, or address different aspects of the same issue? (2 min together)

As a pair, prepare a **one-sentence takeaway** you want your table to hear.

:::tip Good questions to ask your partner
- "What was the most surprising thing in your reading?"
- "Do you buy the evidence, or is something missing?"
- "How does this connect to something we learned in class?"
:::

---

## Part 3: Table Share & Class Discussion (25 min)

### Table share (10 min)

Join a table group of 3-4 pairs (6-8 students). Each pair gives a **2-minute summary**:
- What you read
- Your one-sentence takeaway
- One question your pair couldn't resolve

After all pairs present, the table identifies: **What's the most interesting disagreement at this table?**

:::note For TAs
Time this strictly — 2 minutes per pair. Use a visible timer. This keeps energy up and prevents any one pair from dominating.
:::

### Class discussion (15 min)

:::note For TAs
Bring the class together. Start by asking each table to report their "most interesting disagreement" (1 min per table). Then open the floor with the prompts below. You don't need to get through all of them — go where the energy is.

**Facilitation tips:**
- After a student speaks, ask "Does anyone disagree?" before moving on
- If discussion stalls, share a specific data point: "The METR study found a 39-percentage-point perception gap — devs thought they were 20% faster but were actually 19% slower. Does that match your experience?" (bring your own ideas for specific data points)
- If one person dominates, say "Let's hear from someone who hasn't spoken yet"
- It's fine to share your own opinion — students appreciate when TAs have views — but frame it as "I think..." not "the answer is..."
:::

**Discussion prompts (pick 2-3, follow the energy):**

1. **The perception gap:** Multiple studies found developers *believe* AI helps more than it actually does. Have you experienced this? What explains it?

2. **Junior vs. senior:** The MIT study found juniors gain 27-39% from AI while seniors gain 8-13%. If AI helps juniors most, and companies stop hiring juniors, who will become the seniors of 2035?

3. **Essential vs. accidental:** Brooks said no technology would deliver 10x productivity. Has AI proven him wrong, or is it just another tool that moves accidental complexity around? Think about your GA1 project — what parts were genuinely hard regardless of tools?

4. **Vibe coding:** Where on the vibe coding spectrum should a professional work? Does it depend on the blast radius ([L35](/lecture-notes/l35-safety-reliability))? What kind of "vibe coding" could ever be acceptable in production?

5. **Regulation:** Parnas says we should regulate critical software like bridges — with licensed engineers. Is that realistic? What would it mean for your career?

6. **What endures:** When you look back at this course in 5 years, what do you think will still be relevant? What will be obsolete?

---

## Part 4: Personal Reflection (10 min)

Write this individually. Submit through Pawtograder.

### REFLECTION.md

- **What I read:** Which reading did you choose? Paste your notes from Part 1 (core claim, strongest evidence, your reaction).
- **The discussion:** What was the most interesting point someone else raised? (Attribute it: "My partner said..." or "Someone at my table argued...") Did anyone change your mind about something? What and why?
- **What's next:** What do you want to learn next? (A course, a technology, a skill, or a question you want to answer.)

---

## Submission

- **Reflection:** Submit `REFLECTION.md` through your Pawtograder lab repository

## Grading

:::info
**Full credit:** Attended lab, participated in discussion, submitted a thoughtful reflection that engages with the reading and the discussion.

**Not accepted:** Did not attend. This lab requires in-person participation — the discussion *is* the lab.
:::
