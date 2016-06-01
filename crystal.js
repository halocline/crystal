// crystal.js
//
//
//

/* Routes using iron:router */
Router.map(function () {
  this.route('home', {
    path: '/'
  });
  this.route('queue', {
    path: '/queue'
  });
  this.route('keyquestions', {
    path: '/key-questions'
  });
  this.route('completed', {
    path: '/completed'
  });
  this.route('stats', {
    path: '/stats'
  });
  this.route('othercards', {
    path: '/backlog'
  });
  this.route('parkinglot', {
    path: '/parking-lot'
  });
});

// Trello authentication functions
var authenticationSuccess = function() { console.log("Successful authentication"); };
var authenticationFailure = function() { console.log("Failed authentication"); };

// Client
if (Meteor.isClient) {
  // Set defaults
  Session.set('connectaReady', false);
  Session.setDefault('boardSelected', {id: "53e4ed33c5473721937ffe15"});

  // Startup 
  Meteor.startup(function () {
    $.getScript(
      'https://api.trello.com/1/client.js?key=892a3fb723fb5d0d42ec32c96c447eb9',
      function(){
        Session.set('conectaReady', true);
        Meteor.call('authorizeTrello');
        Trello.get('boards/' + Session.get('boardSelected').id + '/cards', function (data) {
          Session.set('cards', data);
        });
        Trello.get('boards/' + Session.get('boardSelected').id + '/lists', function (data) {
          Session.set('lists', data);
        });
        Trello.get('boards/' + Session.get('boardSelected').id + '/members', function (data) {
          Session.set('members', data);
        });
        Trello.get('boards/' + Session.get('boardSelected').id, function (data) {
          Session.set('board', data);
        });
        Trello.get('/boards/' + Session.get('boardSelected').id + "/actions?limit=500&filter=createCard", function (data) {
          Session.set('cardCreateDates', data);
        });
        Trello.get('boards/' + Session.get('boardSelected').id + '/labels', function (data) {
          Session.set('labels', data);
        });
        Trello.get('boards/' + Session.get('boardSelected').id + '/cards?filter=closed&actions=updateCard:closed&since=2016-01-15', function (data) {
          Session.set('cards_completed', data);
        });
      }
    );
  });

  // Global helpers
  Template.registerHelper('formatDate', function(date) {
    if ( date != null ) {
      var d = new Date(date);
      d = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear();
      return d;
    }
  });

  Template.registerHelper('getListName', function(id) {
    var lists = Session.get('lists');
    for (var i = lists.length - 1; i >= 0; i--) {
      if (lists[i].id === id) {
        return lists[i].name;
      }
    };
  });

  Template.registerHelper('getMemberName', function(ids) {
    var members = Session.get('members');
    var m = [];

    for (var i = members.length - 1; i >= 0; i--) {
      if ($.inArray(members[i].id, ids) != -1) {
        m.push(members[i].fullName);
        //return members[i].fullName;
      }
    };
    return m;
  });

  Template.registerHelper('getStakeholder', function (obj) {
    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === null) {
        return obj[i].name;
      }
    };
  });

  Template.registerHelper('getTeam', function (obj) {
    var teams = [];

    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "red") {
        teams.push(obj[i].name);
      }
    };
    return teams;
  });

  Template.registerHelper('getImpact', function (obj) {
    var impacts = [];

    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "purple") {
        impacts.push(obj[i].name);
      }
    };
    return impacts;
  });

  Template.registerHelper('getScope', function (obj) {
    var scope = [];

    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "lime") {
        scope.push(obj[i].name);
      }
    };
    return scope;
  });

  Template.registerHelper('getStrategicObjective', function (obj) {
    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "green") {
        return obj[i].name;
      }
    };
  });

  Template.registerHelper('getMarketingObjective', function (obj) {
    var objectives = [];

    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "yellow") {
        objectives.push(obj[i].name);
      }
    };
    return objectives;
  });

  Template.registerHelper('getSuccessMeasure', function (obj) {
    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "orange") {
        return obj[i].name;
      }
    };
  });

  Template.registerHelper('getDateAdded', function (id) {
    cardCreateDates = Session.get('cardCreateDates');
    for (var i = cardCreateDates.length - 1; i >= 0; i--) {
      if ( cardCreateDates[i].data.card.id === id ) {
        var d = new Date(cardCreateDates[i].date);
        d = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear();
        return d;
      }
    };
  });

  Template.registerHelper('getPriority', function (obj) {
    for (var i = obj.length - 1; i >= 0; i--) {
      if (obj[i].color === "sky") {
        return obj[i].name;
      }
    };
  });

  //

  Template.boardname.helpers({
    boardname: function () {
      return Session.get('board');
    }
  });

  Template.cards.helpers({
    portfolio_card: function () {
      var label_name = "Channel Mix Optimization";
      var cards = Session.get('cards');
      var my_cards = [];
      var hasLabel = function (obj, val) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if ( obj[i].name === val ) {
            //console.log(true);
            return true;
          }
        };
      };
      var removeBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = my_cards.length - 1; i >= 0; i--) {
          if ( my_cards[i].idList === idList ) {
            my_cards.pop(my_cards[i]);
          }
        };
      };

      for (var i = cards.length - 1; i >= 0; i--) {
        var labels = cards[i].labels;
        if ( labels.length >= 1 ) {
          if( hasLabel(labels, label_name) === true) {
            my_cards.push( cards[i] );
          };
        }
      };

      removeBacklogTasks();

      return my_cards;
    },
    channel_card: function () {
      var label_name = "Channel Optimization";
      var cards = Session.get('cards');
      var my_cards = [];
      var hasLabel = function (obj, val) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if ( obj[i].name === val ) {
            //console.log(true);
            return true;
          }
        };
      };
      var removeBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = my_cards.length - 1; i >= 0; i--) {
          if ( my_cards[i].idList === idList ) {
            my_cards.pop(my_cards[i]);
          }
        };
      };

      for (var i = cards.length - 1; i >= 0; i--) {
        var labels = cards[i].labels;
        if ( labels.length >= 1 ) {
          if( hasLabel(labels, label_name) === true) {
            my_cards.push( cards[i] );
          };
        }
      };
      removeBacklogTasks();
      return my_cards;
    },
    ltv_card: function () {
      var label_name = "Increase LTV";
      var cards = Session.get('cards');
      var my_cards = [];
      var hasLabel = function (obj, val) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if ( obj[i].name === val ) {
            //console.log(true);
            return true;
          }
        };
      };
      var removeBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = my_cards.length - 1; i >= 0; i--) {
          if ( my_cards[i].idList === idList ) {
            my_cards.pop(my_cards[i]);
          }
        };
      };

      for (var i = cards.length - 1; i >= 0; i--) {
        var labels = cards[i].labels;
        if ( labels.length >= 1 ) {
          if( hasLabel(labels, label_name) === true) {
            my_cards.push( cards[i] );
          };
        }
      };
      removeBacklogTasks();
      return my_cards;
    },
    audience_card: function () {
      var label_name = "Deep Understanding of Audience";
      var cards = Session.get('cards');
      var my_cards = [];
      var hasLabel = function (obj, val) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if ( obj[i].name === val ) {
            //console.log(true);
            return true;
          }
        };
      };
      var removeBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = my_cards.length - 1; i >= 0; i--) {
          if ( my_cards[i].idList === idList ) {
            my_cards.pop(my_cards[i]);
          }
        };
      };

      for (var i = cards.length - 1; i >= 0; i--) {
        var labels = cards[i].labels;
        if ( labels.length >= 1 ) {
          if( hasLabel(labels, label_name) === true) {
            my_cards.push( cards[i] );
          };
        }
      };
      removeBacklogTasks();
      return my_cards;
    }
  });

  Template.queue.helpers({
    queue_card: function () {
      var label_list = [
        "Channel Mix Optimization","Channel Optimization","Increase LTV",
        "Deep Understanding of Audience"
      ];
      var cards = Session.get('cards');
      var my_cards = [];
      var hasLabel = function (obj, arr) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if( $.inArray(obj[i].name, arr) >= 0) {
            return true;
          }
        };
      };
      /*
      var removeBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = my_cards.length - 1; i >= 0; i--) {
          if ( my_cards[i].idList === idList ) {
            my_cards.pop(my_cards[i]);
          }
        };
      };
      var removeParkingLotTasks = function (card) {
        var idList = "5692f21fe7f35928ca34a992"; // Parking Lot list id
        if ( card.idList === idList ) {
          my_cards.pop(card);
        }
      };
      */
      var isBacklogTask = function (card) {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        if ( card.idList === idList ) {
          return true;
        }
        else {
          return false;
        }
      };
      var isOnDeckTask = function (card) {
        var idList = "53e4ed33c5473721937ffe17"; // On Deck list id
        if ( card.idList === idList ) {
          return true;
        }
        else {
          return false;
        }
      };
      var isParkingLotTask = function (card) {
        var idList = "5692f21fe7f35928ca34a992"; // Parking Lot list id
        if ( card.idList === idList ) {
          return true;
        }
        else {
          return false;
        }
      };
      var isKeyQuestion = function (card) {
        var idList = "568e8c313c535a7d08a11f4d"; // Key Question list id
        if ( card.idList === idList ) {
          return true;
        }
        else {
          return false;
        }
      };
      var isRestricted = function (card) {
        var backlog = isBacklogTask(card);
        var parkinglot = isParkingLotTask(card);
        var keyquestion = isKeyQuestion(card);
        var ondeck = isOnDeckTask(card);

        if (backlog === true || parkinglot === true 
          || keyquestion === true || ondeck === true
          ) {
          return true;
        }
        else {
          return false;
        }
      };

      for (var i = cards.length - 1; i >= 0; i--) {
        var labels = cards[i].labels;

        if ( isRestricted( cards[i] ) === false ) {
          if ( labels.length >= 1 ) {
            if( hasLabel(labels, label_list) === true) {
              my_cards.push( cards[i] );
            };
          }
        }
        
      };
      
      return my_cards;
    }
  });

  Template.queue.events({
    'click .table-sort': function () {
      $(".tablesorter").tablesorter({
        sortList: [[0,0],[4,0]]
      });
    }
  });

  Template.parkinglot.helpers({
    parkinglot_card: function () {
      var cards = Session.get('cards');
      var my_cards = [];

      var addParkingLotTasks = function () {
        var idList = "5692f21fe7f35928ca34a992"; // Parking Lot list id
        for (var i = cards.length - 1; i >= 0; i--) {
          if ( cards[i].idList === idList ) {
            my_cards.push(cards[i]);
          }
        };
      };

      addParkingLotTasks();

      return my_cards;
    }
  });

  Template.keyquestions.helpers({
    keyquestion_card: function () {
      var cards = Session.get('cards');
      var my_cards = [];

      var addKeyQuestionTasks = function () {
        var idList = "568e8c313c535a7d08a11f4d"; // Key Questions list id
        for (var i = cards.length - 1; i >= 0; i--) {
          if ( cards[i].idList === idList ) {
            my_cards.push(cards[i]);
          }
        };
      };

      addKeyQuestionTasks();

      return my_cards;
    }
  });

  Template.keyquestions.events({
    'click .table-sort': function () {
      $(".tablesorter").tablesorter({
        sortList: [[0,0],[4,0]]
      });
    }
  });

  Template.othercards.helpers({
    other_card: function () {
      var ignore = ["Channel Mix Optimization","Channel Optimization","Increase LTV","Deep Understanding of Audience"];
      var cards = Session.get('cards');
      var my_cards = cards;
      var qa = [];
      var hasLabel = function (obj, arr) {
        for (var i = obj.length - 1; i >= 0; i--) {
          if( $.inArray(obj[i].name, arr) >= 0) {
            return true;
          }
        };
      };
      var addBacklogTasks = function () {
        var idList = "53e4ed33c5473721937ffe16"; // Backlog list id
        for (var i = cards.length - 1; i >= 0; i--) {
          if ( cards[i].idList === idList ) {
            qa.push(cards[i]);
          }
        };
      };
      var addOnDeckTasks = function () {
        var idList = "53e4ed33c5473721937ffe17"; // OnDeck list id
        for (var i = cards.length - 1; i >= 0; i--) {
          if ( cards[i].idList === idList ) {
            qa.push(cards[i]);
          }
        };
      };
      var inKeyQuestions = function (obj) {
        var idList = "568e8c313c535a7d08a11f4d"; // Key Questions list id
        if (obj.idList === idList) {
          return true;
        }
        else {
          return false;
        }
      };

      addOnDeckTasks();
      addBacklogTasks();

      /*
      for (var i = my_cards.length - 1; i >= 0; i--) {
        var labels = my_cards[i].labels;

        if( hasLabel(labels, ignore) ) { 
          my_cards.pop( my_cards[i] ); // Remove cards with these labels - these labels are reseverved for strategically alligned tasks
        }
        else {
          if ( inKeyQuestions(my_cards[i]) === false ) {
            qa.push(my_cards[i]); // Add all other cards
          }
        }
      };
      */

      return qa;
    },
    stakeholder: function () {
      var labels = Session.get('labels');
      var stakeholders = [];
      
      for (var i = labels.length - 1; i >= 0; i--) {
        if ( labels[i].color === null ) {
          stakeholders.push(labels[i]);
        }
      };

      return stakeholders;
    }
  });

  Template.othercards.events({
    'click .table-sort': function () {
      $(".tablesorter").tablesorter({
        sortList: [[4,0],[8,1],[6,0],[8,1],[0,0],[9,1]]
      });
    },
    'change .stakeholder': function() {
      console.log($('.stakeholder').val());
      return Session.get('cards');
    }
  });

  Template.completed.helpers({
    completed_cards: function () {
      var cards = Session.get('cards_completed');

      return cards;
    }
  });

  Template.completed.events({
    'click .table-sort': function () {
      $(".tablesorter").tablesorter({
        sortList: [[7,1],[3,0],[4,0],[6,1],[7,1]]
      });
    }
  });
  
  // jQuery tablesorter
  $(function() {
    $(".tablesorter").tablesorter({
      sortList: [[0,0],[4,0]]
    });
  });
  /*
  $('#table-sort').click(function() {
    console.log('click');
    $(".tablesorter").tablesorter({
      sortList: [[0,0],[4,0]]
    });
  });
  */
}


// Server
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}


// Methods
Meteor.methods({
  authorizeTrello: function () {
    Trello.authorize({
       type: "popup",
        name: "Getting Started Application2",
        scope: {
          read: true,
          write: true },
        expiration: "never",
        authenticationSuccess,
        authenticationFailure
    });
  }
});

