const {Pool} = require('pg')

const config = {
    host: 'localhost',
    user: 'postgres',
    password: '',
    database: 'lib',
    port: '5432'
}

const pool = new Pool(config)

async function execute(query) {
    return pool.query(query)
        .then(response => {
            console.log('Execute slq command ... ')
            return true
        })
        .catch(err => {
            console.error(err)
            return false
        })
}

const createRoom = async (room) => {
    const query = `
        INSERT INTO rooms(id, playerIdOne, playerIdTwo, status)
        VALUES ('${room.roomId}', '${room.players[0].id}', '${room.players[1].id}', '${room.status}');
    `
    const result = await execute(query)
    return result === false ? 500 : 200
}

const createPlayer = async (player) => {
    const query = `
        INSERT INTO players(id, name)
        VALUES ('${player.id}', '${player.name}');
    `
    const result = await execute(query)
    return result === false ? 500 : 200
}

const createMove = async (player, move) => {
    const query = `
        INSERT INTO moves(roomId, move, playerId, piece)
        VALUES ('${player.room}', '${move}', '${player.id}', '${player.piece}');
    `
    const result = await execute(query)
    return result === false ? 500 : 200
}

const updateRoom = async (room, winner) => {
    const query = `
    UPDATE rooms
       SET status = 'finished',
           winner = '${winner}'            
     WHERE id = '${room}';
    `
    const result = await execute(query)
    return result === false ? 500 : 200
}

module.exports = { createRoom, createPlayer, createMove, updateRoom}