import React from 'react'

const style = {
    background: 'lightblue',
    border: '2px solid darkblue',
    fontSize: '30px',
    fontWeith: '800',
    cursor: 'pointer',
    outline: 'one'    
}

const Square = ({ value, onClick }) => (
    <button style={style} onClick={onClick}>
        {value}
    </button>
)

export default Square