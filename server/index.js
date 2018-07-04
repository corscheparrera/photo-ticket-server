import bodyParser from "body-parser";
import express from "express";
import firebase from "firebase-admin";
const stripe = require("./constants/stripe");
const configureServer = require("./server");
const SERVER_CONFIGS = require("./constants/server");
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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.post("/google-ocr", async function(req, res) {
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

app.post("/send-email", async function(req, res) {
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

app.post("/send-sms", async function(req, res) {
  let userRef = db.ref(`allUsers/${req.body.id}`);
  let snapShot = await userRef.once("value");
  let phoneNumber = snapShot.val().phoneNumber;
  console.log(phoneNumber);
  sendSMS(phoneNumber);
});

app.get("/charge", (req, res) => {
  res.send({
    message: "Hello Stripe checkout server!",
    timestamp: new Date().toISOString()
  });
});

app.post("/charge", (req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
});

app.listen(SERVER_CONFIGS.PORT, error => {
  if (error) throw error;
  console.log("Server running on port: " + SERVER_CONFIGS.PORT);
});
