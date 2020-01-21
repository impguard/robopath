import * as http from "http"
import * as socketio from "socket.io"

import * as graph from "../shared/graph"
import { Vec } from "../shared/vec"
import { Simulation } from "../shared/state"

const settings = {
  viewerUpdateIntervalMs: 20,
  serverPort: 8080,
}

//
// Setup simple simulation
//

const simulation: Simulation = {
  graph: graph.create({ x: 20, y: 20 }, { x: 100, y: 100 }),
  bots: [],
}

// Temporarily set random nodes to obstacles
simulation.graph.nodes[5][5].isObstacle = true

// Temporarily set random nodes availability to false
simulation.graph.nodes[3][4].isAvailable = false

//
// Setup Socket Server
//

const server = http.createServer()
const io = socketio(server)

const viewers: socketio.Socket[] = []
io.on("connection", socket => {

  socket.on("ready", type => {
    switch (type) {
      case "viewer": {
        viewers.push(socket)
        break
      }
      default: {
        socket.disconnect()
        throw Error(`Unknown socket type: ${type}. Dropping connection`)
      }
    }
  })

  socket.on("obstacle", (position: Vec) => {
    simulation.graph.nodes[position.x][position.y].isObstacle = 
      !simulation.graph.nodes[position.x][position.y].isObstacle
  })
})

setInterval(dt => {
  viewers.forEach(socket => {
    socket.volatile.emit("update", simulation)
  })

}, settings.viewerUpdateIntervalMs)

server.listen(settings.serverPort)