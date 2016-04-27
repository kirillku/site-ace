/// COLLECTIONS

Websites = new Mongo.Collection("websites");

Websites.allow({
	insert: function(userId, doc) {
		return (userId && doc.createdBy === userId);
	},
	update: function(userId, doc, fields, modifier) {
		return userId;
	},
	remove: function(userId, doc) {
		return doc.createdBy === userId;
	}
});