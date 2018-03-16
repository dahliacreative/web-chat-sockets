const WebSocket = require('ws')
// const express = require('express')
// const fs = require('fs')
// const server = express()

// const preapreMetaTags = (req, res) => {
//   fs.readFile(`${__dirname}/dist/index.html`, 'utf8', (err, contents) => {
//     if (err) {
//       throw err
//     }
//     const meta = `<title>This title was generated by the server!</title>`
//     const index = contents.replace('<title>React App</title>', meta)
//     res.send(index)
//   })
// }
// server.get('/', preapreMetaTags)
// server.use(express.static(`${__dirname}/dist`))
// server.get('*', preapreMetaTags)
// server.listen(80, () => console.log('Server running on port 80'))

const wss = new WebSocket.Server({ port: 80 })

wss.on('connection', (ws) => {
  ws.send('Welcome to Rawchat!')
  ws.on('message', (m) => {
    ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(m)
      }
    })
  })
})