---
sidebar_position: 12
image: /img/labs/web/lab12.png
---

# Lab 12: Building a GUI with JavaFX and Scene Builder

![Pixel art showing two students sitting side by side at one computer in a warm, cozy lab. The driver has their hands on the keyboard, and on the monitor screen a smart home dashboard GUI is taking shape — a brightness slider, a device list, and an Activate button are visible. The navigator leans forward, pointing at the screen with one hand, a speech bubble says 'That slider needs accessibleText'. On the desk between them, a hand-drawn paper prototype from Lab 11 is propped up against a coffee cup, showing the same layout in pencil sketches — the design they are building from. The mood is focused collaboration — two people solving one problem together. Title: 'Lab 12: Building a GUI with JavaFX and Scene Builder'. 8-bit lo-fi pixel art style, clean outlines, retro game aesthetic, warm afternoon lighting, 16:9 aspect ratio.](/img/labs/web/lab12.png)

## Learning Objectives

- Use Scene Builder to visually create an FXML layout
- Wire FXML to a Controller using `fx:id` and `@FXML` annotations
- Implement the MVC pattern with pre-built SceneItAll Model classes
- Use property binding to synchronize the View with the Model
- Write a ViewModel unit test without starting the JavaFX runtime
- Write an E2E test using TestFX with accessibility-based locators
- Practice pair programming: driving, navigating, and switching roles

## Overview

In Lab 10 you evaluated someone else's finished UI. In Lab 11 you designed a UI on paper and watched
someone try to use it. Today you close the loop: **pair up with a partner and build a working GUI
together.**

You'll use the same SceneItAll domain from Lab 11 — and you can reuse either partner's paper
prototype design or start fresh. The starter code provides the Model classes (`Light`, `Fan`,
`Shade`, `Area`, `Scene`), a ViewModel skeleton, and test scaffolding. You fill in the View,
Controller, and tests — together.

:::info Pair Programming This lab uses **pair programming** — two people, one computer. One person
is the **driver** (hands on keyboard, writes code). The other is the **navigator** (reads along,
thinks ahead, catches mistakes, suggests ideas). **Swap roles every ~10 minutes.** Both of you are
always engaged — the navigator is not on their phone.

Why? Because GA1 is a team project, and the hardest part of team software development isn't the code
— it's communicating about the code. Pair programming forces you to articulate your thinking out
loud, which is exactly the skill you need for code walks and PR reviews. :::

:::info Connection to GA1 Everything you practice today — Scene Builder, FXML wiring, the `@FXML`
lifecycle, property binding, ViewModel testing, E2E testing, and collaborating on code — is exactly
what you'll do for your GA1 Core Features implementation. This lab is your dress rehearsal. :::

---

## Part 1: Setup & Pair Formation (15 min)

:::note For TAs Walk through Scene Builder at the front of the room before students start. Show:
opening an FXML file (File → Open), dragging a VBox, dropping a Button inside it, setting `fx:id`
in the Code panel, setting `accessibleText` in the Properties panel, and saving. This should take
~5 minutes, then have students pair up and set up. Make sure students have Scene Builder installed
before starting — the install instructions are in the Setup section below. Remind students they can
also use Claude Code or Copilot to tweak FXML files directly.

**Pairing rules:** Pairs should NOT be GA1 teammates — fresh collaborators help build broader team
skills. If odd numbers, make one group of three with a rotating navigator. :::

### Form pairs

Find a partner — **not someone from your GA1 team.** Sit at one computer together. Decide who drives
first (you'll swap in Part 2).

### Get the starter project

**One person** clones the Lab 12 repository from Pawtograder. This is the shared codebase you'll
both work on.

The project contains:

| File                                                                 | What it is                                                                                    | What you do with it                                             |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/main/java/sceneitall/model/`                                    | Model classes: `Light`, `Fan`, `Shade`, `Area`, `Scene`                                       | **Don't modify.** These are your domain logic.                  |
| **Reference implementation (read, don't modify):**                   |                                                                                               |                                                                 |
| `src/main/java/sceneitall/viewmodel/AreaDashboardViewModel.java`     | Complete ViewModel from L29/L30 — working example with properties, binding, `activateScene()` | **Read as reference.** This is the worked example from lecture. |
| `src/main/java/sceneitall/controller/AreaDashboardController.java`   | Complete Controller from L29 — FXML wiring, initialize, handlers                              | **Read as reference.**                                          |
| `src/main/resources/area-dashboard.fxml`                             | Complete FXML from L29 — the Area Dashboard layout                                            | **Read as reference.** You can run it to see a working app.     |
| `src/test/java/sceneitall/viewmodel/AreaDashboardViewModelTest.java` | Complete ViewModel tests — several examples showing the testing patterns                      | **Read as reference.**                                          |
| `src/test/java/sceneitall/AreaDashboardE2ETest.java`                 | Complete E2E test — TestFX with `findByAccessibleText()`                                      | **Read as reference.**                                          |
| **Your task (pick one, build it):**                                  |                                                                                               |                                                                 |
| `src/main/java/sceneitall/viewmodel/SceneBuilderViewModel.java`      | Skeleton — properties declared, methods are TODOs                                             | **Fill in** command methods                                     |
| `src/main/java/sceneitall/viewmodel/DeviceSetupViewModel.java`       | Skeleton — properties declared, methods are TODOs                                             | **Fill in** command methods                                     |
| `src/main/java/sceneitall/viewmodel/ScheduleViewModel.java`          | Skeleton — properties declared, methods are TODOs                                             | **Fill in** command methods                                     |
| `src/main/java/sceneitall/controller/*Controller.java`               | Empty Controller for each task                                                                | **Pick one, fill in** `@FXML` fields, `initialize()`, bindings  |
| `src/main/resources/*-task.fxml`                                     | Empty FXML for each task                                                                      | **Pick one, build your layout** in Scene Builder                |
| `src/test/java/sceneitall/viewmodel/*ViewModelTest.java`             | Test scaffold for each task — one TODO                                                        | **Write one test**                                              |
| `src/test/java/sceneitall/*E2ETest.java`                             | TestFX scaffold for each task — `start()` pre-wired                                           | **Write one test**                                              |
| **Shared:**                                                          |                                                                                               |                                                                 |
| `src/main/resources/styles.css`                                      | Dark theme from L29 (optional)                                                                | Use it or ignore it                                             |
| `src/main/java/sceneitall/SceneItAllApp.java`                        | Application class — loads your chosen FXML (change the path)                                  | **Update FXML path** to point to your task                      |

### Use the reference implementation

Before you start building, **run the Area Dashboard** to see what a complete SceneItAll GUI looks
like. It's the same example from L29 and L30 — complete FXML, Controller, ViewModel, and tests.
Study how the pieces connect:

- How does `fx:id="brightnessSlider"` in the FXML map to `@FXML private Slider brightnessSlider` in
  the Controller?
- How does `initialize()` set up the binding?
- How does the ViewModel test call `activateScene()` without any JavaFX widgets?
- How does the E2E test find elements by `accessibleText`?

You're building a **different** task, but the patterns are identical. Use the reference to answer
"how do I...?" questions as you work.

### Install Scene Builder

Scene Builder is a standalone visual editor for FXML files. You'll use it to build your GUI layout
by dragging and dropping components.

1. **Download Scene Builder** from [Gluon](https://gluonhq.com/products/scene-builder/) (free,
   choose your OS)
2. **Install it** — on macOS, drag to Applications; on Windows, run the installer
3. **Open Scene Builder**, then go to **File → Open** and select your task's `.fxml` file (e.g.,
   `src/main/resources/scene-builder-task.fxml`)

After editing in Scene Builder, save (`Cmd+S` / `Ctrl+S`) — the FXML file updates in place. Switch
back to VS Code to see the changes and write your Controller code.

:::tip AI-Assisted FXML Editing You can also use **Claude Code** or **GitHub Copilot** to tweak your
FXML files directly — for example, "add a ComboBox below the ListView with fx:id deviceComboBox and
accessibleText Select device" or "change the VBox spacing to 12 and add padding." This is often
faster than switching between Scene Builder and VS Code for small adjustments. Northeastern students
get $200/month of Claude Code usage when signing in with their northeastern.edu account. :::


### Running the app

To launch the GUI:

```bash
./gradlew run
```

This starts `SceneItAllApp`, which loads whichever FXML file is set in `SceneItAllApp.java`. By
default it loads the Area Dashboard reference implementation. When you start your task, change the
`FXML_PATH` constant to point to your task's FXML (e.g., `"/scene-builder-task.fxml"`).

### Running the tests

To run all tests (ViewModel tests + E2E tests):

```bash
./gradlew test
```

To run just the ViewModel tests (fast, no GUI window):

```bash
./gradlew test --tests 'sceneitall.viewmodel.*'
```

To run just the E2E tests (launches a GUI window briefly):

```bash
./gradlew test --tests 'sceneitall.*E2ETest'
```

To run a specific test class:

```bash
./gradlew test --tests 'sceneitall.viewmodel.AreaDashboardViewModelTest'
```

### Verify your setup

1. Open the project in VS Code
2. Open Scene Builder and use **File → Open** to open `src/main/resources/area-dashboard.fxml` —
   you should see the Area Dashboard layout
3. Run `./gradlew run` — you should see a window titled "SceneItAll" with the Area Dashboard
4. Run `./gradlew test` — the reference tests should pass; scaffold tests should pass

:::tip NullAway and `@FXML` fields `@FXML` fields are injected by `FXMLLoader` at runtime, after the
constructor runs — so they look uninitialized to NullAway. The skeleton Controllers handle this with
`@NullUnmarked` (from JSpecify) at the top of the class, which tells NullAway that null analysis
doesn't apply here because the framework handles initialization. Copy that pattern in your Controller.

For ViewModel backing-model fields (`area`, `areas`), the skeletons use `@Nullable` from JSpecify,
which is accurate — those fields genuinely are null until `setArea()`/`setModel()` is called. When
you implement the TODO methods, use `Objects.requireNonNull(area, "Call setArea() first")` to get a
non-null local reference NullAway is happy with. :::

:::tip Known build warnings You'll see **some warnings** when you build — this is normal:
- **UnusedVariable / UnusedMethod** false positives on `@FXML` fields and `private` handler methods
  (called reflectively by FXMLLoader, so Error Prone can't see the usages)
- **"Unknown module: javafx.graphics"** and **"Unsupported JavaFX configuration"** during tests (harmless TestFX/module-system noise)

None of these indicate a problem with your code. :::


---

## Part 2: Build Your Area Dashboard — Pair Programming (30 min)

Pick one of the three SceneItAll design tasks below. **You can reuse either partner's Lab 11 paper
prototype or start fresh.** Decide together.

:::warning Not Area Dashboard The Area Dashboard was the running example in L29 and L30 — you've
already seen the complete FXML, Controller, ViewModel, and tests for it. Pick a **different** task
so you practice applying the patterns yourself, not reproducing lecture code. The lecture example is
there as a reference, not a template to copy. :::

| Design Task               | What to build                                                                                                | How it differs from the lecture example                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scene Builder**         | Interface for creating/editing a Scene — select devices, set target states, name the scene, assign to a room | Multiple device controls in one view, creating a new domain object (`sceneitall.model.Scene`) rather than displaying existing ones. Uses `setArea(Area)` (single area). **Note:** Watch out for the name collision with `javafx.scene.Scene` — use the fully qualified name when both are in scope. |
| **Device Setup**          | Scan for devices, name one, pick a type, assign to a room, save                                              | Validation (device name required, room must be selected), new device added to Model, uses `TextField` and `DeviceType` enum not shown in reference. Uses `setModel(List<Area>)` (multiple rooms). |
| **Schedule & Automation** | Interface for creating automated rules — "at sunset, activate Evening in Living Room"                        | Multiple selection inputs with validation. Uses `setModel(List<Area>)`. **Note:** The model doesn't include scheduling/automation concepts — you'll represent rules as formatted Strings in the ViewModel's `ObservableList<String>` |

**Swap roles at least twice during this part** (roughly every 8-10 minutes). The TA may call out
role swaps.

:::note For TAs Call out "swap!" at roughly 10-minute intervals during Part 2. Watch for pairs where
the navigator has disengaged — redirect them. The navigator should be actively reading, suggesting,
and catching issues ("that `fx:id` doesn't match the field name", "should that be in `initialize()`
instead?"). :::

### Phase A: Build the FXML (Driver 1, ~12 min)

**Driver** builds the layout in Scene Builder. **Navigator** has the Lab 11 paper prototype (or a
fresh design sketch) open as reference and guides the layout decisions.

Your layout must include **at minimum:**

- A **title label** (e.g., room name or "Add Device")
- One **interactive control** — Slider, ComboBox, Spinner, or ToggleButton
- A **ListView** showing device statuses or scene items
- One **action Button** (e.g., "Activate Scene", "Add Device", "Save Rule")

For each component:

- Set `fx:id` in the Code panel (e.g., `brightnessSlider`)
- Set `accessibleText` in the Properties panel for any widget that doesn't have visible text.
  **This must match exactly** (case-sensitive) what your E2E test uses in `findByAccessibleText()`.
- Set `onAction` for your Button → `#handleYourAction`

**Navigator:** Check that every `fx:id` follows a consistent naming convention. Check that every
interactive widget has `accessibleText`. Reference the paper prototype — are you building what you
designed?

### 🔄 Swap roles!

### Phase B: Wire ViewModel & Controller (Driver 2, ~12 min)

**Driver** writes the Java code. **Navigator** has the FXML open (or Scene Builder) and
cross-references the `fx:id`s against the `@FXML` field names.

**Start with the ViewModel** (so the Controller can call its methods without crashing):

Fill in the ViewModel for your chosen task. Each skeleton has properties declared and TODO methods:

- **SceneBuilderViewModel:** `addDeviceToScene()`, `removeDeviceFromScene()`, `saveScene()`
- **DeviceSetupViewModel:** `scanForDevices()`, `selectDevice()`, `assignToRoom()`, `saveDevice()`
- **ScheduleViewModel:** `setTrigger()`, `setAction()`, `saveRule()`

Implement enough TODO methods for one complete user flow (e.g., add a device to a scene *and*
save it). In practice this means at least 2 methods, often all of them — they tend to depend on
each other.

**Then wire the Controller:**

1. Add `@FXML` fields matching your `fx:id`s
2. In `initialize()`, **create sample data** — build Area objects with devices and/or scenes, similar
   to `createSampleArea()` in the reference Controller. Your ViewModel needs data to display.
3. Create the ViewModel and connect it to the model (`setArea()` or `setModel()`)
4. Bind widgets to ViewModel properties. **Use `bind()` for display-only Labels; use
   `bindBidirectional()` for TextFields where user input should flow back to the ViewModel.** The
   reference only shows `bind()` (one-way) because it only has Labels and a Slider listener — your
   task may need bidirectional binding for TextFields.
5. Set up listeners for ComboBox selection, slider changes, etc. (see the reference Controller's
   ComboBox listener pattern: `comboBox.getSelectionModel().selectedItemProperty().addListener(...)`)
6. Implement your button handler — delegate to the ViewModel
7. Your Controller skeleton already has `@NullUnmarked` at the class level — no action needed. In
   your ViewModel implementations, use `Objects.requireNonNull(area, "Call setArea() first")` (or
   `areas`) to satisfy NullAway where the backing model field is `@Nullable`.

:::warning Implement ViewModel methods before wiring Controller listeners If your Controller sets up
listeners that call ViewModel TODO methods (like `selectDevice()` or `assignToRoom()`), those
listeners will fire during `initialize()` and throw `UnsupportedOperationException`. Implement the
ViewModel methods first. :::

**Navigator:** Watch for the #1 lifecycle bug — code that touches `@FXML` fields in the constructor
instead of `initialize()`. Watch for `fx:id` / field name mismatches. Your task may require widgets
not shown in the reference (e.g., `TextField`, `ComboBox<Enum>`) — check the JavaFX docs or ask
your partner. Think ahead: "after we wire this, how will we test it?"

### 🔄 Swap roles!

### Phase C: Run & Polish (Both, ~6 min)

Launch `SceneItAllApp` together. Both of you look at the running GUI:

- Click your button — does the device list update?
- Drag the slider — does the value change?
- Tab through the GUI — can you reach every widget?

Fix anything broken. The navigator from Phase B should now drive the fixes.

---

## Part 3: Test (10 min)

:::info Why test last? You might wonder: shouldn't we write tests first? In GUI development, there's
a real cost to writing tests too early. If you'd written E2E tests before seeing the running app,
those tests would assert on the _old_ layout and break when you polish it.

This is a key difference from domain logic testing (where test-first works great). GUI tests are
expensive to write and fragile when the interface is still evolving. The professional pattern is:
**explore manually first** (including having someone else try your UI), **stabilize the design**,
then **lock it down with automated tests.** ViewModel tests are more stable since they don't depend
on layout — but E2E tests should wait until you're confident in the interaction design.

In GA1, you'll blend both: write ViewModel tests early (they're cheap and stable), but save E2E
tests for after your feature's UI has settled. :::

### Write one ViewModel test (one partner drives)

Open the ViewModel test file for your chosen task. The scaffold has one example test and one TODO.
Write a test that:

1. Creates a ViewModel and sets a Model with test data
2. Calls one of the command methods you implemented
3. Asserts on a property value

Examples for each task:

```java
// Scene Builder task — addDeviceToScene() reads from properties, not parameters
// testArea is built in @BeforeEach (see scaffold)
@Test
void addDeviceToScene_updatesDeviceList() {
    SceneBuilderViewModel vm = new SceneBuilderViewModel();
    vm.setArea(testArea);                              // setArea(), not setModel()
    vm.selectedDeviceProperty().set("Ceiling Light");  // set properties first
    vm.targetValueProperty().set(30);

    vm.addDeviceToScene();                             // no parameters — reads from properties

    assertThat(vm.getSceneDevices()).anyMatch(s -> s.contains("Ceiling Light"));
}

// Device Setup task — setModel() takes List<Area>, not setArea()
@Test
void assignToRoom_updatesRoomProperty() {
    DeviceSetupViewModel vm = new DeviceSetupViewModel();
    vm.setModel(List.of(new Area("Living Room"), new Area("Bedroom")));
    vm.selectDevice("New Light");                      // accepts any name, not just scanned ones

    vm.assignToRoom("Bedroom");

    assertThat(vm.assignedRoomProperty().get()).isEqualTo("Bedroom");
}

// Schedule task — setAction() takes 2 parameters (scene, area), not 3
@Test
void saveRule_addsToRuleList() {
    ScheduleViewModel vm = new ScheduleViewModel();
    vm.setModel(testAreas);
    vm.setTrigger("Sunset");
    vm.setAction("Evening", "Living Room");            // 2 params, not 3

    vm.saveRule();

    assertThat(vm.getRules()).isNotEmpty();
}
```

Run it. It should pass in milliseconds — no JavaFX runtime needed.

### 🔄 Swap! Write one E2E test (other partner drives)

Open the E2E test file for your chosen task. The scaffold has `start()` pre-wired and a
`findByAccessibleText()` helper. **Study `AreaDashboardE2ETest` carefully before writing your own**
— it uses `interact()` to run actions on the JavaFX thread, which is more reliable than `clickOn()`
for ComboBox selections and button clicks. Write a test that:

1. Finds widgets by `accessibleText` and casts them to their types (e.g., `ComboBox`, `Button`)
2. Uses `interact(() -> { ... })` to manipulate widgets programmatically
3. Calls `WaitForAsyncUtils.waitForFxEvents()` after interactions
4. Asserts on a visible result using AssertJ's `assertThat`

Examples for each task:

```java
// Scene Builder task — use interact() for reliable widget manipulation
@Test
void userCanAddDeviceToScene() {
    @SuppressWarnings("unchecked")
    ComboBox<String> deviceCombo =
        (ComboBox<String>) findByAccessibleText("Select device");
    Slider targetSlider = (Slider) findByAccessibleText("Target value");
    Button addBtn = (Button) findByAccessibleText("Add device to scene");

    interact(() -> {
        deviceCombo.getSelectionModel().select("Ceiling Light");
        targetSlider.setValue(30);
        addBtn.fire();
    });
    WaitForAsyncUtils.waitForFxEvents();

    @SuppressWarnings("unchecked")
    ListView<String> devices =
        (ListView<String>) findByAccessibleText("Devices in scene");
    assertThat(devices.getItems().stream()
        .anyMatch(s -> s.contains("Ceiling Light"))).isTrue();
}

// Device Setup task
@Test
void userCanAddNewDevice() {
    TextField nameField = (TextField) findByAccessibleText("Device name");
    @SuppressWarnings("unchecked")
    ComboBox<String> roomCombo =
        (ComboBox<String>) findByAccessibleText("Choose a room");
    Button saveBtn = (Button) findByAccessibleText("Save device");

    interact(() -> {
        nameField.setText("Desk Lamp");
        roomCombo.getSelectionModel().select("Bedroom");
        saveBtn.fire();
    });
    WaitForAsyncUtils.waitForFxEvents();

    Label status = (Label) findByAccessibleText("Status message");
    assertThat(status.getText()).contains("saved");
}

// Schedule task — note: must select trigger, scene, AND area before saving
@Test
void userCanCreateAutomationRule() {
    @SuppressWarnings("unchecked")
    ComboBox<String> triggerCombo =
        (ComboBox<String>) findByAccessibleText("Select trigger");
    @SuppressWarnings("unchecked")
    ComboBox<String> sceneCombo =
        (ComboBox<String>) findByAccessibleText("Select scene");
    @SuppressWarnings("unchecked")
    ComboBox<String> areaCombo =
        (ComboBox<String>) findByAccessibleText("Select area");
    Button saveBtn = (Button) findByAccessibleText("Save rule");

    interact(() -> {
        triggerCombo.getSelectionModel().select("Sunset");
        sceneCombo.getSelectionModel().select("Evening");
        areaCombo.getSelectionModel().select("Living Room");
        saveBtn.fire();
    });
    WaitForAsyncUtils.waitForFxEvents();

    @SuppressWarnings("unchecked")
    ListView<String> rules =
        (ListView<String>) findByAccessibleText("Automation rules");
    assertThat(rules.getItems()).isNotEmpty();
}
```

Run it. This one takes a couple seconds — it launches the real GUI.

---

## Part 4: Pair Programming Debrief (10 min)

:::note For TAs Bring the class back together for a group debrief. This is the soft-skills payoff of
the lab. Ask the questions below and let 3-4 pairs share. Keep it conversational — 8 minutes of
discussion, 2 minutes for reflection writing. :::

**Class discussion — a few pairs share:**

1. **How did you decide who drove first?** Did it matter?
2. **What did the navigator catch that the driver missed?** (fx:id typos? lifecycle bugs?
   accessibility gaps?)
3. **When was it hardest to be the navigator?** (When the driver was doing something you disagreed
   with? When you didn't understand the code? When you wanted to grab the keyboard?)
4. **Did you communicate differently when pair programming vs. working alone?** Did you explain your
   thinking more? Less?
5. **How does this compare to the PR review workflow you'll use in GA1?** (Pair programming is
   real-time review; PR review is asynchronous. Which catches more? Which is more efficient?)

---

## Part 5: Reflection (5 min)

**Both partners** submit a `REFLECTION.md` through their own Pawtograder lab repository. (Only one
partner needs to submit the code — the one whose repo you worked in.)

### Section 1: The Build

- Which design task did you choose?
- Did you reuse a Lab 11 paper prototype? What changed between paper and code?
- Who was your partner?

### Section 2: Pair Programming

- What was the most valuable thing your navigator caught while you were driving?
- What was hardest about being the navigator?
- Did pair programming change how you think about the code compared to working alone? How?

### Section 3: Testing

- Paste or screenshot your passing ViewModel test
- Paste or screenshot your passing E2E test
- Which test was easier to write? Which gave you more confidence that your code works?

### Section 4: Looking Ahead

- What will you do differently in GA1 based on today's experience?

---

## Submission

- **Code:** One partner submits the shared code through their Pawtograder lab repository (FXML,
  Controller, ViewModel, tests)
- **Reflection:** Both partners submit their own `REFLECTION.md` through their own Pawtograder lab
  repository

## Grading

:::info **Option 1:** Running GUI + both tests passing + both partners submit reflections → full
credit.

**Option 2:** Submit whatever you complete along with the reflection documenting your progress, what
you got stuck on, and what you learned → good-faith credit available. Attendance and genuine
engagement matter more than perfection. :::
