/// ROUTES

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
	this.render('website_list', { to: "main"});
});

Router.route('/website/:_id', function() {
	this.render('website_details', {
		to: "main",
		data: () => Websites.findOne({ _id: this.params._id})
	})
});


Accounts.ui.config({
	passwordSignupFields: "USERNAME_AND_EMAIL"
});


/// TEMPLATE HELPERS 

Template.registerHelper('formatDate', function(date) {
	return date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
});

Template.registerHelper('getUserName', function(userId) {
	return Meteor.users.findOne({_id: userId}).username;
});

Template.website_list.helpers({
	
	websites: function() {
		return Websites.find({}, {sort: {upVote:-1}});
	}
});
Template.votes.helpers({

	buttonUp: function() {
		if (this.likes[Meteor.userId()] === 1) return 'disabled';
		else return '';
	},

	buttonDown: function() {
		if (this.likes[Meteor.userId()] === -1) return 'disabled';
		else return '';
	}
});


/// TEMPLATE EVENTS 

Template.votes.events({

	"click .js-upvote": function(event) {
		var userId = Meteor.userId();
		if (!userId) return false;

		switch (this.likes[userId]) {
			case 1:
				return false;
				break;
			case -1:
				this.likes[userId] = 0;
				this.downVote--;
				break;
			default:
				this.likes[userId] = 1;
				this.upVote++;
		}

		Websites.update({"_id": this._id}, {$set: {
			upVote: this.upVote,
			downVote: this.downVote, 
			likes: this.likes
		}});

		// prevent the button from reloading the page
		return false;
	}, 

	"click .js-downvote": function(event) {
		var userId = Meteor.userId();
		if (!userId) return false;

		switch (this.likes[userId]) {
			case -1:
				return false;
				break;
			case 1:
				this.likes[userId] = 0;
				this.upVote--;
				break;
			default:
				this.likes[userId] = -1;
				this.downVote++;
		}

		Websites.update({"_id": this._id}, {$set: {
			upVote: this.upVote,
			downVote: this.downVote, 
			likes: this.likes
		}});

		// stop the form submit from reloading the page
		return false;
	}
})

Template.website_form.events({

	"click .js-toggle-website-form": function(event) {
		$("#website_form").toggle('slow');
	}, 

	"submit .js-save-website-form": function(event) {
		var url = event.target.url.value;
		var title = event.target.title.value;
		var description = event.target.description.value;

		console.log("The url they entered is: "+url);
		
		Websites.insert({
			title: title, 
			url: url, 
			description: description, 
			createdOn: new Date(),
			createdBy: Meteor.userId(),
			likes: {},
			comments: [],
			upVote: 0,
			downVote: 0
		});
		$("#website_form").toggle('slow');

		//reset the fields
		event.target.reset();

		// stop the form submit from reloading the page
		return false;
	}
});

Template.website_details.events({

	"submit .js-save-comment-form": function(event) {
		var userId = Meteor.userId();
		if (!userId) return false;

		var text = event.target.comment.value;
		this.comments.push({
			userId: userId,
			text: text
		});

		Websites.update({"_id": this._id}, {$set: {
			comments: this.comments
		}});

		//reset the fields
		event.target.reset();

		// prevent the button from reloading the page
		return false;
	}
});