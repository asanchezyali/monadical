const {randRoom, randPiece} = require('./utilities/utils')
const Player = require('./utilities/player')
const Board = require('./utilities/board')
const {createRoom, createPlayer, createMove, updateRoom} = require('./database/postgresql')

const cors = require('cors')
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const PORT = process.env.PORT || '4000'

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(cors())

const rooms = new Map()

const makeRoom = (resolve) => {
    let newRoom = randRoom()
    while (rooms.has(newRoom)) {
        newRoom = randRoom()
    }
    rooms.set(newRoom, {roomId: newRoom, players: [], board: null, winner: null, status: 'inactive'})
    resolve(newRoom)
}

const joinRoom = (player, room) => {
    let currentRoom = rooms.get(room)
    currentRoom.players.push(player)
}

function kick(room) {
    let currentRoom = rooms.get(room)
    currentRoom.players.pop()
}

function getRoomPlayersNum(room) {
    return rooms.get(room).players.length
}

function pieceAssignment(room) {
    const firstPiece = randPiece()
    const lastPiece = firstPiece === 'X' ? 'O' : 'X'
    let currentRoom = rooms.get(room)
    currentRoom.players[0].piece = firstPiece
    currentRoom.players[1].piece = lastPiece
}

function newGame(room) {
    let currentRoom = rooms.get(room)
    currentRoom.board = new Board
}

io.on('connection', socket => {

    socket.on('newGame', () => {
        try {
            new Promise(makeRoom).then((room) => {
                socket.emit('newGameCreated', room)
            })
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('New game ...')
        }
    })

    socket.on('joining', ({room}) => {
        try {
            if (rooms.has(room)) {
                console.log('joinConfirmed')
                socket.emit('joinConfirmed')
            } else {
                socket.emit('errorMessage', 'No room with that ID found')
            }
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('joining ...')
        }
    })

    socket.on('newRoomJoin', ({room, name}) => {
        try {
            if (room === '' || name === '') {
                io.to(socket.id).emit('joinError')
            }

            socket.join(room)
            const id = socket.id
            const newPlayer = new Player(name, room, id)
            joinRoom(newPlayer, room)

            const peopleInRoom = getRoomPlayersNum(room)

            if (peopleInRoom === 1) {
                io.to(room).emit('waiting')
            }

            if (peopleInRoom === 2) {
                pieceAssignment(room)
                let currentPlayers = rooms.get(room).players
                for (const player of currentPlayers) {
                    io.to(player.id).emit('pieceAssignment', {piece: player.piece, id: player.id})
                }
                newGame(room)

                const currentRoom = rooms.get(room)
                const gameState = currentRoom.board.game
                const turn = currentRoom.board.turn
                const players = currentRoom.players.map((player) => [player.id, player.name])
                io.to(room).emit('starting', {gameState, players, turn})
                createRoom(currentRoom).then(r => console.log('Room saved ...'))
                createPlayer(currentRoom.players[0]).then(r => console.log('Player saved ...'))
                createPlayer(currentRoom.players[1]).then(r => console.log('Player saved ...'))
            }

            if (peopleInRoom === 3) {
                socket.leave(room)
                kick(room)
                io.to(socket.id).emit('joinError')
            }
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('New Room Join ...')
        }
    })

    socket.on('move', ({room, piece, index}) => {
        try {
            let currentRoom = rooms.get(room)
            let currentBoard = currentRoom.board
            currentBoard.move(index, piece)
            let player = currentRoom.players.filter(player => player.piece === piece)[0]
            createMove(player, index).then(r => console.log('Registered a move ...'))

            if (currentBoard.checkWinner(piece)) {
                io.to(room).emit('winner', {gameState: currentBoard.game, id: socket.id})
                updateRoom(room, piece).then(r => console.log('Game finished ...'))
            } else if (currentBoard.checkDraw()) {
                io.to(room).emit('draw', {gameState: currentBoard.game})
            } else {
                currentBoard.switchTurn()
                io.to(room).emit('update', {gameState: currentBoard.game, turn: currentBoard.turn})
            }
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('Move ...')
        }
    })

    socket.on('playAgainRequest', (room) => {
        try {
            let currentRoom = rooms.get(room)
            currentRoom.board.reset()
            pieceAssignment(room)
            let currentPlayers = currentRoom.players
            for (const player of currentPlayers) {
                io.to(player.id).emit('pieceAssignment', {piece: player.piece, id: player.id})
            }

            io.to(room).emit('restart', {gameState: currentRoom.board.game, turn: currentRoom.board.turn})
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('Playing again...')
        }
    })

    socket.on('disconnecting', () => {
        try {
            const currentRooms = Object.keys(socket.rooms)

            if (currentRooms.length === 2) {
                const room = currentRooms[1]
                const num = getRoomPlayersNum(room)
                if (num === 1) {
                    rooms.delete(room)
                }
                if (num === 2) {
                    let currentRoom = rooms.get(room)
                    currentRoom.players = currentRoom.players.filter((player) => player.id !== socket.id)
                    io.to(room).emit('waiting')
                }
            }
        } catch (error) {
            console.log(error.message)
        } finally {
            console.log('Disconnecting ...')
        }
    })
})


server.listen(PORT, () => console.log(`Listening on port ${PORT}`))