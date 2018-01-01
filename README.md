# TwitterBot
A twitter bot based on [twit rest API client](https://github.com/ttezel/twit) and runs on [nodejs](https://nodejs.org/en/)
If you are looking to keep the bot running as a server and want o minimize the downtime look for the [forever npm](https://www.npmjs.com/package/forever)


# How to use it
You just have to create a userprofile as username.js and make suer that the filename matches with the twiiter screen name the one without '@'. Once you have created the file in the folder you can make a instance of the bot as

``` javascript 
var bot = new TwitterBot("username");
```

Where **username** is the file you just created with twitter api keys. With this way you can make multiple bot instances with different profile with api keys. *This one not being tested so far*

Once the instance is created you have options to call the following
``` javascript
  console.info("QuoteBot is running.. \npress Ctrl+C to cancel");
  bot.tweet("I am going to be the most intelligent thing on twitter, bow to me");
  bot.search('#hastag since:2011-07-11',10);
  bot.listFollowers("BarakObama");
  bot.streamFilter("#twitter");
  bot.eventMessage();
  bot.directMessage();
  bot.searchAndReply("nodejs","Indeed nodejs is awwsum..");
  bot.AautomatedReply("nodejs");
```
The description for each of these function will be updated later, if you can't figure out on your own


*last Updated: 1 jan 2018*
