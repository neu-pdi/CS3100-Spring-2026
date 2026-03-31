---
sidebar_position: 4
lecture_number: 4
title: "L4: Specifications and Common Contracts"
image: /img/lectures/web/l4.png
---

# Specifications and Common Contracts

![Lecture 4: Specifications and Common Contracts](/img/lectures/web/l4.png)

## Describe the role of method specifications in achieving program modularity and improving readability (10 minutes)

Since the dawn of programming, software engineers have been looking for ways to make it easier to write large programs. One of the most important tools in the software engineer's toolbox has been the ability to *modularize* programs.

Psychology sidebar: A common rule of thumb is that humans can only hold 7±2 items in their short-term memory ([Miller's Law](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two)). However, the "item" that we remember can be of variable size. For example, which is easier to remember:
- A lock combination with 8 numbers in order (10, 20, 30, 40, 50, 60, 70, 80)
- A lock combination with 8 numbers in random order (50, 30, 60, 20, 80, 10, 40, 70)

The second is easier to remember because it is a *chunk* ("multiples of 10 from 10 to 80").

When we write a program, our goal is to make it easy to understand. When we break that program down into smaller pieces (e.g. modules, classes, methods), our goal is to provide a sufficiently clear specification for each piece so that we can keep several of those pieces in our short-term memory at once in order to reason about a greater whole. When reading a program, we want to enable a developer to quickly understand the behavior of a method *without* having to read and understand the implementation of that method.

There are, of course, other ways to make a program easier to understand, and these are topics for later lectures!

## Evaluate the efficacy of a given specification using the terminology of restrictiveness, generality, and clarity (15 minutes)

![The Goldilocks Specification Lab](/img/lectures/web/l4-three-criteria.webp "Concept: 'The Goldilocks Specification Lab' (Finding the Just-Right Balance) - A whimsical-yet-technical laboratory scene rendered in a storybook-meets-engineering style, showing three experimental stations where specifications are being tested. STATION 1 - 'TOO RESTRICTIVE' (Left): A specification document trapped in a tiny, rigid metal cage with bars too close together. Multiple implementations try to enter—some clearly buggy (marked with X), but ALSO several perfectly good implementations (marked with ✓) that can't fit through the narrow bars. STATION 2 - 'TOO GENERAL' (Center): A specification document as a wide-open barn door with no filter at all. A parade of implementations walks through—some with ✓ checkmarks (good), but also clearly buggy ones with skull icons. STATION 3 - 'UNCLEAR' (Right): A specification document written in tiny, smudged text with contradictory arrows and question marks. Three developers stand around it, each with a different thought bubble showing completely different interpretations. CENTER - 'JUST RIGHT' (Highlighted, Glowing): A perfectly balanced specification shown as a well-designed filter/gate system. The gate is sized exactly right: buggy implementations bounce off, while ALL valid implementations pass through smoothly.")

So, a good method specification is one that a developer can understand quickly and easily. Any implementation of that method that satisfies the specification should be correct (we will call this property *generality*), and any implementation that does not satisfy the specification is incorrect (we will call this property *restrictiveness*). Good specifications should also be *clear* (we will call this property *clarity*).

Note that much of the framing in this section comes from Liskov & Guttag, [Ch. 9.2](https://learning.oreilly.com/library/view/program-development-in/9780768685299/ch9.html); refer to it as needed.

### Restrictiveness
When writing a method specification, we must consider all possible inputs that the method could receive. We should be *restrictive* in our specification of a method to rule out any implementations of a method that would be unacceptable to clients of that method.

![The Undefined Behavior Roulette Wheel](/img/lectures/web/l4-underspecified.webp "Concept: 'The Undefined Behavior Roulette Wheel' (What Happens When Specs Have Gaps) - A dramatic casino/game-show style illustration showing the danger of under-specified behavior. CENTER - THE ROULETTE WHEEL: A large spinning wheel divided into wedges, each showing a different possible outcome for 'sum(null)'. The wheel is labeled 'What happens when arr is null?' and is being spun by an ominous figure labeled 'Undefined Behavior'. The wedges include: 'Throw NullPointerException' (reasonable), 'Return 0' (maybe intended?), 'Return -1' (huh?), 'Crash the JVM' (disaster), 'Hang forever' (worse), 'Corrupt data silently' (technically allowed!), 'Work fine... sometimes' (worst—intermittent bugs). A small annotation: 'All of these satisfy the spec! The spec is silent on null.'")

Here is an example of a specification that is not restrictive:
```java
/**
 * Returns the sum of the elements in the array.
 * @param arr the array to sum
 * @return the sum of the elements in the array
 */
public int sum(int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
```

This specification is not restrictive because it does not consider the case where the array is `null`. Why is this a problem? According to the specification, the behavior of the method is "undefined" when the array is `null`. This means that the method could do anything, including throwing an exception, returning a wrong answer, or crashing the program.

A more restrictive specification would be:
```java
/**
 * Returns the sum of the elements in the array.
 * @param arr the array to sum
 * @return the sum of the elements in the array
 * @throws NullPointerException if the array is null
 */
public int sum(int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
```

This specification is more restrictive because it rules out the case where the array is `null`.

Here is another example of a specification that is not restrictive, coming from the `Set` interface:
```java
/**
 * Returns an iterator over the elements in this set.
 * @return an Iterator over the elements in this set
 */
public Iterator<E> iterator()
```

This specification is not restrictive because it does not specify the ordering of the elements in the set. A client of the `Set` interface could reasonably expect the elements to be in a certain order, but the specification does not guarantee this. As it would be, since the `Set` is an unordered collection, its iterator could return elements in any order, and indeed, this is documented in the actual documentation for the `Set` interface:

```java
/**
 * Returns an iterator over the elements in this set. The elements are returned in no particular order.
 * @return an Iterator over the elements in this set
 */
public Iterator<E> iterator()
```


### Generality
Good specifications must strike a balance between being too general and too restrictive.
A good spec is general if it does not rule out any implementations that are correct.
Of course, there may be an infinite number of possible correct implementations for a method, and it is not essential that we ensure that all of them are allowed by the specification - this is a place to exercise good judgement.

One way to ensure that a specification is general is to specify the *definition* of the method's behavior, rather than its *operational* steps.

For example, consider the following specification for a `search` method:
```java
/**
 * If `arr` is null, throw a `NullPointerException`.
 * Else:
 *      Examines each element of `arr` in order.
 *      If the current element is equal to `searchTarget`, return the current index.
 *      If it reaches the end of the array without finding `searchTarget`, throw a `NoSuchElementException`.
 * @param arr the array to search
 * @param searchTarget the element to search for
 */
public int search(int[] arr, int searchTarget)
```

This specifies *how to implement* the method, rather than *what* the method should do. This specification might inadvertently rule out *other* implementations of the method that are semantically correct, but do not match the specification's definition. In particular, it might not matter that we return the *first* occurrence of `searchTarget` in `arr`: if it suffices to simply return *any* occurrence of `searchTarget` in `arr`, then such implementations would be correct, but this is not allowed by the specification.

A more general specification would be:
```java
/**
 * Returns an index of `arr` that contains `searchTarget`.
 * @param arr the array to search
 * @param searchTarget the element to search for
 * @return an index of `arr` that contains `searchTarget`
 * @throws NullPointerException if `arr` is null
 * @throws NoSuchElementException if `arr` does not contain `searchTarget`
 */
public int search(int[] arr, int searchTarget)
```

This specification is more general because it permits implementations that do not return the *first* occurrence of `searchTarget` in `arr`. Note also that it is shorter and more concise. In this course, you should write behavior-based specifications, not operational-based specifications.

Note that, of course, if it really is necessary to get the *first* occurrence of the target, this specification is not sufficiently restrictive.

A good way to check for generality is to examine every requirement of the specification. If you can think of a case where the specification does not permit an implementation that is correct, then it is not sufficiently general.

Determining the balance between generality and restrictiveness requires a thorough understanding of the problem domain and the method's clients. For the scope of the next few weeks, we will explicitly specify the domain constraints, but once we begin to discuss requirements gathering and domain modeling, you will need to use your own judgement to balance these constraints.

### Clarity

Having a specification that strikes a balance between generality and restrictiveness ensures that a developer can predict the behavior of a method without having to read its implementation. However, this doesn't necessarily mean that the specification is easy to understand. Hence, our third criterion for a good specification is *clarity*.

The most dangerous specifications are those that allow a developer to think that they understand the method's behavior, but then find that they are incorrect. Clear specifications should avoid this problem.

Clear specifications tend to be concise and to the point. The most concise specification *might not be the clearest*, but it is a good starting point. Overly long specifications might take longer to read and understand, be more difficult to remember, and be more prone to errors of understanding. Note also that just because a specification is long, it doesn't mean that it is complete.

Clear specifications also avoid unnecessary redundancy. Here is an example of a specification that is not clear because it is redundant:

```java
/**
 * Returns the sum of the elements in the array.
 * The sum is computed by adding each element of the array.
 * It is the total of all the elements in the array.
 * 
 * @param arr the array to sum
 * @return the sum of the elements in the array
 */
public int sum(int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
```
It is entirely redundant to say how the sum is computed, and to restate that the sum is the total of all the elements in the array. A reader of this specification will already know this, and it is just a waste of space.

However, clear specifications might *purposely* include redundancy if that helps to clarify the specification. If we did not assume that the reader knows that the "sum" of numbers is the total of the numbers, it might not have been redundant to include that information. 

Here is an example of a specification that is probably not clear:
```java
/**
 * Computes the present value of an income stream.
 * @param income the annual income
 * @param interestRate the risk-free interest rate
 * @param years the number of years
 * @return the present value of the income stream
 */
public float presentValue(float income, float interestRate, int years) 
```

If you know what present value is, you can probably understand this specification without reading the implementation. However, if you do not know what present value is, this specification is not clear.

A more clear specification might simply introduce a small amount of redundancy, as:
```java
/**
 * Computes the present value of an income stream.
 * The present value of an income stream is the amount of money that, if invested at the given interest rate, would grow to the total income over the given number of years.
 * @param income the annual income
 * @param interestRate the risk-free interest rate
 * @param years the number of years
 * @return the present value of the income stream
 */
public float presentValue(float income, float interestRate, int years) 
```

Adding this redundancy allows a reader to check their understanding of the concepts in the specification.
Determining the balance between clarity and conciseness is a matter of good judgement, and is dependent on the problem domain and the method's clients.

### Clarity and Long-Term Consequences: When Ambiguity Creates Maintenance Burden

![The Recipe Card at Different Scales](/img/lectures/web/l4-spec-scales.webp "Concept: 'The Recipe Card at Different Scales' (Same Principles, Different Kitchens) - A warm, inviting three-panel illustration showing that recipe-writing principles remain constant whether you're cooking for yourself, running a restaurant, or programming a robot baker. LEFT PANEL - 'HOME KITCHEN' (You as Implementer): A cozy home kitchen with a handwritten recipe card: 'Chocolate Chip Cookies - Mix ingredients, bake until golden.' The cookies come out perfect because YOUR context matches YOUR intent. CENTER PANEL - 'RESTAURANT KITCHEN' (Team of Humans): A bustling professional kitchen with multiple cooks at different stations, all reading the SAME recipe card. Different cooks have different thought bubbles showing their interpretations. RIGHT PANEL - 'ROBOT BAKER' (AI/Automated System): A gleaming automated bakery line with a robot arm and conveyor belt. The robot executes EXACTLY what's specified—no more, no less. THE TWIST: Shows the home cook returning to their kitchen 6 months later, following their own vague recipe... and the cookies come out wrong. Caption: 'Plot twist: Even YOUR context changes over time. Future-you is also a different implementer.'")

Ambiguous specifications create hidden costs that compound over time. When a spec is unclear, different developers make different interpretation choices. These inconsistencies become bugs, user complaints, and expensive refactoring.

**Example:** A grading system spec says "submissions should be processed promptly." What does "promptly" mean? One developer implements alphabetical processing; students named "Zhang" consistently wait longer than students named "Adams." Perhaps there was also a "fairness" requirement. In lecture 9, we will discuss methods to better solicit stakeholder input and requirements.

**The general principle:** Unclear specifications delegate decisions to implementers who may not realize they're making consequential choices. These hidden decisions become "specification debt" - they work fine initially but create liability over time as the system scales and reaches more diverse users.

![The Hidden Decision Factory](/img/lectures/web/l4-spec-debt.webp "Concept: 'The Hidden Decision Factory' (How Ambiguous Specs Create Unintended Consequences) - An illustrated factory scene showing how ambiguous specifications lead to hidden, consequential decisions being made by implementers. THE AMBIGUOUS SPEC: A vague specification document enters the factory on a conveyor belt. It reads: 'Process submissions promptly.' A magnifying glass hovers over it showing NO details about: ordering, fairness, priority, timing. THE DECISION FACTORY: Inside the factory, a developer stands at a workstation with multiple levers and buttons—each representing a DECISION the spec didn't make. THE UNINTENDED CONSEQUENCE: The factory output shows a queue of student submissions being processed. Students named 'Adams', 'Baker', 'Chen' get processed quickly. Students named 'Williams', 'Young', 'Zhang' wait much longer. Caption: 'Alphabetical ordering = systematic disadvantage for names late in alphabet. Developer didn't intend this. Spec didn't prevent it.' THE HIDDEN COST: A timeline showing: 'SPEC PHASE: Fix ambiguity for $100', 'DEV PHASE: Fix ambiguity for $1,000', 'PRODUCTION: Fix ambiguity for $100,000'.")

**Cost-saving practice:** When specifying systems that affect people, ask: "Could different reasonable interpretations of this spec lead to different outcomes for different groups?" Resolving this ambiguity in the spec is far cheaper than resolving it in deployed code. Even if the decision at present time is to allow for different outcomes for different groups, a central goal of software architecture (we'll visit in lecture 19) is to try to eliminate all "too expensive to change" decisions through effective design.

## Utilize type annotations to express invariants such as non-nullness (5 minutes)

![The Factory Quality Control Line](/img/lectures/web/l4-type-annotations.webp "Concept: 'The Factory Quality Control Line' (Comments vs Type Annotations) - A detailed factory floor illustration in a clean industrial design style, showing two parallel assembly lines for 'Method Calls' being quality-checked before shipping to production. LEFT LINE - 'HONOR SYSTEM QUALITY CONTROL' (Comment-Only Specs): A conveyor belt carrying method calls. A laminated sign hangs above: 'PLEASE CHECK: arr should not be null - Javadoc says so!' A tired human inspector sits on a stool, barely glancing at packages as they roll by. Behind the inspection point: CHAOS. Packages explode on contact with the 'Production' area, a NullPointerException alarm blares. RIGHT LINE - 'AUTOMATED QUALITY GATE' (Type Annotations): The same conveyor belt, but now it passes through an imposing automated scanner. The scanner display shows: '@NonNull int[] arr — SCANNING...' Valid packages get a green checkmark stamp. The 'null' package hits an invisible force field—red lights flash, the package is automatically diverted to a 'Fix Before Shipping' chute. Caption: 'Moving specs from comments (that humans ignore) to types (that compilers enforce).'")

In an ideal world, programmers could express all invariants about a method using the language's type system.
A broad research area in software engineering and programming languages: how to design a language that ergonomically allows programmers to express invariants about their code, and have the compiler enforce them.

For example: rather than simply state in a comment that the parameter to a method is non-null, it would be great if we could express that invariant directly in the method's signature, and have the compiler enforce it.

While Java was not designed with this in mind, [two researchers from the University of Washington led an effort to add support for "Type Annotations" to Java](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=b0a3c566dce1092150fff7b886d369cc90dfbd76), which is a feature that allows programmers to express invariants about their code in a way that is both clear and concise. (Fun fact: This is one of very few accepted changes to the Java language that were proposed by an academic not affiliated with Sun/Oracle). This feature was added in Java 8 (2014), which feels like a long time ago, but given the huge amount of legacy code written in Java, you may not find it widely used in codebases that you encounter.

Here is an example of a type annotation:
```java
public int sum(@NonNull int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
```

With this annotation, the compiler will enforce that `arr` is not `null` when the `sum` method is called. If it is `null`, the compiler will generate an error. However, in order to automatically check for nullness, the compiler will require that we add nullness annotations to all of the parameters and fields of all classes in our program. The benefit of this is that we can catch nullness errors at compile time, rather than at runtime. When starting with a legacy codebase, this can be a lot of work. But, when you are starting with a new codebase, it is a great way to ensure that your code avoids a very common source of bugs.

As is unfortunately typical for Java's community process, despite [a strong proposal to introduce a standard `@NonNull` annotation in the language](https://stackoverflow.com/a/35896657/6457585), it was rejected. So instead, you might encounter several dozen different definitions of `@NonNull` in the wild. A coalition of organizations who are frustrated by this (including Google, JetBrains, Microsoft, Uber, and even... Oracle?) have proposed a standard library of type annotations, [JSpecify](https://jspecify.dev/docs/start-here/). In this class, we will use the JSpecify annotations.

While nullness is the most common type annotation to find, this is an active topic of research, and some day you might also be able to specify other properties with type annotations, such as [the immutability of a type](https://dl.acm.org/doi/10.1109/ICSE.2017.52).

### Suggested Usage of Nullness Annotations (2 minutes)

In this course, we configure new projects with the following approach to nullness annotations:

1. **Mark the package as `@NullMarked`**: Place a `@NullMarked` annotation at the package level (in `package-info.java`). This tells the nullness checker that all types in this package are assumed to be non-null by default.

2. **Explicitly annotate nullable types with `@Nullable`**: When a parameter, return type, or field *can* be null, explicitly mark it with `@Nullable`. This makes the nullability visible in the code.

Here is an example of a `package-info.java` file:
```java
@NullMarked
package edu.neu.cs3100.myproject;

import org.jspecify.annotations.NullMarked;
```

With this setup, you only need to add annotations where something *is* nullable, keeping your code cleaner:
```java
// In a @NullMarked package, arr is assumed non-null
public int sum(int[] arr) { ... }

// Explicitly mark nullable parameters
public String format(@Nullable String prefix, String value) { ... }
```

**Alternative approach for gradual migration**: If you are migrating a legacy codebase, it may be easier to assume everything is nullable by default and explicitly mark non-null types with `@NonNull`. This allows you to incrementally add annotations as you verify each type's nullability. However, for new projects, the `@NullMarked` approach is preferred because it results in fewer annotations overall (since most types are non-null in practice).

### Working with Unannotated Libraries: `Objects.requireNonNull` (3 minutes)

Even when your code is fully annotated with `@NullMarked`, you'll frequently call methods from libraries that aren't annotated—including parts of the Java standard library itself! The nullness checker doesn't know whether these methods can return null, so it treats them as having "unknown" nullness.

For example, consider `List.of()`:
```java
String name = "Alice";
List<String> names = List.of(name); // Checker doesn't know if this returns null!
System.out.println(names.size()); // Warning: names might be null
```

Even though `List.of()` *never* returns null (it's documented to always return a non-null list), the checker can't verify this because the Java standard library isn't annotated with `@NonNull`. You have two options:

1. **Check for null explicitly** (unnecessary but satisfies checker):
```java
List<String> names = List.of(name);
if (names != null) {
    System.out.println(names.size());
}
```

2. **Use `Objects.requireNonNull`** (asserts non-null, documents your reasoning):
```java
List<String> names = Objects.requireNonNull(List.of(name));
System.out.println(names.size()); // No warning—checker knows names is non-null
```

`Objects.requireNonNull` serves two purposes:
- It tells the nullness checker "I guarantee this value is non-null"
- It fails fast with a clear `NullPointerException` if you're wrong, rather than failing later with a confusing error

**When to use it:** Use `Objects.requireNonNull` when you have domain knowledge that a value won't be null, but the checker can't verify this. Common cases include:
- Calling standard library methods like `List.of()`, `Set.of()`, `Map.of()` that never return null
- Using library methods whose documentation guarantees non-null returns
- Receiving values from unannotated third-party libraries

**Caution:** Don't use `Objects.requireNonNull` to silence warnings you don't understand. If you're not sure whether a value can be null, add a proper null check instead. And don't use it for methods like `Map.get()` that genuinely can return null—that's a case where you need actual null handling.


## Define the role of methods common to all Objects in Java 
We previously mentioned that every Java class extends the `java.lang.Object` class. The `Object` class contains three methods that you should (consider) to override. They serve as a great example of the principles we have been discussing.

### [`toString`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#toString()) (3 minutes)
Here is the specification for the `toString` method:

> In general, the toString method returns a string that "textually represents" this object. The result should be a concise but informative representation that is easy for a person to read. It is recommended that all subclasses override this method. The string output is not necessarily stable over time or across JVM invocations.

If you do not override `toString`, the default implementation will return a string that includes the object's class name and its hashcode (for example, `DimmableLight@abdfd`). The `toString` method is automatically called when an object is passed to `println`, `printf`, or `assert`, so it is a good idea to override it to return a string that is useful for debugging.


You should [always override `toString`](https://learning.oreilly.com/library/view/effective-java-3rd/9780134686097/ch3.xhtml#lev12) to provide a string representation of the object. The contract is quite flexible: your implementation should be a concise but informative representation that is easy for a person to read. It is OK for the string to change over time, and repeatedly calling it could return the same or different strings.

Sidebar on generality: Note that the last sentence on stability was added in Java 17, and represents an improvement in the generality of the specification. Before that, the specification implied that `toString` should return a stable string, but some implementations did not actually do that, causing unexpected bugs. 

With the default implementation, the line `System.out.println("Created new light: " + new DimmableLight(2700));` will print `Created new light: DimmableLight@abdfd` if `toString` is not overridden. This is not very useful for debugging. A more helpful representation might be `Created new light: DimmableLight(color=2700K, brightness=100, on=true)`.

### [`equals`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)) (5 minutes)
The `equals` method is used to compare two objects for equality (compare to Python's `__eq__` method). It is an important method that is used widely. For example, it is used by each `Set` to determine if two objects are the same and by each `List` to support the `contains` method.

`equals` has a somewhat lengthy specification, but one that is hopefully clear:

> Indicates whether some other object is "equal to" this one.
> The equals method implements an equivalence relation on non-null object references:
> 
> - It is reflexive: for any non-null reference value x, x.equals(x) should return true.
> - It is symmetric: for any non-null reference values x and y, x.equals(y) should return true if and only if y.equals(x) returns true.
> - It is transitive: for any non-null reference values x, y, and z, if x.equals(y) returns true and y.equals(z) returns true, then x.equals(z) should return true.
> - It is consistent: for any non-null reference values x and y, multiple invocations of x.equals(y) consistently return true or consistently return false, provided no information used in equals comparisons on the objects is modified.
> - For any non-null reference value x, x.equals(null) should return false.
> 
> An equivalence relation partitions the elements it operates on into equivalence classes; all the members of an equivalence class are equal to each other. Members of an equivalence class are substitutable for each other, at least for some purposes.

`java.lang.Object`'s `equals` method satisfies this contract by using *reference equality*. That is, two objects are equal if and only if they are the same object.

You should override `equals` when you want to change this behavior, but it is crucial to still follow the contract.

Here is a recipe for overriding `equals`:
1. Use `==` to check if the other object is the same as "this". If so, return true. This is a performance optimization.
2. Use `instanceof` to check if the other object is of the same type as "this". If not, return false.
3. Cast the other object to the correct type and compare the fields that you care about.
4. Return false if any of the fields are not equal.

Here is an example implementation:
```java
@Override
public boolean equals(@Nullable Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof DimmableLight other)) return false;
    return this.color == other.color 
        && this.brightness == other.brightness 
        && this.on == other.on;
}
```

**Why `@Nullable` on the parameter?** Notice that the `equals` method's parameter must be annotated with `@Nullable`. The contract of `equals` explicitly states that `x.equals(null)` should return `false` (not throw an exception), which means null is a valid input. In a `@NullMarked` package, all types are assumed non-null by default, so we must explicitly mark this parameter as `@Nullable`. If you are using NullAway (as we do in this course), the compiler will produce an error if you omit this annotation.

It might be tempting to try to define two objects as equal if they have similar fields but are different types (e.g. `TunableWhiteLight` and `DimmableLight`). However, it is generally not possible to do so without breaking the symmetry or transitivity of `equals`. So, we should not do this.

### [`hashCode`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()) (5 minutes)

![The Hash Table Post Office](/img/lectures/web/l4-hashcode-buckets.webp "Concept: 'The Hash Table Post Office' (How hashCode and equals Work Together) - A detailed post office / mail sorting facility illustration showing how HashMap finds objects in O(1) time. THE MAIL SORTING FACILITY: A bird's-eye view of a mail sorting center with numbered bins (0-15, representing hash buckets). Each bin can hold multiple packages (objects). STEP 1 - COMPUTING THE HASH: A package (DimmableLight object) arrives at the 'Hash Calculator' station—a machine that examines the object's fields and produces a number. The machine display shows: 'hashCode() → 234789234 → mod 16 → Bucket 7'. STEP 2 - FINDING THE BUCKET: Bucket 7 is highlighted, showing it contains 3 packages (objects with the same hash). STEP 3 - THE EQUALS CHECK: The postal worker compares the incoming package against each package in the bucket using equals(). KEY INSIGHT: 'hashCode = fast, approximate (which bucket?)', 'equals = slow, exact (is this the one?)', 'BOTH are needed. hashCode narrows the search; equals confirms the match.' THE CONTRACT WARNING: Shows what happens when equals and hashCode disagree—two 'equal' objects with different hashCodes go to different buckets, and one 'disappears' because the search looks in the wrong bucket.")

In Python, classes that are not Hashable do not need to implement a `__hash__` method. However, in Java, **all** objects have a `hashCode` method, just like they all have an `equals` method.
[If you override `equals`, you *must* also override `hashCode`](https://learning.oreilly.com/library/view/effective-java-3rd/9780134686097/ch3.xhtml#lev11), which has the following contract:
> * Whenever it is invoked on the same object more than once during an execution of a Java application, the hashCode method must consistently return the same integer, provided no information used in equals comparisons on the object is modified. This integer need not remain consistent from one execution of an application to another execution of the same application.
> * If two objects are equal according to the equals method, then calling the hashCode method on each of the two objects must produce the same integer result.
> * It is not required that if two objects are unequal according to the equals method, then calling the hashCode method on each of the two objects must produce distinct integer results. However, the programmer should be aware that producing distinct integer results for unequal objects may improve the performance of hash tables.

The `hashCode` method is used by `HashMap` and `HashSet` to determine if two objects are the same. If two objects are equal according to `equals`, then they must have the same `hashCode`. However, if two objects have the same `hashCode`, they may or may not be equal according to `equals`.

Good hash functions should be fast to compute and produce unequal values for unequal objects.

Here is a recipe for overriding `hashCode`:
1. Declare an `int` field called `result`, initialized to the `hashCode` of the first field that affects equality.
2. Compute a `hashCode` for each field that affects equality.
3. Combine the hash codes using a bitwise operation.
4. Return the result.

(See [Effective Java](https://learning.oreilly.com/library/view/effective-java-3rd/9780134686097/ch3.xhtml#lev11) for more details.)

### [`Comparable.compareTo`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Comparable.html#compareTo(java.lang.Object)) (5 minutes)
There are many cases in a program where we might want to compare the order of two objects. For example, we might want to sort a list of objects, or find the smallest or largest object in a collection. This is common enough that Java provides a standard interface to compare two objects, albeit one that is not required for all Objects.

The `Comparable` interface is used to compare objects of a single type. For all classes, you should [consider implementing `Comparable`](https://learning.oreilly.com/library/view/effective-java-3rd/9780134686097/ch3.xhtml#lev14). By implementing `Comparable`, you are allowing your class to interoperate with all of the many existing algorithms and data structures that expect this behavior. If there is an obvious natural ordering of your type, you should implement `Comparable` and use that ordering.

This interface specifies a single method, `compareTo` with the following specification:

> Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
> The implementor must ensure signum(x.compareTo(y)) == -signum(y.compareTo(x)) for all x and y. (This implies that x.compareTo(y) must throw an exception if and only if y.compareTo(x) throws an exception.)
>
> The implementor must also ensure that the relation is transitive: (x.compareTo(y) > 0 && y.compareTo(z) > 0) implies x.compareTo(z) > 0.
>
> Finally, the implementor must ensure that x.compareTo(y)==0 implies that signum(x.compareTo(z)) == signum(y.compareTo(z)), for all z.

Unlike `equals`, `compareTo` specifies exceptional behavior: if the specified object is `null`, a `NullPointerException` is thrown, and if the specified object's type is unexpected, a `ClassCastException` is thrown.

While this specification has a lot of parts, it is less complicated than it may first appear: Implementations of `compareTo` should return a negative integer, zero, or a positive integer if this object is less than, equal to, or greater than the specified object. The property must be reversible (if `x.compareTo(y) > 0`, then `y.compareTo(x) < 0`), and transitive (if `x.compareTo(y) > 0` and `y.compareTo(z) > 0`, then `x.compareTo(z) > 0`). It is also important that `compareTo` is consistent with `equals`: if `x.equals(y)`, then `x.compareTo(y) == 0`. While this last part is not required by the specification, it is a good idea to follow it, and is required for this course.
