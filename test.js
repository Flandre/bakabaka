const xlsx = require('node-xlsx');
const file = xlsx.parse('./test.xlsx');
console.log(JSON.stringify(file));