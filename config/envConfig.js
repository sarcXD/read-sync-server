const localConfig = {
    dbUrl: "postgres://readSyncDB:root@localhost:5432/readSyncDB",
    origin: "localhost:3000",
}

const devConfig = {
    dbUrl: "postgres://osiottkgizhbqw:8c6a71c79f689aced94bb3cede7d9547e39665735dcbcb0153d6f63900805ea8@ec2-52-17-1-206.eu-west-1.compute.amazonaws.com:5432/d8ns98jtfvod41",
    origin: "readsyncpdf.web.app",
}

const defaultConfig = devConfig;

exports.localConfig = localConfig;
exports.devConfig = devConfig;
exports.defaultConfig = defaultConfig;