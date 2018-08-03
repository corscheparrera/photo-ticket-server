import bodyParser from "body-parser";
import axios from "axios";
import express from "express";
import path from "path";
import firebase from "firebase-admin";
import { stripe } from "./constants/stripe";
import { configureServer } from "./configureServer";
import { SERVER_CONFIGS } from "./constants/server";
import {
  sendSMS,
  lessThan30MinAgo,
  sendEmail,
  postStripeCharge
} from "./helpers";

require("dotenv").config();

let serviceAccount = require("../firebaseServiceAccountKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://photo-ticket-app.firebaseio.com/"
});
let db = firebase.database();

const app = express();

configureServer(app);

// Middlewares

// parse application/x-www-form-urlencoded

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// Serve front-end code
app.use("/", express.static(path.join(__dirname, "../build")));

// Routes
app.get("/api/google-ocr", (req, res) => {
  res.send({
    message: "Hello Google OCR",
    timestamp: new Date().toISOString()
  });
});
app.post("/api/google-ocr", async function(req, res) {
  const googleAPIKey = process.env.GOOGLE_VISION_KEY;
  console.log("google ocr starting");
  return await axios
    .post(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleAPIKey}`,
      {
        requests: [
          {
            image: {
              source: {
                imageUri: req.body.linkToImg
              }
            },
            features: [
              {
                type: "TEXT_DETECTION"
              }
            ]
          }
        ]
      }
    )
    .then(resp => {
      res.send(resp.data);
    })
    .catch(err => {
      console.log(err);
    });
  res.end();
});

app.post("/api/send-email", async function(req, res) {
  let userRef = db.ref(`allUsers/${req.body.id}`);
  let snapShot = await userRef.once("value");
  let lastTimeOnline = snapShot.val().lastOnline;

  if (lessThan30MinAgo(lastTimeOnline) || !lastTimeOnline) {
    console.log(
      "user last activity was more than 30 min ago, message was sent"
    );
    sendEmail(req.body.id);
  } else if (!lessThan30MinAgo(lastTimeOnline)) {
    console.log(
      "user last activity was less than 30 min ago, message wasn't sent"
    );
    return res.end();
  }
});

app.post("/api/send-sms", async function(req, res) {
  let userRef = db.ref(`allUsers/${req.body.id}`);
  let snapShot = await userRef.once("value");
  let phoneNumber = snapShot.val().phoneNumber;
  console.log(phoneNumber);
  sendSMS(phoneNumber);
});

app.get("/api/charge", (req, res) => {
  res.send({
    message: "Hello Stripe checkout route!",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/charge", (req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
});

app.listen(SERVER_CONFIGS.PORT, error => {
  if (error) throw error;
  console.log("Server running on port: " + SERVER_CONFIGS.PORT);
});

// Always return the main index.html, so react-router render the route in the client
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});
