const configureStripe = require("stripe");
require("dotenv").config();

const STRIPE_SECRET_KEY =
  process.env.NODE_ENV === "production"
    ? process.env.STRIPE_PRIVATE_KEY
    : process.env.STRIPE_PRIVATE_KEY;

const stripe = configureStripe(STRIPE_SECRET_KEY);

module.exports = stripe;
