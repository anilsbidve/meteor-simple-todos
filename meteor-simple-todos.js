Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

if (Meteor.isClient) {

  Meteor.subscribe('tasks');

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

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
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
    },
    'click .toggle-private': function () {
      Meteor.call('setPrivate', this._id, !this.private);
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
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, {
      $set: {
        checked: checkStatus
      }
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});
