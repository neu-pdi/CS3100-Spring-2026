---
sidebar_position: 29
lecture_number: 29
title: "L29: GUIs in Java"
---

# GUIs in Java

## Describe the historical context of GUI development in Java (10 minutes)

Java has been through three major GUI toolkits, each representing different eras of thinking about how to build graphical interfaces:

### AWT: The Platform-Native Approach (1995)

The **Abstract Window Toolkit (AWT)** was Java's original GUI toolkit, released with Java 1.0. AWT took a "lowest common denominator" approach: it provided Java wrappers around each platform's native GUI components. When you created an AWT `Button`, Java asked Windows/Mac/Linux to create a native button.

```java
// AWT example - uses native platform widgets
Button button = new Button("Click me");
button.addActionListener(e -> System.out.println("Clicked!"));
```

This approach had a critical problem: **platform inconsistency**. A button might be 80 pixels wide on Windows but 95 pixels on Mac. Layouts that looked perfect on one platform broke on another. And AWT could only offer features that existed on *all* platforms—the intersection of capabilities rather than the union.

### Swing: The Pure-Java Approach (1997)

**Swing** solved AWT's consistency problems by abandoning native widgets entirely. Instead of asking the operating system to draw a button, Swing drew its own buttons using Java 2D graphics. Every Swing application looked identical across platforms (for better or worse).

```java
// Swing example - draws its own widgets
JButton button = new JButton("Click me");
button.addActionListener(e -> System.out.println("Clicked!"));
```

Swing dominated Java GUI development for over a decade. It's still widely used in legacy applications, IDE plugins, and tools where platform-native appearance isn't critical. However, Swing showed its age: it predated modern UI concepts like CSS styling, hardware-accelerated graphics, and declarative UI definitions.

### JavaFX: The Modern Approach (2008/2014)

**JavaFX** represents somewhat more modern GUI thinking. Key innovations include:

- **Scene Graph Architecture**: UIs are trees of nodes that can be transformed, animated, and styled. This matches how modern graphics hardware thinks about rendering.
- **Declarative UI with FXML**: Separate UI structure (FXML/XML) from behavior (Java), similar to how web development separates HTML from JavaScript.
- **CSS Styling**: Style your entire application with CSS, just like web pages (for better or worse).
- **Property Binding**: Automatically synchronize UI elements with data—when your model changes, the UI updates automatically.

```java
// JavaFX example - modern scene graph approach
Button button = new Button("Click me");
button.setOnAction(e -> System.out.println("Clicked!"));
```

JavaFX was initially bundled with the JDK, then unbundled in Java 11 (2018) into a separate project called [OpenJFX](https://openjfx.io/). While Oracle has reduced its investment in JavaFX, the community continues active development. For learning GUI concepts, JavaFX remains an acceptable choice because its architecture reflects patterns used across modern platforms (React, SwiftUI, Flutter all use similar concepts).

## Review event-driven programming and the callback model (10 minutes)

GUI programming requires a fundamentally different mental model than the sequential code you've written so far. In sequential programming, *your code* controls execution flow:

```java
// Sequential: your code is in control
System.out.println("Enter your name:");
String name = scanner.nextLine();  // Program waits here
System.out.println("Hello, " + name);
```

In GUI programming, the *framework* controls execution. Your code responds to events—user clicks, key presses, timers firing—whenever they happen to occur:

```java
// Event-driven: framework is in control, your code responds
button.setOnAction(event -> {
    // This runs sometime later, when the user clicks
    System.out.println("Button was clicked!");
});
// Code continues immediately - doesn't wait for click
```

This **inversion of control** is the defining characteristic of event-driven programming. You register *callbacks* (also called *handlers* or *listeners*)—functions that the framework will call when specific events occur. Then you yield control to the framework's *event loop*, which waits for events and dispatches them to your callbacks.

### The Event Loop

Every GUI framework has an event loop at its core:

```
while (application is running) {
    event = waitForNextEvent()      // Block until something happens
    handler = findHandlerFor(event)  // Look up registered callback
    handler.handle(event)            // Call your code
}
```

In JavaFX, this loop runs on a dedicated thread called the **JavaFX Application Thread**. All UI updates must happen on this thread—if you try to modify the UI from another thread, you'll get exceptions or undefined behavior.

### Callback Styles in JavaFX

JavaFX supports several ways to register callbacks:

**Lambda expressions** (most common for simple handlers):
```java
button.setOnAction(event -> handleButtonClick());
```

**Method references** (when you have an existing method):
```java
button.setOnAction(this::handleButtonClick);
```

**Anonymous classes** (if you need to provide a handler with more than one method):
```java
button.setOnMouseClicked(new EventHandler<MouseEvent>() {
    @Override
    public void handle(MouseEvent event) {
        if (event.getClickCount() == 2) {
            handleDoubleClick();
        }
    }
});
```

You've already used callbacks earlier this semester—in Java streams (`list.forEach(item -> ...)`), in comparators (`list.sort((a, b) -> ...)`), and potentially in testing frameworks. GUI callbacks follow the same pattern, just with different event types.

## Define the Model-View-Controller (MVC) pattern (15 minutes)

:::note Information Hiding In Action
MVC is information hiding applied to user interfaces. In [Lecture 6](/lecture-notes/l6-immutability-abstraction), we learned that modules should hide their implementation details. MVC applies this principle: the Model hides business logic from the View, the View hides presentation details from the Model, and the Controller mediates between them. Each component can change independently because it doesn't know the internal workings of the others.
:::

As GUIs grew more complex, developers discovered that mixing UI code with business logic created unmaintainable tangles. Click handlers that directly modified databases. Display code scattered with business rules. Changes to the UI broke core functionality; changes to business logic broke the display. In the language of [Lecture 7](./l7-design-for-change.md), this code had *low cohesion* (mixing unrelated responsibilities) and *high coupling* (UI and business logic depending on each other's implementation details).

The **Model-View-Controller (MVC)** pattern, originating at Xerox PARC in the 1970s, provides a principled separation:

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                 │
│                          │                                  │
│                    sees  │  interacts                       │
│                          ▼                                  │
│  ┌────────────┐    ┌─────────────┐    ┌──────────────┐     │
│  │   MODEL    │◄───│    VIEW     │◄───│  CONTROLLER  │     │
│  │            │    │             │    │              │     │
│  │ - data     │    │ - display   │    │ - handles    │     │
│  │ - business │───►│ - widgets   │    │   user input │     │
│  │   logic    │    │ - layout    │───►│ - updates    │     │
│  │ - state    │    │             │    │   model      │     │
│  └────────────┘    └─────────────┘    └──────────────┘     │
│        │                 ▲                    │             │
│        │    notifies     │      updates       │             │
│        └─────────────────┘◄───────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### The Three Components

**Model**: The application's data and business logic. The Model knows nothing about how it will be displayed—it could be shown in a GUI, a command-line interface, or a web API. For CookYourBooks, the Model includes:
- The list of recipes and cookbooks
- Recipe content (ingredients, instructions, notes)
- Business rules (e.g., scaling logic, unit conversion)

**View**: The visual representation of the Model. The View displays data and provides widgets for user interaction, but contains no business logic. For CookYourBooks, the View includes:
- Recipe cards showing title and preview
- Ingredient lists with checkboxes
- The layout and styling of all visual elements

**Controller**: The intermediary that handles user input and coordinates between Model and View. When the user clicks a button, the Controller decides what to do—typically updating the Model, which then notifies the View to refresh. For CookYourBooks, the Controller:
- Responds to "Import Recipe" button clicks
- Validates user input (e.g., servings must be positive)
- Coordinates multi-step operations

### Why MVC Matters

This separation provides the same benefits we discussed in [Lecture 6](./l6-immutability-abstraction.md) and [Lecture 7](./l7-design-for-change.md) when we covered modularity, coupling, and cohesion:

**Low coupling**: The Model has no knowledge of the View—it could be displayed in a GUI, CLI, or web API. This is *data coupling* at most (passing primitives or simple types), avoiding the *stamp coupling* that would occur if the Model depended on UI widget types.

**High cohesion**: Each component has a single responsibility. The Model exhibits *functional cohesion* (all code related to business logic), the View exhibits *communication cohesion* (all code operating on the same visual representation), and the Controller exhibits *sequential cohesion* (coordinating the flow from user input to model update to view refresh).

**Testability**: As we discussed in [Lecture 16](./l16-testing2.md), separating infrastructure from domain code is the key to testability. The Model *is* your domain code—pure business logic with no UI dependencies. You can test it with simple unit tests: create a Recipe, call `scale(8)`, and verify ingredient quantities. No GUI required.

### MVC in JavaFX

JavaFX naturally supports MVC through its architecture:

- **Model**: Plain Java classes (POJOs) or classes using JavaFX properties for data binding
- **View**: FXML files defining UI structure + CSS for styling
- **Controller**: Java classes referenced in FXML via `fx:controller`

```xml
<!-- View: recipe-panel.fxml -->
<VBox fx:controller="cookyourbooks.RecipePanelController">
    <Button fx:id="scaleButton" text="Scale Recipe" 
            onAction="#handleScale"/>
</VBox>
```

```java
// Controller: RecipePanelController.java
public class RecipePanelController {
    @FXML private Button scaleButton;
    
    private Recipe model;  // Reference to Model
    
    @FXML
    private void handleScale(ActionEvent event) {
        model.scale(targetServings);  // Delegate to Model
    }
}
```

```java
// Model: Recipe.java
public class Recipe {
    private List<Ingredient> ingredients;
    private int servings;
    
    public void scale(int targetServings) {
        double factor = (double) targetServings / this.servings;
        // Pure business logic, no UI
        for (Ingredient ing : ingredients) {
            ing.scale(factor);
        }
        this.servings = targetServings;
    }
}
```

In the next lecture, we'll examine the Model-View-ViewModel (MVVM) pattern, which evolved from MVC to better support data binding and improve testability further.

## Create a simple GUI application using JavaFX and Scene Builder (20 minutes)

Let's build a simplified CookYourBooks recipe viewer. We'll create the View using Scene Builder, implement a Controller, and connect it to a Model.

### Setting Up Scene Builder

[Scene Builder](https://gluonhq.com/products/scene-builder/) is a visual design tool for creating FXML files. You drag and drop components, set properties, and Scene Builder generates the XML.

Download Scene Builder from Gluon and configure your IDE to open `.fxml` files with it.

### Building the View

Create a new FXML file `recipe-panel.fxml`. In Scene Builder:

1. **Add a container**: Drag a `VBox` as the root element
2. **Add a label**: Drag a `Label` to show the recipe name
3. **Add controls**: Drag a `Spinner` for servings and a `Button` to scale
4. **Set fx:id values**: Select each control and set its `fx:id` in the Code section

The generated FXML might look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?import javafx.scene.control.*?>
<?import javafx.scene.layout.*?>

<VBox spacing="10" xmlns:fx="http://javafx.com/fxml" 
      fx:controller="cookyourbooks.RecipePanelController">
    
    <Label fx:id="recipeNameLabel" text="Recipe Name"/>
    
    <HBox spacing="5">
        <Label text="Servings:"/>
        <Spinner fx:id="servingsSpinner" min="1" max="100"/>
        <Button fx:id="scaleButton" text="Scale"
                onAction="#handleScale"/>
    </HBox>
    
    <ListView fx:id="ingredientsList"/>
</VBox>
```

### Adding Accessibility Labels

Every interactive widget needs an **accessible label** that assistive technologies can announce:

```xml
<Spinner fx:id="servingsSpinner" min="1" max="100"
         accessibleText="Number of servings"
         accessibleHelp="Adjust the number of servings to scale the recipe"/>

<Button fx:id="scaleButton" text="Scale"
        accessibleText="Scale recipe to selected servings"
        onAction="#handleScale"/>
```

### Implementing the Controller

```java
package cookyourbooks;

import javafx.fxml.FXML;
import javafx.scene.control.*;

public class RecipePanelController {
    
    @FXML private Label recipeNameLabel;
    @FXML private Spinner<Integer> servingsSpinner;
    @FXML private Button scaleButton;
    @FXML private ListView<String> ingredientsList;
    
    private Recipe model;
    
    public void setModel(Recipe model) {
        this.model = model;
        recipeNameLabel.setText(model.getTitle());
        servingsSpinner.getValueFactory().setValue(model.getServings());
        updateIngredientsList();
    }
    
    @FXML
    private void handleScale() {
        int targetServings = servingsSpinner.getValue();
        model.scale(targetServings);
        updateIngredientsList();
    }
    
    private void updateIngredientsList() {
        ingredientsList.getItems().clear();
        for (Ingredient ing : model.getIngredients()) {
            ingredientsList.getItems().add(ing.format());
        }
    }
}
```

### Key Takeaways

1. **Separation of concerns**: FXML defines structure, Controller handles events, Model contains logic
2. **Accessibility from the start**: Every widget gets meaningful `accessibleText`
3. **MVC in action**: The Controller mediates between View (FXML/widgets) and Model (Recipe)
4. **Testability preview**: Because our Model is a plain Java class with no UI dependencies, we can unit test it easily. In the next lecture, we'll see how to E2E test the full UI using TestFX.

