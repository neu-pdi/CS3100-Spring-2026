---
sidebar_position: 20
lecture_number: 20
title: "L20: Distributed Architecture: Networks, Microservices, and Security"
---

# Distributed Architecture: Networks, Microservices, and Security

Suggested background reading for a deeper dive:
- [Fundamentals of Software Architecture, 2nd Edition by Mark Richards and Neal Ford](https://learning.oreilly.com/library/view/fundamentals-of-software/9781098175504/ch17.html) - Chapter 17 on Microservices Architecture

## Learning Objectives

After this lecture, you will be able to:

1. Explain why **network communication** fundamentally changes architectural tradeoffs compared to in-process method calls
2. Identify and explain the **Fallacies of Distributed Computing** and how they affect system design
3. Describe the **client-server architecture** and REST API conventions used for service communication
4. Analyze the **benefits and costs of microservices** compared to monolithic architectures
5. Apply **security principles** (authentication, authorization, trust boundaries, CIA triad) to distributed system design

:::note Important Framing
In [L19](./l19-monoliths.md), we covered architectural styles for organizing code *within* a single deployment unit—Hexagonal, Layered, Pipelined—all living inside a monolith. We ended with a troubling observation: *once components communicate over a network, everything changes*.

This lecture explores that change. You're not expected to design production distributed systems by the end of this lecture. The goal is to *understand* why distributed architectures are fundamentally different from monoliths, and to recognize the tradeoffs when you encounter them. Junior engineers read API documentation and debug network issues far more often than they design new distributed architectures—comprehension comes first.
:::

## Recap: Why Leave the Monolith?

In L19, we saw that monoliths have significant benefits: simplicity, performance (nanosecond method calls), transactional consistency, and straightforward debugging. We also introduced **microservices** briefly—systems decomposed into small, independently deployable services.

The question isn't whether microservices are "better" than monoliths. The question is: *when do the benefits of distribution outweigh its costs?*

Let's revisit what drove our running examples toward distribution:

| System | Why Distributed? | What Crosses the Network? |
|--------|-----------------|---------------------------|
| **Bottlenose** | Grading needs isolation—you can't run student code in your main web process | Grading requests → Orca; results ← Orca |
| **Pawtograder** | Leverages GitHub's infrastructure; team autonomy between action maintainers and API maintainers | Submission registration, feedback submission, grader download |

Both systems could theoretically be monoliths. Bottlenose *mostly* is—except for Orca. Pawtograder *chose* distribution for different reasons: leveraging GitHub Actions eliminates infrastructure management, and clean API boundaries let different teams own different components.

But distribution comes with a price. Let's see what that price is.

## Client-Server Architecture

The **client-server architecture** separates systems into two roles: clients make requests, servers respond to them. The server centralizes data and logic; multiple clients can connect simultaneously. This is perhaps the most ubiquitous architectural style—every web application, every mobile app talking to a backend, every database connection follows this pattern.

Our running example, Pawtograder, exhibits a client-server relationship:

Pawtograder has a clear client-server boundary between the Grading Action (client) and the Pawtograder API (server):
- The action calls `createSubmission()` to register a grading run
- The action calls `submitFeedback()` to post results
- The API never calls the action—communication is always client-initiated

```
┌─────────────────────────┐         ┌─────────────────────────┐
│     Grading Action      │         │    Pawtograder API      │
│   (GitHub Actions VM)   │         │   (Web services)        │
│                         │  HTTP   │                         │
│  ┌───────────────────┐  │ ──────► │  ┌───────────────────┐  │
│  │ createSubmission()│  │         │  │ Submission Record │  │
│  │ submitFeedback()  │  │ ◄────── │  │ Grade Storage     │  │
│  └───────────────────┘  │         │  └───────────────────┘  │
└─────────────────────────┘         └─────────────────────────┘
         CLIENT                              SERVER
```

**Benefits of client-server:**
- Centralized control and shared state across clients
- Easier updates (change the server once, all clients benefit)
- Server can enforce business rules and security policies

**Constraints:**
- The server becomes a single point of failure
- Network latency affects every operation
- Requires handling network errors, timeouts, and retries

## How Services Communicate: REST APIs

When clients and servers communicate over networks, they need a common protocol. **HTTP** (Hypertext Transfer Protocol) is the foundation of web communication—it's how your browser talks to websites, how mobile apps talk to backends, and how services talk to each other.

An HTTP request has three key parts:
1. **Method** (also called "verb"): What action you want to perform
2. **URL**: Which resource you're targeting (e.g., `/submissions/123`)
3. **Body** (optional): Data you're sending (e.g., the contents of a new submission)

The server responds with a **status code** (200 = success, 404 = not found, 500 = server error) and optionally a response body.

**REST** (Representational State Transfer) is an architectural style built on HTTP that provides conventions for how to structure APIs. Understanding REST helps you read API documentation, design interfaces between services, and reason about distributed systems.

REST organizes APIs around **resources**—nouns representing domain concepts (submissions, assignments, students). Clients manipulate resources using standard HTTP methods:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve a resource | `GET /assignments/hw1` |
| POST | Create a new resource | `POST /submissions` with body containing submission data |
| PUT | Replace a resource entirely | `PUT /assignments/hw1` with complete new assignment |
| PATCH | Update part of a resource | `PATCH /submissions/123` to update just the score |
| DELETE | Remove a resource | `DELETE /submissions/123` |

**Pawtograder's API is RESTful:**
```
POST /functions/v1/createSubmission     # Create new submission record
POST /functions/v1/submitFeedback       # Submit grading results
GET  /rest/v1/submissions?student_id=X  # List submissions for a student
```

REST has become ubiquitous because it maps naturally onto HTTP (which every platform supports), uses standard status codes for errors (404 = not found, 401 = unauthorized, 500 = server error), and is stateless—each request contains all information needed to process it, making horizontal scaling straightforward.

**Alternative: GraphQL** is another API style where clients specify exactly which fields they need, avoiding over-fetching. It's powerful for complex frontends with varying data needs, but adds complexity. We won't cover it in depth, but you should know it exists—many modern APIs offer GraphQL alongside REST.

The key architectural insight: REST enforces a uniform interface across your entire API. Once you understand how to interact with one resource, you understand them all. This consistency reduces cognitive load for API consumers and makes services more composable.

:::note LO1 & LO3 checkpoint
You can now explain the client-server architecture and describe how REST APIs provide a standard way for services to communicate. But we've glossed over something important: what happens when that network communication *fails*?
:::

## The Fallacies of Distributed Computing

When components communicate over a network, everything gets harder. Peter Deutsch and others at Sun Microsystems identified eight assumptions that developers make about networks—assumptions that are false and lead to bugs, outages, and frustrated users.

### The Eight Fallacies

**1. The network is reliable**

Networks fail. Cables get unplugged, routers crash, cloud providers have outages. Code that assumes `httpClient.send()` will always succeed is fragile code.

*Pawtograder example*: The Grading Action tries to submit feedback after grading completes. The request times out. What happens? If we assumed reliability, the student never sees their grade. Pawtograder implements retry logic with exponential backoff—if the first attempt fails, wait 1 second and try again; if that fails, wait 2 seconds; then 4 seconds. Eventually, either the request succeeds or we give up and log an error.

**2. Latency is zero**

Every network call takes time. Local method calls take nanoseconds; network calls take milliseconds to seconds. Code that makes many sequential network calls will be slow.

*Pawtograder example*: The Grading Action must register the submission, download the grader tarball, run tests, and submit feedback. If we reported each test result as a separate API call (100 tests × 100ms = 10 seconds of network overhead), grading would be painfully slow. Instead, the action batches all results into a single `submitFeedback()` call.

**3. Bandwidth is infinite**

Networks have limited capacity. Sending large payloads over constrained connections is problematic.

*Pawtograder example*: The Grading Action downloads the grader tarball (archive of the instructor's solution repo) from Pawtograder's API. For a large assignment with many test files, this could be megabytes. Pawtograder includes a SHA hash to verify integrity and enable caching—if the grader hasn't changed, skip the download entirely.

**4. The network is secure**

Data crossing networks can be intercepted, modified, or spoofed. Every network boundary is a potential attack surface.

*Pawtograder example*: The Grading Action authenticates using a GitHub OIDC token—a cryptographically signed assertion from GitHub that proves the action is running in a specific repository. Without this, anyone could POST fake grades to the API. We'll explore security in depth later in this lecture.

**5. Topology doesn't change**

Network paths change. IP addresses change. Servers move. DNS entries update. Code that caches network locations can break when things move.

*Pawtograder example*: The Pawtograder API URL is configured for each assignment, allowing migration to different API hosts as needed.

**6. There is one administrator**

In distributed systems, different parts are controlled by different organizations. You can't control what the intermediate service operators do with their servers, what your user's ISP does with traffic, or what corporate firewalls block.

*Northeastern University Example:* Northeastern University contracts with the firm [Palo Alto Networks](https://www.paloaltonetworks.com/) to filter all campus network traffic (both inbound and outbound) for malware and other security threats. When Palo Alto Networks arbitrarily decides that Pawtograder's development environment is malware, student learning is disrupted and the university claims no responsibility for the outage, for repairing it, or for preventing similar situations from recurring. This happens all of the time.

**7. Transport cost is zero**

Network calls have costs: computational (serialization, encryption), monetary (API pricing, bandwidth fees), and energy (radio transmission, data center processing). These costs are often invisible during development but accumulate rapidly in production.

*Pawtograder example*: Pawtograder uses self-hosted GitHub Actions runners, so we don't currently pay per-minute costs. But GitHub has announced they'll start metering self-hosted runner usage soon. When that happens, every grading run will have a dollar cost—and a design that spins up heavyweight VMs or makes excessive API calls will be unsustainably expensive. 

**Energy implications**: Every network request requires:
- CPU cycles to serialize data to JSON, then deserialize it
- Network interface power to transmit packets
- Router and switch power along the network path
- Server CPU cycles to process the request
- Data center cooling to dissipate the heat from all of the above

For Pawtograder, batching test results into a single `submitFeedback()` call instead of 100 individual calls doesn't just save latency—it saves energy. Multiply by 6,000 grading runs per semester, and architectural decisions about API granularity have measurable environmental impact. This is why **sustainability** is becoming an architectural quality attribute alongside performance and scalability.

**8. The network is homogeneous**

Networks involve many different technologies, protocols, and vendors. Your carefully-tested code might behave differently on a user's unusual network configuration.

*Pawtograder example*: Our self-hosted runners are distributed across multiple data centers. A grading job at one data center sees one Docker image cache; a job at another data center sees a different cache. The same assignment might grade in 30 seconds on a warm cache or 3 minutes on a cold one—and which you get depends on network routing decisions we don't control.

### Designing for an Unreliable World

These fallacies aren't reasons to avoid distributed systems—they're reasons to design carefully. Key strategies:

**Timeouts and retries**: Never wait forever. Set reasonable timeouts and implement retry logic with exponential backoff.

```java
// Bad: waits forever
Response response = client.send(request);

// Better: timeout and retry
Response response = null;
int attempts = 0;
while (response == null && attempts < 3) {
    try {
        response = client.send(request, Duration.ofSeconds(10));
    } catch (TimeoutException e) {
        Thread.sleep((long) Math.pow(2, attempts) * 1000);  // Exponential backoff: 1s, 2s, 4s
        attempts++;
    }
}
if (response == null) {
    logError("Failed to submit feedback after 3 attempts");
    // Degrade gracefully: student sees "grading in progress" rather than crash
}
```

**Graceful degradation**: When a service is unavailable, offer reduced functionality rather than complete failure.

**Idempotent operations**: Design requests so that retrying them is safe. If the Grading Action POSTs feedback and the network fails mid-request, can it safely POST again without creating duplicate grades? Pawtograder uses submission IDs to ensure idempotency—submitting feedback for the same submission ID twice just overwrites the previous result.

:::note LO2 checkpoint
You can now identify the eight fallacies of distributed computing and explain how they affect system design. These aren't theoretical concerns—every distributed system must handle network unreliability, latency, and the other fallacies explicitly.
:::

## Microservices Architecture

In L19, we introduced the microservices concept when discussing the two big families of architecture (monolith vs. distributed). Now that we understand the challenges of distributed systems, we can appreciate both the benefits and the costs of this style more fully.

A **microservices architecture** decomposes a system into small, independently deployable services, each responsible for a specific business capability. Services communicate over the network (typically HTTP/REST or message queues) and each manages its own data.

Recall from L19 the key characteristics:
- **Independent deployment**: Each service has its own build pipeline and deploy cycle
- **Network communication**: Services call each other via APIs, not method calls
- **Decentralized data**: Each service owns its data; no shared database
- **Polyglot friendly**: Different services can use different languages, frameworks, or databases

Now let's examine *why* teams choose this complexity—and what they pay for it.

### Why Microservices?

**Independent scaling**: In a monolith, if grading is the bottleneck, you must scale the entire application. With microservices, you can scale just the grading service.

**Isolated failures**: A bug in the Discord bot shouldn't crash the grading system. With separate services, failures are contained (if designed well).

**Team autonomy**: Small teams can own services end-to-end. The team maintaining the Grading Action doesn't need to coordinate with the team maintaining the API—they just agree on the interface.

**Technology flexibility**: Different services can use different technologies. Pawtograder's components are all TypeScript, but they run on different platforms: the Grading Action runs on GitHub Actions runners and the API and Discord bot run on Supabase Edge Functions (Deno serverless runtime). Each deployment target has different constraints and capabilities.

### The Cost of Microservices

**Distributed systems complexity**: Every one of the eight fallacies applies. Network failures, latency, eventual consistency, distributed debugging—all become your daily reality.

**Operational overhead**: Many services means many builds, many deploys, many logs to monitor. Pawtograder has separate CI/CD pipelines for each component.

**Data consistency challenges**: No transactions across services. If the Grading Action submits feedback but the grade notification fails, the data is temporarily inconsistent. 

**Testing complexity**: Integration testing requires running multiple services. Pawtograder's end-to-end tests spin up a complete copy of the system in a test environment.

**Energy overhead**: In a monolith, calling a method costs nanoseconds and negligible energy. In microservices, that same call becomes an HTTP request requiring serialization, network transmission, and deserialization—orders of magnitude more energy per interaction. A "chatty" microservices architecture where services make many small calls to each other can consume significantly more energy than an equivalent monolith. This is another reason why the "monolith-first" approach makes sense: don't pay the energy cost of distribution until you need the benefits.

### Where Do Our Running Examples Fall?

| Aspect | Bottlenose | Pawtograder |
|--------|------------|-------------|
| **Architecture** | Monolith + one microservice (Orca) | True microservices |
| **Why distributed?** | Isolation for untrusted code | Team autonomy, platform leverage |
| **Communication** | HTTP + message queue | HTTP APIs |
| **Data** | Shared PostgreSQL | Each service owns its data |

:::tip The Distributed Monolith Anti-pattern
The worst outcome is a "distributed monolith"—services that are deployed separately but so tightly coupled that they must be changed and deployed together. You get all the operational complexity of microservices with none of the benefits.

Signs you have a distributed monolith:
- Changing one service requires changing multiple others
- Services share a database schema
- You can't deploy services independently
- Teams must coordinate every change

If you find yourself here, consider either properly decoupling the services (with clear boundaries and contracts) or collapsing them back into a monolith.
:::

:::note LO4 checkpoint
You can now analyze the benefits and costs of microservices compared to monolithic architectures. The key insight is that microservices trade operational simplicity for scaling flexibility, team autonomy, and fault isolation—but every benefit comes with the tax of distributed systems complexity.
:::

## Network-Related Requirements and Patterns

When designing distributed systems, several quality attributes become critical. This course does *not* go into significant depth of how to *achieve* these qualities, but we'll provide a taste of common requirements and patterns. For more details, see:
- CS4530: Fundamentals of Software Engineering
- CS4700: Network Fundamentals
- CS4730: Distributed Systems

### Performance: Latency, Throughput, and Resource Utilization

- **Latency**: Time for a single operation to complete. Users notice latency above ~100ms.
- **Throughput**: Operations per unit time. Can the system handle peak load (near-deadline submission spikes)?
- **Resource utilization**: How efficiently are compute, memory, and bandwidth used?

Strategies:

- **Caching**: Store frequently-accessed data closer to where it's needed. Pawtograder caches the grader tarball by SHA—if it hasn't changed, skip the download.
- **Request batching**: Combine multiple small requests into one larger request. The Grading Action sends all test results in a single `submitFeedback()` call, not one call per test.
- **Asynchronous processing**: Don't block while waiting for network responses. Bottlenose enqueues grading jobs and returns immediately; students see "grading in progress" while results trickle in.
- **Load balancing**: Distribute requests across multiple servers. GitHub Actions inherently load-balances by spinning up separate runners for each submission.

### Reliability: Fault Tolerance, Availability, and Recoverability

- **Fault tolerance**: System continues operating when components fail
- **Availability**: Percentage of time the system is operational (e.g., "99.9% uptime")
- **Recoverability**: How quickly the system returns to normal after failure

Strategies:

- **Redundancy**: Run multiple instances of critical components. Supabase (Pawtograder's backend) runs replicated PostgreSQL under the hood.
- **Health checks**: Regularly verify that components are functioning. Orca pings Bottlenose periodically; if it can't connect, grading jobs wait.
- **Circuit breakers**: When a service is failing, stop sending it requests temporarily. If the Pawtograder API returns errors 50% of the time, the Grading Action could "trip the circuit" and fail fast rather than overwhelming a struggling service.
- **Failover mechanisms**: Automatically switch to backup systems when primary systems fail.

### Scalability: Horizontal and Vertical

- **Vertical scaling**: Bigger machines (more CPU, RAM)
- **Horizontal scaling**: More machines (distribute load)

Strategies:

- **Stateless services**: Design services so any instance can handle any request. The Grading Action is completely stateless—each run is independent. This makes horizontal scaling trivial (GitHub just spins up more runners).
- **Database sharding**: Split data across multiple database instances. Assignments A-M on one server, N-Z on another.
- **CDN (Content Delivery Network)**: For static content, use globally-distributed edge servers.

**Energy tradeoff**: Horizontal scaling offers elasticity—spin up instances during deadline rushes, spin them down at 3 AM. This *can* be more energy-efficient than a vertically-scaled server that's oversized for average load but necessary for peaks. However, horizontal scaling also means more network communication (coordination, load balancing, distributed state). The most energy-efficient architecture depends on your traffic patterns: steady load often favors vertical; bursty load often favors horizontal with aggressive scale-to-zero.

## Security as an Architectural Concern

Security isn't a feature you bolt on at the end—it's an architectural concern that shapes design decisions throughout. The moment components communicate over a network, you must think about who can send requests, whether data can be intercepted, and what happens if an attacker compromises one component.

### Authentication and Authorization

**Authentication**: Proving identity. "Who are you?"
**Authorization**: Checking permissions. "What are you allowed to do?"

*Pawtograder example*: The Grading Action authenticates to the API using a GitHub OIDC token. This token is simply a short JSON string that is cryptographically signed by GitHub and includes information like:
- The request is coming from a GitHub Actions workflow (so we can trust the workflow is running in a specific repository)
- The workflow is running in a specific repository (e.g., `cs3100-sp26/hw1-student123`) and on a specific git reference

The API then authorizes the request: is this repository allowed to submit to this assignment? Is the deadline still open? Is this student enrolled?

### Trust Boundaries

A **trust boundary** is a line in your architecture where you stop trusting data. Anything crossing that boundary must be validated.

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (untrusted)                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Grading Action                         │   │
│   │  - Runs student-provided code                           │   │
│   │  - Could be modified by student (fork attack)           │   │
│   │  - Reports grades back to API                           │   │
│   └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ TRUST BOUNDARY
               ====================│====================
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Pawtograder API (trusted)                    │
│   - Verifies OIDC token signature                               │
│   - Checks repository permissions                               │
│   - Validates submission data                                   │
│   - Never trusts the action to report its own identity          │
└─────────────────────────────────────────────────────────────────┘
```

The Grading Action runs in an environment the student could theoretically tamper with (by forking the action). The API **must not** trust the action to:
- Report its own repository name (extracted from the verified OIDC token instead)
- Report accurate test results (the action could lie about passing tests)
- Report the correct submission time

Wait—how can we trust test results if the action could lie? This is a fundamental tension in distributed autograding. Pawtograder mitigates it through:
- **Workflow validation**: The grader tarball is only returned if the workflow is not tampered with and authorized to run
- **Instructor review**: Suspicious submissions (perfect scores, unusual code patterns such as accessing instructor test files) can be flagged for manual review
- **Log preservation**: The full grading log is stored, so instructors can verify results
- **Detection over prevention**: Some attacks are caught after the fact rather than prevented

### The CIA Triad

Security requirements are often expressed in terms of three properties:

**Confidentiality**: Sensitive information is only accessible to authorized parties.
- Student grades shouldn't leak to other students
- Solution code shouldn't be exposed to students
- API tokens must be kept secret

**Integrity**: Data is accurate and hasn't been tampered with.
- Grades should reflect actual test results
- Student submissions shouldn't be modified in transit
- The grader tarball should match what the instructor uploaded

**Availability**: Systems are accessible when users need them.
- Students should be able to submit assignments before deadlines
- Grading should complete in reasonable time
- Denial of service attacks shouldn't take down the system

### Practical Security for Distributed Systems

1. **Credential management**: Store tokens securely. Rotate credentials periodically.
2. **Input validation**: Never trust data from network requests. Validate and sanitize everything.
3. **HTTPS everywhere**: All network communication should be encrypted. HTTP traffic can be intercepted and modified.
4. **Minimal data transmission**: Don't send more data than necessary. The Grading Action sends only final results, not raw test output.
5. **Principle of least privilege**: Each component should have only the permissions it needs. The Grading Action can submit grades but can't modify course settings.
6. **Error messages**: Don't leak sensitive information. "Invalid token" is safer than "Token for user jdoe expired at 2024-03-15."

:::note LO5 checkpoint
You can now apply security principles to distributed system design: authentication vs. authorization, trust boundaries, and the CIA triad. Security isn't a feature you bolt on at the end—it shapes architecture from the start.
:::

## Bringing It Together: From Monolith to Microservices

Let's recap the journey from L19 to this lecture:

| Concept | Monolith (L19) | Distributed (L20) |
|---------|---------------|-------------------|
| **Communication** | Method calls (nanoseconds) | Network calls (milliseconds+) |
| **Failure modes** | Process crashes → everything fails | Partial failures, network partitions |
| **Consistency** | Database transactions span all operations | Eventual consistency, no cross-service transactions |
| **Debugging** | Single stack trace, single log file | Distributed tracing, multiple log streams |
| **Deployment** | All-or-nothing | Independent service deploys |
| **Scaling** | Scale everything together | Scale services independently |

The monolith-first approach from L19 still holds: don't distribute until you need to. But when you *do* need to—for isolation, scaling, team autonomy, or platform leverage—you now understand what you're getting into.

:::tip Conway's Law Revisited
In L19, we mentioned that organizations design systems that mirror their communication structure. This is even more true for distributed systems: if your teams are siloed, your services will be siloed. If teams must coordinate constantly, your services will be tightly coupled. Architecture and organization are inseparable.

We'll explore this further in [L22 (Teams and Collaboration)](./l22-teams.md).
:::

---

**In the next lecture**, we'll explore **Serverless Architecture**—an architectural style that embraces distributed computing fully, letting cloud providers manage infrastructure while you focus on business logic. Serverless pushes many of the concerns we discussed today (scaling, availability, security) to the platform level—with its own tradeoffs. We'll see how Pawtograder leverages serverless patterns extensively.
