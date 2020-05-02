const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./utils/auth");
const { db } = require("./utils/admin");

app.use(cors());

const {
  signup,
  login,
  addUserProfile,
  getUserDetails,
  getAuthenticatedUser,
  uploadProfilePicture,
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
app.post("/user/image", auth, uploadProfilePicture);

// event routes
app.get("/events", getAllEvents);
app.post("/event", auth, postNewEvent);
app.get("/event/:eventId", getEvent);
app.post("/event/:eventId/comment", auth, commentOnEvent);
app.delete("/event/:eventId", auth, deleteEvent);
app.delete("/comment/:commentId", auth, deleteComment);

exports.api = functions.https.onRequest(app);

exports.onProfilePictureChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate((change) => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      let batch = db.batch();
      return db
        .collection("comments")
        .where("username", "==", change.before.data().username)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const comment = db.doc(`/comments/${doc.id}`);
            batch.update(comment, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });
