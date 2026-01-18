import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  AlertCircle,
  Check,
  X,
  ShoppingCart,
  Flame,
  ArrowLeft,
  ArrowRight,
  PartyPopper,
  ExternalLink,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { pantryFirebase } from "@/lib/pantryFirebase";
import { recipesFirebase } from "@/lib/recipesFirebase";
import { recipeApi } from "@/lib/api";
import { mockRecipes } from "@/lib/mockData";

export function Suggestions() {
  const { user } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [aiRecipes, setAiRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load pantry items from Firebase
  useEffect(() => {
    const loadItems = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const items = await pantryFirebase.getItems(user.uid);
        setPantryItems(items);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPantryItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, [user]);

  // Get expiring items
  const expiringItems = useMemo(() => {
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000,
    );

    return pantryItems.filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= threeDaysFromNow && expiryDate >= today;
    });
  }, [pantryItems]);

  // Calculate which recipes can be made with current pantry
  const recipeSuggestions = useMemo(() => {
    return mockRecipes
      .map((recipe) => {
        let matchCount = 0;
        let expiringMatch = 0;

        recipe.ingredients.forEach((ingredient) => {
          const pantryItem = pantryItems.find(
            (item) =>
              item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
              ingredient.name.toLowerCase().includes(item.name.toLowerCase()),
          );

          if (pantryItem) {
            matchCount++;
            // Check if this item is expiring
            const isExpiring = expiringItems.find(
              (e) => e.id === pantryItem.id,
            );
            if (isExpiring) expiringMatch++;
          }
        });

        const matchPercentage = Math.round(
          (matchCount / recipe.ingredients.length) * 100,
        );

        return {
          ...recipe,
          matchCount,
          matchPercentage,
          expiringMatch,
          missingCount: recipe.ingredients.length - matchCount,
        };
      })
      .sort((a, b) => {
        // Prioritize recipes that use expiring ingredients
        if (a.expiringMatch !== b.expiringMatch) {
          return b.expiringMatch - a.expiringMatch;
        }
        // Then by match percentage
        return b.matchPercentage - a.matchPercentage;
      });
  }, [pantryItems, expiringItems]);

  // Generate AI suggestions (mock)
  const aiSuggestions = useMemo(() => {
    if (expiringItems.length === 0) return [];

    const suggestions = [
      {
        id: 1,
        title: `Use your ${expiringItems[0]?.name || "expiring items"}`,
        description: `Make a quick meal using ${expiringItems
          .slice(0, 3)
          .map((i) => i.name)
          .join(", ")} before they expire.`,
        recipes: ["Stir Fry", "Salad", "Soup"],
      },
    ];

    if (expiringItems.length > 1) {
      suggestions.push({
        id: 2,
        title: "Batch cooking opportunity",
        description:
          "You have several items expiring soon. Consider meal prepping to use them all!",
        recipes: ["Meal Prep Bowls", "Freezer Meals"],
      });
    }

    return suggestions;
  }, [expiringItems]);

  // Get missing ingredients for a recipe
  const getMissingIngredients = (recipe) => {
    return recipe.ingredients.filter((ingredient) => {
      const pantryItem = pantryItems.find(
        (item) =>
          item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
          ingredient.name.toLowerCase().includes(item.name.toLowerCase()),
      );
      return !pantryItem;
    });
  };

  // Handle view recipe
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // Handle cook recipe
  const handleCookRecipe = (recipe) => {
    setCookingRecipe(recipe);
    setCurrentStep(0);
    setSelectedRecipe(null);
  };

  // Close cooking mode
  const closeCookingMode = () => {
    setCookingRecipe(null);
    setCurrentStep(0);
  };

  // Navigate steps
  const nextStep = () => {
    if (cookingRecipe && currentStep < cookingRecipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Finish cooking
  const finishCooking = () => {
    const recipeName = cookingRecipe.name;
    closeCookingMode();
    setNotification({
      open: true,
      title: "Cooking Complete!",
      message: `You've finished cooking "${recipeName}"! Ingredients have been removed from your pantry.`,
    });
  };

  // Save recipe to user's collection
  const handleSaveRecipe = async (recipe) => {
    try {
      const recipeData = {
        name: recipe.name,
        description: recipe.description || "",
        source: recipe.source || "AI Suggested",
        sourceUrl: recipe.sourceUrl || "",
        prepTime: recipe.prepTime || 0,
        cookTime: recipe.cookTime || 0,
        servings: recipe.servings || 4,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
      };
      await recipesFirebase.addRecipe(user.uid, recipeData);
      setNotification({
        open: true,
        title: "Recipe Saved!",
        message: `"${recipe.name}" has been added to your recipe library.`,
      });
    } catch (err) {
      console.error("Error saving recipe:", err);
      setNotification({
        open: true,
        title: "Save Failed",
        message: "Failed to save recipe to your library.",
      });
    }
  };

  // Add missing ingredients to shopping list
  const handleAddToShoppingList = (recipe) => {
    const missingIngredients = getMissingIngredients(recipe);
    // TODO: Call Flask API to add items to shopping list
    // shoppingListApi.addItems(missingIngredients)
    setNotification({
      open: true,
      title: "Added to Shopping List!",
      message: `${missingIngredients.length} missing ingredient${missingIngredients.length > 1 ? "s" : ""} for "${recipe.name}" have been added to your shopping list.`,
    });
  };

  // Export pantry to CSV for suggestions
  const handleGenerateSuggestions = async () => {
    if (!user || pantryItems.length === 0) {
      setNotification({
        open: true,
        title: "Cannot Generate",
        message: "Your pantry is empty. Add items first!",
      });
      return;
    }

    setIsGenerating(true);
    setAiRecipes([]);

    try {
      // Convert pantry items to CSV format
      const csvHeader = "food_name,quantity,unit,food_category";
      const csvRows = pantryItems.map((item) => {
        const categoryMap = {
          protein: "Proteins",
          dairy: "Dairy",
          grain: "Grains",
          fruit: "Fruits",
          vegetable: "Vegetables",
          other: "Other",
        };
        const category = categoryMap[item.category] || "Other";
        return `${item.name},${item.quantity},${item.unit || "null"},${category}`;
      });
      const pantryCSV = [csvHeader, ...csvRows].join("\n");

      // Call the backend API
      const result = await recipeApi.getSuggestions(pantryCSV);

      if (result.success && result.recipes) {
        // Transform recipes to match the display format
        const transformedRecipes = result.recipes.map((recipe) => ({
          id: recipe.id,
          name: recipe.recipe_title || "AI Suggested Recipe",
          description: recipe.description || "",
          source: recipe.source || "AI Suggested",
          sourceUrl: recipe.sourceUrl || "",
          prepTime: recipe.prep_time_minutes || 15,
          cookTime: recipe.cook_time_minutes || 30,
          servings: recipe.servings || 4,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
        }));
        setAiRecipes(transformedRecipes);
        setNotification({
          open: true,
          title: "Suggestions Generated!",
          message: `Found ${transformedRecipes.length} recipe suggestions based on your pantry.`,
        });
      } else {
        setNotification({
          open: true,
          title: "Generation Failed",
          message: result.error || "Failed to generate suggestions",
        });
      }
    } catch (err) {
      console.error("Suggestion generation error:", err);
      setNotification({
        open: true,
        title: "Generation Failed",
        message:
          "Failed to generate suggestions. Make sure the backend server is running.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
          <p className="text-muted-foreground">
            Personalized recommendations based on your pantry
          </p>
        </div>
        <Button
          onClick={handleGenerateSuggestions}
          disabled={loading || pantryItems.length === 0 || isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate AI Suggestions
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {notification.open && (
        <Card
          className={
            notification.title.includes("Failed")
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={
                    notification.title.includes("Failed")
                      ? "font-semibold text-red-800"
                      : "font-semibold text-green-800"
                  }
                >
                  {notification.title}
                </p>
                <p
                  className={
                    notification.title.includes("Failed")
                      ? "text-sm text-red-700 mt-1"
                      : "text-sm text-green-700 mt-1"
                  }
                >
                  {notification.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setNotification({ ...notification, open: false })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Loading your pantry...
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && pantryItems.length === 0 && !error && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              Your pantry is empty. Add items to see recipe suggestions!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expiring Items Alert */}
      {expiringItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertCircle className="h-5 w-5" />
              Use These Soon!
            </CardTitle>
            <CardDescription className="text-orange-500">
              These items are expiring within 3 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expiringItems.map((item) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="text-orange-500 border-orange-300"
                >
                  {item.name} - Expires{" "}
                  {new Date(item.expiryDate).toLocaleDateString()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generated Recipes */}
      {isGenerating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Generating personalized recipes...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take a moment
            </p>
          </div>
        </div>
      )}

      {!isGenerating && aiRecipes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Recipes for Your Pantry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiRecipes.map((recipe) => (
              <Card key={recipe.id} className="flex flex-col border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 text-xs"
                    >
                      AI Generated
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {recipe.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {recipe.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Ingredients ({recipe.ingredients.length})
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {recipe.ingredients.slice(0, 4).map((ing, i) => (
                        <li key={i} className="truncate">
                          • {ing.quantity} {ing.unit} {ing.name}
                        </li>
                      ))}
                      {recipe.ingredients.length > 4 && (
                        <li className="text-xs text-primary">
                          +{recipe.ingredients.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    <ChefHat className="mr-1 h-4 w-4" />
                    View Recipe
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSaveRecipe(recipe)}
                  >
                    <BookOpen className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCookRecipe(recipe)}
                  >
                    <Flame className="mr-1 h-4 w-4" />
                    Cook Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Show when no AI recipes generated yet */}
      {!isGenerating && aiRecipes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">No recipes yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Click "Generate AI Suggestions" to get personalized recipes based
              on your pantry
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            💡 Tips to Reduce Food Waste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Cook meals using ingredients that are expiring soon</li>
            <li>
              • Freeze items before they go bad if you can't use them in time
            </li>
            <li>• Plan your meals around what's already in your pantry</li>
            <li>• Buy only what you need based on your meal plan</li>
          </ul>
        </CardContent>
      </Card>

      {/* Recipe Details Dialog */}
      <Dialog
        open={!!selectedRecipe}
        onOpenChange={() => setSelectedRecipe(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedRecipe.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedRecipe.prepTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedRecipe.servings} servings
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => {
                      const inPantry = pantryItems.find(
                        (item) =>
                          item.name
                            .toLowerCase()
                            .includes(ingredient.name.toLowerCase()) ||
                          ingredient.name
                            .toLowerCase()
                            .includes(item.name.toLowerCase()),
                      );

                      return (
                        <li key={index} className="flex items-center gap-2">
                          {inPantry ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {ingredient.quantity} {ingredient.unit}{" "}
                            {ingredient.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Add missing ingredients to shopping list button */}
                  {getMissingIngredients(selectedRecipe).length > 0 && (
                    <Button
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAddToShoppingList(selectedRecipe)}
                    >
                      🛒 Add missing items to shopping list
                    </Button>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  {Array.isArray(selectedRecipe.instructions) ? (
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0">
                            {instruction.step_number}
                          </span>
                          <p className="text-muted-foreground">
                            {instruction.instruction_text}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedRecipe.instructions}
                    </p>
                  )}
                </div>

                {/* Source Link */}
                {selectedRecipe.sourceUrl ? (
                  <div className="pt-4">
                    <a
                      href={selectedRecipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        View original recipe
                      </span>
                    </a>
                  </div>
                ) : (
                  <div className="pt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 w-fit">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      AI-generated recipe
                    </span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRecipe(null)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleSaveRecipe(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Save to My Recipes
                </Button>
                <Button
                  onClick={() => handleCookRecipe(selectedRecipe)}
                  disabled={getMissingIngredients(selectedRecipe).length > 0}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  Cook Now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cooking Mode Dialog */}
      <Dialog open={!!cookingRecipe} onOpenChange={closeCookingMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {cookingRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">
                      Cooking: {cookingRecipe.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {cookingRecipe.prepTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {cookingRecipe.servings} servings
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="steps" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                </TabsList>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Ingredients Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {cookingRecipe.ingredients.map((ingredient, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-lg">
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                                <span className="text-foreground">
                                  {ingredient.name}
                                </span>
                              </div>
                              {ingredient.preparation_notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {ingredient.preparation_notes}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Steps Tab */}
                <TabsContent value="steps" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Step {currentStep + 1} of{" "}
                          {cookingRecipe.instructions.length}
                        </CardTitle>
                        <div className="flex gap-1">
                          {cookingRecipe.instructions.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentStep(idx)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                idx === currentStep
                                  ? "bg-primary"
                                  : idx < currentStep
                                    ? "bg-green-500"
                                    : "bg-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[200px] flex flex-col">
                        {/* Progress bar */}
                        <div className="w-full bg-muted rounded-full h-2 mb-6">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${((currentStep + 1) / cookingRecipe.instructions.length) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Current step */}
                        <div className="flex-1 flex items-center justify-center p-6">
                          <div className="text-center max-w-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                              {
                                cookingRecipe.instructions[currentStep]
                                  .step_number
                              }
                            </div>
                            <p className="text-xl leading-relaxed">
                              {
                                cookingRecipe.instructions[currentStep]
                                  .instruction_text
                              }
                            </p>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t">
                          <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>

                          {currentStep <
                          cookingRecipe.instructions.length - 1 ? (
                            <Button onClick={nextStep}>
                              Next Step
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={finishCooking}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Finish Cooking
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Notification Dialog */}
      <Dialog
        open={notification.open}
        onOpenChange={(open) => setNotification({ ...notification, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl">
                {notification.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-center">
                {notification.message}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={() => setNotification({ ...notification, open: false })}
            >
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
