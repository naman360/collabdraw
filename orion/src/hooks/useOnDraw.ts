"use client";

import { CanvasRefToVoid, OnDrawType, ReturnVoid } from "@/types";
import { FC, useRef } from "react";

const useOnDraw = (onDraw: OnDrawType): CanvasRefToVoid => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    function setCanvasRef(ref: HTMLCanvasElement) {
        if (!ref) return;
        canvasRef.current = ref;
        initMouseMoveListener();
    }

    function initMouseMoveListener() {
        const mouseMoveListener = (e: MouseEvent) => {
            const point = computePointsToDraw(e.clientX, e.clientY);
            const ctx = canvasRef.current?.getContext("2d");
            if (onDraw) onDraw(ctx, point);
        };
        canvasRef.current?.addEventListener("mousemove", mouseMoveListener);
    }
    function computePointsToDraw(clientX: number, clientY: number) {
        if (canvasRef.current) {
            const boundingRect = canvasRef.current.getBoundingClientRect();
            return {
                x: clientX - boundingRect.left,
                y: clientY - boundingRect.top,
            };
        }
        return null;
    }
    return setCanvasRef;
};
export default useOnDraw;
