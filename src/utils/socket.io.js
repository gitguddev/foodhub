import { useEffect, useState } from "react";
import io from "socket.io-client";

const Socket_Address = "ws://localhost:5000";

function createSocket(restaurant_id) {
  const socket = io(Socket_Address, {
    query: {
      restaurant_id,
    },
  });

  return socket;
}

function useSocket(restaurant_id) {
  const [socket, socketUpdate] = useState();

  useEffect(() => {
    const socket = createSocket(restaurant_id);
    socketUpdate(socket);

    return () => {
      socket.disconnect();
      socketUpdate();
    };
  }, [restaurant_id]);

  return socket;
}

export { useSocket };
