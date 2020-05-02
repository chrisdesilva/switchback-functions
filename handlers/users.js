const { admin, db } = require("../utils/admin");
const config = require("../utils/config");
const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require("../utils/validators");

// sign up for an account
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username,
    zipCode: req.body.zipCode,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors); // throw a client error if signup data returns invalid

  const noImg = "no-img.png"; // default user image

  let token, userId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId,
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already is use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

// login to an account
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    });
};

// add details after account has been created
exports.addUserProfile = (req, res) => {
  const { errors } = reduceUserDetails(req.body);

  if (errors) return res.status(400).json(errors);

  let userProfile = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.username}`)
    .update(userProfile)
    .then(() => {
      return res.json({ message: "Profile updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// get a user's details
exports.getUserDetails = (req, res) => {
  let userDetails = {};
  db.doc(`/users/${req.params.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userDetails = doc.data();
        return db
          .collection("events")
          .where("username", "==", req.params.username)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then((data) => {
      userDetails.events = []; // link user details to events they've created
      data.forEach((doc) => {
        userDetails.events.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          username: doc.data().username,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          eventId: doc.id,
        });
      });
      return res.json(userDetails);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// get auth details and notifications for user
exports.getAuthenticatedUser = (req, res) => {
  let userDetails = {};
  db.doc(`users/${req.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userDetails.credentials = doc.data();
        return db
          .collection("likes")
          .where("username", "==", req.user.username)
          .get();
      }
    })
    .then((data) => {
      userDetails.likes = [];
      data.forEach((doc) => {
        userDetails.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.username)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then((data) => {
      userDetails.notifications = [];
      data.forEach((doc) => {
        userDetails.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          eventId: doc.data().eventId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userDetails);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
