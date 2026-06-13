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

const gGame = {
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  status: 'starting',
  correctlyMarked: 0,
  level: gLevels[0],
}

function onInit() {
  gBoard = buildBoard()
  renderBoard(gBoard)
  renderLives(gGame)
  renderSmiley()
  console.table(gBoard)
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gGame.level.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gGame.level.SIZE; j++) {
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
        if (!currCell.isMine) {
          content = currCell.minesAroundCount || ''
          if (currCell.minesAroundCount) {
            classes += ` mines-${currCell.minesAroundCount}`
          }
        } else {
          content = '💣'
        }

        classes += ' revealed'
      } else if (currCell.isMarked) {
        content = '🚩'
      }

      strHTML += `<td class="${classes}"
        oncontextmenu="onCellMarked(event, ${i}, ${j})"
        onclick="onCellClicked(this, ${i}, ${j})">
        ${content}
      </td>`
    }

    strHTML += '</tr>'
  }

  document.querySelector('.board').innerHTML = strHTML
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
  if (gGame.status === 'win' || gGame.status === 'loss') return
  if (gGame.status === 'starting') {
    startGame(i, j)
    expandReveal(gBoard, i, j)
    renderBoard(gBoard)
    return
  }

  var currCell = gBoard[i][j]
  if (currCell.isRevealed || currCell.isMarked) return

  expandReveal(gBoard, i, j)

  if (currCell.isMine) {
    revealCell(i, j)
    gGame.lives--
    renderLives(gGame)

    if (gGame.lives === 0) {
      gGame.status = 'loss'
    } else {
      setTimeout(() => {
        hideCell(i, j)
        renderBoard(gBoard)
      }, 1500)
    }
  }
  renderBoard(gBoard)
  checkGameOver()
}

function onCellMarked(ev, i, j) {
  ev.preventDefault()

  if (gGame.status === 'win' || gGame.status === 'loss') return
  var currCell = gBoard[i][j]
  if (currCell.isRevealed) return

  currCell.isMarked = !currCell.isMarked

  if (currCell.isMarked) {
    gGame.markedCount++
    if (currCell.isMine) gGame.correctlyMarked++
  } else {
    gGame.markedCount--
    if (currCell.isMine) gGame.correctlyMarked--
  }

  renderBoard(gBoard)
  checkGameOver()
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
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.lives = 3
  gGame.status = 'starting'
  gGame.correctlyMarked = 0

  onInit()
}

function renderLives(game) {
  var elLives = document.querySelector('.lives')
  elLives.innerText = '❤️'.repeat(game.lives)
}

function checkGameOver() {
  var totalSafeCells = gGame.level.SIZE * gGame.level.SIZE - gGame.level.MINES
  const elLives = document.querySelector('.lives')

  if (
    gGame.correctlyMarked === gGame.level.MINES &&
    gGame.revealedCount === totalSafeCells
  ) {
    gGame.status = 'win'
    elLives.innerText = 'You Won!'
    elLives.style.color = '#67B279'
  }

  if (gGame.lives === 0) {
    gGame.status = 'loss'
    elLives.innerText = 'You Lose!'
    elLives.style.color = '#d41313'
  }
  renderSmiley()
}

function revealCell(i, j) {
  var currCell = gBoard[i][j]
  currCell.isRevealed = true
  gGame.revealedCount++
}

function hideCell(i, j) {
  var currCell = gBoard[i][j]
  if (!currCell.isRevealed) return
  currCell.isRevealed = false
  gGame.revealedCount--
}

function startGame(i, j) {
  setRandomMines(gBoard, gGame.level, { i: i, j: j })
  setMinesNegsCount(gBoard)
  gGame.status = 'running'
}

function expandReveal(board, i, j) {
  var currCell = board[i][j]

  if (currCell.isRevealed || currCell.isMarked || currCell.isMine) return

  revealCell(i, j)

  if (currCell.minesAroundCount > 0) return

  for (var negI = i - 1; negI <= i + 1; negI++) {
    if (negI < 0 || negI >= gGame.level.SIZE) continue

    for (var negJ = j - 1; negJ <= j + 1; negJ++) {
      if (negJ < 0 || negJ >= gGame.level.SIZE) continue
      if (negI === i && negJ === j) continue

      expandReveal(board, negI, negJ)
    }
  }
}

function renderSmiley() {
  const elSmiley = document.querySelector('.smiley')

  switch (gGame.status) {
    case 'win':
      elSmiley.innerText = '😎'
      break
    case 'loss':
      elSmiley.innerText = '😭'
      break
    default:
      elSmiley.innerText = '🙂'
  }
}

function changeLevel(levelIdx) {
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.lives = 3
  gGame.status = 'starting'
  gGame.correctlyMarked = 0
  gGame.level = gLevels[levelIdx]

  onInit()
}
