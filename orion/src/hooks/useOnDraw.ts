"use client";

import {
    CanvasRefToVoid,
    MouseEventListeners,
    OnDrawType,
    Point,
    ReturnVoid,
} from "@/types";
import { RefCallback, RefObject, useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";

const useOnDraw = (
    onDraw: OnDrawType,
    socketRef: Socket | null,
    brushSize: number,
    brushColor: string,
    isDrawRect: boolean
): [RefObject<HTMLCanvasElement>, RefCallback<HTMLCanvasElement>] => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef<boolean>(false);
    const isDrawRectRef = useRef<boolean>(false);
    const mouseMoveListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseUpListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseDownListenerRef = useRef<MouseEventListeners | null>(null);
    const prevPointRef = useRef<Point | null>(null);
    const brushSizeRef = useRef<number>(5);
    const brushColorRef = useRef<string>("#000");
    const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const mouseStartPoints = useRef<Point | null>({
        x: -1,
        y: -1,
    });

    useEffect(() => {
        brushColorRef.current = brushColor;
        brushSizeRef.current = brushSize;
    }, [brushColor, brushSize, isDrawRect]);
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

    function setCanvasStyles() {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = "crosshair";
        }
    }

    function drawReceivedDataOnCanvas(
        ctx: CanvasRenderingContext2D | null | undefined,
        object: {
            type: string;
            data: { point: Point; prevPoint: Point; endPoints: Point };
        }
    ) {
        switch (object.type) {
            case "free":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.prevPoint,
                    brushColorRef.current,
                    brushSizeRef.current,
                    "free"
                );
                break;
            case "rect":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.endPoints,
                    brushColorRef.current,
                    brushSizeRef.current,
                    "rect"
                );
                break;
        }
    }

    function setCanvasRef(ref: HTMLCanvasElement) {
        if (!ref) return;
        canvasRef.current = ref;
        setCanvasStyles();
        let ctx = canvasRef.current?.getContext("2d");

        socketRef?.on("canvas-data", (object) => {
            drawReceivedDataOnCanvas(ctx, object);
        });
        initMouseMoveListener();
        initMouseDownListener();
        initMouseUpListener();
    }

    function sendDataToConnections(
        type: string,
        point: Point | null,
        endPoints: Point | null
    ) {
        if (!timeoutRef.current) clearTimeout(timeoutRef.current!);
        timeoutRef.current = setTimeout(() => {
            socketRef?.emit("canvas-data", {
                type,
                data: { point, prevPoint: prevPointRef.current, endPoints },
            });
        }, 20);
    }

    function initMouseMoveListener() {
        const mouseMoveListener = (e: MouseEvent) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (isDrawingRef.current) {
                const point = computePointsToDraw(e.clientX, e.clientY);
                if (onDraw) {
                    onDraw(
                        ctx,
                        point,
                        prevPointRef.current,
                        brushColorRef.current,
                        brushSizeRef.current,
                        "free"
                    );
                    sendDataToConnections("free", point, null);
                }
                prevPointRef.current = point;
            } else if (isDrawRectRef.current) {
                const point = mouseStartPoints.current;
                const endPoints = computePointsToDraw(e.clientX, e.clientY);
                if (onDraw) {
                    onDraw(
                        ctx,
                        point,
                        endPoints,
                        brushColorRef.current,
                        brushSizeRef.current,
                        "rect"
                    );
                    sendDataToConnections("rect", point, endPoints);
                }
            }
        };
        mouseMoveListenerRef.current = mouseMoveListener;
        window.addEventListener("mousemove", mouseMoveListener);
    }

    function initMouseUpListener() {
        const mouseUpListener = () => {
            isDrawingRef.current = false;
            isDrawRectRef.current = false;

            prevPointRef.current = null;
        };
        mouseUpListenerRef.current = mouseUpListener;
        window.addEventListener("mouseup", mouseUpListener);
    }

    function initMouseDownListener() {
        const mouseDownListener = (e: MouseEvent) => {
            mouseStartPoints.current = computePointsToDraw(
                e.clientX,
                e.clientY
            );

            if (isDrawRect) {
                isDrawingRef.current = false;
                isDrawRectRef.current = true;
            } else {
                isDrawingRef.current = true;
            }
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
    return [canvasRef, setCanvasRef];
};
export default useOnDraw;
