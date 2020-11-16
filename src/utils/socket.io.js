import { useEffect } from "react";
import io from "socket.io-client";

const SOCKET_ADDRESS = "ws://localhost:5000";

const socket = io(SOCKET_ADDRESS);

function useOrder(restaurant_id, handler) {
  useEffect(() => {
    socket.emit("join", restaurant_id);
    socket.on("order", handler);

    return () => {
      socket.emit("leave", restaurant_id);
    };
  }, [handler, restaurant_id]);

  return socket;
}

export { useOrder };
