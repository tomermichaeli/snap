const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: `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` });


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    // baseURL: 'http://localhost:3000',
    baseURL: 'https://thenewsil.herokuapp.com',
    clientID: 'wsnDgRajqXM221ntDtDBRcBwY2lhWydv',
    issuerBaseURL: 'https://dev-gx29acwz.us.auth0.com'
};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));



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
// TWITTER



// MongoDB
// const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://test:test@cluster0.anx9a.mongodb.net/thenewsil?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });

const DocSchema = {
    headline: String,
    body: String,
    time: String,
    tweet_id: String,
    second_tweet_id: String,
    quote: String,
    quote_headline: String,
    quote_body: String,
    quote_time: String
}

const Doc = mongoose.model("updates", DocSchema); //(collection, data schema)
// MongoDB

////////////////////////////////////////////////////////////////////////////////////////////////////
/* functions */

function addTweetLink(i, docID, tweetID) { //if i=0: main tweet, else: second tweet
    if (i == 0) {
        Doc.findOneAndUpdate({ '_id': docID }, { $set: { tweet_id: tweetID } }).exec((err, doc) => {
            if (!err) {
                console.log('Added tweet id ', tweetID, ' to document: \n  ', doc._id);
            }
            else {
                console.log(err)
            }
        })
    }
    else {
        Doc.findOneAndUpdate({ '_id': docID }, { $set: { second_tweet_id: tweetID } }).exec((err, doc) => {
            if (!err) {
                console.log('Added tweet id ', tweetID, ' to document: \n  ', doc._id);
            }
            else {
                console.log(err)
            }
        })
    }

}


function addQuoteParameters(newUpdateID, quotedUpdateID) {
    console.log(newUpdateID);
    Doc.findOne({ '_id': quotedUpdateID }).exec((err, doc) => {
        console.log("Quoted Update = ", doc);
        qHeadline = doc.headline;
        qBody = doc.body;
        qTime = doc.time;
        qTime = doc.time.slice(11, 16) + " • " + doc.time.slice(8, 10) + "/" + doc.time.slice(5, 7) + "/" + doc.time.slice(0, 4)
        console.log(qHeadline, qBody, qTime);
        Doc.findOneAndUpdate({ '_id': newUpdateID },
            { $set: { quote_headline: qHeadline, quote_body: qBody, quote_time: qTime } }).exec((err, doc) => {
                console.log(newUpdateID);
                console.log(doc);
                if (!err) {
                    console.log('Added quoted update parameters from ', quotedUpdateID, ' to document:  ', doc);
                }
                else {
                    console.log(err)
                }
            })
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////


/* GET is logged in? */

// req.isAuthenticated is provided from the auth router
app.get('/a', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});



/* GET stylesheets */
app.get("/styles.css", function (req, res) { res.sendFile(__dirname + "/styles.css") });
app.get("/otherstyles.css", function (req, res) { res.sendFile(__dirname + "/otherstyles.css") });



/* index GET,POST */

app.get("/", requiresAuth(), function (req, res) {
    Doc.find({}, function (err, updates) {
        res.render('pages/index', {
            updateList: updates
        })
    }).sort({ "time": -1 }).limit(30);
});

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
                    client.post("statuses/update",
                        { status: req.body.body, in_reply_to_status_id: tweet.id_str },
                        function (error2, secondtweet, response) {
                            if (error) {
                                console.log(error2)
                            } else {
                                console.log(secondtweet)
                                addTweetLink(1, newUpd._id, secondtweet.id_str);
                                console.log("response:" + response);
                            }
                        });

                }
            }
        });
    }
    res.redirect("/");
});



/* lite GET,POST */

app.get("/lite", requiresAuth(), function (req, res) {
    res.render('pages/lite')
});

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
});



/* review GET,POST */

app.get("/review", requiresAuth(), function (req, res) {
    console.log('requested: ', req.query.id)
    var spotlightdoc = null;
    console.log(req.query.id)

    if (req.query.id != null) {
        // find document with id:
        Doc.findOne({ '_id': req.query.id }).exec((err, doc) => {
            if (!err) {
                // console.log('DOCUMENT   ', doc)
                doc.toObject({ getters: true });
                console.log('doc _id:', doc._id);
                spotlightdoc = doc;
                // console.log('DOCUMENT   ', spotlightdoc)


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
                // console.log('DOCUMENT   ', doc)
                doc.toObject({ getters: true });
                console.log('doc _id:', doc._id);
                spotlightdoc = doc;
                // console.log('DOCUMENT   ', spotlightdoc)


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
});

app.post("/review", function (req, res) {
    newHeadline = req.body.headline;
    newBody = req.body.body;
    newTime = req.body.time;
    usedid = req.body.spotlightedid;
    toggleTweet = req.body.tweet;


    Doc.findOneAndUpdate({ '_id': usedid }, { $set: { headline: newHeadline, body: newBody, time: newTime } }).exec((err, doc) => {
        if (!err) {
            if (toggleTweet && newBody != "") {
                console.log("Reply to tweet: " + doc.tweet_id);
                client.post("statuses/update", { in_reply_to_status_id: doc.tweet_id, status: req.body.body }, function (error, secondtweet, response) {
                    if (error) {
                        console.log(error)
                    }
                    else {
                        addTweetLink(1, doc._id, secondtweet.id_str);
                    }
                });
            }
        }
    });
    res.redirect("/review?id=" + usedid);
});



/* quote GET,POST */

app.get("/quote", requiresAuth(), function (req, res) {
    console.log('requested: ', req.query.id)
    var spotlightdoc = null;

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
        });
    }
    else {
        console.log("Quote id empty, redirecting to home.")
        res.redirect("/");
    }
});

app.post("/quote", function (req, res) {
    Doc.findOne({ '_id': req.body.quotedid }).exec((err, doc) => {
        console.log(req.body.quotedid);
        // console.log("found document", doc)
        if (!err) {
            var quoted_tweetID = doc.tweet_id;
            var quoted_secondTweetID = doc.second_tweet_id;
            // console.log("quoted_tweetid: ", quoted_tweetID);
            var toggleTweet = req.body.tweet;
            var toggleThread = req.body.thread;
            var toggleQuoteSecond = req.body.quotesecond;

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

            addQuoteParameters(newUpdWithQuote._id, req.body.quotedid);

            if (toggleTweet) {
                if (toggleQuoteSecond && quoted_secondTweetID != null) {
                    client.post("statuses/update", { status: req.body.headline, attachment_url: 'https://twitter.com/thenewsil/status/' + quoted_secondTweetID }, function (error, tweet, response) {
                        if (error) {
                            console.log(error)
                        } else {
                            addTweetLink(0, newUpdWithQuote._id, tweet.id_str);
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
                            console.log("****Add tweet link****");
                            addTweetLink(0, newUpdWithQuote._id, tweet.id_str);
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
});



/* create GET,POST */

app.get("/create", requiresAuth(), function (req, res) {
    res.render('pages/create');
});

app.post("/create", function (req, res) {
    console.log('creating file...')


    // var fs = require('fs');
    var filecontent = '---\ntopic: ' + String(req.body.topic) + '\ndate: ' + String(req.body.datetime) + '\nhero_image: ' + String(req.body.image) + '\ntitle: ' + String(req.body.title) + '\narticle_title: ' + String(req.body.heading) + '\nauthor: ' + String(req.body.author) + "\n\n---\n" + String(req.body.body);

    // fs.writeFile('articles/' + String(req.body.title) + '.md', '---\ntopic: ' + String(req.body.topic) + '\ndate: ' + String(req.body.datetime) + '\nhero_image: ' + String(req.body.image) + '\ntitle: ' + String(req.body.title) + '\narticle_title: ' + String(req.body.heading) + '\nauthor: ' + String(req.body.author) + "\n\n---\n" + String(req.body.body), function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log("The file was saved!");
    // });

    const encoded = Buffer.from(filecontent, 'utf8').toString('base64');

    octokit
        .request("GET /")
        .then(console.log, console.log);

    octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: 'tomermichaeli',
        repo: 'newsil',
        path: 'content/posts/' + String(req.body.title) + '.md',
        message: 'Update from SNAP',
        committer: {
            name: 'Tomer',
            email: 'michaelitomer@gmail.com'
        },
        // content: 'bXkgbmV3IGZpbGUgY29udGVudHM='
        content: encoded
    });
    console.log("Check GitHub - newsil/content/posts");

    res.redirect("/");
});



/* archive GET */

app.get("/archive", requiresAuth(), function (req, res) {
    Doc.find({}, function (err, updates) {
        res.render('pages/archive', {
            updateList: updates
        })
    }).sort({ "_id": -1 });
});



/* delete POST*/

app.post("/delete", function (req, res) {
    usedid = req.body.spotlightedid;
    console.log('delete this:   ', usedid);

    toggleTweet = req.body.tweet;

    // if(toggleTweet){
    //     Doc.findOne({ '_id': usedid }).exec((err, doc) => {
    //         if(!err){
    //             deleteTweetId = doc.tweet_id;
    //             console.log("deleteTweetId:" + deleteTweetId);
    //             client.post('statuses/destroy/:id', {id: 1162399231346430000}, function (error) {
    //                 if (error) {
    //                     console.log(error)
    //                 }
    //                 else {
    //                     console.log("Successfully deleted tweet.");
    //                 }
    //             });
    //         }
    //     });
    // }


    Doc.deleteOne({ '_id': usedid }, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Deleted.')
        }
    });
    res.redirect("/review");
});



/* unquote POST*/

app.post("/unquote", function (req, res) {
    usedid = req.body.spotlightedid;
    console.log('unquote this:   ', usedid)
    Doc.findOneAndUpdate({ '_id': usedid },);


    Doc.findOneAndUpdate({ '_id': usedid }, { $set: { quote: '', quote_headline: '', quote_body: '', quote_time: '' } }).exec((err, doc) => {
        if (!err) {
            console.log("UnQuoted document: \n" + doc);
        }
    });
    res.redirect("/");
});



/* GET other pages */

app.get("/about", function (req, res) {
    res.render('pages/about');
});


app.get("/login", function (req, res) {
    res.render('pages/login');
});


app.get("/updates", function (req, res) {
    var name = 'hello';
    res.render(__dirname + "/index.html", { name: name });
    // res.send("hello!")
});



/* publish from main website POST */

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
    res.redirect("https://newsil.vercel.app/publish");
});



////////////////////////////////////////////////////////////////////////////////////////////////////
// RUN Server

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on port " + port);
    // MongoClient.connect(uri, {useNewUrlParser: true}, {useUnifiedTopology: true}, (error, result) => {
    //     if (error) throw error;
    //     database = result.db("thenewsil")
    //     console.log("Connected to database ", database.toString())
    // })
})











