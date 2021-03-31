# Barnett Yang Personal Portfolio, Pathfinding Visualizer, and Sorting Visualizer

This online portfolio hosts my resume, Medium blog, pathfinding visualizer, sorting visualizer, notes from when I took CS 61B for my Computer Science Mentors section, and links to other projects. This website was created using Node.js, Bootstrap, Javascript, and the EJS template engine. The JSON files used for the template engine are located at `./json`

The pathfinding visualizer features Dijkstra's, A*, Greedy, BFS, DFS, and bidirectional algorithms and makes use of heuristics to generate different search patterns. The visualizer is interactive, allowing the user to add walls, weighted nodes, and utilize a recursive random maze generator. This project was created in conjunction with my personal portfolio and uses Node.js, Bootstrap, and Javascript. Animations were created with CSS.
- The Javascript file for the pathfinding visualizer is located at `public/js/pathfinder.js`
- The CSS file for the pathfinding visualizer is located at `public/css/pathfinder.css`
- The EJS file for the pathfinding visualizer is located at `views/pathfinder.ejs`

The sorting visualizer currently features six comparison-based algorithms (Selection Sort, Bubble Sort, Heap Sort, Merge Sort, Insertion Sort, and Quick Sort) and two radix sorts (LSD Radix Sort and MSD Radix Sort).
- The Javascript file for the sorting visualizer is located at `public/js/sorter.js`
- The CSS file for the sorting visualizer is located at `public/css/sorter.css`
- The EJS file for the pathfinding visualizer is located at `views/pathfinder.ejs`

The website features 36 lecture notes from CS 61B Fall 2020, when the course was taught by professor Hug.
- The EJS and Markdown files for the 26 lecture notes can be found at `views/partials/cs61b`
- The PDF files for the 36 lecture notes can be found at `public/files/csm_cs61b`