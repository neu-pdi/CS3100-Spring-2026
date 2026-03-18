---
title: "Group Assignment 1: Core Features"
sidebar_position: 10
image: /img/assignments/web/ga1.png
---


## Overview

In this assignment, your team implements the four core GUI features for CookYourBooks. Each team member owns one feature and is individually accountable for their ViewModel and View implementation, which will be manually evaluated by course staff. Teams collaborate on shared infrastructure, integration, and code review. **Teams of three** may omit the "Search & Filter" feature (as in GA0); the omitted feature is not reassigned—each of the remaining three core features must have one owner, and grading applies only to the features you implement.

![8-bit lo-fi pixel art illustration for a programming assignment cover. Kitchen/bakery setting with warm wooden cabinets and countertops in browns and tans. Scene composition divided into four distinct workstation quadrants, each staffed by a diverse pixel art developer (varying gender, skin tone, and hair style) building one core GUI feature of the CookYourBooks recipe app. TOP-LEFT QUADRANT "Library View": A developer browses a tall pixel art bookshelf filled with cookbooks, a navigation tree panel on a monitor shows expandable folders for "My Cookbooks", "Personal Collection", "Web Imports". Small cookbook icons with colored spines line the shelf. TOP-RIGHT QUADRANT "Recipe Editor": A developer works at a monitor showing a recipe detail form with editable fields — title, ingredients list with quantity/unit/name columns, instruction steps, and a validation checkmark icon. A recipe card on the desk shows red underlines for invalid fields. BOTTOM-LEFT QUADRANT "Import Interface": A developer holds a physical cookbook page up to a pixel art camera/scanner. The monitor shows an OCR progress bar at 60%, a spinning loader, and a preview of extracted text. An error dialog box floats nearby with a friendly retry button. BOTTOM-RIGHT QUADRANT "Search & Filter": A developer types in a search box on their monitor, tag filter chips ("vegetarian", "quick", "Italian") are visible below the search bar, and a filtered results list shows matching recipe cards with highlighted keyword matches. A keyboard shortcut hint floats nearby. CENTER - Where all four quadrants meet, a glowing cyan hub labeled "ViewModel Interface" connects to each quadrant via cyan arrows, representing the shared contract. Above the hub, a small test suite icon shows green checkmarks. POST-IT NOTES: "Own your feature. Trust your team." and "ViewModel = testable brains". TOP BANNER: Metallic blue banner with white pixel text "GA1: Core Features". BOTTOM TEXT: "CS 3100: Program Design & Implementation 2". Color palette: Warm browns/tans for kitchen, cyan/teal for ViewModel connections and data flow, each quadrant has a subtle accent color (blue, green, orange, purple) to distinguish features. 8-bit lo-fi pixel art style, clean outlines, retro game aesthetic with subtle CRT screen texture, 16:9 aspect ratio.](/img/assignments/web/ga1.png)

The key architectural insight of this assignment is that **ViewModels are the testable "brains" of GUI features**. By implementing against provided ViewModel interfaces, your individual work is independently evaluable while still requiring integration with your team's shared codebase.

**Due:** Thursday, April 9, 2026 at 11:59 PM Boston Time

**Prerequisites:** This assignment builds on GA0 (Design Sprint). You should have your team charter and design artifacts complete.

## Learning Outcomes

By completing this assignment, you will demonstrate proficiency in:

- **Implementing the MVVM pattern** with ViewModels that expose observable state and commands ([L30: GUI Patterns and Testing](/lecture-notes/l30-gui2))
- **Creating JavaFX interfaces** that bind to ViewModel properties ([L29: GUIs in Java](/lecture-notes/l29-gui1))
- **Handling asynchronous operations** in a GUI context ([L31-32: Concurrency](/lecture-notes/l31-concurrency1))
- **Practicing effective code review** with HRT principles ([L22: Teams and Collaboration](/lecture-notes/l22-teams))
- **Integrating multiple features** into a cohesive application

## AI Policy for This Assignment

AI tools are **encouraged** for this assignment. Effective uses include:
- Generating JavaFX boilerplate and FXML layouts
- Implementing ViewModel property bindings
- Writing unit tests
- Debugging async/threading issues

Remember: the ViewModel interfaces are your contract. AI can help you implement them, but you must understand the code well enough to debug and extend it.

## TA Mentor Meetings

Throughout GA1, your team will have **weekly 30-minute meetings** with your assigned TA mentor. **These meetings are an accountability mechanism, not just a scheduling requirement.** If you cannot attend, notify your TA *before* the meeting and provide a written update on your work status—this demonstrates accountability. Missing a meeting without prior notice signals a lack of accountability and will likely result in a grade of zero for that week's individual accountability component. These meetings serve multiple purposes:

- **Code walks:** Each team member explains what they worked on and their design choices
- **Progress check-ins:** Are you on track? Stuck anywhere?
- **Collaboration verification:** Is the team working well together?
- **Debugging support:** Your TA can help unblock technical issues

**Meeting schedule for GA1:**

| Meeting | Target Dates | Focus |
|---------|-------------|-------|
| 1 | Mar 23–24 | Design sprint check-in — team introductions, progress review, workflow setup (ungraded) |
| 2 | Mar 30–31 | Core features kickoff — early code, first graded code walk |
| 3 | Apr 6–7 | Core features deep dive — detailed code walks, PR review, integration check |

Starting with Meeting 2, your TA scores each student on a **10-point scale** using the rubric below. These scores are the primary input into the **Individual Accountability Adjustment** (see Grading Rubric) — they directly determine whether your individual grade is adjusted up or down. A student who consistently demonstrates strong comprehension and collaboration in meetings is unlikely to receive a downward adjustment; a student who cannot explain their own code will.

| Category | Points | What your TA is looking for |
|----------|--------|-----------------------------|
| **Code Comprehension** | 4 | Can you explain your own code at both a high level and in detail? Can you articulate design decisions and trade-offs? |
| **Process & Workflow** | 3 | Are you using feature branches, opening PRs with meaningful descriptions, and participating in code review? |
| **Collaboration Evidence** | 2 | Have you reviewed teammates' PRs? Can you describe what your teammates are working on? |
| **Forward Planning** | 1 | Do you have a concrete plan for what you're doing next? |

Your TA will use a **top-down questioning approach**: starting with general questions ("What does your feature do?") and drilling into specifics ("Show me this method — why did you structure it this way?"). The goal is to assess comprehension, not to quiz you on syntax. The specific questions are not shared in advance.

These meetings are where you demonstrate your understanding of your code. If you used AI tools to help with implementation, you must still be able to explain how the code works and why you made certain design decisions. Inability to do so is a red flag that will be reflected in your accountability adjustment.

**Before your first meeting**, make sure your team has read the [Git Workflow for Team Projects](/assignments/git-workflow) guide and set up your branching strategy.

## Provided Materials

You will receive:

1. **ViewModel Interfaces**: Four Java interfaces defining the contract for each core feature
2. **Starter FXML Templates**: Optional starting points for your Views
4. **A5 Solution**: The complete service layer your ViewModels will use

## Core Features

Each team member implements **one** of these features:

### 1. Library View (`LibraryViewModel`)

Browse and manage the user's recipe collections.

**Key Functionality:**
- Display list of collections with titles and recipe counts
- Select a collection to view its recipes
- Create new collections
- Delete collections (with confirmation)
- Navigate to Recipe Details when a recipe is selected

**Observable State:**
- `ObservableList<RecipeCollectionSummary> collections`
- `ObjectProperty<RecipeCollectionSummary> selectedCollection`
- `ObservableList<RecipeSummary> recipesInSelectedCollection`

### 2. Recipe Details/Editor (`RecipeEditorViewModel`)

View and edit recipe content.

**Key Functionality:**
- Display recipe title, description, ingredients, instructions
- Edit mode toggle
- Add/remove/reorder ingredients
- Validate changes before saving
- Track dirty state (unsaved changes)

**Observable State:**
- `ObjectProperty<Recipe> currentRecipe`
- `BooleanProperty editMode`
- `BooleanProperty isDirty`
- `BooleanProperty isValid`
- `ObservableList<Ingredient> ingredients`

### 3. Import Interface (`ImportViewModel`)

Import recipes from images using the provided Gemini API integration for OCR and recipe parsing. The Gemini API service layer is provided in the reference implementation—you build the ViewModel and UI that connects to it.

**Key Functionality:**
- Select image file(s) for import
- Display import progress with cancellation support
- Show extracted recipe for review/editing before saving
- Handle Gemini API errors gracefully (network issues, parsing failures, rate limits)
- Select target collection for imported recipe

**Observable State:**
- `ObjectProperty<ImportState> state` (IDLE, PROCESSING, REVIEW, ERROR)
- `DoubleProperty progress`
- `StringProperty statusMessage`
- `ObjectProperty<Recipe> importedRecipe`

### 4. Search & Filter (`SearchViewModel`)

Find recipes across all collections.

**Key Functionality:**
- Search by title (real-time filtering)
- Filter by tags/categories
- Display search results with collection context
- Navigate to selected result
- Keyboard navigation support

**Observable State:**
- `StringProperty searchQuery`
- `ObservableList<RecipeSummary> searchResults`
- `ObservableList<String> availableTags`
- `ObservableList<String> selectedTags`
- `BooleanProperty isSearching`

## Individual Deliverables

### ViewModel Implementation

- Implement your assigned ViewModel interface
- Use dependency injection to receive services (constructor injection)
- Follow your team's user-facing terminology for naming

### View Implementation

- Create FXML layout for your feature
- Implement the FXML controller that binds to your ViewModel
- Follow accessibility guidelines from your GA0 plan
- Support keyboard navigation

### Additional Unit Tests

- Write at least 5 additional unit tests beyond the provided suite
- Focus on edge cases and error conditions
- Test async behavior where applicable

## Team Deliverables

### Integrated Application

- All implemented core features working together in one application (four features, or three if your team dropped Search & Filter per the 3-person-team exception)
- Consistent navigation between those features
- Shared application state where appropriate

### Shared Infrastructure

- Navigation component (how do users move between implemented features?)
- Theming/styling (consistent look and feel)
- Error handling (how are errors displayed to users?)
- Application startup and shutdown

**3-person teams:** Shared infrastructure applies to your three implemented features; you are not required to support navigation or UI for the omitted feature.

### Integration Tests

- At least 3 integration tests verifying interactions between your implemented core features
- Example: "User selects collection → selects recipe → recipe displays in editor" (or similar cross-feature flows for the features you built)
- **3-person teams:** Tests cover the three features you implemented; you do not need tests involving Search & Filter.

### Code Review Evidence

- Each PR must have at least one substantive review comment
- Reviews should demonstrate HRT principles
- Include at least one example of design discussion in PR comments

## Technical Specifications

### ViewModel Interface Example

```java
public interface LibraryViewModel {
    // Observable state for JavaFX binding
    ObservableList<RecipeCollectionSummary> getCollections();
    ObjectProperty<RecipeCollectionSummary> selectedCollectionProperty();
    ObservableList<RecipeSummary> getRecipesInSelectedCollection();
    
    // Commands
    void selectCollection(String collectionId);
    void createCollection(String title, SourceType sourceType);
    void deleteCollection(String collectionId);
    
    // For grading: non-JavaFX accessors for testing
    List<String> getCollectionIds();
    String getSelectedCollectionId();
}
```

### Testing Your ViewModel

```java
@Test
void selectCollection_updatesRecipeList() {
    // Arrange
    LibraryViewModel vm = new LibraryViewModelImpl(mockLibraryService);
    
    // Act
    vm.selectCollection("desserts-id");
    
    // Assert
    assertThat(vm.getSelectedCollectionId()).isEqualTo("desserts-id");
    assertThat(vm.getRecipesInSelectedCollection()).hasSize(5);
}
```

## Grading Rubric

**Total: 50 points** — 35 points individual (ViewModel + View) + 15 points team (integration).

### Individual Components (35 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| **ViewModel Implementation** | 20 | Implements the provided interface correctly; manually evaluated by course staff |
| **View Implementation** | 8 | FXML + controller binds correctly, follows design |
| **Additional Tests** | 5 | 5+ meaningful tests covering edge cases |
| **Code Quality** | 2 | Follows UI terminology, clean code, appropriate documentation |
| **Total** | **35** | |

### Team Components (15 points)

| Component | Points | Criteria |
|-----------|--------|----------|
| **Integration Works** | 5 | All implemented core features work together, navigation functions |
| **Shared Infrastructure** | 4 | Consistent theming, navigation, error handling across implemented features |
| **Integration Tests** | 4 | 3+ tests verifying cross-feature behavior for implemented core features |
| **Code Review Quality** | 2 | PRs have substantive reviews, HRT evident |
| **Total** | **15** | |

### Individual Accountability Adjustment

TA meeting observations and weekly collaboration surveys can adjust an individual's final grade by up to **-20 points** or award an **upward adjustment of up to +20 points**. If a team member cannot explain their code in TA meetings while the rest of the team succeeds, their grade may be reduced. The upward adjustment exists for a specific scenario: if your team's project isn't fully complete, but you went above and beyond to support struggling teammates — helping them get unblocked, taking on extra integration work, providing thorough code reviews — you can still earn full marks. This is **not an extra credit mechanism**; it is unlikely to bring a student above the assignment's total points. Simply doing your own work well is the expected baseline, not grounds for an upward adjustment. The weekly collaboration surveys (due Mar 23, Mar 30, Apr 6, Apr 13) inform this adjustment.

## Submission

Your team repository should follow this structure (plan it from day one):

```
/design/                        ← GA0 artifacts (personas, wireframes, etc.)
/src/                           ← application source code
/menu-features/                 ← GA2 process portfolios (one subfolder per feature)
```

1. **Merge to `main`:** Your `main` branch is automatically submitted to Pawtograder. Make sure all work is merged to `main` by the deadline.
2. **Weekly collaboration surveys:** Make sure all team members are up to date on the weekly TCRS surveys via Pawtograder