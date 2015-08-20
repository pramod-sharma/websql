WebSQLDB = {
  defaultDBSize: (1024 * 1024),

  create: function(name, version, options = {}) {
            var description = options.description || name,
                dbSize      = options.dbSize || this.defaultDBSize,
                callback    = options.callback,
                db;

            if callback
              db = openDataBase(name, version, description, dbSize, callback);
            else
              db = openDataBase(name, version, description, dbSize);

            webSQLDB    = new WebSQLDB;
            webSQLDB.db = db;

            return webSQLDB;
          }
}

WebSQLDB.prototype = {
  createTable: function(name, options = {}) {
                 var table = this.executeSql(WebSQLTable.createSQL(name, options));

                 this.tables.push(table);
               },

  executeSql: function(sqlStatement) {
                this.db.transaction(function (transaction) {
                   transaction.executeSql(sqlStatement);
                });
              }
}

WebSQLTable = {
  createSQL: function(tableName, options = {}) {
            var dbFields = [];
            $.map(options, function(value, key) {
              dbFields.push("'" + key + value + "'");
            });

            return 'CREATE TABLE IF NOT EXISTS' + tableName + '(' + dbFields.join(', ') + ')';
          }
}


WebSQLTable.prototype = {

}