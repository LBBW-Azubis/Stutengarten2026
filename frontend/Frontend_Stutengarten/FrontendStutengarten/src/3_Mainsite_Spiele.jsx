import { useEffect, useState } from "react";
import "./3_Mainsite_Spiele.css"  //Wichtig immer CSS importieren;

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);

  // Steuerung
  useEffect(() => {
  const handleKey = (e) => {
    setDirection((prev) => {
      if (e.key === "ArrowUp" && prev !== "DOWN") return "UP";
      if (e.key === "ArrowDown" && prev !== "UP") return "DOWN";
      if (e.key === "ArrowLeft" && prev !== "RIGHT") return "LEFT";
      if (e.key === "ArrowRight" && prev !== "LEFT") return "RIGHT";
      return prev; // 👉 verhindert Umkehr
    });
  };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      moveSnake();
    }, 150);

    return () => clearInterval(interval);
  });

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // Wand-Kollision
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_SIZE ||
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Selbst-Kollision
    if (newSnake.some((s) => s.x === head.x && s.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Essen
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      });
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  return (
    <div className="snake-container">
      <h2>🐍 Snake Game</h2>

      {gameOver && <p className="gameover">Game Over</p>}

      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);

          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`cell ${
                isSnake ? "snake" : isFood ? "food" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}