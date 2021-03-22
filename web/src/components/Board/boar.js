import React, { useState, useEffect} from 'react'
import {Redirect} from 'react-router-dom'

import Square from './Square';
import Wait from './Wait'
import Status from './Status'
import ScoreBoard from './ScoreBoard'
import PlayAgain from './PlayAgain'


import io from 'socket.io-client'
import qs from 'qs'
import { version } from 'react-dom';
const socket = io.connect('http://localhost:4000')




const Board = (p) => {
    const [state, setState] = useState({
        game: new Array(9).fill(null),
        piece: 'X',
        turn: true,
        end: false,
        room: '',
        statusMessage: '',
        currentPlayerScore: 0,
        opponentPlayer: [],
        waiting: false,
        joinError: false,
        socketID: null
    })

    console.log(state)
    useEffect(() => {    
        const {room, name} = qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        })
        state.room = room
        setState(state)
        socket.emit('newRoomJoin', {room, name})

        socket.on('waiting', () => {
            console.log('Waiting ...')
            state.waiting = true
            state.currentPlayerScore = 0
            state.opponentPlayer = []
            setState(state)
            console.log(state)
        })

        socket.on('starting', ({gameState, players, turn})=> {
            state.waiting = false
            setState(state)
            gameStart(gameState, players, turn)
        })

        socket.on('joinError', () => {
            state.joinError = true
            setState(state)
        })

        socket.on('pieceAssignment', ({piece, id}) => {
            state.piece = piece
            state.socketID = id
            setState(state)
        })

        socket.on('update', ({gameState, turn}) => handleUpdate(gameState, turn))
        socket.on('winner', ({gameState,id}) => handleWin(id, gameState))
        socket.on('draw', ({gameState}) => handleDraw(gameState))
        socket.on('restart', ({gameState, turn}) => handleRestart(gameState, turn))
    })

    const gameStart = (gameState, players, turn) => {
        const opponent = players.filter(([id]) => id!== state.socketID)[0][1]
        state.opponentPlayer = [opponent, 0]
        state.end = false
        setState(state)
        setBoard(gameState)
        setTurn(turn)
        setMessage()
    }

    const handleClick = (index) => {
        const {game, piece, end, turn, room} = state
        if (!game[index] && !end && turn){
            socket.emit('move', {room, piece, index})
        }
    }

    const handleUpdate = (gameState, turn) => {
        setBoard(gameState)
        setTurn(turn)
        setMessage()
    }

    const handleWin = (id, gameState) => {
        setBoard(gameState)
        if (state.socketID === id){
          const playerScore = state.currentPlayerScore + 1
          state.currentPlayerScore = playerScore
          state.statusMessage = 'You Win'
          setState(state)
        } else {
          const opponentScore = state.opponentPlayer[1] + 1
          const opponent = state.opponentPlayer
          opponent[1] = opponentScore
          state.opponentPlayer = opponent
          state.statusMessage = `${this.state.opponentPlayer[0]} Wins`
          setState(state)
        }
        state.end = true
        setState(state)
    }

    const handleDraw = (gameState) => {
        setBoard(gameState)
        state.end = true
        state.statusMessage = 'Draw'
        setState(state)
    }

    const playAgainRequest = () => {
        socket.emit('playAgainRequest', state.room)
    }

    const handleRestart = (gameState, turn) => {
        setBoard(gameState)
        setTurn(turn)
        setMessage()
        state.end = false
        setState(state)
    }

    const setMessage = () => {
        const message = state.turn?'Your Turn':`${state.opponentPlayer[0]}'s Turn`
        state.statusMessage = message
        setState(state)
    }

    const setTurn = (turn) => {
        if (state.piece === turn){
            state.turn = true
            setState(state)
        } else {
            state.turn = false
            setState(state)
        }
    }
    
    const setBoard = (gameState) => {
        state.game = gameState
        setState(state)
    }

    const renderSquare = (i) => {
        return (
        <Square 
            key={i}
            value={state.game[i]}
            player={state.piece}
            end={state.end}
            id={i}
            onClick={handleClick}
            turn={state.turn}
        /> 
        )
    }


    if (state.joinError){
        return(<Redirect to={`/`}/>)
    } else {
        const squareArray = []
        for (let i=0; i<9; i++){
            const newSquare = renderSquare(i)
            squareArray.push(newSquare)
        }

        return(
            <>
                <Wait display={ state.waiting } room={ state.room }/>
                <Status message={state.statusMessage}/>
                <div className="board">
                    {squareArray}
                </div>
                <ScoreBoard data={{
                    player1:['You', state.currentPlayerScore], 
                    player2:[state.opponentPlayer[0], 
                    state.opponentPlayer[1]]
                }}/>
                <PlayAgain end={state.end} onClick={playAgainRequest}/>
            </>
        )



    }




}

export default Board