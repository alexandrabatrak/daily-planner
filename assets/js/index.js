(function ($) {
  // header date
  $('#currentDay').text(moment().format('LL'));
  //* time - do I want it?
  let updateTime = () => {
    $('#currentTime').text(moment().format('HH:mm'));
    // update every hour
    setInterval(updateTime, 60000);
  };
  // call it out without any interval the first time
  setTimeout(updateTime, 0);

  //
  let blocks = [];
  let hours = {
    start: 02,
    end: 23,
  };
  // update object with locally stored value if there is one
  if (localStorage.getItem('hours')) {
    hours = JSON.parse(localStorage.getItem('hours'));
  }
  // get hours grabbing UI ready
  let hoursStart = $(
    '<input type="text" id="user-hours-start" value="2" max="2" required/>'
  );
  let hoursEnd = $(
    '<input type="text" id="user-hours-end" value="23" max="2" required/>'
  );
  hoursStart.val(hours.start);
  hoursEnd.val(hours.end);

  [hoursStart, hoursEnd].forEach((input) => {
    input.on('input', function () {
      let value = $(this).val();
      if (value.length === 2) {
        let n = parseInt(
          value.toLocaleString('en-GB', {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })
        );
        $(this).val(n);
      }
    });
    return input;
  });

  let submitHours = $(
    `<button id="submitHours" class="btn rounded-0">Update</button>`
  );
  $('form').append([hoursStart, `<span>-</span>`, hoursEnd, submitHours]);

  // clickety click magic to update hours project
  submitHours.on('click', (e) => {
    // prevent page refresh
    e.preventDefault();
    // validate hours input
    let start = parseInt(hoursStart.val());
    let end = parseInt(hoursEnd.val());
    if (
      !$.isNumeric(start) ||
      start < 0 ||
      start > 23 ||
      !$.isNumeric(end) ||
      end < 0 ||
      end > 23 ||
      end < start
    ) {
      // throw error
      if (!$('#input-error').length) {
        $('.hours-input').append(
          `<p id="input-error" class="input-error pt-3"></p>`
        );
      }
      $('#input-error').text(
        `Please, ${
          end < start
            ? 'make sure end hour is later than start'
            : 'choose appropriate hours from 0 to 23'
        }.`
      );
    } else {
      // remove error
      $('#input-error').remove();
      // do the dance
      e.preventDefault();
      e.stopPropagation();
      blocks = [];
      hours.start = moment(hoursStart.val(), 'hh').format('HH');
      hours.end = moment(hoursEnd.val(), 'hh').format('HH');
      $('#container').empty();
      localStorage.setItem('hours', JSON.stringify(hours));
      renderBlocks();
      colorise();
    }
  });

  // get stored tasks
  let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
  // render blocks
  function renderBlocks() {
    for (let i = hours.start; i <= hours.end; i++) {
      blocks.push(moment().hour(i).format('H:00'));
    }
    // let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
    let today = moment().format('LL');
    for (let i = 0; i < blocks.length; i++) {
      $('#container').append(
        `<div class="row" id="row-${i}">
            <div class="hour col-2 d-flex justify-content-left align-items-center h-100">
              <span id="block-time" data-index="${i}">
                ${blocks[i]}
              </span>
            </div>
            <div class="col-7 col-md-8 d-flex w-100 h-100 p-0">
              <textarea id="daily-task" class="w-100 h-100" data-index="${i}">${
          taskData[i] && taskData[i].date === today ? taskData[i].task : ''
        }</textarea>
            </div>
            <div class="buttons-wrapper col-3 col-md-2 d-flex p-0 w-100 h-100">
              <button id="save-button" class="btn save-button d-flex align-items-center justify-content-center w-100 h-100" data-index="${i}">
                <i class="fa-solid fa-plus"></i>
              </button>
              <button id="clear-button" class="btn clear-button d-flex align-items-center justify-content-center w-100 h-100" data-index="${i}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
        </div>`
      );
      // event listener for save
      // moved in to see if it will work instead of creating listener separately
      // *event delegation*
      $('#container').on('click', '#save-button', saveTask);
      $('#container').on('keyup', 'textarea[id="daily-task"]', function (e) {
        // on pressing enter from input, call function passing 'this' arguments
        if (e.which === 13 && !e.shiftKey) {
          e.stopPropagation();
          e.preventDefault();
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
          $(this).blur();
          saveTask.call(this);
        }
      });
      // TODO: combine the icon animation with saveTask function - to avoid repetition
      $('#container').on('click', '#clear-button', function () {
        let i = $(this).data('index');
        let icon = $(this).children('i');
        // animate icon
        icon.removeClass('fa-trash-can').addClass('fa-check saved');
        $(`textarea[data-index=${i}]`).val('');
        let task = '';
        saveToLocal(i, task);
        setTimeout(() => {
          icon.removeClass('fa-check saved').addClass('fa-trash-can');
        }, 1000);
      });
    }
    // save all button/
    $('#container').append(
      `<div class="row ultimate-buttons-wrapper d-flex justify-content-end align-items-center border-0">
        <button id="ultimate-save" class="btn btn-outline-primary rounded-0 text-uppercase mr-2">Save all</button>
        <button id="ultimate-clear" class="btn btn-outline-secondary rounded-0 text-uppercase">Clear all</button>
      </div>`
    );
  }
  renderBlocks();

  // event listener callback
  function saveTask() {
    let icon = $(this).children('i');
    // animate icon
    icon.removeClass('fa-plus').addClass('fa-check saved');
    let i = $(this).data('index');
    let task = $(`textarea[data-index=${i}]`).val();

    saveToLocal(i, task);
    // return icon to default
    setTimeout(() => {
      icon.removeClass('fa-check saved').addClass('fa-plus');
    }, 1000);
  }

  $('main').on('click', '#ultimate-save', function () {
    let saveAllBtn = $('#ultimate-save');
    saveAllBtn.prop('disabled', true).text('Wait...');
    $(`textarea[id='daily-task']`).each(function () {
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

  // clear all
  $('#ultimate-clear').on('click', function () {
    $('main').append(
      `<div id="confirm-delete"><p>Are you sure you want to delete all tasks?</p></div>`
    );
    $('#confirm-delete').dialog({
      resizable: false,
      height: 'auto',
      width: 400,
      modal: true,
      buttons: {
        'Delete all tasks': function () {
          localStorage.removeItem('taskData');
          $('textarea').val('');
          $(this).dialog('close');
        },
        Cancel: function () {
          $(this).dialog('close');
        },
      },
    });
  });

  function colorise() {
    // get current time
    let now = moment().format('HH');

    $('.row').each(function () {
      // convert block time string to a moment object
      let blockTime = moment($(this).find('#block-time').text(), 'hh A').format(
        'HH'
      );
      let row = $(this).children();
      row.removeClass(['past', 'present', 'future']);
      if (blockTime < now) {
        row.addClass('past');
      } else if (blockTime === now) {
        row.addClass('present');
      } else {
        row.addClass('future');
      }
    });
    // update colors every hour
    setInterval(() => colorise(), 60000);
  }
  setTimeout(() => colorise(), 0);

  // main height
  let height = () => {
    $('main').css({
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
