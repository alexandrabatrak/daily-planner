(function ($) {
  // header date
  $('#currentDay').text(moment().format('LL'));
  //* time - do I want it?
  // let updateTime = () => {
  //   $('#currentTime').text(moment().format('HH:mm'));
  //   setInterval(updateTime, 60000);
  // };
  // setTimeout(updateTime, 0);

  //
  let blocks = [];
  let hours = {
    start: 8,
    end: 23,
  };
  // hourly
  for (let i = hours.start; i <= hours.end; i++) {
    blocks.push(moment().hour(i).format('h A'));
  }
  // 30 min
  // *doesn't work as intended. If using this would need to update the colorise() as well
  // for (let i = hours.start; i <= hours.end; i += 0.5) {
  //   blocks.push(moment().hour(i).startOf('hour').format('h:mm A'));
  // }

  console.log(blocks);

  let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
  let today = moment().format('LL');
  // rended blocks
  for (let i = 0; i < blocks.length; i++) {
    $('#container').append(
      `<div class="row w-100" id="row-${i}">
          <div class="hour col-2 d-flex justify-content-left align-items-center">
            <span id="block-time" class="" data-index="${i}">${blocks[i]}</span>
          </div>
          <div class="col-md-9 col-8 d-flex w-100 p-0">
            <input id="daily-task" class="w-100 px-2" value="${
              taskData[i] && taskData[i].date === today ? taskData[i].task : ''
            }" data-index="${i}"/>
          </div>
          <div class="col-md-1 col-2 d-flex p-0 w-100 h-100">
            <button id="save-button" class="btn save-button d-flex align-items-center justify-content-center w-100 h-100" data-index="${i}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
      <div>`
    );

    // event listener for save
    // moved in to see if it will work instead of creating listener separately
    // *event delegation*
    // $('#container').on('click', '#save-button', function () {
    //   // animate icon
    //   $(this).children('i').removeClass('fa-plus').addClass('fa-check saved');
    //   let i = $(this).data('index');
    //   let task = $(`input[data-index=${i}]`).val();

    //   saveToLocal(i, task);
    //   // return icon to default
    //   setTimeout(() => {
    //     $(this).children('i').removeClass('fa-check saved').addClass('fa-plus');
    //   }, 1000);
    // });
    $('#container').on('click', '#save-button', saveTask);
    $('#container').on('keyup', 'input[id="daily-task"]', function (e) {
      // on pressing enter from input, call function passing 'this' arguments
      if (e.which === 13) {
        e.stopPropagation();
        e.preventDefault();
        console.log(e.which);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
        saveTask.call(this);
      }
    });
  }

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

  // save all button
  $('#container').append(
    '<button id="ultimate-save" class="btn">Save All<button>'
  );
  $('#container').on('click', '#ultimate-save', function () {
    $(`input[id='daily-task']`).each(function () {
      let i = $(this).data('index');
      let task = $(this).val();
      saveToLocal(i, task);
    });
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

  // colorise
  function colorise() {
    // get current time
    let nowTime = moment().format('hh A');

    // testing testing who is who
    // TODO: Add a button for test date - randomise it within the range - for testing outside of business hours
    // let nowTime = 'January 28th 2023, 3:48:35';
    // let now = moment(nowTime, 'MMMM Do YYYY, h:mm:ss a').format('hh A');
    let now = moment().format('HH');

    $('.row').each(function () {
      // convert block time string to a moment object
      let blockTime = moment($(this).find('#block-time').text(), 'hh A').format(
        'HH'
      );
      let row = $(this).children();
      if (blockTime < now) {
        row.removeClass(['present', 'future']).addClass('past');
      } else if (blockTime === now) {
        row.removeClass(['past', 'future']).addClass('present');
      } else {
        row.removeClass(['past', 'present']).addClass('future');
      }
    });
    setInterval(colorise, 60000);
  }
  setTimeout(colorise, 0);

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
  for (i = 0; i < 3; i++) {
    src.push(`url('./assets/images/bg${i}.jpg`);
  }
  let bg = src[Math.floor(Math.random() * src.length)];
  $('.jumbotron h1').css('background-image', bg);
  $('footer').css('background-image', bg);
})(jQuery);
