# FA Cache Mapping with LRU Replacement Algorithm

## Project Setup

### Local

1. Install dependencies using `npm install`.
2. Open app using `node app.js` or `nodemon`.

### Heroku

1. Open app by going to `csarch2-falru.herokuapp.com`.

## Using the App

### Input

1. Choose the *addressing mode* by clicking on either *Word Addressable* or *Byte Addressable*.
2. Enter the block size of your cache and main memory. This value should be a power of two.
3. Choose the *cache miss algorithm* by clicking on either *Non Load-Through* or *Load-Through*.
4. Enter the size of your main memory. You can choose to enter this value in blocks or in words/bytes. This value should be a power of two. 
5. Enter the size of your cache memory. You can choose to enter this value in blocks or in words/bytes. This value should be a power of two. 
6. Enter your read sequence. More instructions [here](#read-sequence).
7. Enter your cache and main memory access time. This value is in nanoseconds.

### Read Sequence
1. Choose between *blocks* and *address* for your read sequence.
2. Either way, there will be eight options for inputting a sequence:

Singleton block / address (Decimal):
```
1             // syntax: block / addrress
```

Continuous blocks / addresses (Decimal):
```
1, 3          // syntax: starting block / address, ending block / address
```

Looped blocks / addresses (Decimal):
```
L1, 10        // syntax: loop name (should start with uppercase L), number of iterations
1, 3          // syntax: any number of singleton / continuous sequence
L1            // syntax: loop name
```

Nest-looped blocks / addresses (Decimal):
```
L1, 10        // syntax: loop name (should start with uppercase L), number of iterations
1, 3          // syntax: any number of singleton / continuous sequence
L2, 20    
4
5, 7
L2            // an inner loop should have its closing signal inside the outer loop
L1            // syntax: loop name
```

Singleton block / address (Hexadecimal):
```
0x01          // syntax: block / addrress
```

Continuous blocks / addresses (Hexadecimal):
```
0x01, 0x03    // syntax: starting block / address, ending block / address
```

Looped blocks / addresses (Hexadecimal):
```
L1, 10        // syntax: loop name (should start with uppercase L), number of iterations
0x01, 0x03    // syntax: any number of singleton / continuous sequence
L1            // syntax: loop name
```

Nest-looped blocks / addresses (Hexadecimal):
```
L1, 10        // syntax: loop name (should start with uppercase L), number of iterations
0x01, 0x03    // syntax: any number of singleton / continuous sequence
L2, 20    
0x04
0x05, 0x07
L2            // an inner loop should have its closing signal inside the outer loop
L1            // syntax: loop name
```

#### Example Input

*This example is lifted from #4 of the Cache Problem Set*
```
0x200
0x204
0x208
0x20C
0x2F4
0x2F0
0x200
0x204
0x218
0x21C
0x24C
0x2F4
```

*This example is lifted from #6 of the Cache Problem Set*
```
0, 127
L1, 10
128, 255
L2, 20
256, 511
L2
512, 1279
L1
1280, 1535
```

*Modified #6 - This will result in the same output*
```
0, 126
127
L1, 10
128, 255
L2, 20
256, 383
384
385, 511
L2
512, 1279
L1
1280, 1407
1408, 1535
```

### Output
1. All outputs in the Data section are in their decimal form.
2. Invalid inputs have their own corresponding error messages.
3. Clicking the Export to Text File button allows users to download the output from their respective inputs to their remote computer.

#### Example Output

*This output is based from #6 of the Cache Problem Set*
| Cache Block # |     Score     |     Data      |
| :-----------: | :-----------: | :-----------: |
|       0       |      469      |       7       |
|       1       |      470      |       8       |
|       2       |      471      |       9       |
|       3       |      472      |      10       |
|       4       |      473      |      11       |
|       5       |      466      |       4       |
|       6       |      467      |       5       |
|       7       |      468      |       6       |

|                       |                       |
| :--                   | :--                   |
|      Cache Hit(s)     |          380          |
|    Cache Miss(es)     |          93           |
|     Miss Penalty      |        1282 ns        |
|  Average Access Time  | 252.86680761099365 ns |
|   Total Access Time   |       179677 ns       |
