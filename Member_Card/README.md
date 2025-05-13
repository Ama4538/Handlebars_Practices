![Default Screenshot](screenshot/Member_Card_SS.png)

# Member Card
Render a list of team members from local JSON into HTML using handlebarJS

## Tools
Handlebar.JS
HTML, CSS, JS

## How
- Main.js initally fetches team data from data.json
- It then compiles into #team_template Handlebar template
- Lastly, injects the rendered HTML into #team_container

## Sample data
```
{
    "name": "Tanya Brooks",
    "role": "Marketing Strategist",
    "statement": "Connecting products to people with precision.",
    "image": "tanya_brooks.jpg"
}
```

## Structure
```
/member-card
│
├── index.html          # Main HTML file with template placeholder
├── style.css           # Card styling
├── main.js             # JS logic: fetch, compile, render
├── data.json           # JSON with team data
├── /images             # Team member headshots
├── /screenshot         # Contains screenshot of the mini-project
```