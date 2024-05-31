//server.js
//we import the dependancies we are going to be using and define them as variables 
import express from 'express';
import session from 'express-session'; // used to import the variable to the server
import bcrypt from 'bcryptjs'; // used for encryption
import bodyParser from 'body-parser'; //
import mysql from 'mysql';
import { check, validationResult } from 'express-validator';
import cors from 'cors';

const app = express();



//configure session middleware
//initializing our application by efining a variable that will hold the application itself

app.use(session({
    secret: 'sectret-key',//makes the session more secure 
    resave: false,
    saveUninitialized: true
}));

//create mysql connection
//we define a variable called connection and asign it to mysql 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'AbCdEf2004!!',
    database: 'learning_management'
});
/* pool.query ('select * from learning_management.users', (err, result, fields) => {
    if (err) {
        return console.log(err);
    }
    return console.log(result);
}) */

//connect to the database 
  connection.connect((err) => {
    if (err ){
    console.error ('Error  connecting to MySQL: ' + err.stack);
    return;
}
     console.log('connected to MySQL  as id' + connection.threadId);
});

//serve static files fromthe default directory
app.use(express.static(_dirname));

//set up middleware to parse incoming JSON data
//middle ware acts as an interface between two parties

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

//define routes
//we set up our routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



//define user represnetation forclarity
const user = {
    tableName: 'users',
    createUser: function (newUser, callback){
        connection.query('INSERT INTO' + this.tableName + 'SET ?', newUser, callback);
    },
    getUserByEmail: function(email, callback){
        connection.query('SELECT * FROM' + this.tableName +'WHERE email = ?', email, callback);
    },
    getUserByUsername: function(username, callback){
        connection.query('SELECT * FROM' + this.tableName +'WHERE username = ?', username, callback);
    }
};

//reqistraton route 
app.post('/register', [
//validate username and email fields
check ('email').isEmail(),
check('username').isAlphanumeric().withMessage('username must be alphanumeric'),

//custom validation to check if the email and the username are unique
check('email').custom(async(value) => {
    const user = await user.getuserByEmail(value);
    if (user){
        throw new Error('Email is already in use');
    }
    }),
check('username').custom(async(value) => {
    const user = await user.getUserByUsername(value);
    if (user){
        throw new Error('Username is already in use');
    }
 }),
], async (req, res) => {
    //check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

//mash the password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(req.password, saltRounds);

//create new user object
const newUser = {
    email:req.body.email,
    userame:req.body.userame,
    password: hashedPassword,
    full_name: req.body.full_name
};

//insert user into mySQL
user.createUser(newUser, (error, results, fileds) => {
    if (error) {
        console.error ('Error inserting user:' + error.message);
        return res.status(500).json({error:error.message});
    }
    console.log('Inserted  a new user with id' + results.insertId);
    res.status(201).json(newUser);
    });
});

//log in route
app.post ('/login', (req, res) => {
    const{username, password} = req.body;
    //retrieve user form database
    connection.query ('SELECT * FROM users WHERE username = ?', [username], (er, results) =>{
        if (err) throw err;
        if (results.length  === 0) {
            res.status(401).send ('Invalid userame or password ');
        } else {
            const user = results[o];
            //compare password
            bcrypt.comparepassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    //store user in session
                    req.session.user = user;
                    res.send('login successful');
                } else {
                    res.status(401).send('Invalid userame or password');
                }
            }
        }
    });
});   
//logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send ('logout successful');
});

//dashboard route
app.get('/dashboard',(req, res) => {
    //assuming you have middle ware to handle and user authentication and store user information in req.user
    const userFullName = req.user.fullName;
    res.render ('dashboard', {fullName:userFullName});
});

//route to retrieve course content
app.get ('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT *  FROM Course WHERE  id = ?';
    db.query(sql, [courseId], (err, result) => {
        if (err) {
            throw err;
        }
        //send course content as JSON response
        res.json(result);
    });
    });

    //start server
    const PORT = 3000;
    app.listen (PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
