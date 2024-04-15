const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT =2000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from the current directory
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MyNewShop', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const UserSchema = new mongoose.Schema({
    shopName: String,
    name: String,
    aadharNumber:Number,
    email: String,
    phoneNumber:Number,
    shopAddress:String,
    password: String
});

const User = mongoose.model('User', UserSchema);

// Homepage route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front.html');
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user){
            res.send("Id does not exist");
        }

        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/home.html');
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Signup route
app.post('/register', async (req, res) => {
    const { shopName, name, aadharNumber, email, phoneNumber, shopAddress, password} = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user){
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ shopName, name, aadharNumber, email, phoneNumber, shopAddress, password: hashedPassword });
        await newUser.save();
        res.redirect('/login.html');
        }
        else{
            res.send("User already exists");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
