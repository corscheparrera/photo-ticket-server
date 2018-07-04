import moment from "moment";
import nodeMailer from "nodemailer";
import twilio from "twilio";
import config from "./config";
require("dotenv").config();

let client = new twilio(config.accountSid, config.authToken);

export const sendSMS = () => {
  client.messages.create(
    {
      to: "+18194460388",
      from: process.env.TWILIO_SENDER_PHONE,
      body:
        "Bonjour M. Lussier, vous avez reçu un message de Maître Harvey. Accèder à l'application Photo Ticket sur votre mobile afin de le consulter. Bonne journée"
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
      .add(60, "minutes")
      .isBefore(/*now*/)
  ) {
    return true;
  } else return false;
};

export const sendEmail = () => {
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
    text: `http://localhost:3000/${req.body.id}` // plain text body
    // html: '<b>NodeJS Email Tutorial</b>' // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.end();
  });
};