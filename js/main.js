const BACKSPACE_KEY = 8;

const APP_CONTAINER = d3.select("#app-container")

const AUTHOR_NAMES = ",SYLVAIN M MUKENGE,ANNA GANDAGLIA,DAVIDE LAZZERONI,GABRIELLA DI GIOVINE"
  .split(',')
  // .filter(x => x && x.length)

const AUTHOR_SIMILARITIES = [
  "SYLVAIN M MUKENGE,0,4,6,1000",
  "ANNA GANDAGLIA,4,0,6,1000",
  "DAVIDE LAZZERONI,6,6,0,1000",
  "GABRIELLA DI GIOVINE,1000,1000,1000,0"
].map(x => x.split(','))

const NAME_FILTER = APP_CONTAINER
  .append("input")
    .attr("id", "coordinates")
    .attr("type", "text")
    .attr("placeholder", "Start writing a name...")
    .on("keyup", updateNameFilter)

// ----------------------
// Input Div
// ----------------------
const DIV_INPUTS = APP_CONTAINER
  .append("div")
    .attr("id", "input-div")
    .attr("class", "")

const NAME_TEXT = DIV_INPUTS
  .append("p")
    .attr("id", "name-text")
    .attr("class", "")
    .text("Choose an author from the list (hint: you can use the text field to search faster)")

const NAME_SELECTOR = DIV_INPUTS
  .append("select")
    .attr('id', 'name-selector')
    .attr('class', 'select')
    .attr('size', '5')
    .on('change', selectName)
resetSelectors(NAME_SELECTOR, AUTHOR_NAMES)

const DEGREE_TEXT = DIV_INPUTS
  .append("p")
    .attr("id", "degree-text")
    .attr("class", "")
    .html("Select a degree of separation on the collaboration graph. No path restricts results to authors that cannot be connected on the collaboration graph")

const DEGREE_MAX = 10
const DEGREE_LIST = Array
  .from(Array(10).keys()).map(x => ++x).map(String)
  .concat(['No path'])

const DEGREE_SELECTOR = DIV_INPUTS
  .append("select")
    .attr('id', 'name-selector')
    .attr('class', 'select')
    .attr('size', '5')
    .on('change', selectDegree)
resetSelectors(DEGREE_SELECTOR, DEGREE_LIST)

// ----------------------
// Output Div
// ----------------------
const DIV_OUTPUTS = APP_CONTAINER
  .append("div")
    .attr("id", "output-div")
    .attr("class", "")

const OUTPUT_TEXT = DIV_OUTPUTS
  .append("p")
    .attr("id", "output-text")
    .attr("class", "")
    .html("This is the list of the top 10 authors ranked by similarity of topics in presented abstracts"
         + "<br/>"
         + "Results for ADELE ULISSE"
    )

const OUTPUT_TABLE_DIV= DIV_OUTPUTS
  .append("div")
    .attr("id", "output-table-div")
    .attr("class", "")

// -----------------
// Functions
// -----------------
function tabulateDataColumnsDomId(data, columns, domId) {
  let table = domId.append('table')
  let thead = table.append('thead')
  let	tbody = table.append('tbody');

  // append the header row
  thead.append('tr')
    .selectAll('th')
    .data(columns).enter()
    .append('th')
      .text(c => c);

  // create a row for each object in the data
  let rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr');

  // create a cell in each row for each column
  let cells = rows.selectAll('td')
    .data(r => {
      return columns.map(c => {
        return {column: c, value: r[c]};
      });
    })
    .enter()
    .append('td')
      .text(x => x.value);

  return table;
}

let tableTopSimilScoreData = function(name) {
  let author_idx = AUTHOR_NAMES.indexOf(name)
  return AUTHOR_SIMILARITIES.map(x => {
        return {'author': x[0], 'score': x[author_idx]}
      })
}

tabulateDataColumnsDomId(
  tableTopSimilScoreData("ANNA GANDAGLIA"),
  ['author', 'score'],
  OUTPUT_TABLE_DIV
)

// -------------------
function selectDegree() {
  // console.log("Selected data: ", DEGREE_SELECTOR.options[DEGREE_SELECTOR.selectedIndex]);
}

function selectName(data) {
  console.log("Selected data: ", data);
}

function resetSelectors(selector, list) {
  // Remove options and add new ones from list
  removeSelectorOptions(selector)
  selector.selectAll('option')
    .data(list)
    .enter()
    .append('option')
    .text(x => x)
  return selector
}

function removeSelectorOptions(selector) {
  return removeTagFromDom('option', selector)
  // selector.selectAll('option').remove()
  // return selector
}

function removeTagFromDom(tag, dom) {
  dom.selectAll(tag).remove()
  return dom
}

function updateNameFilter() {
  console.log("[Update Filter] ", NAME_FILTER.property('value'));
  console.log("");
}

function initBody() {
  console.log("[initBody]");
  console.log("app-container: ");
}
