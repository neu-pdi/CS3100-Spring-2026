---
sidebar_position: 34
lecture_number: 34
title: Performance
---

Throughout this course, we've touched on performance in passing — ArrayList vs LinkedList in [L3](/lecture-notes/l3-more-java), network latency in [L20](/lecture-notes/l20-networks), thread overhead in [L31](/lecture-notes/l31-concurrency1), the I/O scaled-time table in [L32](/lecture-notes/l32-concurrency2), rate limiting in [L33](/lecture-notes/l33-event-architecture). Today we bring those threads together into a coherent approach to performance engineering.

The core principle: **measure, don't guess.** Developers have notoriously bad intuitions about where their code spends time. The scientific method from [L14 (Debugging)](/lecture-notes/l14-program-understanding) applies here too — form a hypothesis about the bottleneck, measure to test it, and iterate. The worst performance bugs come from optimizing the wrong thing.

## Reason about algorithmic growth using Big-O notation (10 minutes)

Before we can profile code and identify bottlenecks, we need a language for describing *how fast things grow*. When a SceneItAll hub manages 10 devices, everything feels fast. When it manages 1,000 devices, some operations become painfully slow. Big-O notation tells us *which ones* and *why*.

### What Big-O Measures

Big-O notation describes how the runtime (or memory usage) of an algorithm scales as the input size **n** grows. It ignores constant factors and focuses on the shape of the growth curve — because when **n** gets large enough, the shape dominates everything else.

| Notation | Name | What it means | SceneItAll example |
|----------|------|--------------|-------------------|
| **O(1)** | Constant | Same time regardless of input size | Look up a device by ID in a `HashMap` |
| **O(log n)** | Logarithmic | Doubles input → one extra step | Binary search through sorted device list |
| **O(n)** | Linear | Time grows proportionally with input | Iterate all devices to find one by name |
| **O(n log n)** | Linearithmic | Slightly worse than linear | Sort 1,000 devices by brightness |
| **O(n²)** | Quadratic | Time grows with the *square* of input | Compare every device to every other device (nested loop) |

### Why Constants Don't Matter (Until They Do)

In Java, `ArrayList.get(i)` is **O(1)** because the backing array supports direct index access. `LinkedList.get(i)` is **O(n)** because each call must traverse nodes from the nearer end of the list — having an index does not give you a pointer to a node. Even when asymptotics match (for example, walking the whole list with an iterator is **O(n)** for both), Big-O hides the **constant factor**: how long each step costs once you are in the right place — and indexed loops on a `LinkedList` compound the traversal cost (roughly **O(n²)** total for the pattern below, versus **O(n)** for `ArrayList`).

```java
// O(n) total: each ArrayList.get(i) is O(1)
for (int i = 0; i < arrayList.size(); i++) {
    process(arrayList.get(i));   // ~1 ns per element (cache-friendly)
}
// O(n²) total: each LinkedList.get(i) walks up to O(n) nodes
for (int i = 0; i < linkedList.size(); i++) {
    process(linkedList.get(i));  // pointer chasing; cache-unfriendly
}
```

We'll explain the "use ArrayList by default" rule from L3 when we reach the memory hierarchy below.

### Big-O in Practice: Recognizing Complexity in Code

You don't need to do formal proofs. Learn to recognize common patterns:

```java
// O(1) — constant: one operation regardless of collection size
Device device = deviceMap.get(deviceId);

// O(n) — linear: one loop through the collection
for (Device d : devices) {
    if (d.getName().equals(name)) return d;
}

// O(n²) — quadratic: nested loops over the same collection
for (Device a : devices) {
    for (Device b : devices) {
        if (a != b && a.getRoom().equals(b.getRoom())) {
            // compare every pair — grows with n²
        }
    }
}

// O(n log n) — sorting
Collections.sort(devices, Comparator.comparing(Device::getBrightness));
```

**The practical test:** "If I double the input size, how much slower does it get?" O(n) = 2x slower. O(n²) = 4x slower. O(n log n) = slightly more than 2x slower. This is how you predict whether your code will survive scaling from 10 devices to 10,000.

### When Big-O Matters and When It Doesn't

Big-O matters in two situations:

1. **When n is large** — thousands of devices, millions of events, hundreds of thousands of users. O(n²) on 10,000 items means 100 million operations.

2. **When each operation is expensive** — even for small n. SceneItAll activates a scene with 15 devices. If each device command is a 200ms Zigbee network call, O(n) individual calls = 15 × 200ms = 3 seconds. O(1) batched call = 200ms. The n is small, but Big-O determines *how many times you pay the expensive per-operation cost.* This is exactly the batching pattern we'll see later in this lecture.

For truly cheap, in-memory operations on small n (iterating a list of 20 items), an O(n²) algorithm completes in microseconds — optimizing it is wasted effort.

Big-O *doesn't* tell you about:
- **Constant factors** — cache behavior, memory allocation overhead, JIT compilation
- **Memory allocation overhead** — new objects cost a few dozen bytes, but will impose a cost on the garbage collector

This is why we still need profiling. Big-O tells you which algorithms *could* be a problem as n grows or when per-operation costs are high. Profiling tells you which ones *actually are* a problem right now.

## Identify performance bottlenecks: measure, don't guess (5 minutes)

The single most important lesson in performance engineering: **you cannot trust your intuition about where time is spent.** Code that looks slow may be irrelevant to the overall runtime. Code that looks fast may be called millions of times and dominate the profile.

The scientific method from [L14 (Debugging)](/lecture-notes/l14-program-understanding) applies directly: observe a performance problem, hypothesize where the bottleneck is, **measure** to test your hypothesis, fix the actual bottleneck — not the one you assumed.

Performance has several dimensions, and optimizing one can worsen another:

| Metric | What it measures | Example |
|--------|-----------------|---------|
| **Latency** | Time for a single operation | "How long until the user sees their grade?" |
| **Throughput** | Operations per unit time | "How many submissions per minute?" |
| **Memory** | Heap/stack consumption | "How much RAM for 1000 devices?" |
| **CPU** | Processor time consumed | "CPU-bound or I/O-bound?" (recall [L32](/lecture-notes/l32-concurrency2)) |

**Profiling tools** (for reference — know they exist, not how to use them in detail):

- **JFR (Java Flight Recorder):** Built into the JDK. Low overhead, production-safe. Records where time and memory are spent.
- **Flame graphs:** The most useful profiling visualization. Wide boxes = where your program spends time. Widest, flattest boxes are your bottlenecks.
- **Heap dumps:** Snapshot of all live objects. Use when you suspect a memory leak.

The key question when reading a profile: **is this method inherently expensive, or is it being called too many times?** The answer determines the fix: optimize the algorithm, or cache/batch to reduce call frequency.

:::tip
**Connection to Testing (L15):** Just as unit tests catch correctness regressions, performance benchmark tests catch performance regressions. Teams add these to CI pipelines so that a change making a critical path 2x slower fails the build before reaching production.
:::

## Analyze the performance impact of architectural decisions (15 minutes)

### The Memory Hierarchy: Why Data Location Matters

Every piece of data your program uses lives somewhere in a hierarchy of storage, and the location determines how fast you can access it:

| Storage | Latency | Scaled (1 cycle = 1 sec) | Size |
|---------|---------|--------------------------|------|
| CPU register | ~0.3 ns | 1 second | bytes |
| L1 cache | ~1 ns | 3 seconds | 64 KB |
| L2 cache | ~4 ns | 13 seconds | 256 KB |
| L3 cache | ~12 ns | 40 seconds | 8 MB |
| RAM | ~100 ns | 5 minutes | 16 GB |
| SSD | ~100 μs | 4 days | 1 TB |
| Network (same DC) | ~500 μs | 19 days | ∞ |
| Network (cross-country) | ~50 ms | 5 years | ∞ |

You've seen this table before — in [L32](/lecture-notes/l32-concurrency2) we used it to motivate async programming. Here the lesson is different: **architectural decisions determine where data lives, and that determines performance.**

:::note Recall
In [L3](/lecture-notes/l3-more-java), we said "use ArrayList by default" but deferred the explanation. Now we can see why: `ArrayList` stores elements contiguously in memory. When you iterate, the CPU loads a cache line (64 bytes) and gets multiple elements for free. `LinkedList` scatters nodes across the heap — every `next` pointer follows a random memory address, causing cache misses. The algorithmic complexity is the same (O(n) iteration), but the constant factor differs by 10-100x because of cache behavior.
:::

### Latency Budgets: Where Does Time Go?

When a user taps "Activate Scene" in SceneItAll, the total latency is the sum of every operation in the path:

```
User taps → App processes event (1ms)
         → Network to hub (50ms)
         → Hub computes settings (5ms)
         → 15 Zigbee commands (200ms each, parallel = 200ms)
         → Hub updates state (2ms)
         → Network back to app (50ms)
         → App renders update (5ms)
Total: ~313ms
```

A **latency budget** allocates time across these steps. If your target is 500ms total, you can see that the Zigbee commands and network round trips dominate. Optimizing the 5ms computation to 1ms saves 4ms — irrelevant. Optimizing the Zigbee commands (perhaps by batching or using a faster protocol) saves 100ms+ — significant.

Here's a latency budget you've lived every time you submit an assignment:

```
Student pushes code → GitHub webhook fires (50ms)
                    → Workflow queued, runner provisioned (~2-3 min typical)
                    → Grader tarball download (cache hit: 0ms, miss: 3s)
                    → Compile student code (2s)
                    → Run 100 tests (10s)
                    → POST results to Pawtograder API (200ms)
                    → Student sees grade (render: 100ms)
Total: ~2.5 min (typical) to ~4 min (cold cache)
```

You've experienced this latency every time you submit an assignment. The infrastructure overhead dominates — it typically takes 2-3 minutes just to go from pushing code to running tests, as GitHub queues the workflow run, finds an available runner, and provisions the environment. Optimizing test execution from 10s to 8s saves 2s — irrelevant compared to the minutes spent on infrastructure. Profile before optimizing. The infrastructure overhead connects directly to [L21 (Serverless)](/lecture-notes/l21-serverless), and the grader tarball caching by SHA connects to [L20's caching discussion](/lecture-notes/l20-networks).

Amazon found that every 100ms of added latency cost them 1% of sales. Latency budgets are not academic — they directly affect business outcomes.

The latency budget makes L20's Fallacy 2 ("Latency is zero") concrete — latency is not zero, it is not uniform across the path, and it is the single biggest factor in user-perceived performance.

This is why **profiling matters more than algorithmic optimization** for most real-world systems. You could reduce the hub computation from O(n) to O(1) and save 4ms. Or you could batch the Zigbee commands and save 150ms. Big-O tells you about algorithmic growth; the latency budget tells you where the time actually goes.

### Architectural Decisions That Affect Performance

| Decision | Performance implication | Lecture callback |
|----------|----------------------|-----------------|
| Monolith vs microservices | Method calls (ns) vs network calls (ms) | [L19](/lecture-notes/l19-monoliths) |
| Synchronous vs async | Blocking threads vs event-driven I/O | [L32](/lecture-notes/l32-concurrency2) |
| Sequential vs eventual consistency | Wait-for-all (slow, safe) vs propagate (fast, stale) | [L33](/lecture-notes/l33-event-architecture) |
| Thread-per-request vs thread pool | Memory scales with connections vs bounded | [L31](/lecture-notes/l31-concurrency1) |
| Shared mutable state vs immutable events | Lock contention vs allocation overhead | [L31](/lecture-notes/l31-concurrency1), [L33](/lecture-notes/l33-event-architecture) |
| Serverless vs always-on | Cold start latency (100ms-5s) vs idle resource cost | [L21](/lecture-notes/l21-serverless) |

:::note
GitHub is a Ruby on Rails monolith serving over 100 million developers. In [February–March 2026](https://github.blog/news-insights/company-news/addressing-githubs-recent-availability-issues-2/), rapid usage growth — including a tenfold spike in read traffic from popular client apps — exposed architectural limitations: a core auth database overloaded, and architectural coupling allowed localized failures to cascade across services. GitHub's response combines near-term optimization within the monolith (redesigning the user cache, isolating key dependencies like Actions and Git) with long-term architectural migration (moving from 12.5% to 50% Azure infrastructure by July, decomposing the monolith into isolated services). Sometimes you optimize within your architecture's constraints; sometimes the constraints tell you the architecture must change. (Connects to [L19](/lecture-notes/l19-monoliths).)
:::

The key insight from [L18 (Thinking Architecturally)](/lecture-notes/l18-architecture-design): **architecture determines the ceiling of your performance.** You can optimize code within an architecture, but you can't exceed the architecture's fundamental limits. A synchronous monolith handling 10,000 concurrent users will always be limited by thread count and memory — no amount of code optimization changes that. Switching to async or event-driven architecture raises the ceiling.

## Apply common patterns to improve performance (15 minutes)

Once you've profiled and identified the actual bottleneck, these patterns address common categories of performance problems. Each connects to concepts you've already learned:

### Caching: Don't Compute What You Already Know

The fastest operation is the one that doesn't happen. If a computation is expensive and its inputs haven't changed, store the result and reuse it.

```java
// Before: compute every time
public SceneSettings getSettings(Scene scene, SensorData sensors) {
    return settingsEngine.computeOptimal(scene, sensors); // 50ms each time
}

// After: cache by inputs
private final Map<CacheKey, SceneSettings> cache = new ConcurrentHashMap<>();

public SceneSettings getSettings(Scene scene, SensorData sensors) {
    CacheKey key = new CacheKey(scene.getId(), sensors.hash());
    return cache.computeIfAbsent(key,
        k -> settingsEngine.computeOptimal(scene, sensors));
}
```

**When to cache:** When the same computation runs repeatedly with the same inputs, and the result can be stale for a bounded period. In Big-O terms, caching turns an O(f(n)) computation into O(1) for cache hits — the most dramatic complexity reduction you can achieve, because you skip the computation entirely.

**When NOT to cache:** When inputs change every time, when staleness is unacceptable (recall [L33's consistency discussion](/lecture-notes/l33-event-architecture)), or when cache memory is a concern.

:::note Recall
In [L20](/lecture-notes/l20-networks), we discussed caching as a network optimization — Pawtograder caches grader tarballs by SHA hash. In [L33](/lecture-notes/l33-event-architecture), we formalized this: a cache is an eventually consistent copy of the source of truth. The cache invalidation problem ("when does the cache expire?") is the consistency question in disguise.
:::

### Batching: Amortize Fixed Costs

Some operations have a high fixed cost per invocation but can process many items at once. Batching amortizes that cost:

```java
// Before: one network call per device (15 × 200ms = 3 seconds)
for (Device device : devices) {
    zigbee.sendCommand(device, command); // 200ms each
}

// After: batch into one call (200ms + small per-item cost)
zigbee.sendBatch(devices, command); // one round-trip
```

In Big-O terms, batching reduces n operations with fixed cost C each (total: O(n × C)) to one operation with fixed cost C (total: O(C + n × c), where c is the small per-item cost). The fixed cost C is amortized across all items.

**Where batching applies:**
- Database queries: one query for N records instead of N queries for 1 record (the N+1 query problem)
- Network calls: batch API requests instead of individual calls
- File I/O: buffer writes instead of writing one byte at a time

### Pooling: Reuse Expensive Resources

Creating certain resources (threads, database connections, network connections) is expensive. A **pool** creates them once and reuses them:

```java
// Thread pool: reuse threads instead of creating new ones per task
ExecutorService pool = Executors.newFixedThreadPool(10);
```

You've already used this pattern — `ExecutorService` in [L31](/lecture-notes/l31-concurrency1) is a thread pool. The same principle applies to database connections (connection pools), HTTP clients (keep-alive), and object allocation in hot loops.

### Knowing When to Stop: Premature Optimization

The most important performance pattern is knowing **when NOT to optimize.**

> *"Premature optimization is the root of all evil."* — Donald Knuth

Optimization increases coupling ([L7](/lecture-notes/l7-design-for-change)). Cached values must be invalidated. Batched operations add complexity. Pooled resources must be managed. Every optimization makes the code harder to understand, modify, and test.

The rule: **don't optimize until you've measured, and don't optimize code that isn't the bottleneck.** If your profiler shows that 90% of time is spent in network I/O, optimizing a sorting algorithm that takes 0.1% of the time is wasted effort — and it makes the sorting code harder to maintain.

Connect this to [L7's coupling analysis](/lecture-notes/l7-design-for-change): an optimization that makes code 10% faster but introduces stamp coupling between two modules may not be worth it. The maintenance cost over the lifetime of the software may exceed the performance benefit.

## Understand garbage collection and automatic memory management (10 minutes)

### The Safety-Performance Trade-off

In C or C++, you manage memory manually: you `malloc` and `free` (or `new` and `delete`). This gives you full control over when memory is freed — but it also gives you use-after-free bugs, double-free bugs, and memory leaks when you forget to free. These bugs are among the most dangerous in all of software engineering — they cause security vulnerabilities, crashes, and data corruption.

Java, Python, JavaScript, Go, and most modern languages make a different choice: **automatic memory management through garbage collection.** You allocate objects with `new`; the runtime decides when to free them. This eliminates entire categories of bugs — you simply cannot use-after-free in Java. The trade-off: you don't control *when* memory is freed, and the garbage collector may pause your application at inconvenient times.

This is a design decision at the language level, and it reflects the same trade-off we've seen throughout the course: **safety vs performance.** Automatic memory management is overwhelmingly the right default — the bugs it prevents are far more costly than the performance it sacrifices. But understanding *how* it works helps you avoid the cases where it hurts.

We'll return to this trade-off in [L35 (Safety and Reliability)](/lecture-notes/l35-safety-reliability), where we'll see that removing safety mechanisms for performance gains can have catastrophic consequences — the Therac-25 radiation machine replaced hardware interlocks with software because it was faster and cheaper.

### Automatic Memory Management Is Everywhere

The JVM's garbage collector is not unique. The same principle — automatic reclamation of unused resources — appears at every level of the stack:

| System | What it manages | How it reclaims | Performance cost |
|--------|----------------|----------------|-----------------|
| **JVM GC** | Heap objects | Mark-and-sweep: trace from GC roots, free unreachable objects | GC pauses (ms to seconds) |
| **Database (PostgreSQL)** | Table rows | VACUUM: identifies dead rows from old transactions, reclaims space | VACUUM pauses, table bloat |
| **File system** | Disk blocks | Reference counting + periodic garbage collection of orphaned blocks | Background I/O |
| **Event broker (Kafka)** | Log segments | Retention policy: delete segments older than N days or N bytes | Disk cleanup spikes |

A database is, at its core, a very clever big list with well-maintained indexes. When you `DELETE` a row in PostgreSQL, the row isn't immediately removed — it's marked as dead. A background process called VACUUM periodically scans for dead rows and reclaims the space, just like a JVM garbage collector scans for unreachable objects. The same trade-off applies: automatic management prevents you from accidentally corrupting the table by freeing a row that's still being read by another transaction, but VACUUM consumes CPU and I/O.

This is largely **desirable from a safety perspective** — you don't want application code manually managing database storage, just as you don't want application code manually freeing heap memory. But it creates a performance consideration at every level: the system needs time to clean up after itself.

### How the JVM's Garbage Collector Works

**GC roots** are the starting points for determining what's alive:
- Local variables on thread stacks
- Static fields
- Active threads themselves

The collector starts from GC roots and traces all reachable references. Anything not reachable is garbage and can be freed. This is conceptually simple but operationally expensive — the collector must pause some or all application threads to get a consistent view of the heap.

### Memory Leaks in Java

Java can still have memory leaks — not in the C sense (forgotten `free()`), but in the sense of **unintended references keeping objects alive:**

| Leak pattern | What happens | Fix |
|-------------|-------------|-----|
| **Static collections** | `static List<Listener>` grows forever | Use `WeakReference` or remove explicitly |
| **Listener registration without removal** | UI listeners hold references to old views | Unregister in lifecycle callbacks |
| **Unbounded caches** | `HashMap` cache grows without eviction | Use `CacheBuilder` with max size or TTL |
| **Inner class references** | Anonymous inner class holds reference to enclosing object | Use static inner class or lambda |

The database equivalent: a query that opens a transaction and never commits. The dead rows from that transaction can never be vacuumed — they accumulate forever, bloating the table. Same pattern, different level of the stack.

### GC Pauses and Application Performance

When the garbage collector runs, it may **pause your application.** Modern GCs (G1, ZGC, Shenandoah) minimize pause times, but high allocation rates still cause problems:

- **High allocation rate** → GC runs more frequently → more pauses
- **Large live set** → GC takes longer to trace → longer pauses
- **Lots of survivors** → GC has to copy more data → more CPU time

The same dynamics apply to database VACUUM: a high rate of updates → more dead rows → VACUUM runs more frequently and takes longer. At scale, this becomes a significant performance concern — PostgreSQL's autovacuum configuration is one of the most tuned parameters in production databases.

The practical takeaway: in performance-critical code, reduce unnecessary object allocation. Reuse objects where possible (pooling). Avoid creating short-lived objects in tight loops. But don't sacrifice readability for this — only optimize allocation in code that the profiler identifies as a hot spot. The safety benefits of automatic memory management far outweigh the performance costs in nearly all cases.

## Performance and sustainability (5 minutes)

Performance optimization is often framed as "making things faster." But in the context of software engineering over time, performance connects to broader sustainability concerns that we'll explore more fully in [L36](/lecture-notes/l36-sustainability).

### Environmental costs compound over time

A 10% efficiency improvement in code that runs billions of times per day adds up. Cloud computing bills are directly proportional to resource usage — CPU, memory, network. "Green software engineering" is emerging as a discipline: organizations like the Green Software Foundation are developing standards for measuring and reducing the carbon footprint of software.

### Performance choices have distributional effects

Optimizing for high-end devices may exclude users with older hardware. As your user base grows and diversifies, who gets left behind? This connects to the broader inclusivity framework from [L28](/lecture-notes/l28-accessibility) — when software performs poorly on constrained devices or slow networks, it excludes users just as surely as missing alt text excludes screen reader users.

The SceneItAll hub might run fine on a modern Raspberry Pi 5, but what about the thousands of hubs already deployed on Raspberry Pi 3s? Performance constraints aren't just about speed — they're about which users your software includes or excludes.

### Want to go deeper?

- **[CS 3650: Computer Systems](https://course.khoury.northeastern.edu/cs3650/)** — Memory hierarchy, virtual memory, CPU caches, OS-level performance
- **[CS 6620: Fundamentals of Cloud Computing](https://catalog.northeastern.edu/search/?P=CS+6620)** — Performance at data center scale, auto-scaling, load balancing
