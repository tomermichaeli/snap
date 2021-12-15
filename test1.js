

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const {MongoClient} = require('mongodb');

    const uri = "mongodb+srv://test:test@cluster0.anx9a.mongodb.net/thenewsil?retryWrites=true&w=majority";
 

    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        // await  listDatabases(client);
        // await  getCollection(client);
        // findOneListingByName(client, 0);
        getUpdateList(client, "thenewsil", "updates")

 
    } catch (e) {
        console.error(e);
    } finally {
        // await client.close();
    }

}

main().catch(console.error);


async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function getCollection(client){
    collection = await client.db("thenewsil").collection("updates");
    console.log(collection);
    console.log(collection.findOne({ "__v": 0 }))
}

async function findOneListingByName(client, nameOfListing) {
    // const result = await client.db("thenewsil").collection("updates").findOne({ __v: nameOfListing });
    const result = await client.db("thenewsil").collection("updates").findOne({"__v":0});

    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}


async function getUpdateList(client, databaseName, collectionName){
    const cursor = await client.db(databaseName).collection(collectionName).find({});
    for await (const document of cursor){
        // console.log(document["headline"])
        // console.log(document["__v"])
        console.log("head: " + document["headline"] + "\n body: " + document["body"] + "\n time: " + document["time"])
    }
}


