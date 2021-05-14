//set values that can be manipulated in future versions
//hard code api call to manipulate in case of update

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
// add API catch clause, load reset jeopardy button if API is down
// pass null into getCaterogy to prevent dowble API call

async function getCategoryIds() {
  try {
    const res = await axios.get(`${API}categories`, { params: { count: 100 } });
    const categoryIdsRes = res.data.map(function (cat) {
      return cat.id;
    });
    //use lodash to return a sample from the 100 categories returned from server
    return _.sampleSize(categoryIdsRes, NUM_CATEGORIES);
  } catch {
    alert('Sorry, API down');
    hideLoadingView();
    return null;
  }
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
  if (!catId) {
    return;
  } else {
    try {
      for (let i = 0; i < catId.length; i++) {
        const res = await axios.get(`${API}category`, {
          params: { id: catId[i] },
        });
        const randomClues = _.sampleSize(res.data.clues, NUM_QUESTIONS_PER_CAT);
        //use lodash to sample clues from particar category
        const clueArray = randomClues.map(function (clue) {
          return {
            question: clue.question,
            answer: clue.answer,
            showing: null,
          };
        });

        categories.push({ title: res.data.title, clues: [clueArray] });
      }
    } catch {
      alert('Sorry, API down');
      hideLoadingView();
    }
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
  //add category titles to the header row - flip all to uppercase
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    let titleUpperCase = categories[i].title.toUpperCase();
    $trHead.append($('<th>').text(titleUpperCase));
    // $tr.append($('<th>').text(categories[i].title));
  }
  $thead.append($trHead);
  const $tbody = $('<tbody>');
  //add data attr to keep track of what question/answer combo
  //in the array matches the DOM
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

  /* found on codepen.io: https://codepen.io/cbhoweth/pen/GJYWye */

  $('body').append(
    '<div id="loading-bar-spinner" class="spinner"><div class="spinner-icon"></div></div>'
  );
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $('body').empty();
  const $input = $('<button id="start">Reset Jeopardy</button>');
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
  //still can't figure out what to do to prevent this from being an
  //async/await function.
  await getCategory(await getCategoryIds());
  hideLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

// can use button id in the future to control click if more
//form functionality is added in a later version
$(function () {
  const $input = $('<button id="start">Start Jeopardy</button>');
  $input.appendTo($('body'));
  $(document).on('click', 'td', handleClick);
  $(document).on('click', 'button', setupAndStart);
});
