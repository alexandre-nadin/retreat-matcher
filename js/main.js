const BACKSPACE_KEY = 8;

const APP_CONTAINER = d3.select("#app-container")

let names = [ "Alexandre Nadin", "BouBiNo Ndao", "Porcama Donna", "Thor Fisting",
 "Van Lensing", "Charmander Charizard", "Sudicio Judah"
]

const NAME_FILTER = APP_CONTAINER.append("input")
  .attr("id", "coordinates")
  .attr("type", "text")
  .attr("placeholder", "Start writing a name...")
  .on("keyup", updateFilter)

APP_CONTAINER.append("div")
  .attr("id", "div-inputs")
  .attr("class", "")
  .append("p")
    .attr("id", "text-name")
    .attr("class", "")
    .text("Choose an author from the list (hint: you can use the text field to search faster)")

const NAME_SELECTOR = APP_CONTAINER.append("select")
  .attr('id', 'selector-name')
  .attr('class', 'select')
  .attr('size', '5')
  .on('change', selectName)

function selectName(data) {
  console.log("Selected data: ", data);
}

function updateNameSelection() {
  let options = NAME_SELECTOR.selectAll('option')
  // Remove options
  options.remove()

  // Add options
  names.forEach(n => NAME_SELECTOR
     .append('option')
       .text(n))
}
updateNameSelection()

function fetchIssues() {
  console.log("[fetchIssues] ");
  let txt = document.getElementById("text-name-selection")
  console.log("  txt: ", txt);
}

function updateFilter() {
  console.log("[Update Filter] ", NAME_FILTER.property('value'));
  console.log("");
}

function initBody() {
  console.log("[initBody]");
  console.log("app-container: ");
}
