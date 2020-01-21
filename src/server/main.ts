import * as http from "http"
import * as socketio from "socket.io"
import * as _ from "lodash"

import * as state from "../shared/state"
import { generateUniqueId } from "../shared/util"
import { Vec2 } from "../shared/vec"
import Simulation from "./Simulation"


const MAP_WIDTH = 10
const MAP_HEIGHT = 10
const CELL_SIZE = 10
const ROBOT_SIZE = 5

// Generate nodes 
const generateNode = (coord: Vec2, memo: state.Node[][]): number => {
  if (coord.x < 0 || coord.x >= MAP_WIDTH || coord.y < 0 || coord.y >= MAP_HEIGHT) {
    return null
  }

  const memoizedNode = memo[coord.x][coord.y]
  if (memoizedNode) {
    return memoizedNode.id
  }

  const node: state.Node = {
    id: generateUniqueId(),
    nodes: [],
    pos: Vec2(CELL_SIZE * coord.x, CELL_SIZE * coord.y),
    robot: null,
    size: Vec2(CELL_SIZE, CELL_SIZE),
  }

  memo[coord.x][coord.y] = node

  const left = generateNode(Vec2(coord.x - 1, coord.y), memo)
  const right = generateNode(Vec2(coord.x + 1, coord.y), memo)
  const up = generateNode(Vec2(coord.x, coord.y + 1), memo)
  const down = generateNode(Vec2(coord.x, coord.y - 1), memo)

  node.nodes = _.compact([left, right, up, down])

  return node.id
}

const memo: state.Node[][] = []
for (let i = 0; i < MAP_WIDTH; i++) {
  memo[i] = []
  for (let j = 0; j < MAP_HEIGHT; j++) {
    memo[i][j] = null
  }
}

generateNode(Vec2(0, 0), memo)
const nodes = _.flatten(memo)

// Generate simulation
const simulation = new Simulation({
  settings: {
    width: MAP_WIDTH * CELL_SIZE,
    height: MAP_HEIGHT * CELL_SIZE,
  },
  instructions: {
    completed: [],
    pending: [],
    queued: [],
  },
  nodes,
  robots: {},
})

// FIX: Temporarily add some robots arbitrarily
const padding = (CELL_SIZE - ROBOT_SIZE) / 2
simulation.createRobot(Vec2(
  memo[0][0].pos.x + padding,
  memo[0][0].pos.y + padding
), Vec2(ROBOT_SIZE, ROBOT_SIZE), [memo[0][0].id])
simulation.createRobot(Vec2(
  memo[5][9].pos.x + padding,
  memo[5][9].pos.y + padding
), Vec2(ROBOT_SIZE, ROBOT_SIZE), [memo[0][0].id])
simulation.createRobot(Vec2(
  memo[9][9].pos.x + padding,
  memo[9][9].pos.y + padding
), Vec2(ROBOT_SIZE, ROBOT_SIZE), [memo[0][0].id])

// Create server
const server = http.createServer()
const io = socketio(server)

const setupViewer = (socket: socketio.Socket) => {
  setInterval(() => {
    socket.emit("snapshot", simulation.snapshot())
  }, 100)
}

const setupRobot = socket => {

}

io.on("connection", socket => {
  socket.on("ready", type => {
    switch(type) {
      case "viewer": {
        setupViewer(socket)
        break
      }
      case "robot": {
        setupRobot(socket)
        break
      }
      default: {
        console.warn(`Unknown socket type ${type}. Closing connection.`)
        socket.disconnect()
      }
    }
  })
})

server.listen(8080)