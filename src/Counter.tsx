import React, { useState } from "react";
import { sampleSize } from "lodash";
import "./Counter.css";

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

interface CellState {
  isOpen: boolean;
  isBomb: boolean;
  numBombsAround: number;
  numColor: string;
}

function createInitialCellState(): CellState {
  return {
    isOpen: false,
    isBomb: false,
    numBombsAround: -1,
    numColor: numColors.nums[0],
  };
}

const Counter = () => {
  const HEIGHT: number = 9;
  const WIDTH: number = 9;
  const numTotalBombs: number = 10;
  const [countOpen, setCountOpen] = useState(0);
  const [cellStates, setCellStates] = useState<Array<CellState[]>>(
    Array.from({ length: HEIGHT }, (_, row) =>
      Array.from({ length: WIDTH }, (_, col) => createInitialCellState()),
    ),
  );

  function isOutOfDomain(row: number, col: number): boolean {
    return row < 0 || row >= HEIGHT || col < 0 || col >= WIDTH;
  }

  function setNumBombsAround(): void {
    for (const [row, cellsInRow] of cellStates.entries()) {
      for (const [col, cellState] of cellsInRow.entries()) {
        if (cellState.isBomb) {
          continue;
        }
        let numBombsAround: number = 0;
        for (let r = row - 1; r <= row + 1; r++) {
          for (let c = col - 1; c <= col + 1; c++) {
            if (isOutOfDomain(r, c)) {
              continue;
            }
            if (cellStates[r][c].isBomb) {
              numBombsAround++;
            }
          }
        }
        cellState.numBombsAround = numBombsAround;
        cellState.numColor = numColors.nums[numBombsAround];
      }
    }
    setCellStates(cellStates);
  }

  function setBombs(row: number, col: number, numOpen: number): void {
    const numClose: number = HEIGHT * WIDTH - numOpen;
    let numChecked: number = 0;
    const bombExist: boolean[] = Array(numClose).fill(false);
    const indices = sampleSize(
      Array.from(Array(numClose).keys()),
      numTotalBombs,
    );
    indices.forEach((index) => {
      bombExist[index] = true;
    });
    for (const cellsInRow of cellStates) {
      for (const cellState of cellsInRow) {
        if (cellState.isOpen) {
          continue;
        }
        if (bombExist[numChecked]) {
          cellState.isBomb = true;
          cellState.numColor = numColors.mine;
        }
        numChecked++;
      }
    }
    setCellStates(cellStates);
  }

  function initializeField(row: number, col: number, numOpen: number): void {
    setBombs(row, col, numOpen);
    setNumBombsAround();
  }

  function openPossibleCells(row: number, col: number): void {
    // width-first search
    setCellStates(cellStates);
  }

  function handleClick(row: number, col: number): void {
    if (countOpen !== 0) {
      cellStates[row][col].isOpen = true;
      openPossibleCells(row, col);
      return;
    }

    let numOpen: number = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (isOutOfDomain(r, c)) {
          continue;
        }
        numOpen++;
        cellStates[r][c].isOpen = true;
      }
    }
    setCountOpen(countOpen + numOpen);
    setCellStates(cellStates);
    initializeField(row, col, numOpen);
  }

  return (
    <div>
      {cellStates.map((cellsInRow, row) => (
        <div className="minefield">
          {cellsInRow.map((cell, col) =>
            !cell.isOpen ? (
              <button
                className="closecell"
                onClick={() => handleClick(row, col)}
              ></button>
            ) : (
              <div className="opencell">
                <span style={{ color: `${cell.numColor}` }}>
                  {cell.numBombsAround !== 0 && cell.numBombsAround}
                </span>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
};

export default Counter;
