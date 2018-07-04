const path = require("path");

const SERVER_PORT = 5000;

export const SERVER_CONFIGS = {
  PRODUCTION: process.env.NODE_ENV === "production",
  PORT: process.env.PORT || SERVER_PORT
};
