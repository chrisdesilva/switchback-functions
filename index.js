const functions = require("firebase-functions");
const express = require("express");
const app = express();
const auth = require("./utils/auth");

const { signup, login } = require("./handlers/users");
const {
  postNewEvent,
  getAllEvents,
  getEvent,
  commentOnEvent,
} = require("./handlers/events");

// user routes
app.post("/signup", signup);
app.post("/login", login);

// event routes
app.get("/events", getAllEvents);
app.post("/event", auth, postNewEvent);
app.get("/event/:eventId", getEvent);
app.post("/event/:eventId/comment", auth, commentOnEvent);

exports.api = functions.https.onRequest(app);
