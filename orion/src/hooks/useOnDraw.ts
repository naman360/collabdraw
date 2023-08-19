"use client";

import { MouseEventListeners, OnDrawType, Point } from "@/types";
import { RefCallback, RefObject, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

const useOnDraw = (
    onDraw: OnDrawType,
    socketRef: Socket | null,
    brushSize: number,
    brushColor: string,
    isDrawRect: boolean,
    isDrawOval: boolean,
    isDrawLine: boolean,
    isEraser: boolean
): [
    RefObject<HTMLCanvasElement>,
    RefCallback<HTMLCanvasElement>,
    RefCallback<HTMLCanvasElement>
] => {
    // Canvas refs
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const primaryCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Tools Ref
    const isDrawingRef = useRef<boolean>(false);
    const isDrawRectRef = useRef<boolean>(false);
    const isDrawOvalRef = useRef<boolean>(false);
    const isDrawLineRef = useRef<boolean>(false);
    const isEraserRef = useRef<boolean>(false);

    // Mouse event refs
    const mouseMoveListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseUpListenerRef = useRef<MouseEventListeners | null>(null);
    const mouseDownListenerRef = useRef<MouseEventListeners | null>(null);

    // Misc refs
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
            brushConfig: {
                color: string;
                size: number;
            };
        }
    ) {
        switch (object.type) {
            case "free":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.prevPoint,
                    object.brushConfig.color,
                    object.brushConfig.size,
                    "free"
                );
                break;
            case "rect":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.endPoints,
                    object.brushConfig.color,
                    object.brushConfig.size,
                    "rect"
                );
                break;
            case "oval":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.endPoints,
                    object.brushConfig.color,
                    object.brushConfig.size,
                    "oval"
                );
                break;
            case "line":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.endPoints,
                    object.brushConfig.color,
                    object.brushConfig.size,
                    "line"
                );
                break;
            case "erase":
                onDraw(
                    ctx,
                    object.data.point,
                    object.data.prevPoint,
                    object.brushConfig.color,
                    object.brushConfig.size,
                    "erase"
                );
                break;
        }

        let mainCtx = primaryCanvasRef.current?.getContext("2d");
        socketRef?.on("mouse-up", (conn) => {
            if (conn.mouseUp) mainCtx?.drawImage(canvasRef.current!, 0, 0);
        });
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

    function setPrimaryCanvasRef(ref: HTMLCanvasElement) {
        if (!ref) return;
        primaryCanvasRef.current = ref;
        setCanvasStyles();
    }

    function sendDataToConnections(
        type: string,
        point: Point | null,
        endPoints: Point | null,
        color: string,
        size: number
    ) {
        if (!timeoutRef.current) clearTimeout(timeoutRef.current!);
        timeoutRef.current = setTimeout(() => {
            socketRef?.emit("canvas-data", {
                type,
                data: { point, prevPoint: prevPointRef.current, endPoints },
                brushConfig: {
                    color,
                    size,
                },
            });
        }, 20);
    }

    function handleDrawing(
        ctx: CanvasRenderingContext2D | null | undefined,
        startPoint: Point | null,
        endPoint: Point | null,
        drawType: string
    ) {
        if (onDraw) {
            onDraw(
                ctx,
                startPoint,
                endPoint,
                brushColorRef.current,
                brushSizeRef.current,
                drawType
            );
            sendDataToConnections(
                drawType,
                startPoint,
                endPoint,
                brushColorRef.current,
                brushSizeRef.current
            );
        }
    }

    function initMouseMoveListener() {
        const mouseMoveListener = (e: MouseEvent) => {
            const ctx = canvasRef.current?.getContext("2d");
            const point = computePointsToDraw(e.clientX, e.clientY);

            if (isDrawingRef.current || isEraserRef.current) {
                console.log("first");
                const drawType = isDrawingRef.current ? "free" : "erase";
                handleDrawing(ctx, point, prevPointRef.current, drawType);
            } else if (
                isDrawRectRef.current ||
                isDrawOvalRef.current ||
                isDrawLineRef.current
            ) {
                console.log("second");
                const drawType = isDrawRectRef.current
                    ? "rect"
                    : isDrawOvalRef.current
                    ? "oval"
                    : "line";
                handleDrawing(ctx, mouseStartPoints.current, point, drawType);
            }

            prevPointRef.current = point;
        };
        mouseMoveListenerRef.current = mouseMoveListener;
        window.addEventListener("mousemove", mouseMoveListener);
    }

    function initMouseUpListener() {
        const mouseUpListener = () => {
            toggleTools(false, false, false, false, false);
            let mainctx = primaryCanvasRef.current?.getContext("2d");

            mainctx?.drawImage(canvasRef.current!, 0, 0);

            prevPointRef.current = null;
            socketRef?.emit("mouse-up", { mouseUp: true });
        };

        mouseUpListenerRef.current = mouseUpListener;
        window.addEventListener("mouseup", mouseUpListener);
    }

    /**
     *
     * @param isDrawing boolean
     * @param isDrawOval boolean
     * @param isDrawRect boolean
     * @param isDrawLine boolean
     * @param isEraser boolean
     */
    function toggleTools(
        isDrawing: boolean,
        isDrawOval: boolean,
        isDrawRect: boolean,
        isDrawLine: boolean,
        isEraser: boolean
    ) {
        isDrawingRef.current = isDrawing;
        isDrawOvalRef.current = isDrawOval;
        isDrawRectRef.current = isDrawRect;
        isDrawLineRef.current = isDrawLine;
        isEraserRef.current = isEraser;
    }

    function initMouseDownListener() {
        const mouseDownListener = (e: MouseEvent) => {
            mouseStartPoints.current = computePointsToDraw(
                e.clientX,
                e.clientY
            );

            if (isDrawRect) {
                toggleTools(false, false, true, false, false);
            } else if (isDrawOval) {
                toggleTools(false, true, false, false, false);
            } else if (isDrawLine) {
                toggleTools(false, false, false, true, false);
            } else if (isEraser) {
                toggleTools(false, false, false, false, true);
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

    return [canvasRef, setCanvasRef, setPrimaryCanvasRef];
};
export default useOnDraw;
