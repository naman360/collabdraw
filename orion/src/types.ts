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
    allRectangles: { start: Point; end: Point }[] | []
) => void;
interface CanvasProps {
    width: number;
    height: number;
    socketRef: Socket | null;
    brushColor: string;
    brushSize: number;
    isDrawRect: boolean;
}

export type {
    CanvasRefToVoid,
    ReturnVoid,
    CanvasProps,
    OnDrawType,
    MouseEventListeners,
    DrawType,
    DrawRectangleType,
    Point,
};
