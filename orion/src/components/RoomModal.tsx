"use client";

import { FC, useState } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const RoomModal: FC<{
    socketRef: Socket | null;
    setIsJoined: (state: boolean) => void;
}> = ({ socketRef, setIsJoined }) => {
    const [roomId, setRoomId] = useState("");
    const createRoom = () => {
        const roomId = uuidv4();
        socketRef?.emit("join_room", roomId);

        setIsJoined(true);
    };
    const joinRoom = () => {
        socketRef?.emit("join_room", roomId);
        setIsJoined(true);
    };
    return (
        <div className="flex justify-center items-center flex-col">
            <button className="border-2 px-4 py-2 mb-4" onClick={createRoom}>
                Create Room
            </button>
            <input
                className="border border-black mb-1"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="border-2 px-4 py-2 mb-4" onClick={joinRoom}>
                Join Room
            </button>
        </div>
    );
};
export default RoomModal;
