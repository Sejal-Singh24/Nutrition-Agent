
(function () {
  'use strict';

  // Simple canvas-based donut chart (no external dependency)
  function drawMacroRing(canvasId, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const outerR = Math.min(W, H) / 2 - 8;
    const innerR = outerR - 22;

    ctx.clearRect(0, 0, W, H);

    const total = data.reduce((s, v) => s + v, 0);
    if (total === 0) {
      // Draw empty ring
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, Math.PI * 2, 0, true);
      ctx.fillStyle = 'rgba(30,41,59,0.6)';
      ctx.fill();
      return;
    }

    let startAngle = -Math.PI / 2;

    data.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2;
      const endAngle = startAngle + slice;

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();

      // Gradient fill
      const grd = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
      grd.addColorStop(0, colors[i][0]);
      grd.addColorStop(1, colors[i][1]);
      ctx.fillStyle = grd;
      ctx.fill();

      startAngle = endAngle;
    });

    // Inner shadow circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
    ctx.fillStyle = '#060b14';
    ctx.fill();
  }

  // Expose globally
  window.NutriChart = {
    drawMacroRing,
    refresh(protein, carbs, fats) {
      drawMacroRing('macroChart', [protein, carbs, fats], [
        ['#ef4444', '#f97316'],
        ['#f59e0b', '#fbbf24'],
        ['#10b981', '#06d68f']
      ]);
    }
  };

  // Initial draw on load
  document.addEventListener('DOMContentLoaded', () => {
    window.NutriChart.refresh(0, 0, 0);
  });
})();
