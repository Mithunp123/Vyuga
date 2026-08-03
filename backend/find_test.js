const fs = require('fs')
const content = fs.readFileSync('c:/Users/dharu/Downloads/Vyuga/backend/server.js', 'utf8')
const lines = content.split('\n')
let output = ''
lines.forEach((line, i) => {
  if (line.includes('TEST_')) {
    output += `Line ${i + 1}: ${line}\n`
  }
})
fs.writeFileSync('c:/Users/dharu/Downloads/Vyuga/backend/out.txt', output)
console.log("Done")
