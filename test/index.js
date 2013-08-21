var expect = require('expect.js');
var analyzer = require('../index');

describe('测试用例', function(){
	var sql = 'CREATE TABLE if not exists todolist(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, timestamp FLOAT, done boolean DEFAULT false, todo TEXT)';
	var result = analyzer.analyseWithSql(sql);
	it('测试表名', function(){
		expect(result.tableName).to.equal('todolist');
	});

	it('测试返回字段的长度', function(){
		expect(result.fields).to.have.length(4);
	});

	it('测试主键', function(){
		expect(result.fields[0].unique).to.have.equal(true);
	});

	it('测试默认值', function(){
		expect(result.fields[2].defaultValue).to.have.equal('false');
	});
});