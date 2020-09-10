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
    User.findOneAndUpdate({ _id: req.params.id }, 
        { 
            firstname: req.params.firstname, 
            lastname: req.params.lastname, 
            email: req.params.email
        });
});

app.delete("/api/users/:id", (req, res) => {
    User.findOneAndDelete({_id: req.params.id});
});

io.on("connection", (socket) => {
    console.log("User Connected");
});

http.listen(8103, () => {
    console.log("Server is running");
});