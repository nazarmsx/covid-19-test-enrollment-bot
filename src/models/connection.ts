import { MONGODB_URI } from "../util/secrets";
import { MongoClient } from "mongodb";

class ConnectionPull {
    private static connection: any;

    static setConnection(connection: any) {
        ConnectionPull.connection = connection
    };

    static async getConnection() {
        return ConnectionPull.connection ? ConnectionPull.connection : await getConnection();
    }
}

function getConnection() {

    return new Promise((resolve, reject) => {
        MongoClient.connect(MONGODB_URI, {useNewUrlParser: true}, function (err: any, client) {
            if (err) {
                return reject(err);
            }
            const db = client.db();
            ConnectionPull.setConnection(db);
            resolve(db);

        });
    });

}

export { getConnection, ConnectionPull };
