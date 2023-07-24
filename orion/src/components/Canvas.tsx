"use client";
import useOnDraw from "@/hooks/useOnDraw";
import { CanvasProps, DrawLineType, OnDrawType } from "@/types";
import { FC, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

const Canvas: FC<CanvasProps> = ({ width, height, socketRef }) => {
    const onDraw: OnDrawType = (ctx, point, prevPoint) => {
        drawLine(point, prevPoint!, ctx, "#000", 5);
    };

    const drawLine: DrawLineType = (start, end, ctx, color, width) => {
        if (ctx) {
            start = start ?? end;
            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end?.x, end?.y);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    const setCanvasref = useOnDraw(onDraw, socketRef);

    return (
        <canvas
            className="border-2 border-stone-950"
            width={width}
            height={height}
            ref={setCanvasref}
        />
    );
};
export default Canvas;
