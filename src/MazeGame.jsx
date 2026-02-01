import { useEffect, useState } from "react";
import "./Maze.css";
import confetti from "canvas-confetti";

import bgMusic from "./assets/musicbg.mp3";
import yesSoundFile from "./assets/song.mp3";
import gif from "./assets/catcouple.gif";


function generateMaze(rows, cols) {
  if (rows % 2 === 0) rows += 1;
  if (cols % 2 === 0) cols += 1;

  const maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 1)
  );

  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  function carve(row, col) {
    maze[row][col] = 0;
    directions.sort(() => Math.random() - 0.5);

    for (let [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow > 0 &&
        newRow < rows - 1 &&
        newCol > 0 &&
        newCol < cols - 1 &&
        maze[newRow][newCol] === 1
      ) {
        maze[row + dr / 2][col + dc / 2] = 0;
        carve(newRow, newCol);
      }
    }
  }

  carve(1, 1);

  maze[1][1] = "S";
  maze[rows - 2][cols - 2] = "G";

  return maze;
}

const maze = generateMaze(21, 21);

const startRow = maze.findIndex(row => row.includes("S"));
const startCol = maze[startRow].indexOf("S");

export default function MazeGame() {
  const [player, setPlayer] = useState({ row: startRow, col: startCol });
  const [won, setWon] = useState(false);
  const [yesClicked, setYesClicked] = useState(false);
  const [bgAudio] = useState(() => new Audio(bgMusic));
  const [yesAudio] = useState(() => new Audio(yesSoundFile));
  const [musicStarted, setMusicStarted] = useState(false);
  const [noPos, setNoPos] = useState(null);


  useEffect(() => {
    if (won && musicStarted) {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    }
  }, [won, bgAudio, musicStarted]);


  const handleYes = () => {
    confetti({
      particleCount: 200,
      spread: 140,
      origin: { y: 0.6 },
      colors: ["#ff5fa2", "#ff9ecf", "#ffd1e8"],
    });

    yesAudio.currentTime = 0;
    yesAudio.volume = 0.1;
    yesAudio.play();

    setYesClicked(true);
  };


  const handleNo = () => {
    const padding = 20;
    const maxX = window.innerWidth - 140;
    const maxY = window.innerHeight - 80;

    const x = padding + Math.random() * (maxX - padding);
    const y = padding + Math.random() * (maxY - padding);

    setNoPos({ x, y });
  };


  useEffect(() => {

    const handleKeyDown = (e) => {
      if (won) {
        setNoPos(null); // reset so it starts beside Yes
      }

      if (!musicStarted) {
        bgAudio.loop = true;
        bgAudio.volume = 0.5;
        bgAudio.play().catch(() => { });
        setMusicStarted(true);
      }


      let { row, col } = player;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          row--;
          break;
        case "ArrowDown":
        case "s":
          row++;
          break;
        case "ArrowLeft":
        case "a":
          col--;
          break;
        case "ArrowRight":
        case "d":
          col++;
          break;
        default:
          return;
      }

      if (
        row < 0 ||
        col < 0 ||
        row >= maze.length ||
        col >= maze[0].length
      )
        return;

      if (maze[row][col] === 1) return;

      if (maze[row][col] === "G") {
        setWon(true);
      }

      setPlayer({ row, col });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, won]);

  return (
    <div className="game-container">
      <h2>💘 Maze 💘</h2>

      {won && (
        <div className="valentine-card">
          {!yesClicked ? (
            <>
              <h1>💖 Will you be my Valentine? 💖</h1>
              <p>
                Hi Pookie! 🥺<br />
                I made this little game just for you.<br />
                Will you be my Valentine? 🌹
              </p>

              <div className="buttons">
                <button onClick={handleYes}>Yes 💕</button>
                <button
                  onMouseEnter={handleNo}
                  style={
                    noPos
                      ? {
                        position: "fixed",
                        left: noPos.x,
                        top: noPos.y,
                        transition: "0.15s ease-out",
                        zIndex: 9999
                      }
                      : {}
                  }
                >
                  No 💔
                </button>
              </div>
            </>
          ) : (
            <div className="yes-screen">
              <div className="gifImage">
                <img src={gif} alt="Love" className="love-gif"
                />
              </div>
              <p className="love-text">
                💕 My love, I can't wait to spend Valentine’s with you 💕 <br />
                Cheers to our 4 Years 2 Months Relationship! 🥺🌹 <br />
                You mean the world to me, and I'm so grateful to have you in my life. <br />
              </p>
            </div>
          )}
        </div>
      )}


      <div
        className="maze"
        style={{
          gridTemplateColumns: `repeat(${maze[0].length}, 48px)`,
        }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = player.row === r && player.col === c;
            return (
              <div
                key={`${r}-${c}`}
                className={`cell
                  ${cell === 1 ? "wall" : ""}
                  ${cell === "G" ? "goal" : ""}
                  ${isPlayer ? "player" : ""}
                `}
              />
            );
          })
        )}
      </div>

      {!won && <p>Use WASD or Arrow keys 💗</p>}
    </div>
  );
}
