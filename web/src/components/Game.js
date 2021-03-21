import React, { useState, useRef, useEffect } from 'react'
import io from "socket.io-client"
import Board from './Board'
import { calculateWinner } from '../helpers'

const socket = io.connect("http://localhost:4000")

const styles = {
    width: '200px',
    margin: '50px auto'
}

const Game = () => {
    const [history, setHistory] = useState([Array(49).fill(null)])
    const [stepNumber, setStepNumber] = useState(0)
    const [xIsNext, setXisNext] = useState(true)

    const winner = calculateWinner(history[stepNumber])

    useEffect(() => {
        socket.on("state", ({ history, xIsNext, stepNumber}) => {
            setHistory(history)
            setStepNumber(stepNumber)
            setXisNext(!xIsNext)
        })
    })

    const handleClick = i => {
        const timeInHistory = history.slice(0, stepNumber + 1)
        const current = timeInHistory[stepNumber]
        const squares = [...current]

        if (!(i % 7 === 0 || i % 7 === 6)){
            if((squares[i-1]===null && squares[i+1]===null)) return
                if (winner || squares[i]) return
                squares[i] = xIsNext ? 'X' : 'O'
                setHistory([...timeInHistory, squares])
                setStepNumber(timeInHistory.length)
                setXisNext(!xIsNext)
                socket.emit("state", { history, xIsNext, stepNumber })
        } else {
            if (winner || squares[i]) return
            squares[i] = xIsNext ? 'X' : 'O'
            setHistory([...timeInHistory, squares])
            setStepNumber(timeInHistory.length)
            setXisNext(!xIsNext)
            socket.emit("state", { history, xIsNext, stepNumber })
        }
        
    }

    const jumpTo = (step) => {
        setStepNumber(step)
        setXisNext(step % 2 === 0)
    }

    const renderMoves = () => (
        history.map((_step, move) => {
            const destination = move ? `Got to move#${move}` : 'Go to start'
            return (
                <li key={move}>
                    <button onClick={() => jumpTo(move)}>{destination}</button>
                </li>                
            )
        })
        
    )

    return (
        <>
        <Board squares={history[stepNumber]} onClick={handleClick}></Board>
        <div style={styles}>
            <p>{ winner ? 'Winner: ' + winner : 'Next Player: ' + (xIsNext ? 'X': 'O')}</p>
            <p>{stepNumber}</p>
        </div>
        </>
    )
}

export default Game