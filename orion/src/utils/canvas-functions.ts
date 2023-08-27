import { DrawType } from "@/types";

const eraseCanvas: DrawType = (
    canvasRef,
    start,
    end,
    ctx,
    color,
    brushSize
) => {
    if (!ctx || !start) return;
    drawFree(canvasRef, start, end, ctx, color, brushSize);
};

const drawRectangle: DrawType = (canvasRef, start, end, ctx, color, width) => {
    if (!ctx || !start) return;
    ctx.clearRect(0, 0, canvasRef.current?.width!, canvasRef.current?.height!);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    const rectWidth = end.x - start.x;
    const rectHeight = end.y - start.y;

    ctx.strokeRect(start.x, start.y, rectWidth, rectHeight);
};

const drawOval: DrawType = (canvasRef, start, end, ctx, color, width) => {
    if (!ctx || !start) return;
    ctx.clearRect(0, 0, canvasRef.current?.width!, canvasRef.current?.height!);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y + (end.y - start.y) / 2);
    ctx.bezierCurveTo(
        start.x,
        start.y,
        end.x,
        start.y,
        end.x,
        start.y + (end.y - start.y) / 2
    );
    ctx.bezierCurveTo(
        end.x,
        end.y,
        start.x,
        end.y,
        start.x,
        start.y + (end.y - start.y) / 2
    );
    ctx.closePath();
    ctx.stroke();
};

const drawLine: DrawType = (canvasRef, start, end, ctx, color, width) => {
    if (!ctx || !start) return;

    ctx.clearRect(0, 0, canvasRef.current?.width!, canvasRef.current?.height!);
    start = start ?? end;

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(start?.x, start?.y);
    ctx.stroke();
};

const drawFree: DrawType = (canvasRef, start, end, ctx, color, width) => {
    if (!ctx || !end) return;

    start = start ?? end;

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(start?.x, start?.y);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
    ctx.fill();
};

const writeText: DrawType = (canvasRef, start, end, ctx, color, width) => {
    if (!ctx) return;
    ctx.font = "30px Verdana";
    ctx.fillStyle = color;
    ctx.fillText("Hello World", start?.x!, start?.y!);
};
export { drawFree, drawLine, drawOval, drawRectangle, eraseCanvas, writeText };
