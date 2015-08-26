WebSQLDB = {
  defaultDBSize: (1024 * 1024),

  create: function(name, version, options = {}) {
            var description = options.description || name,
                dbSize      = options.dbSize || this.defaultDBSize,
                callback    = options.callback,
                db;

            if callback
              db = openDatabase(name, version, description, dbSize, callback);
            else
              db = openDatabase(name, version, description, dbSize);

            webSQLDB        = new WebSQLDB;
            webSQLDB.db     = db;
            webSQLDB.tables = {};

            return webSQLDB;
          }
}

WebSQLDB.prototype = {
  createTable: function(tableName, options = {}) {
                 this.executeSql(WebSQLTable.createSQL(tableName, options));
                 var table = WebSQLTable.init(tableName, this)

                 this.tables[tableName] = table;
               },

  executeSql: function(sqlStatement) {
                this.db.transaction(function(tx) {
                   tx.executeSql(sqlStatement);
                });
              },

  getTable: function(tableName) {
              return this.tables[tableName]
            }
}


WebSQLTable = {
  init:      function(tableName, db) {
               table      = new WebSQLTable;
               table.name = tableName;
               table.db   = db;
               return table
             },

  createSQL: function(tableName, options = {}) {
               var dbFields = [];

               $.map(options, function(value, key) {
                 dbFields.push("'" + key + ' ' + value + "'");
               });

               return 'CREATE TABLE IF NOT EXISTS' + tableName + '(' + dbFields.join(', ') + ')';
             }
}

WebSQLTable.prototype = {
  insert: function(data) {
    var dbFields = [],
        dbValues = [];

    $.map(data, function(value, key) {
      dbFields.push(key);
      dbValues.push(value);
    });

    var insertionSQLStatment = 'INSERT INTO ' + this.name +  ' (' + dbFields.join(', ') + ') VALUES (' + dbValues.join(', ') + ')';
    this.executeSql(insertionSQLStatment);
  },

  insertAll: function(dataValues) {
    var dbFields = [],
        dbValues = [];

    $.map(dataValues[0], function(value, key) {
      dbFields.push(key);
    });

    $.map(dataValues, function(value, index) {
      dbValues[index] = [];

      $.map(value, function(value, key) {
        dbValues[index].push(value)
      }
    });

    var dbInsertionValues    = $.map(dbValues, function(value, index) {
                                 return '( ' + value.join(', ') + ' )'
                               }),
        insertionSQLStatment = 'INSERT INTO ' + this.name +  ' (' + dbFields.join(', ') + ') VALUES ' + dbInsertionValues.join(', ');
    this.executeSql(insertionSQLStatment);
  },

  getQueryExecutor: function() {
                      return new WebSQLQuery(this.db, this)
                    },

  executeSql: function(sqlStatement) {
                this.db.transaction(function(tx) {
                   tx.executeSql(sqlStatement);
                });
              },
}



WebSQLQuery = function(db, table) {
                this.db    = db;
                this.table = table;
                this.conditions = {};
                this.selectFields = [];
              }

WebSQLQuery.prototype = {
  where: function(conditions) {
    this.conditions = conditions;
  },

  select: function(fields) {
    this.selectFields = fields;
  },

  execute: function() {
    var sqlStatement = generateQuery();
    this.table.executeSql(sqlStatement);
  },

  generateQuery: function() {
    var query = '',
        selectionFields = (this.selectFields == []) ? '*' : this.selectFields.join(', '),
        conditionsStatementArray = [],
        conditionsStatement = '';

    for (var key in this.conditions) {
      conditionsStatementArray.push(key + ' = ' + this.conditions[key]);
    }
    conditionsStatement = conditionsStatementArray.join(' AND ');

    query = 'Select ' + selectFields + ' FROM ' + this.table.name;
    if !(conditionsStatement == '')
      query += ' WHERE ' + conditionsStatement;
    return query;
  }
}