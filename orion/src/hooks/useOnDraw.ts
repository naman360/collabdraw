"use client";

import { MouseEventListeners, OnDrawType, Point } from "@/types";
import { RefCallback, RefObject, useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

const useOnDraw = (
    roomId: string,
    onDraw: OnDrawType,
    socketRef: Socket | null,
    brushSize: number,
    brushColor: string,
    isText: boolean,
    isDrawRect: boolean,
    isDrawOval: boolean,
    isDrawLine: boolean,
    isEraser: boolean
): [
    RefObject<HTMLCanvasElement>,
    RefCallback<HTMLCanvasElement>,
    RefObject<HTMLCanvasElement>,
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
    const isTextRef = useRef<boolean>(false);

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
    }, [brushColor, brushSize]);

    /* This use effect is used to access states by updating refs in event handlers, 
    but in this case we want the tools ref to be true when mouse is down and false 
    otherwise, but to make tools ref true we would need access to the updated states 
    which we cant in event handlers */
    // useEffect(() => {
    //     isTextRef.current = isText;
    //     isDrawRectRef.current = isDrawRect;
    // }, [isText, isDrawRect]);

    /* This useeffect is used to reinitialize mouse event handlers to get updated state
     in event handlers, this solves problem listed in above comment  */
    useEffect(() => {
        function initMouseMoveListener(e: MouseEvent) {
            const ctx = canvasRef.current?.getContext("2d");
            const point = computePointsToDraw(e.clientX, e.clientY);

            if (isDrawingRef.current || isEraserRef.current) {
                const drawType = isDrawingRef.current ? "free" : "erase";
                handleDrawing(ctx, point, prevPointRef.current, drawType);
            } else if (
                isDrawRectRef.current ||
                isDrawOvalRef.current ||
                isDrawLineRef.current
            ) {
                const drawType = isDrawRectRef.current
                    ? "rect"
                    : isDrawOvalRef.current
                    ? "oval"
                    : "line";

                handleDrawing(ctx, mouseStartPoints.current, point, drawType);
            }

            prevPointRef.current = point;
        }

        function initMouseUpListener() {
            toggleTools(false, false, false, false, false, false);
            let mainctx = primaryCanvasRef.current?.getContext("2d");

            mainctx?.drawImage(canvasRef.current!, 0, 0);

            prevPointRef.current = null;
            socketRef?.emit("mouse-up", { mouseUp: true });
        }

        function initMouseDownListener(e: MouseEvent) {
            mouseStartPoints.current = computePointsToDraw(
                e.clientX,
                e.clientY
            );

            if (isDrawRect) {
                toggleTools(false, false, true, false, false, false);
            } else if (isDrawOval) {
                toggleTools(false, true, false, false, false, false);
            } else if (isDrawLine) {
                toggleTools(false, false, false, true, false, false);
            } else if (isEraser) {
                toggleTools(false, false, false, false, true, false);
            } else if (isText) {
                const ctx = canvasRef.current?.getContext("2d");
                toggleTools(false, false, false, false, false, true);
                if (isTextRef.current)
                    handleDrawing(ctx, mouseStartPoints.current, null, "text");
            } else {
                isDrawingRef.current = true;
            }
        }

        window.addEventListener("mousemove", initMouseMoveListener);
        window.addEventListener("mouseup", initMouseUpListener);
        canvasRef.current?.addEventListener("mousedown", initMouseDownListener);

        return () => {
            window.removeEventListener("mousemove", initMouseMoveListener);

            window.removeEventListener("mouseup", initMouseUpListener);

            canvasRef.current?.removeEventListener(
                "mousedown",
                initMouseDownListener
            );
        };
    }, [isText, isDrawRect, isDrawOval, isDrawLine, isEraser]);

    function setCanvasStyles() {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = "crosshair";
        }
    }

    function drawReceivedDataOnCanvas(
        ctx: CanvasRenderingContext2D | null | undefined,
        object: {
            roomId: string;
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

    const setCanvasRef = useCallback((ref: HTMLCanvasElement) => {
        if (!ref) return;
        canvasRef.current = ref;
        setCanvasStyles();
        let ctx = canvasRef.current?.getContext("2d");

        socketRef?.on("canvas-data", (object) => {
            drawReceivedDataOnCanvas(ctx, object);
        });
    }, []);

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
                roomId,
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

    /**
     *
     * @param isDrawing boolean
     * @param isDrawOval boolean
     * @param isDrawRect boolean
     * @param isDrawLine boolean
     * @param isEraser boolean
     * @param isText boolean
     */
    function toggleTools(
        isDrawing: boolean,
        isDrawOval: boolean,
        isDrawRect: boolean,
        isDrawLine: boolean,
        isEraser: boolean,
        isText: boolean
    ) {
        isDrawingRef.current = isDrawing;
        isDrawOvalRef.current = isDrawOval;
        isDrawRectRef.current = isDrawRect;
        isDrawLineRef.current = isDrawLine;
        isEraserRef.current = isEraser;
        isTextRef.current = isText;
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

    return [canvasRef, setCanvasRef, primaryCanvasRef, setPrimaryCanvasRef];
};
export default useOnDraw;
