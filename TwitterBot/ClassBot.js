// Twitter Bot ver 1.0



function TwitterBot(twitterName) {
    var twit = require("twit");
    var config = require("./" + twitterName + ".js");
    var T = new twit(config);
    var stream = T.stream("user");
    var dataResult = undefined;
    var botName = twitterName;
    var fs = require('fs');

    //callback
    function edrCallback(err, data, response) {
        if (err != undefined)
            console.warn(err.msg + err.stack);
        else
            console.info(response);
        dataResult = data;
    }

    //experimental - sleep
    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    // find reply from json  
    function FindQuote(word) {
        var data = fs.readFileSync('reply.json', 'utf8');
        var replies = JSON.parse(data);
        for (var key in replies) {
            if (key == word)
                if (replies.hasOwnProperty(key)) {
                    var element = replies[key];
                    var len = Math.floor(Math.random() * element.length);
                    //console.info(len + " " + element[len]);
                    return element[len];
                }
        }
    }

    return {

        // tweet for status update    
        tweet: function (tweetText) {
            var msg = {
                status: tweetText
            };
            T.post("statuses/update", msg, edrCallback);
        },

        // search tweets 
        search: function (queryText, resultCount) {
            var query = {
                q: queryText,
                count: resultCount
            };
            T.get("search/tweets", query, edrCallback);
        },

        // get list of followers
        listFollowers: function (userName) {
            var name = {
                screen_name: userName
            };
            T.get("followers/ids", name, edrCallback);
        },

        // retweet 
        reTweet: function (tweetId) {
            var twtId = {
                id: tweetId
            };
            T.post('statuses/retweet/:id', twtId, edrCallback);
        },

        // delete tweet
        deleteTweet: function (tweetId) {
            var twtId = {
                id: tweetId
            };
            T.post('statuses/destroy/:id', twtId, edrCallback);
        },

        getSuggestions: function (strSuggestion) {
            var suggestion = {
                slug: strSuggestion
            };
            T.get('users/suggestions/:slug', suggestion, edrCallback);
        },

        // post a tweet with media
        tweetMedia: function (pathToMedia, altText, tweetText) {
            var b64content = fs.readFileSync(pathToMedia, {
                encoding: 'base64'
            });

            // first we must post the media to Twitter
            T.post('media/upload', {
                media_data: b64content
            }, function (err, data, response) {
                // now we can assign alt text to the media, for use by screen readers and
                // other text-based presentations and interpreters
                var mediaIdStr = data.media_id_string
                var meta_params = {
                    media_id: mediaIdStr,
                    alt_text: {
                        text: altText
                    }
                }

                T.post('media/metadata/create', meta_params, function (err, data, response) {
                    if (!err) {
                        // now we can reference the media and post a tweet (media will attach to the tweet)
                        var params = {
                            status: tweetText,
                            media_ids: [mediaIdStr]
                        }

                        T.post('statuses/update', params, function (err, data, response) {
                            console.log(data)
                        })
                    }
                })
            });
        },

        // stream status
        streamStatuses: function () {
            var stream = T.stream("statuses/sample");
            stream.on("tweet",
                function (tweet) {
                    console.log(tweet.text);
                }
            );
        },

        // strream filter search
        streamFilter: function (filterText) {
            var stream = T.stream('statuses/filter', {
                track: filterText
            });
            stream.on('tweet', function (tweet) {
                console.log(tweet);
            });
        },

        eventMessage: function () {
            var stream = T.stream("user");
            stream.on("message", function (msg) {
                console.log(msg);
            });
        },

        // dirtect message with reply
        directMessage: function () {

            //get the ser stream
            var stream = T.stream('user');

            //handler
            function msgReplyHandler(eventMsg) {
                var msg = eventMsg.direct_message.text;
                var screenName = eventMsg.direct_message.sender.screen_name;
                var userId = eventMsg.direct_message.sender.id;
                var msgID = eventMsg.direct_message.id_str;

                // avoid replying to yourself
                if (screenName != botName) {
                    console.log('Msg "' + msg + '" From @' + screenName + "[MustReply]");

                    //reply
                    T.post("direct_messages/new", {
                            user_id: userId,
                            text: "I am doin good what about you :)",
                            screen_name: screenName
                        },
                        edrCallback);
                } else {
                    console.warn("[ReplyDenied]");
                }
            }

            //call
            stream.on('direct_message', msgReplyHandler);
        },

        searchAndReply: function (filterText, replyText) {
            var stream = T.stream('statuses/filter', {
                track: filterText
            });

            stream.on('tweet', function (tweet) {
                console.log(tweet);

                var nameID = tweet.id_str;
                var name = tweet.user.screen_name;
                var number = Date.now();
                var reply = replies[Math.floor(Math.random() * replies.length)];

                if (tweet.user.screen_name != this.botName && tweet.in_reply_to_status_id != null) {
                    //reply
                    var reply = {
                        in_reply_to_status_id_str: tweet.id_str,
                        status: '@' + tweet.user.screen_name + " " + replyText,
                        auto_populate_reply_metadata: true
                    };
                    T.post('statuses/update', reply, edrCallback);

                    var fs = require('fs');
                    var tw_str = JSON.stringify(tweet);
                    fs.appendFile('./message.txt', tw_str, function (err) {
                        if (err) throw err;
                        console.clear();
                        console.log('Saved!');
                    });
                }
            });
        },
        AautomatedReply: function (filterText) {
            var stream = T.stream('statuses/filter', {
                track: filterText
            });

            stream.on('tweet', function (tweet) {
                console.log(tweet);

                var nameID = tweet.id_str;
                var name = tweet.user.screen_name;
                var number = Date.now();
                //var reply = replies[Math.floor(Math.random() * replies.length)];

                if (tweet.user.screen_name != this.botName && tweet.in_reply_to_status_id != null) {
                    //search
                    var quote = FindQuote(filterText);
                    if (quote == undefined) {} else {
                        //reply
                        var reply = {
                            in_reply_to_status_id_str: tweet.id_str,
                            status: '@' + tweet.user.screen_name + " " + quote,
                            auto_populate_reply_metadata: true
                        };
                        T.post('statuses/update', reply,
                            function (err, data, response) {
                                if (err) {
                                    console.log("Error");
                                    console.log(err);
                                }
                                console.log(response);
                            });

                    }
                }
            });
        }
    } //return

}

//examples
console.clear();
var bot = new TwitterBot("username");
console.info("QuoteBot is running.. \npress Ctrl+C to cancel");
//bot.tweet("I am going to be the most intelligent thing on twitter, bow to me");
//bot.search('#hastag since:2011-07-11',10);
//bot.listFollowers("BarakObama");
//bot.streamFilter("#twitter");
//bot.eventMessage();
//bot.directMessage();
//bot.searchAndReply("nodejs","Indeed nodejs is awwsum..");
//bot.AautomatedReply("nodejs");