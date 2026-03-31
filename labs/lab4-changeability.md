---
sidebar_position: 4
title: "Lab 4: Changeability and Functional Programming"
image: /img/labs/web/lab4.png
---

#  Changeability and Functional Programming

![Lo-fi pixel art showing three side-by-side panels, each depicting the same smart home notification scenario implemented differently. Left panel: A tangled mess of wires and if/else branches on a whiteboard labeled 'MUD' with a stressed developer. Middle panel: Clean organized boxes connected by arrows labeled 'STRATEGY' with interface/class diagrams on a corkboard. Right panel: A sleek minimalist desk with lambda symbols (λ) floating above a laptop, labeled 'FUNCTIONAL'. At the bottom, two developers sit together at a table between the panels, pointing at the options and discussing (speech bubbles with '?' and thought bubbles), representing the collaborative decision-making aspect. Title: 'Lab 4: Changeability and Functional Programming'. Warm evening lighting, cozy atmosphere.](/img/labs/web/lab4.png)

In this lab, you'll analyze and compare the changeability of different programming styles in Java. You'll work with three versions of the same feature—implemented as a "big ball of mud," using the Strategy pattern with classes, and using lambdas—to understand how design choices affect code changeability.

:::info Grading: What You Need to Submit

**Due:** At the end of your scheduled lab section. This is automatically enforced with a 10-minute grace period, but **push your work regularly**—don't wait until the end!

**Option 1: Complete entire lab**
- Complete Parts 1-3 of the lab
- All code compiles and runs correctly
- Push your completed work to GitHub
- Complete the reflection in `REFLECTION.md`
- You may leave the lab after confirming with a TA that you're done

**Option 2: Complete what you are able and ask for help**
If you're unable to complete everything:
- Submit a `REFLECTION.md` documenting what you completed, where you got stuck, and what you tried
- A TA will review your submission and award credit for your good-faith effort

The **Optional Extensions** are not required for full credit but are excellent practice if you finish early.

:::

:::warning Attendance Matters

If lab leaders observe that you are **not working on the lab** during the section, or you **leave early** AND do not successfully complete the lab, you will receive **no marks**. However: if you finish the required parts of the lab and want to work on something else, just show the lab leader that you're done, and you'll be all set!

**Struggling? That's okay!** We are here to support you. If you're putting in effort and engaging with the material, we will give you credit. Ask questions, work with your neighbors, and flag down a lab leader if you're stuck.

:::

## Lab Facilitator Notes

:::tip For TAs: Lab Start (8 minutes)

**Attendance:** Take attendance using the roster in Pawtograder.

**Brief Intro (2 minutes):**
- "Today we're exploring changeability through Java's functional programming features"
- "You'll compare three different ways to implement the same behavior and analyze which is easiest to change"
- "This builds directly on Lectures 5, 7, and 8—coupling, cohesion, and the Strategy pattern"

**Soft Skill Focus — Respectful Disagreement (3 minutes):**

Read this to students:

> "Today we're also practicing *respectful disagreement*. In professional work, you'll often disagree about design decisions. The goal isn't to 'win'—it's to reach a better solution together.
>
> When you disagree with your partner:
> - **State your position clearly:** 'I think X because Y'
> - **Ask about their reasoning:** 'What's driving your preference for Z?'
> - **Look for shared goals:** 'We both want this to be easy to change, right?'
> - **Be willing to be persuaded:** 'Oh, I hadn't considered that. Let me think about it.'
>
> By the end of Part 3, you and your partner need to reach a *joint decision* on which approach you'd use for production—not just 'agree to disagree.' That's your goal."

**Pair Formation (3 minutes):**
- Have students pair up with someone they haven't worked with recently
- If odd number, form one group of three
- **Step 1:** Introduce yourself to your partner. Ask how they are connecting with the class so far. You will note your partner's name in `REFLECTION.md`.

:::

## Learning Objectives

By the end of this lab, you will be able to:

- Analyze the changeability of a software module for a hypothetical change using the language of coupling and cohesion
- Write changeable code using lambdas and functional interfaces
- Compare the changeability of Java code that uses functional vs OO styles
- Apply the Strategy pattern using both class-based and lambda-based implementations

## Before You Begin

**Prerequisites:** Complete Lectures 5-8 and Flashcard Sets 3-5. You should be familiar with:
- Lambda syntax and functional interfaces (Lecture 5)
- Coupling and cohesion (Lecture 7)
- The Strategy pattern (Lectures 5 and 7)

**Clone the Lab Repository:** Clone your lab4 repository from Pawtograder.

The repository includes:

**Part 1 Code to Analyze** (`net.sceneitall.iot.lab4.part1`):
- `mud/` — A "big ball of mud" implementation with all logic in one class
- `strategy/` — A Strategy pattern implementation with separate classes
- `functional/` — A lambda-based implementation using functional interfaces

**Part 2 Coding Exercises** (`net.sceneitall.iot.lab4.part2`):
- `DeviceFilterExercises.java` — where you'll practice writing lambdas

**Part 3** is discussion and analysis—your findings go in `REFLECTION.md`

---

## The Scenario: Device Notification Strategies

SceneItAll needs to notify users when their IoT devices have issues. Different notification strategies are needed for different situations:

- **Immediate notifications** for critical devices (security cameras, smoke detectors)
- **Batched daily digests** for routine updates (low battery warnings, firmware updates available)
- **Smart notifications** that consider the time of day and user preferences

You'll examine three implementations of this notification system and analyze how easy each would be to change when **unknown future requirements** inevitably emerge.

**The key insight:** We can't predict exactly *what* will change, but we can reason about *what kinds* of changes are likely. A well-designed system anticipates categories of change—new notification channels, new filtering logic, new user preferences—even without knowing the specifics.

---

## Part 1: Analyzing Three Approaches (20 minutes)

In this part, you'll examine three different implementations of the same notification logic. Your goal is to understand how each design handles the uncertainty of future requirements.

**The question isn't "which is best?"** It's: "Which design makes it easiest to respond to the *kinds* of changes we might reasonably expect?"

### Exercise 1.1: The Big Ball of Mud

Open `part1/mud/NotificationManager.java`. This implementation handles all notification logic in a single class with conditional statements.

```java
public class NotificationManager {
    public void notifyUser(IoTDevice device, String message, NotificationType type) {
        if (type == NotificationType.IMMEDIATE) {
            // Send immediately via push notification
            sendPushNotification(device.getOwner(), message);
        } else if (type == NotificationType.DAILY_DIGEST) {
            // Queue for daily digest
            addToDigestQueue(device.getOwner(), message);
        } else if (type == NotificationType.SMART) {
            // Check time and preferences
            if (isQuietHours(device.getOwner())) {
                addToDigestQueue(device.getOwner(), message);
            } else if (device.isCritical()) {
                sendPushNotification(device.getOwner(), message);
            } else {
                sendEmailNotification(device.getOwner(), message);
            }
        }
    }
    // ... many more methods ...
}
```

**With a partner, discuss:**

1. What kind of coupling does this design exhibit? (Hint: Look at the `type` parameter)
2. **Imagine unknown future requirements:** What *categories* of change might affect this code?
3. For each category above, how many files would you need to modify?
4. How many "reasons to change" does this class have? (Single Responsibility Principle)

**Open `REFLECTION.md` now and start answering Question 1** (Coupling in the Mud) as you discuss.

### Exercise 1.2: The Strategy Pattern with Classes

Open `part1/strategy/`. This package contains an interface-based Strategy implementation:

```java
// The Strategy interface
public interface NotificationStrategy {
    void notify(User user, String message);
    boolean shouldNotify(IoTDevice device, User user);
}

// One concrete strategy
public class ImmediateNotificationStrategy implements NotificationStrategy {
    private final PushNotificationService pushService;

    @Override
    public void notify(User user, String message) {
        pushService.send(user, message);
    }

    @Override
    public boolean shouldNotify(IoTDevice device, User user) {
        return true; // Always notify immediately
    }
}

// The context that uses strategies
public class NotificationManager {
    private NotificationStrategy strategy;

    public void setStrategy(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    public void notifyUser(IoTDevice device, String message) {
        if (strategy.shouldNotify(device, device.getOwner())) {
            strategy.notify(device.getOwner(), message);
        }
    }
}
```

**With a partner, discuss:**

1. How does this design compare to the "mud" version in terms of coupling?
2. **Think about unknown future requirements again.** For the same three categories (new channels, new filtering rules, new notification types):
   - Which changes require *new* files vs *modifying* existing files?
   - Which changes can be made without touching `NotificationManager` at all?
3. What are the advantages of having each strategy in its own class?
4. What are the disadvantages? (Hint: How many files would you need to understand to trace the complete notification flow?)

**Add notes to your `REFLECTION.md`** as you discuss—you'll use these for Questions 4 and 5.

### Exercise 1.3: The Functional Approach with Lambdas

Open `part1/functional/`. This package uses Java's functional interfaces:

```java
public class NotificationManager {
    // Strategy is now just a pair of functions
    private Predicate<NotificationContext> shouldNotify;
    private BiConsumer<User, String> sendNotification;

    public void setStrategy(
            Predicate<NotificationContext> shouldNotify,
            BiConsumer<User, String> sendNotification) {
        this.shouldNotify = shouldNotify;
        this.sendNotification = sendNotification;
    }

    public void notifyUser(IoTDevice device, String message) {
        NotificationContext ctx = new NotificationContext(device, device.getOwner());
        if (shouldNotify.test(ctx)) {
            sendNotification.accept(device.getOwner(), message);
        }
    }
}

// Usage with lambdas
manager.setStrategy(
    ctx -> true,  // shouldNotify: always
    (user, msg) -> pushService.send(user, msg)  // sendNotification: push
);

// Or with method references
manager.setStrategy(
    ctx -> true,
    pushService::send
);
```

**With a partner, discuss:**

1. How does this compare to the class-based Strategy pattern?
2. What's gained by using lambdas instead of classes?
3. What's lost? (Hint: Think about documentation, naming, and debugging)
4. **For unknown future requirements:** How easy is it to:
   - Compose multiple behaviors (e.g., "notify via push AND log to audit trail")?
   - Reuse the same strategy in multiple places?
   - Test strategies in isolation?
5. When would you prefer this approach over the class-based Strategy?

**Add to your `REFLECTION.md`**—when would lambdas be better? When would they be worse? (Question 4)

### 🔄 Sync Point 1

**Lab leaders will facilitate a discussion (5 minutes):**

- Ask groups: "What type of coupling did you identify in the mud version?"
- Poll: "How many thought the Strategy pattern was better? How many preferred lambdas?"
- **Soft skill check-in:** "Did anyone disagree with their partner? How did you work through it?"
- Highlight good disagreement phrases you overheard: "I heard someone say 'I see your point, but what about...'—that's exactly the kind of productive disagreement we're practicing."

---

## Part 2: Writing Lambdas for Device Filtering (20 minutes)

Now you'll practice writing lambdas by implementing device filters for SceneItAll's dashboard.

### Exercise 2.1: Basic Predicates

Open `part2/DeviceFilterExercises.java`. You'll implement several device filters using lambdas.

#### Warm-up: Filter available devices

```java
/**
 * Returns a predicate that tests if a device is currently available.
 *
 * @return a Predicate<IoTDevice> that returns true if the device is available
 */
public static Predicate<IoTDevice> availableDevices() {
    // TODO: Return a lambda that checks if a device is available
    // Hint: IoTDevice has an isAvailable() method
    return null;
}
```

#### Filter by device type

```java
/**
 * Returns a predicate that tests if a device is a Light (or subtype of Light).
 *
 * @return a Predicate<IoTDevice> that returns true if the device is a Light
 */
public static Predicate<IoTDevice> lightsOnly() {
    // TODO: Return a lambda that checks if a device is an instance of Light
    // Hint: Use instanceof
    return null;
}
```

#### Filter by critical device

```java
/**
   * Returns a predicate that tests if a device is a critical device.
   *
   * @return a predicate that returns true if the device is critical
   */
  public static Predicate<IoTDevice> criticalDevices() {
    // TODO: Return a lambda that checks if a device is critical
    return null;
  }
```

#### Filter dimmable lights by brightness threshold

```java
/**
 * Returns a predicate that tests if a DimmableLight's brightness is above a threshold.
 * If the device is not a DimmableLight, return false.
 *
 * @param threshold the minimum brightness (0-100)
 * @return a Predicate<IoTDevice> that returns true if brightness > threshold
 */
public static Predicate<IoTDevice> brightnessAbove(int threshold) {
    // TODO: Return a lambda that:
    // 1. Checks if the device is a DimmableLight
    // 2. If so, checks if its brightness is above the threshold
    // 3. Returns false otherwise
    return null;
}
```

### Exercise 2.2: Composing Predicates

Java's `Predicate` interface has methods for composing predicates: `and()`, `or()`, and `negate()`.

```java
/**
 * Returns a predicate that tests if a device is both available AND a light.
 * Use predicate composition (the and() method), not a new lambda.
 *
 * @return a composed Predicate<IoTDevice>
 */
public static Predicate<IoTDevice> availableLights() {
    // TODO: Compose availableDevices() and lightsOnly() using and()
    return null;
}

/**
 * Returns a predicate that tests if a device is either unavailable OR critical.
 * Use predicate composition.
 *
 * @return a composed Predicate<IoTDevice>
 */
public static Predicate<IoTDevice> needsAttention() {
    // TODO: Compose predicates using or() and negate()
    // A device needs attention if it's unavailable OR if it's critical
    return null;
}
```

### Exercise 2.3: Using Filters with Streams

Now use your predicates to filter a list of devices.

```java
/**
 * Returns all available dimmable lights with brightness above 50%.
 * Use Stream API with your predicates.
 *
 * @param devices the list of devices to filter
 * @return a list of devices matching the criteria
 */
public static List<IoTDevice> findBrightLights(List<IoTDevice> devices) {
    // TODO: Use devices.stream()
    //       .filter(your predicates)
    //       .collect(Collectors.toList())
    return null;
}
```

**Run the Part 2 tests:**

```bash
./gradlew test --tests "net.sceneitall.iot.lab4.part2.*"
```

### 🔄 Sync Point 2

**Lab leaders will check in:**

- "Did anyone get stuck on composing predicates? Let's walk through `availableLights()` together."
- "Notice how we're building complex filters from simple, reusable pieces—this is functional composition in action."
- Quick poll: "Who found the lambda syntax intuitive? Who found it confusing?"

---

## Part 3: Changeability Analysis (15 minutes)

Now you'll apply the vocabulary from Lectures 7-8 to reason about how each implementation handles **uncertainty**.

### Exercise 3.1: Categorizing Future Changes

Before analyzing specific scenarios, let's think about *categories* of changes that notification systems commonly face:

| Category | Examples | How predictable? |
|----------|----------|------------------|
| **New channels** | SMS, Slack, webhooks, in-app | Very likely—channels proliferate |
| **New filtering logic** | Quiet hours, priority levels, user preferences | Likely—business rules evolve |
| **Cross-cutting concerns** | Logging, rate limiting, A/B testing | Likely—operational needs grow |
| **Data format changes** | New fields in notifications, localization | Somewhat likely |
| **Performance requirements** | Batching, async delivery, retries | Depends on scale |

**With your partner, rate each implementation's readiness for these categories (1-5, where 5 = handles it best):**

| Category | Mud | Strategy (Classes) | Functional (Lambdas) |
|----------|-----|-------------------|---------------------|
| New channels | ? | ? | ? |
| New filtering logic | ? | ? | ? |
| Cross-cutting concerns | ? | ? | ? |

**Complete this table in your `REFLECTION.md`** (Question 2), fill in your ratings, and discuss with a neighbor—do you agree? Why or why not?

### Exercise 3.2: Specific Change Scenarios

Now analyze specific scenarios. For each, consider: **Could we have anticipated this category of change?**

#### Scenario A: Add SMS Notifications

The product team wants to add SMS as a notification channel for users who don't use the app.

*Category: New channel (highly predictable—we should have seen this coming!)*

*Which implementation is easiest to change? Why?*

#### Scenario B: Add Notification Logging

Security audit requires logging all notifications (who was notified, when, what message).

*Category: Cross-cutting concern (predictable—auditing is a common requirement)*

*Which implementation is easiest to change? Why? (Hint: Think about the Decorator pattern from Lecture 8)*

#### Scenario C: Quick Prototype for User Testing

You need to quickly prototype a new "weekend mode" notification strategy for user testing. It doesn't need to be production-quality yet.

*Category: New filtering logic (predictable—user preferences always expand)*

*Which implementation is easiest to change? Does "production-quality" vs "prototype" affect your answer?*

#### Scenario D: The Surprise Requirement

Legal informs you that notifications to EU users must go through a different service for GDPR compliance. This affects *all* notification channels.

*Category: Regulatory/compliance (less predictable—but cross-cutting concerns often emerge this way)*

*Which implementation handles this best? Could we have anticipated this category of change, even if not this specific requirement?*

### Exercise 3.3: The Production Decision

You're building a notification system for SceneItAll that will need to support 10+ notification channels and complex user preferences.

**Discuss with your partner:**
- Which approach would you choose for our production system? Why?
- What combination of approaches might work best? (e.g., using both Strategy classes and lambdas)
- What would you do differently if this were a 2-week prototype vs. a 2-year product?

**Your goal is to reach a joint decision**—not "agree to disagree." If you find yourselves disagreeing, some phrases that help:
- "I think X because Y—what's driving your preference for Z?"
- "We both want this to be easy to change. Given that, which approach...?"
- "I hadn't considered that. Let me think about it."

**Write your joint conclusion in `REFLECTION.md`** (Question 5). If you changed your mind during the discussion, note what convinced you.

### 🔄 Sync Point 3

**Lab leaders will facilitate final discussion (10 minutes):**

*Technical debrief:*
- "What categories of change did you identify as most likely? Did everyone agree?"
- "For Scenario D (the GDPR surprise)—could any design have anticipated this? What does that tell us?"
- Key insight: **We can't predict specific requirements, but we can predict categories of change.** Good designs make common categories of change easy.

*Soft skill debrief:*
- "Did anyone change their mind during the production decision discussion? What convinced you?"
- "When is it okay to still disagree at the end? How do professional teams handle that?"
- Highlight: In real teams, decisions often get made even when people disagree—the skill is in how you handle that disagreement productively.

---

## Reflection

You should have been writing in `REFLECTION.md` throughout the lab. Before submitting, make sure you've answered all of these questions:

### Partner Introduction

**Partner's Name:** Record your partner's name here.

### Part 1 Analysis

1. **Coupling in the Mud:** What type of coupling did you identify in the "big ball of mud" implementation? (Use vocabulary from Lecture 7: control, stamp, data, common, or content coupling)

2. **Your Ratings Table:** Copy your ratings table from Exercise 3.1 and explain your reasoning for one row (e.g., why you rated the approaches the way you did for "cross-cutting concerns").

3. **Scenario Analysis:** For Scenario D (the GDPR surprise), which implementation did you think handled it best? Could we have anticipated this *category* of change even without knowing the specific requirement?

### Synthesis

4. **Functional vs OO:** In your own words, when should you use lambdas vs. class-based strategies? Give a concrete example of each.

5. **The Production Decision:** Which approach (or combination) would you choose for a production notification system? Why?

### Meta

6. **Personal Takeaway:** What's one thing you'll think about differently when designing code after this lab? Be specific.

7. **Disagreement and Resolution:** Describe a point where you and your partner initially disagreed. What was each position? What convinced one of you to change your mind (or how did you find a middle ground)?

---

## Optional Extensions

### Stretch Goal 1: Implement the Decorator Pattern

The Decorator pattern (Lecture 8) can add behavior to notification strategies without modifying them. In `stretch/LoggingNotificationDecorator.java`:

```java
/**
 * A decorator that logs all notifications before delegating to the wrapped strategy.
 */
public class LoggingNotificationDecorator implements NotificationStrategy {
    private final NotificationStrategy wrapped;
    private final Logger logger;

    // TODO: Implement the decorator
    // - The notify() method should log, then delegate to wrapped
    // - The shouldNotify() method should delegate to wrapped
}
```

Test it:
```java
NotificationStrategy base = new ImmediateNotificationStrategy(pushService);
NotificationStrategy logged = new LoggingNotificationDecorator(base, logger);
manager.setStrategy(logged);
```

### Stretch Goal 2: Method References Deep Dive

In `stretch/MethodReferenceExercises.java`, convert these lambdas to method references where possible:

```java
// Convert to method reference
Function<IoTDevice, String> getId = device -> device.getId();
Consumer<Light> turnOn = light -> light.turnOn();
Predicate<IoTDevice> isAvailable = device -> device.isAvailable();

// This one is trickier - can it be a method reference?
BiFunction<Integer, Integer, Integer> max = (a, b) -> Math.max(a, b);
```

### Stretch Goal 3: Custom Functional Interface

Create a custom functional interface for notification strategies that's more type-safe than `BiConsumer`:

```java
@FunctionalInterface
public interface NotificationSender {
    void send(User recipient, NotificationMessage message);

    // Add a default method for chaining
    default NotificationSender andThen(NotificationSender after) {
        // TODO: Implement - should send via this, then via after
    }
}
```

---

## Submission Checklist

**Due:** By the end of your lab section (with a 10-minute grace period).

Before your final submission, ensure:

- [ ] Part 1: You've discussed all three implementations with your partner
- [ ] Part 2: All predicate methods are implemented and tests pass
- [ ] Part 3: You've discussed the change scenarios with your partner
- [ ] `REFLECTION.md` is complete with all 8 questions answered
- [ ] All code compiles: `./gradlew build`
- [ ] All changes are committed and pushed to GitHub
