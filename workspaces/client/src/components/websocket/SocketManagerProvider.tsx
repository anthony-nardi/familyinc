import SocketManager from "@components/websocket/SocketManager";
import useAppState from "@hooks/useAppState";
import React, { createContext, useEffect } from "react";

const socketManager = new SocketManager();

export const SocketManagerContext = createContext<SocketManager>(socketManager);

type ProviderProps = {
  children: React.ReactNode;
};

export function SocketManagerProvider({
  children,
}: ProviderProps): React.JSX.Element {
  const { setSocketState } = useAppState();

  useEffect(() => {
    socketManager.setSocketState = setSocketState;
  }, [setSocketState]);

  return (
    <SocketManagerContext.Provider value={socketManager}>
      {children}
    </SocketManagerContext.Provider>
  );
}
