module.exports = {
    home: (req, res) => {
        res.render('simulation.ejs', {
            result: false,
            machineType: false,
            cacheMiss: false,
            blockInput: false,
            mmInput: false,
            cacheInput: false,
            readInput: false,
        });
    },
    calculate: (req, res) => {
        // config1 = word or byte addressable (word, byte)
        // config2 = non or load through (nonload, load)
        // config3 = main memory size (blocks, words/bytes)
        // config3 = cache memory size (blocks, words/bytes)
        // config3 = read sequence (blocks, address)
        let machineType;
        if (req.body.config1 == "word"){
            machineType = "Word Addressable";
            console.log(machineType);
        }
        else{
            machineType = "Byte Addressable";
            console.log(machineType);
        }
        let cacheMiss;
        if (req.body.config2 == "nonload"){
            cacheMiss = "Non Load-Through";
            console.log(cacheMiss);
        }
        else{
            cacheMiss = "Load-Through";
            console.log(cacheMiss);
        }
        let blockSize = req.body.blockSize;
        let blockInput;
        console.log("Block size: " + blockSize + " Words/Bytes")
        if (machineType == "Word Addressable")
            blockInput = blockSize + " Word(s)";
        else
            blockInput = blockSize + " Byte(s)";
        let mmSize;
        let mmInput;
        if (req.body.config3 == "blocks"){
            mmSize = req.body.mmSizeBlocks;
            console.log("Main Memory size: " + mmSize + " Blocks")
            mmInput = mmSize + " Block(s)";
        }
        else{
            mmSize = req.body.mmSizeWords;
            console.log("Main Memory size: " + mmSize + " Words/Bytes")
            if (machineType == "Word Addressable")
                mmInput = mmSize + " Word(s)";
            else
                mmInput = mmSize + " Byte(s)";
        }
        let cacheSize;
        let cacheInput;
        if (req.body.config4 == "blocks"){
            cacheSize = req.body.cacheSizeBlocks;
            console.log("Cache Memory size: " + cacheSize + " Blocks")
            cacheInput = cacheSize + " Block(s)";
        }
        else{
            cacheSize = req.body.cacheSizeWords;
            console.log("Cache Memory size: " + cacheSize + " Words/Bytes")
            if (machineType == "Word Addressable")
                cacheInput = cacheSize + " Word(s)";
            else
                cacheInput = cacheSize + " Byte(s)";
        }
        let readSeq;
        let readInput;
        if (req.body.config5 == "blocks"){
            readSeq = req.body.readBlocks;
            console.log("Cache Memory size: Blocks - " + readSeq)
            readInput = "Block - " + readSeq;
        }
        else{
            readSeq = req.body.readAddress;
            console.log("Cache Memory size: Address - " + readSeq)
            readInput = "Address - " + readSeq;
        }


        
        res.render('simulation.ejs', { // Pass data to front end
            result: true,
            machineType: machineType,
            cacheMiss: cacheMiss,
            blockInput: blockInput,
            mmInput: mmInput,
            cacheInput: cacheInput,
            readInput: readInput,
        });
    },
}