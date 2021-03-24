const {randRoom, randPiece} = require('./utilities/utils')
const Player = require('./utilities/player')
const Board = require('./utilities/board')

const cors = require('cors')
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const PORT = process.env.PORT || '4000'

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(cors())

// Store the room ids mapping to the room property object
// The room property object looks like this { roomID:str, players:Array(2) }
const rooms = new Map()

// Promise function to make sure room id is unique
const makeRoom = (resolve) => {
    let newRoom = randRoom()
    while (rooms.has(newRoom)) {
        newRoom = randRoom()
    }
    rooms.set(newRoom, {roomId: newRoom, players: [], board: null})
    resolve(newRoom)
}

// Put the newly joined player into a room's player list
const joinRoom = (player, room) => {
    let currentRoom = rooms.get(room)
    currentRoom.players.push(player)
}

// Remove the latest player joined from a room's player list
function kick(room) {
    let currentRoom = rooms.get(room)
    currentRoom.players.pop()
}

// Check how many player is currently in the room
function getRoomPlayersNum(room) {
    return rooms.get(room).players.length
}

// Assign x o values to each of the player class
function pieceAssignment(room) {
    const firstPiece = randPiece()
    const lastPiece = firstPiece === 'X' ? 'O' : 'X'
    let currentRoom = rooms.get(room)
    currentRoom.players[0].piece = firstPiece
    currentRoom.players[1].piece = lastPiece
}

// Initialize a new board to a room
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
        // If someone tries to go to the game page without a room or name then
        // redirect them back to the start page
        try {
            if (room === '' || name === '') {
                io.to(socket.id).emit('joinError')
            }

            // Put the new player into the room
            socket.join(room)
            const id = socket.id
            const newPlayer = new Player(name, room, id)
            joinRoom(newPlayer, room)

            // Get the number of player in the room
            const peopleInRoom = getRoomPlayersNum(room)

            // Need another player so emit the waiting event
            // to display the wait screen on the front end
            if (peopleInRoom === 1) {
                io.to(room).emit('waiting')
            }

            // The right amount of people so we start the game
            if (peopleInRoom === 2) {
                // Assign the piece to each player in the backend data structure and then
                // emit it to each of the player so they can store it in their state
                pieceAssignment(room)
                console.log(room)
                let currentPlayers = rooms.get(room).players
                for (const player of currentPlayers) {
                    io.to(player.id).emit('pieceAssignment', {piece: player.piece, id: player.id})
                }
                newGame(room)

                // When starting, the game state, turn and the list of both players in
                // the room are required in the front end to render the correct information
                const currentRoom = rooms.get(room)
                const gameState = currentRoom.board.game
                const turn = currentRoom.board.turn
                const players = currentRoom.players.map((player) => [player.id, player.name])
                io.to(room).emit('starting', {gameState, players, turn})
            }

            // Too many people so we kick them out of the room and redirect
            // them to the main starting page
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
            let currentBoard = rooms.get(room).board
            console.log(rooms.get(room))
            currentBoard.move(index, piece)

            if (currentBoard.checkWinner(piece)) {
                io.to(room).emit('winner', {gameState: currentBoard.game, id: socket.id})
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
            // Reassign new piece so a player can't always go first
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

    // On disconnect event
    socket.on('disconnecting', () => {
        try {
            // Get all the rooms that the socket is currently subscribed to
            const currentRooms = Object.keys(socket.rooms)
            // In this game an object can only have 2 rooms max so we check for that
            if (currentRooms.length === 2) {
                // The game room is always the second element of the list
                const room = currentRooms[1]
                const num = getRoomPlayersNum(room)
                // If one then no one is left so we remove the room from the mapping
                if (num === 1) {
                    rooms.delete(room)
                }
                // If 2 then there is one person left so we remove the socket leaving from the player list and
                // emit a waiting event to the other person
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