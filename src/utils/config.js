let SERVER_ADDRESS = "localhost";
let PROTOCOL = "http";

let API_ADDRESS = "localhost/foodhub_api";
let API_PROTOCOL = "http";

let SOCKET_ADDRESS = "localhost";
let SOCKET_PROTOCOL = "http";
let SOCKET_PORT = 5000;

if (process.env.NODE_ENV === "development") {
  SERVER_ADDRESS = "localhost";
  PROTOCOL = "http";

  API_ADDRESS = "localhost/foodhub_api";
  API_PROTOCOL = "http";

  SOCKET_ADDRESS = "localhost";
  SOCKET_PROTOCOL = "http";
  SOCKET_PORT = 5000;
} else {
  SERVER_ADDRESS = "35.247.129.108/foodhub_app";
  PROTOCOL = "http";

  API_ADDRESS = "35.247.129.108/foodhub_api";
  API_PROTOCOL = "http";

  SOCKET_ADDRESS = "35.247.129.108";
  SOCKET_PROTOCOL = "http";
  SOCKET_PORT = 5000;
}

export {
  SERVER_ADDRESS,
  PROTOCOL,
  API_ADDRESS,
  API_PROTOCOL,
  SOCKET_ADDRESS,
  SOCKET_PROTOCOL,
  SOCKET_PORT,
};
