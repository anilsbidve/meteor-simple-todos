Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

  // This code only run on client
  Template.body.helpers({
    tasks: function () {
      if (Session.get('hideCompleted')) {
        return Tasks.find({
          checked: {
            $ne: true
          }
        }, {
          sort: {
            createdAt: -1
          }
        })
      } else {
        return Tasks.find({}, {
          sort: {
            createdAt: -1
          }
        });
      }
    },
    incompleteCount: function () {
      return Tasks.find({
        checked: {
          $ne: true
        }
      }).count();
    }
  });

  Template.body.events({
    'submit .new-task': function (event) {
      // prevent form being submit
      event.preventDefault();

      Tasks.insert({
        text: event.target.task.value,
        owner: Meteor.userId(),
        username: Meteor.user().username,
        createdAt: new Date()
      });

      // clear input to add new task
      event.target.task.value = '';
    },
    'click .toggle-checked': function () {
      Tasks.update(this._id, {
        $set: {
          checked: !this.checked
        }
      });
    },
    'click .delete': function () {
      Tasks.remove(this._id);
    },
    'change .hide-completed input': function (event) {
      Session.set('hideCompleted', event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

}
