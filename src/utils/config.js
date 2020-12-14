const SERVER_ADDRESS = "35.247.129.108/foodhub_app";
const PROTOCOL = "http";
const PORT = process.env.NODE_ENV === "production" ? 80 : 3000;

const API_ADDRESS = "35.247.129.108/foodhub_api";
const API_PROTOCOL = "http";

const SOCKET_ADDRESS = "35.247.129.108";
const SOCKET_PROTOCOL = "http";
const SOCKET_PORT = 5000;

export {
  SERVER_ADDRESS,
  PROTOCOL,
  API_ADDRESS,
  API_PROTOCOL,
  SOCKET_ADDRESS,
  SOCKET_PROTOCOL,
  SOCKET_PORT,
  PORT,
};
