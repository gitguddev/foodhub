import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SOCKET_ADDRESS as SOCKET_ADDRESSES, SOCKET_PROTOCOL, SOCKET_PORT } from "./config";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const SOCKET_ADDRESS = `${SOCKET_PROTOCOL}://${SOCKET_ADDRESSES}:${SOCKET_PORT}`;

function createSocket(currentUser) {
  let socket;
  if (currentUser) {
    socket = io(SOCKET_ADDRESS, {
      query: {
        method: "manager",
        uid: currentUser.uid,
      },
    });
  } else {
    socket = io(SOCKET_ADDRESS, {
      query: {
        method: "restaurant",
        authentication: window.localStorage.getItem("auth"),
      },
    });
  }

  return socket;
}

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
  }, [handler, socket]);

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
  }, [handler, socket]);

  return { socket, connected };
}

export { useOrder, useUpdate, createSocket };
