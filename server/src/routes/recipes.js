import express from "express";
import mongoose from "mongoose";
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "./user.js";

const router = express.Router();

// Get all recipes
router.get("/", async (req, res) => {
  try {
    const result = await RecipesModel.find({});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new recipe
router.post("/", verifyToken, async (req, res) => {
  try {
    const recipe = await RecipesModel.create(req.body);
    res.status(201).json({
      createdRecipe: {
        name: recipe.name,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        _id: recipe._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a recipe by ID
router.get("/:recipeId", async (req, res) => {
  try {
    const result = await RecipesModel.findById(req.params.recipeId);
    if (!result) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save a Recipe
router.put("/", async (req, res) => {
  try {
    const user = await UserModel.findById(req.body.userID);
    const recipe = await RecipesModel.findById(req.body.recipeID);

    if (!user || !recipe) {
      return res.status(404).json({ error: "User or Recipe not found" });
    }

    user.savedRecipes.push(recipe);
    await user.save();
    res.status(201).json({ savedRecipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get ids of saved recipes
router.get("/savedRecipes/ids/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ savedRecipes: user.savedRecipes });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get saved recipes
router.get("/savedRecipes/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedRecipes = await RecipesModel.find({
      _id: { $in: user.savedRecipes },
    });

    res.status(200).json({ savedRecipes });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a recipe
router.put("/:recipeId", async (req, res) => {
  try {
    const updatedRecipe = await RecipesModel.findByIdAndUpdate(
      req.params.recipeId,
      { $set: req.body },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      updatedRecipe: {
        name: updatedRecipe.name,
        image: updatedRecipe.image,
        ingredients: updatedRecipe.ingredients,
        instructions: updatedRecipe.instructions,
        _id: updatedRecipe._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a recipe
router.delete("/:recipeId", async (req, res) => {
  try {
    const deletedRecipe = await RecipesModel.findByIdAndRemove(req.params.recipeId);

    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      deletedRecipe: {
        name: deletedRecipe.name,
        image: deletedRecipe.image,
        ingredients: deletedRecipe.ingredients,
        instructions: deletedRecipe.instructions,
        _id: deletedRecipe._id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { router as recipesRouter };
