import { RefObject } from "react";
import { Socket } from "socket.io-client";

type CanvasRefToVoid = (
    ref: HTMLCanvasElement,
    socketref: Socket | null
) => void;
type MouseEventListeners = (e: MouseEvent) => void;
type ReturnVoid = () => void;
type Point = { x: number; y: number };
type OnDrawType = (
    ctx: CanvasRenderingContext2D | null | undefined,
    point: Point | null,
    endPoints: Point | null,
    brushColor: string,
    brushSize: number,
    type: string
) => void;
type DrawType = (
    canvasRef: RefObject<HTMLCanvasElement>,
    start: Point | null,
    end: Point,
    ctx: CanvasRenderingContext2D | null | undefined,
    col: string,
    width: number
) => void;
type DrawRectangleType = (
    ctx: CanvasRenderingContext2D | null | undefined,
    color: string,
    width: number,
    allRectangles:
        | {
              drawPoints: { start: Point; end: Point };
              brushConfig: {
                  color: string;
                  size: number;
              };
          }[]
        | []
) => void;
interface BrushConfig {
    color: string;
    size: number;
}
interface DrawPoints {
    start: Point | null;
    end: Point;
}

export interface ShapeData {
    drawPoints: DrawPoints;
    brushConfig: BrushConfig;
}
type DrawFunction = (
    ctx: CanvasRenderingContext2D | null | undefined,
    shapeData: ShapeData[] | []
) => void;

interface CanvasProps {
    width: number;
    height: number;
    socketRef: Socket | null;
    brushColor: string;
    brushSize: number;
    isDrawRect: boolean;
    isDrawOval: boolean;
    isDrawLine: boolean;
    isEraser: boolean;
}

// Types Exports
export type {
    CanvasRefToVoid,
    ReturnVoid,
    CanvasProps,
    OnDrawType,
    MouseEventListeners,
    DrawType,
    DrawRectangleType,
    DrawFunction,
    Point,
};
