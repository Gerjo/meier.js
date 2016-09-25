/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// An ad-hoc botched ORM.
define(function(require) {

	
	var Type = require("meier/engine/Enum") (
		"text", "integer", "real", "null", "Export", "Join"
	);


	var Defer = function(callback) {
		setTimeout(callback, 0);
	};
	
	var GetType = function(arg) {
		
		if(arg === null) {
			return Type.Null;
		} else if(typeof arg === "string") {
			return Type.Text;
		} else if(parseInt(arg, 10) == arg) {
			return Type.Integer;
		} else if(parseFloat(arg) == arg) {
			return Type.Real;
		} else if(arg && arg._IsModel === true) {
			return Type.Join;
		}
		
		return "unknown :("
	};

    TODO("Fix SQL injection");

	var Schema = function(db, table, blueprint) {

		var columns = {};
		var Joins = {};
		
		var IsReady = false;
		var Callbacks = [];
		
		
		db.all("CREATE TABLE IF NOT EXISTS '" + table + "' (_id INTEGER PRIMARY KEY AUTOINCREMENT, _updates INTEGER DEFAULT 0) ", function(err, rows) {
			
			//console.log(err);
			
			db.all("PRAGMA table_info('" + table + "')", function(err, rows) {
			
				rows.forEach(function(row) {
					columns[row.name] = Type.TryParse(row.type);
					console.log("Table " + table + "." + row.name + ": " + columns[row.name]);
				});
				
				var queries = [];
			
				// Add missing columns, if any.
				for(var k in blueprint) {
					if(blueprint.hasOwnProperty(k)) {
						if( ! columns[k]) {
							var type = GetType(blueprint[k]);

							console.log(type, blueprint[k]);

							if(type != Type.Join) {
								console.log("Adding column " + k + " " + type.value());
								queries.push("ALTER TABLE " + table + " ADD COLUMN " + k + " " + type.value() + " DEFAULT '" + blueprint[k] + "'");
						    }
							
							columns[k] = type;
						}
					}
				}
			
				function OnReady() {
					IsReady = true; // call
					
					console.log("Model ready. Calling " + Callbacks.length + " ready callback functions.");
				
					Callbacks.forEach(function(callback) {
						callback(Model);
					});
				
					Callbacks.clear();
				}
			
				if(queries.length > 0) {
					
					queries.forEach(function(sql, i) {
						if(queries.length == i + 1) {
							db.run(sql, function(err) {
								OnReady();
							});
						} else {
							db.run(sql);
						}
					});
					
				} else {
					OnReady();
				}
			});
		});
		
		// Create virtual properties
		var access = {};
	
		for(var k in blueprint) {
			// bring k to scope.
			(function(k) {
				if(blueprint.hasOwnProperty(k)) {
					
					var type = GetType(blueprint[k]);
					
					if(type == Type.Join) {
						Joins[k] = type;
						
						access[k] = {
							"get": function() {
								return this["__" + k];
							},
							"set": function(value) {
								this["__" + k] = value;
								// No updates required.
							}
						};
					} else {
						access[k] = {
							"get": function() {
								return this["__" + k];
							},
							"set": function(value) {
								this["__" + k] = value;
						
								this._isDirty = true;
						
								if( ! this._scheduled) {
									this._scheduled = true;
									Defer(this._autoSave.bind(this));
								}
							}
						};
					}
				}
			}(k));
		}
		
		Object.defineProperties(Model.prototype, access);
		
		Model.Ready = function(callback) {
			if(IsReady) {
				if(callback) {
					callback(Model);
				}
				return true;
			} else {
				if(callback) {
					Callbacks.push(callback);
				}
				return false;
			}
		};

		
		// blueprint match schema test?
		function Model(initial) {
			this._id        = -1;
			this._isDirty   = false;
			this._scheduled = false;
			this._joins     = [];
			
			for(var k in initial) {
				if(initial.hasOwnProperty(k)) {
					
					if(GetType(initial[k]) == Type.Join) {
						this[k] = null;
					} else {
						this[k] = initial[k];
					}
				}
			}
		}
		
		Model._IsModel = true;
	
		Model.prototype._autoSave = function() {
			if(this._isDirty) {
				this._isDirty = false;
				this._scheduled = false;
				this.save();
			}
		};
	
		Model.prototype._selfCheck = function() {
			for(var k in this) {
				if(this.hasOwnProperty(k)) {
					if(k[0] != "_" && ! (k.substring(2) in blueprint)) {
						NOTICE("Property '" + k + "' is set, but was not specified in blueprint.");
					}
				}
			}
		};
	
		Model.prototype.save = function() {
		
			this._selfCheck();
			
			if(this._id == -1) {
				
				var pre  = "INSERT INTO " + table + " (";
				var post = "";
				
				for(var k in this) {
					if(k.substr(0, 2) == "__") {
						var key = k.substr(2);
					
						pre  += key + ", ";
						post += "'" + this[k] + "', ";
					} 
				}
				
				var sql = pre + "_updates) VALUES (" + post + "0)";
								
				var self = this;
				
			    console.log(sql);
				
				db.run(sql, function(err) {
					
					if( ! err) {
						self._id = this.lastID;
					} else {
						throw err; // Not my problem ;)
					}
				});
				
			} else {
				var sql = "UPDATE " + table + " SET ";
				
				for(var k in this) {
					
					if(k.substr(0, 2) == "__") {
						var key = k.substr(2);
						
						sql += "" + key + " = '" + this[k] + "', ";
					}
				}
				
				sql += " _updates = _updates + 1 WHERE _id = " + this._id;
				
				console.log(sql);
				
				db.run(sql);
			}
		};
		
		// DELETE, INSERT
		Model.Find = function(criteria, callback) {
			var sql = "SELECT " + table + ".* FROM " + table + " WHERE ";
		
			for(var k in criteria) {
				if(criteria.hasOwnProperty(k)) {
					sql += k + " = '" + criteria[k] + "', ";
				}
			}
		
			sql = sql.trim(", ") + " LIMIT 1";
			
			
		    console.log(sql);
			
			db.all(sql, function(err, rows) {
			
				if(rows.length > 0) {
					var model = new Model(rows[0]);
					model._isDirty = false; // mark clean. contents are loaded from DB.
			
					/*for(var k in Joins) {
						if(Joins.hasOwnProperty(k)) {
							model[k] = Joins[k].Find({});
							console.log(Joins[k].Table);
						}
					}*/
			
					callback(model);
				} else {
					callback(null);
				}
			});
		};
		
		Model.Table = table;

		return Model;
	};
	
	Schema.Mine = new String("mine");
	
	return Schema;
});