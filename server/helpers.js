import moment from "moment";
import nodeMailer from "nodemailer";
import twilio from "twilio";
import { config } from "./constants/configTwilio";
require("dotenv").config();

let client = new twilio(config.accountSid, config.authToken);

export const sendSMS = sendtTo => {
  client.messages.create(
    {
      to: "+1" + sendtTo,
      from: process.env.TWILIO_SENDER_PHONE,
      body:
        "Bonjour, vous avez reçu un message de Maître Harvey. Accèder à l'application Photo Ticket sur votre mobile afin de le consulter."
    },
    (err, res) => {
      if (err) console.log(`An error has ocurred: ${err}`);
      else console.log(`¡SMS Success! Date:${res.dateCreated} Id: ${res.sid}`);
    }
  );
};

export const lessThanOneHourAgo = timeActive => {
  if (!moment(timeActive).isValid()) return "danger"; // danger if not a date.
  if (
    moment(timeActive)
      .add(30, "minutes")
      .isBefore(/*now*/)
  ) {
    return true;
  } else return false;
};

export const sendEmail = id => {
  let transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "mLussier1936@gmail.com",
      pass: process.env.GMAIL_PASSWORD
    }
  });
  let mailOptions = {
    from: "<mLussier1936@gmail.com>", // sender address
    to: "<mLussier1936@gmail.com>", // list of receivers
    subject: "test", // Subject line
    text: `http://167.99.189.31/chat/rACgvtw3QI/ID=${id}` // plain text body
    // html: '<b>NodeJS Email Tutorial</b>' // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.end();
  });
};

export const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
};
