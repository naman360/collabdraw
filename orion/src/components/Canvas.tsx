"use client";
import useOnDraw from "@/hooks/useOnDraw";
import { CanvasProps, DrawRectangleType, DrawType, OnDrawType } from "@/types";
import { FC, useRef } from "react";

const Canvas: FC<CanvasProps> = ({
    width,
    height,
    socketRef,
    brushColor,
    brushSize,
    isDrawRect,
}) => {
    const rectangles = useRef<
        | { start: { x: number; y: number }; end: { x: number; y: number } }[]
        | []
    >([]);

    const onDraw: OnDrawType = (
        ctx,
        point,
        endPoints,
        brushColor,
        brushSize,
        type
    ) => {
        switch (type) {
            case "free":
                drawLine(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "rect":
                handleRectangle(point, endPoints!, ctx, brushColor, brushSize);
                break;
        }
    };

    const drawRectangle: DrawType = (start, end, ctx, color, width) => {
        if (ctx && start) {
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            const rectWidth = end.x - start.x;
            const rectHeight = end.y - start.y;

            ctx.strokeRect(start.x, start.y, rectWidth, rectHeight);
        }
    };

    const handleRectangle: DrawType = (start, end, ctx, color, width) => {
        const allRectangles = [...rectangles.current];
        console.log(allRectangles);
        console.log(allRectangles);
        const lastRectangle =
            allRectangles.length > 0
                ? allRectangles[allRectangles.length - 1]
                : null;

        if (
            start &&
            lastRectangle?.start.x === start.x &&
            lastRectangle?.start.y === start.y
        )
            // has an edge case with a very very low probability, if another rectangle gets started from the exact same position
            allRectangles.pop();
        if (start) allRectangles.push({ start, end });
        rectangles.current = allRectangles;

        drawAllRectangles(ctx, color, width, allRectangles);
    };

    const drawAllRectangles: DrawRectangleType = (
        ctx,
        color,
        width,
        allRectangles
    ) => {
        if (ctx) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current?.width!,
                canvasRef.current?.height!
            );

            allRectangles.forEach((rect) => {
                drawRectangle(rect.start, rect.end, ctx, color, width);
            });
        }
    };

    const drawLine: DrawType = (start, end, ctx, color, width) => {
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

    const [canvasRef, setCanvasref] = useOnDraw(
        onDraw,
        socketRef,
        brushSize,
        brushColor,
        isDrawRect
    );

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
