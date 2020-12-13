const SERVER_ADDRESS = "192.168.1.124";
const PROTOCOL = "https";
const PORT = process.env.NODE_ENV === "production" ? 5050 : 3000;

export { SERVER_ADDRESS, PROTOCOL, PORT };
