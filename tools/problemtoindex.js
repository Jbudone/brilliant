const fs = require('fs');

const PROBLEM = process.argv[2];

let PROBLEM_LIST_PATH = 'rawproblems';

let rawproblems = fs.readFileSync(PROBLEM_LIST_PATH, 'utf8');
let rawproblemsList = rawproblems.split('\n');

for (let i = 0; i < rawproblemsList.length; ++i) {
    if (rawproblemsList[i].indexOf(`problems/${PROBLEM}/${PROBLEM} `) === 0) {
        console.log(`${i} -- ${PROBLEM}`);
        process.exit();
    }
}

console.log(`Couldn't find problem -- ${PROBLEM}`);
