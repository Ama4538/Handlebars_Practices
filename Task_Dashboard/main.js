// Variables
let data = null;
let priority_filter = [];
let status_filter = [];

// Fetch Data from Local files
const fetchData = async () => {
    try {
        const res = await fetch("./data.json");
        const ret_data = await res.json();
        if (ret_data) {
            data = ret_data;
            update_data();
            loadCounter(ret_data);
            loadInfo(ret_data);
        }
    } catch (error) {
        console.log("Fetching Data Error: " + error);
    }
}

// Load counter into the dashboard
const loadCounter = (data) => {
    const amount = data ? data.length : 0;
    loadContent({ count: amount }, "total_template", "total_container")
}

// Load high level info
const loadInfo = (data) => {
    const updated_data = [];
    const info_map = new Map();

    // Getting all information from current data
    data.forEach(task => {
        if (info_map.has(task.status)) {
            info_map.set(task.status, info_map.get(task.status) + 1);
        } else {
            info_map.set(task.status, 1);
        }
    });

    info_map.forEach((value, key) => updated_data.push({ type: key, amount: value }))
    loadContent(updated_data, "info_template", "info_container")
}

// Load Task info
const loadTask = (data) => {
    loadContent(data, "task_template", "task_container");
}

// Helper to load content into the template
const loadContent = (data, template_source, container) => {
    const source = document.getElementById(template_source).innerHTML;
    const template = Handlebars.compile(source);
    const compile_source = template(data);
    document.getElementById(container).innerHTML = compile_source;
}

// update information from filters
const update_data = () => {
    let filter_data = data

    if (priority_filter.length > 0) {
        filter_data = filter_data.filter(task => priority_filter.includes(task.priority));
    }

    if (status_filter.length > 0) {
        filter_data = filter_data.filter(task => status_filter.includes(task.status));
    }

    loadTask(filter_data);
}

// Update priority filter
const updatePriority = (button) => {
    if (priority_filter.includes(button.value)) {
        priority_filter = priority_filter.filter(priority => priority != button.value)
        button.dataset.selected = false;
    } else {
        priority_filter.push(button.value)
        button.dataset.selected = true;
    }

    update_data();
}

// Update status filter
const updateStatus = (button) => {
    if (status_filter.includes(button.value)) {
        status_filter = status_filter.filter(status => status != button.value)
        button.dataset.selected = false;
    } else {
        status_filter.push(button.value)
        button.dataset.selected = true;
    }

    update_data();
}

// Helper to capitizes every word in a string
Handlebars.registerHelper("capitalize", (str) => {
    const word_array = str.split(" ");
    const updated_word_array = word_array.map(word =>
        word = word.charAt(0).toUpperCase() + word.slice(1)
    );

    return updated_word_array.join(" ");
});

// Getting filter buttons
const priority_select_buttons = document.getElementsByClassName("priority_select");
const status_select_buttons = document.getElementsByClassName("status_select");

// Adding event listener
Array.from(priority_select_buttons).forEach(button => button.addEventListener("click", () => { updatePriority(button) }))
Array.from(status_select_buttons).forEach(button => button.addEventListener("click", () => { updateStatus(button) }))

// Inital call
fetchData();