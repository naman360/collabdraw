"use client";
import Canvas from "@/components/Canvas";
import RoomModal from "@/components/RoomModal";
import { FC, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const Home: FC = () => {
    const [socketState, setSocketState] = useState<Socket | null>(null);
    const [brushColor, setBrushColor] = useState<string>("#000");
    const [brushSize, setBrushSize] = useState<number>(5);
    const [drawRect, setDrawRect] = useState<boolean>(false);
    const [drawOval, setDrawOval] = useState<boolean>(false);
    const [drawLine, setDrawLine] = useState<boolean>(false);
    const [isWrite, setIsWrite] = useState<boolean>(false);
    const [isEraser, setIsEraser] = useState<boolean>(false);
    const [isJoined, setIsJoined] = useState(false);
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        if (!socketState?.connected)
            setSocketState(io("http://localhost:5002"));
    }, []);

    const handleTool = (type: string) => {
        switch (type) {
            case "rect":
                setDrawRect(!drawRect);
                setDrawOval(false);
                setIsEraser(false);
                setIsWrite(false);
                setDrawLine(false);
                break;
            case "oval":
                setDrawOval(!drawOval);
                setIsEraser(false);
                setDrawRect(false);
                setIsWrite(false);
                setDrawLine(false);
                break;
            case "line":
                setDrawLine(!drawLine);
                setIsEraser(false);
                setDrawRect(false);
                setDrawOval(false);
                setIsWrite(false);
                break;
            case "erase":
                setIsEraser(!isEraser);
                setDrawRect(false);
                setIsWrite(false);
                setDrawOval(false);
                setDrawLine(false);
                break;
            case "write":
                setIsWrite(!isWrite);
                setIsEraser(false);
                setDrawRect(false);
                setDrawOval(false);
                setDrawLine(false);

                break;
        }
    };
    return (
        <>
            {isJoined ? (
                <h3 className="flex flex-col justify-center items-center mb-4">
                    Room Id: {roomId}
                </h3>
            ) : (
                <RoomModal
                    socketRef={socketState}
                    setIsJoined={setIsJoined}
                    roomId={roomId}
                    setRoomId={setRoomId}
                />
            )}
            {isJoined && (
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
                            onClick={() => handleTool("rect")}
                        >
                            Rectangle
                        </button>

                        <button
                            className={`${
                                drawOval && "border-2 border-black"
                            } bg-white mt-3 p-2`}
                            onClick={() => handleTool("oval")}
                        >
                            Oval
                        </button>
                        <button
                            className={`${
                                drawLine && "border-2 border-black"
                            } bg-white mt-3 p-2`}
                            onClick={() => handleTool("line")}
                        >
                            Line
                        </button>
                        <button
                            className={`${
                                isEraser && "border-2 border-black"
                            } bg-white mt-3 p-2`}
                            onClick={() => handleTool("erase")}
                        >
                            Eraser
                        </button>

                        <button
                            className={`${
                                isWrite && "border-2 border-black"
                            } bg-white mt-3 p-2`}
                            onClick={() => handleTool("write")}
                        >
                            Text
                        </button>

                        <select
                            className="mt-3 cursor-pointer"
                            onChange={(e) =>
                                setBrushSize(parseInt(e.target.value))
                            }
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
                            roomId={roomId}
                            isDrawRect={drawRect}
                            isDrawOval={drawOval}
                            isEraser={isEraser}
                            isDrawLine={drawLine}
                            isText={isWrite}
                            brushColor={brushColor}
                            brushSize={brushSize}
                            socketRef={socketState}
                            width={700}
                            height={500}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;
