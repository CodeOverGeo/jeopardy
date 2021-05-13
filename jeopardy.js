const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const API = `http://www.jservice.io/api/`;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const res = await axios.get(`${API}categories`, { params: { count: 100 } });
  const categoryIdsRes = res.data.map(function (cat) {
    return cat.id;
  });

  return _.sampleSize(categoryIdsRes, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  for (let i = 0; i < catId.length; i++) {
    const res = await axios.get(`${API}category`, { params: { id: catId[i] } });
    const randomClues = _.sampleSize(res.data.clues, NUM_QUESTIONS_PER_CAT);

    const clueArray = randomClues.map(function (clue) {
      return { question: clue.question, answer: clue.answer, showing: null };
    });

    categories.push({ title: res.data.title, clues: [clueArray] });
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
  const $table = $('<table>');
  const $thead = $('<thead>');
  const $trHead = $('<tr>');
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    let titleUpperCase = categories[i].title.toUpperCase();
    $trHead.append($('<th>').text(titleUpperCase));
    // $tr.append($('<th>').text(categories[i].title));
  }
  $thead.append($trHead);
  const $tbody = $('<tbody>');
  for (let currQuest = 0; currQuest < NUM_QUESTIONS_PER_CAT; currQuest++) {
    const $tr = $('<tr>');
    for (let currCat = 0; currCat < NUM_CATEGORIES; currCat++) {
      $tr.append(
        $('<td>')
          .text(`?`)
          .attr({ 'data-cat': currCat, 'data-quest': currQuest })
          .toggleClass('pointer')
      );
    }
    $tbody.append($tr);
  }
  $table.append($thead);
  $table.append($tbody);
  $('body').append($table);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const tdCategory = $(this).attr('data-cat');
  const tdQuest = $(this).attr('data-quest');
  const currCategoryData = categories[tdCategory].clues[0][tdQuest];
  console.log(currCategoryData);
  if (!currCategoryData.showing) {
    currCategoryData.showing = 'question';
    $(this).text(currCategoryData.question);
  } else if (currCategoryData.showing === 'question') {
    currCategoryData.showing = 'answer';
    $(this).text(currCategoryData.answer);
    $(this).toggleClass('pointer');
  } else {
    return;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $('body').empty();
  $('body').append(
    '<div id="loading-bar-spinner" class="spinner"><div class="spinner-icon"></div></div>'
  );
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $('body').empty();
  const $input = $('<button id="reset">Reset Jeopardy</button>');
  $input.appendTo($('body'));
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();
  categories = [];
  await getCategory(await getCategoryIds());
  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

$(function () {
  const $input = $('<button id="start">Start Jeopardy</button>');
  $input.appendTo($('body'));
  $(document).on('click', 'td', handleClick);
  $(document).on('click', 'button', setupAndStart);
});
