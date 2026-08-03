const fs = require('fs')
const content = fs.readFileSync('c:/Users/dharu/Downloads/Vyuga/backend/server.js', 'utf8')
const lines = content.split('\n')
let out = ''
lines.forEach((line, i) => {
  if (line.includes('send-certificate')) {
    out += `Line ${i + 1}: ${line}\n`
  }
})
fs.writeFileSync('c:/Users/dharu/Downloads/Vyuga/backend/output.txt', out)
