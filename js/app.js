'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const GAMER = 'GAMER'
const TARGET = 'TARGET'
const BOX = 'BOX'
const CLOCK = 'CLOCK'
const GOLD = 'GOLD'
const GLUE = 'GLUE'
const MAGNET = 'MAGNET'
const WATER = 'WATER'

const GAMER_IMG = '<img src="img/icons8-standing-man-48.png" >'
const BOX_IMG = '<img src="img/cardboard-box.png" ></img>'
const BOX_TARGET_IMG = '<img src="img/cardboard-box1.png" ></img>'
const CLOCK_IMG = '<img src="img/clock.png" ></img>'
const GOLD_IMG = '<img src="img/gold.png" ></img>'
const GLUE_IMG = '<img src="img/glue.png" ></img>'
const MAGNET_IMG = '<img src="img/magnet.png" ></img>'

var gBoard
var gGamerPos
var gCountBoxOnTarget
var gBoxsCount
var gIsOn
var gClockInterval
var gGlueInterval
var gGoldInterval
var gMagnetInterval
var gCountMoves
var gClock
var gStartedScore = 100
var gIsGlued = false
var gPreMoves
var gIsMagnet = false


function initGame() {
    gGamerPos = { i: 2, j: 4 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gCountMoves = 0
    gCountBoxOnTarget = 0
    gBoxsCount = 0
    gPreMoves = []
    gIsOn = true
    gClock = 0
    gClockInterval = setInterval(() => {
        placeBonuses(CLOCK, CLOCK_IMG)
    }, 10000);
    gGoldInterval = setInterval(() => {
        placeBonuses(GOLD, GOLD_IMG)
    }, 9000);
    gGlueInterval = setInterval(() => {
        placeGlue()
    }, 7000);
    gMagnetInterval = setInterval(() => {
        placeBonuses(MAGNET, MAGNET_IMG)
    }, 13000);
}

function buildBoard() {
    var board = createMat(11, 11)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { type: FLOOR, gameElement: null, i: i, j: j }
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL
            }
            board[i][j] = cell
        }
    }

    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    console.table(board)

    board[1][1].type = TARGET
    board[1][2].type = TARGET
    board[1][3].type = TARGET
    board[2][1].type = TARGET
    board[3][1].type = TARGET
    board[3][2].type = TARGET
    board[3][3].type = TARGET
    board[2][3].type = TARGET

    board[7][8].gameElement = BOX
    board[5][7].gameElement = BOX
    board[4][1].gameElement = BOX
    board[7][5].gameElement = BOX
    board[8][4].gameElement = BOX
    board[5][3].gameElement = BOX
    board[3][5].gameElement = BOX
    board[1][8].gameElement = BOX

    board[2][2].type = WALL
    board[5][4].type = WALL
    board[4][4].type = WALL
    board[6][4].type = WALL
    board[6][5].type = WALL
    board[6][6].type = WALL
    board[6][7].type = WALL
    board[7][7].type = WALL
    board[6][7].type = WALL
    board[7][7].type = WALL
    board[8][7].type = WALL
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'
            else if (currCell.type === TARGET) cellClass += ' target'
            strHTML += '\t<td class="cell ' + cellClass +
                '"  onclick="moveTo(' + i + ',' + j + ')"  >\n'

            if (currCell.gameElement === GAMER) strHTML += GAMER_IMG
            if (currCell.gameElement === BOX) strHTML += (currCell.type === TARGET) ? BOX_TARGET_IMG : BOX_IMG
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function moveTo(i, j) {
    if (gIsGlued) return
    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return;
    createMove();
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);

    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')
        var elCell = document.querySelector('.'+getClassName(gGamerPos))
        elCell.style.border = 'unset'

        switch (targetCell.gameElement) {
            case CLOCK:
                setClock()
                break;
            case GOLD:
                gStartedScore += 100
                break;
            case GLUE:
                playerGluing()
                break;
            case MAGNET:
                gIsMagnet = true
                break;

        }
        gGamerPos.i = i
        gGamerPos.j = j

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
        renderCell(gGamerPos, GAMER_IMG)
        var elCell = document.querySelector('.'+getClassName(gGamerPos))
        elCell.style.border = '3px solid blue'
        if (gClock <= 0) {
            gCountMoves++
        }
        var elScore = document.querySelector('h3 span')
        elScore.innerHTML = gStartedScore - gCountMoves

    }
    gClock--
}


function handleKey(event) {
    if (gIsGlued) return
    if (gIsOn) {
        var i = gGamerPos.i
        var j = gGamerPos.j
        
        switch (event.key) {
            case 'ArrowLeft':
                if (gBoard[i][j - 1].gameElement === BOX) {
                    if (gBoard[i][j - 2].type === WALL || gBoard[i][j - 2].gameElement === BOX) return
                    moveBox(i, j - 2)
                }
                moveTo(i, j - 1)
                if (gIsMagnet) {
                    var currCell = gBoard[i][j + 1]
                    if (currCell.gameElement === BOX && gBoard[i][j + 2].type === WALL) {
                        currCell.gameElement = null
                        moveBox(gGamerPos.i, gGamerPos.j + 1)
                        gIsMagnet = false
                        clearCell(i, j + 1)
                    }
                }
                break;
                case 'ArrowRight':
                if (gBoard[i][j + 1].gameElement === BOX) {
                    if (gBoard[i][j + 2].type === WALL || gBoard[i][j + 2].gameElement === BOX) return
                    moveBox(i, j + 2)
                }
                moveTo(i, j + 1);
                if (gIsMagnet) {
                    var currCell = gBoard[i][j - 1]
                    if (currCell.gameElement === BOX && gBoard[i][j - 2].type === WALL) {
                        currCell.gameElement = null
                        moveBox(gGamerPos.i, gGamerPos.j - 1)
                        gIsMagnet = false
                        clearCell(i, j - 1)
                    }
                }
                break;
                case 'ArrowUp':
                    if (gBoard[i - 1][j].gameElement === BOX) {
                    if (gBoard[i - 2][j].type === WALL || gBoard[i - 2][j].gameElement === BOX) return
                    if (gBoard[i - 2][j].gameElement === WATER) {
                        
                        slide('up', i - 1, j)
                    } else {
                        
                        moveBox(i - 2, j)
                    }
                }
                moveTo(i - 1, j)
                if (gIsMagnet) {
                    var currCell = gBoard[i + 1][j]
                    if (currCell.gameElement === BOX && gBoard[i + 2][j].type === WALL) {
                        currCell.gameElement = null
                        moveBox(gGamerPos.i + 1, gGamerPos.j)
                        gIsMagnet = false
                        clearCell(i + 1, j)
                    }
                }
                break;
            case 'ArrowDown':
                if (gBoard[i + 1][j].gameElement === BOX) {
                    if (gBoard[i + 2][j].type === WALL || gBoard[i + 2][j].gameElement === BOX) return
                    moveBox(i + 2, j)
                }
                moveTo(i + 1, j)
                if (gIsMagnet) {
                    var currCell = gBoard[i - 1][j]
                    if (currCell.gameElement === BOX && gBoard[i - 2][j].type === WALL) {
                        currCell.gameElement = null
                        moveBox(gGamerPos.i - 1, gGamerPos.j)
                        gIsMagnet = false
                        clearCell(i - 1, j)
                    }
                }
                break;
            }
            checkGameOver()
        }
    }
    
function clearCell(i, j) {
    var position = { i, j }
    gBoard[i][j].gameElement = null
    renderCell(position, '')
}

function moveBox(i, j) {
    if (gBoard[i][j].type === WALL) return
    gBoard[i][j].gameElement = BOX
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    var nextPosition = { i, j }
    if (gBoard[i][j].type === TARGET) {
        renderCell(nextPosition, BOX_TARGET_IMG)
    } else {
        renderCell(nextPosition, BOX_IMG)
    }
    console.log(gBoard);
}

function setClock() {
    gClock = 11
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value;
}
function placeBonuses(value, img) {
    var randomEmptyCell = findRandomEmptyCell()
    var currCell = gBoard[randomEmptyCell.i][randomEmptyCell.j]
    currCell.gameElement = value
    renderCell(randomEmptyCell, img)
    setTimeout(() => {
        if (currCell.gameElement === GAMER || currCell.gameElement === BOX) return
        currCell.gameElement = null
        renderCell(randomEmptyCell, '')
    }, 5000);
}

function playerGluing() {
    gIsGlued = true
    gStartedScore -= 5
    setTimeout(() => {
        gIsGlued = false
        gBoard[gGamerPos.i][gGamerPos.j].type = FLOOR
    }, 3000);

}

function placeGlue() {
    var randomEmptyCell = findRandomEmptyCell()
    var currCell = gBoard[randomEmptyCell.i][randomEmptyCell.j]
    currCell.gameElement = GLUE
    renderCell(randomEmptyCell, GLUE_IMG)
    setTimeout(() => {
        if (currCell.gameElement === GAMER || currCell.gameElement === BOX) return
        currCell.gameElement = null
        renderCell(randomEmptyCell, '')
    }, 5000);
}

function findRandomEmptyCell() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.gameElement && currCell.type != WALL) {
                emptyCells.push({ i, j })
            }
        }
    }
    var randomEmptyCell = emptyCells[getRandomInt(0, emptyCells.length)]
    return randomEmptyCell
}

function checkGameOver() {
    var countBoxOnTarget = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.gameElement === BOX && currCell.type === TARGET) {
                countBoxOnTarget++
            }
        }
    }
    if (countBoxOnTarget === 8) {
        gameOver()
    }
}

function gameOver() {
    gIsOn = false
    var elParagraph = document.querySelector('p')
    elParagraph.innerText = 'Victorious!! You Are Number One'
    clearInterval(gClockInterval)
    clearInterval(gGlueInterval)
    clearInterval(gGoldInterval)
    clearInterval(gMagnetInterval)
}

function restart() {
    clearInterval(gClockInterval)
    clearInterval(gGlueInterval)
    clearInterval(gGoldInterval)
    clearInterval(gMagnetInterval)
    document.querySelector('p').innerText = ''
    document.querySelector('h3 span').innerHTML = '100'
    initGame()

}

function undo() {
    if (gPreMoves.length <= 1) {
        initGame()
        return
    }
    var preMove = gPreMoves.pop()
    gBoard = preMove.gBoard

    renderBoard(gBoard, `tbody`)
}

function createMove() {
    var move = {
        gScore: gStartedScore - gCountMoves,
        gBoard: getgBoard(),
    }
    gPreMoves.push(move)
}

function getgBoard() {
    var board = []
    for (var i = 0; i < gBoard.length; i++) {
        var row = []
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            var preCell = {
                type: currCell.type,
                gameElement: currCell.gameElement,
                location: currCell.location,
            }
            row.push(preCell)
        }
        board.push(row)
    }
    return board
}

// function getPosition(i, j) {
//     var position = { i, j }
//     return position
// }

// function slide(direction, i, j) {
//     switch (direction) {
//         case 'up':

//             for (var i = i; i > 0; i--) {
//                 moveTo(i, j)
//                 if (!gBoard[i][j].gameElement && gBoard[i][j].type === FLOOR) {
//                     moveBox(i, j)
//                     clearCell(i + 1, j)
//                     // renderCell({ i, j }, BOX_IMG)
//                     // renderCell(getPosition(i + 1, j), GAMER_IMG)
//                 }
//                 // renderCell({ i, j }, GAMER_IMG)
//             }
//             console.log('jj');
//             break;

//     }
// }