import React, { useEffect, useRef } from 'react';

export const ECGTelemetryWave: React.FC<{ bpm?: number }> = ({ bpm = 72 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const render = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00F2FE';

      ctx.beginPath();
      for (let x = 0; x < width; x += 3) {
        const offset = (x + step) % 180;
        let y = midY;

        // ECG P-Q-R-S-T wave simulation
        if (offset > 40 && offset < 55) {
          // P wave
          y -= Math.sin(((offset - 40) / 15) * Math.PI) * 6;
        } else if (offset >= 65 && offset < 70) {
          // Q dip
          y += 4;
        } else if (offset >= 70 && offset < 78) {
          // R spike
          y -= Math.sin(((offset - 70) / 8) * Math.PI) * 26;
        } else if (offset >= 78 && offset < 85) {
          // S dip
          y += 7;
        } else if (offset > 105 && offset < 130) {
          // T wave
          y -= Math.sin(((offset - 105) / 25) * Math.PI) * 9;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      step = (step + 3.5) % 360;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bpm]);

  return (
    <div className="flex items-center gap-3 bg-matrix-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-coherent-blue/20">
      <canvas ref={canvasRef} width={140} height={32} className="w-[140px] h-[32px]" />
      <div className="text-right font-mono text-[10px] text-slate-400">
        <div className="text-telemetry-cyan font-semibold flex items-center gap-1 justify-end">
          <span className="w-1.5 h-1.5 rounded-full bg-clinical-green animate-pulse" />
          {bpm} BPM
        </div>
        <div className="text-[9px] text-slate-500">HEART TELEMETRY</div>
      </div>
    </div>
  );
};
