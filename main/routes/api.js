/*
 * Serve JSON to our AngularJS client
 */

exports.infos = function (req, res) {
	var Info = db.model('Info');
	Info.findAll(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.geoinfos = function (req, res) {
	var Info = db.model('Info');
	var type = [];
	type = req.params.type.split(',');
	if(req.session.user){
		var usersubs= req.session.user.usersubs;
		var tagsubs= req.session.user.tagsubs;
	}
	else{
		var usersubs = [];
		var tagsubs = [];
	}
	Info.findAllGeo(req.params.x1,req.params.y1,req.params.x2,req.params.y2,req.params.heat,type,usersubs,tagsubs,function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.countUnvalidatedInfos = function (req, res) {
	var Info = db.model('Info');
	Info.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.countUnvalidatedUsers = function (req, res) {
	var User = db.model('User');
	User.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.countUnvalidatedPlaces = function (req, res) {
	var Place = db.model('Place');
	Place.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.zones = function (req, res) {
	var Zone = db.model('Zone');
	Zone.findNear(req.params.x,req.params.y,function (err, docs){
	  res.json({
		zone: docs
	  });
	});
};

exports.findZoneById = function (req, res) {
    var Zone = db.model('Zone');
    Zone.findById(req.params.id, function (err, docs){
      res.json({
        zone: docs
      });
    });
};

exports.cats = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.findAll(function (err, docs){
	  res.json({
		cats: docs
	  });
	});
};

exports.findCatByTitle = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.findByTitle(function (err, docs){
		res.json({
			cat: docs
		});
	});
};

exports.countUnvalidatedCats = function (req, res) {
	var Yakcat = db.model('Yakcat');
	Yakcat.countUnvalidated(function (err, docs){
	  res.json({
		info: docs
	  });
	});
};

exports.findCatById = function (req, res) {
	var Yakcat = db.model('Yakcat');
   	Yakcat.findById(req.params.id, function (err, docs){
  	  res.json({
  		cat: docs
	  });
	});
};

exports.findUserById = function (req, res) {
	var User = db.model('User');
	User.findById(req.params.id, function (err, docs){
  	  res.json({
  		user: docs
	  });
	});
};

exports.places = function (req, res) {
	var Place = db.model('Place');

	Place.findAll(function (err, docs){
	  res.json({
		places: docs
	  });
	});
};

exports.users = function (req, res) {
	var User = db.model('User');

	User.findAll(function (err, docs){
	  res.json({
		users: docs
	  });
	});
};



exports.findPlaceById = function (req, res) {
	var Place = db.model('Place');
   	Place.findById(req.params.id, function (err, docs){
  	  res.json({
  		place: docs
	  });
	});
};

exports.validatePlaces = function (req, res) {
	var Place = db.model('Place');
	var ids = [];
	ids = req.params.ids.split(',');

	Place.validatePlaces(ids, function (err, numAffected){
  	  res.json({
  		result: numAffected
	  });
	});
};

exports.deletePlaces = function (req, res) {
	var Place = db.model('Place');
	var ids = [];
	ids = req.params.ids.split(',');

	Place.deletePlaces(ids, function (err, numAffected){
  	  res.json({
  		result: numAffected
	  });
	});
};

exports.gridPlaces = function (req, res) {
	var Place = db.model('Place');
    var User = db.model('User');

    var yakcats = [];
    if (req.query.yakcats) {
        yakcats = req.query.yakcats.split(',');
    }

    var users = [];
    if (req.query.users) {
        users = req.query.users.split(',');
    }

    var sortProperties = [];
    if (req.params.sortBy) {
        sortProperties = req.params.sortBy.split(',');
    }

    var sortDirections = [];
    if (req.params.sortDirection) {
        sortDirections = req.params.sortDirection.split(',');
    }

	Place.findGridPlaces(req.params.pageIndex,req.params.pageSize,
		req.params.searchTerm,sortProperties,sortDirections,
        req.params.status, yakcats, users, function (err, place){

		var data = {};

        data['place'] = place;
		data['pageIndex'] = req.params.pageIndex;
		data['pageSize'] = req.params.pageSize;

		Place.countSearch(req.params.searchTerm, req.params.status, yakcats, users, function (err, count){
			data['count'] = count;
			res.json(data);
		});
	});
};

exports.addfavplace = function (req, res) {
	var User = db.model('User');
	var Point = db.model('Point');

	if(req.session.user){
		var point = new Point(req.body.place);
		console.log(point);
		req.session.user.favplace.push(point);

		User.update({_id:req.session.user._id},{$push:{"favplace":point}}, function(err,docs){
			res.json(point._id);
		});
	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}


};

exports.delfavplace = function (req, res) {
	var User = db.model('User');

	if(req.session.user){
			var pointId = req.body.pointId;
			for(i=0;i<req.session.user.favplace.length;i++)
				if(pointId==req.session.user.favplace[i]._id)
					req.session.user.favplace.splice(i, 1);
					 //{$pull: {attendees: {_id: ObjectId( "4f8dfb06ee21783d7134503a" )}}})
			User.update({_id:req.session.user._id},{$pull:{favplace:{_id:pointId}}}, function(err){
				console.log(err);
				res.json('del');

			});



	}else{
		req.session.message = "Erreur : vous devez être connecté pour sauver vos favoris";
		res.redirect('/user/login');
	}


};

exports.usersearch = function (req, res) {
	var User = db.model('User');
	User.search(req.params.string,function (err, docs){
	  res.json({
		users: docs
	  });
	});
};

exports.posts = function (req, res) {
  var posts = [];
  data.posts.forEach(function (post, i) {
    posts.push({
      id: i,
      title: post.title,
      text: post.text.substr(0, 50) + '...'
    });
  });
  res.json({
    posts: posts
  });
};

exports.post = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }
};

// POST

exports.addPost = function (req, res) {
  data.posts.push(req.body);
  res.json(req.body);
};

// PUT

exports.editPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};

// DELETE

exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};