"use client";

import {
    CanvasRefToVoid,
    MouseEventListeners,
    OnDrawType,
    Point,
    ReturnVoid,
} from "@/types";
import { FC, RefCallback, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

const useOnDraw = (
    onDraw: OnDrawType,
    socketRef: Socket | null
): RefCallback<HTMLCanvasElement> => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef<boolean>(false);
    const mouseMoveListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseUpListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseDownListenerRef = useRef<MouseEventListeners | null>(null);
    const prevPointRef = useRef<Point | null>(null);
    useEffect(() => {
        return () => {
            if (mouseMoveListenerRef.current) {
                window.removeEventListener(
                    "mousemove",
                    mouseMoveListenerRef.current
                );
            }
            if (mouseUpListenerRef.current) {
                window.removeEventListener(
                    "mouseup",
                    mouseUpListenerRef.current
                );
            }
            if (mouseDownListenerRef.current) {
                window.removeEventListener(
                    "mousedown",
                    mouseDownListenerRef.current
                );
            }
        };
    }, []);

    function setCanvasRef(ref: HTMLCanvasElement) {
        if (!ref) return;
        canvasRef.current = ref;

        socketRef?.on("canvas-data", (data) => {
            let image = new Image();
            let ctx = canvasRef.current?.getContext("2d");
            image.onload = () => {
                ctx?.drawImage(image, 0, 0);
            };
            image.src = data;
        });
        initMouseMoveListener();
        initMouseDownListener();
        initMouseUpListener();
    }

    function initMouseMoveListener() {
        const mouseMoveListener = (e: MouseEvent) => {
            if (isDrawingRef.current) {
                const point = computePointsToDraw(e.clientX, e.clientY);
                const ctx = canvasRef.current?.getContext("2d");
                if (onDraw) {
                    onDraw(ctx, point, prevPointRef.current);

                    let base64ImageData =
                        canvasRef.current?.toDataURL("image/png");

                    socketRef?.emit("canvas-data", base64ImageData);
                }
                prevPointRef.current = point;
            }
        };
        mouseMoveListenerRef.current = mouseMoveListener;
        window.addEventListener("mousemove", mouseMoveListener);
    }

    function initMouseUpListener() {
        const mouseUpListener = () => {
            isDrawingRef.current = false;
            prevPointRef.current = null;
        };
        mouseUpListenerRef.current = mouseUpListener;
        window.addEventListener("mouseup", mouseUpListener);
    }

    function initMouseDownListener() {
        const mouseDownListener = () => {
            isDrawingRef.current = true;
        };
        mouseDownListenerRef.current = mouseDownListener;
        window.addEventListener("mousedown", mouseDownListener);
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
