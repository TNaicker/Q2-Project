$(function () {
  var socket = io.connect();
  var username = [];
  var userArray = [];
  var gameStart = false;

  $('#game').hide();

  //Form to handle submitting a nickname for the room
  $('#usernameForm').submit(() => {
    socket.emit('username', $('#usernameInput').val().trim());
    $('#usernameInput').val('');
    username.push($('#usernameInput').val().trim());
    if(username.length >= 1) {
      $('#username').fadeOut();
      $('#username').off();
      $('#game').show();
    }
    return false;
  })

  //Form to handle sending the messages
  $('#chatForm').submit(() => {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

//   socket.on('connect', function() {
//    // Connected, let's sign-up for to receive messages for this room
//    socket.emit('room', room);
// });

  //Logic for when a user joins the room
  socket.on('ready', (users, name) => {
    userJoined(users, name);
  })

  //logic for when a user leaves the room
  socket.on('user left', (data) => {
    userLeft(data);
  })

  //logic for when a user sends messages in chat
  // socket.on('userChat', (name, msg) => {
  //   $('#messages').append($('<li>').text(name + ': ' + msg));
  // })

  // #@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#
  // #@#@#@#@#@ FUNCTIONS @#@#@#@#@#
  // #@#@#@#@#@#@#@#@#@#@#@#@#@#@#@#

  function userLeft(data) {
    $('#CurConnected').text('users in room: ' + data.numUsers);
    $('#messages').append($('<li style="background:red">').text(data.username + ' LEFT'));
    userArray.splice(userArray.indexOf(data.username), 1);
    socket.emit('updatedUserList', userArray);
    $('#users').empty();
    userArray.forEach((name) => {
      $('#users').append($('<li class="list-group-item">').text(name));
    })
  }

  function userJoined(users, nameArr) {

    userArray = nameArr;
    $('#messages').append($('<li style="background:green">').text(userArray[userArray.length-1] + ' JOINED'));
    $('#CurConnected').text('users in room: ' + users);
    console.log('emptying and writing on ready');
    $('#users').empty();
    userArray.forEach((name) => {
      $('#users').append($('<li class="list-group-item">').text(name));
    })
  }

});
