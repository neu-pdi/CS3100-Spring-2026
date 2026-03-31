---
sidebar_position: 21
lecture_number: 21
title: "L21: Serverless Architecture"
---

In [L20](./l20-networks.md), we explored distributed architecture—what changes when components communicate over networks. We saw the Fallacies of Distributed Computing and strategies for building reliable systems despite unreliable networks.

This lecture introduces **serverless architecture**—an architectural style where you write functions that a cloud provider executes on demand, composing managed infrastructure services rather than managing servers yourself. We'll continue using Pawtograder and Bottlenose as our running examples—and we'll see how Pawtograder embraces serverless patterns extensively. But first, we need vocabulary for the infrastructure services that serverless applications compose.

## Recognize common infrastructure building blocks (15 minutes)

Cloud platforms provide standardized infrastructure components that solve recurring problems. Just as we have reusable design patterns in code, these "building blocks" appear across architectural styles—serverless, microservices, or traditional deployments. Understanding them helps you read architectural diagrams, evaluate tradeoffs, and communicate design decisions.

### Databases: Structured Data Persistence

A **database** stores and retrieves structured data reliably. When your application needs to remember something across restarts—user accounts, course enrollments, submission records—that data lives in a database.

For a more complete treatment of databases, you should consider CS3200/CS4200, but here's what matters most architecturally:

| Type | What It's Good For | Examples |
|------|-------------------|----------|
| **Relational** | Complex queries, relationships between entities, transactions | PostgreSQL, MySQL |
| **Document** | Flexible schemas, JSON-like data, rapid development | MongoDB, Firestore |
| **Key-Value** | Simple lookups by ID, extremely fast reads | DynamoDB, Redis |

The "right" database choice depends heavily on **query patterns**—how you expect to access and search the data. Consider Pawtograder's grading platform: we need queries like:
- "Find all submissions by this student across all assignments"
- "Find the latest submission for each student in a course"
- "Calculate average scores grouped by assignment and section"
- "Find students who haven't submitted to an assignment before the deadline"

These queries involve *relationships* between students, courses, assignments, submissions, and grades—exactly where relational databases shine. A document database that stores each submission as a blob would struggle with "join submissions against enrollments and filter by deadline." You'd either denormalize everything (duplicating course data in every submission) or fetch all data and filter in application code (slow and expensive).

The architectural lesson: database choice isn't about "which is best" but "which fits our access patterns." Both Bottlenose and Pawtograder use PostgreSQL for this reason—an autograding platform inherently involves complex relationships and queries that relational databases handle well.

The choice between database types also involves tradeoffs we'll explore more deeply when we cover **concurrency** (L31-32)—questions like "what happens when two students submit at the exact same moment?" For now, just recognize that databases are a fundamental building block for persistent state, and the right choice depends on how you'll query the data.

### Object/Blob Storage: Files and Binary Data

**Object storage** (also called "blob storage", where blob stands for "binary large object") stores and retrieves files at scale: images, PDFs, backups, exports, video. Unlike databases optimized for structured queries, object storage is optimized for storing and retrieving large blobs by name.

| Service | Provider |
|---------|----------|
| S3 | AWS |
| Cloud Storage | Google Cloud |
| Blob Storage | Azure |
| Supabase Storage | Supabase (built on S3) |

*Pawtograder example*: Instructors upload grader tarballs—archives containing test code, build configuration, and solution scaffolds. These can be several megabytes. The tarball goes to Supabase Storage, and when grading runs, the Grading Action downloads it via a signed URL. You wouldn't put a 5MB tarball directly in the database—object storage is built for this.

Object storage is typically:
- **Cheap** for large amounts of data, much more so than a database is for the same amount of data
- **Durable** (replicated across multiple locations)
- **Simple** (put, get, delete by key—no complex queries)

### Message Queues: Asynchronous Communication

A **message queue** lets components communicate without being online at the same time. One component puts a message on the queue; another picks it up later. This decouples producers from consumers and buffers work during traffic spikes.

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Producer   │────►│    Queue    │────►│   Consumer   │
│ (Web Server) │     │  (SQS, etc) │     │  (Worker)    │
└──────────────┘     └─────────────┘     └──────────────┘
                     Messages wait here
                     until processed
```

The key architectural property of message queues is **durability**: once the queue confirms receipt of a message, it guarantees eventual delivery. The producer can move on, confident the work will happen—even if the consumer crashes and restarts, or the network hiccups, or traffic spikes. The queue persists the message until a consumer successfully processes it.

*Bottlenose example*: When a student submits code to Bottlenose, the web server doesn't grade it synchronously—that would block the HTTP request for minutes. Instead, Bottlenose puts a grading job on a message queue. The Orca grading worker picks up jobs from the queue and processes them at its own pace. The student sees "grading in progress" immediately, and results appear when ready. Even if Orca crashes mid-grading, the message returns to the queue and gets retried—no submissions lost.

*Pawtograder example*: Pawtograder uses **pgmq** (PostgreSQL Message Queue)—an extension that adds queue semantics directly to PostgreSQL. When an instructor creates a new assignment, Pawtograder needs to create a GitHub repository for each student—but GitHub's API is rate limited to 60 requests per minute. Rather than blocking the instructor or failing partway through, Pawtograder enqueues a "create repo" task for each student. A background process works through the queue at a sustainable pace, respecting the rate limit. The instructor sees immediate confirmation; student repos appear over the next few minutes, guaranteed to eventually complete.

Examples: AWS SQS, Google Pub/Sub, RabbitMQ, Apache Kafka, pgmq (PostgreSQL extension).

We'll explore event-driven patterns and queues more deeply in **L33 (Event Architecture)**. For now, recognize queues as a tool for decoupling, handling variable load, and ensuring reliable delivery.

### Caches: Fast Access to Hot Data

A **cache** stores copies of frequently-accessed data in memory for speed. Instead of querying the database every time someone requests the same data, you cache the result and serve it directly—until the cache expires or the underlying data changes.

*Pawtograder example*: Recall from L20 that the Grading Action caches grader tarballs by SHA hash. The first grading run downloads the tarball; subsequent runs check if the SHA matches and skip the download entirely. This is a form of content-addressable caching—the cache key *is* the content hash, so if the instructor updates the grader, the new SHA automatically invalidates the old cache.

Pawtograder also uses **Upstash** (hosted Redis) as an external key-value store for rate limiting outbound API calls. GitHub and Discord have rate limits; when Pawtograder sends notifications, it checks Redis to see how many requests it's made recently and backs off if approaching the limit. Redis is ideal here: fast reads/writes, automatic expiration of old entries, and works from stateless Edge Functions (which can't maintain in-memory counters themselves, because they are stateless).

| Service | What It Does |
|---------|--------------|
| Redis / Upstash | In-memory key-value store, often used as a cache or rate limiter |
| Memcached | Distributed memory cache |
| CDN (CloudFront, etc.) | Caches static files at edge locations globally |

Caching involves tradeoffs: you gain speed but might serve stale data. When should the cache refresh? What if the grading criteria change?

:::note Looking Ahead
These consistency questions—what happens when multiple sources of truth diverge?—are fundamental to distributed systems. We'll explore them in greater depth during our concurrency unit: [Lecture 31 (Concurrency I)](/lecture-notes/l31-concurrency1), [Lecture 32 (Asynchronous Programming)](/lecture-notes/l32-concurrency2), and [Lecture 33 (Event-Driven Architecture)](/lecture-notes/l33-event-architecture).
:::

### API Gateways: Unified Entry Point

An **API Gateway** provides a single entry point for your APIs. Instead of exposing multiple backend services directly, clients talk to the gateway, which routes requests, handles authentication, enforces rate limits, and provides a consistent interface.

```
┌─────────┐      ┌─────────────┐      ┌──────────────────┐
│ Clients │─────►│ API Gateway │─────►│ Backend Services │
└─────────┘      │ • Auth      │      │ • Edge Functions │
                 │ • Routing   │      │ • PostgREST      │
                 │ • Rate Limit│      │ • Storage        │
                 └─────────────┘      └──────────────────┘
```

*Pawtograder example*: Pawtograder's web app frontend talks to a single API endpoint that acts as an API gateway. It provides:
- **Authentication**: JWT verification before requests reach backend functions
- **Routing**: `/auth/*` for authentication, `/rest/v1/*` for PostgREST database access, `/functions/v1/*` for Edge Functions
- **Rate limiting**: Prevents abuse by limiting requests per client

Examples: AWS API Gateway, Google Cloud Endpoints, Kong.

### Observability: Logs, Errors, and Monitoring

In a monolith, debugging is (relatively) straightforward: one log file, one stack trace, one process to inspect. In distributed and serverless architectures, a single user action might trigger multiple functions, database queries, and external API calls—each generating its own logs on different machines that may not even exist anymore by the time you investigate.

**Observability** is the practice of instrumenting your system so you can understand what's happening inside it. The three pillars are:

- **Logs**: Textual records of events ("User X submitted to assignment Y at time Z")
- **Metrics**: Numerical measurements over time (request latency, error rate, queue depth)
- **Traces**: The path a request takes through your system (function A → database → function B → external API)

For serverless architectures, observability is both more important and more challenging. Functions are ephemeral—they spin up, execute, and disappear. If something goes wrong, you can't SSH into the server and look around. You need centralized tooling that captures information *before* the function vanishes.

**Log aggregation services** collect logs from all your functions and services into a single searchable location:

| Service | What It Does |
|---------|--------------|
| **Sentry** | Error tracking with stack traces, breadcrumbs, and alerting |
| **Bugsink** | Self-hosted error tracking (Sentry alternative) |
| **Datadog** | Full observability platform (logs, metrics, traces) |
| **CloudWatch** | AWS's built-in logging for Lambda and other services |

*Pawtograder example*: When a grading run fails, we need to understand why. The Grading Action writes structured logs that Pawtograder captures and stores. If a student reports "my submission shows 0 points but my code is correct," an instructor can pull up the grading log and see exactly what happened: did the build fail? Did tests timeout? Did the API call to submit results fail?

```
┌─────────────────────────────────────────────────────────────────┐
│                    Distributed System                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │Function │  │Function │  │Database │  │External │             │
│  │   A     │  │   B     │  │         │  │  API    │             │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘             │
│       │            │            │            │                  │
│       └────────────┴─────┬──────┴────────────┘                  │
│                          │ logs, errors, traces                 │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │   Log Aggregation     │                          │
│              │   (Sentry, Datadog)   │                          │
│              │   • Searchable logs   │                          │
│              │   • Error alerting    │                          │
│              │   • Request tracing   │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

**Why this matters architecturally**: When you split a monolith into microservices or serverless functions, you're trading debuggability for other qualities. You *must* invest in observability tooling to compensate, or you'll spend hours hunting for bugs that would have been obvious in a monolith's single log file. This is one of the hidden costs of distributed architectures that teams often underestimate.

### Building Blocks Summary

These building blocks—databases, object storage, queues, caches, API gateways, and observability tools—appear in nearly every cloud architecture. Serverless architecture is fundamentally about **composing these managed services**: you write functions containing business logic; the cloud provider operates the infrastructure.

With this vocabulary established, let's see how serverless architecture works.

## Define "serverless" architecture and its core concepts (5 minutes)

"Serverless" is a bit of a misnomer—there are still servers, you just don't manage them. The key insight is organizational: serverless is **technical partitioning with a vendor**.

In [L19](./l19-monoliths.md), we discussed technical vs. domain partitioning—whether you organize code (and teams) by technical role (controllers, services, repositories) or by business capability (import, library, export). Serverless takes technical partitioning to the organizational level: a cloud vendor operates the infrastructure layer *as a service*, allowing your team to focus entirely on domain logic.

This is Conway's Law in action. The vendor's organization is structured to specialize in infrastructure—they have teams for container orchestration, auto-scaling, monitoring, security patching. Your organization specializes in your domain—courses, assignments, grading workflows. The system boundary (your functions ↔ their infrastructure) mirrors the organizational boundary. The vendor serves thousands of clients, achieving economies of scale that no single team could justify for their own infrastructure.

Of course, this division comes with costs. You gain operational simplicity and scalability, but you lose control: the vendor's abstractions constrain how you build (likely resulting in a much more complex system than you would have built yourself), their pricing model determines your costs at scale, and switching vendors means rewriting infrastructure code. We'll see these tradeoffs concretely when we compare serverless to DIY approaches. This course will not go into the details of how to build your own infrastructure, but interested students should consider CS3650 (Computer Systems), CS3700 (Networks and Distributed Systems), and CS4730 (Distributed Systems).

### Functions as a Service (FaaS)

Instead of deploying an application that runs continuously, you deploy **functions** that execute in response to events:

```java
// A serverless function for creating a submission (AWS Lambda style)
// Pawtograder uses TypeScript/Deno, but the pattern is the same in Java
public class CreateSubmissionHandler 
        implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    
    private final SubmissionRepository submissions;
    private final StorageService storage;
    
    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request, Context context) {
        // This function runs only when triggered by an HTTP request
        SubmissionRequest body = parseJson(request.getBody());
        
        // Verify the OIDC token from GitHub Actions
        String token = request.getHeaders().get("Authorization");
        OIDCClaims claims = verifyGitHubOIDC(token);
        
        // Create submission record in database
        Submission submission = submissions.create(
            body.assignmentId(), 
            claims.repository()
        );
        
        // Return grader tarball URL
        String graderUrl = storage.getSignedUrl(body.assignmentId());
        return new APIGatewayProxyResponseEvent()
            .withStatusCode(200)
            .withBody(toJson(new SubmissionResponse(submission.id(), graderUrl)));
    }
}
```

The cloud provider:
- Receives the request
- Spins up a container with your function (or reuses a warm one)
- Executes the function
- Returns the response
- Tears down the container (eventually)

You pay only for execution time, not idle time.

### Event-Driven Execution

Serverless functions are triggered by **events**:
- HTTP requests (API Gateway)
- File uploads (S3, Cloud Storage)
- Database changes (DynamoDB Streams)
- Scheduled triggers (cron-like)
- Message queue items (SQS, Pub/Sub)

```
┌──────────────────────────────────────────────────────────────────┐
│                        Event Sources                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │  HTTP   │  │  File   │  │ Database│  │ Schedule│              │
│  │ Request │  │ Upload  │  │ Change  │  │  Timer  │              │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘              │
│       │            │            │            │                   │
│       └────────────┴─────┬──────┴────────────┘                   │
│                          │                                       │
│                          ▼                                       │
│                 ┌─────────────────┐                              │
│                 │   Your Function │  ◄── Scales automatically    │
│                 └────────┬────────┘                              │
│                          │                                       │
│                          ▼                                       │
│            ┌─────────────────────────────┐                       │
│            │    Other Services           │                       │
│            │  (Database, Storage, APIs)  │                       │
│            └─────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

## Compare serverless to traditional architectures (10 minutes)

Let's compare three approaches to deploying an autograding platform's submission handling:

### Traditional Server (Monolith): Bottlenose

```
┌─────────────────────────────────────────┐
│          Bottlenose Server (24/7)       │
│  ┌─────────────────────────────────┐    │
│  │         Rails Application       │    │
│  │  ┌───────────┐ ┌─────────────┐  │    │
│  │  │Submission │ │   Course    │  │    │
│  │  │ Handler   │ │  Management │  │    │
│  │  └───────────┘ └─────────────┘  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │           PostgreSQL            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
         Running even when idle
```

- You manage the server
- You pay for idle time
- You handle scaling manually
- All services share the same deployment

### Container-Based (Microservices): Bottlenose + Orca

```
┌──────────────────┐    ┌──────────────────┐
│    Bottlenose    │    │   Orca Grader    │
│    (Web App)     │    │   (Container)    │
└──────────────────┘    └──────────────────┘
        ▲                       ▲
        │    Message Queue      │
        └───────────────────────┘
```

- Orca runs in isolated containers for security (untrusted student code)
- Independent scaling: more graders during deadline rushes
- Containers run continuously waiting for jobs
- You manage container orchestration

### Serverless (FaaS): Pawtograder

```
     GitHub Actions triggers
              │
              ▼
    ┌─────────────────┐
    │ Supabase Gateway│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐     ┌─────────────────┐
    │  Edge Function  │────►│ Supabase Storage│
    │ createSubmission│     │(grader tarballs)│
    │  (runs on       │     └─────────────────┘
    │   demand)       │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │   PostgreSQL    │
    │ (via PostgREST) │
    └─────────────────┘
```

- Edge Functions run only when triggered
- Provider handles scaling automatically
- Pay per invocation
- No servers to manage

### Comparison Table

| Aspect | Bottlenose (Monolith) | Bottlenose + Orca (Containers) | Pawtograder (Serverless) |
|--------|----------|------------|------------|
| **Scaling** | Manual | Configured | Automatic |
| **Idle cost** | Full | Reduced (with scale-to-zero) | Zero |
| **Cold start** | None | Minimal | Noticeable (100ms-5s) |
| **Complexity** | Low | High | Medium |
| **Vendor lock-in** | Low | Low-Medium | High |
| **State management** | Easy | Medium | Difficult |
| **Long-running tasks** | Fine | Fine | Limited (timeouts) |

Let's unpack each row:

**Scaling**: With Bottlenose's monolith, *you* decide when to add capacity—monitoring traffic, provisioning new servers, configuring load balancers. Orca's containers let you declare scaling rules ("maintain 3 graders," "scale up when queue length > 10"), but you configure and tune those rules. Pawtograder's serverless functions scale invisibly: if 100 students submit simultaneously at a deadline, 100 Edge Function instances spin up. You don't think about it—until you get the bill.

**Idle cost**: Bottlenose's server runs 24/7, whether serving requests or not. Orca containers can "scale to zero" with advanced configuration, but this is tricky to set up and has its own cold-start implications. Serverless truly charges nothing when idle—if no one is submitting at 3 AM, Pawtograder pays $0 during those hours.

**Cold start**: When Bottlenose is running, every request hits warm code—no startup penalty. Orca has minimal cold starts if graders are already running, but spinning up new containers takes seconds. Serverless cold starts are the most noticeable: when a function hasn't run recently, the provider must allocate a container, load the runtime (JVM, Node.js, Deno, etc.), initialize dependencies, then execute. This adds 100ms–5s latency on the first request. For the Grading Action calling APIs in the background, this rarely matters; for interactive features like viewing grades, it can feel sluggish.

**Complexity**: A monolith is one thing to deploy, monitor, and debug—simple. Container orchestration (Kubernetes) is notoriously complex: networking, service discovery, health checks, rolling deployments, secrets management (you would need to take another course to learn about this). Serverless is medium complexity: simpler operationally (no servers to manage), but debugging across many small functions and understanding cold starts introduces its own challenges.

**Vendor lock-in**: Bottlenose running on a VM can move between cloud providers or on-premises with modest effort. Orca containers are fairly portable (Docker runs anywhere), though managed Kubernetes services have their quirks. Pawtograder's Supabase dependency is more significant—the tight integration with PostgREST, Row-Level Security policies, and Edge Functions means migrating to another provider would require substantial rewrites. However, much of Pawtograder's domain logic lives in standard PostgreSQL (triggers, functions, RLS policies), which *is* portable. The Hexagonal Architecture we learned helps regardless: if domain logic is behind ports, you can swap adapters for different providers, but you'll still rewrite infrastructure code when the underlying services differ.

**State management**: Bottlenose can hold state in memory—session data, caches, connection pools—because the process runs continuously. Orca containers can too, though scaling and restarts complicate things. Serverless functions are stateless by design: each Edge Function invocation may run on a different container, so you *must* externalize state. Pawtograder pushes this further: most state and domain logic lives in PostgreSQL itself via triggers and RLS policies—the functions are thin wrappers that delegate to the database. This forces cleaner architecture but adds latency and complexity.

**Long-running tasks**: Bottlenose can run a task for hours if needed. Orca containers can too—and grading jobs often take minutes. Serverless functions typically timeout after 15 minutes (AWS Lambda) or less. This is why Pawtograder uses GitHub Actions for actual grading rather than Edge Functions—grading can take several minutes, exceeding typical function timeouts. Edge Functions handle the quick API calls (registration, feedback submission); the heavy lifting happens elsewhere.

### Energy Efficiency Considerations

Serverless architecture has interesting energy implications that cut both ways:

**Potential energy savings:**
- **No idle power**: A monolith server consumes power 24/7, even at 3 AM when no one is submitting. Serverless functions consume energy only when executing—true scale-to-zero.
- **Shared infrastructure**: Cloud providers achieve high utilization across thousands of customers. A server running at 80% utilization is more energy-efficient than one running at 10%.
- **Right-sized execution**: Functions get exactly the resources they need for their execution time. No over-provisioned VMs sitting mostly idle.

**Potential energy costs:**
- **Cold start overhead**: Spinning up a new container for each cold invocation has energy costs that a warm monolith avoids.
- **Per-request overhead**: Each function invocation goes through the provider's routing, logging, and billing infrastructure—energy costs that don't exist for in-process method calls.
- **Distributed chattiness**: If your serverless architecture has many small functions calling each other, you're paying network energy costs that a monolith wouldn't incur.

## Requirements suited (and unsuited) for serverless (10 minutes)

### Good Fit for Serverless

**Event-driven, stateless operations:**
```java
// Good: Register submission, return grader URL
public class CreateSubmissionHandler implements RequestHandler<Request, Response> {
    public Response handleRequest(Request req, Context ctx) {
        OIDCClaims token = verifyOIDC(req.getHeader("Authorization"));
        Submission sub = submissions.create(req.assignmentId(), token.repository());
        return new Response(storage.getSignedUrl(req.assignmentId()));
    }
}
```

**Variable or unpredictable workloads:**
- Submission traffic spikes near deadlines (100x normal load)
- Pay for actual usage, not provisioned capacity for peak

**Glue code and integrations:**
- Transform data between services
- Respond to webhooks (e.g., GitHub webhook when student pushes)
- Scheduled tasks (nightly grade exports)

**APIs with moderate traffic:**
- REST/GraphQL endpoints that don't need sub-10ms latency
- Traffic patterns with idle periods (no submissions at 3 AM)

### Poor Fit for Serverless

**Long-running computations:**
```java
// Bad: This might timeout (typically 15 min max)
public void gradeAllSubmissions(String assignmentId) {
    List<Submission> submissions = getSubmissions(assignmentId);  // 200 students
    for (Submission sub : submissions) {
        runTests(sub);  // Each takes 2-3 minutes...
    }
}
```

**Stateful operations:**
- Serverless functions are stateless by design
- State must be stored externally (database, cache)
- In-memory caching doesn't work well

**Low-latency requirements:**
- Cold starts add 100ms-5s latency
- For real-time applications, this may be unacceptable

**High-throughput, sustained load:**
- Per-invocation pricing can exceed server costs at high volume
- Better to run your own servers for predictable, sustained load

### Domain Logic in the Database

One distinctive aspect of Pawtograder's architecture: much of the domain logic lives in PostgreSQL itself, not in application code. PostgreSQL handles not just data storage but also message queuing (pgmq), business rule enforcement (triggers), and access control (RLS). This is an interesting serverless pattern worth understanding:

```sql
-- Example: PostgreSQL trigger enforces submission deadlines
CREATE FUNCTION check_deadline() RETURNS TRIGGER AS $$
DECLARE
  effective_deadline TIMESTAMP;
BEGIN
  -- Calculate deadline: base deadline + any per-student extension
  -- auth.uid() returns the current authenticated user
  -- COALESCE defaults to 0 extra hours if no exception exists for this student
  SELECT a.deadline + COALESCE(e.additional_hours, 0) * INTERVAL '1 hour'
  INTO effective_deadline
  FROM assignments a
  LEFT JOIN assignment_due_date_exceptions e 
    ON e.assignment_id = a.id AND e.user_id = auth.uid()
  WHERE a.id = NEW.assignment_id;
  
  IF NOW() > effective_deadline THEN
    RAISE EXCEPTION 'Submission past deadline';
  END IF;
  RETURN NEW;  -- Allow the INSERT to proceed
END;
$$ LANGUAGE plpgsql;
```

**Why put logic in the database?**
- **Atomic enforcement**: The check and the insert happen as one indivisible operation—no possibility of checking the deadline, then another request sneaking in, then inserting
- **Always runs**: Whether request comes from Edge Function, PostgREST, or direct SQL
- **No cold starts**: Database is always warm; triggers execute immediately
- **Single source of truth**: Business rules live where the data lives

**Tradeoffs:**
- Harder to test (need database fixtures)
- Less familiar to developers (SQL vs TypeScript)
- Vendor lock-in to PostgreSQL (though it's portable *within* PostgreSQL providers)

This "database as application server" pattern is controversial but effective for Pawtograder's use case—the invariants (deadline enforcement, grade visibility, enrollment checks) are fundamentally about data consistency, exactly what databases are designed to ensure.

## Connection to Earlier Concepts (5 minutes)

:::note Information Hiding In Action
The principles from [Lecture 6 (Information Hiding)](/lecture-notes/l6-immutability-abstraction) scale all the way up to cloud architecture. Pawtograder's Edge Functions hide their implementation behind an event interface—the Grading Action doesn't know (or care) whether `createSubmission` runs on Supabase Edge Functions, AWS Lambda, or a container. The ports-and-adapters pattern means the action's domain logic doesn't know it's calling serverless at all. Information hiding isn't just about `private` fields; it's a fractal principle that applies at every level of system design.
:::

Serverless isn't a departure from what we've learned—it's an application of the same principles at a different scale:

| Course Concept | Pawtograder's Serverless Application |
|----------------|----------------------|
| **Hexagonal Architecture** (L16, L21) | Domain logic in DB triggers; Edge Functions are thin adapters |
| **Dependency Injection** (L18) | Functions receive database client, storage client via environment |
| **Information Hiding** (L6) | Grading Action doesn't know API is serverless vs. traditional server |
| **Fallacies of Distributed Computing** (L20) | Edge Functions handle retries, timeouts explicitly |
| **Quality Attributes** (L20) | Serverless optimizes for scalability and cost; trades off latency |

The architectural thinking is the same. Serverless is one point in the design space—sometimes the right choice, sometimes not. Pawtograder's hybrid approach demonstrates this: serverless for the API layer, GitHub Actions for compute-heavy grading, PostgreSQL for domain invariants.

## Choosing an Architecture: A Decision Framework (10 minutes)

We've now covered a range of architectural styles across L19-L21. How do you actually decide which to use? Here's a practical framework for thinking through architectural choices.

### Start with These Questions

**1. What's your team size and structure?**
- **Small team (1-5)**: Monolith or modular monolith. You don't have the people to operate multiple services.
- **Medium team (5-15)**: Modular monolith or limited microservices. Clear module boundaries let sub-teams work independently.
- **Large team (15+)**: Microservices become more viable. Team autonomy and independent deployment cycles justify the operational overhead.

**2. What are your scaling requirements?**
- **Predictable, steady load**: Traditional servers or containers are cost-effective. You're not paying for elasticity you don't need.
- **Bursty, unpredictable load**: Serverless or auto-scaling containers. Near-deadline submission spikes are a classic bursty pattern.
- **Sustained high throughput**: Dedicated infrastructure. Per-invocation serverless pricing becomes expensive at scale.

**3. What are your latency requirements?**
- **Sub-100ms interactive**: Avoid serverless cold starts. Use warm containers or a monolith.
- **Background processing, APIs**: Serverless is fine. Cold starts matter less when users aren't waiting.

**4. Do you need isolation for untrusted code?**
- **Yes**: Separate service boundary (Orca) or managed execution (GitHub Actions). Don't run student code in your main process.
- **No**: Monolith or modular monolith is simpler.

**5. What's your operational capacity?**
- **Minimal ops expertise**: Serverless or managed containers. Let the vendor handle infrastructure.
- **Strong ops team**: You can run your own Kubernetes, databases, message queues—and potentially save money (but... more in another course).

### Decision Flowchart

```
START: New project or major architectural decision
                    │
                    ▼
        ┌───────────────────────┐
        │ Is this a greenfield  │
        │   project or early    │──── Yes ────► Start with a MONOLITH
        │       stage?          │              (you can always extract later)
        └───────────┬───────────┘
                    │ No (existing system or clear requirements)
                    ▼
        ┌───────────────────────┐
        │  Do you have specific │
        │ scaling/team/deploy   │──── No ─────► Stay with / build MONOLITH
        │  problems to solve?   │              or MODULAR MONOLITH
        └───────────┬───────────┘
                    │ Yes
                    ▼
        ┌───────────────────────┐
        │  Is the problem:      │
        │ • Independent scaling │──── Yes ────► Extract to MICROSERVICE
        │ • Team autonomy       │              or SERVERLESS FUNCTION
        │ • Deployment isolation│
        └───────────┬───────────┘
                    │ No / Unclear
                    ▼
        ┌───────────────────────┐
        │  Is it bursty traffic │
        │  with idle periods?   │──── Yes ────► Consider SERVERLESS
        └───────────┬───────────┘
                    │ No
                    ▼
            Consider CONTAINERS
           with auto-scaling rules
```

### The Pawtograder Case Study

Why does Pawtograder use a hybrid architecture?

| Component | Architecture | Why? |
|-----------|--------------|------|
| **Pawtograder API** | Serverless (Edge Functions) | Bursty traffic, stateless operations, minimal ops team |
| **Grading execution** | GitHub Actions (managed compute) | Long-running jobs, isolation for untrusted code, leverages existing infrastructure |
| **Domain logic** | PostgreSQL (triggers, RLS) | Data consistency is paramount, no cold starts, single source of truth |
| **Rate limiting** | Redis (Upstash) | Fast external state for stateless functions |

No single architecture was right for everything. The decision framework helped identify that different components had different requirements—and the Hexagonal Architecture from L16/L19 made it possible to use different infrastructure for different concerns.

### Common Mistakes to Avoid

**Premature microservices**: Don't split into services until you have a clear reason. The distributed systems complexity is real.

**Ignoring operational costs**: Microservices and serverless require observability tooling, distributed debugging skills, and CI/CD for each component. Budget for this.

**Chasing trends**: "Netflix uses microservices" doesn't mean you should. Netflix has thousands of engineers and billions of users. You probably don't.

**One-way doors**: Some choices are hard to reverse (vendor lock-in, data model decisions). Be more careful with those than with easily-reversible choices.

---

We've now covered architectural styles from monoliths through microservices to serverless. But we've been implicitly assuming a single developer making all decisions. Real software is built by **teams**—and as Conway's Law suggests, system architecture and team structure are deeply intertwined. In the next lecture, we'll explore how teams organize, communicate, and coordinate to build software together. The architectural boundaries we've drawn often become team boundaries, and vice versa.
