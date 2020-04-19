const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./utils/auth");

app.use(cors());

const {
  signup,
  login,
  addUserProfile,
  getUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");
const {
  postNewEvent,
  getAllEvents,
  getEvent,
  commentOnEvent,
  deleteEvent,
  deleteComment,
} = require("./handlers/events");

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user", auth, addUserProfile);
app.get("/user/:username", getUserDetails);
app.get("/user", auth, getAuthenticatedUser);

// event routes
app.get("/events", getAllEvents);
app.post("/event", auth, postNewEvent);
app.get("/event/:eventId", getEvent);
app.post("/event/:eventId/comment", auth, commentOnEvent);
app.delete("/event/:eventId", auth, deleteEvent);
app.delete("/comment/:commentId", auth, deleteComment);

exports.api = functions.https.onRequest(app);
