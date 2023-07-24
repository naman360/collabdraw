"use client";
import Canvas from "@/components/Canvas";
import { FC, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const Home: FC = () => {
    const [socketState, setSocketState] = useState<Socket | null>(null);
    useEffect(() => {
        if (!socketState?.connected)
            setSocketState(io("http://localhost:5002"));
    }, []);

    return (
        <div className="h-screen w-full flex flex-column">
            <div className="flex items-center bg-slate-900">
                <input type="color" />
            </div>
            <div className="w-full flex items-center justify-center">
                <Canvas socketRef={socketState} width={700} height={500} />
            </div>
        </div>
    );
};

export default Home;
