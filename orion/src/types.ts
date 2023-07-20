type CanvasRefToVoid = (ref: HTMLCanvasElement) => void;
type ReturnVoid = () => void;
type OnDrawType = (
    ctx: CanvasRenderingContext2D | null | undefined,
    point: { x: number; y: number } | null
) => void;
interface CanvasProps {
    width: number;
    height: number;
}

export type { CanvasRefToVoid, ReturnVoid, CanvasProps, OnDrawType };
