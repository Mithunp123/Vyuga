const fs = require('fs')
const content = fs.readFileSync('c:/Users/dharu/Downloads/Vyuga/backend/server.js', 'utf8')
const lines = content.split('\n')
lines.forEach((line, i) => {
  if (line.includes('send-certificate') || line.includes('api/admin/preview-certificate')) {
    console.log(`Line ${i + 1}: ${line}`)
    // print context
    for (let j = i + 1; j < Math.min(lines.length, i + 30); j++) {
      console.log(`Line ${j + 1}: ${lines[j]}`)
    }
    console.log('---')
  }
})
