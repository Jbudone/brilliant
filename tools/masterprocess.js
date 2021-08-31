const fs = require('fs'),
    childProcess = require('child_process');


// TODO:
//  - specify batches, how much to run, continue, etc.
//  - get dir from relative point (is pwd in tools or parent)

let ProcessExit = process.exit;

let verbose = false;
let reset = false;

const PATH_TO_OUTDIR = './brilliant.parsed/';
const PATH_TO_OUTPUT = PATH_TO_OUTDIR + 'problems.json';

const PROBLEM_LIST_PATH = './rawproblems';
const PATH_TO_PROBLEMS = './public/brilliantexport/problems';

// Parse arguments
for (let i = 2; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (arg === '--verbose') {
        verbose = true;
    //} else if (arg === '--path-to-problems') {
    //    PATH_TO_PROBLEMS = process.argv[++i];
    //} else if (arg === '--problem-list') {
    //    PROBLEM_LIST_PATH = process.argv[++i];
    //} else if (arg === '--output') {
    //    OUTPUT = process.argv[++i];
    } else if (arg === '--reset') {
        reset = true;
    } else {
        console.log(`Unexpected argument: ${arg}`);
        ProcessExit();
    }
}

const VERSION_PARSEPROBLEM = 0, // bump this to re-parse problems: parseproblem.js
    VERSION_TRANSPORTPROBLEM = 0, // bump this to re-transport problems: transportproblems.js
    VERSION_MASTERPROCESS = 0;

const BATCH_SIZE = 10;


let InitialJson = {
    version: VERSION_MASTERPROCESS,
    processed: [], // Batches of problems (output json of parsed problems)
    batchSize: BATCH_SIZE   // Number of entries per batch
};

// Read from file, if not exist then InitialJson
let output = InitialJson;
if (reset) {
    console.log("Resetting");
} else if (fs.statSync(PATH_TO_OUTPUT, { throwIfNoEntry: false }) !== undefined) {
    console.log(`Reading json ${PATH_TO_OUTPUT}`);
    const outputStr = fs.readFileSync(PATH_TO_OUTPUT, 'utf8');
    output = JSON.parse(outputStr);

    // Master version check
    if (output.version !== VERSION_MASTERPROCESS) {
        console.log(`Master version ${VERSION_MASTERPROCESS} != ${output.version}`);
        console.log("Resetting json");
        output = InitialJson;
    }

    if (output.batchSize !== BATCH_SIZE) {
        console.log(`Master batchSize ${BATCH_SIZE} != ${output.batchSize}`);
        console.log("Please bump version");
        ProcessExit();
    }

    // Parsed problems version check
    for (let i = 0; i < output.processed.length; ++i) {
        const batch = output.processed[i];

        let nuke = false;
        if (batch.versionParse !== VERSION_PARSEPROBLEM) {
            console.log(`Batch version ${VERSION_PARSEPROBLEM} != ${batch.versionParse}`);
            nuke = true;
        } else if (batch.versionTransport !== VERSION_TRANSPORTPROBLEM) {
            console.log(`Batch version ${VERSION_TRANSPORTPROBLEM} != ${batch.versionTransport}`);
            nuke = true;
        }

        if (nuke) {
            console.log(`Nuking processed batches starting from ${i}`);
            output.processed.splice(i);
        }
    }
}

// Entire problem list
const rawproblems = fs.readFileSync(PROBLEM_LIST_PATH, 'utf8'),
    rawproblemsList = rawproblems.split('\n');


let batchStart = output.processed.length;
let totalBatches = Math.ceil((rawproblemsList.length - 1) / BATCH_SIZE);
let BatchesRemaining = totalBatches - batchStart;

if (BatchesRemaining <= 0) {
    console.log("Already finished batches! Max: " + totalBatches);
    ProcessExit();
}


console.log("Running through problems..");

const ProcessBatch = (batch) => {
    const { stage, batchIdx } = batch;

    let process = null;
    if (stage === 0) {
        console.log(`Processing batch ${batchIdx}`);
        batch.parsedOutput = PATH_TO_OUTDIR + 'brilliant.parsed-' + batchIdx + '.json';
        const problemOffset = batchIdx * BATCH_SIZE;
        let argsStr = `--path-to-problems public/brilliantexport/problems --problem-list rawproblems --output ${batch.parsedOutput} --batch-size ${BATCH_SIZE} --offset ${problemOffset} --verbose`,
            args = argsStr.split(' ');

        console.log(`node ./tools/parseproblem.js ${argsStr}`);
        process = childProcess.fork('./tools/parseproblem.js', args);
    } else if (stage === 1) {

        batch.transportedOutput = PATH_TO_OUTDIR + 'brilliant.local-' + batchIdx + '.json';
        const argsStr = `--input ${batch.parsedOutput} --output ${batch.transportedOutput} --verbose`,
            args = argsStr.split(' ');

        console.log(`node ./tools/transportproblems.js ${argsStr}`);
        process = childProcess.fork('./tools/transportproblems.js', args);
    }

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        console.log(err);
        ProcessExit();
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (code !== 0) {
            console.log("Exit had error code: " + code);
            ProcessExit();
        }

        batch.stage += 1;
        if (batch.stage === 1) {
            ProcessBatch(batch);
        } else {
            FinishedBatch(batch);
        }
    });
};

const FinishedBatch = (batch) => {

    output.version = VERSION_MASTERPROCESS;
    output.processed.push({
        versionParse: VERSION_PARSEPROBLEM,
        versionTransport: VERSION_TRANSPORTPROBLEM,
        batchIdx: batch.batchIdx,
        parsedList: batch.parsedOutput,
        transportedList: batch.transportedOutput
    });


    // NOTE: Save on each batch since we may error midway but want to save our point
    const outputStr = JSON.stringify(output);
    fs.writeFileSync(PATH_TO_OUTPUT, outputStr);

    // Process next batch or finished
    if (--BatchesRemaining > 0) {
        ProcessBatch({ stage: 0, batchIdx: batch.batchIdx + 1 });
    } else {
        console.log("Finished all batches");
    }
};

ProcessBatch({ stage: 0, batchIdx: batchStart });
