(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 54)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

})(jQuery); // End of use strict

// Global variable
API_ENDPOINT = 'https://api.github.com/';

$(document).ready(function() {
  localStorage.removeItem('repo');
  localStorage.removeItem('username');
});
// Handle calls to Github
$('#getUser').click(function() {
  var username = $('#username').val();
  if (username) {
    $('.error').removeClass('d-block').addClass('d-none').html('');
    getUserRepo(username);
  }
  else {
    $('.error').removeClass('d-none').addClass('d-block').html('Please enter any github username.');
  }
});
$('#createIssueButton').click(function() {
  var title = $('#title').val();
  if (title) {
    $('.terror').removeClass('d-block').addClass('d-none').html('');
    createIssue();
  }
  else {
    $('.terror').removeClass('d-none').addClass('d-block').html('Please enter issue title.');
  }
});

function getUserRepo(username) {
  $.ajax({
    url: API_ENDPOINT + 'users/' + username + '/repos',
    headers: { 'Authorization': 'token 60ca3a4c2f0b6c9902aa7f9bb0cc2fc8300cb2f0' },
    success: function (response) {
      localStorage.setItem('username', username);
      // Format the data
      var myarray = ['name', 'url', 'open_issues', 'default_branch'];
      var set = [];
      for(var obj in response) {
        a = [];
        if(response.hasOwnProperty(obj)) {
          for(var prop in response[obj]) {
            if(response[obj].hasOwnProperty(prop) && jQuery.inArray(prop, myarray) !== -1) {
              a.push(response[obj][prop]);
            }
          }
        }
        set.push(a);
      }
      listRepo(set);
    },
    error: function () {
        $('#userRepoList').removeClass('d-block').addClass('d-none');
        console.log('some error occured');
        alert('User not found');
    },
    });
  return false;
}

function listRepo(response) {
  var table = $('#userRepoList').DataTable( {
    data: response,
    retrieve: true,
    "searching": false,
    "columnDefs": [ {
      "targets": -1,
      "data": null,
      "defaultContent": '<button class="btn btn-primary">Create Issue</button>'
    } ],
    columns: [
        { title: "Name" },
        { title: "Url" },
        { title: "Open Issue" },
        { title: "Default Branch" },
        { title: "" }
    ]
  });

  $('#userRepoList tbody').on( 'click', 'button', function () {
    var data = table.row( $(this).parents('tr') ).data();
      localStorage.setItem('repo', data[0]);
      $('.modal-title').html(`Create Issue for ${data[0]}`);
      $('#createIssue').modal('show'); 
  } );

  $('#userRepoList').removeClass('d-none').addClass('d-block');
}

function createIssue() {
  $('#success').removeClass('d-block').addClass('d-none').html('');
  var title = $('#title').val();
  var body = $('#body').val();
  var repoName = localStorage.getItem('repo');
  var username = localStorage.getItem('username');
  
  $.ajax({
    type: 'POST',
    url: API_ENDPOINT + 'repos/' + username + '/' + repoName + '/issues',
    headers: { 'Authorization': 'token 60ca3a4c2f0b6c9902aa7f9bb0cc2fc8300cb2f0' },
    data: JSON.stringify({
      title: title, 
      body: body
    }),
    success: function (response) {
      $('#title, #body').val('');
      $('#success').removeClass('d-none').addClass('d-block').html('Issue has been created successfully!');
      getUserRepo(username);
    },
    error: function () {
      console.log('some error occured while creating issue');
      alert('Issue not created due to some technical issue.');
    },
  });
  return false;
}