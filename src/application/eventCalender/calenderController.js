app.controller('calenderController', function ($rootScope, $scope, $filter, $q, $indexedDB, mapService, constantService, HttpService, UtilService, HandShakeService, $sessionStorage, $timeout, $log, $routeParams) {

  $rootScope.mypageloading = true;
  $scope.eventTitle = '';
  $scope.eventDescription = '';
  $scope.eventType = '';
  $scope.showError = false;
  $scope.disableAddButton = true;
  var getCalendarDetails_hash = {};
  $scope.selectedDefaultDate = undefined;


  $scope.showCalenderEventsFunction = function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: ['interaction', 'dayGrid', 'timeGrid'],
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      defaultDate: $scope.selectedDefaultDate,
      navLinks: true, // can click day/week names to navigate views
      selectable: true,
      selectMirror: true,
      select: function (arg) {
        $scope.showError = false;
        $scope.disableAddButton = true;
        $("#eventTitle").val('');
        $("#eventDescription").val('');
        $("#eventType").val('');
        $('#createEventModal').modal('show');

        $scope.selectedDefaultDate = $filter('date')(arg.start, "yyyy-MM-dd");

        $scope.dateSelected = (arg.start).toDateString();
        calendar.unselect()
      },
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      eventRender: function (event, element) {
        $('#calendar').tooltip({ title: event.title });
      },
      eventClick: function (event) {

        $scope.disableAddButton = true;

        angular.forEach($scope.calenderEvents, function (obj) {
          getCalendarDetails_hash[obj.id] = obj;

          if (event.event.id == getCalendarDetails_hash[obj.id]._id) {

            $("#updateEventTitle").val(getCalendarDetails_hash[obj.id].title);
            $("#updateEventDescription").val(getCalendarDetails_hash[obj.id].description);
            $("#updateEventType").val(getCalendarDetails_hash[obj.id]._type);

            $scope.dateSelected = $filter('date')(getCalendarDetails_hash[obj.id].date, "yyyy-MM-dd");
            $scope.selectedDefaultDate = $filter('date')(getCalendarDetails_hash[obj.id].date, "yyyy-MM-dd");
            $scope.updateEventTitle = getCalendarDetails_hash[obj.id].title;
            $scope.updateEventDescription = getCalendarDetails_hash[obj.id].description;
            $scope.updateEventType = getCalendarDetails_hash[obj.id]._type;
            $scope.updateEventId = getCalendarDetails_hash[obj.id]._id;

            $("#updateOrDeleteEventModal").modal('show');
          }
        });

      },
      events: $scope.getEvents
    });

    calendar.render();
  }

  $scope.hideModal = function () {

    $scope.disableAddButton = true;
    $scope.showError = false;
    $("#eventTitle").val('');
    $("#eventDescription").val('');
    $("#eventType").val('');
    $scope.eventTitle = '';
    $scope.eventDescription = '';
    $scope.eventType = 'Select type';
    $("#createEventModal").modal('hide');
    $("#updateOrDeleteEventModal").modal('hide');
  }

  $scope.detectChangesFunction = function (eventTitle,
    eventType) {

    if (eventTitle != '' && eventTitle != null && eventType != '' && eventType != 'Select type'
      && eventType != null) {
      $scope.disableAddButton = false;
    }
    else {
      $scope.disableAddButton = true;
    }
  }

  $scope.detectChangesInUpdateFunction = function (updateEventTitle,
    updateEventType) {

    if (updateEventTitle != '' && updateEventTitle != null && updateEventType != '' && updateEventType != 'Select type'
      && updateEventType != null) {
      $scope.disableAddButton = false;
    }
    else {
      $scope.disableAddButton = true;
    }
  }

  $scope.addEventInCalender = function (eventTitle, eventDescription,
    eventType) {

    $scope.showError = false;


    if (eventTitle != '' && eventTitle != null && eventType != '' && eventType != 'Select type'
      && eventType != null) {

      $scope.eventTitle = '';
      $scope.eventDescription = '';
      $scope.eventType = 'Select type';

      $scope.hideModal();

      $scope.disableAddButton = true;

      $rootScope.mypageloading = true;

      var calenderRequestData = [{
        "title": eventTitle,
        "description": eventDescription,
        "type": eventType,
        "date": [
          $scope.dateSelected
        ]
      }]

      var requestHandle = HttpService.HttpPostData($rootScope.serverURL + '/customer/calender/addHoliday', calenderRequestData);
      requestHandle.then(function (result) {
        if (result.success) {

          $scope.getCalenderEvent();
        }
        else {
          console.log('Error in get calender events');
        }
      });
    }
    else {
      $scope.showError = true;
      return false
    }

  }

  $scope.updteEventInCalender = function (dateSelected, updateEventTitle,
    updateEventDescription, updateEventType) {

    if (updateEventType == 'Select type') {
      console.log(updateEventType);
      return false
    }

    var calenderRequestData = {
      "_id": $scope.updateEventId,
      "title": updateEventTitle,
      "description": updateEventDescription,
      "type": updateEventType,
      "date": dateSelected

    }
    $scope.hideModal();

    var requestHandle = HttpService.HttpUpdateData($rootScope.serverURL + '/customer/calender/updateHoliday', calenderRequestData);
    requestHandle.then(function (result) {
      if (result.success) {

        $scope.getCalenderEvent();
      }
      else {
        window.alert('Something went wrong in event updation.')
        console.log('Error in get calender events');
      }
    });

  }

  $scope.deleteCalenderEvent = function () {

    $scope.hideModal();

    var requestHandle = HttpService.HttpDeleteData($rootScope.serverURL + '/customer/calender/deleteHoliday/' + $scope.updateEventId);
    requestHandle.then(function (result) {
      if (result.success) {

        $scope.getCalenderEvent();
      }
      else {
        window.alert('Something went wrong in event deletion.')
        console.log('Error in get calender events');
      }
    });
  }

  $scope.getCalenderEvent = function () {
    $scope.getEvents = [];

    var requestHandle = HttpService.HttpGetData($rootScope.serverURL + '/customer/calender/getAllHoliday');
    requestHandle.then(function (result) {
      if (result.success) {
        $scope.calenderEvents = result.data;

        angular.forEach(result.data, function (obj) {
          getCalendarDetails_hash[obj.id] = obj;
        });

        for (var i = 0; i < $scope.calenderEvents.length; i++) {

          if ($scope.calenderEvents[i]._type == 'Holiday') {

            var colorForEvent = '#C88729'

          }
          else if ($scope.calenderEvents[i]._type == 'Exam') {

            var colorForEvent = '#C4472C'

          }
          else if ($scope.calenderEvents[i]._type == 'Event') {

            var colorForEvent = '#AEAC21'

          }
          else if ($scope.calenderEvents[i]._type == 'Other') {

            var colorForEvent = 'purple'

          }
          else {

            var colorForEvent = '#1AAE7A'

          }

          $scope.getEvents.push({
            title: $scope.calenderEvents[i].title,
            start: $filter('date')($scope.calenderEvents[i].date, "yyyy-MM-dd"),
            id: $scope.calenderEvents[i]._id,
            color: colorForEvent
          });
        }
        $rootScope.mypageloading = false;
        document.getElementById("calendar").innerHTML = "";
        $scope.showCalenderEventsFunction();
      }
      else {
        console.log('Error in get calender events');
      }
    });
  }

  $scope.getCalenderEvent();

});

