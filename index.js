var _ = require("underscore");
var _s = require('underscore.string');
//分析并提取表名
var extractTableName = function(sql){
	var pattern = /(.+)?\s([a-zA-z0-9_]{1,})\(.+/ig;
	if(pattern.test(sql)){
		return sql.replace(pattern, '$2');
	}else{
		return false;
	}
}

//分析并提取字段名
var extractFields = function(sql){
	//提取字段列表
	var fileds = sql.toLowerCase().replace(/.+\((.+)\)/ig, "$1");
	fileds = fileds.split(",");

	var list = [];
	fileds.forEach(function(item){
		if(/(.+?)\s(\w+)(\s.+)?/ig.test(item)){
			var field = {
				name: _s.trim(RegExp.$1),
				type: _s.trim(RegExp.$2)
			};

			//取默认的内容
			if(/\sdefault\s(.+)$/ig.test(item)){
				field.defaultValue = RegExp.$1;
			};

			//判断是否为唯一键
			if(/PRIMARY/ig.test(item)){
				field.unique = true;
			};

			list.push(field);
		};
	});
	return list;
}

//根据创建表的sql进行分析
exports.analyseWithSql = function(sql){
	return {
		tableName: extractTableName(sql),
		fields: extractFields(sql)
	}
}

//根据sqlite进行分析，tables可选为string或者array
//@params path sqlite的文件路径
//@parmas tables 要分析的表，可选为string或array。如果不选择此参数，则查询所有表，当不选择此参数时，可以是callback
//@params callback 完成后的回调
exports.analyseWithSqlite = function(path, tables, callback){
	if(typeof(tables) == 'function') callback = tables;

	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(path);

	var result = [];
	db.serialize(function() {
		//读取所有的表
		var sql = "SELECT sql FROM sqlite_master WHERE type = 'table' AND tbl_name <> 'sqlite_sequence'";
		if(tables instanceof  Array) tables = tables.join("','");
		if(tables) sql += _s.sprintf(" AND tbl_name in ('%s')", tables);

		db.each(sql, function(err, row){
			if(!err){
				result.push(exports.analyseWithSql(row.sql));
			}
		}, function(){
			callback(null, result);
		})
	});
	db.close();
}