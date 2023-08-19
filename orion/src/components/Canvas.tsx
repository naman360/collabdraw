"use client";
import useOnDraw from "@/hooks/useOnDraw";
import { CanvasProps, OnDrawType } from "@/types";
import {
    drawFree,
    drawLine,
    drawOval,
    drawRectangle,
    eraseCanvas,
} from "@/utils/canvas-functions";
import { FC } from "react";

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
                drawFree(
                    canvasRef,
                    point,
                    endPoints!,
                    ctx,
                    brushColor,
                    brushSize
                );
                break;
            case "rect":
                drawRectangle(
                    canvasRef,
                    point,
                    endPoints!,
                    ctx,
                    brushColor,
                    brushSize
                );
                break;
            case "line":
                drawLine(
                    canvasRef,
                    point,
                    endPoints!,
                    ctx,
                    brushColor,
                    brushSize
                );
                break;
            case "oval":
                drawOval(
                    canvasRef,
                    point,
                    endPoints!,
                    ctx,
                    brushColor,
                    brushSize
                );
                break;
            case "erase":
                eraseCanvas(
                    canvasRef,
                    point,
                    endPoints!,
                    ctx,
                    "#fff",
                    brushSize
                );
                break;
        }
    };

    const [canvasRef, setCanvasref, setPrimaryCanvasRef] = useOnDraw(
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
        <div className="relative">
            {/* Primary Canvas */}
            <canvas
                className="border-2 border-stone-950"
                width={width}
                height={height}
                ref={setPrimaryCanvasRef}
            />
            {/* Secondary Canvas */}
            <canvas
                className="border-2 border-stone-950 absolute top-0"
                width={width}
                height={height}
                ref={setCanvasref}
            />
        </div>
    );
};
export default Canvas;
