const { db } = require("../utils/admin");

exports.getAllEvents = (req, res) => {
  db.collection("events")
    .orderBy("dateTime", "desc")
    .get()
    .then((data) => {
      let events = [];
      data.forEach((doc) => {
        events.push({
          eventId: doc.id,
          body: doc.data().body,
          username: doc.data().username,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
          dateTime: doc.data().dateTime,
          address: doc.data().address,
        });
      });
      return res.json(events);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postNewEvent = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Must not be empty" });
  }
  if (req.body.dateTime.trim() === "") {
    return res.status(400).json({ body: "Must not be empty" });
  }
  if (req.body.address.trim() === "") {
    return res.status(400).json({ body: "Must not be empty" });
  }

  const newEvent = {
    body: req.body.body,
    username: req.user.username,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
    dateTime: req.body.dateTime,
    address: req.body.address,
  };

  db.collection("events")
    .add(newEvent)
    .then((doc) => {
      const resEvent = newEvent;
      resEvent.eventId = doc.id;
      res.json(resEvent);
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

exports.getEvent = (req, res) => {
  let eventData = {};
  db.doc(`/events/${req.params.eventId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Event not found" });
      }
      eventData = doc.data();
      eventData.eventId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("eventId", "==", req.params.eventId)
        .get();
    })
    .then((data) => {
      eventData.comments = [];
      data.forEach((doc) => {
        eventData.comments.push(doc.data());
      });
      return res.json(eventData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnEvent = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    eventId: req.params.eventId,
    username: req.user.username,
    userImage: req.user.imageUrl,
  };

  db.doc(`/events/${req.params.eventId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Event not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};
