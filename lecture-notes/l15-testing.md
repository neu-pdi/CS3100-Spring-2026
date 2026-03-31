---
sidebar_position: 15
lecture_number: 15
title: "L15: Test Doubles and Isolation"
---

# Test Doubles and Isolation

## Distinguish between unit, integration, and end-to-end tests (10 minutes)

When we talk about automated testing, we're really talking about a whole family of different test types that vary in *scope* — how much of the system is exercised by a single test. Understanding this spectrum helps us make good decisions about what kinds of tests to write and when.

### Unit Tests

At one end of the spectrum are **unit tests**. A unit test exercises a single "unit" of code — typically a class or a small set of closely related classes — in isolation from the rest of the system. If we're testing `ThermostatController`, a unit test would test *just* the controller's logic, not the temperature sensors or HVAC systems it depends on.

Unit tests are:
- **Fast**: They run in milliseconds because they don't touch databases, networks, or hardware
- **Focused**: When a unit test fails, you know exactly where to look for the bug
- **Numerous**: You can have thousands of unit tests and run them all in seconds

The challenge with unit tests is achieving that isolation. If `ThermostatController` calls `TemperatureSensor.readTemperature()`, how do we test the controller without a real sensor? We'll spend most of this lecture answering that question.

### Integration Tests

In the middle of the spectrum are **integration tests**. These tests exercise multiple components working together. An integration test might use a real `ThermostatController` and a real `TemperatureSensor`, but perhaps not the actual HVAC hardware.

Integration tests help us answer questions that unit tests can't:
- Do these components communicate correctly?
- Do they agree on data formats and protocols?
- Do timing and ordering work as expected?

The tradeoff is that integration tests are slower (they might involve databases, network calls, or hardware) and harder to debug (when they fail, which component caused the failure?).

### End-to-End Tests

At the far end of the spectrum are **end-to-end (E2E) tests**. These test the entire system as a user would experience it. For a web application, an E2E test might open a real browser, click real buttons, and verify that the right things appear on screen. For example: one set of E2E tests for Pawtograder automatically 1) deploy a complete copy of the system to a test environment, 2) create a new class with assignments, 3) create student submissions, 4) validate that a student can log in, view the autograder result, and apply their own self-review to that submission.

E2E tests are valuable because they test what actually matters — does the system work from the user's perspective? But they're also:
- **Slow**: A single E2E test might take seconds or minutes
- **Expensive**: They require a complete deployment of the system to a test environment. Running the thing is a non-zero cost, and building and maintaining the infrastructure is also a non-zero cost.
- **Flaky**: So many things can go wrong (network glitches, timing issues, browser quirks)
- **Hard to debug**: When an E2E test fails, the bug could be anywhere in the system

:::note Looking Ahead
We'll cover E2E testing in more depth in [Lecture 30 (GUI Patterns and Testing)](/lecture-notes/l30-gui2), where you'll learn to write automated tests that interact with graphical interfaces using tools like TestFX.
:::

### Why Have Different Scopes?

You might wonder: why not just write E2E tests for everything? If they test the whole system, don't they give us the most confidence?

The problem is that E2E tests are expensive — slow to run, hard to maintain, and difficult to debug. You can't practically write an E2E test for every edge case, every error condition, every boundary.

This is where the value of unit tests becomes clear. Suppose we want to test that our thermostat handles 15 different edge cases: temperatures exactly at the threshold, negative temperatures, sensor failures, various rounding scenarios, etc. With unit tests, we can write 15 small, fast tests that each run in milliseconds. With E2E tests, that same coverage might take minutes and be fragile.

The practical approach is to use a mix:
- **Many unit tests** that cover detailed behavior and edge cases
- **Some integration tests** that verify components work together correctly
- **Few E2E tests** that verify critical user journeys work end-to-end

The rest of this lecture focuses on unit testing — specifically, how to test code in isolation when it depends on other components.

## Explain the challenge of testing code with external dependencies (5 minutes)

Consider a `ThermostatController` class in an IoT home automation system. This controller reads temperatures from sensors, activates HVAC systems, and sends notifications. Here's a simplified version:

```java
public class ThermostatController {
    private final TemperatureSensor sensor;
    private final HVACService hvacService;
    private final NotificationService notifier;
    
    public ThermostatController(TemperatureSensor sensor, 
                                 HVACService hvacService, 
                                 NotificationService notifier) {
        this.sensor = sensor;
        this.hvacService = hvacService;
        this.notifier = notifier;
    }
    
    public void adjustToTargetTemperature(double targetTemp, String zoneId) {
        double currentTemp = sensor.readTemperature(zoneId);
        double delta = targetTemp - currentTemp;
        
        if (Math.abs(delta) > 0.5) {
            HVACMode mode = delta > 0 ? HVACMode.HEATING : HVACMode.COOLING;
            hvacService.setMode(mode, zoneId);
            hvacService.activate(zoneId);
            notifier.send("HVAC activated in " + zoneId, NotificationLevel.INFO);
        }
    }
}
```

Now suppose we want to write a unit test for `adjustToTargetTemperature`. What happens if we try to instantiate a real `TemperatureSensor`? We'd need actual hardware. What about a real `HVACService`? We'd be turning on actual heating systems. And `NotificationService`? We'd be spamming real users with test messages.

This is a fundamental problem in unit testing: **how do we test a unit of code in isolation when it depends on other components?**

We could just skip the unit tests and write integration tests that use real components. But integration tests are slow, flaky, and require complex (and sometimes expensive) setup. We want fast, reliable tests that run in milliseconds and can verify specific behaviors. We need a way to test `ThermostatController`'s logic without involving the real dependencies.

## Differentiate between stubs, fakes, and spies as types of test doubles (10 minutes)

The solution is to use **test doubles** — objects that stand in for real dependencies during testing. The term comes from the film industry, where stunt doubles stand in for actors. Just as a stunt double doesn't need to be a great actor (they just need to fall off buildings convincingly), a test double doesn't need to implement all the complexity of the real object — it just needs to behave appropriately for the test at hand.

There are several types of test doubles, each with different characteristics. Let's work through them from simplest to most sophisticated.

### Stubs: Returning Canned Answers

The simplest test double is a **stub** — an object that returns pre-programmed responses. A stub doesn't do any real work; it just returns whatever value we tell it to.

```java
class StubTemperatureSensor implements TemperatureSensor {
    private final double fixedTemperature;
    
    public StubTemperatureSensor(double temperature) {
        this.fixedTemperature = temperature;
    }
    
    @Override
    public double readTemperature(String zoneId) {
        return fixedTemperature;  // Always returns the same value
    }
}
```

This stub ignores the `zoneId` parameter entirely and always returns whatever temperature we configured. That's fine! For testing whether the controller activates heating when it's cold, we don't need a sophisticated sensor simulation — we just need something that says "it's 65 degrees."

We could use this stub in a test:

```java
@Test
public void activatesHeatingWhenBelowTarget() {
    TemperatureSensor stubSensor = new StubTemperatureSensor(65.0);
    // But wait... we still need HVACService and NotificationService
}
```

We'd need to create stubs for those too. Let's think about what those stubs need to do. For `NotificationService`, we might not care what happens — we just need something that doesn't throw an exception:

```java
class StubNotificationService implements NotificationService {
    @Override
    public void send(String message, NotificationLevel level) {
        // Do nothing — we don't care about notifications in this test
    }
}
```

### Fakes: Simplified Working Implementations

Sometimes we need something a bit more sophisticated than a stub. A **fake** is a working implementation that takes shortcuts — it's simpler than the real thing but actually functions.

For example, imagine testing a service that stores data in a database. We could create a fake that stores data in a `HashMap` instead:

```java
class FakeUserRepository implements UserRepository {
    private final Map<String, User> users = new HashMap<>();
    
    @Override
    public void save(User user) {
        users.put(user.getId(), user);
    }
    
    @Override
    public User findById(String id) {
        return users.get(id);
    }
    
    @Override
    public List<User> findAll() {
        return new ArrayList<>(users.values());
    }
}
```

This fake actually stores and retrieves data — it's a working implementation. It just doesn't persist anything to disk or handle concurrent access or do any of the other complex things a real database does.

The line between stubs and fakes can be blurry. The key distinction is that fakes have working implementations (even if simplified), while stubs just return canned values.

### Spies: Recording What Happened

Sometimes we need to verify that our code *did something* — not just that it returned the right value. For the thermostat example, we might want to verify that the controller actually called `hvacService.activate()` when the temperature was too low.

A **spy** is a test double that records how it was used:

```java
class SpyHVACService implements HVACService {
    private boolean activateCalled = false;
    private String activatedZone = null;
    private HVACMode setMode = null;
    
    @Override
    public void setMode(HVACMode mode, String zoneId) {
        this.setMode = mode;
    }
    
    @Override
    public void activate(String zoneId) {
        this.activateCalled = true;
        this.activatedZone = zoneId;
    }
    
    // Methods for tests to check what happened
    public boolean wasActivateCalled() { return activateCalled; }
    public String getActivatedZone() { return activatedZone; }
    public HVACMode getSetMode() { return setMode; }
}
```

Now we can write a complete test:

```java
@Test
public void activatesHeatingWhenBelowTarget() {
    StubTemperatureSensor stubSensor = new StubTemperatureSensor(65.0);
    SpyHVACService spyHVAC = new SpyHVACService();
    StubNotificationService stubNotifier = new StubNotificationService();
    
    ThermostatController controller = new ThermostatController(
        stubSensor, spyHVAC, stubNotifier);
    
    controller.adjustToTargetTemperature(72.0, "livingRoom");
    
    assertTrue(spyHVAC.wasActivateCalled());
    assertEquals("livingRoom", spyHVAC.getActivatedZone());
    assertEquals(HVACMode.HEATING, spyHVAC.getSetMode());
}
```

This test verifies behavior: when the current temperature (65°F) is below the target (72°F), the controller should activate heating for the correct zone.

### The Pain of Hand-Rolling Test Doubles

Look at how much code we had to write just to test one method! We created three separate classes (`StubTemperatureSensor`, `SpyHVACService`, `StubNotificationService`), and we haven't even tested error cases, edge cases, or the cooling path.

For each new test scenario, we might need different stub values or different spy recording. Should we create a new stub class for every temperature we want to test? That's a lot of boilerplate.

This is where mocking frameworks come in.

## Apply mocking frameworks to generate test doubles (10 minutes)

A **mocking framework** is a library that generates test doubles at runtime. Instead of writing stub and spy classes by hand, you describe the behavior you want and the framework creates an object that behaves that way.

The most popular mocking framework for Java is **Mockito**. Let's rewrite our test using Mockito:

```java
@Test
public void activatesHeatingWhenBelowTarget() {
    // Create test doubles — Mockito generates these at runtime
    TemperatureSensor mockSensor = mock(TemperatureSensor.class);
    HVACService mockHVAC = mock(HVACService.class);
    NotificationService mockNotifier = mock(NotificationService.class);
    
    // Configure the stub behavior
    when(mockSensor.readTemperature("livingRoom")).thenReturn(65.0);
    
    // Inject the test doubles
    ThermostatController controller = new ThermostatController(
        mockSensor, mockHVAC, mockNotifier);
    
    // Execute the code under test
    controller.adjustToTargetTemperature(72.0, "livingRoom");
    
    // Verify the spy recorded the expected interactions
    verify(mockHVAC).setMode(HVACMode.HEATING, "livingRoom");
    verify(mockHVAC).activate("livingRoom");
}
```

Notice how much more concise this is! Mockito's `mock()` creates a test double that combines stub and spy capabilities:
- `when(...).thenReturn(...)` configures stub behavior
- `verify(...)` checks spy recordings

The term "mock" in Mockito is a bit overloaded — a Mockito mock is really a general-purpose test double that can act as a stub, a spy, or both. Some testing purists distinguish "mocks" as test doubles that verify expectations, but in practice, most developers use "mock" to mean any test double created by a mocking framework. We will not test you on the difference between these, but when preparing for technical interviews, you might want to be sure to understand the difference.

### What Mockito Is Actually Doing

It's worth understanding that Mockito isn't magic. When you call `mock(HVACService.class)`, Mockito:

1. Uses reflection to examine the `HVACService` interface. This API was introduced way back in Java 1.1 (1997!), and returns a `Class` object for a given class, allowing code to inspect the class and its methods at runtime.
2. Generates a new class at runtime that implements every method in the interface.
3. By default, methods return null (or 0, or false, depending on return type)
4. Records every method call (the "spy" part)
5. Lets you configure return values with `when()` (the "stub" part)

You could write all of this by hand — Mockito just saves you the trouble.

### Argument Matchers

Sometimes you want to configure stub behavior or verify spy recordings without caring about exact argument values. Mockito provides **argument matchers** for this:

```java
// Stub: return 65.0 for ANY zone
when(mockSensor.readTemperature(anyString())).thenReturn(65.0);

// Verify: activate was called with any string argument
verify(mockHVAC).activate(anyString());

// Verify with a custom condition
verify(mockNotifier).send(
    argThat(message -> message.contains("HVAC activated")),
    eq(NotificationLevel.INFO)
);
```

The `argThat()` matcher takes a lambda that returns true if the argument matches. This is useful when you want to verify partial behavior — "the message should contain these words" rather than "the message should be exactly this string."

## Evaluate the tradeoffs of using test doubles (10 minutes)

Test doubles are useful, but they come with tradeoffs (compared to larger scope tests) that you should understand.

### The Good

**Speed**: Tests with test doubles run in milliseconds. No network calls, no disk I/O, no hardware communication. You can run thousands of tests in seconds.

**Determinism**: A stub always returns the same value. You won't have flaky tests because the real temperature sensor occasionally returns slightly different readings.

**Isolation**: When a test fails, you know the problem is in the code under test, not in some dependency. This makes debugging much easier.

**Testing edge cases**: How do you test what happens when a sensor throws an exception? With a real sensor, you'd have to physically disconnect it. With a stub, it's one line:

```java
when(mockSensor.readTemperature(anyString()))
    .thenThrow(new SensorException("Connection lost"));
```

### The Dangerous

**False confidence**: Your test might pass perfectly, but you've only proven that your code works with your test doubles. The real `TemperatureSensor` might return temperatures with different precision, or throw exceptions your stubs never threw.

```java
// Your stub returns a nice round number
when(mockSensor.readTemperature(any())).thenReturn(72.0);

// The real sensor returns: 72.4823017
// Does your code handle that correctly?
```

**Brittle tests**: Tests that verify exact method calls can break when you refactor, even if the behavior is unchanged.

```java
// This test will break if you rename activate() to start()
verify(mockHVAC).activate("livingRoom");
```

If you find yourself updating tests every time you touch the implementation, your tests might be too tightly coupled to implementation details.

**Testing the wrong thing**: It's easy to write a test that passes but doesn't actually verify anything useful. If your stub just returns canned values and your verifications just check that methods were called, you might not be testing the actual logic.

### Guidelines

**Use test doubles when**:
- The real dependency is slow, unreliable, or unavailable
- You need to simulate error conditions
- You want to verify that your code interacts correctly with dependencies
- The dependency has side effects you don't want during testing (sending emails, charging credit cards)

**Be cautious when**:
- The mock setup is more complex than the code under test
- You're verifying implementation details rather than behavior
- You're mocking types you don't own (third-party libraries)

### Finding the Right Balance

The right mix of unit and integration tests depends on your system. Code with complex business logic benefits from extensive unit tests that exercise all the edge cases. Code that's mostly about coordinating between components benefits more from integration tests.

A useful heuristic: if you find yourself writing increasingly elaborate test doubles just to test some behavior, that might be a sign you should write an integration test instead.

## Apply AI coding assistants to generate test plans and test doubles (10 minutes)

AI coding assistants can significantly speed up test writing. They're particularly good at:

- Generating stub implementations from interfaces
- Suggesting edge cases you might not have considered
- Converting hand-written test doubles to Mockito syntax
- Creating test data and fixtures

However, remember our principles for AI usage: **only ask AI to produce what you can effectively review for accuracy**. This applies to tests:

- AI-generated tests might have subtle bugs in their assertions
- The tests might pass but not actually verify the behavior you care about
- Mock configurations might not reflect real-world behavior

When using AI for test generation:

1. Start by describing the behavior you want to test in plain English. Begin by generating a *plan* for the test suite, and iterate on that plan before generating tests
2. Review generated test code carefully — does it actually test what it claims?
3. Run the tests and verify they fail when the code is broken
4. Check that mock configurations make sense for real-world scenarios

