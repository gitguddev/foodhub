import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_ADDRESS = "ws://192.168.1.32:5000";

function useOrder(restaurant_id, handler) {
  const [socket] = useState(
    io(SOCKET_ADDRESS, {
      query: {
        method: "manager",
        restaurant_id,
      },
    })
  );
  const [connected, setState] = useState(false);

  useEffect(() => {
    socket.open();
    socket.on("order", handler);
    socket.on("connect", () => setState(true));
    socket.on("disconnect", () => setState(false));
    socket.on("connect_error", () => setState(false));
    return () => {
      socket.close();
    };
  }, []);

  return { socket, connected };
}

function useUpdate(handler) {
  const [socket] = useState(
    io(SOCKET_ADDRESS, {
      query: {
        method: "restaurant",
        authentication: window.localStorage.getItem("auth"),
      },
    })
  );
  const [connected, setState] = useState(false);

  useEffect(() => {
    socket.open();
    socket.on("update", handler);
    socket.on("connect", () => setState(true));
    socket.on("disconnect", () => setState(false));
    socket.on("connect_error", () => setState(false));
    return () => {
      socket.close();
    };
  }, []);

  return { socket, connected };
}

export { useOrder, useUpdate };
