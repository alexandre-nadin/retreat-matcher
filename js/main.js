const BACKSPACE_KEY = 8;
const TOP_AUTHORS = 10

const APP_CONTAINER = d3.select("#app-container")

const AUTHOR_NAMES = ",SYLVAIN M MUKENGE,ANNA GANDAGLIA,DAVIDE LAZZERONI,GABRIELLA DI GIOVINE"
  .split(',')
  // .filter(x => x && x.length)

const AUTHOR_SIMILARITIES = [
  "SYLVAIN M MUKENGE,1.0,0.5067098125585289,0.6479705859654777,0.5057978857342632",
  "ANNA GANDAGLIA,0.5067098125585289,1.0,0.5983803473561269,0.5031240507516532",
  "DAVIDE LAZZERONI,0.6479705859654777,0.5983803473561269,1.0,0.5029147075370226",
  "GABRIELLA DI GIOVINE,0.5057978857342632,0.5031240507516532,0.5029147075370226,1.0"
].map(x => x.split(','))

const AUTHOR_DEGREES = [
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

const DEGREE_PARAMS = {
  'defaultValue': 3,
  'maxValue': 10,
  'nopathValue': 1000,
  'nopathStr': 'No path'
}

const DEGREE_LIST = Array
  .from(Array(10).keys()).map(x => ++x).map(String)
  .concat(['No path'])

const DEGREE_TEXT = DIV_INPUTS
  .append("p")
    .attr("id", "degree-text")
    .attr("class", "")
    .html("Select a degree of separation on the collaboration graph. No path restricts results to authors that cannot be connected on the collaboration graph")

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

const OUTPUT_TEXT_DIV = DIV_OUTPUTS
  .append("div")
    .attr("id", "output-text-div")
    .attr("class", "")

const OUTPUT_TABLE_DIV= DIV_OUTPUTS
  .append("div")
    .attr("id", "output-table-div")
    .attr("class", "")


// ------------------------------------
// Init / Update / General Functions
// ------------------------------------
function update() {
  let params = getInputParameters()
  console.log("params: ", params);
  updateInputs(params)
  updateOutputs(params)
}

function getInputParameters() {
  //
  // Makes an object from all expected user inputs
  //
  return {
    'nameFilter':  NAME_FILTER.property('value'),
    'nameSelection': NAME_SELECTOR.property('value'),
    'degreeSelection': formatDegree(DEGREE_SELECTOR.property('value'))
    // 'degreeSelection': 1000
  }
}

function formatDegree(degree) {
  if (!degree) return DEGREE_PARAMS.defaultValue
  if (degree === DEGREE_PARAMS.nopathStr) return DEGREE_PARAMS.nopathValue
  return Number(degree)
}

function getDegreeString(degree) {
  if (!degree) return ""
  if (degree === DEGREE_PARAMS.nopathValue) degree = DEGREE_PARAMS.nopathStr
  return  " (" + degree + " sep. degrees)"
}

function removeTagFromDom(tag, dom) {
  dom.selectAll(tag).remove()
  return dom
}

// -----------------
// Input Functions
// -----------------
function filterSelectorNames() { update() }
function selectDegree() { update() }
function selectName() { update() }

let nameCurrent = undefined
let degreeCurrent = undefined
let nameCurrentFilter = undefined
function updateInputs(params) {
  updateNameSelector(params)
  updateDegreeSelector(params)
 }

function updateNameSelector(params) {
  if (nameCurrent === undefined) {
    console.log("update name list");
    nameCurrent = params.nameSelection
    updateSelector(NAME_SELECTOR, AUTHOR_NAMES)
  }
}

function updateDegreeSelector(params) {
  if (degreeCurrent === undefined) {
    degreeCurrent = params.degreeSelection
    updateSelector(DEGREE_SELECTOR, DEGREE_LIST)
  }
}


// -----------------
// Output Functions
// -----------------
function updateOutputs(params) {
  updateOutputTextName(params)
  updateTopTable(params)
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

function updateOutputTextName(params) {
  removeTagFromDom('p', OUTPUT_TEXT_DIV)
  if (!params.nameSelection || !params.nameSelection.length) return null
  OUTPUT_TEXT_DIV
    .append('p')
      .html("This is the list of the top "
         + TOP_AUTHORS
         + " authors ranked by similarity of topics in presented abstracts "
         + getDegreeString(params.degreeSelection)
         + "<br/>"
         + "Results for <b>"
         + params.nameSelection
         + "</b>"
     )
}

function updateTopTable(params) {
  //
  // Resets the top table.
  // Gets similarity scores from authors of the specified degree of
  // collaboration.
  //
  removeTagFromDom('table', OUTPUT_TABLE_DIV)
  if (!params.nameSelection) return null
  let authorIdx = AUTHOR_NAMES.indexOf(params.nameSelection)
  let tableData = AUTHOR_DEGREES
    // Filter the degrees here
    .filter(d => d[0] !== params.nameSelection)
    // Map the Similarity Scores
    .map(d => { return {
       'Author': d[0],
       'Score': AUTHOR_SIMILARITIES
         .find(s => s[0] === d[0])[authorIdx],
       'Degree': d[authorIdx]} ; })
    .filter(x => x.Degree == params.degreeSelection)

  if (!tableData.length) return;
  tabulateDataColumnsDomId(
    tableData,
    Object.keys(tableData[0]),
    OUTPUT_TABLE_DIV
  )
}

// -------------------
function updateSelector(selector, list) {
  // Remove options and add new ones from list
  removeTagFromDom('option', selector)
  selector.selectAll('option')
    .data(list)
    .enter()
    .append('option')
    .text(x => x)
  return selector
}

update()
