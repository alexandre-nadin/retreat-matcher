// ---------------------------------
// Application Data
// ---------------------------------
const BACKSPACE_KEY = 8;
const TITLES_TAG = 'h4'
const TOP_AUTHORS = 10

const AUTHOR_DATA = {
  names: undefined,
  similarities: undefined,
  similaritiesUrl: 'data/Author_Similarity.csv',
  degreesUrl: 'data/Path_len.csv',
  degrees: undefined
}

const DEGREE_PARAMS = {
  'defaultValue': 3,
  'maxValue': 10,
  'nopathValue': 1000,
  'nopathStr': 'No path'
}

const DEGREE_LIST = Array
  .from(Array(10).keys()).map(x => ++x).map(String)
  .concat(['No path'])

// ---------------------------------
// DOM Structure
// ---------------------------------
const HEADER_STR = "Collaborators HSR2018"
const APP_OWNER = "Babbonatale"
const FOOTER_STR = "&copy Copy-paste"

const APP_BODY = d3.select('body')
const APP_CONTAINER = APP_BODY
  .append('div')
    .attr('class', 'container')

const APP_HEADER = APP_CONTAINER
  .append('h1')
    .html(HEADER_STR)
    .append('small')
      .html(" by " + APP_OWNER)

const APP_INPUTS = APP_CONTAINER
  .append("div")
    .attr('class', 'jumbotron')

const APP_OUTPUTS = APP_CONTAINER
  .append("div")
    .attr("id", "output-div")

const APP_FOOTER = APP_CONTAINER
  .append('div')
    .attr('class', 'footer')
    .append('p')
      .html('&copy Copy-paste')

// ----------------------
// App Inputs
// ----------------------

// Names
const NAME_SECTION = APP_INPUTS
  .append('div')

NAME_SECTION
  .append(TITLES_TAG)
    .html("Choose an author of interest")

const NAME_FORM = NAME_SECTION
  .append('form')

// Filter Name Form
const NAME_FORM_FILTER = NAME_FORM
  .append('div')
    .attr('class', 'form-group')

const NAME_FORM_FILTER_LABEL = NAME_FORM_FILTER
  .append('label')
    .attr('for', 'name-filter-input')
    .html("Filter names")

const NAME_FORM_FILTER_INPUT = NAME_FORM_FILTER
  .append("input")
    .attr("id", "name-filter-input")
    .attr('class', 'form-control')
    .attr("type", "text")
    .attr("placeholder", "Start writing a name...")
    .on("keyup", filterSelectorNames)

// Select Name From
const NAME_FORM_SELECTOR = NAME_FORM
  .append('div')
    .attr('class', 'form-group')

const NAME_FORM_SELECTOR_LABEL = NAME_FORM_SELECTOR
  .append('label')
    .attr('for', 'name-selector-select')
    .html("Author:")

const NAME_FORM_SELECTOR_SELECT = NAME_FORM_SELECTOR
  .append("select")
    .attr('class', 'form-control')
    .attr('size', '5')
    .on('change', selectName)


// Degrees
const DEGREE_SECTION = APP_INPUTS
  .append('div')

DEGREE_SECTION
  .append(TITLES_TAG)
    .html("Choose the degree of separation on the collaboration graph")
    .append('small')
      .html('<br/>'
          + '"' + DEGREE_PARAMS.nopathStr + '"'
          + ' restricts results to authors that cannot be connected '
          + ' the collaboration graph')

const DEGREE_FORM = DEGREE_SECTION
  .append('form')


// Select Degree Form
const DEGREE_FORM_SELECTOR = DEGREE_FORM
  .append('div')
    .attr('class', 'form-group')

const DEGREE_FORM_SELECTOR_LABEL = DEGREE_FORM_SELECTOR
  .append("label")
    .attr('for', 'degree-selector-select')
    .html("Degrees")

const DEGREE_FORM_SELECTOR_SELECT = DEGREE_FORM_SELECTOR
  .append("select")
    .attr('class', 'form-control')
    .attr('size', '5')
    .on('change', selectDegree)

// ----------------------
// App Outputs
// ----------------------
const OUTPUT_TEXT_DIV = APP_OUTPUTS
  .append("div")

const OUTPUT_TABLE_DIV = APP_OUTPUTS
  .append("div")
    .attr("id", "output-table-div")


// ------------------------------------
// Update / General Functions
// ------------------------------------
function update() {
  let params = getInputParameters()
  updateInputs(params)
  updateOutputs(params)
}

function getInputParameters() {
  //
  // Makes an object from all expected user inputs
  //
  return {
    'nameFilter':  NAME_FORM_FILTER_INPUT.property('value'),
    'nameSelection': NAME_FORM_SELECTOR_SELECT.property('value'),
    'degreeSelection': formatDegree(DEGREE_FORM_SELECTOR_SELECT.property('value'))
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
  if (nameCurrent === undefined || params.nameFilter !== nameCurrentFilter) {
    nameCurrent = params.nameSelection
    nameCurrentFilter = params.nameFilter
    updateSelector(NAME_FORM_SELECTOR_SELECT,
      AUTHOR_DATA.names
        .filter(x => x.toLowerCase()
          .includes(params.nameFilter.toLowerCase()))
        .sort()
    )
  }
}

function updateDegreeSelector(params) {
  if (degreeCurrent === undefined) {
    degreeCurrent = params.degreeSelection
    updateSelector(DEGREE_FORM_SELECTOR_SELECT, DEGREE_LIST)
  }
}

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

// -----------------
// Output Functions
// -----------------
function updateOutputs(params) {
  updateOutputTextName(params)
  updateTopTable(params)
  updateAppOutputs(params)
}

function updateOutputTextName(params) {
  removeTagFromDom(TITLES_TAG, OUTPUT_TEXT_DIV)
  if (!params.nameSelection || !params.nameSelection.length) return null
  OUTPUT_TEXT_DIV
    .append(TITLES_TAG)
      .html(""
        + "Top " + TOP_AUTHORS + " results for <b>"
        + "<b>" + params.nameSelection + "</b>"
        + "<br/><small> authors ranked by similarity of topics in presented abstracts "
        + getDegreeString(params.degreeSelection)
        + "</small><br/>"
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
  let authorIdx = AUTHOR_DATA.names.indexOf(params.nameSelection)
  let tableData = AUTHOR_DATA.degrees
    // Filter the degrees here
    .filter(d => d[0] !== params.nameSelection)
    // Map the Similarity Scores
    .map(d => { return {
       'Author': d[0],
       'Score': AUTHOR_DATA.similarities
         .find(s => s[0] == d[0])[authorIdx],
       'Degree': d[authorIdx]} ; })
    .filter(x => x.Degree == params.degreeSelection)

  if (!tableData.length) return;
  tabulateDataColumnsDomId(
    tableData,
    Object.keys(tableData[0]),
    OUTPUT_TABLE_DIV
  )
}

function tabulateDataColumnsDomId(data, columns, domId) {
  let table = domId
    .append('table')
    .attr('class', 'table table-striped table-bordered')
    .attr('width', '100%')
    .attr('cellspacing', '0')

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

function updateAppOutputs(params) {
  APP_OUTPUTS
    .attr('class',
          (!params.nameSelection || !params.nameSelection.length)
          ? ''
          : 'jumbotron')
}

// ------
// Init
// ------
d3.queue()
  .defer(d3.text, AUTHOR_DATA.similaritiesUrl)
  .defer(d3.text, AUTHOR_DATA.degreesUrl)
  .await(analyze);

function analyze(error, similarities, degrees) {
  if(error) { console.log(error); }
  // Get names, similarities and degrees
  let dataSimilarities = d3.csvParseRows(similarities)
  AUTHOR_DATA.names = dataSimilarities[0]
  AUTHOR_DATA.similarities = dataSimilarities.slice(1)
  AUTHOR_DATA.degrees = d3.csvParseRows(degrees).slice(1)
  update()
}
