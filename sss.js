function start() {
    const o = {
        sql: {
            userName: 'max',
            password: 'Bobby123___',
            server: 'maxentreprises.database.windows.net',
            options: {
                database: 'maxentreprises',
                encrypt: true
            }
        },
        mongo: "mongodb://localhost:27017/",
        mysql: {
            host: "verbier1.mysql.db.hostpoint.ch",
            database: "verbier1_",
            user: "verbier1_mcmax",
            password: "GnrbgWFE"
        }
    };
    return o;
};

exports.start = start;
