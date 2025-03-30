
import React, { useEffect, useState, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    color: string;
    lifetime: number;
  }>>([]);
  const nextParticleId = useRef(0);

  // Colors for particles
  const particleColors = [
    'rgba(16, 249, 241, 0.8)', // Tron cyan
    'rgb(43, 0, 255)',   // Tron blue
    'rgba(255, 255, 255, 0.6)', // White
    'rgba(0, 195, 255, 0.7)', // Light blue
  ];

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorRing = cursorRingRef.current;
    
    if (!cursor || !cursorRing) return;

    // Add custom cursor styles to the body
    document.body.classList.add('cursor-none');
    
    let lastX = 0;
    let lastY = 0;
    let lastMoveTime = Date.now();
    
    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // Position the main cursor dot directly at mouse position
      cursor.style.left = `${clientX}px`;
      cursor.style.top = `${clientY}px`;
      
      // Position the ring with slight delay for trailing effect
      cursorRing.style.left = `${clientX}px`;
      cursorRing.style.top = `${clientY}px`;

      // Calculate cursor speed for particle emission
      const now = Date.now();
      const timeDiff = now - lastMoveTime;
      if (timeDiff > 0) {
        const distance = Math.sqrt(Math.pow(clientX - lastX, 2) + Math.pow(clientY - lastY, 2));
        const speed = distance / timeDiff;
        
        // Only emit particles if cursor is moving fast enough
        if (speed > 0.05) {
          // Add particles based on movement speed (20% more particles)
          const particleCount = Math.min(Math.floor(speed * 2), 8); // Increased from 1.5 to 1.8 and max from 3 to 4
          for (let i = 0; i < particleCount; i++) {
            createParticle(clientX, clientY);
          }
        }
      }
      
      lastX = clientX;
      lastY = clientY;
      lastMoveTime = now;
    };

    const createParticle = (x: number, y: number) => {
      const id = nextParticleId.current++;
      const size = Math.random() * 5 + 2; // Random size between 2-7px
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      // Extended lifetime by 2 seconds (2000ms)
      const lifetime = Math.random() * 800 + 2400; // 2400-3200ms lifetime (previously 400-1200ms)
      
      // Add slight random offset to particle position
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetY = (Math.random() - 0.5) * 10;
      
      setParticles(prev => [...prev, {
        id,
        x: x + offsetX,
        y: y + offsetY,
        size,
        opacity: 0.8,
        color,
        lifetime
      }]);
      
      // Remove the particle after its lifetime
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, lifetime);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      const isClickable = 
        target.tagName.toLowerCase() === 'button' || 
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null || 
        target.closest('a') !== null ||
        target.classList.contains('orbit-item');
        
      // Make sure we're always setting a boolean value
      setIsPointer(Boolean(isClickable));
    };

    // Add event listeners
    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);

    // Animation frame for particle updates
    let animationFrameId: number;
    
    const updateParticles = () => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          // Slower fade to match longer lifetime (previously 0.95)
          opacity: p.opacity * 0.98,  
          // Slower shrink to match longer lifetime (previously 0.97)
          size: p.size * 0.99,        
        }))
      );
      animationFrameId = requestAnimationFrame(updateParticles);
    };
    
    animationFrameId = requestAnimationFrame(updateParticles);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('cursor-none');
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="cursor-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <div 
        ref={cursorRef} 
        className={`custom-cursor ${isPointer ? 'custom-cursor-pointer' : ''}`}
      />
      <div 
        ref={cursorRingRef} 
        className={`custom-cursor-ring ${isPointer ? 'custom-cursor-ring-pointer' : ''}`}
      />
    </>
  );
};

export default CustomCursor;
