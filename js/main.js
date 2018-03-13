// ---------------------------------
// Application Data
// ---------------------------------
const APP_DATA = {
  yearStart: "2018",
  yearEnd: "2018",
  title: () => { return "HSR Retreat Collaborations " + APP_DATA.yearEnd },
  owner: "CTGB lab",
  copyRights: () =>  { return "&copy "
    + APP_DATA.yearStart
    + (APP_DATA.yearStart===APP_DATA.yearEnd
      ? ""
      : "-" + APP_DATA.yearEnd)
    + " by " + APP_DATA.owner },
  titleTag: 'h4'
}

const AUTHOR_DATA = {
  names: {
    list: undefined,
    defaultIndex: 0
  },
  similarities: {
    list: undefined,
    url: 'data/Author_Similarity.csv',
    roundDecimal: 3
  },
  degrees: {
    url: 'data/Path_len.csv',
    list: undefined,
    defaultIndex: 2
  },
  tableOutput: {
    columns: ['Author', 'Similarity'],
    sortAscendingSimilarity: true,
    topNumber: 10
  }
}

const DEGREE_PARAMS = {
  'defaultValue': 3,
  'maxValue': 10,
  'nopathValue': 1000,
  'nopathStr': 'No path'
}

const DEGREE_SELECTOR_LIST = Array
  .from(Array(10).keys()).map(x => ++x).map(String)
  .concat(['No path'])

// ---------------------------------
// DOM Structure
// ---------------------------------
//Set web page title
d3.select('title').html(APP_DATA.title)

const APP_BODY = d3.select('body')

const APP_CONTAINER = APP_BODY
  .append('div')
    .attr('class', 'container')

const APP_HEADER = APP_CONTAINER
  .append('h1')
    .html(APP_DATA.title)


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
      .html(APP_DATA.copyRights)

// ----------------------
// App Inputs
// ----------------------

// Names
const NAME_SECTION = APP_INPUTS
  .append('div')

NAME_SECTION
  .append(APP_DATA.titleTag)
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
  .append(APP_DATA.titleTag)
    .html("Choose the minimum degree of separation on the collaboration graph")
    .append('small')
      .html('<br/>'
          + '"' + DEGREE_PARAMS.nopathStr + '"'
          + ' restricts the results to authors that cannot be connected '
          + ' in the collaboration graph')

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
  updateInputs(getInputParameters())
  updateOutputs(getInputParameters())
}

function getInputParameters() {
  //
  // Makes an object from all expected user inputs
  //
  return {
    'nameFilter':  NAME_FORM_FILTER_INPUT.property('value'),
    'nameSelection': NAME_FORM_SELECTOR_SELECT.property('value'),
    'degreeSelection': formatDegree(DEGREE_FORM_SELECTOR_SELECT.property('value'))
  }
}

function formatDegree(degree) {
  if (!degree) return DEGREE_PARAMS.defaultValue
  if (degree === DEGREE_PARAMS.nopathStr) return DEGREE_PARAMS.nopathValue
  return Number(degree)
}

function getDegreeString(degree) {
  if (!degree) return ""
  return (degree === DEGREE_PARAMS.nopathValue)
    ? " (no sep. degree)"
    : " (>= " + degree + " sep. degrees)"
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
    updateSelector(
      NAME_FORM_SELECTOR_SELECT,
      AUTHOR_DATA.names.list
        .filter(x => x && x.length && x.toLowerCase()
          .includes(params.nameFilter.toLowerCase()))
        .sort(),
      AUTHOR_DATA.names.defaultIndex
    )
  }
}

function updateDegreeSelector(params) {
  if (degreeCurrent === undefined) {
    degreeCurrent = params.degreeSelection
    updateSelector(
      DEGREE_FORM_SELECTOR_SELECT,
      DEGREE_SELECTOR_LIST,
      AUTHOR_DATA.degrees.defaultIndex)
  }
}

function updateSelector(selector, list, defaultIndex=0) {
  // Remove options and add new ones from list
  removeTagFromDom('option', selector)
  selector.selectAll('option')
    .data(list)
    .enter()
    .append('option')
      .attr('selected', (d, i) => i===defaultIndex ? 'selected' : null)
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
  removeTagFromDom(APP_DATA.titleTag, OUTPUT_TEXT_DIV)
  if (!params.nameSelection || !params.nameSelection.length) return null
  OUTPUT_TEXT_DIV
    .append(APP_DATA.titleTag)
      .html(""
        + "Top " + AUTHOR_DATA.tableOutput.topNumber + " results for <b>"
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
  let authorIdx = AUTHOR_DATA.names.list.indexOf(params.nameSelection)
  let tableData = AUTHOR_DATA.degrees.list
    // Filter the degrees here
    .filter(d => d[0] !== params.nameSelection)
    // Map the Similarity Scores
    .map(
      d => { return {
        'Author': d[0],
        'Similarity': AUTHOR_DATA.similarities.list
          .find(s => s[0] == d[0])[authorIdx],
        'Degree': d[authorIdx]
      }
    })
    // Get minimum degrees
    .filter(x => x.Degree >= params.degreeSelection)
    // Ascending sort on similarity
    .sort((first, second) =>
      AUTHOR_DATA.tableOutput.sortAscendingSimilarity
        ? second.Similarity - first.Similarity
        : first.Similarity - second.Similarity
    )
    .slice(0, AUTHOR_DATA.tableOutput.topNumber)

  if (!tableData.length) return;
  tabulateDataColumnsDomId(
    tableData,
    AUTHOR_DATA.tableOutput.columns,
    OUTPUT_TABLE_DIV
  )
}

function tabulateDataColumnsDomId(data, columns, domId) {
  let table = domId
    .append('table')
    .attr('class', 'table table-striped table-bordered table-responsive table-hover')
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
  .defer(d3.text, AUTHOR_DATA.similarities.url)
  .defer(d3.text, AUTHOR_DATA.degrees.url)
  .await(analyze);

function analyze(error, similarities, degrees) {
  if(error) { console.log(error); }
  // Get names, similarities and degrees
  let dataSimilarities = d3.csvParseRows(similarities)
  AUTHOR_DATA.names.list = dataSimilarities[0]
  AUTHOR_DATA.similarities.list = dataSimilarities
    .slice(1)
    .map(x1 => x1.map(x2 =>
      isNaN(x2)
      ? x2
      : parseFloat(x2).toFixed(AUTHOR_DATA.similarities.roundDecimal)))
  AUTHOR_DATA.degrees.list = d3.csvParseRows(degrees).slice(1)
  update()
}
