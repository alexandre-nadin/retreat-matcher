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
    .on("keyup", filterSelectorNames)

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

function updateOutputTextName(name) {
  OUTPUT_TEXT.html("This is the list of the top 10 authors ranked by similarity of topics in presented abstracts"
       + "<br/>"
       + "Results for <b>"
       + name
       + "</b>"
     )
}

const OUTPUT_TABLE_DIV= DIV_OUTPUTS
  .append("div")
    .attr("id", "output-table-div")
    .attr("class", "")


// -----------------
// Functions
// -----------------
function init() {
  resetSelector(NAME_SELECTOR, AUTHOR_NAMES)
  resetSelector(DEGREE_SELECTOR, DEGREE_LIST)
  update()
}

function update() {
  let nameFilter = NAME_FILTER.property('value')
  let nameSelection = NAME_SELECTOR.property('value')
  let degreeSelected = DEGREE_SELECTOR.property('value');
  [  'nameFilter', 'nameSelection', 'degreeSelected' ]
    .forEach(x => { if (eval(x) && eval(x).length) console.log(`%s: %s`, x, eval(x)); })

  updateTopTable(nameSelection)
}

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

let updateTopTable = function(name) {
  removeTagFromDom('table', OUTPUT_TABLE_DIV)
  if (!name) return null
  let author_idx = AUTHOR_NAMES.indexOf(name)
  let similarities = AUTHOR_SIMILARITIES.map(x => {
        return {'author': x[0], 'score': x[author_idx]}
      })
  tabulateDataColumnsDomId(
    similarities,
    Object.keys(similarities[0]),
    OUTPUT_TABLE_DIV
  )
}

// -------------------
function selectDegree() { update() }
function selectName() { update() }

function resetSelector(selector, list) {
  // Remove options and add new ones from list
  removeTagFromDom('option', selector)
  selector.selectAll('option')
    .data(list)
    .enter()
    .append('option')
    .text(x => x)
  return selector
}

function removeTagFromDom(tag, dom) {
  dom.selectAll(tag).remove()
  return dom
}

function filterSelectorNames() { update() }

function initBody() {
  console.log("[initBody]");
  console.log("app-container: ");
}

init()
