// Global
let student_data = {};
const grade_map = new Map();
let filtered_semester = "";

// Semster ordering
const SEMESTER_ORDER = {
    "Spring": 1,
    "Summer": 2,
    "Fall": 3,
}

// Error code
const FETCHING_ERROR = 1;
const FORMAT_ERROR = 2;
const LOADING_ERROR = 3;
const INPUT_ERROR = 4;
const VALUE_ERROR = 5;

// Toggle button to minimizes course display
const minimizes_buttons = document.getElementsByClassName("minimizes_button");
for (const button of minimizes_buttons) {
    button.addEventListener("click", () => {
        const to_be_minimizes = document.getElementById(button.value);
        if (to_be_minimizes == null) {
            errorHandler(VALUE_ERROR);
            return;
        }

        // Inverse the status
        to_be_minimizes.dataset.active = to_be_minimizes.dataset.active == "true" ? "false" : "true";
        button.dataset.open = button.dataset.open == "true" ? "false" : "true";
    })
}

// Add event listener to filter menu after its been added to the DOM
const addEventsToFilter = () => {
    const filter_buttons = document.getElementsByClassName("filter_button");
    for (const button of filter_buttons) {
        button.addEventListener("click", () => {
            const filter_menu = document.getElementById("filter_drop_menu");

            // Reset the filter if its the same button
            if (filtered_semester == button.value) {
                button.dataset.selected = false;
                filtered_semester = "";
            } else {
                filtered_semester = button.value;

                // unselect the other buttons
                const filter_buttons = document.getElementsByClassName("filter_button");
                for (const off_button of filter_buttons) {
                    off_button.dataset.selected = false;
                }

                button.dataset.selected = true;
            }

            // Close menu
            filter_menu.dataset.active = filter_menu.dataset.active == "true" ? "false" : "true";

            // Update filter classes
            updateFilterClasses();
        })
    }
}

// Inital start up
const startUp = () => {
    grade_map.set("A+", 4.0);
    grade_map.set("A", 4.0);
    grade_map.set("A-", 3.7);
    grade_map.set("B+", 3.3);
    grade_map.set("B", 3.0);
    grade_map.set("B-", 2.7);
    grade_map.set("C+", 2.3);
    grade_map.set("C", 2.0);
    grade_map.set("C-", 1.7);
    grade_map.set("D+", 1.3);
    grade_map.set("D", 1.0);
    grade_map.set("F", 0.0);

    fetchData();
}

// Fetch student data from JSON
const fetchData = async () => {
    try {
        const res = await fetch("./data.json");
        const ret_data = await res.json();
        if (ret_data instanceof Object) {
            student_data = ret_data;
            loadStudentInfo();
            loadAllClasses();
            updateFilterClasses();
        } else {
            errorHandler(FORMAT_ERROR);
        }
    } catch (error) {
        errorHandler(FETCHING_ERROR);
        return;
    }
}

// Load the student info into the student_info_template template
const loadStudentInfo = () => {
    student_info = {
        "name": student_data.name,
        "id": student_data.id,
        "status": student_data.status,
        "level": student_data.year,
    }
    loadData(student_info, "student_info_template", "student_info_container");
}

// Load the filter menu with only semster the student has attended
const loadFilterMenu = () => {
    const present_semester = [];
    const formatted_present_semster = [];

    (student_data.classes).forEach(data => {
        if (!present_semester.includes(data.semester)) {
            present_semester.push(data.semester);
        }
    })

    present_semester.sort((a, b) => {
        const [semA, yearA] = a.split(" ");
        const [semB, yearB] = b.split(" ");

        if (yearA !== yearB) {
            return Number.parseInt(yearA) - Number.parseInt(yearB);
        }

        return SEMESTER_ORDER[semA] - SEMESTER_ORDER[semB];
    })

    present_semester.forEach(sem => { formatted_present_semster.push({ semester: sem }) })

    loadData(formatted_present_semster, "filter_menu_template", "filter_drop_menu")
    addEventsToFilter();
}

// Load all the student's class into the all_class_container_template template
const loadAllClasses = () => {
    const all_classes = student_data.classes;
    // Load filter menu here since we only need to call it once
    loadFilterMenu();
    loadData({ pre_text: "Cumulative GPA", classes_grade: getGradeAndCredit(all_classes) }, "all_class_info_template", "all_classes_info_container");
    loadData(all_classes, "all_classes_container_template", "all_classes_container")
}

// Load Data into a given template
// data: A object representing the paramter for the template
// template_source: The id of the template in the HTML
// container_source: The id of where the template content will be placed
const loadData = (data, template_source, container_source) => {
    if (!(data instanceof Object)) {
        errorHandler(FORMAT_ERROR);
        return;
    }

    const template_source_HTML = document.getElementById(template_source);
    const container_source_HTML = document.getElementById(container_source);

    if (template_source_HTML == null || container_source_HTML == null) {
        errorHandler(LOADING_ERROR);
        return;
    }

    const template = Handlebars.compile(template_source_HTML.innerHTML);
    const template_compile = template(data);
    container_source_HTML.innerHTML = template_compile;
}

// Update the filtered classes
const updateFilterClasses = () => {
    let filtered_classes = student_data.classes;
    // Filtering
    if (filtered_semester !== "") {
        filtered_classes = filtered_classes.filter((course) => course.semester == filtered_semester);
    }

    loadData({ filter: filtered_semester == "" ? "All Classes" : filtered_semester }, "filter_menu_name_template", "filter_name")
    loadData({ pre_text: "Term GPA", classes_grade: getGradeAndCredit(filtered_classes) }, "filter_class_info_template", "filtered_classes_info_container");
    loadData(filtered_classes, "filter_classes_container_template", "filtered_classes_container")

    // Have to readd event listerner because we remove after it name change
    const filter_name = document.getElementById("filter_button_name");
    filter_name.addEventListener("click", () => {
        const filter_menu = document.getElementById("filter_drop_menu");
        filter_menu.dataset.active = filter_menu.dataset.active == "true" ? "false" : "true";
    })
}

// Covert percentage grades into letter grade
// grade: the grade that needs to be coverted
const convertToLetterGrade = (grade) => {
    let letter_grade = grade
    if (Number.isInteger(letter_grade)) {
        if (letter_grade >= 97) {
            letter_grade = "A+"
        } else if (letter_grade < 97 && letter_grade >= 93) {
            letter_grade = "A"
        } else if (letter_grade < 93 && letter_grade >= 90) {
            letter_grade = "A-"
        } else if (letter_grade < 90 && letter_grade >= 87) {
            letter_grade = "B+"
        } else if (letter_grade < 87 && letter_grade >= 83) {
            letter_grade = "B"
        } else if (letter_grade < 83 && letter_grade >= 80) {
            letter_grade = "B-"
        } else if (letter_grade < 80 && letter_grade >= 77) {
            letter_grade = "C+"
        } else if (letter_grade < 77 && letter_grade >= 73) {
            letter_grade = "C"
        } else if (letter_grade < 73 && letter_grade >= 70) {
            letter_grade = "C-"
        } else if (letter_grade < 70 && letter_grade >= 67) {
            letter_grade = "D+"
        } else if (letter_grade < 67 && letter_grade >= 65) {
            letter_grade = "D"
        } else {
            letter_grade = "F"
        }
    }

    letter_grade = letter_grade.toUpperCase()

    if (!grade_map.has(letter_grade)) {
        errorHandler(INPUT_ERROR);
        return 0;
    }

    return letter_grade;
}

// Get total credit given a array of class in the format {grade, credit}
// classes: A array containing classes in which total credit will be calculate from
const getTotalCredit = (classes) => {
    let total_credit = 0;

    classes.forEach(course => {
        if (course.credit != null && Number.isInteger(course.credit)) {
            total_credit += course.credit;
        }
    })

    return total_credit
}

// Format input classes into {grade, credit} object
// classes: A array representing filtering classes
const getGradeAndCredit = (classes) => {
    const class_grade_cedit = [];

    classes.forEach(course => {
        class_grade_cedit.push({ grade: convertToLetterGrade(course.grade), credit: course.credit })
    });

    return class_grade_cedit;
}

// Temp way to handle errors by providing log calls
// status: A error code representing the current error
const errorHandler = (status) => {
    // Add more robust handling in the future
    switch (status) {
        case FETCHING_ERROR:
            console.log("Error: Fetching Data");
            break;
        case FORMAT_ERROR:
            console.log("Error: Data is not the correct type");
            break;
        case LOADING_ERROR:
            console.log("Error: Template_source or container_source is invalid");
            break;
        case INPUT_ERROR:
            console.log("Error: Input is invalid");
            break;
        case VALUE_ERROR:
            console.log("Error: Value is invalid");
            break;
        default:
            console.log("Error: Unknown Error");
            break;
    }
}

// Format the class department and class_number into one
// ex. department = cs, class_number = 301 -> CS 301
Handlebars.registerHelper("class", (department, class_number) => {
    return `${department.toUpperCase()} ${class_number}`
})

// Helper to covert all grades into a letter grade
// ex. grade = 97 -> A+
Handlebars.registerHelper("letterGrade", (grade) => {
    return convertToLetterGrade(grade);
})

// Helper to get total credit
// ex. grade = 97 -> A+
Handlebars.registerHelper("totalCredit", (grades) => {
    return getTotalCredit(grades);
})

// Helper to calculate the total GPA
// ex. grades: {97, 3}, {100, 3} => 4.0
Handlebars.registerHelper("calculate", (grades) => {
    let totat_points = 0;
    let total_credit = getTotalCredit(grades);

    grades.forEach(grade => {
        const converted_grade = grade_map.get(grade.grade)
        totat_points += converted_grade * grade.credit;
    })

    return (totat_points / total_credit).toFixed(2);
})

// Class partials use to list class information
Handlebars.registerPartial("Class", `
    <li>
        <span>{{class department classNumber}}</span>
        <span>{{professor}}</span>
        <span>{{letterGrade grade}}</span>
        <span>{{credit}}</span> 
        <span>{{semester}}</span>
    </li>
`);

// Class partials use to list class information
Handlebars.registerPartial("ClassInfo", `
    <span class="sub_text">{{text}}: {{calculate grades}}</span>
    <span class="sub_text">Total Credit: {{totalCredit grades}}</span>
`);


// Inital Call
startUp();