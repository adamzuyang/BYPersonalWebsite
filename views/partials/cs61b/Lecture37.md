# Lecture 37: Compression
#### 11/30/2020

### Zip Files, How Do They Work?
- File is unchanged by zipping / unzipping

### Compression Model #1: Algorithms Operating on Bits
- In a **lossless** algorithm we require that no information is lost
  - Feed in to compression and then decompression algorithm
  - Text files often compressible by 70% or more


## Prefix Free Codes

### Increasing Optimality of Coding
- By default, English text is usually represented by sequences of characters, each 8 bits long
- Easy way to compress: Use fewer than 8 bits for eac letter
  - Have to decide which bit sequences should go with which letters
  - More generally, we'd say which **codewords** go with which **symbols**

### More Code: Mapping Alphanumeric Symbols to Codewords
- Example: Morse code
  - Goal: Compact representation
- Note:
  - Can think of dot as 0, dash as 1
  - Operators pause between codewords to avoid ambiguity
    - Pause acts as a 3rd symbol
- Alternate strategy: Avoid ambiguity by making code **prefix free**

### Prefix-Free Codes [Example 1]
- A prefix-free code is one in which no codeword is a prefix of another
- e.g. T = 1, E = 01, A = 001

### Prefix-Free Codes [Example 2]
- space: 111, E: 010, T: 1101, A: 1011

### Prefix Free Code Design
- **Observation:** Some prefix-free codes are better for some texts than others
- It'd be useful to have a procedure that calculates the "best" code for a given text


## Shannon Fano Codes (Extra)

### Code Calculation Approach #1 (Shannon-Fano Coding)
- Count relative frequencies of all characters in a text
- Split into "left" and "right" halves of roughly equal frequency
  - Left half gets a leading zero. Right half gets a leading one
  - Repeat
- Shannon-Fano coding is NOT optime. Does a good job, but possible to find "better" codes


## Huffman Coding

### Code Calculation Approach #2: Huffman Coding
- Calculate relative frequencies
  - Assign each symbol to a node with weight = relative frequency
  - Take the two smallest nodes and merge them into a super node with weight equal to sum of weights
  - Repeat until everything is part of a tree


## Huffman Coding Data Structures

### Prefix-Free Codes
- Question: For encoding (bitstream to compressed bitstream), what is a natural data structure to use? Assume characters are of type Character, and bit sequences are of type bitSequence. Two approaches:
  - Array of BitSequence[], to retrieve, can use character as index
    - Faster than HashMap
- Question: For decoding (compressed bitstream back to bitstream), what is a natural data structure to use?
  - We need to look up **longest matching prefix**, an operation that Tries excel at


## Huffman Coding in Practice

### Huffman Compression
- Two possible philosophies for using Huffman Compression:
  - For each input type, assemble huge numbers of sample inputs for that category. Use each corpus to create a standard code for English, Chinese, etc
  - For every possible input file, create a unique code just for that file. Send the code along with the compressed file
- What are some advantages/disadvantages of each idea? Which is better?
  - Approach 1 will result in suboptimal encoding
  - Approach 2 requires you to use extra space for the codeword table in the compressed bitstream
- For very large inputs, the cost of including the codeword table will become insignificant
- In practice, Philosophy 2 is used in the real world

### Huffman Compression Steps
- Given **input text**:
  - Count frequencies
  - Build encoding array and decoding trie
  - Write decoding trie to output
  - Write codeword for each symbol to output

### Huffman Decompression Steps
- Given **input bitstream**:
  - Read in decoding trie
  - Use codeword bits to walk down the trie, outputting symbols every time you reach a leaf

### Huffman Coding Summary
- Given a file X.txt that we'd like to compress into X.huf:
  - Consider each b-bit symbol of X.txt, counting occurrences of each of the 2^b possibilities, where b is the size of each symbol in bits
  - Use Huffman code construction algorithm to create a decoding trie and encoding map. Store this trie at the beginning of X.huf
  - Use encoding map to write codeword for each symbol of input into X.huf
- To decompress X.huf:
  - Read in the decoding trie
  - Repeatedly use the decoding trie's longestPrefixOf operation until all bits in X.hug have been converted back to their uncompressed form


## Compression Theory

### Compression Algorithms (General)
- The big idea in Huffman Coding is representing common symbols with small numbers of bits
- Many other approaches:
  - Run-length encoding: Replace each character by itself concatenated with the number of occurrences
  - LZW: Search for common repeated patterns in the input
- General idea: Exploit redundancy and existing order inside the sequence
  - Sequences with no existing redundancy or order may actually get enlarged

### Comparing Compression Algorithms
- Different compression algorithms achieve different compression ratios on different files

### Universal Compression: An Impossible Idea
- There is no universal compression algorithm
  - Intuitive idea: There are far fewer short bitstreams than long ones

### A Sneaky Situation
- Universal compression is impossible, but comparing compression algorithms could still be quite difficult

### Compression Model #2: Self-Extracting Bits
- As a model for the decompression process, let's treat the algorithm and the compressed bitstream as a single sequence of bits
  - Can think of the algorithm + compressed bitstream as an input to an interpreter. Interpreter somehow executes those bits
    - At the very "bottom" of these abstractions is some kind of physical machine
