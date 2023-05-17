import { getIngredientProperty } from "./helper-functions"

const getInstructions = recipe => {
  return recipe.instructions.map(item => item.instruction)
}

const filterRecipes = (allRecipes, ...tags) => {
  let filteredRecipes = [];
  tags.forEach((tag) => {
    filteredRecipes.push(allRecipes.filter(recipe => {
      return recipe.tags.includes(tag);
    }));
  })
  
  console.log(filteredRecipes.flat());
  return filteredRecipes.flat();
}

const getIngredients = (recipe, ingredients) => {
  return recipe.ingredients.map(ingredient => getIngredientProperty(ingredient, ingredients, 'name'))
}

const calculateRecipeCost = (recipe, ingredients) => {
  const recipeIngredients = recipe.ingredients.map(ingredient => ({amount: ingredient.quantity.amount, costPerUnit: getIngredientProperty(ingredient, ingredients, 'estimatedCostInCents')}))
  const costInCents = recipeIngredients.reduce((totalCost, curr) => totalCost += (curr.amount * curr.costPerUnit), 0);
  return `$${(costInCents/100).toFixed(2)}`
}

export {
  getInstructions,
  filterRecipes,
  getIngredients,
  calculateRecipeCost
}
