import { Button, Menu, MenuItem } from "@mui/material"
import { useEffect, useState, MouseEvent } from "react"
import { sampleSize } from "lodash"
import "./MineField.css"

interface NumColors {
  mine: string
  nums: string[]
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
}

interface CellState {
  isOpen: boolean
  isBomb: boolean
  numBombsAround: number
  numColor: string
}

const createInitialCellState = (): CellState => {
  return {
    isOpen: false,
    isBomb: false,
    numBombsAround: -1,
    numColor: numColors.nums[0],
  }
}

const initializeField = (props: {
  row: number
  column: number
  height: number
  width: number
  numTotalBombs: number
}): CellState[][] => {
  const isOutOfDomain = (row: number, col: number): boolean => {
    return row < 0 || row >= props.height || col < 0 || col >= props.width
  }

  const newCellStates = Array.from({ length: props.height }, () =>
    Array.from({ length: props.width }, () => createInitialCellState())
  )
  const setNumBombsAround = () => {
    const countBombsAround = (row: number, col: number) => {
      let numBombsAround = 0
      for (let r = row - 1; r <= row + 1; ++r) {
        for (let c = col - 1; c <= col + 1; ++c) {
          if (isOutOfDomain(r, c)) {
            continue
          }
          if (newCellStates[r][c].isBomb) {
            ++numBombsAround
          }
        }
      }
      return numBombsAround
    }
    newCellStates.forEach((cellsInRow, row) => {
      cellsInRow.forEach((cellState, col) => {
        if (cellState.isBomb) {
          return
        }
        const numBombsAround = countBombsAround(row, col)
        cellState.numBombsAround = numBombsAround
        cellState.numColor = numColors.nums[numBombsAround]
      })
    })
  }

  const setBombs = (numOpen: number) => {
    const numClose: number = props.height * props.width - numOpen
    let numChecked = 0
    const bombExist: boolean[] = Array(numClose).fill(false)
    const indices = sampleSize(
      Array.from(Array(numClose).keys()),
      props.numTotalBombs
    )
    indices.forEach((index) => {
      bombExist[index] = true
    })
    for (const cellsInRow of newCellStates) {
      for (const cellState of cellsInRow) {
        if (cellState.isOpen) {
          continue
        }
        if (bombExist[numChecked]) {
          cellState.isBomb = true
          cellState.numColor = numColors.mine
        }
        numChecked++
      }
    }
  }

  const getNumInitOpenCells = (): number => {
    let numOpen = 0
    for (let r = props.row - 1; r <= props.row + 1; ++r) {
      for (let c = props.column - 1; c <= props.column + 1; ++c) {
        if (isOutOfDomain(r, c)) {
          continue
        }
        ++numOpen
        newCellStates[r][c].isOpen = true
      }
    }
    return numOpen
  }
  const numOpen = getNumInitOpenCells()
  setBombs(numOpen)
  setNumBombsAround()
  return newCellStates
}

const MineFieldWithLevel = (props: { level: number }) => {
  const level = props.level
  const HEIGHT: number = [9, 16, 16][level]
  const WIDTH: number = [9, 16, 30][level]
  const numTotalBombs: number = [10, 40, 100][level]
  const [finishInit, setFinishInit] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameClear, setIsGameClear] = useState(false)
  const [flags, setFlags] = useState<Array<boolean[]>>(
    Array(HEIGHT)
      .fill(false)
      .map(() => Array(WIDTH).fill(false))
  )
  const [cellStates, setCellStates] = useState<Array<CellState[]>>(
    Array.from({ length: HEIGHT }, () =>
      Array.from({ length: WIDTH }, () => createInitialCellState())
    )
  )

  const handleReset = () => {
    setFinishInit(false)
    setIsGameClear(false)
    setIsGameOver(false)
    setFlags(
      Array(HEIGHT)
        .fill(false)
        .map(() => Array(WIDTH).fill(false))
    )
    setCellStates(
      Array.from({ length: HEIGHT }, () =>
        Array.from({ length: WIDTH }, () => createInitialCellState())
      )
    )
  }

  useEffect(() => {
    handleReset()
  }, [level])

  const isOutOfDomain = (row: number, col: number): boolean => {
    return row < 0 || row >= HEIGHT || col < 0 || col >= WIDTH
  }

  const handleGameClear = () => {
    setIsGameClear(true)
    setTimeout(() => {
      alert("Game Clear!")
    }, 100)
  }

  const handleGameOver = (newCellStates: CellState[][]) => {
    openAllMines(newCellStates)
    setCellStates(newCellStates)
    setIsGameOver(true)
    setTimeout(() => {
      alert("Game Over!")
    }, 100)
  }

  const openPossibleCells = (
    row: number,
    col: number,
    newCellStates: CellState[][]
  ) => {
    if (newCellStates[row][col].isBomb) {
      handleGameOver(newCellStates)
      return
    }

    // Breadth-first search
    type Location = [number, number]
    const visited: boolean[][] = Array(HEIGHT)
      .fill(false)
      .map(() => Array(WIDTH).fill(false))
    const queue: Location[] = []
    const pushNewLocationsAroundZero = (y: number, x: number) => {
      visited[y][x] = true
      if (newCellStates[y][x].numBombsAround !== 0) {
        newCellStates[y][x].isOpen = true
        return
      }
      for (let r = y - 1; r <= y + 1; r++) {
        for (let c = x - 1; c <= x + 1; c++) {
          if (isOutOfDomain(r, c)) {
            continue
          }
          newCellStates[r][c].isOpen = true
          if (visited[r][c] || newCellStates[r][c].numBombsAround !== 0) {
            continue
          }
          queue.push([r, c])
        }
      }
    }
    pushNewLocationsAroundZero(row, col)
    while (queue.length !== 0) {
      const loc = queue.shift()
      const [y, x] = loc!
      for (let r = y - 1; r <= y + 1; r++) {
        for (let c = x - 1; c <= x + 1; c++) {
          if (isOutOfDomain(r, c) || visited[r][c]) {
            continue
          }
          pushNewLocationsAroundZero(r, c)
        }
      }
    }
    const countOpen = (): number => {
      let numOpen = 0
      newCellStates.forEach((cellStatesInRow) => {
        cellStatesInRow.forEach((cellState) => {
          if (cellState.isOpen) {
            ++numOpen
          }
        })
      })
      return numOpen
    }
    if (countOpen() === HEIGHT * WIDTH - numTotalBombs) {
      handleGameClear()
    }
  }

  const openAllMines = (newCellStates: CellState[][]) => {
    newCellStates.forEach((cellStatesInRow) => {
      cellStatesInRow.forEach((cellState) => {
        if (cellState.isBomb) {
          cellState.isOpen = true
        }
      })
    })
  }

  const countFlags = (): number => {
    let numFlags = 0
    cellStates.forEach((cellStatesInRow, row) => {
      cellStatesInRow.forEach((cellState, col) => {
        if (!cellState.isOpen && flags[row][col]) {
          ++numFlags
        }
      })
    })
    return numFlags
  }

  const handleClick = (row: number, col: number) => {
    if (isGameOver || isGameClear) {
      alert("Click the reset button to restart!")
      return
    }
    if (flags[row][col]) {
      // Do nothing for flaged cells
      return
    }

    if (!finishInit) {
      const newCellStates = initializeField({
        row: row,
        column: col,
        height: HEIGHT,
        width: WIDTH,
        numTotalBombs: numTotalBombs,
      })
      openPossibleCells(row, col, newCellStates)
      setCellStates(newCellStates)
      setFinishInit(true)
      return
    }

    const newCellStates = JSON.parse(JSON.stringify(cellStates))
    openPossibleCells(row, col, newCellStates)
    setCellStates(newCellStates)
  }

  const handleRightClick =
    (row: number, col: number) => (event: MouseEvent) => {
      event.preventDefault()
      const newFlags = flags.map((flagsInRow) => [...flagsInRow])
      newFlags[row][col] = !flags[row][col]
      setFlags(newFlags)
    }

  const handleDoubleClick = (row: number, col: number) => {
    const numBombsAround: number = cellStates[row][col].numBombsAround
    let numFlagsAround = 0
    for (let r = row - 1; r <= row + 1; ++r) {
      for (let c = col - 1; c <= col + 1; ++c) {
        if (isOutOfDomain(r, c)) {
          continue
        }
        if (!cellStates[r][c].isOpen && flags[r][c]) {
          ++numFlagsAround
        }
      }
    }
    if (numFlagsAround !== numBombsAround) {
      return
    }
    const newCellStates = JSON.parse(JSON.stringify(cellStates))
    for (let r = row - 1; r <= row + 1; ++r) {
      for (let c = col - 1; c <= col + 1; ++c) {
        if (isOutOfDomain(r, c)) {
          continue
        }
        if (!cellStates[r][c].isOpen && !flags[r][c]) {
          openPossibleCells(r, c, newCellStates)
        }
      }
    }
    setCellStates(newCellStates)
  }

  const ReturnMineField = () => {
    return (
      <>
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
              )
            )}
          </div>
        ))}
      </>
    )
  }

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
  )
}

const MineField = () => {
  const [level, setLevel] = useState(0)
  const [difficultyMenuAnchorEl, setDifficultyMenuAnchorEl] =
    useState<null | HTMLElement>(null)

  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [])
  return (
    <>
      <MineFieldWithLevel level={level} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          aria-controls="difficulty-menu"
          aria-haspopup="true"
          onClick={(e) => {
            setDifficultyMenuAnchorEl(e.currentTarget)
          }}
        >
          Difficulty Menu
        </Button>
        <Menu
          id="difficulty-menu"
          anchorEl={difficultyMenuAnchorEl}
          open={Boolean(difficultyMenuAnchorEl)}
          onClose={() => setDifficultyMenuAnchorEl(null)}
        >
          {["Easy", "Medium", "Hard"].map((difficulty, difficultyIndex) => (
            <MenuItem
              onClick={() => {
                setDifficultyMenuAnchorEl(null)
                setLevel(difficultyIndex)
              }}
            >
              {difficulty}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </>
  )
}

export default MineField
