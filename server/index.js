import bodyParser from "body-parser";
import express from "express";
import path from "path";
import firebase from "firebase-admin";
import { stripe } from "./constants/stripe";
import { configureServer } from "./configureServer";
import { SERVER_CONFIGS } from "./constants/server";
import {
  sendSMS,
  lessThanOneHourAgo,
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
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve front-end code
app.use("/", express.static(path.join(__dirname, "../build")));

// Routes
app.post("/api/google-ocr", async function(req, res) {
  const googleAPIKey = process.env.GOOGLE_VISION_KEY;
  console.log("google ocr");
  return await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${googleAPIKey}`,
    {
      requests: [
        {
          image: {
            content: req.image
          },
          features: [
            {
              type: "TEXT_DETECTION"
            }
          ]
        }
      ]
    }
  );
  res.end();
});

app.post("/api/send-email", async function(req, res) {
  let userRef = db.ref(`allUsers/${req.body.id}`);
  let snapShot = await userRef.once("value");
  let lastTimeOnline = snapShot.val().lastOnline;

  if (lessThanOneHourAgo(lastTimeOnline)) {
    console.log(
      "user last activity was more than an hour ago, message was sent"
    );
    sendEmail(req.body.id);
  } else if (!lessThanOneHourAgo(lastTimeOnline)) {
    console.log(
      "user last activity was less than an hour ago, message wasn't sent"
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
    message: "Hello Stripe checkout server!",
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
