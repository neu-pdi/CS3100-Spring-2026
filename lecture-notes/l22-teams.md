---
sidebar_position: 22
lecture_number: 22
title: "L22: Teams and Collaboration"
---

# Teams and Collaboration

## Explain key advantages of working in a team and sharing information with your team (10 minutes)

Almost all real-world software is built by teams, not individuals. Even if you're the most talented programmer in the world, there are compelling reasons why professional software development is a team activity. We all work in teams: consider simply the scale of the course you are taking right now: with 500 students, 30 TAs and 4 instructors, the course only exists because of the work of many people.

### The Myth of the "10x Engineer"

You may have heard the claim that some engineers are "10x" more productive than others. While individual skill varies, this framing misses a crucial point: **nobody is an expert in everything**.

Modern software engineering draws on many distinct skills:
- Product management (what should we build?)
- Project management (how do we coordinate building it?)
- System-level design and architecture
- Unit-level design and implementation
- Operations and deployment
- Maintenance and support
- User experience and accessibility

A team allows individuals to contribute their strengths while compensating for each other's weaknesses. The "10x engineer" who can't communicate, document, or collaborate may actually slow down the team overall.

### Cognitive Diversity: Why Different Perspectives Matter

Beyond complementary technical skills, effective teams benefit from **cognitive diversity**—having members who think differently, approach problems from different angles, and bring different life experiences.

Cognitive diversity improves outcomes because:
- **Different perspectives catch different blind spots.** A security-focused engineer notices vulnerabilities that a feature-focused engineer might miss. Someone with a different cultural background may spot assumptions that don't hold globally.
- **Debate improves decisions.** When everyone thinks alike, bad ideas go unchallenged. Constructive disagreement leads to better solutions.
- **Creativity emerges from intersection.** New ideas often come from combining insights from different domains or backgrounds.

This means that working with people who are different from you isn't just a nice thing to do—it produces better software. The discomfort of having your assumptions challenged is the feeling of blind spots being revealed.

### Brooks' Law and Communication Overhead

In his classic 1975 book *The Mythical Man-Month*, Fred Brooks observed:

> "Adding manpower to a late software project makes it later."

This counterintuitive claim—known as **Brooks' Law**—stems from the mathematics of communication. In a team of *n* people, the number of possible communication paths is:

$$\frac{n(n-1)}{2}$$

| Team Size | Communication Paths |
|-----------|---------------------|
| 2         | 1                   |
| 4         | 6                   |
| 8         | 28                  |
| 16        | 120                 |

Communication overhead grows *quadratically* with team size. This is why simply adding more people to a struggling project often makes things worse—the new team members need to be brought up to speed, and everyone spends more time coordinating and less time coding.

Hence, it is important to plan upfront how to structure a team.

### Scalable Knowledge Sharing

Because of Brooks' Law, successful teams need communication mechanisms that scale *sub-linearly* with team growth. Not all knowledge-sharing approaches are created equal:

**One-to-one (doesn't scale well):**
- Mentorship sessions
- Hallway conversations
- Direct messages

**One-to-many (scales better):**
- Code review (synchronous, but knowledge spreads)
- Pair programming (immediate knowledge transfer)
- Q&A forums and mailing lists (asynchronous, searchable)

**One-to-many, persistent (scales best):**
- Documentation and wikis
- Recorded tech talks
- Blog posts and tutorials
- Well-commented code

A useful rule of thumb: **if you've explained something to more than two people, write it down.** The third explanation should be a link to documentation.

Research shows that developers see approximately a **50% productivity boost** when documentation is up-to-date, detailed, and available in multiple formats. Good documentation isn't just nice to have—it's a force multiplier for the entire team.

## Describe the stages of team formation and strategies for establishing productive working agreements (15 minutes)

### Tuckman's Stages of Team Formation

Psychologist Bruce Tuckman identified four stages that teams typically go through:

1. **Forming**: Team members meet, learn about the project, and establish initial relationships. People are often polite but guarded.

2. **Storming**: Conflicts emerge as team members push against boundaries. Different working styles clash. This stage is uncomfortable but necessary.

3. **Norming**: The team establishes shared expectations and working agreements. Roles clarify, trust develops, and collaboration improves.

4. **Performing**: The team operates effectively toward shared goals. Members understand each other's strengths and compensate for weaknesses.

Understanding these stages helps teams recognize that conflict (storming) is a normal part of development, not a sign of failure. The goal is to move through storming into norming and performing as efficiently as possible.

### Team Contracts and Norming

When forming a new team, it's valuable to explicitly discuss and document expectations. A **team contract** addresses questions like:

- When are we available to work together? What are our schedules like?
- How do we prefer to communicate? (Text, video call, in-person?)
- How do we handle deadlines? (Head start vs. last-minute workers?)
- What does "done" mean for our work?
- How will we divide work and make decisions?
- What do we do when someone is blocked or struggling?

These conversations surface potential conflicts *before* they become problems. A team member who prefers to start work early and one who works best under deadline pressure can negotiate expectations upfront rather than discovering the mismatch mid-project.

### Tracking Progress with GitHub

GitHub provides several tools for tracking project progress:

**Issues** are the fundamental unit of work tracking:
- Each issue represents a bug, feature, or task
- Issues can be assigned to team members
- Labels help categorize and filter (bug, enhancement, documentation, etc.)
- Milestones group issues into releases or sprints

**Projects** provide kanban-style boards:
- Columns represent workflow stages (To Do, In Progress, In Review, Done)
- Cards can be linked to issues and pull requests
- Automation can move cards as issues progress

**Pull Requests** connect code changes to issues:
- Reference issues with "Fixes #123" or "Closes #456"
- Request reviews from specific team members
- Discussion threads capture design decisions

Regular check-ins (daily standups, weekly syncs) help surface blockers early. Research on student software teams found that **weekly surveys** effectively identify struggling teams before problems become critical—a practice that works equally well in professional settings.

## Describe the HRT pillars of social interaction and strategies for resolving team conflicts (10 minutes)

The book *Team Geek* (later expanded as *Debugging Teams*) by Brian Fitzpatrick and Ben Collins-Sussman—both former Google engineers—introduces the **HRT framework** (pronounced "heart") for effective team collaboration. These are pillars that we will hold you accountable to in group work in this course.

### The Three Pillars

**Humility**: You are not the center of the universe (nor is your code!). You're neither omniscient nor infallible. You're open to self-improvement.

This means:
- Admitting when you don't know something
- Accepting that your code can be improved
- Being willing to change your mind when presented with better arguments
- Recognizing that others have valuable perspectives

**Respect**: You genuinely care about others you work with. You treat them kindly and appreciate their abilities and accomplishments.

This means:
- Giving credit where it's due
- Listening to understand, not just to respond
- Assuming competence and good intentions
- Valuing contributions different from your own

**Trust**: You believe others are competent and will do the right thing, and you're OK with letting them drive when appropriate.

This means:
- Delegating without micromanaging
- Giving people space to make (and learn from) mistakes
- Not rewriting others' code without discussion
- Trusting teammates to ask for help when needed

### Applying HRT to Code Review

Code review is where HRT principles are tested daily. Compare these approaches:

**Without HRT:**
> "This is wrong. Use a HashMap instead."
>
> "Why would you do it this way?"
>
> "This whole function needs to be rewritten."

**With HRT:**
> "Have you considered using a HashMap here? It would give us O(1) lookups instead of O(n)."
>
> "I'm curious about this approach—what led you to this design?"
>
> "I'm having trouble following the logic in this function. Could we pair on simplifying it?"

The HRT version accomplishes the same technical goals while treating the author as a capable colleague rather than a subordinate to be corrected.

### Conflict Resolution

Even with HRT, conflicts happen. When they do:

1. **Work from the same set of facts.** Many conflicts stem from different assumptions or information. Start by establishing what everyone actually knows.

2. **Talk about how the situation made you feel.** "I felt frustrated when..." is more productive than "You always..."

3. **Never presume intent.** Assume good faith until proven otherwise.

4. **Remain calm.** If you feel triggered, step away and return later. Decisions made in anger rarely improve the situation.

5. **"Fight forward, not back."** Focus on solutions and next steps, not on assigning blame for past mistakes.

6. **Escalate appropriately.** If you reach an impasse, bring in a neutral third party (team lead, mentor, manager) to help mediate—but don't expect them to solve the problem for you.

### Accountability: Being Someone Your Team Can Rely On

Accountability isn't about blame—it's about being the kind of teammate others can depend on. In professional settings, accountability means:

**Owning your commitments:**
- If you say you'll do something, do it—or communicate early if you can't
- Don't wait until the deadline to reveal that you're stuck
- When you make a mistake, acknowledge it and focus on the fix, not excuses

**Taking responsibility for outcomes, not just effort:**
- "I worked hard on it" isn't the same as "it's done and working"
- Results matter, but so does how you handle setbacks
- Ask for help when you need it—struggling silently isn't heroic

**Supporting team outcomes, not just your own work:**
- If a teammate is struggling, offer help before being asked
- If you finish early, ask what else needs doing
- The team succeeds or fails together

Accountability builds trust. When teammates know they can count on you, the team moves faster because they don't need to constantly check in or build redundancy around unreliable members.

## Seeking and receiving feedback effectively (5 minutes)

We've discussed how to *give* good feedback in code review, but *seeking* feedback is equally important—and often harder.

### Why seeking feedback is a professional skill

Early in your career (and throughout it), others can see things about your work that you can't. Your code might have patterns you don't notice. Your communication style might be unclear in ways you don't realize. Seeking feedback is how you accelerate your own growth.

**The catch:** Many people wait for feedback to come to them, or only hear it during formal reviews. Proactively seeking feedback—especially when it's uncomfortable—is what separates professionals who grow quickly from those who plateau.

### How to seek feedback effectively

**Ask specific questions:**
- ❌ "What did you think of my code?"
- ✅ "I'm trying to improve my API design. Were the method signatures in this PR clear? What would have made them clearer?"

**Ask the right people:**
- Someone who will be honest with you (not just nice)
- Someone with relevant expertise or perspective
- Someone who has observed your work directly

**Make it safe to be honest:**
- "I'm genuinely trying to improve—honest feedback helps more than kind feedback."
- Don't argue or defend when receiving feedback; just listen and ask clarifying questions
- Thank people for critical feedback (it's harder to give than praise)

### Receiving feedback without defensiveness

When you receive feedback, your instinct may be to explain, defend, or minimize. Resist this urge.

**Instead:**
1. **Say "thank you"** before responding. This creates space between your reaction and your response.
2. **Ask clarifying questions** if you don't understand: "Can you give me an example?"
3. **Reflect before reacting.** You don't have to agree immediately, but don't dismiss feedback just because it's uncomfortable.
4. **Follow up.** After you've had time to process, decide what to act on. Tell the person what you changed—it encourages them to give feedback again.

### The discomfort is the point

Useful feedback often feels uncomfortable because it reveals blind spots. If all the feedback you receive feels good, you're probably only hearing from people who tell you what you want to hear. Seek out the people who will challenge you.

## Write clear and specific GitHub issues, pull requests, and comments (10 minutes)

### Anatomy of a Good Issue

A well-written issue makes it easy for someone else (or future-you) to understand and address the problem. Good issues include:

**A clear, specific title:**
- ❌ "Unable to login"
- ✅ "Login fails silently when password contains special characters"

However, if you are not certain about the exact problem, it is better to not assume that you know the specific problem. For example, if you have only attempted to login with a password that contains special characters, it may in fact be a different problem causing you to be unable to login. In this case, a title "Unable to login" is preferrable.

**A description with context:**
- What were you trying to do?
- What did you expect to happen?
- What actually happened?

**Reproduction steps** (for bugs):
1. Go to the login page
2. Enter username "testuser"
3. Enter password "p@ss#word!"
4. Click "Sign In"
5. Observe: nothing happens, no error message displayed

**Environment details** (when relevant):
- Browser/OS version
- Relevant configuration
- Error messages or logs

**Screenshots or recordings** (for UI issues):
- Annotate to highlight the problem area

### Pull Request Best Practices

Pull requests are both a code integration mechanism and a knowledge-sharing opportunity. Good PRs:

**Link to the issue they address:**
```markdown
Fixes #42

This PR adds input validation for special characters in passwords.
```

**Keep changes small and focused:**
- One logical change per PR
- Easier to review, easier to revert if needed
- Aim for PRs that can be reviewed in 15-30 minutes

**Include meaningful commit messages:**
- ❌ "fix bug"
- ❌ "WIP"
- ✅ "Add regex validation for password special characters"
- ✅ "Display error toast when login validation fails"

**Explain the "why," not just the "what":**
- The code shows *what* changed
- The description should explain *why* this approach was chosen

### Code Review as Knowledge Sharing

Code review serves multiple purposes beyond catching bugs:
- **Knowledge transfer**: Reviewers learn about parts of the codebase they didn't write
- **Consistency**: Team members align on style and patterns
- **Mentorship**: Junior developers learn from feedback; senior developers articulate their reasoning

When reviewing code, apply the HRT principles (discussed below):
- **Ask questions** rather than making demands: "What if we used X here?" vs. "Use X."
- **Explain your reasoning**: "This could cause a null pointer if Y because Z."
- **Acknowledge good work**: "Nice refactor here—much cleaner than before!"
- **Critique the code, not the person**: "This function is hard to follow" vs. "You wrote confusing code"

## Ask technical questions effectively (10 minutes)

### The Anatomy of a Bad Question

Consider this [real Stack Overflow question](https://stackoverflow.com/questions/31279359/new-to-coding-can-anyone-assist-me):

> **New To Coding. Can anyone assist me?**
>
> I am trying to make a word counter and I just can't seem to get it. Can anyone help?
>
> ```python
> import re
> print("Welcome To This Software Made By Aaron!")
> word = raw_input("Enter Your Words: ")
> # ... [code omitted]
> ```

This question received downvotes and no helpful answers. Why?
- The title is vague and doesn't describe the actual problem
- "Can't seem to get it" doesn't explain what's going wrong
- No error message or description of unexpected behavior
- No indication of what was already tried

Unhelpful questions waste everyone's time, including your own.

### Make It Easy for People to Help You

A good technical question follows this template:

> **I am trying to** [goal] **so that I can** [context/motivation].
>
> **I am running into** [specific problem—error message, unexpected behavior, etc.].
>
> **I have looked at** [resources consulted] **and tried** [approaches attempted].
>
> **My tech stack is:** [relevant versions and configuration].
>
> **I think the problem could be** [your hypothesis, if you have one].

This structure helps in several ways:
- The goal and context help others understand what you actually need
- The specific problem lets people diagnose without guessing
- Resources consulted shows you've done your homework
- Your hypothesis gives experts a starting point

### Avoid Duplication

Before asking a question, **search first**. Your question has probably been asked before:

- Search Stack Overflow and relevant forums
- Search your team's Slack/Discord history
- Check project documentation and wikis
- Search closed GitHub issues

If you find a partial answer, reference it in your question: "I found [this thread], but it doesn't address [specific aspect]."

### Archive and Share Answers

When you solve a problem (or someone helps you solve it), **document the solution**:
- Update the original thread with what worked
- Add to your team's wiki or FAQ
- Consider writing a blog post for common issues

You're probably not the only one who will encounter this problem. The time you spend documenting saves future team members from duplicating your struggle—and that future team member might be you in six months.

This connects back to scalable knowledge sharing: every documented solution is one less interruption for your teammates.
