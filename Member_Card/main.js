// Get team member data from local JSON
const getData = async () => {
    try {
        const res = await fetch("data.json");
        const retData = await res.json();
        if (retData) {
            data = Object.values(retData);
            loadData(data);
        }
    } catch (err) {
        console.log(err);
    }
}

// Load data into HTML template
const loadData = (data) => {
    if (data.length <= 0) {
        return;
    }

    // Gets the template provided in the HTML
    const source = document.getElementById("team_template").innerHTML;

    // Using the template make it so that it can accept data
    const template = Handlebars.compile(source);

    // Passing data into the template returning the filled in HTML
    const compileHTML = template(data);

    // Update the HTML
    document.getElementById("team_container").innerHTML = compileHTML;
}

// Helper to format image address
Handlebars.registerHelper("formatImg", (image) => {
    return `./images/${image}`;
})

// Inital Call
getData();