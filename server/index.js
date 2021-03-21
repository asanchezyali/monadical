const app = require('express')()
const httpServer = require('http').createServer(app)
const options = {
    pingTimeout: 30000,
    cors: {
        origin: ["http://localhost:3001"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
}
const io = require('socket.io')(httpServer, options)

io.on('connection', socket => {
    socket.on('state', ({ history, xIsNext, stepNumber }) => {
        console.log(history)
        io.emit("state", { history, xIsNext, stepNumber })
    })
})

io.on("disconnect", (reason) => {
    console.log(reason)
})

httpServer.listen(4000, () => (console.log('listening on port 4000')))