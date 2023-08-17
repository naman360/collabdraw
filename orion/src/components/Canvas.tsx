"use client";
import useOnDraw from "@/hooks/useOnDraw";
import {
    CanvasProps,
    DrawFunction,
    DrawType,
    OnDrawType,
    Point,
    ShapeData,
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
    isDrawLine,
    isEraser,
}) => {
    const freeHand = useRef<ShapeData[] | []>([]);
    const rectangles = useRef<ShapeData[] | []>([]);
    const ovals = useRef<ShapeData[] | []>([]);
    const lines = useRef<ShapeData[] | []>([]);

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
                drawFree(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "rect":
                drawRectangle(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "line":
                drawLine(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "oval":
                drawOval(point, endPoints!, ctx, brushColor, brushSize);
                break;
            case "erase":
                eraseCanvas(point, endPoints!, ctx, "#fff", brushSize);
                break;
        }
    };

    const drawAllShapes = (
        ctx: CanvasRenderingContext2D | null | undefined
    ) => {
        if (!ctx) return;
        ctx.clearRect(
            0,
            0,
            canvasRef.current?.width!,
            canvasRef.current?.height!
        );
        console.log(freeHand.current, ovals.current, rectangles.current);

        drawAllOvals(ctx, ovals.current);
        drawAllRectangles(ctx, rectangles.current);
        drawAllLines(ctx, lines.current);
        drawAllFreeHands(ctx, freeHand.current);
    };

    const eraseCanvas: DrawType = (start, end, ctx, color, brushSize) => {
        if (!ctx || !start) return;
        drawFree(start, end, ctx, color, brushSize);
    };
    const drawRectangle: DrawType = (start, end, ctx, color, width) => {
        if (ctx && start) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current?.width!,
                canvasRef.current?.height!
            );
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
        ctx.clearRect(
            0,
            0,
            canvasRef.current?.width!,
            canvasRef.current?.height!
        );
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
            lastRectangle?.drawPoints.start?.x === start.x &&
            lastRectangle?.drawPoints.start?.y === start.y
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

        drawAllShapes(ctx);
    };

    const handleOval: DrawType = (start, end, ctx, color, width) => {
        const allOvals = [...ovals.current];
        const lastOval =
            allOvals.length > 0 ? allOvals[allOvals.length - 1] : null;

        if (
            start &&
            lastOval?.drawPoints.start?.x === start.x &&
            lastOval?.drawPoints.start?.y === start.y
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
        drawAllShapes(ctx);
    };
    const handleLine: DrawType = (start, end, ctx, color, width) => {
        const allLines = [...lines.current];
        const lastOval =
            allLines.length > 0 ? allLines[allLines.length - 1] : null;

        if (
            start &&
            lastOval?.drawPoints.start?.x === start.x &&
            lastOval?.drawPoints.start?.y === start.y
        )
            // has an edge case with a very very low probability, if another rectangle gets started from the exact same position
            allLines.pop();
        if (start)
            allLines.push({
                drawPoints: { start, end },
                brushConfig: {
                    color,
                    size: width,
                },
            });
        lines.current = allLines;
        drawAllShapes(ctx);
    };

    const handleFreeHand: DrawType = (start, end, ctx, color, width) => {
        const freeHandData = [...freeHand.current];
        freeHandData.push({
            drawPoints: { start, end },
            brushConfig: {
                color,
                size: width,
            },
        });
        freeHand.current = freeHandData;
        drawAllShapes(ctx);
    };

    const drawAllOvals: DrawFunction = (ctx, allOvals) => {
        if (ctx) {
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

    const drawAllFreeHands: DrawFunction = (ctx, allFreeHand) => {
        if (ctx) {
            allFreeHand.forEach((freeHand) => {
                drawFree(
                    freeHand.drawPoints.start,
                    freeHand.drawPoints.end,
                    ctx,
                    freeHand.brushConfig.color,
                    freeHand.brushConfig.size
                );
            });
        }
    };

    const drawAllLines: DrawFunction = (ctx, allLines) => {
        if (ctx) {
            allLines.forEach((line) => {
                drawLine(
                    line.drawPoints.start,
                    line.drawPoints.end,
                    ctx,
                    line.brushConfig.color,
                    line.brushConfig.size
                );
            });
        }
    };
    const drawLine: DrawType = (start, end, ctx, color, width) => {
        if (ctx && end) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current?.width!,
                canvasRef.current?.height!
            );
            start = start ?? end;

            ctx.beginPath();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(start?.x, start?.y);
            ctx.stroke();
        }
    };

    const drawFree: DrawType = (start, end, ctx, color, width) => {
        if (ctx && end) {
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

    const [canvasRef, setCanvasref, primaryCanvasRef, setPrimaryCanvasRef] =
        useOnDraw(
            onDraw,
            socketRef,
            brushSize,
            brushColor,
            isDrawRect,
            isDrawOval,
            isDrawLine,
            isEraser
        );

    /**
     * 2 Canvases to be used ref(https://stackoverflow.com/questions/65425752/how-can-i-save-multiple-basic-shapes-drawn-on-the-same-canvas-with-preview-like)
     * 1. One for showing real time draw. (Secondary Canvas)
     * 2. Another for storing drawn shape. (Primary Canvas)
     */
    return (
        <>
            {/* Primary Canvas */}
            <canvas
                className="border-2 border-stone-950"
                width={width}
                height={height}
                ref={setPrimaryCanvasRef}
            />
            {/* Secondary Canvas */}
            <canvas
                className="border-2 border-stone-950"
                width={width}
                height={height}
                ref={setCanvasref}
            />
        </>
    );
};
export default Canvas;
