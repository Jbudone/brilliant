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
        process.exit(1);
    }
};


const output = [];
for (let i = 0; i < input.length; ++i) {
    const problemIn = input[i];

    // Parse category
    const categoryName = problemIn['category'];
    let categoryId = -1;
    if (categoryName === 'Algebra') categoryId = 1;
    else if (categoryName === 'uncategorized') categoryId = 1;
    else if (categoryName === 'Geometry') categoryId = 2;
    else if (categoryName === 'Number Theory') categoryId = 3;
    else if (categoryName === 'Number Theory and Algebra') categoryId = 3;
    else if (categoryName === 'Calculus') categoryId = 4;
    else if (categoryName === 'Logic') categoryId = 5;
    else if (categoryName === 'Classical Mechanics') categoryId = 6;
    else if (categoryName === 'Electricity and Magnetism') categoryId = 7;
    else if (categoryName === 'Computer Science') categoryId = 8;
    else if (categoryName === 'Quantitative Finance') categoryId = 9;
    else if (categoryName === 'Chemistry') categoryId = 10;
    else if (categoryName === 'Biology') categoryId = 11;
    else if (categoryName === 'Probability') categoryId = 12;
    else if (categoryName === 'Basic Mathematics') categoryId = 13;
    else if (categoryName === 'SAT® Math') categoryId = 14;
    else Assert(false, `Unexpected category ${categoryName}`);

    const problemOut = problemIn;
    problemOut['category'] = categoryId;


    let problemSource = problemIn['source'];
    problemSource = problemSource.match(/([^\/]*).html$/)[1];
    problemOut['source'] = problemSource;

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
