const express = require('express')
const fs = require('fs')
const server = express()

const preapreMetaTags = (req, res) => {
  fs.readFile(`${__dirname}/dist/index.html`, 'utf8', (err, contents) => {
    if (err) {
      throw err
    }
    const meta = `<title>This title was generated by the server!</title>`
    const index = contents.replace('<custom-meta-tags>', meta)
    res.send(index)
  })
}
server.get('/', preapreMetaTags)
server.use(express.static(`${__dirname}/dist`))
server.get('*', preapreMetaTags)
server.listen(3000, () => console.log('Server running on port 3000'))