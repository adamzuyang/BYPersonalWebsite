const GRID = document.getElementById("grid");

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

/*
The width and height of each node in pixels
To change width and height of nodes, find and change corresponding 
attributes in styles/vis.css .node -> height, width
*/
const cellWidth = 25;
const cellHeight = 25;

class Node {
    // The basic building block of this visualizer

    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;

        // Node.id is of the form "(XPOS,YPOS)"
        this.id = '(' + xPos.toString() + ',' + yPos.toString() + ')';

        /*
        The status of the node. Only four values so far:
        'node': Indicates a regular node
        'start': Indicates that any pathfinding algorithms should start from this node
        'end': Indicates that any pathfinding algorithms should end at this node
        'wall': Indicates that this node is a wall
        'weighted': Indicates that this node is weighted
        */
        this.status = 'node';
        // Used for when moving start/end over another node
        this.prevstatus = 'node';

        // The node's neighbors
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;

        // Used for algorithms
        this.priority = Infinity;
        this.visited = false;
        // Used for bidirectional algorithms
        this.visitedByStart = false;
        this.visitedByEnd = false;

        // The Visualizer object that this Node belongs to
        this.visualizer = null;
    }

    weight() {
        if (this.status == 'weighted') {
            if (this.visualizer != null) {
                return this.visualizer.weightValue;
            } else {
                return 4;
            }
        } else {
            return 1;
        }
    }
}

function digitsToId(x, y) {
    return '(' + x.toString() + ',' + y.toString() + ')';
}

function getRandInteger(min, max) {
    // Returns an integer between min and max, inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Visualizer {
    // Class that handles the visualization of the pathfinding algorithms
    
    constructor() {
        /* 
        Instance variables:
            idToNode: A dictionary with Node id's as keys and Node objects as values
            nodes: An array of all nodes in this visualizer
            width: The width of the grid in # of nodes
            height: The height of the grid in # of nodes
            startNode: The starting node to start the algorithm
            endNode: The node that ends the algorithm
            reset: If the graph has been reset
            key: For key presses. Should only ever be "w" or "" for now
            weightValue: Weight of weighted nodes
            patternWallIds: List of wall node ids for patterns
            patternWeightIds: List of weight node ids for patterns
            mazeHoles: List of "hole" nodes for maze generation
            visualizing: If the pathfinding algorithm is currently being visualized
            algorithm: Algorithm currently selected
        */
        this.idToNode = {};
        this.nodes = [];
        this.width = Math.max(Math.floor((windowWidth - 25) / cellWidth), 12);
        this.height = Math.max(Math.floor((windowHeight - 250) / cellHeight), 12);
        this.reset = true;
        this.key = '';
        this.weightValue = 4;
        this.patternWallIds = [];
        this.patternWeightIds = [];
        this.mazeHoles = new Set();
        this.visualizing = false;
        this.algorithm = '';

        // Animation Speeds
        this.visFast = 25;
        this.pathFast = 25;
        this.visNormal = 45;
        this.pathNormal = 45;
        this.visSlow = 65;
        this.pathSlow = 65;
        // Default speed
        this.visSpeed = this.visNormal;
        this.pathSpeed = this.pathNormal;

        /*
        Used for animations when adding/removing/moving nodes:
            mouseIsPressed: If mouse is down
            mouseStatus: Describes how the mouse should change the nodes it enters when it is pressed down
            lastMousedOverNode: Helper memory slot. Keeps track of the node last moused over
            lastMousedOverDiv: Corresponding HTML div to lastMousedOverNode
            locked: When true, locks the visualizer so the user cannot do anything other than resetting the visualizer
        */
        this.mouseIsPressed = false;
        this.mouseStatus = '';
        this.lastMousedOverNode = null;
        this.lastMousedOverDiv = null;
        this.locked = false;

        // Create nodes, add to this.idToNode, add to this.nodes
        // Add node divs to HTML with IDs corresponding to each node.id
        // Assign each node's visualizer to THIS
        var i;
        var j;
        for (i = 0; i < this.height; i += 1) {
            let newTableRow = "<tr>";
            for (j = 0; j < this.width; j += 1) {
                let newNode = new Node(j, i);
                newNode.visualizer = this;
                this.nodes.push(newNode);
                this.idToNode[newNode.id] = newNode;
                newTableRow += `<td class='node' id='${newNode.id}'></td>`;
            }
            newTableRow += "</tr>";
            GRID.innerHTML += newTableRow;
        }

        // Assign each node its neighbors (left, right, up, and down)
        var k;
        for (k = 0; k < this.nodes.length; k += 1) {
            let node = this.nodes[k];
            node.left = this.idToNode[digitsToId(node.xPos - 1, node.yPos)];
            node.right = this.idToNode[digitsToId(node.xPos + 1, node.yPos)];
            node.up = this.idToNode[digitsToId(node.xPos, node.yPos - 1)];
            node.down = this.idToNode[digitsToId(node.xPos, node.yPos + 1)];
        }

        // Assign startNode
        this.startNode = this.idToNode[digitsToId(Math.floor(this.width / 4), Math.floor(this.height / 2))];
        this.endNode = this.idToNode[digitsToId(Math.floor(3 * this.width / 4), Math.floor(this.height / 2))];

        // Assign endNode
        this.startNode.status = 'start';
        this.endNode.status = 'end';

        // Animate start and endNodes
        setTimeout(() => {
            document.getElementById(this.startNode.id).className = 'node node-to-start';
            document.getElementById(this.endNode.id).className = 'node node-to-end';
        }, 100);
    }


    // Reset functions:

    resetVis() {
        // Reset all nodes except for walls and weighted nodes
        for (let i = 0; i < this.nodes.length; i += 1) {
            let node = this.nodes[i];
            node.priority = Infinity;
            node.visited = false;
            if (node.status != 'end' && node.status != 'start' && node.status != 'wall' && node.status != 'weighted') {
                document.getElementById(node.id).className = 'node';
                node.status = 'node';
            } else {
                document.getElementById(node.id).className = 'node ' + 'node-to-' + node.status;
            }
        }

        // Reset helper data structures to defaults
        this.patternWallIds = [];
        this.patternWeightIds = [];
        this.mazeHoles = new Set();

        this.visualizing = false;
        this.locked = false;
        this.reset = true;
    }

    resetAll() {
        // Reset all nodes
        for (let i = 0; i < this.nodes.length; i += 1) {
            let node = this.nodes[i];
            node.priority = Infinity;
            node.visited = false;
            if (node.status != 'end' && node.status != 'start') {
                document.getElementById(node.id).className = 'node';
                node.status = 'node';
            } else if (node.status == 'start' || node.status == 'end') {
                document.getElementById(node.id).className = 'node ' + 'node-to-' + node.status;
            }
        }

        // Reset helper data structures to defaults
        this.patternWallIds = [];
        this.patternWallIds = [];
        this.mazeHoles = new Set();

        this.visualizing = false;
        this.locked = false;
        this.reset = true;
    }


    // For mouse movements:

    handleMouse() {
        // Handles mouse movements on grid
        for (let i = 0; i < this.nodes.length; i += 1) {
            let node = this.nodes[i];
            let nodeCell = document.getElementById(node.id);

            nodeCell.addEventListener('mousedown', e => {
                if (!this.locked) {
                    e.preventDefault();
                    this.mouseIsPressed = true;
                    if (node.status == 'node') {
                        this.mouseStatus = 'wall-or-weighted';

                        // If "w" is pressed, change node to weighted. Else change to wall
                        if (this.key == 'w') {
                            node.status = 'weighted';
                            nodeCell.className = 'node node-to-weighted';
                        } else {
                            node.status = 'wall';
                            nodeCell.className = 'node node-to-wall';
                        }
                    } else if (node.status == 'wall' || node.status == 'weighted') {
                        this.mouseStatus = 'node';
                        node.status = 'node';
                        nodeCell.className = 'node';
                    } else if (node.status == 'start' || node.status == 'end') {
                        this.mouseStatus = node.status;
                    } else {
                        this.mouseStatus = '';
                    }

                    this.lastMousedOverNode = node;
                    this.lastMousedOverDiv = nodeCell;

                    // Used for dynamic visualizations
                    if (this.visualizing) {
                        this.visWOAnimation();
                    }
                }
            });

            nodeCell.addEventListener('mouseenter', e => {
                if ((!this.locked) && this.mouseIsPressed && (this.lastMousedOverDiv.id != nodeCell.id) && (this.mouseStatus != node.status)) {
                    if (this.mouseStatus == 'start' || this.mouseStatus == 'end') {
                        
                        if (node.status != 'start' && node.status != 'end') {
                            let nodePreviousStatus = node.status;
                            node.prevstatus = node.status;
                            node.status = this.mouseStatus;
                            this.lastMousedOverNode.status = this.lastMousedOverNode.prevstatus;
                            this.lastMousedOverNode.prevstatus = 'node';

                            if (this.mouseStatus == 'start') {
                                this.startNode = node;
                            } else {
                                this.endNode = node;
                            }
    
                            this.lastMousedOverDiv.className = 'node ' + this.mouseStatus + '-to-' + this.lastMousedOverNode.status;
                            if (this.visualizing) {
                                nodeCell.className = 'node ' + this.mouseStatus;
                            } else {
                                nodeCell.className = 'node ' + nodePreviousStatus + '-to-' + this.mouseStatus;
                            }

                            this.lastMousedOverNode = node;
                            this.lastMousedOverDiv = nodeCell;
                        }

                    } else if (node.status == 'start' || node.status == 'end') {
                        // Do nothing if going over a start/end node if mouseStatus is not start/end
                    } else if (this.mouseStatus == 'wall-or-weighted') {

                        if (this.key == 'w') {
                            node.status = 'weighted';
                            nodeCell.className = 'node node-to-weighted';
                        } else {
                            node.status = 'wall';
                            nodeCell.className = 'node node-to-wall';
                        }

                        this.lastMousedOverNode = node;
                        this.lastMousedOverDiv = nodeCell;
                    } else if (this.mouseStatus == 'node') {

                        node.status = 'node';
                        nodeCell.className = 'node';
                        this.lastMousedOverNode = node;
                        this.lastMousedOverDiv = nodeCell;

                    }

                    if (this.visualizing) {
                        this.visWOAnimation();
                    }
                }
            });

            document.addEventListener('mouseup', e => {
                this.mouseIsPressed = false;
                this.mouseStatus = '';
                this.lastMousedOverNode = null;
                this.lastMousedOverDiv = null;
            });
        }
    }


    // Path-finding algorithms:

    dijkstra(heuristic) {
        /* 
        Can be used for either Dijkstra, A*, or Greedy algorithms depending on the heuristic
        Returns two lists of nodes computed using Dijkstra/A* Algorithm:
            path: the path of nodes from the start vertex to the end vertex
            visitNodesOrder: the order in which the nodes were "visited"
        */

        function relaxEdges(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            var i;
            for (i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != "wall" && (distToIds[node.id] + cur.weight() < distToIds[cur.id])) {
                    distToIds[cur.id] = distToIds[node.id] + cur.weight();
                    nodeToIds[cur.id] = node;
                    cur.priority = distToIds[cur.id] + heuristic(cur);
                }
            }
        }

        // Initialize data structures
        let visitNodesOrder = [];
        let nodeToIds = {};
        let distToIds = {};
        let path = [];
        let unvisited = [...this.nodes];

        // Initialize distToIds array with default value Infinity
        var j;
        for (j = 0; j < unvisited.length; j += 1) {
            distToIds[unvisited[j].id] = Infinity;
        }

        // Set start node's priority and distance to 0 plus the heuristic
        this.startNode.priority = 0 + heuristic(this.startNode);
        distToIds[this.startNode.id] = 0;
        unvisited.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);

        // Visit nodes and relax edges until unvisited array is empty, next node has infinite priority, or we visit the endNode
        while (unvisited.length > 0 && unvisited[0].priority < Infinity) {
            let smallest = unvisited.shift();
            relaxEdges(smallest);
            if (smallest.status != 'start' && smallest.status != 'end') {
                visitNodesOrder.push(smallest);
            }
            unvisited.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);
            smallest.visited = true;
            if (this.endNode.visited == true) {
                break;
            }
        }

        // Create path array
        if (this.endNode.visited == true) {
            let nextNode = this.endNode;
            while (nextNode.id != this.startNode.id) {
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    path.unshift(nextNode);
                }
                nextNode = nodeToIds[nextNode.id];
            }
        } else {
            path = null;
        }

        return {"path": path, "visitNodesOrder": visitNodesOrder};
    }

    resetBiVisited() {
        // Resets visited booleans for each node
        for (let i = 0; i < this.nodes.length; i += 1) {
            this.nodes[i].visitedByStart = false;
            this.nodes[i].visitedByEnd = false;
        }
    }

    bidijkstra(heur1, heur2) {
        /*
        Bidirectional Dijkstra's algorithm
        Essentially two instances of Dijkstra's algorithms occurring simultaneously,
        one from the start node and one from the end node.
        Hence the need for two heuristics and two relaxation functions.
        */
        function relaxStart(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            for (let i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != "wall" && (startDistToIds[node.id] + cur.weight() < startDistToIds[cur.id])) {
                    startDistToIds[cur.id] = startDistToIds[node.id] + cur.weight();
                    startNodeToIds[cur.id] = node;
                    cur.priority = startDistToIds[cur.id] + heur1(cur);
                    if (!startQueue.includes(cur)) {
                        startQueue.push(cur);
                    }
                }
            }
        }

        function relaxEnd(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            for (let i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != "wall" && (endDistToIds[node.id] + node.weight() < endDistToIds[cur.id])) {
                    endDistToIds[cur.id] = endDistToIds[node.id] + cur.weight();
                    endNodeToIds[cur.id] = node;
                    cur.priority = endDistToIds[cur.id] + heur2(cur);
                    if (!endQueue.includes(cur)) {
                        endQueue.push(cur);
                    }
                }
            }
        }

        // Initialize data structures
        let visitNodesOrder = [];
        let startNodeToIds = {};
        let endNodeToIds = {};
        let startDistToIds = {};
        let endDistToIds = {};
        let path = [];
        let startQueue = [];
        let endQueue = [];

        let middleNode = null;

        // Initialize distToIds arrays with default value Infinity
        for (let j = 0; j < this.nodes.length; j += 1) {
            startDistToIds[this.nodes[j].id] = Infinity;
            endDistToIds[this.nodes[j].id] = Infinity;
        }

        // Set start node's priority and distance to 0 plus the heuristic
        // Set end node's priority and distance to 0 plus the heuristic
        this.startNode.priority = 0 + heur1(this.startNode);
        startDistToIds[this.startNode.id] = 0;
        startQueue.push(this.startNode);
        this.endNode.priority = 0 + heur2(this.endNode);
        endDistToIds[this.endNode.id] = 0;
        endQueue.push(this.endNode);

        // Visit nodes and relax edges until queues are empty, next node has infinite priority, or we visit the middle node
        while ((startQueue.length > 0 && endQueue.length > 0) && ((startQueue.length > 0 && startQueue[0].priority < Infinity) || (endQueue.length > 0 && endQueue[0].priority < Infinity))) {
            let startPriority = Infinity;
            let endPriority = Infinity;
            if (startQueue.length > 0) {
                startPriority = startQueue[0].priority;
            }
            if (endQueue.length > 0) {
                endPriority = endQueue[0].priority;
            }

            if (startPriority <= endPriority) {
                let smallest = startQueue.shift();
                relaxStart(smallest);
                if (smallest.status != 'start' && smallest.status != 'end') {
                    visitNodesOrder.push(smallest);
                }
                startQueue.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);
                smallest.visitedByStart = true;
                if (smallest.visitedByStart && smallest.visitedByEnd) {
                    middleNode = smallest;
                    break;
                }
            } else {
                let smallest = endQueue.shift();
                relaxEnd(smallest);
                if (smallest.status != 'start' && smallest.status != 'end') {
                    visitNodesOrder.push(smallest);
                }
                endQueue.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);
                smallest.visitedByEnd = true;
                if (smallest.visitedByStart && smallest.visitedByEnd) {
                    middleNode = smallest;
                    break;
                }
            }
        }

        // Create path array
        if (middleNode != null) {
            // Path from middle to start node
            let nextNode = middleNode;
            while (nextNode.id != this.startNode.id) {
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    path.unshift(nextNode);
                }
                nextNode = startNodeToIds[nextNode.id];
            }
            // Path from middle to end node
            nextNode = middleNode;
            while (nextNode.id != this.endNode.id) {
                if (!path.includes(nextNode) && nextNode.status != 'start' && nextNode.status != 'end') {
                    path.push(nextNode);
                }
                nextNode = endNodeToIds[nextNode.id];
            }
        } else {
            path = null;
        }

        this.resetBiVisited();

        return {"path": path, "visitNodesOrder": visitNodesOrder};
    }

    dfs() {
        // Non-recursive DFS uses a stack
        function relaxEdges(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            for (let i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != 'wall' && !cur.visited) {
                    stack.push(cur);
                    nodeToIds[cur.id] = node;
                }
            }
        }

        let visitNodesOrder = [];
        let nodeToIds = {};
        let path = [];
        let stack = [];

        stack.push(this.startNode);

        while (stack.length > 0) {
            let popNode = stack.pop();
            relaxEdges(popNode);
            if (popNode.status != 'start' && popNode.status != 'end') {
                visitNodesOrder.push(popNode);
            }
            popNode.visited = true;
            if (this.endNode.visited) {
                break;
            }
        }

        // Create path array
        if (this.endNode.visited) {
            let nextNode = this.endNode;
            while (nextNode.id != this.startNode.id) {
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    path.unshift(nextNode);
                }
                nextNode = nodeToIds[nextNode.id];
            }
        } else {
            path = null;
        }

        return {"path": path, "visitNodesOrder": visitNodesOrder};
    }

    bfs() {
        // BFS uses a queue, similar to Dijkstra's but disregard edge weights. Hence no distTo array
        function relaxEdges(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            for (let i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != 'wall' && !cur.visited) {
                    queue.push(cur);
                    nodeToIds[cur.id] = node;
                    cur.visited = true;
                }
            }
        }

        let visitNodesOrder = [];
        let nodeToIds = {};
        let path = [];
        let queue = [];

        queue.push(this.startNode);

        while (queue.length > 0) {
            let shiftNode = queue.shift();
            relaxEdges(shiftNode);
            if (shiftNode.status != 'start' && shiftNode.status != 'end') {
                visitNodesOrder.push(shiftNode);
            }
            shiftNode.visited = true;
            if (this.endNode.visited) {
                break;
            }
        }

        // Create path array
        if (this.endNode.visited) {
            let nextNode = this.endNode;
            while (nextNode.id != this.startNode.id) {
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    path.unshift(nextNode);
                }
                nextNode = nodeToIds[nextNode.id];
            }
        } else {
            path = null;
        }

        return {"path": path, "visitNodesOrder": visitNodesOrder};
    }

    greedy(heuristic) {
        /* 
        Can be used for either Dijkstra, A*, or Greedy algorithms depending on the heuristic
        Returns two lists of nodes computed using Dijkstra/A* Algorithm:
            path: the path of nodes from the start vertex to the end vertex
            visitNodesOrder: the order in which the nodes were "visited"
        */

        function relaxEdges(node) {
            let adjacents = [node.up, node.right, node.down, node.left];

            var i;
            for (i = 0; i < adjacents.length; i += 1) {
                let cur = adjacents[i];
                if (cur != null && cur.status != "wall" && (distToIds[node.id] + cur.weight() < distToIds[cur.id])) {
                    distToIds[cur.id] = distToIds[node.id] + cur.weight();
                    nodeToIds[cur.id] = node;
                    cur.priority = heuristic(cur);
                }
            }
        }

        // Initialize data structures
        let visitNodesOrder = [];
        let nodeToIds = {};
        let distToIds = {};
        let path = [];
        let unvisited = [...this.nodes];

        // Initialize distToIds array with default value Infinity
        var j;
        for (j = 0; j < unvisited.length; j += 1) {
            distToIds[unvisited[j].id] = Infinity;
        }

        // Set start node's priority and distance to 0 plus the heuristic
        this.startNode.priority = 0 + heuristic(this.startNode);
        distToIds[this.startNode.id] = 0;
        unvisited.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);

        // Visit nodes and relax edges until unvisited array is empty, next node has infinite priority, or we visit the endNode
        while (unvisited.length > 0 && unvisited[0].priority < Infinity) {
            let smallest = unvisited.shift();
            relaxEdges(smallest);
            if (smallest.status != 'start' && smallest.status != 'end') {
                visitNodesOrder.push(smallest);
            }
            unvisited.sort((nodeA, nodeB) => nodeA.priority - nodeB.priority);
            smallest.visited = true;
            if (this.endNode.visited == true) {
                break;
            }
        }

        // Create path array
        if (this.endNode.visited == true) {
            let nextNode = this.endNode;
            while (nextNode.id != this.startNode.id) {
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    path.unshift(nextNode);
                }
                nextNode = nodeToIds[nextNode.id];
            }
        } else {
            path = null;
        }

        return {"path": path, "visitNodesOrder": visitNodesOrder};
    }

    createVisitedAndPath() {
        // Creates the result (that contains the visitNodesOrder and path arrays) based on algorithm selected
        var result = null;
        if (this.algorithm == "") {
            alert("Please select an algorithm to visualize!");
        } else {
            let end = this.endNode;
            let start = this.startNode;
            for (let i = 0; i < this.nodes.length; i += 1) {
                let node = this.nodes[i];
                node.visited = false;
                node.priority = Infinity;
            }
            // Decide which algorithm to use
            if (this.algorithm == 'dijkstra') {
                // Dijkstra heuristic is 0
                result = this.dijkstra((node) => 0);
            } else if (this.algorithm == 'a-star-lin') {
                // Linear diagonal heuristic
                function linHeuristic(node) {
                    return 1.1 * Math.sqrt(Math.pow(node.xPos - end.xPos, 2) + Math.pow(node.yPos - end.yPos, 2));
                }
                result = this.dijkstra(linHeuristic);
            } else if (this.algorithm == 'a-star-square') {
                // Squared diagonal heuristic
                function squareHeuristic(node) {
                    return Math.pow(node.xPos - end.xPos, 2) + Math.pow(node.yPos - end.yPos, 2);
                }
                result = this.dijkstra(squareHeuristic);
            } else if (this.algorithm == 'a-star-man') {
                // Manhattan heuristic
                function manHeuristic(node) {
                    return 1.001 * (Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos));
                }
                result = this.dijkstra(manHeuristic);
            } else if (this.algorithm == 'a-star-swarm') {
                // Swarm heuristic
                function swarmHeuristic(node) {
                    return 1.001 * (Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos) + Math.abs(node.xPos - start.xPos) + Math.abs(node.yPos - start.yPos));
                }
                result = this.dijkstra(swarmHeuristic);
            } else if (this.algorithm == 'conv-swarm') {
                function convSwarmHeuristic(node) {
                    return 6.001 * (Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos) + Math.abs(node.xPos - start.xPos) + Math.abs(node.yPos - start.yPos));
                }
                result = this.dijkstra(convSwarmHeuristic);
            } else if (this.algorithm == 'greedy') {
                function greedyHeuristic(node) {
                    return 1.001 * (Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos)) + 2 * node.weight();
                }
                result = this.greedy(greedyHeuristic);
            } else if (this.algorithm == 'dfs') {
                result = this.dfs();
            } else if (this.algorithm == 'bfs') {
                result = this.bfs();
            } else if (this.algorithm == 'bidijkstra') {
                // Bidirectional Dijkstra heuristic is 0
                result = this.bidijkstra((node) => 0, (node) => 0);
            } else if (this.algorithm == 'bi-swarm') {
                // Bidirectional A* with Swarm Heuristic
                function heur1(node) {
                    return 1.001 * (Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos) + Math.abs(node.xPos - start.xPos) + Math.abs(node.yPos - start.yPos));
                }
                function heur2(node) {
                    return 1.001 * (Math.abs(node.xPos - start.xPos) + Math.abs(node.yPos - start.yPos) + Math.abs(node.xPos - end.xPos) + Math.abs(node.yPos - end.yPos));
                }
                result = this.bidijkstra(heur1, heur2);
            }
        }

        return result;
    }

    visWOAnimation() {
        // Visualize without animating. Used for dynamic visualization
        let result = this.createVisitedAndPath();

        this.visualize(result);
    }

    visualize(result) {
        // Helper function for visWOAnimation. Assigns HTML divs new class names based on result
        // Does not animate
        if (result == null) {
            return;
        }

        let path = result["path"];
        let visitNodesOrder = result["visitNodesOrder"];

        for (let i = 0; i < this.nodes.length; i += 1) {
            let node = this.nodes[i];
            let nodeDiv = document.getElementById(node.id);
            if (path != null && path.includes(node)) {
                if (node.status == 'node') {
                    nodeDiv.className = 'node path';
                } else if (node.status == 'weighted') {
                    nodeDiv.className = 'node weighted-and-path';
                }
            } else if (visitNodesOrder.includes(node)) {
                if (node.status == 'node') {
                    nodeDiv.className = 'node visited';
                } else if (node.status == 'weighted') {
                    nodeDiv.className = 'node weighted-and-visited';
                }
            } else {
                if (node.status == 'node') {
                    nodeDiv.className = 'node';
                } else if (node.status == 'weighted') {
                    nodeDiv.className = 'node weighted';
                }
            }
        }
    }

    animateAll(result) {
        // Animates the visited nodes from result and then animates the path nodes from result
        
        // Lock user edits to grid
        this.locked = true;

        // Used to trigger path animation once visited animation is finished
        let triggerPath = false;

        var numVisited;

        // Used for resetting grid mid-animation
        let resetButton = document.getElementById('reset-vis');
        let resetButtonAll = document.getElementById('reset-all');
        let startVis = document.getElementById('start-vis');

        let visitNodesOrder = result['visitNodesOrder'];
        let path = result['path'];

        // Animate all visited nodes
        numVisited = visitNodesOrder.length;
        var animate1 = setInterval(() => {
            if (visitNodesOrder.length > 0) {
                let nextNode = visitNodesOrder.shift();
                let nextNodeDiv = document.getElementById(nextNode.id);
                if (nextNode.status == 'weighted') {
                    nextNodeDiv.className = 'node weighted-to-visited';
                } else {
                    nextNodeDiv.className = 'node node-to-visited';
                }
            } else {
                triggerPath = true;
                clearInterval(animate1);
            }
        }, this.visSpeed)

        // Animate path. setTimeout waits for above code to finish
        var checkVis = setInterval(() => {
            if (triggerPath) {
                triggerPath = false;
                if (path == null) {
                    alert("No such path exists!");
                    this.resetVis();
                    clearInterval(checkVis)
                } else {
                    var animate2 = setInterval(() => {
                        if (path.length > 0) {
                            let nextNode = path.shift();
                            let nextNodeDiv = document.getElementById(nextNode.id);
                            if (nextNode.status == 'weighted') {
                                nextNodeDiv.className = 'node weighted-to-path';
                            } else {
                                nextNodeDiv.className = 'node node-to-path';
                            }
                        } else {
                            clearInterval(animate2);
                            clearInterval(checkVis);
                            // Now that the animation is finished, unlock user edits to grid
                            this.locked = false;
                        }
                    }, this.pathSpeed);
    
                    // Used for resetting grid while path is animated
                    resetButton.addEventListener('click', e => {
                        clearInterval(animate2);
                    })
                    resetButtonAll.addEventListener('click', e => {
                        clearInterval(animate2);
                    })
                    startVis.addEventListener('click', e => {
                        clearInterval(animate2);
                    })
                }
            }
        }, 500)

        // Used for resetting grid while visited nodes are animated. Interrupts the path animation as well.
        resetButton.addEventListener('click', e => {
            clearInterval(animate1);
            clearInterval(checkVis);
        })
        resetButtonAll.addEventListener('click', e => {
            clearInterval(animate1);
            clearInterval(checkVis);
        })
        startVis.addEventListener('click', e => {
            clearInterval(animate1);
            clearInterval(checkVis);
        })
    }


    // Pattern-creation algorithms:

    createRecursiveMaze() {
        // Creates a recursive maze based on recursive division
        this.patternWallIds = [];
        this.mazeHoles.add(this.startNode.id);
        this.mazeHoles.add(this.endNode.id);
        if (this.width > this.height) {
            let randX = getRandInteger(Math.floor(this.width / 3), Math.floor(2 * this.width / 3));
            let holeY = getRandInteger(0, this.height);

            for (let i = 0; i < this.height; i += 1) {
                if (i != holeY) {
                    this.patternWallIds.push(digitsToId(randX, i));
                }
            }

            this.mazeHoles.add(digitsToId(randX, holeY));

            this.createRecursiveMazeHelper(0, 0, randX - 1, this.height - 1, -1, holeY);
            this.createRecursiveMazeHelper(randX + 1, 0, this.width - 1, this.height - 1, -1, holeY);

        } else if (this.height >= this.width) {
            let randY = getRandInteger(Math.floor(this.height / 3), Math.floor(2 * this.height / 3));
            let holeX = getRandInteger(0, this.width);

            for (let i = 0; i < this.width; i += 1) {
                if (i != holeX) {
                    this.patternWallIds.push(digitsToId(i, randY));
                }
            }

            this.mazeHoles.add(digitsToId(holeX, randY));

            this.createRecursiveMazeHelper(0, 0, this.width - 1, randY - 1, holeX, -1);
            this.createRecursiveMazeHelper(0, randY + 1, this.width - 1, this.height - 1, holeX, -1);
        }
    }

    createRecursiveMazeHelper(x1, y1, x2, y2, prevHoleX, prevHoleY) {
        // Helper function for createRecursiveMaze. Takes over after initial division in createRecursive Maze.
        let width = x2 - x1;
        let height = y2 - y1;

        if (width < 3 && height < 3) {
            return;
        }

        if (width > height) {
            let randX = getRandInteger(x1 + 1, x2 - 1);
            while (randX == prevHoleX) {
                randX = getRandInteger(x1 + 1, x2 - 1);
            }
            
            var holeY;
            if (this.mazeHoles.has(digitsToId(randX, y2 + 1))) {
                holeY = y2;
            } else if (this.mazeHoles.has(digitsToId(randX, y1 - 1))) {
                holeY = y1;
            } else {
                holeY = getRandInteger(y1, y2);
            }

            for (let i = y1; i <= y2; i += 1) {
                if (i != holeY) {
                    this.patternWallIds.push(digitsToId(randX, i));
                }
            }

            this.mazeHoles.add(digitsToId(randX, holeY));

            this.createRecursiveMazeHelper(x1, y1, randX - 1, y2, prevHoleX, holeY);
            this.createRecursiveMazeHelper(randX + 1, y1, x2, y2, prevHoleX, holeY);

        } else if (height >= width) {
            let randY = getRandInteger(y1 + 1, y2 - 1);
            while (randY == prevHoleY) {
                randY = getRandInteger(y1 + 1, y2 - 1);
            }

            var holeX;
            if (this.mazeHoles.has(digitsToId(x2 + 1, randY))) {
                holeX = x2;
            } else if (this.mazeHoles.has(digitsToId(x1 - 1, randY))) {
                holeX = x1;
            } else {
                holeX = getRandInteger(x1, x2);
            }

            for (let i = x1; i <= x2; i += 1) {
                if (i != holeX) {
                    this.patternWallIds.push(digitsToId(i, randY));
                }
            }
            
            this.mazeHoles.add(digitsToId(holeX, randY));

            this.createRecursiveMazeHelper(x1, y1, x2, randY - 1, holeX, prevHoleY);
            this.createRecursiveMazeHelper(x1, randY + 1, x2, y2, holeX, prevHoleY);
        }
    }

    createRandomWeights(numWeights) {
        // Creates an array of random node ids for weighted nodes
        this.patternWeightIds = [];
        for (let i = 0; i < numWeights; i += 1) {
            let randX = getRandInteger(0, this.width - 1);
            let randY = getRandInteger(0, this.height - 1);
            if (!this.patternWallIds.includes(digitsToId(randX, randY))) {
                this.patternWeightIds.push(digitsToId(randX, randY));
            }
        }
    }

    createRandomWalls(numWalls) {
        // Creates an array of random node ids for wall nodes
        this.patternWallIds = [];
        for (let i = 0; i < numWalls; i += 1) {
            let randX = getRandInteger(0, this.width - 1);
            let randY = getRandInteger(0, this.height - 1);
            this.patternWallIds.push(digitsToId(randX, randY));
        }
    }

    createRandomWeightsForMaze(numWeights) {
        // Given that createRecursiveMaze has been called, creates weights for the given maze such that the weights do not replace walls
        this.patternWeightIds = [];
        numWeights = Math.min(numWeights, (this.height * this.width) * 0.7 - this.patternWallIds.length);
        for (let i = 0; i < numWeights; i += 1) {
            let randX = getRandInteger(0, this.width - 1);
            let randY = getRandInteger(0, this.height - 1);
            let nextId = digitsToId(randX, randY);
            while (this.patternWallIds.includes(nextId)) {
                randX = getRandInteger(0, this.width - 1);
                randY = getRandInteger(0, this.height - 1);
                nextId = digitsToId(randX, randY);
            }
            this.patternWeightIds.push(nextId);
        }
    }

    applyPattern() {
        // Helper functions to pattern-creation algorithms above
        // Animates the patterns, applies new node statuses to the results returned by the pattern-creation algorithms above

        // Lock user edits to grid
        this.locked = true;

        // Used for resetting grid during animations
        let resetButton = document.getElementById('reset-vis');
        let resetButtonAll = document.getElementById('reset-all');

        var animate1 = setInterval(() => {
            if (this.patternWallIds.length > 0) {
                let nextNodeId = this.patternWallIds.shift();
                let nextNode = this.idToNode[nextNodeId];
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    let nextNodeDiv = document.getElementById(nextNodeId);
                    nextNode.status = 'wall';
                    nextNodeDiv.className = 'node node-to-wall';
                }
            } else if (this.patternWeightIds.length > 0) {
                let nextNodeId = this.patternWeightIds.shift();
                let nextNode = this.idToNode[nextNodeId];
                if (nextNode.status != 'start' && nextNode.status != 'end') {
                    let nextNodeDiv = document.getElementById(nextNodeId);
                    nextNode.status = 'weighted';
                    nextNodeDiv.className = 'node node-to-weighted';
                }
            } else {
                clearInterval(animate1);
                // Now that the animation is finished, unlock user edits to grid
                this.locked = false;
            }
        }, 15);

        resetButton.addEventListener('click', e => {
            clearInterval(animate1);
        })
        resetButtonAll.addEventListener('click', e => {
            clearInterval(animate1);
        })
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
    //Buttons for visualizations
    let startVis = document.getElementById('start-vis');
    let selectDijkstra = document.getElementById('dijkstra');
    let selectAStarLin = document.getElementById('a-star-lin');
    let selectAStarMan = document.getElementById('a-star-man');
    let selectAStarSwarm = document.getElementById('a-star-swarm');
    let selectConvSwarm = document.getElementById('conv-swarm');
    let selectGreedy = document.getElementById('greedy');
    let selectBiDijkstra = document.getElementById('bidijkstra');
    let selectBiAStar = document.getElementById('bi-swarm');
    let selectDFS = document.getElementById('dfs');
    let selectBFS = document.getElementById('bfs');

    // Buttons for resetting
    let resetButton = document.getElementById('reset-vis');
    let resetButtonAll = document.getElementById('reset-all');

    // Buttons for patterns
    let recurMaze = document.getElementById('recur-maze');
    let randWeights = document.getElementById('rand-weights');
    let randWalls = document.getElementById('rand-walls');
    let recurMazeWeights = document.getElementById('recur-maze-weights');
    let randWallsWeights = document.getElementById('rand-walls-weights');

    // Buttons for speed
    let speed = document.getElementById('speed')
    let selectFast = document.getElementById('fast');
    let selectNormal = document.getElementById('normal');
    let selectSlow = document.getElementById('slow');

    let myVis = new Visualizer();

    // For pressing 'w' and adding weights
    document.addEventListener('keydown', e => {
        myVis.key = e.key;
    })
    document.addEventListener('keyup', e => {
        myVis.key = '';
    })

    // Sets visualize button HTML and myVis algorithm based on which button is selected
    selectDijkstra.addEventListener('click', e => {
        myVis.algorithm = 'dijkstra';
        startVis.innerHTML = "Visualize Dijkstra's";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectAStarLin.addEventListener('click', e => {
        myVis.algorithm = 'a-star-lin';
        startVis.innerHTML = "Visualize A* (Euclidean)";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectAStarMan.addEventListener('click', e => {
        myVis.algorithm = 'a-star-man';
        startVis.innerHTML = "Visualize A* (Manhattan)";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectAStarSwarm.addEventListener('click', e => {
        myVis.algorithm = 'a-star-swarm';
        startVis.innerHTML = "Visualize A* (Swarm)";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectConvSwarm.addEventListener('click', e => {
        myVis.algorithm = 'conv-swarm';
        startVis.innerHTML = "Visualize Convergent Swarm";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectGreedy.addEventListener('click', e => {
        myVis.algorithm = 'greedy';
        startVis.innerHTML = "Visualize Greedy";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectBiDijkstra.addEventListener('click', e => {
        myVis.algorithm = 'bidijkstra';
        startVis.innerHTML = "Visualize Bidirectional Dijkstra's";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectBiAStar.addEventListener('click', e => {
        myVis.algorithm = 'bi-swarm';
        startVis.innerHTML = "Visualize Bidirectional Swarm";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectDFS.addEventListener('click', e => {
        myVis.algorithm = 'dfs';
        startVis.innerHTML = "Visualize Depth-first Search";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });
    selectBFS.addEventListener('click', e => {
        myVis.algorithm = 'bfs';
        startVis.innerHTML = "Visualize Breadth-first Search";
        startVis.className = "menu-link vis-button vis-fancy-link";
    });

    // Reset functionality
    resetButton.addEventListener('click', e => {
        myVis.resetVis();
    });
    resetButtonAll.addEventListener('click', e => {
        myVis.resetAll();
    });

    // Select Different Speed
    selectFast.addEventListener('click', e => {
        myVis.visSpeed = myVis.visFast;
        myVis.pathSpeed = myVis.pathFast;
        speed.innerHTML = "Speed: Fast";
    });
    selectNormal.addEventListener('click', e => {
        myVis.visSpeed = myVis.visNormal;
        myVis.pathSpeed = myVis.pathNormal;
        speed.innerHTML = "Speed: Normal";
    });
    selectSlow.addEventListener('click', e => {
        myVis.visSpeed = myVis.visSlow;
        myVis.pathSpeed = myVis.pathSlow;
        speed.innerHTML = "Speed: Slow";
    });

    // Create patterns;
    recurMaze.addEventListener('click', e => {
        if (myVis.locked) {
            return;
        }
        myVis.resetAll();
        myVis.createRecursiveMaze();
        myVis.applyPattern();
    });
    randWeights.addEventListener('click', e => {
        if (myVis.locked) {
            return;
        }
        myVis.resetAll();
        myVis.createRandomWeights(myVis.height * myVis.width / 2);
        myVis.applyPattern();
    });
    randWalls.addEventListener('click', e => {
        if (myVis.locked) {
            return;
        }
        myVis.resetAll();
        myVis.createRandomWalls(myVis.height * myVis.width / 4);
        myVis.applyPattern();
    });
    randWallsWeights.addEventListener('click', e => {
        if (myVis.locked) {
            return;
        }
        myVis.resetAll();
        myVis.createRandomWalls(myVis.height * myVis.width / 7);
        myVis.createRandomWeights(myVis.height * myVis.width / 4)
        myVis.applyPattern();
    });
    recurMazeWeights.addEventListener('click', e => {
        if (myVis.locked) {
            return;
        }
        myVis.resetAll();
        myVis.createRecursiveMaze();
        myVis.createRandomWeightsForMaze(myVis.height * myVis.width / 7);
        myVis.applyPattern();
    })

    // Entry point to start pathfinding visualization
    startVis.addEventListener('click', e => {
        var result;
        if (myVis.algorithm == "") {
            alert("Please select an algorithm to visualize!");
        } else {
            myVis.resetVis();
            // Decide which algorithm to use
            result = myVis.createVisitedAndPath();
            myVis.animateAll(result);
            myVis.visualizing = true;
        }
    });

    // Used for user interaction based on mouse actions
    myVis.handleMouse();
}

// Run main function
main();
// Display modal
displayModal();