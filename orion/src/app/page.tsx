"use client";
import Canvas from "@/components/Canvas";
import { FC, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const Home: FC = () => {
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [brushColor, setBrushColor] = useState<string>("#000");
    const [brushSize, setBrushSize] = useState<number>(5);
    const [drawRect, setDrawRect] = useState<boolean>(false);
    const [drawOval, setDrawOval] = useState<boolean>(false);
    const [isEraser, setIsEraser] = useState<boolean>(false);
    useEffect(() => {
        if (!socketState?.connected)
            setSocketState(io("http://localhost:5002"));
    }, []);

    return (
        <div className="h-screen p-2 w-full flex flex-column items-center">
            <div className="p-2 flex flex-col items-center justify-center bg-slate-200 border border-black rounded-lg h-3/4">
                <input
                    className="cursor-pointer"
                    type="color"
                    onChange={(e) => setBrushColor(e.target.value)}
                />
                <button
                    className={`${
                        drawRect && "border-2 border-black"
                    } bg-white mt-3 p-2`}
                    onClick={() => setDrawRect(!drawRect)}
                >
                    Rectangle
                </button>

                <button
                    className={`${
                        drawOval && "border-2 border-black"
                    } bg-white mt-3 p-2`}
                    onClick={() => setDrawOval(!drawOval)}
                >
                    Oval
                </button>
                <button
                    className={`${
                        isEraser && "border-2 border-black"
                    } bg-white mt-3 p-2`}
                    onClick={() => setIsEraser(!isEraser)}
                >
                    Eraser
                </button>

                <select
                    className="mt-3 cursor-pointer"
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                </select>
            </div>
            <div className="w-full flex items-center justify-center">
                <Canvas
                    isDrawRect={drawRect}
                    isDrawOval={drawOval}
                    isEraser={isEraser}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    socketRef={socketState}
                    width={700}
                    height={500}
                />
            </div>
        </div>
    );
};

export default Home;
