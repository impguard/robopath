import * as io from "socket.io-client"
import * as _ from "lodash"

import * as state from "../shared/state"


const setupViewer = (canvas: HTMLCanvasElement) => {
  const socket = io.connect("http://localhost:8080")
  socket.emit("ready", "viewer")

  // Snapshot retrieval
  let simulation: state.Simulation = null
  socket.on("snapshot", (snapshot: state.Simulation) => {
    simulation = snapshot
    // console.log("Received snapshot", snapshot)
  })

  // Canvas click events
  canvas.addEventListener("click", e => {
    if (!simulation) {
      return
    }

    const ratio = canvas.width / simulation.settings.width

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / ratio
    const y = (e.clientY - rect.top) / ratio

    _.forEach(simulation.nodes, node => {
      const inX = x > node.pos.x && x <= node.pos.x + node.size.x
      const inY = y > node.pos.y && y <= node.pos.y + node.size.y

      if (inX && inY) {
        // Send an instruction to the server
      }
    })
  })


  // Render logic
  const render = () => {
    const ctx = canvas.getContext("2d")
    const ratio = canvas.width / simulation.settings.width

    // Render nodes
    ctx.strokeStyle = "black"
    _.forEach(simulation.nodes, node => {
      const x = ratio * node.pos.x
      const y = ratio * node.pos.y
      const width = ratio * node.size.x
      const height = ratio * node.size.y

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + width, y)
      ctx.lineTo(x + width, y + width)
      ctx.lineTo(x, y + width)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    // Render bots
    ctx.fillStyle = "blue"
    _.forEach(simulation.robots, robot => {
      const x = ratio * robot.pos.x
      const y = ratio * robot.pos.y
      const width = ratio * robot.size.x
      const height = ratio * robot.size.y

      ctx.fillRect(x, y, width, height)
    })
  }

  // Setup animation loop
  const frame = () => {
    if (simulation) {
      render()
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

//
// Viewer Entrypoint
//

declare global {
    interface Window { setupViewer: any }
}

window.setupViewer = setupViewer