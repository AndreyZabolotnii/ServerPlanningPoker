//Общие скрипты веб-сервиса

// var canv = document.getElementById('canv'),
// ctx = canv.getContext('2d');
// //ctx.fillRect(0, 0, canv.width, canv.height)
// //canv.height = 300;
// canv.width = 480;
// canv.height = 320;


// var arrCards = new Array();
// img = new Image()

// img.src = '/templates/img/voice-1.png'

// img.onload = x => ctx.drawImage(img, 0, 0, 100, 150);



let socketInst, currentXmlString, currentXml;

$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name) {
        return $.getUrlVars()[name];
    }
});

function createWebSocket() {
    socketInst = new WebSocket('ws://localhost:8080/echo?roomId=' + $.getUrlVar('roomId'));
    socketInst.onopen = function (event) {
        socketInst.send("ChangeGetVM")

    }
    socketInst.onmessage = function (event) {
        currentXmlString = event.data;


        parseXmlResponse(currentXml);
        //alert(currentXmlString);
    }
}

function startTimeTask(timerElement) {
    timerElement.text = timerElement.text - 1;
}

function parseXmlResponse(currentXml) {
    $('.right-menu-room ul, .name-meeting h1, .tasks-left-menu-room').empty();
    var parserXml = new DOMParser();
    currentXml = parserXml.parseFromString(currentXmlString, "text/xml");
    var persons = currentXml.getElementsByTagName('Persons')[0].getElementsByTagName('Person')
    if (persons != null && persons != undefined)
        for (var i = 0; i < persons.length; i++) {
            $(`<li class="person${persons[i].getAttribute('Id')}">${persons[i].getAttribute('UserName')}</li>`).appendTo($('.right-menu-room ul'));
        }
    var nameMeeting = currentXml.getElementsByTagName('Room')[0].getAttribute('NameRoom');
    if (nameMeeting != null & persons != undefined) {
        console.log(nameMeeting)
        $('.name-meeting h1').text(nameMeeting);
    }
    var tasks = currentXml.getElementsByTagName('Tasks')[0].getElementsByTagName('Task')
    if (tasks != null && tasks != undefined) {
        console.log(tasks)
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].getAttribute('IsCurrentActive') == 1) {
                console.log(tasks[i].getAttribute('IsCurrentActive'));
                StartTimerTask(tasks[i].getAttribute('TimeDiscussion'));
            }
            $(`<div id="task-${tasks[i].getAttribute('Id')}" class="task-room is-current-active-${tasks[i].getAttribute('IsCurrentActive')}">${tasks[i].getAttribute('NameTask')}</div><div class="time-task-discussion">
                        ${tasks[i].getAttribute('TimeDiscussion')} :min</div><div class="current-median"><p><span>Median:</span></p></div>`).appendTo($('.tasks-left-menu-room'));
        }
    }

    for (i = 0; i < tasks.length; i++) {
        if (tasks[i].getAttribute('IsCurrentActive') == 1) {
            var currentPersonTasks = tasks[i].getElementsByTagName('PersonTask')
            for (k = 0; k < currentPersonTasks.length; k++) {
                if (currentPersonTasks[k].getAttribute('Vote') != 0) {
                    $(`.person${currentPersonTasks[k].getAttribute('PersonId')}`).css({ "background": "red" })
                }
            }
        }
    }
    console.log(persons);
}

function StartTimerTask(initTime) {
    if ($('.is-current-active-1') == null || $('.is-current-active-1') == undefined)
        return

    var timeTask = initTime * 60, stopTime = timeTask * 1000;
    console.log(timeTask)
    var timerTask = setInterval(() => {
        timeTask -= 1;
        $('.is-current-active-1').next().text(timeTask);
        console.log(timeTask);
    }, 1000)
    setTimeout(() => { clearInterval(timerTask) }, stopTime)
    console.log(stopTime)
}

$(document).on('click', '.button-room', (e) => {
    e.preventDefault()
    socketInst.send(`ChangeVote==<Change><AddVote vote="1" score="${e.target.id.split('-')[1]}"/></Change>`)
    console.log(e.target.id.split('-')[1])
});

$('#yellow').click(() => {
    SendColor('yellow')
});
$('#green').click(() => {
    SendColor('green')
});


createWebSocket();


parseXmlResponse(currentXml); //test