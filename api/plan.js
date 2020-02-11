// File: plan.js
// Description: handles routing for plans

require("path");
const express = require("express");
const app = express();

const formatStringArray = require("../utils/format").formatStringArray;
const enforceConstraints = require("../utils/planValidation").enforceConstraints;
const patchEnforceConstraints = require("../utils/planValidation").patchEnforceConstraints;
const savePlan = require("../models/plan").savePlan;
const updatePlan = require("../models/plan").updatePlan;
const getPlan = require("../models/plan").getPlan;
const getPlansStatus = require("../models/plan").getPlansStatus;
const getPlans = require("../models/plan").getPlans;
const getPlanComments = require("../models/plan").getPlanComments;
const getPlanReviews = require("../models/plan").getPlanReviews;
const deletePlan = require("../models/plan").deletePlan;
const {
  planSchema,
  patchPlanSchema,
  getSchemaViolations,
  sanitizeUsingSchema
} = require("../utils/schemaValidation");

// submit a plan
app.post("/", async (req, res) => {
  try {

    // use schema validation to ensure valid request body
    const errorMessage = getSchemaViolations(req.body, planSchema);

    if (!errorMessage) {

      const sanitizedBody = sanitizeUsingSchema(req.body, planSchema);

      // get request body
      console.log("Submit a plan");
      const userId = sanitizedBody.userId;
      const planName = sanitizedBody.planName;
      const courses = formatStringArray(req.body.courses);

      // only save a plan if it does not violate any constraints
      const violation = await enforceConstraints(userId, courses);
      if (violation === "valid") {

        // save the plan
        const results = await savePlan(userId, planName, courses);
        console.log("201: Submited plan has been saved\n");
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

// update a plan
app.patch("/", async (req, res) => {
  try {

    // use schema validation to ensure valid request body
    const errorMessage = getSchemaViolations(req.body, patchPlanSchema);

    if (!errorMessage) {

      const sanitizedBody = sanitizeUsingSchema(req.body, patchPlanSchema);

      // get request body
      console.log("Update a plan");
      const planId = sanitizedBody.planId;

      let planName = 0;
      let courses = 0;

      if (req.body.planName !== undefined) {
        planName = sanitizedBody.planName;
      }
      if (req.body.courses !== undefined) {
        courses = formatStringArray(req.body.courses);
      }

      // only save a plan if it does not violate any constraints
      const violation = await patchEnforceConstraints(planId, courses);
      if (violation === "valid") {

        // save the plan
        const results = await updatePlan(planId, planName, courses);
        console.log("200: Plan has been updated\n");
        res.status(200).send({affectedRows: results});

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

// view a plan
app.get("/:planId", async (req, res) => {

  try {

    const planId = req.params.planId;
    console.log("View plan", planId);

    const results = await getPlan(planId);
    if (results[0].length === 0) {
      console.error("404: No plan found\n");
      res.status(404).send({error: "No plan found."});
    } else {
      console.log("200: Plan found\n");
      res.status(200).send(results);
    }

  } catch (err) {
    console.error("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

// get plans based on status and time
app.get("/status/:status/:created/:ascend", async (req, res) => {

  try {

    const status = req.params.status;
    const created = req.params.created;
    const ascend = req.params.ascend;
    console.log("Search plans by status");

    const results = await getPlansStatus(status, created, ascend);
    if (results.length === 0) {
      console.error("404: No plans found\n");
      res.status(404).send({error: "No plans found."});
    } else {
      console.log("200: Plan found\n");
      res.status(200).send({data: results});
    }

  } catch (err) {
    console.error("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

// get all plans for a user
app.get("/getAllPlans/:studentId", async (req, res) => {

  try {

    const studentId = req.params.studentId;
    console.log("View all plans", studentId);

    const results = await getPlans(studentId);
    if (results[0].length === 0) {
      console.error("404: No plans found\n");
      res.status(404).send({error: "No plans found."});
    } else {
      console.log("200: Plans found\n");
      res.status(200).send(results);
    }

  } catch (err) {
    console.error("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

// delete a plan
app.delete("/:planId", async (req, res) => {

  try {

    const planId = req.params.planId;
    console.log("Delete plan", planId);

    const results = await deletePlan(planId);
    if (results === 0) {
      console.error("404: No plan found\n");
      res.status(404).send({error: "Could not delete plan."});
    } else {
      console.log("202: Plan deleted\n");
      res.status(202).send({affectedRows: results});
    }

  } catch (err) {
    console.error("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

// get a plans comments
app.get("/:planId/comment", async (req, res) => {

  try {

    console.log("Get a plans comments");
    const planId = req.params.planId;

    const results = await getPlanComments(planId);
    if (results.length === 0) {
      console.error("404: No comments found\n");
      res.status(404).send({error: "No comments found."});
    } else {
      console.log("200: Comments found\n");
      res.status(200).send(results);
    }

  } catch (err) {
    console.log("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

// get a plans reviews
app.get("/:planId/review", async (req, res) => {

  try {

    console.log("Get a plans reviews");
    const planId = req.params.planId;

    const results = await getPlanReviews(planId);
    if (results.length === 0) {
      console.error("404: No reviews found\n");
      res.status(404).send({error: "No reviews found."});
    } else {
      console.log("200: Reviews found\n");
      res.status(200).send(results);
    }

  } catch (err) {
    console.log("500: An internal server error occurred\n Error:", err);
    res.status(500).send({error: "An internal server error occurred. Please try again later."});
  }

});

module.exports = app;
