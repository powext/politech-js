import {State} from './state.js';

var store = new State();

// Default state
store.todos = [];

// Defining reducers. Altering the state in response to actions
store.addTodo = function(movie) {
    this.todos.push(movie);
}

store.removeTodo = function(index) {
    this.todos.splice(index,1);
}

store.removeAll = function() {
    this.todos = [];
}

// Get an element
var todos = document.getElementById("todos");

function addMovieRow(movie) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-key', store.todos.length - 1);

    // Create a function to add table cells
    function addCell(text) {
        var td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
    }

    // Add cells for each movie attribute
    addCell(movie.title);
    addCell(movie.platform);
    addCell(movie.actors); // Assuming actors is an array
    addCell(movie.director);
    addCell(movie.year);

    // Add the poster image
    var imgTd = document.createElement('td');
    var img = document.createElement('img');
    img.setAttribute('src', movie.posterImg);
    img.style.maxWidth = '100px'; // Set a max width for the image
    imgTd.appendChild(img);
    tr.appendChild(imgTd);

    var checkBoxTd = document.createElement('td');
    checkBoxTd.classList.add("flex")
    checkBoxTd.classList.add("flex-row")
    checkBoxTd.classList.add("grow")
    checkBoxTd.classList.add("justify-center")
    checkBoxTd.classList.add("items-center")
    checkBoxTd.classList.add("space-x-2")
    var checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.checked = movie.done;
    checkBox.classList.add("checkbox");
    checkBox.classList.add("checkbox-accent");
    checkBoxTd.appendChild(checkBox);

    var trashIcon = document.createElement('i');
    trashIcon.classList.add("fa-solid");
    trashIcon.classList.add("fa-trash");
    trashIcon.classList.add("fa-lg");
    trashIcon.style.color = "#02d3c0"
    trashIcon.style.cursor = "pointer";
    checkBoxTd.appendChild(trashIcon);

    tr.appendChild(checkBoxTd);

    trashIcon.addEventListener('click', function(event) {
        store.dispatch(
            "removeTodo",
            [Number(tr.getAttribute('data-key'))]
        );
    });
    checkBox.addEventListener('change', function(event) {
        store.dispatch(
            "todoCompletion",
            [event.target.checked, Number(tr.getAttribute('data-key'))]
        );
    });

    this.appendChild(tr);
}

// Subscribe the element to actions
// Callback is called with subscriber elements as context
store.subscribe(todos, "addTodo", function(movie, action, store) {
    document.getElementById("removeAll").style.display = "block";
    addMovieRow.call(this, movie);
});

store.subscribe(todos, "todoCompletion", function(isDone, index, action) {
    this.querySelectorAll('tr')[index].querySelector('input').checked = isDone;
        store.todos[index].done = isDone;
});

store.subscribe(todos, "removeTodo", function(index) {
    this.removeChild(this.querySelectorAll('tr')[index]);

    this.querySelectorAll('tr').forEach(function(element, index) {
        element.setAttribute('data-key', index);
    })
});

store.subscribe(todos, "removeAll", function() {
    this.querySelectorAll('tr').forEach(function(element) {
        this.removeChild(element);
    }.bind(this));
});

store.loadState();
if (store.todos.length === 0) {
    store.dispatch("addTodo", [{
        title: "The Matrix",
        platform: "Netflix",
        actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
        director: "Lana Wachowski, Lilly Wachowski",
        year: 1999,
        posterImg: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg",
        done: true
    }]);
    store.dispatch("addTodo", [{
        title: "The Matrix Reloaded",
        platform: "Netflix",
        actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
        director: "Lana Wachowski, Lilly Wachowski",
        year: 2003,
        posterImg: "https://upload.wikimedia.org/wikipedia/en/b/ba/Poster_-_The_Matrix_Reloaded.jpg",
        done: false
    }]);
    store.dispatch("addTodo", [{
        title: "Titanic",
        platform: "Netflix",
        actors: "Leonardo DiCaprio, Kate Winslet, Billy Zane",
        director: "James Cameron",
        year: 1997,
        posterImg: "https://upload.wikimedia.org/wikipedia/en/1/18/Titanic_%281997_film%29_poster.png",
        done: false
    }]);
}
// store.dispatch("removeTodo", [0]);

document.getElementById("addToDo").addEventListener("submit", function(event) {
    event.preventDefault();
    var title = document.getElementById("title").value;
    var platform = document.getElementById("platform").value;
    var actors = document.getElementById("actors").value;
    var director = document.getElementById("director").value;
    var year = document.getElementById("year").value;
    var posterImg = document.getElementById("poster-img").value;

    store.dispatch("addTodo", [{title, platform, actors, director, year, posterImg, done: false}]);
    document.getElementById("title").value = null;
    document.getElementById("platform").value = null;
    document.getElementById("actors").value = null;
    document.getElementById("director").value = null;
    document.getElementById("year").value = null;
    document.getElementById("poster-img").value = null;
});

document.getElementById("removeAll").addEventListener("click", function() {
    store.dispatch("removeAll");
    // hide button
    document.getElementById("removeAll").style.display = "none";
})

function sortTable(columnIndex) {
    var table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
    table = document.getElementById("table");
    switching = true;
    var direction = "ascending";

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[columnIndex];
            y = rows[i + 1].getElementsByTagName("TD")[columnIndex];

            if (direction === "ascending") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (direction === "descending") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch= true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount === 0 && direction === "ascending") {
                direction = "descending";
                switching = true;
            }
        }
    }
}

function rebuildTable(searchTerm) {
    var tbody = document.getElementById('table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    store.todos.forEach(function(movie, index) {
        if (searchTerm && !movie.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return;
        }

        addMovieRow.call(tbody, movie);
    });
}

document.getElementById('search').addEventListener('input', function(e) {
    rebuildTable(e.target.value);
});

window.sortTable = sortTable;
