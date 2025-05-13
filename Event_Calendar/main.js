// Constants
const ALL_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Variables
const current_date = new Date();
let data = [];
let day = current_date.getDay();
let month = current_date.getMonth();
let year = current_date.getFullYear();

const prev_btn = document.getElementById("prev");
const next_btn = document.getElementById("next");

prev_btn.addEventListener("click", () => { updateCalendarRange(prev_btn) });
next_btn.addEventListener("click", () => { updateCalendarRange(next_btn) });

// Event partials display the current event name and data attibute of the event type 
Handlebars.registerPartial('event', '<span class="event" data-type={{type}}>{{title}}</span>');

// Fetch Data from local json file
const fetchData = async () => {
    try {
        const res = await fetch("./data.json");
        const ret_data = await res.json();
        if (ret_data) {
            data = ret_data;
            renderCalendar();
        }
    } catch (error) {
        console.log("Error: Fetching Data");
        return;
    }
}

// Update range of the calendar 
const updateCalendarRange = (current_btn) => {
    if (current_btn == null) {
        console.log("Error: There is a missing button");
        return;
    } else if (current_btn.id == "prev") {
        // Go to pervious year if month is January
        if (month <= 0) {
            year--;
            month = 11;
        } else {
            month--;
        }
    } else if (current_btn.id == "next") {
        // Go to next year if month is December.
        if (month >= 11) {
            year++;
            month = 0;
        } else {
            month++;
        }
    } else {
        // Shouldn't called this!!
        console.log("Error: There is a unknown button");
        return;
    }

    // Re-render calendar with updated information
    renderCalendar();
}

// Render the calendar
const renderCalendar = () => {
    const first_day = new Date(year, month, 1).getDay();
    const last_day = new Date(year, month + 1, 0).getDate();
    const last_month_day = new Date(year, month, 0).getDate();

    // Place holder for all the days displayed
    let days = [];

    // Fill in the first couple of days if the month does not starts on Sunday
    for (let i = first_day; i > 0; i--) {
        days.push({ day: last_month_day - i + 1, active: false, events: [] });
    }

    // Fill in the actual cuurent month days
    for (let i = 0; i < last_day; i++) {
        days.push({ day: i + 1, active: true, events: [] });
    }

    // Fill in the remaining space of the month to ensure square design
    if ((days.length % 7) != 0) {
        const remaining_days = 7 - (days.length % 7);
        for (let i = 0; i < remaining_days; i++) {
            days.push({ day: i + 1, active: false, events: [] });
        }
    }

    days = addEvents(days);

    // Load updated data
    loadData({ range: `${ALL_MONTHS[month]} ${year}` }, "display_template", "month_display_container");
    loadData(days, "calendar_template", "calendar_field_container");
}

// Add events based on give range of days
const addEvents = (emptyDays) => {
    // No need to add events if the event list is empty
    if (data.length <= 0) {
        return emptyDays;
    }

    // Gathering nearby months events
    const current_month = `${ALL_MONTHS[month]} ${year}`;
    const last_month = `${month == 0 ? ALL_MONTHS[11] : ALL_MONTHS[month - 1]} ${month == 0 ? year - 1 : year}`;
    const next_month = `${month == 11 ? ALL_MONTHS[0] : ALL_MONTHS[month + 1]} ${month == 11 ? year + 1 : year}`;

    let current_month_data = null;
    let last_month_data = null;
    let next_month_data = null;

    for (let i = 0; i < data.length; i++) {
        if (data[i].month == last_month) {
            last_month_data = data[i].days;
            continue;
        } else if (data[i].month == current_month) {
            current_month_data = data[i].days;
            continue;
        } else if (data[i].month == next_month) {
            next_month_data = data[i].days;
            break;
        }
    }

    let index = 0;
    //  Filling in the last month's events till current month starts.
    if (last_month_data != null && last_month_data.length > 0 && emptyDays[index].day != 1) {
        let last_month_days_min = Infinity;

        // Finding where last month's days end
        while (emptyDays[index].day != 1) {
            last_month_days_min = Math.min(last_month_days_min, emptyDays[index].day);
            index++;
        }

        for (let i = last_month_data.length - 1; i >= 0; i--) {
            if (last_month_data[i].date < last_month_days_min) {
                break;
            }
            emptyDays[Math.abs(last_month_days_min - last_month_data[i].date)].events = last_month_data[i].events;
        }

    }

    // Filling in the current month's events.
    if (current_month_data != null && current_month_data.length > 0) {
        // Encase we didn't have any last month event, but we have last month's days we haven't traverse.
        if (index == 0 && emptyDays[index].day != 1) {
            while (emptyDays[index].day != 1) {
                index++;
            }
        }

        const start_index_value = index - 1;

        for (let i = 0; i < current_month_data.length; i++) {
            emptyDays[start_index_value + current_month_data[i].date].events = current_month_data[i].events;
        }
    }

    // Filling in the remaining days for next month
    if (next_month_data != null && next_month_data.length > 0) {
        // Getting the index at the start of next month's days
        index++;
        while (index < emptyDays.length && emptyDays[index].day != 1) {
            index++;
        }

        // Checking if there is any remaining days
        if (index != emptyDays.length) {
            let next_month_days_max = emptyDays[index].day;
            // Getting all the remaining days
            while (index < emptyDays.length) {
                next_month_days_max = Math.max(next_month_days_max, emptyDays[index].day)
                index++;
            }

            for (let i = 0; i < next_month_data.length; i++) {
                if (next_month_data[i].date > next_month_days_max) {
                    break;
                }
                emptyDays[(emptyDays.length - 1) - Math.abs(next_month_days_max - next_month_data[i].date)].events = next_month_data[i].events
            }
        }

    }

    return emptyDays;
}

// Load data into handlebar.js template
const loadData = (data, template_name, source_name) => {
    if (data == null) {
        console.log("Error: Data is NULL");
        return;
    }

    const template_source = document.getElementById(template_name);
    const container_source = document.getElementById(source_name);

    if (template_source == null || container_source == null) {
        console.log("Error: Template or Container does not exist");
        return;
    }

    const template = Handlebars.compile(template_source.innerHTML);
    const compile_source = template(data);
    container_source.innerHTML = compile_source;
}

// Inital Calls
fetchData();