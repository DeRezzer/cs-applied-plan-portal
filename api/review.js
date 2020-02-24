// File: review.js
// Description: handles routing for reviews

require("path");
const express = require("express");
const app = express();

const enforceConstraints = require("../utils/reviewValidation").enforceConstraints;
const createReview = require("../models/review").createReview;
const {requireAuth} = require("../utils/auth");
const {
  reviewSchema,
  getSchemaViolations,
  sanitizeUsingSchema
} = require("../utils/schemaValidation");

// create a new review
app.post("/", requireAuth, async (req, res) => {

  try {

    // use schema validation to ensure valid request body
    const errorMessage = getSchemaViolations(req.body, reviewSchema);

    if (!errorMessage) {

      const sanitizedBody = sanitizeUsingSchema(req.body, reviewSchema);

      // get request body
      const planId = sanitizedBody.planId;
      const userId = req.auth.userId;
      const status = sanitizedBody.status;
      console.log("User", userId, "creating a review on plan", planId);

      // only save a review if it does not violate any constraints
      const violation = await enforceConstraints(planId, userId, status);
      if (violation === "valid") {

        const results = await createReview(planId, userId, status);
        console.log("201: Review created\n");
        res.status(201).send(results);

      } else {

        // send an error that explains the violated constraint
        console.error("400:", violation, "\n");
        res.status(400).send({error: violation});

      }

    } else {
      console.error("400:", errorMessage, "\n");
      res.status(400).send({error: errorMessage});
      return;
    }

  } catch (err) {
    console.error("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

module.exports = app;
