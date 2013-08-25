var expect = require('expect.js');
var analyzer = require('../index');
var path = require('path');
var fs = require('fs');

var sqlist = ['CREATE TABLE if not exists todolist(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, timestamp FLOAT, done boolean DEFAULT false, todo TEXT, category_id INTEGER)',
	'CREATE TABLE if not exists category(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT)'
	];

describe('测试sql语句', function(){
	var result = analyzer.analyseWithSql(sqlist[0]);

	it('测试表名', function(){
		expect(result.tableName).to.equal('todolist');
	});

	it('测试返回字段的长度', function(){
		expect(result.fields).to.have.length(5);
	});

	it('测试主键', function(){
		expect(result.fields[0].unique).to.have.equal(true);
	});

	it('测试默认值', function(){
		expect(result.fields[2].defaultValue).to.have.equal('false');
	});
});

describe('测试sqlit数据库', function(){
	var dbPath = path.join(__dirname, 'test.sqlite');
	//如果存在，则删除数据库
	if(fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

	//重新创建数据库
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(dbPath);

	db.serialize(function() {
		sqlist.forEach(function(sql){
			db.run(sql);
		})
	});
	db.close();

	it('测试sqlite数据', function(done){
		var result = analyzer.analyseWithSqlite(
			dbPath,
			['todolist', 'category'],
			function(err, result){
				console.log(JSON.stringify(result));
				done();
			});
	})
});