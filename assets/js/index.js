(function ($) {
  // header date
  $('#currentDay').text(moment().format('LL'));
  //* time - do I want it?
  let updateTime = () => {
    $('#currentTime').text(moment().format('HH:mm'));
    setInterval(updateTime, 60000);
  };
  setTimeout(updateTime, 0);

  //
  let blocks = [];
  let hours = {
    start: 02,
    end: 23,
  };
  if (localStorage.getItem('hours')) {
    hours = JSON.parse(localStorage.getItem('hours'));
  }
  // get user selected hours
  const storedHours = JSON.parse(localStorage.getItem('hours'));
  let hoursStart = $('<input type="text" id="user-hours-start" value="2"/>');
  let hoursEnd = $('<input type="text" id="user-hours-end" value="23"/>');
  hoursStart.val(storedHours.start);
  hoursEnd.val(storedHours.end);
  let submitHours = $(
    '<button id="submitHours" class="btn"><i class="fa-solid fa-check"></i></button>'
  );
  $('.time-wrapper').after(`<div class="hours-input"></div>`);
  $('.hours-input').append([hoursStart, hoursEnd, submitHours]);

  submitHours.on('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    blocks = [];
    $('#container').empty();
    hours.start = moment(hoursStart.val(), 'hh').format('HH');
    hours.end = moment(hoursEnd.val(), 'hh').format('HH');
    localStorage.setItem('hours', JSON.stringify(hours));
    renderBlocks();
    colorise();
  });

  let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
  function renderBlocks() {
    // save all button
    $('#container').append(
      `<div class="row w-100 d-flex justify-content-end align-items-center">
            <button id="ultimate-save" class="btn text-uppercase">Save all</button>
          </div>`
    );
    for (let i = hours.start; i <= hours.end; i++) {
      blocks.push(moment().hour(i).format('h A'));
    }
    let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
    let today = moment().format('LL');
    // render blocks
    for (let i = 0; i < blocks.length; i++) {
      $('#container').append(
        `<div class="row w-100" id="row-${i}">
                  <div class="hour col-2 d-flex justify-content-left align-items-center">
                      <span id="block-time" class="" data-index="${i}">${
          blocks[i]
        }</span>
                  </div>
                  <div class="col-md-9 col-8 d-flex w-100 p-0">
                      <input id="daily-task" class="w-100 px-2" value="${
                        taskData[i] && taskData[i].date === today
                          ? taskData[i].task
                          : ''
                      }" data-index="${i}"/>
                  </div>
                  <div class="col-md-1 col-2 d-flex p-0 w-100 h-100">
                      <button id="save-button" class="btn save-button d-flex align-items-center justify-content-center w-100 h-100" data-index="${i}">
                          <i class="fa-solid fa-plus"></i>
                      </button>
                  </div>
              </div>`
      );
      // }
      // event listener for save
      // moved in to see if it will work instead of creating listener separately
      // *event delegation*

      $('#container').on('click', '#save-button', saveTask);
      $('#container').on('keyup', 'input[id="daily-task"]', function (e) {
        // on pressing enter from input, call function passing 'this' arguments
        if (e.which === 13) {
          e.stopPropagation();
          e.preventDefault();
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
          saveTask.call(this);
        }
      });
    }
  }
  renderBlocks();

  // event listener callback
  function saveTask() {
    let icon = $(this).children('i');
    // animate icon
    icon.removeClass('fa-plus').addClass('fa-check saved');
    let i = $(this).data('index');
    let task = $(`input[data-index=${i}]`).val();

    saveToLocal(i, task);
    // return icon to default
    setTimeout(() => {
      icon.removeClass('fa-check saved').addClass('fa-plus');
    }, 1000);
  }

  $('main').on('click', '#ultimate-save', function () {
    let saveAllBtn = $('#ultimate-save');
    saveAllBtn.prop('disabled', true).text('Wait...');
    $(`input[id='daily-task']`).each(function () {
      let i = $(this).data('index');
      let task = $(this).val();
      saveToLocal(i, task);
    });
    setTimeout(() => {
      saveAllBtn.text('Saved!');
      setTimeout(() => {
        saveAllBtn.prop('disabled', false).text('Save all');
      }, 250);
    }, 500);
  });

  // save to Local for event listeners
  function saveToLocal(i, task) {
    let date = moment().format('LL');

    if (!taskData[i]) {
      taskData[i] = {
        blockTime: blocks[i],
        task: task,
        date: date,
      };
    } else {
      taskData[i].blockTime = blocks[i];
      taskData[i].task = task;
      taskData[i].date = date;
    }
    localStorage.setItem('taskData', JSON.stringify(taskData));
  }

  // let testTime = $(
  //   `<button id="testTime" class="btn">Set time to 1:40PM to test</button>`
  // );
  // $('.time-wrapper').append(testTime);

  // testing testing who is who
  // TODO: Add a button for test date - randomise it within the range - for testing outside of business hours
  // *This works, apart from input field is not getting 'past' class removed
  // nah it doesn't work anymore fuck this shit.

  // colorise
  // let testing = false;
  // testTime.on('click', () => {
  // testing = true;
  // colorise();
  // });

  function colorise() {
    // let nowTime;
    // if (testing) {
    //   nowTime = moment('13:40', 'HH:mm');
    // } else {
    //   nowTime = moment();
    // }
    let now = moment().format('HH');
    // get current time

    $('.row').each(function () {
      // convert block time string to a moment object
      let blockTime = moment($(this).find('#block-time').text(), 'hh A').format(
        'HH'
      );
      let row = $(this).children();
      row.removeClass(['past', 'present', 'future']);
      if (blockTime < now) {
        // moment.js functions are not working properly??
        // if (moment(blockTime).isBefore(now)) {
        // row.removeClass(['present', 'future'])
        row.addClass('past');
      } else if (blockTime === now) {
        // else if (moment(blockTime).isSame(now)) {
        // row.removeClass(['past', 'future'])
        row.addClass('present');
      } else {
        // row.removeClass(['past', 'present'])
        row.addClass('future');
      }
    });
    // setInterval(() => colorise(), 60000);
  }
  setTimeout(() => colorise(), 0);

  // main height
  let height = () => {
    $('#container').css({
      'min-height': `calc( 100vh - ${
        $('header').outerHeight() + $('footer').outerHeight()
      }px )`,
    });
  };
  height();

  window.onresize = function () {
    height();
  };

  // random background for header text
  let src = [];
  for (i = 0; i < 4; i++) {
    src.push(`url('./assets/images/bg${i}.jpg`);
  }
  let bg = src[Math.floor(Math.random() * src.length)];
  $('.jumbotron h1').css('background-image', bg);
  $('footer').css('background-image', bg);
})(jQuery);
