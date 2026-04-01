import { useEffect, useState } from "react";
import "./3_Mainsite_Spiele.css"; // Wichtig immer CSS importieren;

const EMOJIS = ["🚀", "🛸", "🌍", "🌟", "🍕", "🍔", "🍟", "🌭"];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Initialize Game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2) return; // Wait for animation
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlippedIndices.length === 2) {
      setMoves((m) => m + 1);
      checkForMatch(newFlippedIndices, newCards);
    }
  };

  const checkForMatch = (currentFlipped, currentCards) => {
    const [firstIndex, secondIndex] = currentFlipped;

    if (currentCards[firstIndex].emoji === currentCards[secondIndex].emoji) {
      // It's a match
      setTimeout(() => {
        const matchedCards = [...currentCards];
        matchedCards[firstIndex].isMatched = true;
        matchedCards[secondIndex].isMatched = true;
        setCards(matchedCards);
        setFlippedIndices([]);

        if (matchedCards.every((card) => card.isMatched)) {
          setGameWon(true);
        }
      }, 500);
    } else {
      // Not a match, flip back
      setTimeout(() => {
        const resetCards = [...currentCards];
        resetCards[firstIndex].isFlipped = false;
        resetCards[secondIndex].isFlipped = false;
        setCards(resetCards);
        setFlippedIndices([]);
      }, 1000);
    }
  };

  return (
    <div className="memory-container">
      <div className="memory-header">
        <h2>🧠 Memory Match</h2>
        <div className="memory-stats">
          <p>Züge: <span>{moves}</span></p>
          <button className="restart-btn" onClick={initializeGame}>
            Neu Starten
          </button>
        </div>
      </div>

      {gameWon && (
        <div className="victory-message">
          🎉 Du hast gewonnen in {moves} Zügen! 🎉
        </div>
      )}

      <div className="memory-grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped || card.isMatched ? "flipped" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">
                ?
              </div>
              <div className="memory-card-back">
                {card.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}