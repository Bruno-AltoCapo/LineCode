import { animate, stagger } from "motion";
import { splitText } from "motion-plus";
import { useEffect, useRef, useState } from "react";
import { useColorMode } from "@chakra-ui/react";

const TEXTS = [
  "Una alternativa a Google Classroom de fácil migración.",
  "Frontend en React y Chakra UI.",
  "Backend en Node.js y Express.",
  "Por Bruno Marín, como proyecto final de grado.",
];

export default function SplitTextRotator() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const { colorMode } = useColorMode();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambia el texto cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TEXTS.length);
    }, 5000); // > duración animación

    return () => clearInterval(interval);
  }, []);

  // Ejecuta la animación cada vez que cambia el texto
  useEffect(() => {
    if (!textRef.current) return;

    const { words } = splitText(textRef.current);
    animate(
      words,
      { opacity: [0, 1], y: [10, 0] },
      {
        type: "spring",
        duration: 1.5,
        bounce: 0.3,
        delay: stagger(0.05),
      }
    );
  }, [currentIndex, colorMode]);

  return (
    <div className="container" ref={containerRef}>
      <h1 className="h1" ref={textRef} style={{ color: colorMode === "dark" ? "#E2E8F0" : "#1A202C" }}>
        {TEXTS[currentIndex]}
      </h1>
      <Stylesheet />
    </div>
  );
}

function Stylesheet() {
  return (
    <style>{`
      .container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        max-width: 600px;
        height: 120px;
        text-align: left;
        overflow: hidden;
      }
      .split-word {
        will-change: transform, opacity;
      }
      .h1 {
        font-size: 2rem;
        font-weight: 400;
        white-space: pre-wrap;
        width: 100%;
      }
    `}</style>
  );
}
