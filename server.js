const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var jwt = require('jsonwebtoken');
var http = require("http");
var socketIO = require('socket.io');
const path = require("path");
const mongoose = require("mongoose");
var bcrypt = require("bcrypt-inzi");
var postmark = require("postmark");
const axios = require('axios')
const fs = require('fs')
const multer = require('multer')
var app = express();
var server = http.createServer(app);
var authRoutes = require("./routes/auth");
// var client = new postmark.Client("postmark token");

var {SERVER_SECRET} = require("./core/index")

var io = socketIO(server);
io.on("connection", (user) => {
    console.log("user connected");
})
var { userModel, tweetModel} = require("./dbrepo/models")


const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

const admin = require("firebase-admin");
// https://firebase.google.com/docs/storage/admin/start
var serviceAccount =  // create service account from here: https://console.firebase.google.com/u/0/project/delete-this-1329/settings/serviceaccounts/adminsdk
  {
    "type": "service_account",
    "project_id": "real-time-twitter-form",
    "private_key_id": "3a0c0b0271d4f5eee00d8c52051b58a1089658b5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLFQl8/zjNKlWa\nFt590cATA2MXR+2rZFf3ZPDf9ppX0UrVxZMo/8lcXi/w3uoT+gqKunWPAKa4itgf\nY5gwmz+XLWCCk4NDVV1OQGfpeFQGJUCq+mGdkC5orse3ROElbue1YIOky9BC9oxX\n2JrYllQUbipuZz/iyyzG9RYk7QFfP7yL+qd1qZdIFHZlPe/gvOZnTcvUqTop0D29\n3/6qJLYgavuGnt2YD/wcH1beonb3w4O+4ViG+2TsNyxYRMbpaC6k8DGL01ydQ460\n9sSLp/hGOjWyu17MvKhC3sTY82FrfYCotdZuRKzn61kdKFfDyxm5lF9JgqSC688n\nsjx0qBh3AgMBAAECggEADoY5e1TzloorEiNa6Uu+6CfgsTxl4qasEJe0ZIg0v111\nc+GMEK1ulNUa/6f/EiEFb6jomdWAQbLobyJGiF9qG7aqmtwlp1irx4TICcTJ2aCr\ncIRfcTnrynU0TRwM2t+vjGN+jCLpiQiCFBGmosvpmoZ13Bc1VKlBpr8bmit7OCPB\nscUB3IBOg1eG4uxTgUh4QTUYtIDKNS/TqjK5L/cg5BOzCs3G3cSXAet2QjdbNrDx\nKSghceG2IoASjspOnMKN76nedSBa8HUFCFY50/DtLflKcwDaYxI16eItmddArqSP\nKMz4gR07QazV5EsMPgfHOWWG4XyeNX2/MaC0cWg+qQKBgQDryyqnjyrfOvmbHfoO\nCXJZWynSS2d1DN+UJj/02LzmtbnMktbSgilvMfeU7hBriMbS27koqZ1vMwLQyYe8\nZXOT6ORzZn1QvGLJewJTSccjSMww4532ymzhlO/VcqSbXmMBAkH5YX77AckcdvTh\nFzcjHHvQGUr703bMFTpBwxLIWQKBgQDcfD9uBsO8cujClcQLoFRX9XuFlmSDYet0\nYnhydp+gtTQKLS9VWCUCJmZW01y5UF/t71RuM1N0SYvn520M5ZDH33UjZbZ13UHf\nDMpeemSnNT22zLH4mmf47BCEOK7aaTFy2/YU4duH2UstjwmbTMA+dlAnUuiUqYZA\nd/+eBTXNTwKBgQCMd9IHVBDUP4vnTqpiploKxXZaozUU1AB1f3vmXx/ZyTTQnEGB\n0qzgY0H85P2/MhJQFzls8e6qCheJTiWgpEeAO+Oso8fPywqGwNMXzwHlET8jeNXn\n6ZuHn3RpEgzhyg7s0O2ApQZCfkPSw0MKvQvJzPQteoPjFYzV82drOcz8sQKBgAtc\nd6RCwvlF7oqATx7OPypdIuVKT5mZhRl1LYGwbR9J1wmjNGowZY/LzMAymfeOlbLb\n/zzCdk1qsMPdX/gnKCO0dwPA7Pr70LYeoZrmsaMQEkMGHzGRO0RPXbaCeTgV7Y9e\nmDqRPM+uObp6QWN4O/u7+vtbwVJPvfQ6erh4ykHvAoGBANB+Kl2EdgTW20fyLtoj\nH7AhHRa2OeXJxYoxuuxQ1lmR02Hj3a8cXNXj8g5bzFZz9nTgQizExgiWN9NF11wv\n/EIKdqjvO89q5yrawKMwEZ09peBAWbUxnkIw/x3X3pEibxfMbU4pCW8acc+vHU2D\nyUWWgQKrRys+FQ7VyJtJu64M\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-h3rjp@real-time-twitter-form.iam.gserviceaccount.com",
    "client_id": "103350175435140084229",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-h3rjp%40real-time-twitter-form.iam.gserviceaccount.com"
  };
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://real-time-twitter-form-default-rtdb.firebaseio.com/"
});
const bucket = admin.storage().bucket("gs://real-time-twitter-form.appspot.com");



app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(morgan('dev'));
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));
app.use('/', authRoutes)





app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; 
        

            if (diff > 30000000) { // expire after 5 min (in milis)
                res.status(401).send("token expired")
                console.log(res)
                alert(res)
            } else { 
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    phone: decodedData.phone,
                    gender: decodedData.gender,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

//PROFILE

app.get("/profile", (req, res, next) => {
    console.log(req.body);

    userModel.findById(req.body.jToken.id, 'name email phone gender profilePic createdOn', function (err, doc) {
        if (!err) {
            res.send({
                profile: doc
            })

        } else {
            res.send({
                message: "Server Error",
                status: 500
            });
        }
    });
})

//POST

app.post("/tweet", (req, res, next) => {
   

    if (!req.body.jToken.id || !req.body.tweet) {
        res.send({
            status: 401,
            message: "Please write tweet"
        })
    }
    userModel.findById(req.body.jToken.id, 'name tweet profilePic', function (err, user) {
        if (!err) {
            tweetModel.create({
                "username": user.name,
                "email": req.body.email,
                "tweet": req.body.tweet,
                "profilePic": user.profilePic
            }, function (err, data) {
                if (err) {
                    res.send({
                        message: "Tweet DB ERROR",
                        status: 404
                    });
                }
                else if (data) {
                    console.log("data checking Tweeter: ", data);
                    res.send({
                        message: "Your Tweet Send",
                        status: 200,
                        tweet: data,
                       
                    });
                    
                    
                    io.emit("NEW_POST", data);
                    
                
                    console.log("server checking code tweet ", data.tweet)
                } else {
                    res.send({
                        message: "Tweets posting error try again later",
                        status: 500
                    });
                }
            });

        } else {
            res.send({
                message: "User Not Found",
                status: 404
            });
        }
    });


});

app.get("/userTweets", (req, res) => {
    console.log("my tweets user", req.body);
    
    
    tweetModel.find({email: req.body.jToken.email}, (err, data) => {
        if (!err) {
            console.log("user email", req.body.jToken.email)
        
        console.log("current user tweets==>", data );
        res.send({
          tweet: data,
        });
      } else {
        console.log("error: ", err);
        res.status(500).send({});
      }
    });
  });

app.get("/tweet-get", (req, res, next) => {
    tweetModel.find({}, function (err, data) {
        if (err) {
            res.send({
                message: "Error :" + err,
                status: 404
            });
        } else if (data) {
            res.send({
                tweet: data,
                status: 200
            });
        } else {
            res.send({
                message: "User Not Found"
            });
        }
    });
});


//PROFILE PICTURE 


app.post("/upload", upload.any(), (req, res, next) => {
    console.log("req.body: ", JSON.parse(req.body.myDetails));
    let userEmail = JSON.parse(req.body.myDetails)
    // console.log("req.email: ", req.body.myDetails);
    console.log("req.files: ", req.files);
  
    console.log("uploaded file name: ", req.files[0].originalname);
    console.log("file type: ", req.files[0].mimetype);
    console.log("file name in server folders: ", req.files[0].filename);
    console.log("file path in server folders: ", req.files[0].path);
  
    bucket.upload(
      req.files[0].path,
      // {
      //     destination: `${new Date().getTime()}-new-image.png`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
      // },
      function (err, file, apiResponse) {
        if (!err) {
          // console.log("api resp: ", apiResponse);
  
          // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
          file
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then((urlData, err) => {
              if (!err) {
                console.log("public downloadable url: ", urlData[0]); // this is public downloadable url
                userModel.findOne(
                  { email: userEmail.email },
                  (err, data) => {
                    if (!err) {
                      console.log("user data ====>", data);
                      tweetModel.updateMany({email:userEmail.email},{profilePic:urlData[0]},(err,tweet)=>{
                        if(!err){
                          console.log("tweet model updated");
                        }
                      })
                    } else {
                      console.log("user not found");
                    }
                        data.update(
                      { profilePic: urlData[0] },
                      
                      (err, updatedUrl) => {
                        if (!err) {
                          res.status(200).send({
                            message: "profile picture updated succesfully",
                            url: urlData[0],
                          });
                        } else {
                          res.status(500).send({
                            message: "an error occured",
                          });
                        }
                      }
                    );
                    
                    
                    
                  }
                );
  
                // // delete file from folder before sending response back to client (optional but recommended)
                // // optional because it is gonna delete automatically sooner or later
                // // recommended because you may run out of space if you dont do so, and if your files are sensitive it is simply not safe in server folder
                // try {
                //     fs.unlinkSync(req.files[0].path)
                //     //file removed
                // } catch (err) {
                //     console.error(err)
                // }
                // res.send({
                //   message: "ok",
                //   url: urlData[0],
                // });
              }
            });
        } else {
          console.log("err: ", err);
          res.status(500).send();
        }
      }
    );
  });

 
//SERVER

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
