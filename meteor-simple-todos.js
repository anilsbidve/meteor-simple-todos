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

      Meteor.call('addTask', event.target.task.value);

      // clear input to add new task
      event.target.task.value = '';
    },
    'click .toggle-checked': function () {
      Meteor.call('setChecked', this._id, !this.checked);
    },
    'click .delete': function () {
      Meteor.call('deleteTask', this._id);
    },
    'change .hide-completed input': function (event) {
      Session.set('hideCompleted', event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

}

Meteor.methods({
  addTask: function (text) {
    if (!Meteor.userId()) {
      throw new Error('not-authorised');
    }
    Tasks.insert({
      text: text,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      createdAt: new Date()
    });
  },
  setChecked: function (taskId, checkStatus) {
    Tasks.update(taskId, {
      $set: {
        checked: checkStatus
      }
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  }
});
