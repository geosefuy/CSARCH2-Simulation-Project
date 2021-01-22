const { cache } = require("ejs");

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

/*    Check if power of Two    */
function checkPowerofTwo(n) {
    return n && (n & (n - 1)) === 0;
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

function getMinScoreIndex (cacheSnapshot) {
    let minIndex = 0
    let minScore = Number.MAX_SAFE_INTEGER

    for (let i = 0; i < cacheSnapshot.length; i++) {
        if (cacheSnapshot[i].score < minScore) {
            minIndex = i
            minScore = cacheSnapshot[i].score
        }
    }

    return minIndex
}

function getCacheHitIndex (cacheSnapshot, content) {
    for (let i = 0; i < cacheSnapshot.length; i++) {
        if (cacheSnapshot[i].content === content) {
            return i
        }
    }

    return -1
}

const getResultBlock = (data) => {
    let {
        readSequence,
        cacheSnapshot,
        currentScore,
        cacheHit,
        cacheMiss
    } = data

    let splitSequence = Array.isArray(readSequence) ? readSequence : readSequence.split('\r\n')

    for (let i = 0; i < splitSequence.length; i++) {
        
        let currentIns = splitSequence[i];
        let toAdd

        if (currentIns.includes('L')) {
            currentIns = currentIns.split(',')

            if (typeof currentIns[1] === "undefined")
                continue
            
            let loopName = currentIns[0]
            let loopCount = currentIns[1]
            let startIndex = i
            let endIndex = splitSequence.indexOf(loopName, startIndex + 1)

            let innerData = {
                readSequence: splitSequence.slice(startIndex + 1, endIndex),
                cacheSnapshot: cacheSnapshot,
                currentScore: currentScore,
                cacheHit: cacheHit,
                cacheMiss: cacheMiss
            }

            for (let j = 0; j < loopCount; j++) {
                let result = getResultBlock(innerData)
                innerData = {
                    readSequence: splitSequence.slice(startIndex + 1, endIndex),
                    cacheSnapshot: result.cacheSnapshot,
                    currentScore: result.currentScore,
                    cacheHit: result.cacheHit,
                    cacheMiss: result.cacheMiss
                }
                currentScore = result.currentScore
                cacheHit = result.cacheHit
                cacheMiss = result.cacheMiss
            }

            i += (endIndex - startIndex)

        } else if (currentIns.includes(',')) {
            currentIns = currentIns.split(',')

            let startBlock = currentIns[0]
            let endBlock = currentIns[1]

            startBlock = parseInt(startBlock)
            endBlock = parseInt(endBlock)

            let minIndex
            let cacheHitIndex
            for (let i = startBlock; i <= endBlock; i++) {
                cacheHitIndex = getCacheHitIndex(cacheSnapshot, i)
                if (cacheHitIndex === -1) {
                    minIndex = getMinScoreIndex(cacheSnapshot)
                    cacheSnapshot[minIndex] = {
                        content: i,
                        score: currentScore + 1
                    }
                    cacheMiss++
                } else {
                    cacheSnapshot[cacheHitIndex].score = currentScore + 1
                    cacheHit++
                }
                console.log(cacheSnapshot)
                console.log("")
                currentScore++
            }
        } else {
            let cacheHitIndex = getCacheHitIndex(cacheSnapshot, parseInt(currentIns))

            if (cacheHitIndex === -1) {
                let minIndex = getMinScoreIndex(cacheSnapshot)
                cacheSnapshot[minIndex] = {
                    content: parseInt(currentIns),
                    score: currentScore + 1
                }
                cacheMiss++
            } else {
                cacheSnapshot[cacheHitIndex].score = currentScore + 1
                cacheHit++
            }
            console.log(cacheSnapshot)
            console.log("")
            currentScore++
        }

    }

    return {
        cacheSnapshot: cacheSnapshot,
        currentScore: currentScore,
        cacheHit: cacheHit,
        cacheMiss: cacheMiss
    }
}

const parseInputAddress = (readSequence, blockSize) => {
    let splitSequence = readSequence.split('\r\n')

    //TODO: Manipulate loops

    return splitSequence
}

module.exports = {
    simulate: data => {
        let blockSize = data.blockSize
        let mmSize = data.mmType !== "blocks" ? convertToBlocks(parseInt(blockSize), parseInt(data.mmSize)) : parseInt(data.mmSize)
        let cacheSize = data.mmType !== "blocks" ? convertToBlocks(parseInt(blockSize), parseInt(data.cacheSize)) : parseInt(data.cacheSize)

        let blockHolder = {
            content: null,
            score: 0
        }
        let cacheSnapshot = Array(cacheSize).fill(blockHolder)
        let currentScore = 0
        let cacheHit = 0
        let cacheMiss = 0

        let dataInput = {
            readSequence: data.readSeq,
            cacheSnapshot: cacheSnapshot,
            currentScore: currentScore,
            cacheHit: cacheHit,
            cacheMiss: cacheMiss
        }

        let dataOutput = data.readType === "blocks" ? getResultBlock(dataInput) : parseInputAddress(data.readSeq)
        console.log(dataOutput)

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