---
sidebar_position: 30
lecture_number: 30
title: "L30: GUI Patterns and Testing"
---

# GUI Patterns and Testing

## Define the Model-View-ViewModel (MVVM) pattern (15 minutes)

In the previous lecture, we introduced Model-View-Controller (MVC) as a way to separate concerns in GUI applications. MVC has served developers well for decades, but as applications grew more complex—and as testability became more critical—limitations emerged.

Consider our CookYourBooks recipe panel. In the MVC implementation, the Controller does a lot of manual work:

```java
// MVC Controller: lots of manual synchronization
@FXML
private void handleScale() {
    model.scale(servingsSpinner.getValue());
    updateIngredientsList();  // Manual View update
}

private void updateIngredientsList() {
    ingredientsList.getItems().clear();
    for (Ingredient ing : model.getIngredients()) {
        ingredientsList.getItems().add(ing.format());  // More manual work
    }
}
```

Every time the Model changes, we must remember to update the View. Every time the View changes, we must update the Model. This manual synchronization is tedious and error-prone. Worse, testing the Controller requires a running UI—the Controller has low *observability* and low *controllability* in the terms we introduced in [Lecture 16](./l16-testing2.md).

**Model-View-ViewModel (MVVM)** evolved from MVC to address these problems. MVVM was developed by Microsoft architects in 2005 for Windows Presentation Foundation (WPF), but the pattern has spread to virtually every modern UI framework.

### The Three Components

```
┌──────────────────────────────────────────────────────────────┐
│                          USER                                │
│                            │                                 │
│                      sees  │  interacts                      │
│                            ▼                                 │
│    ┌────────────┐    ┌───────────┐    ┌───────────────┐     │
│    │   MODEL    │◄───│ VIEWMODEL │◄══►│     VIEW      │     │
│    │            │    │           │    │               │     │
│    │ - data     │    │ - UI state│    │ - display     │     │
│    │ - business │───►│ - commands│    │ - widgets     │     │
│    │   logic    │    │ - binding │    │ - data binding│     │
│    │ - state    │    │   props   │    │   declarations│     │
│    └────────────┘    └───────────┘    └───────────────┘     │
│                            ▲                                 │
│                      ══════╩══════                           │
│                      TWO-WAY DATA BINDING                    │
└──────────────────────────────────────────────────────────────┘
```

**Model**: Same as in MVC—the application's data and business logic. Pure Java classes with no UI dependencies.

**View**: The visual representation, but now *declaratively bound* to the ViewModel. The View contains no logic—it simply declares "this label displays the `recipeName` property" and "this spinner is bound to the `servings` property."

**ViewModel**: The crucial innovation. The ViewModel exposes *UI-friendly properties* that the View can bind to. It transforms Model data into exactly what the View needs and translates user actions into Model operations. Critically, **the ViewModel has no reference to the View**—it doesn't know or care how (or if) it's being displayed.

### The Power of Data Binding

The key insight of MVVM is **data binding**: a declarative mechanism that automatically synchronizes properties between the ViewModel and View.

```java
// MVVM ViewModel: exposes bindable properties
public class RecipePanelViewModel {
    private final StringProperty recipeName = new SimpleStringProperty();
    private final IntegerProperty servings = new SimpleIntegerProperty();
    private final ObservableList<String> ingredients = FXCollections.observableArrayList();
    
    private Recipe model;
    
    public void setModel(Recipe model) {
        this.model = model;
        recipeName.set(model.getTitle());
        servings.set(model.getServings());
        updateIngredients();
        
        // Automatically update model when servings changes
        servings.addListener((obs, oldVal, newVal) -> {
            model.scale(newVal.intValue());
            updateIngredients();
        });
    }
    
    private void updateIngredients() {
        ingredients.clear();
        for (Ingredient ing : model.getIngredients()) {
            ingredients.add(ing.format());
        }
    }
    
    // Property accessors for binding
    public StringProperty recipeNameProperty() { return recipeName; }
    public IntegerProperty servingsProperty() { return servings; }
    public ObservableList<String> getIngredients() { return ingredients; }
}
```

## Compare and contrast MVC with MVVM patterns (10 minutes)

Both patterns separate concerns, but they do so differently.

### Structural Differences

| Aspect | MVC | MVVM |
|--------|-----|------|
| **View ↔ Logic coupling** | Controller references View directly | ViewModel has no View reference |
| **Synchronization** | Manual (Controller updates View) | Automatic (data binding) |
| **View's role** | Passive (waits for Controller) | Active (binds to ViewModel) |
| **State location** | Split between View and Model | Centralized in ViewModel |

### Testability

This is where MVVM shines—it dramatically improves *observability* (we can inspect ViewModel properties) and *controllability* (we can set properties directly without simulating clicks):

**MVVM Testing** is pure Java:
```java
@Test
void scaleRecipe_updatesIngredients() {
    // Arrange
    RecipePanelViewModel viewModel = new RecipePanelViewModel();
    Recipe recipe = new Recipe("Cake", 4);
    recipe.addIngredient(new Ingredient("flour", 2, "cups"));
    viewModel.setModel(recipe);
    
    // Act
    viewModel.servingsProperty().set(8);  // No UI needed!
    
    // Assert
    assertTrue(viewModel.getIngredients().get(0).contains("4 cups"));
}
```

The ViewModel test runs in milliseconds, requires no UI toolkit initialization, and verifies exactly the logic we care about.

## Explain why separation of concerns makes GUIs testable units (10 minutes)

In [Lecture 16](./l16-testing2.md), we introduced the testing pyramid and two key properties for testable code: **observability** and **controllability**. We also covered **Hexagonal Architecture**, which separates domain logic from infrastructure through ports and adapters.

MVC and MVVM are the GUI-specific application of these same principles:

| L16 Concept | GUI Application |
|-------------|-----------------|
| Domain code (easy to test) | Model and ViewModel |
| Infrastructure code (needs test doubles) | View (widgets, rendering) |
| Ports (interfaces to external systems) | Callbacks, property bindings |
| Adapters (concrete implementations) | JavaFX controls, FXML loaders |

The Model in MVC/MVVM plays the same role as the "Application Core" in Hexagonal Architecture—it contains pure business logic with no dependencies on UI infrastructure. The ViewModel adds *observability* by exposing bindable properties we can inspect in tests without rendering any UI.

## Write end-to-end tests for a GUI application using TestFX (20 minutes)

:::note Recall
In [Lecture 15 (Test Doubles and Isolation)](/lecture-notes/l15-testing), we introduced the testing pyramid and discussed why E2E tests are valuable but expensive: slow, flaky, and hard to debug. We deferred deep coverage of E2E testing until now. With MVVM in hand, you'll see why: most GUI behavior can be tested at the ViewModel level (fast, reliable, no UI needed). E2E tests are reserved for critical user journeys that span the entire application.
:::

### When E2E Tests Are Worth the Cost

Despite pushing tests down the pyramid, E2E tests remain essential—but only for the right things. E2E tests are expensive: slow to run, prone to flakiness, and high-maintenance.

**Write E2E tests for:**
- **Critical user journeys**: The paths that, if broken, would make the application unusable. For CookYourBooks: "User can import a recipe." Not: "User sees correct hover animation."
- **Integration boundaries**: Where multiple components come together in ways that unit tests can't verify.

**Don't write E2E tests for:**
- **Business logic**: If you can test it in the Model or ViewModel, do that instead.
- **Every UI permutation**: Test the happy path and critical error cases.

### The Core Problem: Element Location

Every GUI E2E test has the same fundamental structure:
1. **Locate** a UI element
2. **Act** on it (click, type, drag)
3. **Assert** something about the result

The hard problem is *locating elements reliably*.

| Strategy | Example | Problem |
|----------|---------|---------|
| **By ID** | `#scaleButton` | Breaks if developer renames the fx:id |
| **By CSS class** | `.button` | Breaks if styling changes; may match multiple elements |
| **By position** | `lookup(".button").nth(2)` | Breaks if layout changes |

### The Solution: Accessibility Locators

There's one identifier that describes *what an element is* rather than *how it's implemented*: the **accessibility label**.

```xml
<Button fx:id="scaleButton" text="Scale"
        accessibleText="Scale recipe to selected servings"
        onAction="#handleScale"/>
```

The accessibility label describes the element's *purpose*, not its implementation. When you refactor the UI—changing IDs, CSS classes, or layout—the element is still "Scale recipe to selected servings."

### TestFX Example

```java
import org.testfx.framework.junit5.ApplicationTest;
import static org.testfx.api.FxAssert.verifyThat;

public class RecipePanelE2ETest extends ApplicationTest {
    
    private Recipe testRecipe;
    
    @Override
    public void start(Stage stage) throws Exception {
        FXMLLoader loader = new FXMLLoader(
            getClass().getResource("/recipe-panel.fxml"));
        stage.setScene(new Scene(loader.load()));
        
        testRecipe = new Recipe("Chocolate Cake", 4);
        testRecipe.addIngredient(new Ingredient("flour", 2, "cups"));
        
        RecipePanelController controller = loader.getController();
        controller.setModel(testRecipe);
        
        stage.show();
    }
    
    private Matcher<Node> hasAccessibleText(String text) {
        return node -> text.equals(node.getAccessibleText());
    }
    
    @Test
    void userCanScaleRecipe() {
        // Locate by accessibility label - stable!
        clickOn(hasAccessibleText("Number of servings"));
        write("8");
        clickOn(hasAccessibleText("Scale recipe to selected servings"));
        
        // Verify model updated
        assertEquals(8, testRecipe.getServings());
    }
}
```

Notice what's *not* tested here:
- The exact pixel position of elements
- CSS styling details
- Animation timing
- Internal method calls

These tests verify *user-visible behavior*. If a user can scale a recipe, the test passes—regardless of how the UI is implemented internally.

