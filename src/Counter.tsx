import React, { useState } from "react";

interface NumColors {
  mine: string;
  nums: string[];
}

const numColors: NumColors = {
  mine: "#000000",
  nums: [
    "#A0A0A0",
    "#0000FE",
    "#017F01",
    "#FE0000",
    "#010080",
    "#810102",
    "#008080",
    "#000000",
    "#808080",
  ],
};

const tileColors = {
  close: "#C0C0C0",
  open: "#A0A0A0",
};

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
    tileColor: tileColors.close,
    numColor: numColors.nums[0],
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
      {cellStates.map((cellsInRow, row) => (
        <div
          key={`row-${row}`}
          style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        >
          {cellsInRow.map((cell, col) => (
            <button
              style={{
                backgroundColor: cell.tileColor,
                width: 25,
                height: 25,
              }}
              key={`btn-${row}-${col}`}
              onClick={() => handleClick(row, col)}
            >
              <span style={{ color: `${cell.numColor}` }}>
                {cell.isOpen && cell.numBombsAround}
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
