// The place model

var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var Place = new Schema({
	title: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	content: { type: String },
	thumb: { type: String },
	origin: { type: String },
	filesourceId: { type: Schema.ObjectId },
	originLink: { type: String },
	access: { type: Number },
	licence: { type: String },
	outGoingLink: { type: String },
	yakCat: [Schema.ObjectId],
	yakTag: [String],
	yakcatName: [String],
	freeTag: [String],
	creationDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	lastModifDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	location: {
		type: {
			lat: Number,
			lng: Number
		},
		index: '2d'
	},
	address: {
		type: {
			street_number: String,
			street: String,
			arr: String,
			city: String,
			state: String,
			area: String,
			country: String,
			zip: String
		}
	},
	formatted_address: { type: String },
	contact: {
		type: {
			tel: String,
			mobile: String,
			mail: String,
			transportation: String,
			web: String,
			opening: String,
			closing: String,
			special_opening: String
		}
	},
	status: { type: Number },
	user: { type: Schema.ObjectId },
	zone: { type: Schema.ObjectId }
}, { collection: 'place' });

Place.index({location : '2d'});

Place.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}

Place.statics.findAll = function (callback) {
	return this.find({},[],{sort:{title:1}}, callback);
}

Place.statics.countSearch = function (searchTerm, status, yakcats, users, callback) {
	var search = new RegExp(searchTerm, 'i');

	var conditions = {
		"title" : search
	};

	if (status == 2) {
		conditions["status"] = { $in: [2,10] };
	}
	else if (status != 4) {
		conditions["status"] = status;
	}


	if (0 < yakcats.length)
		conditions["yakCat"] = { $all: yakcats };

	if (0 < users.length)
		conditions["user"] = { $in: users };

	return this.count(conditions, callback);
}

Place.statics.validatePlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids} }
	, update = { status: 1 }
	, options = { multi: true };

	this.update(conditions, update, options, callback);
}

Place.statics.rejectPlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
	, update = { status: 3 }
	, options = { multi: true };

	this.update(conditions, update, options, callback);
}

Place.statics.deletePlaces = function (ids, callback) {

	var conditions = { _id: { $in: ids } }
		, update = { status: 3 }
		, options = { multi: true };

	this.update(conditions, update, options, callback);
}

Place.statics.findGridPlaces = function (pageIndex, pageSize, searchTerm, sortProperties, sortDirections, status, yakcats, users, callback) {

	var conditions = {
		"title" : new RegExp(searchTerm, 'i')
	};

	var sortBy = {};

	for (index in sortProperties) {
		var desc = 1;
		if (sortDirections[index] == "desc")
			desc = -1;
		sortBy[sortProperties[index]] = desc;
	}

	if (status == 2) {
		conditions["status"] = { $in: [2,10] };
	}
	else if (status != 4) {
		conditions["status"] = status;
	}

	if (users.length > 0)
		conditions["user"] = { $in: users };

	if (yakcats.length > 0)
		conditions["yakCat"] = { $all: yakcats };

	return this.find(
		conditions,
		'title content outGoingLink zone origin status formatted_address yakCat freeTag creationDate',
		{
			skip:
			(pageIndex -1)*pageSize,
			limit:
			pageSize,
			sort:
			sortBy
		},
		callback);
}

Place.statics.countUnvalidated = function (callback) {
	return this.count( {status: { $in: [2, 10]}}, callback );
}

Place.statics.findByTitle = function (title, callback) {
	return this.find({ title: title }, callback);
}

mongoose.model('Place', Place);
