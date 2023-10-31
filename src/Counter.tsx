import React, { useState } from "react";

const numColors: string[] = [
  "#A0A0A0", // empty revealed
  "#0000FE",
  "#017F01",
  "#FE0000",
  "#010080",
  "#810102",
  "#008080",
  "#000000",
  "#808080",
  "#000000", // mine
];
const tileColors: string[] = [
  "#C0C0C0", // unrevealed
  "#A0A0A0", // revealed
];

interface CellState {
  isOpen: boolean;
  isBomb: boolean;
  numBombsAround: number;
  tileColor: string;
  numColor: string;
}

function createInitialCellState(): CellState {
  return {
    isOpen: false,
    isBomb: false,
    numBombsAround: -1,
    tileColor: tileColors[0],
    numColor: numColors[0],
  };
}

const Counter = () => {
  const height: number = 16;
  const width: number = 30;

  const [count, setCount] = useState(0);
  let cellStates: CellState[][] = Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => createInitialCellState()),
  );

  function handleClick(row: number, col: number) {
    if (count === 0) {
    } else {
    }
    setCount(count + 1);
  }

  return (
    <div>
      {Array.from({ length: height }, (_, row) => (
        <div key={`row-${row}`} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {Array.from({ length: width }, (_, col) => (
            <button
              style={{ backgroundColor: cellStates[row][col].tileColor, width: 25, height: 25 }}
              key={`btn-${row}-${col}`}
              onClick={() => handleClick(row, col)}
            ><span style={{color: `${cellStates[row][col].numColor}`}}>
              {cellStates[row][col].isOpen && cellStates[row][col].numBombsAround}
              </span>
            </button>
          ))}
          <br />
        </div>
      ))}
    </div>
  );
};

export default Counter;
