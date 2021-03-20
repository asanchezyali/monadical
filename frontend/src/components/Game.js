import React, { useState } from 'react'
import Board from './Board'
import { calculateWinner } from '../helpers'

const styles = {
    width: '200px',
    margin: '20px auto'
}

const Game = () => {
    const [history, setHistory] = useState([Array(49).fill(null)])
    const [stepNumber, setStepNumber] = useState(0)
    const [xIsNext, setXisNext] = useState(true)
    const winner = calculateWinner(history[stepNumber])


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
        } else {
            if (winner || squares[i]) return
            squares[i] = xIsNext ? 'X' : 'O'
            setHistory([...timeInHistory, squares])
            setStepNumber(timeInHistory.length)
            setXisNext(!xIsNext)
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
            {renderMoves()}
        </div>
        </>
    )
}

export default Game