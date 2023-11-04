import React, { useState } from "react";
import { sampleSize } from "lodash";
import "./MineField.css";

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

const MineField = () => {
  const HEIGHT: number = 9;
  const WIDTH: number = 9;
  const numTotalBombs: number = 10;
  const [finishInit, setFinishInit] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [cellStates, setCellStates] = useState<Array<CellState[]>>(
    Array.from({ length: HEIGHT }, (_, row) =>
      Array.from({ length: WIDTH }, (_, col) => createInitialCellState()),
    ),
  );

  function isOutOfDomain(row: number, col: number): boolean {
    return row < 0 || row >= HEIGHT || col < 0 || col >= WIDTH;
  }

  function setNumBombsAround(newCellStates: CellState[][]): void {
    for (const [row, cellsInRow] of newCellStates.entries()) {
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
            if (newCellStates[r][c].isBomb) {
              numBombsAround++;
            }
          }
        }
        cellState.numBombsAround = numBombsAround;
        cellState.numColor = numColors.nums[numBombsAround];
      }
    }
  }

  function setBombs(
    row: number,
    col: number,
    numOpen: number,
    newCellStates: CellState[][],
  ): void {
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
    for (const cellsInRow of newCellStates) {
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
  }

  function initializeField(
    row: number,
    col: number,
    numOpen: number,
    newCellStates: CellState[][],
  ): void {
    setBombs(row, col, numOpen, newCellStates);
    setNumBombsAround(newCellStates);
  }

  function openPossibleCells(
    row: number,
    col: number,
    newCellStates: CellState[][],
  ): void {
    // Breadth-first search
    type Location = [number, number];
    let visited: boolean[][] = Array(HEIGHT)
      .fill(false)
      .map(() => Array(WIDTH).fill(false));
    let queue: Location[] = [];
    function pushNewLocationsAroundZero(y: number, x: number): void {
      visited[y][x] = true;
      if (newCellStates[y][x].numBombsAround !== 0) {
        newCellStates[y][x].isOpen = true;
        return;
      }
      for (let r = y - 1; r <= y + 1; r++) {
        for (let c = x - 1; c <= x + 1; c++) {
          if (isOutOfDomain(r, c)) {
            continue;
          }
          newCellStates[r][c].isOpen = true;
          if (visited[r][c] || newCellStates[r][c].numBombsAround !== 0) {
            continue;
          }
          queue.push([r, c]);
        }
      }
    }
    pushNewLocationsAroundZero(row, col);
    while (queue.length !== 0) {
      let loc = queue.shift();
      const [y, x] = loc!;
      for (let r = y - 1; r <= y + 1; r++) {
        for (let c = x - 1; c <= x + 1; c++) {
          if (isOutOfDomain(r, c) || visited[r][c]) {
            continue;
          }
          pushNewLocationsAroundZero(r, c);
        }
      }
    }
  }

  function openAllMines(newCellStates: CellState[][]): void {
    for (const cellsInRow of newCellStates) {
      for (const cellState of cellsInRow) {
        if (cellState.isBomb) {
          cellState.isOpen = true;
        }
      }
    }
  }

  function countOpen(cellStates: CellState[][]): number {
    let numOpen: number = 0;
    for (const cellsInRow of cellStates) {
      for (const cellState of cellsInRow) {
        if (cellState.isOpen) {
          numOpen++;
        }
      }
    }
    return numOpen;
  }

  function handleReset(): void {
    setFinishInit(false);
    setIsGameClear(false);
    setIsGameOver(false);
    setCellStates(
      Array.from({ length: HEIGHT }, (_, row) =>
        Array.from({ length: WIDTH }, (_, col) => createInitialCellState()),
      ),
    );
  }

  function handleClick(row: number, col: number): void {
    if (isGameOver || isGameClear) {
      alert("Click the reset button to restart!");
      return;
    }
    let newCellStates = JSON.parse(JSON.stringify(cellStates));
    if (finishInit) {
      if (cellStates[row][col].isBomb) {
        openAllMines(newCellStates);
        setCellStates(newCellStates);
        setIsGameOver(true);
        setTimeout(() => {
          alert("Game Over!");
        }, 100);
        return;
      }
      openPossibleCells(row, col, newCellStates);
      setCellStates(newCellStates);
      if (countOpen(newCellStates) == HEIGHT * WIDTH - numTotalBombs) {
        setIsGameClear(true);
        setTimeout(() => {
          alert("Game Clear!");
        }, 100);
      }
      return;
    }

    let numOpen: number = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (isOutOfDomain(r, c)) {
          continue;
        }
        numOpen++;
        newCellStates[r][c].isOpen = true;
      }
    }
    initializeField(row, col, numOpen, newCellStates);
    openPossibleCells(row, col, newCellStates);
    setCellStates(newCellStates);
    setFinishInit(true);
  }

  const ReturnMineField = () => {
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
                    {cell.numBombsAround !== 0 &&
                      (cell.numBombsAround > 0 ? cell.numBombsAround : "#")}
                  </span>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="countmines">Remaining Mines: {0}</div>
      <ReturnMineField />
      <button className="reset-button" onClick={() => handleReset()}>
        Reset
      </button>
    </div>
  );
};

export default MineField;
