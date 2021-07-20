const fs = require('fs');

const sortedproblems = fs.readFileSync('../sortedproblems', 'utf8'),
    sortedproblemsList = sortedproblems.split('\n');

const problemsJson = new Array();

for (let i = 0; i < sortedproblemsList.length; ++i) {

    const problem = sortedproblemsList[i];
    if (problem.length === 0) break; // Last line

    // Number Theory 2 Untitled problem   problems/_______________/_______________
    //console.log(problem);
    const match = problem.match(/^(Algebra|Biology|Geometry|Number Theory|Calculus|Probability|Basic Mathematics|Logic|Classical Mechanics|Electricity and Magnetism|Computer Science|Quantitative Finance|Chemistry|Number Theory and Algebra|SAT® Math|uncategorized) (\d)?\s+(.*)\s+(problems\/.*)$/),
        problemCategory = match[1],
        problemLevel = parseInt(match[2]) || 0,
        problemName = match[3].trim(),
        problemPath = match[4];

    problemsJson.push({
        c: problemCategory,
        l: problemLevel,
        n: problemName,
        p: problemPath
    });

    //if (i % 100 === 0) console.log(i + "/" + sortedproblemsList.length + " completed");
}

console.log( JSON.stringify(problemsJson) );
