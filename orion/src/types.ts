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
    prevPoint: Point | null
) => void;
type DrawLineType = (
    start: Point | null,
    end: Point,
    ctx: CanvasRenderingContext2D | null | undefined,
    col: string,
    width: number
) => void;

interface CanvasProps {
    width: number;
    height: number;
}

export type {
    CanvasRefToVoid,
    ReturnVoid,
    CanvasProps,
    OnDrawType,
    MouseEventListeners,
    DrawLineType,
    Point,
};
