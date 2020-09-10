var express = require('express')
var bodyParser = require('body-parser')
const { Socket } = require('dgram')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var dbUrl = 'mongodb+srv://durga_db:Y5xzIcr3Yy1esosC@cluster0.gkq2r.mongodb.net/learning?retryWrites=true&w=majority'

var connection = mongoose.createConnection(dbUrl);
autoIncrement.initialize(connection);

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String
});

userSchema.plugin(autoIncrement.plugin, 'User');
var User = connection.model('User', userSchema)

app.get("/api/users", (req, res) => {
    User.find({}, (err, user) => {
        res.send(user)
    })
});

app.post("/api/users", async (req, res) => {
    try {
        console.log("Message Body", req.body)
        var  user = new User(req.body)

        //Async Await
    
        var saveMessage = await user.save()
        console.log("Message Saved")
        io.emit("message", req.body)
        
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    }
});

app.get("/api/users/:id", (req, res) => {
    User.findById(req.params.id, (err, user) => {
        res.send(user)
    })
});

app.put("/api/users/:id", (req, res) => {
    User.findOneAndUpdate({ _id: req.params.id}, 
        {
            firstname: req.body.firstname, 
            lastname: req.body.lastname, 
            email: req.body.email
        }, (err, result) => {
            if(err) {
                console.log("Error in update: "+ err)
            } else {
                console.log(result);
            }
        }
        );
});

app.delete("/api/users/:id", (req, res) => {
    User.findOneAndDelete
    ({ _id: req.params.id},  (err, result) => {
        if(err) {
            console.log("Error in update: "+ err)
        } else {
            console.log(result);
        }
    });
});

app.get("/api/typeahead", (req, res) => {
    let q = req.query.input;
    
    let query = {
        "$or": [
            {"name.firstname": {"$regex": q, "$options": "i"}}, 
            {"name.lastname": {"$regex": q, "$options": "i"}},
            {"name.email": {"$regex": q, "$options": "i"}}
        ]
    };

    User.find(query).then( usrs => {
        if(usrs && usrs.length && usrs.length > 0) {
            usrs.forEach(user => {
              let obj = {
                id: user.name.first + ' ' + user.name.last + ' ' + user.name.email,
                label: user.name.first + ' ' + user.name.last + ' ' + user.name.email
              };
              output.push(obj);
            });
        }
        res.json(output);
    }).catch(err => {
        res.sendStatus(404);
    });
});

io.on("connection", (socket) => {
    console.log("User Connected");
});

http.listen(8103, () => {
    console.log("Server is running");
});