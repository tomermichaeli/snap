const express =  require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");


app.set('view engine', 'ejs');

//


//twitter
const {TwitterApi} = require('twitter-api-v2');

const twitterclient = new TwitterApi({
    appKey: 'xYgNiHCZ7MhPHKgGAB3Uc0NXA',
    appSecret: 'RFiAAqXZwBqPojcHd1gz3a38dKibQvgy6ig1MscOrF5nXH9jwN',
    accessToken: '3240451302-CGVdhIcgae6wx8OEj0tGrx1msGSCk1gVfslMSgA',
    accessSecret: 'F2LA4PwrgCQrjjhd505nTJ2yP4UwP782UbMNsql1IKAMd',
});




//

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
       let newUpd = new Doc({
        headline: req.body.headline,
        body: req.body.body,
        time: req.body.time
    });
    newUpd.save();
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
    console.log('delete this:   ', usedid);
    
    var fso = CreateObject("Scripting.FileSystemObject");  
    var s = fso.CreateTextFile("C:\test.txt", True);
    s.writeline("HI");
    s.writeline("Bye");
    s.writeline("-----------------------------");
    s.Close();


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






