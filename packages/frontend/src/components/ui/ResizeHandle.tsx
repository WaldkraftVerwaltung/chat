'use client';
import { useCallback, useEffect, useState } from 'react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function ResizeHandle({ onResize, direction = 'horizontal', className = '' }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos(direction === 'horizontal' ? e.clientX : e.clientY);
  }, [direction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos;
      onResize(delta);
      setStartPos(currentPos);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`flex-shrink-0 cursor-col-resize hover:bg-slack-blue/30 active:bg-slack-blue/50 transition-colors ${
        isDragging ? 'bg-slack-blue/50' : ''
      } ${direction === 'horizontal' ? 'w-1 hover:w-1.5' : 'h-1 hover:h-1.5'} ${className}`}
    />
  );
}
