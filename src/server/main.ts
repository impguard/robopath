import * as http from "http"
import * as socketio from "socket.io"

//
// Setup game manager
//


const server = http.createServer()
const io = socketio(server)

const sockets: socketio.Socket[] = []
io.on("connection", socket => {
})

server.listen(8080)