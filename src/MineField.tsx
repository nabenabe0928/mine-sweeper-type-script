import React, { useState, MouseEvent } from "react";
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

const MineFieldWithLevel = ({ level }: { level: number }) => {
  const HEIGHT: number = [9, 16, 16][level];
  const WIDTH: number = [9, 16, 30][level];
  const numTotalBombs: number = [10, 40, 100][level];
  const [finishInit, setFinishInit] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [flags, setFlags] = useState<Array<boolean[]>>(
    Array(HEIGHT)
      .fill(false)
      .map(() => Array(WIDTH).fill(false)),
  );
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

  function handleGameClear(): void {
    setIsGameClear(true);
    setTimeout(() => {
      alert("Game Clear!");
    }, 100);
  }

  function handleGameOver(cellStates: CellState[][]): void {
    openAllMines(cellStates);
    setCellStates(cellStates);
    setIsGameOver(true);
    setTimeout(() => {
      alert("Game Over!");
    }, 100);
  }

  function openPossibleCells(
    row: number,
    col: number,
    newCellStates: CellState[][],
  ): void {
    if (newCellStates[row][col].isBomb) {
      handleGameOver(newCellStates);
      return;
    }

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
    if (countOpen(newCellStates) === HEIGHT * WIDTH - numTotalBombs) {
      handleGameClear();
    }
  }

  const openAllMines = (newCellStates: CellState[][]): void => {
    newCellStates.forEach((cellStatesInRow) => {
      cellStatesInRow.forEach((cellState) => {
        if (cellState.isBomb) {
          cellState.isOpen = true
        }
      })
    })
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

  function countFlags(): number {
    let numFlags: number = 0;
    for (let row = 0; row < HEIGHT; row++) {
      for (let col = 0; col < WIDTH; col++) {
        if (!cellStates[row][col].isOpen && flags[row][col]) {
          numFlags++;
        }
      }
    }
    return numFlags;
  }

  function handleReset(): void {
    setFinishInit(false);
    setIsGameClear(false);
    setIsGameOver(false);
    setFlags(
      Array(HEIGHT)
        .fill(false)
        .map(() => Array(WIDTH).fill(false)),
    );
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
    if (flags[row][col]) {
      // Do nothing for flaged cells
      return;
    }
    let newCellStates = JSON.parse(JSON.stringify(cellStates));
    if (finishInit) {
      openPossibleCells(row, col, newCellStates);
      setCellStates(newCellStates);
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

  const handleRightClick =
    (row: number, col: number) => (event: MouseEvent) => {
      event.preventDefault();
      let newFlags = flags.map((flagsInRow) => [...flagsInRow]);
      newFlags[row][col] = !flags[row][col];
      setFlags(newFlags);
    };

  const handleDoubleClick = (row: number, col: number) => {
    let numBombsAround: number = cellStates[row][col].numBombsAround;
    let numFlagsAround: number = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (isOutOfDomain(r, c)) {
          continue;
        }
        if (!cellStates[r][c].isOpen && flags[r][c]) {
          numFlagsAround++;
        }
      }
    }
    if (numFlagsAround !== numBombsAround) {
      return;
    }
    let newCellStates = JSON.parse(JSON.stringify(cellStates));
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (isOutOfDomain(r, c)) {
          continue;
        }
        if (!cellStates[r][c].isOpen && !flags[r][c]) {
          openPossibleCells(r, c, newCellStates);
        }
      }
    }
    setCellStates(newCellStates);
  };

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
                  onContextMenu={handleRightClick(row, col)}
                >
                  <span className="flaged-cell">{flags[row][col] && "P"}</span>
                </button>
              ) : (
                <button
                  className="opencell"
                  onDoubleClick={() => handleDoubleClick(row, col)}
                >
                  <span style={{ color: `${cell.numColor}` }}>
                    {cell.numBombsAround !== 0 &&
                      (cell.numBombsAround > 0 ? cell.numBombsAround : "#")}
                  </span>
                </button>
              ),
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="countmines">
        Remaining Mines: {numTotalBombs - countFlags()}
      </div>
      <ReturnMineField />
      <div className="reset-button-container">
        <button className="reset-button" onClick={() => handleReset()}>
          Reset
        </button>
      </div>
    </div>
  );
};

const MineField = () => {
  const [level, setLevel] = useState(0);
  const handleSelectLevel = (level: number) => {
    setLevel(level);
  };
  return (
    <div>
      <MineFieldWithLevel key={level} level={level} />
      <div className="level-button-container">
        <button className="level-button" onClick={() => handleSelectLevel(0)}>
          Easy
        </button>
      </div>
      <div className="level-button-container">
        <button className="level-button" onClick={() => handleSelectLevel(1)}>
          Medium
        </button>
      </div>
      <div className="level-button-container">
        <button className="level-button" onClick={() => handleSelectLevel(2)}>
          Hard
        </button>
      </div>
    </div>
  );
};

export default MineField;
