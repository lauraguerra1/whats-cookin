//IMPORTS 
import { getRandomUser } from "./users";
import { pageLoadRenders, hideSpinner } from "./domUpdates";
import { copyItem } from "./helper-functions";
import { populateTags } from './recipes';
// import { config } from "../config.js"

// DATA MODEL 
let currentUser;
let pageData = {
  currentView: 'our-recipes',
  currentRecipeCard: {},
  allTags: []
};

// API CALLS
const fetchUsers = () => fetch('http://localhost:3001/api/v1/users')
const fetchRecipes = () => fetch('http://localhost:3001/api/v1/recipes')
const fetchIngredients = () => fetch(`http://localhost:3001/api/v1/ingredients`)

const handleUserData = users => currentUser = getRandomUser(users)

const handleRecipeData = recipes => {
  pageData.allRecipes = recipes;
  pageData.recipesOfInterest = copyItem(pageData.allRecipes);
  pageData.allTags = populateTags(pageData.allRecipes);
  // getChatGPTRecipePitches(pageData.allRecipes);
  setTimeout(() => {
    hideSpinner();
    pageLoadRenders(pageData.allRecipes);
  }, 2000)

}

const handleIngredientData = ingredients => pageData.allIngredients = ingredients

const patchHits = (recipe) => {
  fetch('http://localhost:3001/api/v1/recipeHits', {
    method: 'PATCH',
    body: JSON.stringify({recipeID: recipe.id}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(() => {
      fetchRecipes()
        .then(res => res.json())
        .then(data => {
          pageData.allRecipes = data.recipes;
          console.log(pageData.allRecipes)
        })
    })
}

const loadData = () => {
  Promise.all([fetchUsers(), fetchRecipes(), fetchIngredients()])
    .then (responses => {
      responses.forEach(response => {
        if(response.ok) {
          response.json()
          .then (data => {
            const functions = {
              users: (users) => handleUserData(users), 
              recipes: (recipes) => handleRecipeData(recipes),
              ingredients: (ingredients) => handleIngredientData(ingredients)
            }
            const property = response.url.split('/').reverse()[0]
            functions[property](data[property])
          })
          .catch(err => console.error(err))
        } else {
          console.error(response.status)
        }
    })
  })   
}

const updateCurrentUser = (user) => {
  currentUser = user;
};

// Chat GPT Extension 

const getChatGPTRecipePitches = (allRecipes) => {
  const DEFAULT_PARAMS = {
    "model": "text-davinci-002",
    "temperature": 0.7,
    "max_tokens": 256,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0
  };

  const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + String(config.OPENAI_API_KEY),
        organization: 'org-47g2m7vnC6yUKCbIL0f7PSFb'
    },
  };

  allRecipes.forEach((recipe) => {
    DEFAULT_PARAMS["prompt"] = `In 10 words or less, give me an enticing pitch based on this recipe name: ${recipe.name}`;
    requestOptions.body = JSON.stringify(DEFAULT_PARAMS);

    fetch('https://api.openai.com/v1/completions', requestOptions)
        .then(response => response.json())
        .then(data => recipe.pitch = data.choices[0].text)
        .catch(error => console.error(error));
  });
}

export { currentUser, pageData, updateCurrentUser, loadData, patchHits };
