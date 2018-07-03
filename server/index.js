import bodyParser from "body-parser";
import express from "express";
import nodeMailer from "nodemailer";
import firebase from "firebase-admin";

var serviceAccount = require("../serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://photo-ticket-app.firebaseio.com/"
});

const app = express();

const port = process.env.PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/google-ocr", async function(req, res) {
  const googleAPIKey = "AIzaSyCAzY_-ph4ukwBkvEbEcmKmTDXMZUIjw5k";
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
  let transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "mLussier1936@gmail.com",
      pass: "Pablo123"
    }
  });
  let mailOptions = {
    from: "<mLussier1936@gmail.com>", // sender address
    to: "<mLussier1936@gmail.com>", // list of receivers
    subject: "test", // Subject line
    text: `http://localhost:3000/${req.body.id}` // plain text body
    // html: '<b>NodeJS Email Tutorial</b>' // html body
  };

  const lessThanOneHourAgo = date => {
    const HOUR = 1000 * 60 * 60;
    let anHourAgo = Date.now() - HOUR;
    if (date > anHourAgo) {
      return true;
    } else return false;
  };

  let db = firebase.database();
  let userRef = db.ref(`allUsers/${req.body.id}`);
  let timeLastMessage = await userRef.once("value", function(snapshot) {
    return snapshot.val().lastOnline;
  });

  if (lessThanOneHourAgo(timeLastMessage)) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("message sent");
      res.end();
    });
  } else {
    return res.end();
  }
});

app.listen(port, err => {
  if (err) {
    console.error(err);
  }
  {
    console.log(`App listen to port ${port}`);
  }
});
