---
sidebar_position: 17
lecture_number: 17
title: "L17: From Code Patterns to Architecture Patterns"
---

# From Code Patterns to Architecture Patterns

## Review the creation patterns you have already implemented (5 minutes)

:::note Information Hiding In Action
Creation patterns are information hiding applied to *object construction*. In [Lecture 6](/lecture-notes/l6-immutability-abstraction), we learned to hide implementation details behind interfaces. Now we hide *how objects are created*—the specific constructors, the validation logic, the wiring of dependencies—behind factory methods and builders. The client code says "give me a Recipe" without knowing the 15 steps required to construct one correctly.
:::

- Recap: Students implemented Builder (`RecipeBuilder`), used Factory methods (`StandardConversions`), created registries
- Frame this lecture as "what you learned, formalized—and where it leads"
- Connect to information hiding and DIP from L8

## Evaluate the tradeoffs in readability, reusability, and changeability between object creation patterns in Java (15 minutes)

### Static Factory Methods (Bloch Item 1)
- Example: `StandardConversions.getRule()` from HW2
- Advantages over constructors: naming, caching, return subtypes
- Not the same as Factory *Pattern*
- **Tradeoffs**:
  - *Readability*: Named methods (`of()`, `from()`, `create()`) clearer than `new` (?)
  - *Reusability*: Can return cached instances or subtypes
  - *Changeability*: Can change implementation without changing call sites

### Builder Pattern (Bloch Item 2)
- Example: `RecipeBuilder` from HW2
- When to use: many constructor parameters, immutable objects, fluent APIs
- Discuss: How did your implementation handle notes? (design decision they made)
- Variations: telescoping constructors vs. builders, record builders
- **Tradeoffs**:
  - *Readability*: Fluent API makes construction self-documenting
  - *Reusability*: Builders can be reused to create similar objects
  - *Changeability*: New optional parameters don't break existing code

### Singleton Pattern (Bloch Items 3-4)
- The controversial pattern: global state, testability concerns
- Why it exists: expensive resources, configuration, coordination
- *Why this pattern is problematic—sets up the DI discussion*
- **Tradeoffs**:
  - *Readability*: Simple access, but hides dependencies
  - *Reusability*: Difficult to reuse code that depends on singletons
  - *Changeability*: Hard to swap implementations, breaks testability

## Describe Dependency Injection as a solution to the problems of Singleton (10 minutes)

### The problem Singleton is trying to solve
- "I need access to this one thing everywhere"
- Hidden dependencies make code hard to test and reason about

### Dependency Injection as the solution
- Constructor injection (what students already did with `ConversionRegistry`)
- The DIP from L8 in action: depend on abstractions, inject implementations
- Compare: explicit wiring vs. what DI frameworks automate

### Types of injection
- Constructor injection (preferred—makes dependencies explicit)
- Setter injection (for optional dependencies)
- Field injection (convenient but hides dependencies)

## Compare Service Locator and Dependency Injection patterns (10 minutes)

### Service Locator pattern
- Centralized registry: `ServiceLocator.get(ConversionRegistry.class)`
- Pros: Simple to use, single access point
- Cons: Hides dependencies, harder to test, "action at a distance"
  
### Dependency Injection comparison
- Explicit wiring through constructors
- Pros: Dependencies visible in API, easy to test with mocks
- Cons: More verbose, requires infrastructure for large systems

### Tradeoffs summary
- *Readability*: DI makes dependencies explicit in signatures; Service Locator hides them
- *Reusability*: DI components are easily reusable with different implementations
- *Changeability*: Both support swapping implementations, but DI makes it obvious where to change

### When each is appropriate
- DI for application code (testability matters)
- Service Locator sometimes in frameworks (plugin architectures)

## Recognize how code-level patterns manifest at larger architectural scales (10 minutes)

### Where you've been: Patterns at the object level

In Assignments 1-4, you applied these patterns to individual objects:

- **Builder**: `RecipeBuilder` constructs a single `Recipe` with many optional parts (ingredients, instructions, notes, conversion rules). One builder → one object.

- **Factory methods**: `StandardConversions.getRule()` and `StandardConversions.getAllRules()` create conversion rules without exposing how they're stored or computed.

- **Dependency Injection**: When you passed a `ConversionRegistry` to `Recipe.scaleToIngredient()` or `Recipe.convert()`, you were doing manual DI. The recipe doesn't know *which* registry it gets—it just depends on the abstraction.

At this scale, these patterns help you write clean, testable classes. The "wiring"—who creates what and passes it where—happens in a few places (your tests, a main method, maybe a builder).

### Where you're going: Patterns at the service level

In Assignment 5, you'll implement a **service layer architecture** with:
- `ImportService` — imports recipes from JSON, images (via OCR), or other formats
- `ExportService` — exports recipes to markdown, JSON, or other formats  
- `LibraryService` — manages the user's cookbook collection

These services need to collaborate. For example:
- `ImportService` might need `LibraryService` to add imported recipes to a cookbook
- Both services might need a `ConversionRegistry` for unit conversion
- The CLI controller needs all three services to handle user commands

**Now imagine if these services used Singletons:**
```java
public class ImportService {
    public void importRecipe(Path file) {
        Recipe recipe = parseRecipe(file);
        LibraryService.getInstance().addRecipe(recipe);  // Hidden dependency!
    }
}
```

Testing this is painful—you can't substitute a mock `LibraryService`. Changing the library implementation affects everything that calls `getInstance()`. The dependency graph is invisible.

**With Dependency Injection:**
```java
public class ImportService {
    private final LibraryService library;
    private final ConversionRegistry conversions;
    
    public ImportService(LibraryService library, ConversionRegistry conversions) {
        this.library = library;
        this.conversions = conversions;
    }
    
    public void importRecipe(Path file) {
        Recipe recipe = parseRecipe(file);
        library.addRecipe(recipe);  // Dependency is explicit
    }
}
```

Now dependencies are visible in the constructor. Tests can inject mocks. You can swap implementations (e.g., an in-memory library for testing vs. a persistent one for production).

### Same principles, bigger scope

The principles you learned at the object level scale up:

| Object Level (A1-A4) | Service Level (A5+) |
|---------------------|---------------------|
| `RecipeBuilder` creates a `Recipe` | A "composition root" wires up services |
| `ConversionRegistry` abstracts conversion rules | `LibraryService` abstracts cookbook storage |
| Pass registry to `Recipe.convert()` | Pass services to controllers |
| Test recipes with stub registries | Test controllers with mock services |

The question shifts from "how do I create this object?" to "how do I wire up this whole system?"—but the answer is still: **depend on abstractions, inject implementations, keep coupling loose**.

### Preview: Thinking Architecturally

Next lecture, we step back to ask: **where do service boundaries come from?** We've been building services like `ImportService`, `ExportService`, and `LibraryService` for CookYourBooks—but how did we decide those were the right boundaries?

We'll use a different system as our running example: **Pawtograder**, the autograder that grades your assignments. It has three components—a Solution Repo with config, a Grading Action, and the Pawtograder API—and we'll explore the heuristics that led to those boundaries. We'll also compare it to Bottlenose, the previous grading system at Northeastern (and its Orca execution component), to see how different requirements lead to different architectural choices.

We'll explore:
- What distinguishes "architecture" from "design"
- How to identify the natural seams in a problem domain
- How to communicate and document architectural decisions

The patterns you've learned—Builder, Factory, DI—don't disappear at larger scales. They're the building blocks. Architecture is about deciding *which* buildings to construct and *how* they relate.

