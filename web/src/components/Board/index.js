import React, { useState, useEffect} from 'react'
import {Redirect} from 'react-router-dom'
import Square from './Square';
import Wait from './Wait'
import Status from './Status'
import ScoreBoard from './ScoreBoard'
import PlayAgain from './PlayAgain'


import io from 'socket.io-client'
import qs from 'qs'
const socket = io.connect('http://localhost:4000')



const Board = (p) => {
    const [state, setState] = useState({
        game: new Array(49).fill(null),
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


    useEffect(() => {    
        const {room, name} = qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        })
        setState(state =>({...state, room:room}))
        let socketID = state.socketID
        socket.emit('newRoomJoin', {room, name, socketID})
        

        socket.on('waiting', () => {
            setState(state => ({...state, waiting:true, currentPlayerScore: 0, opponentPlayer: []}))
        })

        socket.on('starting', ({gameState, players, turn})=> {
            setState(state => ({...state, waiting:false}))
            gameStart(gameState, players, turn)
        })

        socket.on('joinError', () => {
            setState(state => ({...state, joinError:true}))
        })

        socket.on('pieceAssignment', ({piece, id}) => {
            setState(state => ({...state, piece:piece, socketID:id}))
        })

        socket.on('update', ({gameState, turn}) => handleUpdate(gameState, turn))
        socket.on('winner', ({gameState,id}) => handleWin(id, gameState))
        socket.on('draw', ({gameState}) => handleDraw(gameState))
        socket.on('restart', ({gameState, turn}) => handleRestart(gameState, turn))

        return () => {
            socket.disconnect()
        }
    }, [state])



    const gameStart = (gameState, players, turn) => {
        const opponent = players.filter(([id]) => id!== state.socketID)[0][1]
        setState(state=>({...state, opponentPlayer: [opponent, 0], end: false}))
        setBoard(gameState)
        setTurn(turn)
        setMessage()
    }

    const handleClick = (index) => {
        const {game, piece, end, turn, room} = state
        if (!(index % 7 === 0 || index % 7 === 6)){
            if((game[index-1]===null && game[index+1]===null)) return
          }
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
          setState(state => ({...state, currentPlayerScore: playerScore, statusMessage: 'You Win'}))
        } else {
          const opponentScore = state.opponentPlayer[1] + 1
          const opponent = state.opponentPlayer
          opponent[1] = opponentScore
          setState(state => ({...state, opponentPlayer: opponent, statusMessage: `${this.state.opponentPlayer[0]} Wins`}))
        }
        setState(state => ({...state, end: true}))
    }

    const handleDraw = (gameState) => {
        setBoard(gameState)
        setState(state => ({...state, end: true, statusMessage: 'Draw'}))
    }

    const playAgainRequest = () => {
        socket.emit('playAgainRequest', state.room)
    }

    const handleRestart = (gameState, turn) => {
        setBoard(gameState)
        setTurn(turn)
        setMessage()
        setState(state => ({...state, end: false}))
    }

    const setMessage = () => {
        const message = state.turn?'Your Turn':`${state.opponentPlayer[0]}'s Turn`
        setState(state => ({...state, statusMessage: message}))
    }

    const setTurn = (turn) => {
        if (state.piece === turn){
            setState(state => ({...state, turn: true})) 
        } else {
            setState(state => ({...state, turn: false}))
        }
    }
    
    const setBoard = (gameState) => {
        setState(state => ({...state, game: gameState}))
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
        for (let i=0; i<49; i++){
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