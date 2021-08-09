const fs = require('fs');

let INPUT = 'out';
let OUTPUT = null;
let verbose = false;


// TODO:
//  - category -> categoryId
//  - level -> levelId
//  - source -> name
//  - copy images/assets in problem asset list  (problem['assets'])
//  - parse dates -> epoch


// Parse arguments
for (let i = 2; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (arg === '--verbose') {
        verbose = true;
    } else if (arg === '--input') {
        INPUT = process.argv[++i];
    } else if (arg === '--output') {
        OUTPUT = process.argv[++i];
    } else {
        console.log(`Unexpected argument: ${arg}`);
        process.exit();
    }
}

const inputStr = fs.readFileSync(INPUT, 'utf8'),
    input = JSON.parse(inputStr);



const Assert = (expr, errOutput) => {
    if (!expr) {
        console.error(errOutput);
        debugger;
        process.exit();
    }
};


const output = [];
for (let i = 0; i < input.length; ++i) {
    const problemIn = input[i];

    // Parse category
    const categoryName = problemIn['category'];
    let categoryId = -1;
    if (categoryName === 'Algebra') categoryId = 1;
    else if (categoryName === 'Number Theory') categoryId = 3;
    else if (categoryName === 'Calculus') categoryId = 4;
    else Assert(false, `Unexpected category ${categoryName}`);

    const problemOut = problemIn;
    problemOut['category'] = categoryId;

    //ProblemCategories: [
    //    { name: 'Algebra', id: 1 },
    //    { name: 'Geometry', id: 2 },
    //    { name: 'Number Theory', id: 3 },
    //    { name: 'Calculus', id: 4 },
    //    { name: 'Logic', id: 5 },
    //    { name: 'Classical Mechanics', id: 6 },
    //    { name: 'Electricity and Magnetism', id: 7 },
    //    { name: 'Computer Science', id: 8 },
    //    { name: 'Quantitative Finance', id: 9 },
    //    { name: 'Chemistry', id: 10 },
    //],


    output.push(problemOut);
}


if (OUTPUT) {
    const out = JSON.stringify(output);
    fs.writeFileSync(OUTPUT, out);
} else {
    console.log(output);
}
