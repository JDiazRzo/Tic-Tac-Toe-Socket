const menu = document.getElementById('menu');
const game = document.getElementById('game');
const board = document.querySelector('.board');

let boardArray = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = null
let gameActive = false
let mySymbol = null
let roomId = 'sala1'
const socket = io()

function startGame() {
    socket.emit('join', roomId)
}

function initBoard(data) {
    mySymbol = data.players[0] === socket.id ? 'X' : 'O'
    currentPlayer = data.currentPlayer
    gameActive = true

    menu.classList.add('hidden');      
    game.classList.remove('hidden'); 
    board.innerHTML = '';

    const existingTitle = document.querySelector('.tittlePlayer')
    if (existingTitle) existingTitle.remove()
    const tittlePlayer = document.createElement('h1')
    tittlePlayer.classList.add('tittlePlayer')
    tittlePlayer.textContent = `Eres: ${mySymbol}`
    game.insertBefore(tittlePlayer, board)

    for (let i = 0; i < 9; i++){
        const cell = document.createElement('div')
        cell.classList.add('square');
        cell.addEventListener('click', handleClick)
        cell.dataset.index = i;
        board.appendChild(cell);
    }
}

function checkWinner() {
    const winPattern = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,4,8], [2,4,6],
        [0,3,6], [1,4,7], [2,5,8],
    ]
    for (const pattern of winPattern) {
        const [a,b,c] = pattern
        if (boardArray[a] === boardArray[b] && boardArray[b] === boardArray[c] && boardArray[a] !== '') {
            document.querySelector(`[data-index="${a}"]`).classList.add('winner')
            document.querySelector(`[data-index="${b}"]`).classList.add('winner')
            document.querySelector(`[data-index="${c}"]`).classList.add('winner')
            return true
        }
    }
    return false
}

function resetGame() {
    const cells = document.querySelectorAll('.square');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-cell', 'o-cell', 'winner')
    })
    gameActive = false
    boardArray = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = null
}

function handleClick(event) {
    console.log('click! gameActive:', gameActive, 'currentPlayer:', currentPlayer, 'socket.id:', socket.id)
    if (!gameActive) return
    if (currentPlayer !== socket.id) return  // no es tu turno

    const index = event.target.dataset.index
    socket.emit('move', { roomId, index })
}

socket.on('start', (data) => {
    console.log('start recibido:', data)
    initBoard(data)
})

socket.on('move', ({ index, value, nextPlayer }) => {
    console.log('move recibido en frontend:', index, value, nextPlayer)
    // Actualizar tablero
    boardArray[index] = value
    const cell = document.querySelector(`[data-index="${index}"]`)
    cell.textContent = value
    cell.classList.add(value === 'X' ? 'x-cell' : 'o-cell')

    // Actualizar turno
    currentPlayer = nextPlayer

    // Verificar ganador o empate
    if (checkWinner()) {
        setTimeout(() => {
            alert(`Ganó el jugador ${value}!`)
            gameActive = false
            resetGame()
        }, 800)
    } else if (boardArray.every(c => c !== '')) {
        alert('Empate')
        resetGame()
    }
})

document.getElementById('Play').addEventListener('click', startGame);