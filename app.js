import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";
import { setDoc, getDoc, doc } from "firebase/firestore/lite";
import {db, User, server} from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/login.html')
});

app.post("/register", async(req, res) => {
    const {username, password, confirmPassword} = req.body;
    if (password != confirmPassword){
        return res.end("passwords not matching!");
    } 
    const userRef = doc(db, 'system', username);
    getDoc(userRef)
    .then((docSnapShot) => {
        if (docSnapShot.exists()) {
            return res.send("username already exists");
        }
        setDoc(userRef, {count: 10, password})
        .then(() => {
            res.send("you have been successfully registered. You can log in using your informations now");
        })
        .catch((error) => {
            console.log('Error getting documents: ', error);
        });

    })
});

app.post('/login', async(req, res) => {
    const {username, password} = req.body;
    const userRef = doc(db, 'system', username);
    getDoc(userRef)
    .then((docSnapShot) => {
        if (!docSnapShot.exists()) {
            return res.send("Wrong informations. Please try again !")
        }
        if (docSnapShot.data().password != password){
            return res.send("Wrong informations. Please try again !")
        }
        return res.send("successfully logged in !")
    })
})

app.get('/signup', function(req, res){
    res.sendFile(__dirname + '/signup.html')
});

app.listen(3000, () => console.log('server successfully hosted at port 3000'));