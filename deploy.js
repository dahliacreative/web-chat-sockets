const fs = require('fs-extra')

fs.copy('build', 'dist', (err) => {
  if (err) {
    throw err
  }
  fs.remove('build')
})