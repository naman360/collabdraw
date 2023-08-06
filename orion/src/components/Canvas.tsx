"use client";
import useOnDraw from "@/hooks/useOnDraw";
import {
    CanvasProps,
    DrawFunction,
    DrawRectangleType,
    DrawType,
    OnDrawType,
    Point,
} from "@/types";
import { FC, useRef } from "react";

const Canvas: FC<CanvasProps> = ({
    width,
    height,
    socketRef,
    brushColor,
    brushSize,
    isDrawRect,
    isDrawOval,
    isEraser,
}) => {
    const rectangles = useRef<
        | {
              drawPoints: { start: Point; end: Point };
              brushConfig: {
                  color: string;
                  size: number;
              };
          }[]
        | []
    >([]);

    const ovals = useRef<
        | {
              drawPoints: { start: Point; end: Point };
              brushConfig: {
                  color: string;
                  size: number;
              };
          }[]
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
            case "oval":
                handleOval(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "erase":
                eraseCanvas(point, endPoints!, ctx, "#fff", brushSize);
                break;
        }
    };
    const eraseCanvas: DrawType = (start, end, ctx, color, brushSize) => {
        if (!ctx || !start) return;
        drawLine(start, end, ctx, color, brushSize);
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

    const drawOval: DrawType = (start, end, ctx, color, width) => {
        if (!ctx) return;
        if (!start) return;
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y + (end.y - start.y) / 2);
        ctx.bezierCurveTo(
            start.x,
            start.y,
            end.x,
            start.y,
            end.x,
            start.y + (end.y - start.y) / 2
        );
        ctx.bezierCurveTo(
            end.x,
            end.y,
            start.x,
            end.y,
            start.x,
            start.y + (end.y - start.y) / 2
        );
        ctx.closePath();
        ctx.stroke();
    };
    const handleRectangle: DrawType = (start, end, ctx, color, width) => {
        const allRectangles = [...rectangles.current];
        const lastRectangle =
            allRectangles.length > 0
                ? allRectangles[allRectangles.length - 1]
                : null;

        if (
            start &&
            lastRectangle?.drawPoints.start.x === start.x &&
            lastRectangle?.drawPoints.start.y === start.y
        )
            // has an edge case with a very very low probability, if another rectangle gets started from the exact same position
            allRectangles.pop();
        if (start)
            allRectangles.push({
                drawPoints: { start, end },
                brushConfig: {
                    color,
                    size: width,
                },
            });
        rectangles.current = allRectangles;

        drawAllRectangles(ctx, allRectangles);
    };

    const handleOval: DrawType = (start, end, ctx, color, width) => {
        const allOvals = [...ovals.current];
        const lastOval =
            allOvals.length > 0 ? allOvals[allOvals.length - 1] : null;

        if (
            start &&
            lastOval?.drawPoints.start.x === start.x &&
            lastOval?.drawPoints.start.y === start.y
        )
            // has an edge case with a very very low probability, if another rectangle gets started from the exact same position
            allOvals.pop();
        if (start)
            allOvals.push({
                drawPoints: { start, end },
                brushConfig: {
                    color,
                    size: width,
                },
            });
        ovals.current = allOvals;
        drawAllOvals(ctx, allOvals);
    };

    const drawAllOvals: DrawFunction = (ctx, allOvals) => {
        if (ctx) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current?.width!,
                canvasRef.current?.height!
            );

            allOvals.forEach((oval) => {
                drawOval(
                    oval.drawPoints.start,
                    oval.drawPoints.end,
                    ctx,
                    oval.brushConfig.color,
                    oval.brushConfig.size
                );
            });
        }
    };

    const drawAllRectangles: DrawFunction = (ctx, allRectangles) => {
        if (ctx) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current?.width!,
                canvasRef.current?.height!
            );

            allRectangles.forEach((rect) => {
                drawRectangle(
                    rect.drawPoints.start,
                    rect.drawPoints.end,
                    ctx,
                    rect.brushConfig.color,
                    rect.brushConfig.size
                );
            });
        }
    };

    const drawLine: DrawType = (start, end, ctx, color, width) => {
        if (ctx && end) {
            console.log("drawline", start, end, ctx, color, width);
            start = start ?? end;

            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(start?.x, start?.y);
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
        isDrawRect,
        isDrawOval,
        isEraser
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
