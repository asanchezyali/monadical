export function calculateWinnerByRows(squares) {
    let lines = []

    for (let i = 0; i < 7; i++) {
        let row = squares.slice(7 * i, 7 * (i + 1))
        for (let i = 0; i<row.length; i++) {
            if (row[i] === null) {
                row[i] = '@'
            }
        }
        lines.push(row.join(''))
    }

    let lines_string = lines.join('-')
    console.log(lines_string)

    if (/XXXX/.test(lines_string)) {
        return 'X'
    }

    if (/OOOO/.test(lines_string)) {
        return 'O'
    }
    
    return null   
}

function calculateWinnerByDiagonals(squares) {
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
        diagonals_indexes[i].forEach(index => diagonal.push(squares[index]))

        for (let i = 0; i<diagonal.length; i++) {
            if (diagonal[i] === null) {

                diagonal[i] = '@'
            }
        }

        if (/XXXX/.test(diagonal.join(''))) {
            
            return 'X'
        }

        if (/OOOO/.test(diagonal.join(''))) {
            return 'O'
        }        
    }
    
    return null   
}

export function calculateWinner(squares) {
    return calculateWinnerByRows(squares) || calculateWinnerByDiagonals(squares) 
}



