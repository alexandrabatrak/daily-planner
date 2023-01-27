(function ($) {
  // header time
  let updateTime = () => {
    $('#currentDay').text(moment().format('LLL'));
    setInterval(updateTime, 60000);
  };
  setTimeout(updateTime, 0);

  // populate time blocks with save buttons
  let blocks = [];
  let hours = {
    start: 9,
    end: 17,
    window: 1,
  };
  for (let i = hours.start; i <= hours.end; i++) {
    blocks.push(`${i}:00`);
  }

  let taskData = JSON.parse(localStorage.getItem('taskData')) || [];

  // rended blocks
  for (let i = 0; i < blocks.length; i++) {
    $('.container').append(
      `<div class="row w-100" id="row-${i}">
          <div class="hour col-2 d-flex justify-content-left pt-2">
            <span id="block-time" class="" data-index="${i}">${blocks[i]}</span>
          </div>
          <div class="col-9 d-flex w-100">
            <input id="daily-task" class="w-100 px-2" value="${
              taskData[i] ? taskData[i].task : ''
            }" data-index="${i}"/>
          </div>
          <div class="col-1 d-flex w-100 h-100 justify-content-center align-items-center">
            <button id="save-button" class="btn save-button d-flex align-items-center h-100" data-index="${i}">
              <i class="fa fa-save"></i>
            </button>
          </div>
      <div>
    `
    );
  }

  // event listener for save
  $('#blocks-row').on('click', '#save-button', function () {
    let i = $(this).data('index');
    let task = $(`input[data-index=${i}]`).val();
    console.log(task);

    if (!taskData[i]) {
      taskData[i] = {
        blockTime: blocks[i],
        task: task,
      };
    } else {
      taskData[i].blockTime = blocks[i];
      taskData[i].task = task;
    }
    localStorage.setItem('taskData', JSON.stringify(taskData));
  });

  // colorise
  function colorise() {
    // get current time
    // let now = moment().format('HH:mm');
    let nowTime = '09:48:35';
    let now = moment(nowTime, 'HH:mm:ss').hour();

    let row = $('.row');
    row.each(function () {
      // convert block time string to a moment object
      let blockTime = moment($(this).find('#block-time').text(), 'HH').hour();
      if (blockTime < now) {
        $(this).removeClass(['present', 'future']).addClass('past');
      } else if (blockTime === now) {
        $(this).removeClass(['past', 'future']).addClass('present');
      } else {
        $(this).removeClass(['past', 'present']).addClass('future');
      }
    });
    setInterval(colorise, 60000);
  }
  setTimeout(colorise, 0);
})(jQuery);
