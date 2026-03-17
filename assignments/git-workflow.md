---
title: "Git Workflow for Team Projects"
sidebar_position: 8.5
---

This document defines the git workflow your team will use for the group project. In [L22: Teams and Collaboration](/lecture-notes/l22-teams), we covered *why* professional teams use branches, pull requests, and code review. This document is the *how*.

**A note on tools:** This document shows git commands on the command line, but you are 100% encouraged to use VSCode's built-in Git and GitHub integration instead. VSCode has excellent support for branching, staging, committing, pushing, opening PRs, and doing code reviews — all without touching the terminal. Use whichever you're more comfortable with. The concepts are the same either way.

Read this whole document before your first team coding session.

---

## The Rules

These are non-negotiable for the group project:

1. **No direct commits to `main`.** All changes go through a pull request.
2. **Every feature gets its own branch.** During the core features phase, each person owns one feature, so you'll each have a feature branch (e.g., `feature/library-browser`, `feature/recipe-editor`). But branches are per *task*, not per person — if you're working on a shared concern like integration or a cross-cutting refactor, create a shared branch for that too. You may end up with multiple branches over the course of the project.
3. **Every PR needs at least one approving review before merge.** The author cannot review their own PR.
4. **Pull from `main` before starting new work.** Always start from a fresh copy.
5. **CI must pass before merging.** If the autograder fails on your PR, fix it before merging.

**Why these rules?** Remember Brooks' Law from lecture: communication overhead grows quadratically with team size. These rules create *structured* communication. Instead of four people messaging each other "hey, did you change this file?", git tracks exactly who changed what, when, and why. The PR review process is where HRT (Humility, Respect, Trust) gets practiced daily — you're trusting your teammate to review your work, showing humility by accepting feedback, and showing respect by giving thoughtful reviews.

---

## Setup (One Time)

Every team member does this once:

```bash
# Clone the team repository (replace with your actual repo URL)
git clone <repo-url>
cd sp26-repo-name

# Verify you're on main
git branch
# Should show: * main

# Verify the remote is set up
git remote -v
# Should show your team's repo URL for both fetch and push
```

---

## The Workflow: Step by Step

Here is the full cycle you will repeat for every piece of work.

### Step 1: Update your local `main`

Before starting any new work, make sure your local `main` matches what's on GitHub:

```bash
git checkout main
git pull origin main
```

**Why this matters:** Your teammates may have merged PRs since you last worked. If you skip this step, you'll be building on stale code, which makes merge conflicts much more likely.

### Step 2: Create a feature branch

```bash
git checkout -b feature/library-search-bar
```

This creates a new branch *and* switches to it. You are now working in your own independent stream of commits — nothing you do here affects `main` until you explicitly merge it.

**Branch naming conventions:**

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feature/short-description` | `feature/recipe-import-csv` |
| Bug fix | `fix/short-description` | `fix/search-returns-duplicates` |
| Refactor | `refactor/short-description` | `refactor/extract-recipe-parser` |

Rules for branch names:
- Lowercase, hyphens between words (no spaces, no underscores)
- Keep it short but descriptive — someone reading the branch name should know what it's about
- Include the component if helpful: `feature/library-sort-by-date`, `feature/import-json-validation`

**Bad branch names:** `mybranch`, `stuff`, `alice-work`, `test123`, `final`, `final-v2`

### Step 3: Do your work and commit

Work on your feature. Commit early and often — commits are cheap and give you save points to go back to:

```bash
# Check what you've changed
git status

# Stage specific files (preferred — you know exactly what's going in)
git add src/main/java/cookyourbooks/library/SearchBar.java
git add src/test/java/cookyourbooks/library/SearchBarTest.java

# Commit with a descriptive message
git commit -m "Add search bar component with keyword filtering"
```

**Writing good commit messages:**
- Start with a verb: "Add", "Fix", "Update", "Remove", "Refactor"
- Describe *what* changed, not *how*: "Add CSV import for recipes" not "Changed RecipeImporter.java"
- Keep the first line under 72 characters

```
Good:  "Add keyword search filtering to library view"
Good:  "Fix null pointer when recipe has no ingredients"
Good:  "Refactor RecipeParser to use Strategy pattern"
Bad:   "fixed stuff"
Bad:   "WIP"
Bad:   "changes"
Bad:   "asdfasdf"
```

You can (and should) make multiple commits on a branch. Each commit should be a logical unit of work:

```bash
git commit -m "Add SearchBar GUI component"
# ... more work ...
git commit -m "Add keyword filtering logic to SearchBar"
# ... more work ...
git commit -m "Add tests for SearchBar keyword filtering"
```

### Step 4: Push your branch to GitHub

```bash
git push origin feature/library-search-bar
```

The first time you push a branch, you may see a suggestion to set the upstream. You can use:

```bash
git push -u origin feature/library-search-bar
```

After that, `git push` alone will work for that branch.

**Push frequently.** Pushing is your backup. If your laptop dies, your code is safe on GitHub. It also lets teammates see what you're working on.

### Step 5: Open a Pull Request

Go to your team's repository on GitHub. You'll see a banner saying "feature/library-search-bar had recent pushes — Compare & pull request." Click it.

Fill in the PR:

**Title:** Short, descriptive summary (like a commit message)
```
Add search bar with keyword filtering to Library View
```

**Description:** Explain what this PR does and why. Your reviewer hasn't been staring at this code for the last two hours — give them context.

```markdown
## What this does
Adds a search bar to the Library View that filters recipes by keyword.
Users can type in the search bar and the recipe list updates in real time.

## How to test
1. Run the app and navigate to the Library View
2. Type "pasta" in the search bar
3. Verify that only recipes containing "pasta" in the title or ingredients appear

## Notes
- Uses the existing `RecipeFilter` interface from A5
- I considered using a regex-based search but went with simple `contains()`
  for now since the dataset is small. We can revisit if performance matters.
```

**Why write all this?** Remember from lecture: PR descriptions are *searchable artifacts*. Six months from now (or three weeks from now, during Checkpoint 2), someone will ask "why does search work this way?" The PR description is the answer. This is scalable communication — write it once, anyone can find it later.

### Step 6: Request a review

On the PR page, use the "Reviewers" sidebar on the right to request a review from a teammate. Pick someone who:
- Didn't write this code (obviously)
- Ideally works on a related component (they'll catch integration issues)

Don't just open the PR and wait silently. Post in your team's communication channel: "PR up for search bar feature, would appreciate a review."

### Step 7: Do the code review

When a teammate requests your review, you have a responsibility to review it *promptly* — within 24 hours. A PR sitting unreviewed blocks your teammate.

**How to review:**

1. **Read the PR description first.** Understand what the PR is trying to do before looking at any code.
2. **Look at the file changes tab.** GitHub shows you a diff of every file that changed.
3. **Leave comments on specific lines.** Click the `+` icon next to any line to leave a comment.
4. **Submit your review** with one of three options:
   - **Approve**: Looks good, merge it.
   - **Request changes**: There are issues that need to be fixed before merging.
   - **Comment**: General feedback, not blocking.

**What to look for:**
- Does the code do what the PR description says?
- Are there tests? Do they test meaningful behavior?
- Is the code readable? Could you maintain it?
- Are there obvious bugs (null checks, off-by-one, edge cases)?
- Does it follow the project's existing patterns?

**How to write review comments (HRT in practice):**

Remember from lecture — the same technical feedback can either build trust or destroy it. Here's the difference:

| Instead of this | Write this |
|-----------------|-----------|
| "This is wrong." | "I think this might cause a null pointer if `recipes` is empty — what do you think?" |
| "Why did you do it this way?" | "Interesting approach. I was curious about the choice to use a `List` here — would a `Set` help avoid the duplicate issue?" |
| "This is inefficient." | "Have you considered using a `HashMap` for the lookup? Might be faster for large recipe collections." |
| "You forgot to add tests." | "Could you add a test case for when the search query is empty? I want to make sure we handle that edge case." |

The left column shuts down conversation. The right column invites dialogue, treats the author as a capable colleague, and often leads to a better solution than either person would have reached alone.

**What to do if you get feedback on your PR:**

Don't take it personally. This is not a judgment of your worth as a programmer — it's a teammate helping you ship better code. Address each comment:
- If you agree: make the fix, push a new commit, reply saying "Fixed" or "Good catch, updated."
- If you disagree: explain your reasoning. "I considered that, but went with X because..." This is a discussion, not a command.

### Step 8: Merge the PR

Once you have at least one approving review and CI passes:

1. On the PR page, click the dropdown arrow next to "Merge pull request" and select **"Squash and merge."**
2. GitHub will show you a combined commit message — edit it to be a clean summary of the entire PR (e.g., "Add search bar with keyword filtering to Library View").
3. Click "Confirm squash and merge."

**What is squash merging?** While you're working on a branch, you'll make many small commits ("WIP", "fix typo", "actually fix the test", etc.). That's fine — commit early and often on your branch. But when you merge to `main`, squash merging combines all of those commits into a single, clean commit. This keeps `main`'s history readable: each commit on `main` represents one complete feature or fix, with a clear message.

Your branch still retains the full detailed history if anyone needs to see it.

**Do NOT delete your branches after merging.** When GitHub offers to delete the branch, click "Close" or just ignore it. Leave branches around — your TAs use the branch history to see your development process during code walks. Deleting branches makes it harder for us to assess your work.

Locally, switch back to main and pull:

```bash
git checkout main
git pull origin main
```

That's it. One cycle complete. Now go back to Step 1 for your next piece of work.

---

## Common Pitfalls and How to Fix Them

### "I accidentally committed to `main`"

This happens to everyone. Here's how to fix it *before* you push:

```bash
# You're on main and just committed by accident.
# First, create the branch you should have been on:
git branch feature/my-new-thing

# Reset main back to where it should be (the remote version):
git reset --hard origin/main

# Switch to your new branch (which has your commit):
git checkout feature/my-new-thing
```

**Important:** This only works if you haven't pushed yet. If you already pushed to `main`, talk to your team immediately. Do not try to force-push.

### "I forgot to pull before starting work"

You've been working on a branch, but `main` has moved forward since you created it. When you try to merge, there are conflicts or your branch is "behind."

Update your branch with the latest from `main`:

```bash
# Make sure you've committed all your work on your branch first
git add .
git commit -m "Save current progress on search feature"

# Get the latest main
git checkout main
git pull origin main

# Go back to your branch and merge main into it
git checkout feature/library-search-bar
git merge main
```

If there are no conflicts, git will create a merge commit and you're done. If there are conflicts, see below.

### "I have a merge conflict"

Merge conflicts happen when two people edited the same lines in the same file. Git doesn't know which version to keep, so it asks you to decide.

When you run `git merge main` and get a conflict, git will show you something like:

```
CONFLICT (content): Merge conflict in src/main/java/cookyourbooks/library/LibraryView.java
Automatic merge failed; fix conflicts and then commit the result.
```

Open the conflicting file. You'll see markers like this:

```java
<<<<<<< HEAD
    private List<Recipe> filterByKeyword(String keyword) {
        return recipes.stream()
            .filter(r -> r.getTitle().contains(keyword))
            .collect(Collectors.toList());
    }
=======
    private List<Recipe> filterByKeyword(String query) {
        return recipes.stream()
            .filter(r -> r.getTitle().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
    }
>>>>>>> main
```

- Everything between `<<<<<<< HEAD` and `=======` is **your version** (on your branch).
- Everything between `=======` and `>>>>>>> main` is **their version** (from main).

**To resolve:**
1. Look at both versions. Decide which is correct, or combine them.
2. Remove all the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Make sure the file is correct and compiles.
4. Stage and commit:

```bash
git add src/main/java/cookyourbooks/library/LibraryView.java
git commit -m "Merge main into feature/library-search-bar, resolve conflict in LibraryView"
```

**Stuck on a merge conflict?** AI tools like GitHub Copilot or Claude Code are great at resolving merge conflicts. They can see both versions and the surrounding context, and usually propose a correct resolution. This is a good use of AI insofar as you can make the decision about what the code should do, and the tool is handling the mechanical parts of the merge.

**How to prevent merge conflicts:**
- Pull from `main` frequently (daily if your team is active).
- Keep branches small and short-lived. A branch that lives for a week touching 20 files will conflict with everything.
- Communicate with your team: "I'm working on LibraryView today" — so someone else doesn't edit the same file simultaneously.

### "My teammate and I are working on the same file"

This is normal in a team project. It becomes a problem only when you edit the *same lines*. Strategies:
- Talk to each other. "I'm changing the constructor in `RecipeService`" takes five seconds and saves an hour of conflict resolution.
- Merge `main` into your branch frequently.
- Keep your changes focused. If you're working on search, don't also reformat the entire file.

### "I don't know what branch I'm on"

```bash
git branch
```

The one with the `*` is your current branch. You can also see it in your terminal prompt if your shell is configured for it.

### "I want to see what my teammate is working on"

```bash
# Fetch all remote branches
git fetch origin

# List all branches (local and remote)
git branch -a

# Look at a teammate's branch without switching to it
git log origin/feature/recipe-import-csv --oneline -10
```

### "I pushed something I shouldn't have"

If you pushed sensitive information (API keys, passwords) or broke something badly — tell your team in your group channel immediately. Do not try to quietly fix it. Your TA mentor can help.

---

## Putting It All Together: A Day in the Life

Here's what a typical work session looks like:

```bash
# Start of session: get the latest code
git checkout main
git pull origin main

# Create a branch for today's task
git checkout -b feature/import-json-validation

# ... write code, run tests locally ...

# Commit your work
git add src/main/java/cookyourbooks/importer/JsonValidator.java
git add src/test/java/cookyourbooks/importer/JsonValidatorTest.java
git commit -m "Add JSON schema validation for recipe imports"

# Push to GitHub
git push -u origin feature/import-json-validation

# Open PR on GitHub, request review, post in team channel

# While waiting for review, you can start another branch for a different task:
git checkout main
git pull origin main
git checkout -b fix/import-duplicate-detection

# When your PR is approved, merge it on GitHub, then locally:
git checkout main
git pull origin main
```

---

## Quick Reference

| I want to... | Command |
|---------------|---------|
| See what branch I'm on | `git branch` |
| Create a new branch | `git checkout -b feature/name` |
| Switch to an existing branch | `git checkout branch-name` |
| See what I've changed | `git status` |
| See the actual diff | `git diff` |
| Stage files | `git add file1 file2` |
| Commit | `git commit -m "message"` |
| Push my branch | `git push origin branch-name` |
| Update main | `git checkout main && git pull origin main` |
| Merge main into my branch | `git merge main` (while on your branch) |
| See recent history | `git log --oneline -10` |
| See all branches | `git branch -a` |

---

## Team Workflow Checklist

Use this as a reminder until the workflow becomes second nature:

- [ ] Did I pull the latest `main` before creating my branch?
- [ ] Is my branch name descriptive? (`feature/...`, `fix/...`, `refactor/...`)
- [ ] Are my commits small and well-described?
- [ ] Did I write a PR description explaining *what* and *why*?
- [ ] Did I request a review from a teammate?
- [ ] When reviewing, did I check: correctness, tests, readability?
- [ ] Did I write review comments with HRT? (Humility, Respect, Trust)
- [ ] Did CI pass before I merged?

---

## Getting Help

When you're stuck, use this escalation path:

1. **Course discussion board** — Post your question there first. Chances are someone else has hit the same issue, and the answer benefits everyone. TAs and instructors monitor the board.
2. **Your teammates** — Ask in your team channel. Often a teammate has already solved what you're stuck on.
3. **Your TA mentor** — If the discussion board and teammates can't help, bring it to your next TA meeting or message your TA directly.

**Specific situations:**
- **Git confusion:** `git log --oneline --graph --all` is your friend for understanding what happened. Post the output on the discussion board if you need help interpreting it.
- **Merge conflict you can't resolve:** Don't spend more than 15 minutes stuck. Ask for help. Unresolved conflicts get worse with time, not better.
- **Team process issues:** If a teammate isn't following this workflow (committing directly to main, not reviewing PRs, etc.), raise it with the team first, then escalate to your TA mentor. This is exactly the kind of accountability we discussed in lecture.
