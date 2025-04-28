const text = document.querySelector(".text");
const list = document.querySelector(".list");
const button = document.querySelector(".button");
const reset = document.querySelector(".reset");

let total = 0, remain = 0, complete = 0;
let tasks = [];

function update_task_count() {
    //display the number on the page
    document.querySelector(".total").textContent = total;
    document.querySelector(".remain").textContent = remain;
    document.querySelector(".complete").textContent = complete;

    //save updated data to localStorage
    localStorage.setItem('total', total);
    localStorage.setItem('remain', remain);
    localStorage.setItem('complete', complete);
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
        const task_element = create_task_element(task);
        list.append(task_element);
    });
}

function create_task_element(task) {
    const task_element = document.createElement("li");
    task_element.classList.add("fade-in");
    task_element.innerHTML = `
        <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}>
        <label>${task.text}</label>
        <div class="action-buttons">
            <button class="move-up">🔼</button>
            <button class="move-down">🔽</button>
            <button class="modify">✏️</button>
            <button class="trashcan">🗑️</button>
        </div>
    `;
    bind_task_event(task_element, task);
    return task_element;
}

function bind_task_event(task_element, task_object) {
    const checkbox = task_element.querySelector(".checkbox");
    const modify = task_element.querySelector(".modify");
    const trashcan = task_element.querySelector(".trashcan");
    const moveUp = task_element.querySelector(".move-up");
    const moveDown = task_element.querySelector(".move-down");

    if (task_object.completed) {
        task_element.style.textDecoration = "line-through";
        task_element.style.color = "#999";
        checkbox.checked = true;
    }

    checkbox.addEventListener("change", function () {
        task_object.completed = checkbox.checked;
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

    modify.addEventListener("click", function() {
        const old_text = task_element.querySelector("label").innerText;

        task_element.innerHTML = `
            <div class="modify_input">
                <input class="modify_text" value="${old_text}">
                <button class="modify_ok_button">✔️</button>
            </div>
        `;

        const modify_ok_button = task_element.querySelector(".modify_ok_button");
        const modify_input = task_element.querySelector(".modify_text");

        // 完成修改：按✔️
        modify_ok_button.addEventListener("click", function(){
            const newText = modify_input.value;
            task_object.text = newText;
            task_element.replaceWith(create_task_element(task_object));
            update_task_count();
        });

        // 完成修改：按Enter
        modify_input.addEventListener("keyup", function(e){
            if (e.key === "Enter") {
                modify_ok_button.click();
            }
        });
    });

    trashcan.addEventListener("click", function () {
        trashcan.disabled = true;
        total--;
        if (checkbox.checked) {
            complete--;
        } else {
            remain--;
        }
        update_task_count();
        task_element.classList.add("fade-out");
        task_element.addEventListener("animationend", function () {
            tasks = tasks.filter(t => t !== task_object);
            task_element.remove();
            update_task_count();
        }, { once: true });
    });

    moveUp.addEventListener("click", function () {
        const previous = task_element.previousElementSibling;
        if (previous) {
            list.insertBefore(task_element, previous);
            const currentIndex = tasks.indexOf(task_object);
            const previousIndex = currentIndex - 1;
            if (previousIndex >= 0) {
                [tasks[currentIndex], tasks[previousIndex]] = [tasks[previousIndex], tasks[currentIndex]];
                update_task_count();
            }
        }
    });

    moveDown.addEventListener("click", function () {
        const next = task_element.nextElementSibling;
        if (next) {
            list.insertBefore(next, task_element);
            const currentIndex = tasks.indexOf(task_object);
            const nextIndex = currentIndex + 1;
            if (nextIndex < tasks.length) {
                [tasks[currentIndex], tasks[nextIndex]] = [tasks[nextIndex], tasks[currentIndex]];
                update_task_count();
            }
        }
    });
}

function new_task(){
    if (text.value.trim() === "") return;

    total++;
    remain++;

    const newTask = create_task(text.value.trim(), false);
    tasks.push(newTask);

    const task_element = create_task_element(newTask);
    list.append(task_element);

    text.value = "";
    update_task_count();
}

button.addEventListener("click", new_task);

text.addEventListener("keyup", function(e){
    if (e.key === "Enter") {
        new_task();
    }
});

reset.addEventListener("click", function() {
    if (confirm("確定要清除所有清單嗎？這個動作無法復原！")) {
        localStorage.clear();
        location.reload();
    }
});

document.addEventListener("DOMContentLoaded", loadTasks);
