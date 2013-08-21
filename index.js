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