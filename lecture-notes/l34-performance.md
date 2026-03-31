---
sidebar_position: 34
lecture_number: 34
title: "L34: Performance"
---

# Performance

## Compare relative latencies across the memory hierarchy (5 minutes)

(CPU registers → L1/L2 cache → RAM → disk → network)

## Estimate the time and space complexity of a simple algorithm (20 minutes)

:::note Recall
In [Lecture 3](/lecture-notes/l3-more-java), we mentioned that `ArrayList` should be your default choice over `LinkedList`, but deferred the explanation. Now we can understand why: it's all about how modern CPUs interact with memory. ArrayLists store elements contiguously, enabling cache-friendly access patterns that make iteration dramatically faster—even though LinkedLists have O(1) insertion at arbitrary positions "in theory."
:::

## Understand garbage collection in Java and how to avoid memory leaks (15 minutes)

- How the JVM manages memory (heap, stack, GC roots)
- Mark-and-sweep basics
- Common causes of memory leaks (static references, listeners, caches)
- Tools for detecting memory issues

## Apply common patterns to improve performance (15 minutes)

### Caching

### Object pooling and reuse

### Rate-limiting and buffering

### Parallelization

## Performance, Sustainability, and Long-Term Costs (10 minutes)

Performance optimization is often framed as "making things faster." But in the context of software engineering over time, performance connects to broader sustainability concerns.

### Environmental costs compound over time

- A 10% efficiency improvement in code run billions of times adds up
- Energy costs of cloud computing are increasingly visible (and billable)
- "Green software engineering" is emerging as a discipline and may become a regulatory requirement

### Performance choices have distributional effects

- Optimizing for high-end devices may exclude users with older hardware
- As your user base grows, who gets left behind?
- The users you optimize for in year 1 may not be your primary users in year 5. Or worse: they may still be the same users, but with outdated hardware and software, now frustrated with your app and ready to switch to a competitor.
