import { useEffect, useState } from 'react';

export default function SparkleCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onClick = (e: MouseEvent) => {
      const id = Date.now();
      setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 1000);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-4 h-4 rounded-full bg-primary/20 backdrop-blur-sm shadow-sm transition-transform duration-75 ease-out translate-x-[-50%] translate-y-[-50%]"
        style={{ transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)` }}
      >
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full translate-x-[-50%] translate-y-[-50%]" />
      </div>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="pointer-events-none fixed z-[9999] text-xl animate-ping"
          style={{ left: sparkle.x - 10, top: sparkle.y - 10 }}
        >
          ✨
        </div>
      ))}
    </>
  );
}
