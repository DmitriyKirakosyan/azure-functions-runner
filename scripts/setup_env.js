const readline = require('readline');
const Promise = require('bluebird');
const fs = require('fs-extra');
const os = require('os');

let i = readline.createInterface(process.stdin, process.stdout)

let question = Promise.promisify((question, callback) => {
    i.question(question, callback.bind(null, null))
})

let dbHostPromise = question('Documentdb host url (https://localhost:8081) : ')
let dbAuthKeyPromise = dbHostPromise.then(() => {
    return question('DocumentDB master key (local) : ')
})
let allowUnauthConnection = dbAuthKeyPromise.then(() => {
    return question('Allow unauthorized? (y/n) : ')
})

Promise.join(dbHostPromise, dbAuthKeyPromise, allowUnauthConnection, (dbHost, dbAuthKey, allowUnauth) => {

    i.close()

    dbHost = dbHost || 'https://localhost:8081'
    dbAuthKey = dbAuthKey || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='

    fs.writeFile('.env',
        'DB_HOST=' + dbHost + os.EOL +
        'DB_AUTHKEY=' + dbAuthKey + os.EOL +
        'NODE_TLS_REJECT_UNAUTHORIZED=' + (allowUnauth.toLowerCase() == 'y' || allowUnauth.toLowerCase() == 'yes' ? '0' : '1')
    )

})