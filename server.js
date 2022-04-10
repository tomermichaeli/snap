const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:3000',
    // baseURL: 'https://thenewsil.herokuapp.com',
    clientID: 'wsnDgRajqXM221ntDtDBRcBwY2lhWydv',
    issuerBaseURL: 'https://dev-gx29acwz.us.auth0.com'
};

app.set('view engine', 'ejs');

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/a', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});



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



app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });

const DocSchema = {
    headline: String,
    body: String,
    // time: {type: Date, default: Date.now}
    time: String,
    // tweet_id: Array
    tweet_id: String,
    second_tweet_id: String,
    quote: String,
    quote_headline: String,
    quote_body: String,
    quote_time: String
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





app.get("/", requiresAuth(), function (req, res) {
    // if(req.oidc.isAuthenticated()){
    //     console.log("in");
    //     Doc.find({}, function(err, updates){
    //         res.render('pages/index', {
    //             updateList: updates
    //         })
    //     }).sort({"_id": -1}).limit(4);
    // }
    // else{
    //     console.log('out');
    //     res.redirect('/login')
    // }


    // res.sendFile(__dirname + "/index.html");
    // res.send("hello!")



    Doc.find({}, function (err, updates) {
        res.render('pages/index', {
            updateList: updates
        })
    }).sort({ "time": -1 }).limit(30);



    // res.render('pages/index', {
    //     data: datasend
    // });
}
);

app.get("/lite", requiresAuth(), function (req, res) {
    res.render('pages/lite')
}
);

app.get("/quote", requiresAuth(), function (req, res) {
    console.log('requested: ', req.query.id)
    var spotlightdoc = null;
    // var spotlightdoc = Doc.findOne({_id: req.query.id})
    // var spotlightdoc = Doc.findOne({'_id': req.query.id}).lean()
    // console.log('id: ', spotlightdoc._id)


    console.log(req.query.id)

    if (req.query.id != null) {
        // find document with id:
        Doc.findOne({ '_id': req.query.id }).exec((err, quotedUpdate) => {
            if (!err) {
                // console.log('DOCUMENT   ', quotedUpdate)
                quotedUpdate.toObject({ getters: true });
                // console.log('doc _id:', quotedUpdate._id);
                quotedTweetID = quotedUpdate.tweet_id;
                quotedSecondTweetID = quotedUpdate.second_tweet_id;
                if (quotedSecondTweetID == null) {
                    quotedSecondTweetID = quotedTweetID;
                }
                console.log(quotedTweetID);
                console.log(quotedSecondTweetID);


                Doc.find({}, function (err, updates) {
                    res.render('pages/quote', {
                        updateList: updates,
                        quoted: quotedUpdate,
                        quotedid: quotedUpdate._id
                    })
                }).sort({ "time": -1 }).limit(10);


            }
        })
    }
}
);
app.get("/about", function (req, res) {
    res.render('pages/about');
}
);
app.get("/review", requiresAuth(), function (req, res) {
    console.log('requested: ', req.query.id)
    var spotlightdoc = null;
    console.log(req.query.id)

    if (req.query.id != null) {
        // find document with id:
        Doc.findOne({ '_id': req.query.id }).exec((err, doc) => {
            if (!err) {
                console.log('DOCUMENT   ', doc)
                doc.toObject({ getters: true });
                console.log('doc _id:', doc._id);
                spotlightdoc = doc;
                console.log('DOCUMENT   ', spotlightdoc)


                Doc.find({}, function (err, updates) {
                    res.render('pages/review', {
                        updateList: updates,
                        // spotlight: updates[{"_id": req.query.id}]
                        spotlight: spotlightdoc,
                        spotid: spotlightdoc._id
                    })
                }).sort({ "time": -1 }).limit(10);

            }

        })
    }
    else {
        Doc.findOne({}).sort({ "time": -1 }).exec((err, doc) => {
            if (!err) {
                console.log('DOCUMENT   ', doc)
                doc.toObject({ getters: true });
                console.log('doc _id:', doc._id);
                spotlightdoc = doc;
                console.log('DOCUMENT   ', spotlightdoc)


                Doc.find({}, function (err, updates) {
                    res.render('pages/review', {
                        updateList: updates,
                        // spotlight: updates[{"_id": req.query.id}]
                        spotlight: spotlightdoc,
                        spotid: spotlightdoc._id
                    })
                }).sort({ "time": -1 }).limit(10);


            }
        }
        )
    }
    //
    app.get("/review1", requiresAuth(), function (req, res) {
        console.log('requested: ', req.query.id)
        var spotlightdoc = null;
        console.log(req.query.id)

        if (req.query.id != null) {
            // find document with id:
            Doc.findOne({ '_id': req.query.id }).exec((err, doc) => {
                if (!err) {
                    console.log('DOCUMENT   ', doc)
                    doc.toObject({ getters: true });
                    console.log('doc _id:', doc._id);
                    spotlightdoc = doc;
                    console.log('DOCUMENT   ', spotlightdoc)


                    Doc.find({}, function (err, updates) {
                        res.render('pages/review', {
                            updateList: updates,
                            // spotlight: updates[{"_id": req.query.id}]
                            spotlight: spotlightdoc,
                            spotid: spotlightdoc._id
                        })
                    }).sort({ "time": -1 }).limit(10);

                }

            })
        }
        else {
            Doc.findOne({}).sort({ "time": -1 }).exec((err, doc) => {
                if (!err) {
                    console.log('DOCUMENT   ', doc)
                    doc.toObject({ getters: true });
                    console.log('doc _id:', doc._id);
                    spotlightdoc = doc;
                    console.log('DOCUMENT   ', spotlightdoc)


                    Doc.find({}, function (err, updates) {
                        res.render('pages/review1', {
                            updateList: updates,
                            // spotlight: updates[{"_id": req.query.id}]
                            spotlight: spotlightdoc,
                            spotid: spotlightdoc._id
                        })
                    }).sort({ "time": -1 }).limit(10);


                }
            }
            )
        }
    })
    //

    app.get("/create", requiresAuth(), function (req, res) {
        res.render('pages/create');
    }
    );

    app.get("/login", function (req, res) {
        res.render('pages/login');
    }
    );


    app.get("/archive", requiresAuth(), function (req, res) {
        Doc.find({}, function (err, updates) {
            res.render('pages/archive', {
                updateList: updates
            })
        }).sort({ "_id": -1 });
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




app.get("/styles.css", function (req, res) { res.sendFile(__dirname + "/styles.css") })
app.get("/otherstyles.css", function (req, res) { res.sendFile(__dirname + "/otherstyles.css") })

app.get("/updates", function (req, res) {
    var name = 'hello';
    res.render(__dirname + "/index.html", { name: name });
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


function addTweetLink(i, docID, tweetID) { //if i=0: main tweet, else: second tweet
    // Doc.findOneAndUpdate({'_id': docID}, { $set: { tweet_id: [tweetID] }}).exec((err, doc) => {
    if (i == 0) {
        Doc.findOneAndUpdate({ '_id': docID }, { $set: { tweet_id: tweetID } }).exec((err, doc) => {
            if (!err) {
                console.log('Added tweet id ', tweetID, ' to document: \n  ', doc);
                // doc.toObject({ getters: true });
                // console.log('doc _id:', doc._id);
                // spotlightdoc = doc;
                // console.log('DOCUMENT   ', spotlightdoc)
            }
            else {
                console.log(err)
            }
        })
    }
    else {
        Doc.findOneAndUpdate({ '_id': docID }, { $set: { second_tweet_id: tweetID } }).exec((err, doc) => {
            if (!err) {
                console.log('Added tweet id ', tweetID, ' to document: \n  ', doc);
                // doc.toObject({ getters: true });
                // console.log('doc _id:', doc._id);
                // spotlightdoc = doc;
                // console.log('DOCUMENT   ', spotlightdoc)
            }
            else {
                console.log(err)
            }
        })
    }

}

function addQuoteParameters(newUpdateID, quotedUpdateID) {
    Doc.findOne({ '_id': quotedUpdateID }).exec((err, doc) => {
        console.log("Quoted Update = ", doc);

        qHeadline = doc.headline;
        qBody = doc.body;
        qTime = doc.time;
        qTime = doc.time.slice(11, 16) + " • " + doc.time.slice(8, 10) + "/" + doc.time.slice(5, 7) + "/" + doc.time.slice(0, 4)
        console.log(qHeadline, qBody, qTime);
        Doc.findOneAndUpdate({ '_id': newUpdateID }, { $set: { quote_headline: qHeadline, quote_body: qBody, quote_time: qTime } }).exec((err, doc) => {
            if (!err) {
                console.log('Added quoted update parameters from ', quotedUpdateID, ' to document:  ', doc);
            }
            else {
                console.log(err)
            }
        })
    })
}



// create
app.post("/", function (req, res) {
    console.log(req.body.tweet);
    var toggleTweet = req.body.tweet;
    var toggleThread = req.body.thread;
    let newUpd = new Doc({
        headline: req.body.headline,
        body: req.body.body,
        time: req.body.time,
        tweet_id: "",
        second_tweet_id: ""
        // tweet_id: tweet.id_str
    });
    newUpd.save();
    if (toggleTweet) {
        client.post("statuses/update", { status: req.body.headline }, function (error, tweet, response) {
            if (error) {
                console.log(error)
            } else {
                console.log(tweet);
                console.log(newUpd._id);
                // addTweetLink(newUpd._id, tweet.id);
                addTweetLink(0, newUpd._id, tweet.id_str);
                console.log("REPLY TO : " + tweet.id)
                if (toggleThread) {
                    client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function (error2, secondtweet, response) {
                        if (error) {
                            console.log(error2)
                        } else {
                            console.log(secondtweet)
                            addTweetLink(1, newUpd._id, secondtweet.id_str);
                        }
                    });

                }
            }
        });
    }
    res.redirect("/");
})

app.post("/lite", function (req, res) {
    console.log(req.body.tweet);
    var toggleTweet = req.body.tweet;
    var toggleThread = req.body.thread;
    let newUpd = new Doc({
        headline: req.body.headline,
        body: req.body.body,
        time: req.body.time,
        tweet_id: "",
    });
    newUpd.save();
    if (toggleTweet) {
        client.post("statuses/update", { status: req.body.headline }, function (error, tweet, response) {
            if (error) {
                console.log(error)
            } else {
                console.log(tweet);
                console.log(newUpd._id);
                addTweetLink(0, newUpd._id, tweet.id_str);
                console.log("REPLY TO : " + tweet.id)
                if (toggleThread) {
                    client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function (error2, secondtweet, response) {
                        if (error) {
                            console.log(error2)
                        } else {
                            console.log(secondtweet)
                            addTweetLink(1, newUpd._id, secondtweet.id_str);
                        }
                    });
                }
            }
        });
    }
    res.redirect("/lite");
})


app.post("/abc", function (req, res) {
    var toggleTweet = req.body.tweet;
    var toggleThread = req.body.thread;
    let newUpd = new Doc({
        headline: req.body.headline,
        body: req.body.body,
        time: req.body.time,
        tweet_id: "",
    });
    console.log(newUpd);
    newUpd.save();
    if (toggleTweet) {
        client.post("statuses/update", { status: req.body.headline }, function (error, tweet, response) {
            if (error) {
                console.log(error)
            }
            else {
                addTweetLink(newUpd._id, tweet.id_str);
                if (toggleThread) {
                    client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function (error2, secondtweet, response) {
                        if (error) {
                            console.log(error2)
                        } else {
                            console.log(secondtweet)
                        }
                    });
                }
            }
        });
    }
    // console.log(req.body.headline);
    // console.log(req.body.body);
    // console.log(req.body.time);
    res.redirect("https://newsil.vercel.app/publish");
});




app.post("/quote", function (req, res) {

    Doc.findOne({ '_id': req.body.quotedid }).exec((err, doc) => {
        // console.log(req.body.quotedid);
        // console.log("found document", doc)
        if (!err) {
            var quoted_tweetID = doc.tweet_id;
            var quoted_secondTweetID = doc.second_tweet_id;
            // console.log("quoted_tweetid: ", quoted_tweetID);
            var toggleTweet = req.body.tweet;
            var toggleThread = req.body.thread;
            var toggleQuoteSecond = req.body.quotesecond;

            // console.log('----- quoted', quoted_tweetID)

            //1: save to database
            let newUpdWithQuote = new Doc({
                headline: req.body.headline,
                body: req.body.body,
                time: req.body.time,
                tweet_id: "",
                second_tweet_id: "",
                quote: req.body.quotedid,
                quote_headline: "",
                quote_body: "",
                quote_time: ""
                // tweet_id: tweet.id_str
            });
            newUpdWithQuote.save();

            if (toggleTweet) {
                if (toggleQuoteSecond) {
                    client.post("statuses/update", { status: req.body.headline, attachment_url: 'https://twitter.com/thenewsil/status/' + quoted_secondTweetID }, function (error, tweet, response) {
                        if (error) {
                            console.log(error)
                        } else {
                            // console.log(tweet);
                            // console.log(newUpdWithQuote._id);
                            addTweetLink(0, newUpdWithQuote._id, tweet.id);
                            addQuoteParameters(newUpdWithQuote._id, req.body.quotedid);

                            // console.log("REPLY TO : " + tweet.id)
                            if (toggleThread) {
                                client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function (error2, secondtweet, response) {
                                    if (error) {
                                        console.log(error2)
                                    } else {
                                        console.log(secondtweet)
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    client.post("statuses/update", { status: req.body.headline, attachment_url: 'https://twitter.com/thenewsil/status/' + quoted_tweetID }, function (error, tweet, response) {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log(tweet);
                            console.log(newUpdWithQuote._id);
                            addTweetLink(0, newUpdWithQuote._id, tweet.id);
                            addQuoteParameters(newUpdWithQuote._id, req.body.quotedid);

                            // console.log("REPLY TO : " + tweet.id)
                            if (toggleThread) {
                                client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function (error2, secondtweet, response) {
                                    if (error) {
                                        console.log(error2)
                                    } else {
                                        console.log(secondtweet)
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });

    res.redirect("/");






    // var quotedID = req.body.quotedid;
    // var toggleTweet = req.body.tweet;
    // var toggleThread = req.body.thread;
    // var quoted_tweetID = Doc.findOne({'_id': quotedID})['_id'];
    // console.log("searching...");
    // console.log("Quoted id--- ", quoted_tweetID);

    // let newUpdWithQuote = new Doc({
    //     headline: req.body.headline,
    //     body: req.body.body,
    //     time: req.body.time,
    //     tweet_id: "",
    //     quoted: quotedID
    //     // tweet_id: tweet.id_str
    // });
    // console.log('------- quoted tweet id: ', quoted_tweetID)




    // newUpdWithQuote.save();
    // client.post("statuses/update", { status: req.body.headline, quote_tweet_id: quotedID }, function(error, tweet, response) {
    //     if (error) {
    //         console.log(error)
    //     } else {
    //     console.log(tweet);
    //     console.log(newUpdWithQuote._id);
    //     addTweetLink(newUpdWithQuote._id, tweet.id);
    //     // console.log("REPLY TO : " + tweet.id)
    //     if(toggleThread){
    //         client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: tweet.id_str }, function(error2, secondtweet, response) {
    //             if (error) {
    //             console.log(error2)
    //             } else {
    //             console.log(secondtweet)
    //             }
    //         });
    //     }
    //     }
    // });
    // res.redirect("/");
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
app.post("/review", function (req, res) {
    newHeadline = req.body.headline;
    newBody = req.body.body;
    newTime = req.body.time;
    usedid = req.body.spotlightedid;
    toggleTweet = req.body.tweet;


    Doc.findOneAndUpdate({ '_id': usedid }, { $set: { headline: newHeadline, body: newBody, time: newTime } }).exec((err, doc) => {
        if (!err) {
            // console.log('DOCUMENT22   ', doc)
            if (toggleTweet && newBody != "") {

                client.post("statuses/update", { status: req.body.body, in_reply_to_status_id: doc.tweet_id }, function (error, secondtweet, response) {
                    if (error) {
                        console.log(error)
                    }
                    else {
                        // console.log(secondtweet)
                        addTweetLink(1, doc._id, secondtweet.id_str);
                    }
                });

            }
        }
    })






    res.redirect("/review?id=" + usedid);

    // res.redirect("/review");
})


// delete
app.post("/delete", function (req, res) {
    usedid = req.body.spotlightedid;
    console.log('delete this:   ', usedid)

    //if tweet toggle is on: delete tweet(s)
    // if(req.body.tweet){
    // 
    // }


    Doc.deleteOne({ '_id': usedid }, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Deleted.')
        }
    });
    // res.redirect("/review?id=" + usedid);
    res.redirect("/review");
})













// // create article
// app.post("/create", function(req, res){
//     // console.log('delete this:   ', usedid);
//     console.log('creating file...')


//     var fs = require('fs');
//     var logger = fs.createWriteStream('articles/new.txt', {
//     flags: 'a' // 'a' means appending (old data will be preserved)
//     });

//     logger.write('--- \n')
//     logger.write('topic: ', String(req.body.topic), '\n'); // append string to your file
//     logger.write('date: ', String(req.body.date), '\n'); // again
//     logger.write('hero_image: ', String(req.body.image), '\n'); // again
//     logger.write('and more'); // again

//     logger.end();


//     res.redirect("/");
// })


//create article 2
app.post("/create", function (req, res) {
    // console.log('delete this:   ', usedid);
    console.log('creating file...')


    var fs = require('fs');

    fs.writeFile('articles/' + String(req.body.title) + '.md', '---\ntopic: ' + String(req.body.topic) + '\ndate: ' + String(req.body.datetime) + '\nhero_image: ' + String(req.body.image) + '\ntitle: ' + String(req.body.title) + '\narticle_title: ' + String(req.body.heading) + '\nauthor: ' + String(req.body.author) + "\n\n---\n" + String(req.body.body), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    res.redirect("/");
})













var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on port " + port);
    // MongoClient.connect(uri, {useNewUrlParser: true}, {useUnifiedTopology: true}, (error, result) => {
    //     if (error) throw error;
    //     database = result.db("thenewsil")
    //     console.log("Connected to database ", database.toString())
    // })
})






