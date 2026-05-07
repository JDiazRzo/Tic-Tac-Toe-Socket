const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const rooms = {}

app.use(express.static('.'))

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})

io.on('connection', (socket) => {
    console.log('Jugador conectado:', socket.id)

    socket.on('join', (roomId) => {

        if (rooms[roomId] && rooms[roomId].players.length >= 2) {
            socket.emit('full')
            return
        }

        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                board: ['','','','','','','','',''],
                currentPlayer: null,
            }
        }

        rooms[roomId].players.push(socket.id)
        socket.join(roomId)

        if (rooms[roomId].players.length === 2){
            rooms[roomId].currentPlayer = rooms[roomId].players[0]
            io.to(roomId).emit('start', {
                players: rooms[roomId].players,  
                currentPlayer: rooms[roomId].players[0]  
            })
        }
    })

    socket.on('disconnect', () => {
        console.log('Jugador desconectado:', socket.id)
    })

    socket.on('move', ({ roomId, index }) => {
        console.log('move recibido en servidor:', socket.id, index)
        const room = rooms[roomId]

        if (room.currentPlayer !== socket.id) return 
        if (room.board[index] !== '') return
        const value = socket.id === room.players[0] ? 'X' : 'O'
        room.board[index] = value
        room.currentPlayer = room.players[0] === socket.id ? room.players[1] : room.players[0]
        
        io.to(roomId).emit('move', { index, value, nextPlayer: room.currentPlayer })
    })
})