const localConfig = {
    dbUrl: "postgres://readSyncDB:root@localhost:5432/readSyncDB",
}

const devConfig = {
    dbUrl: {
        connectionString: "postgres://osiottkgizhbqw:8c6a71c79f689aced94bb3cede7d9547e39665735dcbcb0153d6f63900805ea8@ec2-52-17-1-206.eu-west-1.compute.amazonaws.com:5432/d8ns98jtfvod41",
        ssl: {rejectUnauthorized: false},
    }
}

const whitelistOrigins = ['https://readsyncpdf.web.app','http://localhost:3000'];
const defaultConfig = localConfig;

exports.localConfig = localConfig;
exports.devConfig = devConfig;
exports.defaultConfig = defaultConfig;
exports.whitelist = whitelistOrigins;