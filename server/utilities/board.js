class Board{
    constructor() {
        this.game = new Array(49).fill(null);
        this.end = false
        this.turn = 'X'
        this.switch = new Map([['X', 'O'], ['O', 'X']])
    }

    move(index, piece){
        if (!this.game[index] && !this.end){
            const newState = [...this.game]
            newState.splice(index, 1, piece)
            this.game = newState
        }
    }

    switchTurn(){
        this.turn = this.switch.get(this.turn)
    }

    checkWinner(player){
        const isWinnerByRows = calculateWinnerByRows(this.game) === player 
        const isWinnerByDiagonals = calculateWinnerByDiagonals(this.game) === player
        const isWinnerByColumns = calculateWinnerByColumns(this.game) === player
        return isWinnerByRows || isWinnerByDiagonals || isWinnerByColumns
    }
    
    checkDraw(){
        return this.game.every(value => value !== null)
    }

    reset(){
        this.game = new Array(49).fill(null)
        this.turn = 'X'
    }
}

function calculateWinnerByRows(game) {
    let rows = []
    for (let index = 0; index < 7; index++) {
        let row = game.slice(7 * index, 7 * (index + 1))
        for (let index = 0; index < row.length; index++) {
            if (row[index] === null) {
                row[index] = '@'
            }
        }
        rows.push(row.join(''))
    }
    let string = rows.join('-')
    if (/XXXX/.test(string)) { return 'X' }
    if (/OOOO/.test(string)) { return 'O' }
    return null
}

function calculateWinnerByColumns(game) {
    let columns = []
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 7; row++){
            if (game[col + 7 * row] === null) { columns.push('@') }
            else { columns.push(game[col + 7 * row])}
        }
        columns.push('-')
    }

    let string = columns.join('')
    if (/XXXX/.test(string)) { return 'X' }
    if (/OOOO/.test(string)) { return 'O' }
    return null
}

function calculateWinnerByDiagonals(game) {
    let diagonals_indexes = [
        [21, 29, 37, 45], 
        [14, 22, 30, 38, 46], 
        [7, 15, 23, 31, 39, 47], 
        [0, 8, 16, 24, 32, 40, 48],
        [1, 9, 17, 25, 33, 41],
        [2, 10, 18, 26, 34],
        [3, 11, 19, 27],
        [3, 9, 15, 21], 
        [4, 10, 16, 22, 28], 
        [5, 11, 17, 23, 24, 35], 
        [6, 12, 18, 24, 30, 36, 42],
        [13, 19, 25, 31, 37, 43],
        [20, 26, 32, 38, 44],
        [27, 33, 39, 45]
    ]
    for (let i = 0; i<diagonals_indexes.length; i++) {
        let diagonal = []
        diagonals_indexes[i].forEach(index => diagonal.push(game[index]))
        for (let i = 0; i<diagonal.length; i++) {
            if (diagonal[i] === null) { diagonal[i] = '@' }
        }
        if (/XXXX/.test(diagonal.join(''))) { return 'X' }
        if (/OOOO/.test(diagonal.join(''))) { return 'O' }
    }
    return null   
}

module.exports = Board