const VIS = document.getElementById("visualizer");

const DEFAULT_COLOR = "turquoise";
const VISITED_COLOR = "red";

function getRandInteger(min, max) {
    // Returns an integer between min and max, inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

class Bar {
    constructor(height, id) {
        // Constructs a bar. Contains the height, id, and color of the bar
        // Assigns the Bar object a corresponding HTML div
        // id must be a string. height is an integer
        this.height = height;
        this.id = id;
        // VISITED_COLOR means it is being compared, DEFAULT_COLOR is default
        this.color = DEFAULT_COLOR;

        // Create corresponding div
        VIS.innerHTML += `<div class="bar" id='${id}'>`;
        let div = document.getElementById(this.id);
        div.style.height = `${height}px`;

        this.visualizer = null;
    }

    changeHeight(height) {
        // Changes the height of the bar and corresponding HTML to height
        if (this.height == height) {
            return;
        }
        let div = document.getElementById(this.id);
        this.height = height;
        div.style.height = `${height}px`;
    }

    changeColor(color) {
        // Changes the color of the bar and corresponding HTML to color
        if (this.color == color) {
            return;
        }
        let div = document.getElementById(this.id);
        this.color = color;
        div.style.backgroundColor = color;
    }

    animateCompare() {
        this.changeColor(VISITED_COLOR);
        // setTimeout(() => {
        //     this.changeColor("turquoise");
        // }, this.visualizer.speed);
    }
}


class Visualizer {

    constructor() {
        // Algorithm to use
        this.algorithm = "";
        this.createNewArray();
        // Animation speed
        this.visFast = 5;
        this.visNormal = 15;
        this.visSlow = 25;
        this.speed = this.visNormal;
    }

    createNewArray() {
        /* Animations array containing animations object
        An animation object is of the form:
        {
            "type": "change/compare/swap", ("change" stands for "change height")
            "contents": Array of two indices if compare/swap else an array of index and then height if change
        }
        */
        this.animations = []
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Reset innerHTML
        VIS.innerHTML = '';
        // Array of integer values
        this.array = [];
        // Array of bars representing above integer values
        this.bars = [];

        // Min and Max height of each bar
        this.minHeight = 5;
        this.maxHeight = windowHeight - 200;
        
        // Number of bars
        this.numBars = Math.floor((windowWidth - 150) / 4);

        for (let i = 0; i < this.numBars; i += 1) {
            let nextHeight = getRandInteger(this.minHeight, this.maxHeight)
            this.array.push(nextHeight);
            let newBar = new Bar(nextHeight, i.toString());
            newBar.visualizer = this;
            this.bars.push(newBar);
        }

        this.animating = false;
    }

    // Three operations needed for sorting algorithms
    compare(i, j) {
        // compares elements at indices i and j
        // DOES NOT ALTER BAR OBJECTS
        this.animations.push({
            "type": "compare",
            "contents": [i, j]
        })
        if (this.array[i] < this.array[j]) {
            return -1;
        } else if (this.array[i] == this.array[j]) {
            return 0;
        } else {
            return 1;
        }
    }
    swap(i, j) {
        // Swaps elements at indices i and j in this.array
        // DOES NOT ALTER BAR OBJECTS
        this.animations.push({
            "type": "swap",
            "contents": [i, j]
        });
        if (i != j) {
            let heightTemp = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = heightTemp;
        }
    }
    changeHeight(i, height) {
        this.animations.push({
            "type": "change",
            "contents": [i, height]
        });
        this.array[i] = height;
    }
    getDigit(i, digit) {
        // Gets the digit'th digit (counting from the left, digit=1 corresponds to ones digit) of the i'th element in the array
        this.animations.push({
            "type": "visit",
            "contents": [i, digit]
        });
        return Math.floor(this.array[i] / Math.pow(10, digit - 1)) % 10
    }

    // Selection sort
    selectionSort() {
        // Selection Sort this.array
        for (let i = 0; i < this.numBars; i += 1) {
            this.selectionSortHelper(i);
        }
    }
    selectionSortHelper(i) {
        if (i >= this.numBars - 1) {
            // If i is 1 less than numBars or greater, there is nothing to selection sort
            return;
        }
        let smallestIndex = i;

        for (let j = i; j < this.numBars; j += 1) {
            if (this.compare(j, smallestIndex) < 0) {
                smallestIndex = j;
            }
        }
        this.swap(i, smallestIndex);
    }

    // Heap sort
    heapSort() {
        let i = this.numBars;
        this.heapify(i);
        while (i > 0) {
            this.swap(0, i - 1);
            this.sink(0, i - 1);
            i -= 1;
        }
    }
    heapify(endIndex) {
        for (let i = endIndex - 1; i >= 0; i -= 1) {
            this.sink(i, endIndex)
        }
    }
    sink(index, endIndex) {
        let right = index * 2 + 2;
        let left = index * 2 + 1;
        while ((right < endIndex && this.compare(index, right) < 0) || (left < endIndex && this.compare(index, left) < 0)) {
            if (right < endIndex && left < endIndex) {
                if (this.compare(left, right) < 0) {
                    this.swap(index, right);
                    index = right;
                } else {
                    this.swap(index, left);
                    index = left;
                }
            } else if (right < endIndex) {
                if (this.compare(index, right) < 0) {
                    this.swap(index, right);
                    index = right;
                }
            } else if (left < endIndex) {
                if (this.compare(index, left) < 0) {
                    this.swap(index, left);
                    index = left;
                }
            }
            right = index * 2 + 2;
            left = index * 2 + 1;
        }
    }

    // Merge sort
    mergeSort() {
        this.mergeSortHelper(0, this.numBars - 1);
    }
    mergeSortHelper(start, end) {
        // Merge sorts numbers from start to end indices inclusive
        if (end - start < 1) {
            return;
        }
        let middle = Math.floor((end + start) / 2);
        this.mergeSortHelper(start, middle);
        this.mergeSortHelper(middle + 1, end);

        // Merge
        let pointer1 = start;
        let pointer2 = middle + 1;
        let auxArray = [];
        while (pointer1 <= middle || pointer2 <= end) {
            if (pointer1 <= middle && pointer2 <= end) {
                if (this.compare(pointer1, pointer2) < 0) {
                    auxArray.push(this.array[pointer1]);
                    pointer1 += 1;
                } else {
                    auxArray.push(this.array[pointer2]);
                    pointer2 += 1;
                }
            } else if (pointer1 <= middle) {
                auxArray.push(this.array[pointer1]);
                pointer1 += 1;
            } else {
                auxArray.push(this.array[pointer2]);
                pointer2 += 1;
            }
        }
        for (let i = start; i <= end; i += 1) {
            this.changeHeight(i, auxArray[i - start]);
        }
    }

    // Insertion sort
    insertionSort() {
        for (let i = 0; i < this.numBars; i += 1) {
            let travelIndex = i;
            while (travelIndex > 0 && this.compare(travelIndex, travelIndex-1) < 0) {
                this.swap(travelIndex-1, travelIndex);
                travelIndex -= 1;
            }
        }
    }

    // Quick sort
    quickSort() {
        this.quickSortHelper(0, this.numBars - 1);
    }
    quickSortHelper(start, end) {
        // Quick sorts from indices start to end inclusive

        // Base cases
        if (end - start == 1) {
            if (this.compare(start, end) > 0) {
                this.swap(end, start);
            }
            return;
        }
        if (end - start < 1) {
            return;
        }

        // Partition: Tony Hoare with pivot as left-most index
        let pivot = start;
        let left = start + 1;
        let right = end;
        while (right >= left) {
            while (this.compare(pivot, left) > 0) {
                left += 1;
                if (right < left) {
                    break;
                }
            }
            while (this.compare(pivot, right) < 0) {
                right -= 1;
                if (right < left) {
                    break;
                }
            }
            if (right >= left) {
                this.swap(left, right);
                left += 1;
                right -= 1;
            }
        }
        if (left == right) {
            right -= 1;
        }
        this.swap(pivot, right);
        pivot = right;

        // partition left and right sub-arrays
        this.quickSortHelper(start, pivot - 1);
        this.quickSortHelper(pivot + 1, end);
    }

    countSort(start, end, digit) {
        if (digit <= 0 || end - start <= 0) {
            return;
        }
        // Used for radix sorts
        // Counting sort algorithm that sorts elements from start to end inclusive based on digit given
        let auxArray = [];
        let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        // Populate counts array
        for (let i = start; i <= end; i += 1) {
            counts[this.getDigit(i, digit)] += 1;
            auxArray.push(null);
        }

        // Create starting points array
        let startingPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (let k = 0; k <= 9; k += 1) {
            let sum = 0;
            for (let kk=0; kk < k; kk += 1) {
                sum += counts[kk];
            }
            startingPoints[k] = sum;
        }

        for (let j = start; j <= end; j += 1) {
            let nextElem = this.array[j];
            let elemDigit = this.getDigit(j, digit);
            auxArray[startingPoints[elemDigit]] = nextElem;
            startingPoints[elemDigit] += 1;
        }

        for (let l = start; l <= end; l += 1) {
            this.changeHeight(l, auxArray[l - start]);
        }

        // For MSD Radix Sort
        return startingPoints;
    }
    // LSD Radix Sort
    lsdRadix() {
        let maxDigit = 1 + getBaseLog(10, this.maxHeight);
        for (let i = 1; i <= maxDigit; i += 1) {
            this.countSort(0, this.numBars - 1, i);
        }
    }

    // MSD Radix Sort
    msdRadix() {
        let maxDigit = 1 + getBaseLog(10, this.maxHeight);
        this.msdRadixHelper(0, this.numBars - 1, maxDigit);
    }
    msdRadixHelper(start, end, digit) {
        if (digit <= 0) {
            return;
        }
        if (end - start <= 0) {
            return;
        }

        let startingPoints = this.countSort(start, end, digit);
        this.msdRadixHelper(start, start + startingPoints[0] - 1, digit - 1);
        for (let i = 1; i <= 9; i += 1) {
            this.msdRadixHelper(start + startingPoints[i-1], start + startingPoints[i] - 1, digit - 1);
        }
    }

    sort() {
        // Sort the array based on sort selected
        if (this.algorithm == '') {
            alert("Please select an algorithm to visualize!");
        } else {
            if (this.algorithm == 'selection') {
                this.selectionSort();
            } else if (this.algorithm == 'heap') {
                this.heapSort();
            } else if (this.algorithm == 'merge') {
                this.mergeSort();
            } else if (this.algorithm == 'insertion') {
                this.insertionSort();
            } else if (this.algorithm == 'quick') {
                this.quickSort();
            } else if (this.algorithm == 'lsd') {
                this.lsdRadix();
            } else if (this.algorithm == 'msd') {
                this.msdRadix();
            }
            this.animate();
        }
    }

    animate() {
        let newArrayButton = document.getElementById('gen-new');
        newArrayButton.addEventListener('click', () => {
            clearInterval(animate1);
            clearInterval(animate2);
        });
        for (let j = 0; j < this.bars.length; j += 1) {
            let bar = this.bars[j];
            bar.changeColor(DEFAULT_COLOR);
        }
        let animate1Finish = false;
        this.animating = true;
        let lastIndex1 = -1;
        let lastIndex2 = -1;
        let animate1 = setInterval(() => {
            if (this.animations.length > 0) {
                let nextAnimation = this.animations.shift();
                if (nextAnimation["type"] == "compare") {
                    let index1 = nextAnimation["contents"][0];
                    let index2 = nextAnimation["contents"][1];
                    if (lastIndex1 >= 0 && lastIndex1 != index1) {
                        this.bars[lastIndex1].changeColor(DEFAULT_COLOR);
                    }
                    if (lastIndex2 >= 0 && lastIndex2 != index2) {
                        this.bars[lastIndex2].changeColor(DEFAULT_COLOR);
                    }
                    this.bars[index1].changeColor(VISITED_COLOR);
                    this.bars[index2].changeColor(VISITED_COLOR);
                    lastIndex1 = index1;
                    lastIndex2 = index2;
                } else if (nextAnimation.type == "swap") {
                    let index1 = nextAnimation["contents"][0];
                    let index2 = nextAnimation["contents"][1];
                    if (lastIndex1 >= 0 && lastIndex1 != index1) {
                        this.bars[lastIndex1].changeColor(DEFAULT_COLOR);
                    }
                    if (lastIndex2 >= 0 && lastIndex2 != index2) {
                        this.bars[lastIndex2].changeColor(DEFAULT_COLOR);
                    }
                    let tempHeight = this.bars[index1].height;
                    this.bars[index1].changeHeight(this.bars[index2].height);
                    this.bars[index2].changeHeight(tempHeight);
                    lastIndex1 = index1;
                    lastIndex2 = index2;
                } else if (nextAnimation.type == "change") {
                    let index1 = nextAnimation["contents"][0];
                    let height = nextAnimation["contents"][1];
                    if (lastIndex1 >= 0 && lastIndex1 != index1) {
                        this.bars[lastIndex1].changeColor(DEFAULT_COLOR);
                    }
                    if (lastIndex2 >= 0) {
                        this.bars[lastIndex2].changeColor(DEFAULT_COLOR);
                    }
                    this.bars[index1].changeHeight(height);
                    lastIndex1 = index1;
                    lastIndex2 = -1;
                } else if (nextAnimation.type == "visit") {
                    let index1 = nextAnimation["contents"][0];
                    let digit = nextAnimation["contents"][1];
                    if (lastIndex1 >= 0 && lastIndex1 != index1) {
                        this.bars[lastIndex1].changeColor(DEFAULT_COLOR);
                    }
                    if (lastIndex2 >= 0) {
                        this.bars[lastIndex2].changeColor(DEFAULT_COLOR);
                    }
                    this.bars[index1].changeColor(VISITED_COLOR);
                    lastIndex1 = index1;
                    lastIndex2 = -1;
                }
            } else {
                clearInterval(animate1);
                animate1Finish = true;
            }
        }, this.speed);
        
        let i = 0;
        let animate2 = setInterval(() => {
            if (animate1Finish) {
                if (i < this.numBars) {
                    this.bars[i].changeColor('lightgreen');
                    i += 1;
                } else {
                    this.animating = false;
                    clearInterval(animate2);
                }
            } 
        }, this.visFast)
    }
}

function displayModal() {
    // Get the modal
    var modal = document.getElementById("vismodal");

    // Get the button
    var btn = document.getElementById("intro");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function main() {
    let myVis = new Visualizer();

    let newArrayButton = document.getElementById('gen-new');
    newArrayButton.addEventListener('click', () => {
        myVis.createNewArray();
    });

    let startVis = document.getElementById('start-vis');
    startVis.addEventListener('click', () => {
        if (!myVis.animating) {
            myVis.sort();
        }
    });

    let selectionBtn = document.getElementById('selection');
    selectionBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize Selection Sort";
        myVis.algorithm = "selection";
    });
    let heapBtn = document.getElementById('heap');
    heapBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize Heap Sort";
        myVis.algorithm = "heap";
    });
    let mergeBtn = document.getElementById('merge');
    mergeBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize Merge Sort";
        myVis.algorithm = "merge";
    });
    let insertionBtn = document.getElementById('insertion');
    insertionBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize Insertion Sort";
        myVis.algorithm = "insertion";
    });
    let quickBtn = document.getElementById('quick');
    quickBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize Quick Sort";
        myVis.algorithm = "quick";
    });
    let lsdBtn = document.getElementById('lsd');
    lsdBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize LSD Radix Sort";
        myVis.algorithm = "lsd";
    });
    let msdBtn = document.getElementById('msd');
    msdBtn.addEventListener('click', () => {
        startVis.innerHTML = "Visualize MSD Radix Sort";
        myVis.algorithm = "msd";
    });

    // Buttons for speed
    let speed = document.getElementById('speed')
    let selectFast = document.getElementById('fast');
    let selectNormal = document.getElementById('normal');
    let selectSlow = document.getElementById('slow');
    // Select Different Speed
    selectFast.addEventListener('click', e => {
        myVis.speed = myVis.visFast;
        speed.innerHTML = "Speed: Fast";
    });
    selectNormal.addEventListener('click', e => {
        myVis.speed = myVis.visNormal;
        speed.innerHTML = "Speed: Normal";
    });
    selectSlow.addEventListener('click', e => {
        myVis.speed = myVis.visSlow;
        speed.innerHTML = "Speed: Slow";
    });
}

main();
displayModal();