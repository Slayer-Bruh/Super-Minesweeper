'use strict'

var gBoard

const gLevels = [
  {
    TITLE: 'Beginner',
    SIZE: 4,
    MINES: 2,
  },
  {
    TITLE: 'Medium',
    SIZE: 8,
    MINES: 14,
  },
  {
    TITLE: 'Expert',
    SIZE: 12,
    MINES: 32,
  },
]
const gLevel = gLevels[1]

const gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
}

function onInit() {
  gBoard = buildBoard()
  renderBoard(gBoard)
  renderLives(gGame)
  console.table(gBoard)
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
      }
    }
  }

  return board
}

function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < board.length; j++) {
      var currCell = board[i][j]
      var content = ''
      var classes = 'cell'
      if (currCell.isRevealed) {
        if (!currCell.isMine) content = currCell.minesAroundCount
        else content = '💣'
        classes += ' revealed'
      } else if (currCell.isMarked) content = '🚩'
      strHTML += `<td class="${classes}"
       oncontextmenu="onCellMarked(event, ${i}, ${j})" 
       onclick="onCellClicked(this, ${i}, ${j})"
       >${content}</td>`
    }
    strHTML += '</tr>'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var count = 0
      for (var negI = i - 1; negI <= i + 1; negI++) {
        if (negI < 0 || negI >= board.length) continue
        for (var negJ = j - 1; negJ <= j + 1; negJ++) {
          if (negJ < 0 || negJ >= board.length) continue
          if (negI === i && negJ === j) continue
          if (board[negI][negJ].isMine) count++
        }
      }
      board[i][j].minesAroundCount = count
    }
  }
}

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn) {
    setRandomMines(gBoard, gLevel, { i: i, j: j })
    setMinesNegsCount(gBoard)
    gGame.isOn = true
  }
  var currCell = gBoard[i][j]
  if (currCell.isRevealed) return

  currCell.isRevealed = true

  if (currCell.isMine) {
    gGame.lives--
    renderLives(gGame)

    if (gGame.lives === 0) {
      console.log('Game Over here')
    } else {
      setTimeout(() => {
        currCell.isRevealed = false
        renderBoard(gBoard)
      }, 1500)
    }
  }
  renderBoard(gBoard)
}

function onCellMarked(ev, i, j) {
  ev.preventDefault()
  var currCell = gBoard[i][j]
  currCell.isMarked = !currCell.isMarked
  renderBoard(gBoard)
}

function setRandomMines(board, level, safeCell) {
  var deployed = 0
  while (deployed < level.MINES) {
    var i = getRandomInt(0, level.SIZE)
    var j = getRandomInt(0, level.SIZE)

    if (board[i][j].isMine || (i === safeCell.i && j === safeCell.j)) continue
    board[i][j].isMine = true
    deployed++
  }
}

function restartGame() {
  gGame.isOn = false
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.lives = 3

  onInit()
}

function renderLives(game) {
  var elLives = document.querySelector('.lives')
  elLives.innerText = game.lives === 0 ? 'Game Over' : '❤️'.repeat(game.lives)
}

function checkGameOver() {}

function expandReveal(board, elCell, i, j) {}
