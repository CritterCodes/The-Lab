import { Client } from "square";

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN, // Add this to your .env
  environment: process.env.SQUARE_ENVIRONMENT,
});

export default squareClient;
