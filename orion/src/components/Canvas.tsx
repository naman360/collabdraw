"use client";
import useOnDraw from "@/hooks/useOnDraw";
import { CanvasProps, OnDrawType } from "@/types";
import { FC } from "react";

const Canvas: FC<CanvasProps> = ({ width, height }) => {
    const onDraw: OnDrawType = (ctx, point) => {
        if (ctx && point) {
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    const setCanvasref = useOnDraw(onDraw);

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
