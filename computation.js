/*  Used to convert cacheMemory/mainMemory to blocks when input is in words -> (Assuming Block Size is also in words)   */
function convertToBlocks(blockSize, words) {
    return Math.floor(words / blockSize);
}

/*  Checks if token is valid in numeric or in hex (If it is specified) -> (With the aid of RegEx)   */
function checkToken(token, hexadec) {
    if (hexadec) {
        return Boolean(token.match(/^[0-9a-f]+$/i)) || Boolean(token.match(/^[0-9a-f]+L[0-9a-f]+L[1-9]+[0-9]*/i));
    } 
    else {
        return Boolean(token.match(/^[0-9]+$/i)) || Boolean(token.match(/^[0-9]+L[0-9]+L[1-9]+[0-9]*/i)); 
    }
}

/*  Checks if the input is within the range of the declared main memory size -> (In terms of block).   */
function checkRange(mainMemorySize, parsedInput) {
    for (let i = 0; i < parsedInput.length; i++) {
        if (parsedInput[i] >= mainMemorySize) {
            return false; 
        }
    }
    return true; 
}

/*  Checks if the input data is in any of the cache blocks  */
function checkCache(cache, inputData) {
    for(let i = 0; i < cache.length; i++) {
        if (cache[i].data == inputData) {
            return i; 
        }
    }
    return -1; 
}

/*  Parses the sequence and converts loops to singleton values  */
function parseInput(input, hexadec) {
    var parsedInput = [];

    var input = input.split(',');
    for (let i = 0; i < input.length; i++) {
        if (!checkToken(input[i].trim(), hexadec)) {
            return false; 
        }
        /*  lSyntax = (Lower Bound)L(Upper Bound)L(Number of Loops) Example: 0L127L1    */
        if (input[i].includes('L')) {
            var lSyntax = input[i].split('L');
            if (hexadec) {
                var lower = parseInt(lSyntax[0], 16);
                var upper = parseInt(lSyntax[1], 16);
            }
            else {
                var lower = parseInt(lSyntax[0]);
                var upper = parseInt(lSyntax[1]);
            }
            var times = lSyntax[2];
            if (lower > upper) {
                return false; 
            }
            for (let j = 0; j < times; j++) {
                for (let k = lower; k <= upper; k++) {
                    parsedInput.push(parseInt(k)); 
                }
            }
        }
        else {
            if (hexadec) {
                var value = parseInt(input[i], 16);
            }
            else {
                var value = parseInt(input[i]);
            }
            parsedInput.push(value); 
        }
    }
    
    return parsedInput; 
}

const parseInputBlock = readSequence => {
    let splitSequence = readSequence.split('\r\n')

    //TODO: Manipulate loops

    return splitSequence
}

const parseInputAddress = readSequence => {
    let splitSequence = readSequence.split('\r\n')

    //TODO: Manipulate loops

    return splitSequence
}

/*    Check if power of Two    */
function checkPowerofTwo(n) {
    return n && (n & (n - 1)) === 0;
}

module.exports = {
    /*  Simulates the FA / LRU cache replacement algorithm  */
    // simulate: (blockSize, cacheMemorySize, parsedInput, hexadec, steps) => {
    //     var cacheAccess = 1;
    //     var memoryAccess = 10;
    //     var hits = 0; 
    //     var misses = 0; 
    //     var sum = [];
    //     var lowestSum = 0;
    //     var lastStatus = "N/A";
    //     var averageAccess = 0;
    //     var totalAccess = 0; 
    //     var cacheMemory = [];
    //     var stepsDone = 0;
    // },
    simulate: data => {
        let blockSize = data.blockSize
        let mmSize = data.mmType !== "blocks" ? convertToBlocks(blockSize, data.mmSize) : data.mmSize
        let cacheSize = data.mmType !== "blocks" ? convertToBlocks(blockSize, data.cacheSize) : data.cacheSize

        let parsedReadSeq = data.readType === "blocks" ? parseInputBlock(data.readSeq) : parseInputAddress(data.readSeq)


    },

    /*  Prepares the information of the text file   */
    prepareTextInfo: (values) => {
        var content = ""; 
        var labels = ["Cache Hits: ", "Cache Misses: ", "Average Access Time: ", "Total Access Time: "]; 
        labels.forEach((label, index) => {
            content = content.concat(label, values[index], "\n"); 
        });
        content = content.concat("Cache Memory: \n"); 
        var cacheMemory = values[7];
        for (let i = 0; i < cacheMemory.length; i++) {
            content = content.concat("Block Number: ", cacheMemory[i].block, " Data: ", cacheMemory[i].data, "\n"); 
        } 
        return content; 
    }
}