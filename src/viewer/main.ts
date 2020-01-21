import * as io from "socket.io-client"

import { Simulation } from "../shared/state"
import { Vec } from "../shared/vec"
import * as vec from "../shared/vec"
import { flowa } from "../shared/util"

const settings = {
  padding: 25,
  gridSize: 70,
  gridStyle: "black",
  gridLineWidth: 2,
  unavailableNodeStyle: "lightgrey",
  obstacleNodeStyle: "red",
}

//
// Viewer Entrypoint
// 

const initialize = (canvas: HTMLCanvasElement) => {
  const socket = io.connect("http://localhost:8080")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw Error("Could not acquire canvas rendering context. Disabling viewer.")
  }

  socket.emit("ready", "viewer")

  let simulation: Simulation

  // Handle server updates
  socket.on("update", (packet: Simulation) => {
    simulation = packet

    const localToRender = (localValue: number): number => {
      return localValue * settings.gridSize + settings.padding
    }

    // Setup canvas
    const width = simulation.graph.localSize.x * settings.gridSize
    const height = simulation.graph.localSize.y * settings.gridSize

    canvas.width = width + settings.padding * 2
    canvas.height = height + settings.padding * 2

    ctx.clearRect(0, 0, width, height)

    // Render nodes
    for (let i = 0; i < simulation.graph.localSize.x; i++) {
      for (let j = 0; j < simulation.graph.localSize.y; j++) {
        const xl = localToRender(i)
        const yl = localToRender(j)

        const node = simulation.graph.nodes[i][j]

        if (node.isObstacle) {
          ctx.fillStyle = settings.obstacleNodeStyle
          ctx.fillRect(xl, yl, settings.gridSize, settings.gridSize)
        } else if (!node.isAvailable) {
          ctx.fillStyle = settings.unavailableNodeStyle
          ctx.fillRect(xl, yl, settings.gridSize, settings.gridSize)
        }
      }
    }

    // Render grid
    ctx.strokeStyle = settings.gridStyle
    ctx.lineWidth = settings.gridLineWidth

    for (let i = 0; i <= simulation.graph.localSize.x; i++) {
      const x = localToRender(i)
      ctx.beginPath()
      ctx.moveTo(x, settings.padding)
      ctx.lineTo(x, settings.padding + height)
      ctx.stroke()
    }

    for (let j = 0; j <= simulation.graph.localSize.y; j++) {
      const y = localToRender(j)
      ctx.beginPath()
      ctx.moveTo(settings.padding, y)
      ctx.lineTo(settings.padding + width, y)
      ctx.stroke()
    }
  })
  
  // Handle clicks
  canvas.addEventListener("click", event => {
    const renderToLocal = (renderValue: number): number => {
      return Math.floor((renderValue - settings.padding) / settings.gridSize)
    }

    const rect = canvas.getBoundingClientRect()
    const i = renderToLocal(event.clientX - rect.left)
    const j = renderToLocal(event.clientY - rect.top)
    
    const isOutOfBounds = i < 0 
      || i > simulation.graph.localSize.x 
      || j < 0 
      || j > simulation.graph.localSize.y

    if (isOutOfBounds) {
      return
    }

    socket.emit("obstacle", { x: i, y: j })
  })
}

//
// Setup Global Entrypoint
//

declare global {
  interface Window { robopath: any }
}

window.robopath = {
  initialize,
}