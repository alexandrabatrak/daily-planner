(function ($) {
  // header time
  $('#currentDay').text(moment().format('LL'));
  // let updateTime = () => {
  //   $('#currentTime').text(moment().format('HH:mm'));
  //   setInterval(updateTime, 60000);
  // };
  // setTimeout(updateTime, 0);

  // populate time blocks with save buttons
  let blocks = [];
  let hours = {
    start: 9,
    end: 17,
  };
  // hourly
  for (let i = hours.start; i <= hours.end; i++) {
    blocks.push(moment().hour(i).format('h A'));
  }

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
    $('#container').on('click', '#save-button', function () {
      let i = $(this).data('index');
      let task = $(`input[data-index=${i}]`).val();
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
      $(this).children('i').removeClass('fa-plus').addClass('fa-check saved');
      setTimeout(() => {
        $(this).children('i').removeClass('fa-check saved').addClass('fa-plus');
      }, 1000);
    });
  }

  // colorise
  function colorise() {
    // get current time
    // let nowTime = moment().format('HH:mm');
    let nowTime = 'January 28th 2023, 3:48:35';
    let now = moment(nowTime, 'MMMM Do YYYY, h:mm:ss a').hour();

    $('.row').each(function () {
      // convert block time string to a moment object
      let blockTime = moment($(this).find('#block-time').text(), 'HH').hour();
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
})(jQuery);
