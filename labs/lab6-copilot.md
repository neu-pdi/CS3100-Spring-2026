---
sidebar_position: 5
title: "Lab 6: AI Coding Agents"
image: /img/labs/web/lab6.png
---

# AI Coding Agents


## Learning Objectives
By the end of this lab, you will be able to:
- Utilize control flow and data flow analysis to understand unfamiliar code
- Utilize an AI programming agent to assist with understanding and implementation tasks
- Determine the appropriate level of abstraction and context to provide to AI programming agents
- Critically evaluate AI-generated code for correctness and maintainability
- Apply effective prompting strategies to maximize learning while using AI tools
- Consider the long-term maintainability implications of AI-generated code

![Lo-fi pixel art showing a cozy hilltop weather observation station where students and an instructor monitor 'AI Weather' together. A large board displays forecast predictions from pre-surveys: sunny icons next to quotes like 'AI will solve everything!' and 'Instant perfect code!'. Next to it, actual weather readings roll in: partly cloudy, scattered errors, occasional breakthroughs. One student adjusts a barometer labeled 'Expectations', another logs results in a shared journal. The instructor squints at conflicting instruments, equally uncertain. Through the window, the AI sky is a mix of sunshine and storm clouds—genuinely unpredictable. Sticky notes everywhere: 'Your data helps us calibrate!', 'Forecast improves with more observations'. A radar screen shows incoming survey responses as blips. A cozy mug of coffee, vintage weather instruments, warm lamp light against a moody sky. Banner: 'Prediction is hard—especially about AI.' Title: 'Lab 6: AI Coding Agents'.](/img/labs/web/lab6.png)


## Lab Structure (75 minutes)
1. Pre-workshop survey (10 minutes)
2. Understanding effective AI use (10 minutes)
3. Effective prompting practice (20 minutes)
4. Hands-on AI debugging exercise (25 minutes)
5. Post-workshop survey (5-10 minutes)
6. Reflection and discussion (5 minutes)
---

## Part 1: Pre-Workshop Survey (10 minutes)
Complete the [Lab 6 Pre-Workshop Survey](https://forms.gle/hUrsEfTtAaueKHe29) covering your expectations about:
- Speed benefits from using AI
- AI usefulness for coding
- AI correctness expectations
- AI's impact on learning

**[Please take the survey here](https://forms.gle/hUrsEfTtAaueKHe29)** then record the number under the thank-you message.

**Document in REFLECTION.md (Question 1a):**
- Pre-survey confirmation number: `_______________`
- Note: This number is not unique and your response is anonymous

---

## Part 2: Understanding Effective AI Use (10 minutes)

### The Golden Rule
**Always attempt the problem yourself first. Use AI as a tutor, not a solution generator.**

### When AI Helps Your Learning
- Explaining concepts you've encountered
- Generating diagrams to visualize code flow (sequence diagrams, call graphs)
- Explaining error messages after you've read them yourself
- Exploring alternative approaches after initial implementation
- Learning best practices for your existing code
- Generating test cases
- Understanding maintainability implications
- Verifying your hypotheses about bugs

### When AI Hurts Your Learning
- Skipping the thinking process ("just fix my code")
- Avoiding reading error messages
- Copying without understanding
- Replacing your debugging skills with "AI, find the bug"
- Bypassing concept learning
- Being unable to verify AI's suggestions

### Key Principles

**Verification is Essential:**
- AI makes mistakes—even confident responses can be wrong
- You are responsible for understanding all code you submit
- Test everything
- Understand before using

**Maintainability Matters:**
- Can you modify this code in 6 months?
- Is the abstraction level appropriate?
- Can you document it effectively?
- Do you understand this code even if it passed the required tests?
- Is AI needed for this task?

### Determining Context and Abstraction Level

**What context is essential?**
- Assignment requirements and constraints
- Existing code structure and patterns
- Specific error messages or behavior
- What you've already tried

**What level of abstraction is appropriate?**
- Too high-level: "Make a bank account system class"
- Too low-level: "Fix line 23"
- Just right: "Review my bank account classes withdrawal method's error handling approach"

### Evaluating AI-Proposed Changes

When the AI chat suggests code changes, don't just accept everything blindly. For each suggestion:

**Before applying any change, ask yourself:**
1. Do I understand what this change does?
2. Do I understand *why* this change works?
3. Does this match how I would solve the problem?
4. Could this introduce new bugs or side effects?

**Your options:**
- **Keep as-is:** You understand it and it's correct
- **Keep with modifications:** Good idea, but you'd implement it differently
  - For small changes: edit the code directly yourself
  - For larger changes: prompt AI to revise (e.g., "Can you change this to use a HashMap instead?")
- **Reject:** You don't understand it, or you disagree with the approach

**Important:** Rejecting a suggestion is not failure - it's critical thinking. You're the developer, not the AI.

> **Lab Leader Demo:** Your TA will demonstrate how to evaluate and selectively apply AI suggestions.

---

## Part 3: Effective Prompting Practice and Code Generation (20 minutes)

> **Learning Objectives:** Apply effective prompting strategies to maximize learning while using AI tools; Determine the appropriate level of abstraction and context to provide to AI programming agents

### The Anatomy of a Good Prompt
- **Specific** - Clear context and constraints
- **Complete** - All relevant code and error messages
- **Educational** - Asks for explanations, not just solutions
- **Maintainable** - Considers long-term code quality

### Exercise Overview
You will work with a blank folder that only has JUnit tests and practice different prompting strategies.

### The AnimalShelter System

You'll be implementing a simple animal shelter management system. Here's what it should do:

**Domain Concepts:**
- **Animal:** Has a name, species, and adoption status
- **AnimalShelter:** Manages a collection of animals
- **Adoption:** Changes an animal's status from available to adopted

**Key Operations:**
- Add animals to the shelter (with species tracking)
- Adopt animals (changing their status)
- Query shelter statistics (counts by species, adoption counts)
- Handle edge cases (adopting already-adopted animals, empty shelter, etc.)

**Before you prompt AI, identify:**
1. Which Java concepts will you need? (classes, enums, collections, etc.)
2. What data structures make sense for tracking animals?
3. What edge cases should the code handle?

### Two Prompting Approaches - Try Both!

**Approach A: Test-First**
> "Generate code that passes these tests in @AnimalShelterTests.java"

**Approach B: Concept-First**
> "I need an AnimalShelter class that manages animals with species tracking and adoption status. Design it with changeability in mind:
> - Use encapsulation (private fields, public methods)
> - Consider using an enum for animal status since new statuses might be added later
> - Keep the Animal class separate from AnimalShelter (modularity)
> - The shelter's internal data structure should be hidden from callers (information hiding)
> 
> Include methods for adding animals, processing adoptions, and getting statistics. Here are the tests it needs to pass: @AnimalShelterTests.java"

**Your Task:** Try BOTH approaches and compare:
- Which was faster to get working code?
- Which produced code you understood better?
- Which would be easier to modify if requirements changed?
- Did the AI make different design choices with each approach?
- For concept-first: Did the AI actually follow your changeability guidance (encapsulation, enums, modularity)? Or did it ignore some of it?

There's no "right answer" here - different situations may call for different approaches. Form your own opinion based on your experience.

---

**Steps:**
1. **Generate Code:**
    - Open GitHub Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`)
    - Navigate to the `part3_code_generation` folder in your lab repo
    - Try both prompting approaches above
    - Review the generated code

2. **Before running tests, pause and predict:**
    - What do you think will happen when you run the tests?
    - What parts of the AI-generated code look correct? Suspicious?
    - Rate your confidence (1-5) that this code will work as intended.

3. **Run Tests:**
    - Run the JUnit tests with Gradle:
      ```bash
      ./gradlew test --tests "part3_code_generation.AnimalShelterTests"
      ```
    - Record pass/fail results

4. **Document in REFLECTION.md (Question 2):**
    - What is working? What is broken?
    - Impressions of the prompt strength
    - What did you learn about basic prompting?
    - Which approach (Test-First vs Concept-First) worked better for you? Why?
    - How much of the code generated do you understand?

> **Quick Reflection:** Did AI understand your intent on the first try? What does this tell you about prompt specificity?

---

## Part 4: Hands-On AI Debugging Exercise (25 minutes)

> **Learning Objectives:** Utilize control flow and data flow analysis to understand code; Critically evaluate AI-generated fixes for correctness

### Overview
Now that you've worked with creating code with AI, you'll practice debugging—but **understanding comes first**. You can't fix what you don't understand.

### Exercise Setup
1. Navigate to `src/main/java/part4_debugging/` in your lab repo
2. Choose **one** of the two options to debug:
   - **Bank** (`bank/` folder) - Bank account management with transactions
   - **Music** (`music/` folder) - Instrument management utility methods
3. Each folder contains:
   - Multiple Java files with intentional bugs
   - A `bugs.md` file listing the expected bugs (check your findings against this **after** you've done your own analysis)
   - JUnit tests to verify your fixes

**Running the tests with Gradle:**
```bash
# Run Bank tests
./gradlew test --tests "part4_debugging.bank.BankTest"

# Run Music tests  
./gradlew test --tests "part4_debugging.music.MusicTest"

# Run all Part 4 tests
./gradlew test --tests "part4_debugging.*"
```

---

### Part 4.1: Understand the Code First (10 minutes)

**Before looking for bugs, spend time understanding the code.**

Choose an approach that works for you:
- **Ask AI to generate a diagram** (call graph, sequence diagram, class diagram)
- **Trace control flow:** What methods call what? What branches exist?
- **Trace data flow:** How do values change? What edge cases could break?
- **Combine approaches** as needed

**Example prompts:**
> "Create a Mermaid diagram showing how methods in `BankAccount.java` call each other"

> "What are the key fields in this class and where do they get modified?"

**Then run the tests** to see what's failing.

---

### Part 4.2: Find and Fix the Bugs (12 minutes)

**The Rule:** Don't fix anything you can't explain.

For each failing test:
1. Read the test—what does it expect?
2. Trace through the code—what actually happens?
3. Find the bug, fix it, verify with the test

**Using AI appropriately:**

✅ **Good:** "Explain what this line does" / "What could cause X instead of Y?"

❌ **Avoid:** "Find all the bugs" / "Fix this for me"

After fixing, run ALL tests to make sure you didn't break anything.

**Partner Check (2 min):** Explain one bug to your partner without reading notes. Partner's job: ask one clarifying question, then share what was clear vs. confusing about the explanation.

---

### Document in REFLECTION.md (Question 3):
- How did you explore the code? Did it help?
- What bugs did you find and fix? (brief)
- Did you find all bugs in `bugs.md`?
- How did you use AI—to understand, or to get quick fixes?

---

## Part 5: Post-Workshop Survey (10 minutes)

Complete the [Lab 6 Post-Workshop Survey](https://forms.gle/9MpRjuLQ8fhB53eo6)

Reflect on how your expectations changed regarding:
- Speed expectations
- Productivity benefits
- AI correctness
- Time to learn effective AI use
- Future AI usage plans

**[Please take the survey here](https://forms.gle/9MpRjuLQ8fhB53eo6)** then record the number under the thank-you message.

**Document in REFLECTION.md (Question 1b):**
- Post-survey confirmation number: `_______________`
- Note: This number is not unique and your response is anonymous

---

## Part 6: Reflection and Takeaways (5 minutes)

### Key Lessons
**Document in REFLECTION.md (Question 4):**

1. What surprised you most about working with AI for coding?
2. What's one thing you'll always do before accepting AI-suggested code?
3. Which prompting strategy worked best for you?
4. How will you use AI differently in future assignments?

### Best Practices Checklist
Commit to these practices going forward:

- I will always attempt problems myself before asking AI
- I will provide complete context in prompts
- I will ask AI to explain WHY, not just provide fixes
- I will verify every AI suggestion with tests
- I will only use code I can fully explain
- I will use AI as a tutor, not a solution generator
- I will be skeptical of AI responses and double-check them
- I will consider long-term maintainability
- I will use appropriate abstraction levels
- I will fix bugs incrementally when learning, not all at once
- I commit to these practices.

---

## Submission Requirements

Submit your completed `REFLECTION.md` file containing:
- **Question 1:** Survey confirmation numbers (1a: pre-survey, 1b: post-survey)
- **Question 2:** Code generation exercise (comparing Test-First vs Concept-First prompting)
- **Question 3:** Debugging exercises (3a: bug identification, 3b: bug fixing strategies)
- **Question 4:** Final reflection and takeaways

**Filename:** `REFLECTION.md` (in your lab repo)
**Submission:** Push to your repository by the end of the lab session

---

## Remember

**AI is a tool to enhance your learning, not replace it.**

### The 3-Question Test
Before using any AI-generated code, ask yourself:
1. **Can I explain this?** If not, don't use it.
2. **Can I modify this?** If not, you don't understand it.
3. **Can I debug this?** If not, you'll be stuck when it breaks.

### Understanding With AI Before Fixing
When you encounter unfamiliar code or a bug and would like to use AI to understand or fix it:
1. **Visualize** — Use AI to generate diagrams showing how the code fits together
2. **Trace** — Follow control flow (what calls what) and data flow (how values change)
3. **Then debug** — Only after you understand the structure

### Your AI Usage Philosophy
Write one sentence describing how you will use AI in future assignments:

> "I will use AI to ________________________________, but I will always ________________________________."

---

### Share What You Learned

**Discussion Board:** Post to the **Lab 6** topic on the course discussion board:
- An effective prompt you discovered
- A surprising AI response
- A debugging insight that might help classmates

Your classmates in other sections will benefit from what you learned!

---

The goal is to learn how to:
- Understand unfamiliar code through control flow and data flow analysis
- Use AI for visualization and explanation, not to skip understanding
- Evaluate code critically
- Debug effectively by understanding first

Success means understanding code better and knowing when AI helps versus hurts your learning—regardless of how many bugs you fixed.
