import { ConnectionOptions, Connection, createConnection, getConnection } from 'typeorm';
import 'reflect-metadata';

// Will be true on deployed functions
export const prod = process.env.NODE_ENV === 'production';

export const config: ConnectionOptions = {

    //default parameters for connection options
    name: 'fun',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'dev',
    password: 'password',
    database: 'JumpoutDBDevelopment',
    insecureAuth: true,
    
    //allow synchronisation of type orm and database so that tables and such are created on the fly
    synchronize: false, 
    logging: true,
    entities: [
       'lib/entities/**/*.js'
    ],

    // Production Mode
    // These will override the defaults provided above
    //
    ...(prod && {
        database: 'production',
        logging: false,

        synchronize: false,
        extra: {
            socketPath: '/cloudsql/pure-wall-267514:australia-southeast1:rjc-database' // change
        },
    })
 }



 export const connect = async () => {

    let connection: Connection;

    try {

        //check if an exisitng connection exists so that it can be shared
        connection = getConnection(config.name)
        //console.log(connection)
    } catch(err) {

        //if there isnt an existing shared connection, create one
        connection = await createConnection(config);
    }

    return connection;
}