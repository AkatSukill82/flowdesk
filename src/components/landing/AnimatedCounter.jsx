import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export default function AnimatedCounter({ to, suffix = '', duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const fps = 60;
    const step = (to - start) / (duration * fps);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { start = to; clearInterval(id); }
      setValue(Math.round(start));
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [inView, to, duration]);

  return <span ref={ref}>{value.toLocaleString('fr-FR')}{suffix}</span>;
}