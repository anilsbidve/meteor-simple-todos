Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

  // This code only run on client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {
        sort: {
          createdAt: -1
        }
      });
    }
  });

  Template.body.events({
    'submit .new-task': function (event) {
      // prevent form being submit
      event.preventDefault();

      Tasks.insert({
        text: event.target.task.value,
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
    }
  });

}
