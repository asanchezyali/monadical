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
    rooms.set(newRoom, {roomId: newRoom, players: [], board: null, winner: null, status: 'inactive', mode: 'person'})
    resolve(newRoom)
}

const joinRoom = (player, room) => {
    let currentRoom = rooms.get(room)
    currentRoom.players.push(player)
}

const setMode = (room, mode) => {
    let currentRoom = rooms.get(room)
    currentRoom.mode = mode
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
    if (currentRoom.mode === 'bot') {
        currentRoom.players[0].piece = 'X'
        currentRoom.players[1].piece = 'O'
    } else {
        currentRoom.players[0].piece = firstPiece
        currentRoom.players[1].piece = lastPiece
    }
}

function newGame(room) {
    let currentRoom = rooms.get(room)
    currentRoom.board = new Board
}

function playBot(room, piece) {
    let currentRoom = rooms.get(room)
    let currentBoard = currentRoom.board
    let game = currentBoard.game
    while (true) {
        let index = Math.floor(Math.random() * 48)
        if (!(index % 7 === 0 || index % 7 === 6)) {
            if (!(game[index - 1] === null && game[index + 1] === null) && game[index] === null){
                if (piece !== 'X') {
                    currentBoard.move(index, 'X')
                    return 'X'
                } else {
                    currentBoard.move(index, 'O')
                    return 'O'
                }
            }
        }
    }
}

io.on('connection', socket => {

    socket.on('newGame', ({mode}) => {
        try {
            new Promise(makeRoom).then((room) => {
                setMode(room, mode)
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
            const currentRoom = rooms.get(room)
            if (currentRoom.mode === 'bot') {
                socket.join(room)
                const newPlayer = new Player('bot', room, id + 'bot')
                joinRoom(newPlayer, room)

                pieceAssignment(room)

                let currentPlayers = rooms.get(room).players
                let turn
                for (const player of currentPlayers) {
                    if (player.name !== 'bot') {
                        io.to(player.id).emit('pieceAssignment', {piece: player.piece, id: player.id})
                        turn = player.piece
                     }
                }
                newGame(room)

                const currentRoom = rooms.get(room)
                const gameState = currentRoom.board.game
                const players = currentRoom.players.map((player) => [player.id, player.name])
                io.to(room).emit('starting', {gameState, players, turn})
                createRoom(currentRoom).then(r => console.log('Room saved ...'))
                createPlayer(currentRoom.players[0]).then(r => console.log('Player saved ...'))
                createPlayer(currentRoom.players[1]).then(r => console.log('Player saved ...'))

            }

            if (peopleInRoom === 1 && currentRoom.mode === 'person') {
                io.to(room).emit('waiting')
            }

            if (peopleInRoom === 2 && currentRoom.mode === 'person') {

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

            if (peopleInRoom === 3 && currentRoom.mode === 'person') {
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

            if (currentRoom.mode === 'bot'){
                const pieceBot = playBot(room, piece)
                if (currentBoard.checkWinner(piece)) {
                    io.to(room).emit('winner', {gameState: currentBoard.game, id: player.id})
                    updateRoom(room, piece).then(r => console.log('Game finished ...'))
                    return
                }
                if (currentBoard.checkWinner(pieceBot)) {
                    io.to(room).emit('winner', {gameState: currentBoard.game, id: 'bot'})
                    updateRoom(room, pieceBot).then(r => console.log('Game finished ...'))
                    return
                }
            }

            if (currentBoard.checkWinner(piece)) {
                io.to(room).emit('winner', {gameState: currentBoard.game, id: socket.id})
                updateRoom(room, piece).then(r => console.log('Game finished ...'))
            } else if (currentBoard.checkDraw()) {
                io.to(room).emit('draw', {gameState: currentBoard.game})
            } else {
                if (currentRoom.mode === 'bot'){
                    io.to(room).emit('update', {gameState: currentBoard.game, turn: currentBoard.turn})
                } else {
                    currentBoard.switchTurn()
                    io.to(room).emit('update', {gameState: currentBoard.game, turn: currentBoard.turn})
                }
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