
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, S = require('string'),
	crypto = require('crypto');

//mongoose.set('debug', true);

/*
var Address = new Schema({
	street_number : String
	, street     : String
	, arr     : String
	, city      : String
	, state      : String
	, country      : String
	, area      : String
	, zip      : String
});
mongoose.model('Address', Address);
*/

var Point = new Schema({
	  name : String
	, location	: { type : { lat: Number, lng: Number }}
});
mongoose.model('Point', Point);

/**
 * Schema definition
 */
var Info = new Schema({
	title     : { type: String}
  , content	: {type: String}
  , thumb	: {type: String}
  , origin	: {type: String}
  , access	: {type: Number}
  , licence	: {type: String}
  , outGoingLink       : { type: String }
  , heat	: {type: Number}
  , print	: {type: Number}
  , yakCat	: {type: [Yakcat]}
  , yakTag	: {type: [String]}
  , yakType	: {type: Number}
  , freeTag	: {type: [String]}
  , pubDate	: {type: Date, required: true, default: Date.now}
  , creationDate	: {type: Date, required: true, default: Date.now}
  , lastModifDate	: {type: Date, required: true, default: Date.now}
  , dateEndPrint	: {type: Date}
  , address	: {type : String}
  , location	: { type : { lat: Number, lng: Number }, index : '2d'}
  , status	: {type: Number}
  , user	: {type: Schema.ObjectId}
  , zone	: {type: Schema.ObjectId}
  ,	placeId	: {type: Schema.ObjectId}
}, { collection: 'info' });

Info.index({location : '2d'});

Info.statics.findByTitle = function (title, callback) {
  return this.find({ title: title }, callback);
}
Info.statics.findByLink = function (link, callback) {
  return this.find({ outGoingLink: link }, callback);
}
Info.statics.findAll = function (callback) {
  return this.find(
	{"status":1},
	[],
	{
		skip:0, // Starting Row
		limit:100, // Ending Row
		"yakType" : 1,
		sort:{
			pubDate: -1 //Sort by Date Added DESC
		}
	},
	callback);
}

Info.statics.countUnvalidated = function (callback) {
	return this.count( {'status': { $in: [2, 10]}}, callback );
}

Info.statics.findAllGeo = function (x1,y1,x2,y2,heat,type,usersubs,tagsubs,callback) {
  var now = new Date();
  var D = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  var DTS = D.getTime() / 1000 - (heat * 60 * 60 * 24);
  D.setTime(DTS*1000);
  var box = [[parseFloat(x1),parseFloat(y1)],[parseFloat(x2),parseFloat(y2)]];
  var cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$gte:D},
				"yakType" : {$in:type}
			};

  //alerts
  if(type == 5)
	cond = {
				"print":1,
				"status":1,
				"location" : {$within:{"$box":box}},
				"pubDate":{$gte:D},
				$or:[ {"user":{$in:usersubs}}, {"freeTag": {$in:tagsubs}} ],

			};

  return this.find(
	cond,
	[],
	{
		skip:0, // Starting Row
		limit:100, // Ending Row
		sort:{
			pubDate: -1 //Sort by Date Added DESC
		}
	},
	callback);

}

mongoose.model('Info', Info);

/*USERS*/

var User = new Schema({
	name	: { type: String, index: true}
	, bio	: { type: String}
	, mail	: { type: String, index: true}
	, web	: { type: String}
	, tag	: { type: [String], index: true}
	, thumb	: { type: String}
	, type	: { type: Number, required: true, index: true}
	, login	: { type: String, lowercase: true, required: true, index: { unique: true } }
	, hash       : { type: String ,required: true, index: true}
	, salt       : { type: String ,required: true, index: true}
	, token       : { type: String ,required: true, index: true}
	, usersubs	: { type: [Schema.ObjectId], index: true}
	, tagsubs	: { type: [String], index: true}
	, placesubs	: { type: [Schema.ObjectId], index: true}
	, location	: { type : { lat: Number, lng: Number }, index : '2d'}
	, address	: { type : {
								street_number: String,
								street: String,
								arr: String,
								city: String,
								state: String,
								area: String,
								country: String,
								zip: String}
							}
	, favplace : [Point]
	, creationDate	: {type: Date, required: true, default: Date.now}
	, lastModifDate	: {type: Date, required: true, default: Date.now}
	, lastLoginDate	: {type: Date, required: true, default: Date.now}
	, status	: {type: Number, required: true, default: 2,index: true}
}, { collection: 'user' });

User.statics.findAll = function (callback) {
  return this.find({}, callback);
}

User.statics.findByLogin = function (login,callback) {
  return this.find({login:login, status:1}, callback);
}

User.statics.findByIds = function (ids,callback) {
  return this.find({'_id': { $in: ids}}, callback);
}

User.statics.findById = function (id,callback) {
  return this.findOne({'_id': id}, callback);
}

User.statics.countUnvalidated = function (callback) {
	return this.count( {'status': { $in: [2, 10]}}, callback );
}

User.statics.findAll = function (callback) {
  return this.find({},[],{sort:{name:1}}, callback);
}

User.statics.search = function(string,callback){
	var input = new RegExp(string,'i');
	return this.find(
	{	$or:[ {'login': {$regex:input}}, {'name': {$regex:input}} , {"tag": {$regex:input}} ],

	"status":1,
	},
	['_id','tag','name'],
	{

		skip:0, // Starting Row
		limit:100, // Ending Row
		sort:{
			lastLoginDate: -1 //Sort by Date Added DESC
		}
	},
	callback);
}

User.statics.findByNameorLogin = function(string,callback){
	
	return this.findOne(
	{	$or:[ {'login': string}, {'name': string}], "status":1 },
	'_id,name,login',
	{},
	callback);
}


var auth = require('../mylib/basicAuth');
User.plugin(auth);

mongoose.model('User', User);

/*ZONE*/
var Zone = new Schema({
	name     : { type: String}
	, num : { type: Number}
  , location       : { lat: {type: Number},lng:{type:Number} }
}, { collection: 'zone' });


Zone.statics.findNear = function (x,y,callback) {
	var center = [parseFloat(x), parseFloat(y)];
	z = 3;

	  //return this.find( {limit:1, "location" : { "$within" : { "$center" : [center, radius] }}},callback );
	  return this.find({"location" : {  "$near" : [parseFloat(x),parseFloat(y)], $maxDistance : z }},[],{limit:1},callback );
  //return this.find( { "location" : { "$within" : {,"$box": [[x-1, y-1], [x+1, y+1]]}}},callback );
}

Zone.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}

Zone.statics.findAll = function (callback) {
  return this.find({}, callback);
}
mongoose.model('Zone', Zone);

/*YAKCAT*/
var Yakcat = new Schema({
	title     : { type: String, index:true}
  , path       : { type:String }
  , pathN       : { type:String, uppercase: true, index:true }
  , tag       : { type:[String] }
  , level       : { type:Number }
  , thumb       : { type:String }
  , creationDate       : { type:Date }
  , lastModifDate       : { type:Date }
  , status       : { type:Number }

}, { collection: 'yakcat' });

Yakcat.statics.findAll = function (callback) {
  return this.find({},[],{sort:{title:1}}, callback);
}

Yakcat.statics.findById = function (id, callback) {
	return this.findOne({'_id': id}, callback);
}

Yakcat.statics.findByTitle = function (title, callback) {
	return this.findOne({'title': title}, callback);
}

Yakcat.statics.countUnvalidated = function (callback) {
	return this.count( {'status': { $in: [2, 10]}}, callback );
}

mongoose.model('Yakcat', Yakcat);

// Load place.js
require('./place.js');