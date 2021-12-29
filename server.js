const express =  require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");


app.set('view engine', 'ejs');

//


// TWITTER
const Twitter = require("twitter")
const dotenv = require("dotenv")
const fs = require("fs")

dotenv.config()

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

// Tweet with Text
// client.post("statuses/update", { status: "@orielamram test @ "+Date.now() }, function(error, tweet, response) {
//   if (error) {
//     console.log(error)
//   } else {
//     console.log(tweet)
//   }
// })


// TWITTER



const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://test:test@cluster0.anx9a.mongodb.net/thenewsil?retryWrites=true&w=majority";



app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(uri, {useNewUrlParser: true}, {useUnifiedTopology: true});

const DocSchema = {
    headline: String,
    body: String,
    // time: {type: Date, default: Date.now}
    time: String
}

const Doc = mongoose.model("updates", DocSchema); //(collection, data schema)

// var test1 = Doc.findOne({'body': 'b'});
// console.log(test1.toObject());

// Doc.findOne({'body': 'b'}).exec((err, doc) => {
//     if (!err) {
//        doc.toObject({ getters: true })
//        console.log('doc _id:', doc._id)
//     }
//  })





app.get("/", function(req, res)
    {
        // res.sendFile(__dirname + "/index.html");
        // res.send("hello!")

        Doc.find({}, function(err, updates){
            res.render('pages/index', {
                updateList: updates
            })
        }).sort({"_id": -1}).limit(4);

        // res.render('pages/index', {
        //     data: datasend
        // });
    }
);
app.get("/about", function(req, res)
    {
        res.render('pages/about');
    }
);
app.get("/review", function(req, res)
    {
        console.log('requested: ', req.query.id)
        var spotlightdoc = null;
        // var spotlightdoc = Doc.findOne({_id: req.query.id})
        // var spotlightdoc = Doc.findOne({'_id': req.query.id}).lean()
        // console.log('id: ', spotlightdoc._id)
        

        console.log(req.query.id)

        if(req.query.id != null){
            // find document with id:
            Doc.findOne({'_id': req.query.id}).exec((err, doc) => {
                if (!err) {
                    console.log('DOCUMENT   ', doc)
                    doc.toObject({ getters: true });
                    console.log('doc _id:', doc._id);
                    spotlightdoc = doc;
                    console.log('DOCUMENT   ', spotlightdoc)


                    Doc.find({}, function(err, updates){
                        res.render('pages/review', {
                            updateList: updates,
                            // spotlight: updates[{"_id": req.query.id}]
                            spotlight: spotlightdoc,
                            spotid: spotlightdoc._id
                        })
                    }).sort({"_id": -1}).limit(10);


                }
                // else{
                //     spotlightdoc = Doc.findOne({});
                // }
             })
        }
        else{
            Doc.findOne({}).exec((err, doc) => {
                if (!err) {
                    console.log('DOCUMENT   ', doc)
                    doc.toObject({ getters: true });
                    console.log('doc _id:', doc._id);
                    spotlightdoc = doc;
                    console.log('DOCUMENT   ', spotlightdoc)


                    Doc.find({}, function(err, updates){
                        res.render('pages/review', {
                            updateList: updates,
                            // spotlight: updates[{"_id": req.query.id}]
                            spotlight: spotlightdoc,
                            spotid: spotlightdoc._id
                        })
                    }).sort({"_id": -1}).limit(10);


                }
            }
        )}

app.get("/create", function(req, res)
    {
        res.render('pages/create');
    }
);

app.get("/login", function(req, res)
    {
        res.render('pages/login');
    }
);


        //     console.log("DOCUMENT AGAIN   ", spotlightdoc)
        //     if(spotlightdoc != null){
        //         console.log("not null")
        //         // return page with document
        //         Doc.find({}, function(err, updates){
        //             res.render('pages/review', {
        //                 updateList: updates,
        //                 // spotlight: updates[{"_id": req.query.id}]
        //                 spotlight: spotlightdoc,
        //                 spotid: spotlightdoc._id
        //             })
        //         }).sort({"_id": -1}).limit(10);
        //     }
        //     else{
        //         Doc.find({}, function(err, updates){
        //             res.render('pages/review', {
        //                 updateList: updates,
        //                 spotlight: updates[0],
        //                 spotid: updates[0]._id
        //             })
        //         }).sort({"_id": -1}).limit(10);
        //     } 








        // }

        // else{
        //     Doc.find({}, function(err, updates){
        //         res.render('pages/review', {
        //             updateList: updates,
        //             spotlight: updates[0],
        //             spotid: updates[0]._id
        //         })
        //     }).sort({"_id": -1}).limit(10);
        // } 
    }
);




app.get("/styles.css", function(req, res){res.sendFile(__dirname + "/styles.css")})
app.get("/onlinestyle.css", function(req, res){res.sendFile(__dirname + "/onlinestyle.css")})

app.get("/updates", function(req, res)
    {
        var name = 'hello';
        res.render(__dirname + "/index.html", {name:name});
        // res.send("hello!")
    }
);


// app.get("/updates", function(req, res, next) {
      
//     userModel.find((err, docs) => {
//         if (!err) {
//             res.render("list", {
//                 data: docs
//             });
//         } else {
//             console.log('Failed to retrieve the Course List: ' + err);
//         }
//     });
// });




// app.get("/", function(req, res){res.send("express is working")})
// app.get("/hi", function(req, res){res.send(" working")})


// let table = app.createElement('table');
// let row = table.insertRow();
// let cell = row.insertCell();
// cell.textContent = "New Cell!";
// app.body.old.appendChild(table);




// create
app.post("/", function(req, res){
    console.log(req.body.tweet);
    var toggleTweet = req.body.tweet;
    let newUpd = new Doc({
        headline: req.body.headline,
        body: req.body.body,
        time: req.body.time,
    });
    newUpd.save();
    if(toggleTweet){
        client.post("statuses/update", { status: req.body.headline }, function(error, tweet, response) {
            if (error) {
            console.log(error)
            } else {
            console.log(tweet)
            }
        });
    }
    res.redirect("/");
})

// app.post("/review", function(req, res){
//     newHeadline = req.body.headline;
//     newBody = req.body.body;
//     newTime = req.body.time;
//     usedid = req.body.spotlightedid;
//     console.log('spotlighted and updated: ', usedid);


//     console.log('i, h, b, t: ', usedid, newHeadline, newBody, newTime)
//     console.log("Update this: ", Doc.findOne({'_id': usedid}));
//     Doc.findOneAndUpdate({'_id': req.body.spotlightedid}, { $set: { headline: newHeadline, body: newBody, time: newTime }})


// //     let newUpd = new Doc({
// //      headline: req.body.headline,
// //      body: req.body.body,
// //      time: req.body.time
// //  });
// //  newUpd.save();



//     res.redirect("/review?id=" + usedid);

//     // res.redirect("/review");
// })












//update - attempt 2
app.post("/review", function(req, res){
    newHeadline = req.body.headline;
    newBody = req.body.body;
    newTime = req.body.time;
    usedid = req.body.spotlightedid;
    Doc.findOneAndUpdate({'_id': usedid}, { $set: { headline: newHeadline, body: newBody, time: newTime }}).exec((err, doc) => {
        if (!err) {
            console.log('DOCUMENT22   ', doc)
            // doc.toObject({ getters: true });
            // console.log('doc _id:', doc._id);
            // spotlightdoc = doc;
            // console.log('DOCUMENT   ', spotlightdoc)
        }
    })



    
    res.redirect("/review?id=" + usedid);

    // res.redirect("/review");
})


// delete
app.post("/delete", function(req, res){
    usedid = req.body.spotlightedid;
    console.log('delete this:   ', usedid)
    Doc.deleteOne({'_id': usedid}, function (err) {
        if (err) {
            console.log(err);
        }
        else{
            console.log('Deleted.')
        }
    });
    // res.redirect("/review?id=" + usedid);
    res.redirect("/review");
})













// create article
app.post("/create", function(req, res){
    // console.log('delete this:   ', usedid);
    console.log('creating file...')


    var fs = require('fs');
    var logger = fs.createWriteStream('articles/test.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
    });

    logger.write('--- \n')
    logger.write('topic: ', String(req.body.topic), '\n'); // append string to your file
    logger.write('date: ', String(req.body.date), '\n'); // again
    logger.write('hero_image: ', String(req.body.image), '\n'); // again
    logger.write('and more'); // again

    logger.end();


    res.redirect("/");
})

















app.listen(3000, () => {
    console.log("Server is running on port 3000");
    // MongoClient.connect(uri, {useNewUrlParser: true}, {useUnifiedTopology: true}, (error, result) => {
    //     if (error) throw error;
    //     database = result.db("thenewsil")
    //     console.log("Connected to database ", database.toString())
    // })
})






