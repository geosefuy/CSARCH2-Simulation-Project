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

/*  Checks if power of two   */
function checkPowerofTwo(n) {
    return Boolean(n && (n & (n - 1)) === 0);
}

/*  Used to get the lowest score among all the data in the cache block  */
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

/*  Used to get the index of the cache block where a cache hit occurred  */
function getCacheHitIndex (cacheSnapshot, content) {
    for (let i = 0; i < cacheSnapshot.length; i++) {
        if (cacheSnapshot[i].content === content) {
            return i
        }
    }
    return -1
}

/*  Simulates the FA / LRU cache replacement algorithm  */
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

        }
        else if (currentIns.includes(',')) {
            currentIns = currentIns.split(',')

            let startBlock = parseInt(currentIns[0])
            let endBlock = parseInt(currentIns[1])

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
                }
                else {
                    cacheSnapshot[cacheHitIndex].score = currentScore + 1
                    cacheHit++
                }
                currentScore++
            }
        }
        else {
            let cacheHitIndex = getCacheHitIndex(cacheSnapshot, parseInt(currentIns))

            if (cacheHitIndex === -1) {
                let minIndex = getMinScoreIndex(cacheSnapshot)
                cacheSnapshot[minIndex] = {
                    content: parseInt(currentIns),
                    score: currentScore + 1
                }
                cacheMiss++
            }
            else {
                cacheSnapshot[cacheHitIndex].score = currentScore + 1
                cacheHit++
            }
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

/*  Simulates the FA / LRU cache replacement algorithm  */
const getResultAddress = (data, blockSizeParam) => {
    let {
        readSequence,
        cacheSnapshot,
        currentScore,
        cacheHit,
        cacheMiss
    } = data
    let blockSize = blockSizeParam
    let splitSequence = readSequence.split('\r\n')
    let convertedSequence = []

    let currentBlock = -1
    let currentUpperAddress = -1

    //convert addresses to blocks
    for (let i = 0; i < splitSequence.length; i++) {
        let currentIns = splitSequence[i]

        if (currentIns.includes('L')) {
            convertedSequence.push(currentIns)

            currentBlock = -1
            currentUpperAddress = -1
        }
        else if (currentIns.includes(',')) {
            currentIns = currentIns.split(',')

            let startAddress = parseInt(currentIns[0])
            let endAddress = parseInt(currentIns[1])

            let startBlock = convertToBlocks(blockSize, startAddress)
            let endBlock = convertToBlocks(blockSize, endAddress)

            if (currentUpperAddress === -1 && currentBlock === -1 || currentUpperAddress >= startAddress) {
                convertedSequence.push(`${startBlock},${endBlock}`)

                currentUpperAddress = endAddress
                currentBlock = endBlock
            }
            else if (currentUpperAddress < startAddress) {
                let startBlock = convertToBlocks(blockSize, startAddress)
                let endBlock = convertToBlocks(blockSize, endAddress)

                if (currentBlock !== startBlock) {
                    /**
                     * 1,122
                     * 256,257
                     */
                    convertedSequence.push(`${startBlock},${endBlock}`)

                    currentUpperAddress = endAddress
                    currentBlock = endBlock
                }
                else if (currentBlock !== endBlock) {
                    /**
                     * 1,122
                     * 123,257
                     */
                    startBlock++

                    convertedSequence.push(`${startBlock},${endBlock}`)
                    currentUpperAddress = endAddress
                    currentBlock = endBlock
                }
                else if (currentBlock === endBlock) {
                    /**
                     * 1,122
                     * 123,127
                     */
                    currentUpperAddress = endAddress
                }
            }
        }
        else {
            let address = parseInt(currentIns)
            let block = convertToBlocks(blockSize, address)

            if (currentUpperAddress === -1 && currentBlock === -1 || currentUpperAddress >= address) {
                convertedSequence.push(`${block}`)

                currentUpperAddress = address
                currentBlock = block
            }
            else if (currentUpperAddress < address) {
                if (currentBlock !== block) {
                    /**
                     * 1,122
                     * 256
                     */
                    convertedSequence.push(`${block}`)

                    currentUpperAddress = address
                    currentBlock = block
                }
                else if (currentBlock === block) {
                    /**
                     * 1,122
                     * 123
                     */
                    currentUpperAddress = address
                }
            }
        }
    }

    let dataInput = {
        readSequence: convertedSequence,
        cacheSnapshot: cacheSnapshot,
        currentScore: currentScore,
        cacheHit: cacheHit,
        cacheMiss: cacheMiss
    }

    return getResultBlock(dataInput)
}

/*  Used to get the average and total access time for both load-through and non-load through    */
function getAccessTime(data) {
    let {
        blockSize,
        cacheTime,
        memoryTime,
        loadType,
        currentScore,
        cacheHit,
        cacheMiss
    } = data;

    let aveTime, totalTime;
    let missPenalty;

    nBlockSize = parseInt(blockSize);
    nMemoryTime = parseFloat(memoryTime);
    nCacheTime = parseFloat(cacheTime);

    /* Calculations */
    let hitRate = cacheHit / currentScore;
    let missRate = cacheMiss / currentScore;

    // Non-Load Through
    if(loadType == "nonload") {
        missPenalty = nCacheTime + (nBlockSize * nMemoryTime) + nCacheTime;
        totalTime = cacheMiss * nBlockSize * (nCacheTime + nMemoryTime);
    // Load Through
    }
    else {
        missPenalty = nCacheTime + nMemoryTime;
        totalTime = cacheMiss * nBlockSize * nMemoryTime;
    }

    aveTime = (hitRate * nCacheTime) + (missRate * missPenalty);
    totalTime += (cacheHit * nBlockSize * nCacheTime) + (cacheMiss * nCacheTime);

    return {aveTime, missPenalty, totalTime};
}

module.exports = {
    /*  Used to convert cacheMemory/mainMemory to blocks when input is in words -> (Assuming Block Size is also in words)   */
    convertToBlocks: (blockSize, words) => {
        return Math.floor(words / blockSize);
    },

    /*  Checks if token is valid in numeric or in hex (If it is specified) -> (With the aid of RegEx)   */
    checkToken: (token, hexadec) => {
        if (hexadec) {
            return Boolean(token.match(/^[0-9a-f]+$/i)) || Boolean(token.match(/^[0-9a-f]+L[0-9a-f]+L[1-9]+[0-9]*/i));
        }
        else {
            return Boolean(token.match(/^[0-9]+$/i)) || Boolean(token.match(/^[0-9]+L[0-9]+L[1-9]+[0-9]*/i));
        }
    },

    /*  Checks if the input is within the range of the declared main memory size -> (In terms of block).   */
    checkRange: (mainMemorySize, parsedInput) => {
        for (let i = 0; i < parsedInput.length; i++) {
            if (parsedInput[i] >= mainMemorySize) {
                return false;
            }
        }
        return true;
    },

    /*    Check if power of Two    */
    checkPowerofTwo: (n) => {
        return n && (n & (n - 1)) === 0;
    },

    isNumeric: (str) => {
        if (typeof str != "string") return false // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
               !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },

    simulate: data => {
        let blockSize = data.blockSize
        let mmSize = data.mmType !== "blocks" ? convertToBlocks(parseInt(blockSize), parseInt(data.mmSize)) : parseInt(data.mmSize)
        let cacheSize = data.cacheType !== "blocks" ? convertToBlocks(parseInt(blockSize), parseInt(data.cacheSize)) : parseInt(data.cacheSize)

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

        let dataOutput = data.readType === "blocks" ? getResultBlock(dataInput) : getResultAddress(dataInput, blockSize)
        // console.log(dataOutput)

        /** Getting Access Time */
        let accessParams = {
            blockSize: blockSize,
            cacheTime: data.cacheTime,
            memoryTime: data.memoryTime,
            loadType: data.loadType,
            currentScore: dataOutput.currentScore,
            cacheHit: dataOutput.cacheHit,
            cacheMiss: dataOutput.cacheMiss
        }

        accessTime = getAccessTime(accessParams);
        // console.log("Average Access Time: " + accessTime.aveTime);
        // console.log("Total Access Time: " + accessTime.totalTime);
        dataOutput.aveTime = accessTime.aveTime;
        dataOutput.missPenalty = accessTime.missPenalty;
        dataOutput.totalTime = accessTime.totalTime;
        console.log(dataOutput)
        return dataOutput;
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
