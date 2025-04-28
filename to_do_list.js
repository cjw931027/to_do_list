const text = document.querySelector(".text");
const list = document.querySelector(".list");
const button = document.querySelector(".button");

let total = 0,remain = 0,complete = 0;
let ok = false;


function update_task_count() {
    //display the number on the page
    document.querySelector(".total").textContent = total;
    document.querySelector(".remain").textContent = remain;
    document.querySelector(".complete").textContent = complete;
    
     //save updated data to localStorage
     localStorage.setItem('total', total);
     localStorage.setItem('remain', remain);
     localStorage.setItem('complete', complete);
     localStorage.setItem('tasks', JSON.stringify(tasks));  //store tasks array
}

//create a task object
function create_task(taskText, isCompleted) {
    return {
        text: taskText,
        completed: isCompleted
    };
}

//load tasks from localStorage
function loadTasks() {
    const storedTotal = localStorage.getItem('total');
    const storedRemain = localStorage.getItem('remain');
    const storedComplete = localStorage.getItem('complete');
    const storedTasks = localStorage.getItem('tasks');

    if (storedTotal && storedRemain && storedComplete && storedTasks) {
        total = parseInt(storedTotal);
        remain = parseInt(storedRemain);
        complete = parseInt(storedComplete);
        tasks = JSON.parse(storedTasks);

        update_task_count();
        display_tasks();
    }
}

//display tasks from the loaded data
function display_tasks() {
    //equal to for(auto task : tasks), upload everything int the tasks
    tasks.forEach(task => {
        const task_element = document.createElement("li");
        task_element.innerHTML = `
            <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}>
            <label>${task.text}</label>
            <button class="trashcan">🗑️</button>
        `;

        //handle task completion toggle
        const checkbox = task_element.querySelector(".checkbox");
        
        //update to the complete mode
        if (task.completed) {
            task_element.style.textDecoration = "line-through";
            task_element.style.color = "#999";
        }

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            if (checkbox.checked) {
                complete++;
                remain--;
                task_element.style.textDecoration = "line-through";
                task_element.style.color = "#999";
            } else {
                complete--;
                remain++;
                task_element.style.textDecoration = "none";
                task_element.style.color = "";
            }
            update_task_count();
        });

        // Handle task removal
        const trashcan = task_element.querySelector(".trashcan");
        trashcan.addEventListener("click", function() {
            trashcan.disabled = true;
            total--;
            if (checkbox.checked) {
                complete--;
            } else {
                remain--;
            }
            task_element.classList.add("fade-out");

            task_element.addEventListener("animationend", function () {
                tasks = tasks.filter(t => t.text !== task.text); // Remove task from tasks array
                update_task_count();
                task_element.remove();
            });
        });

        list.append(task_element);
    });
}

//store tasks in an array
let tasks = [];

function new_task(){
    if(text.value == "") return;

    total++;
    remain++;

    // Create a new task object
    const newTask = create_task(text.value, false);
    tasks.push(newTask);

    // Create a task element
    const task_element = document.createElement("li");
    task_element.innerHTML = `
        <input type="checkbox" class="checkbox">
        <label>${text.value}</label>
        <button class="trashcan">🗑️</button>
    `;

    // Fade-in animation
    task_element.classList.add("fade-in");

    // Handle checkbox change
    const checkbox = task_element.querySelector(".checkbox");
    checkbox.addEventListener("change", function () {
        newTask.completed = checkbox.checked;
        if (checkbox.checked) {
            complete++;
            remain--;
            task_element.style.textDecoration = "line-through";
            task_element.style.color = "#999";
        } else {
            complete--;
            remain++;
            task_element.style.textDecoration = "none";
            task_element.style.color = "";
        }
        update_task_count();
    });

    // Handle task removal
    const trashcan = task_element.querySelector(".trashcan");
    trashcan.addEventListener("click", function () {
        trashcan.disabled = true;
        total--;
        if (checkbox.checked) {
            complete--;
        } else {
            remain--;
        }
        task_element.classList.add("fade-out");

        task_element.addEventListener("animationend", function () {
            tasks = tasks.filter(t => t.text !== newTask.text); // Remove task from tasks array
            update_task_count();
            task_element.remove();
        });
    });

    list.append(task_element);

    text.value = "";
    update_task_count();
}

button.addEventListener("click",new_task);

text.addEventListener("keyup", function(e){
    if(e.key == "Enter"){
        console.log(text.value);
        new_task();
    }
});

const reset = document.querySelector(".reset");
reset.addEventListener("click", function() {
    if (confirm("確定要清除所有清單嗎？這個動作無法復原！")) {
        localStorage.clear();
        location.reload();
    }
});

// Load tasks when the page loads
document.addEventListener("DOMContentLoaded", loadTasks);