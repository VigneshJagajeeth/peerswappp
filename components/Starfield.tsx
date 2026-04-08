import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  isDarkMode: boolean;
}

const Starfield: React.FC<StarfieldProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; z: number; size: number }[] = [];
    let shootingStars: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      // Set canvas size to match parent container
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const initStars = () => {
      stars = [];
      for (let i = 0; i < 800; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
          size: Math.random() * 1.5,
        });
      }
    };
    initStars();

    const draw = () => {
      // Deep space background for dark mode, very light sky blue/white for light mode
      ctx.fillStyle = isDarkMode ? '#050510' : '#f0f4f8'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars (white in dark mode, dark slate in light mode)
      ctx.fillStyle = isDarkMode ? 'white' : '#1e293b';
      stars.forEach((star) => {
        star.z -= 2;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        const size = star.size * (canvas.width / star.z);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shooting stars
      if (Math.random() < 0.03) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 5,
          opacity: 1,
        });
      }

      shootingStars.forEach((star, index) => {
        star.x -= star.speed;
        star.y += star.speed;
        star.opacity -= 0.01;

        if (star.opacity <= 0) {
          shootingStars.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y - star.length);
        const colorPrefix = isDarkMode ? '255, 255, 255' : '30, 41, 59';
        ctx.strokeStyle = `rgba(${colorPrefix}, ${star.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full object-cover -z-10" />;
};

export default Starfield;
