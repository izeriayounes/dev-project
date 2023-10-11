import express from "express";
import bodyParser from "body-parser";
import { setDoc, updateDoc, getDocs, getDoc, doc, query, where } from "firebase/firestore/lite";
import {db, User, server} from "./config.js";
import session from 'express-session';
import pkg from 'bcryptjs';
const {compare, hash} = pkg;
import crypto from "crypto"
import {transporter, mailOptions} from "./mailer.js";

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));  

app.get('/login', function (req, res) {
    res.render('login', {
        regSuccess: '',
        wrongCreds: ''
    })
})

app.get('/register', function (req, res) {
    res.render('register', {
        regSuccess: '',
        usernameTaken: ''
    });
})

//popup messages for successful/failed login or register
const usernameTaken = { regSuccess: '', usernameTaken: 'Email already exists. Please try another one' };
const wrongCreds = { wrongCreds: 'Invalid informations. Please try again!'};

app.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const userRef = doc(db, 'system', username);
    const docSnapShot = await getDoc(userRef);

    if (password != confirmPassword) {
      return res.send('passwords not matching')
    }
  
    if (docSnapShot.exists()) {
      return res.render('register', { usernameTaken });
    }

    try {      
      // Store user data in Firestore
      const hashedPass = await hash(password, 12);
      await setDoc(userRef, { email, password: hashedPass, count: 10 });
      console.log('User data stored in Firestore successfully.');
      const user = { username, email: docSnapShot.data().email };
      req.session.user = user;
      req.session.isAuth = true;
      res.redirect('/profile');
    } 

    catch (error) {
      console.log('Error registering user or storing data:', error);
      res.status(500).send('A server error occurred');
    }
  });
  

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userRef = doc(db, 'system', username);
  
    try {
      const docSnapShot = await getDoc(userRef);
      if (!docSnapShot.exists()) {
        return res.render('login', wrongCreds);
      }
      const passMatch = await compare(password, docSnapShot.data().password);
      if (!passMatch) {
        return res.render('login', wrongCreds);
      }

      // Store user data in session upon successful login
      const user = { username, email: docSnapShot.data().email };
      req.session.user = user;
      req.session.isAuth = true;
      return res.redirect('/profile');
    } catch (error) {
      console.log('Error getting documents:', error);
      return res.status(500).send('A server error occurred');
    }
  });

app.get('/reset-password', (req, res) => {
    res.render('reset');
})

app.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    
    const userQuery = query(User, where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.send('User not found');
    }    
    // Generate password reset token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Store the token and its expiration time in Firestore
    querySnapshot.forEach( async (doc) => {
      await updateDoc(doc.ref, {
        resetToken: token,
        resetTokenExpires: Date.now() + 3600000, // Token expires in 1 hour
      });
    })

    transporter.sendMail(mailOptions(token, email));
    res.send('Password reset email sent');

  } catch (error) {
    res.send(error);
  }
});

app.get('/logout', function (req, res) {
  req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/login");
  });
})

app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Query Firestore to find the user with the matching reset token
    const userQuery = query(User, where('resetToken', '==', token));
    const querySnapshot = await getDocs(userQuery);

    // Check if the query returned any results
    if (querySnapshot.empty) {
      return res.send('Invalid token');
    }
    // Check if the reset token has expired
    const userDoc = querySnapshot.docs[0];
    const resetTokenExpires = userDoc.data().resetTokenExpires;
    if (Date.now() > resetTokenExpires) {
      return res.send('Reset token has expired');
    }
    
    // Render the password reset form with the token as a hidden input field
    res.render('new-password', { token });
    console.log('yoooo');

  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('A server error occurred');
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    const userQuery = query(User, where('resetToken', '==', token));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return res.send('Invalid or expired token');
    }

    // Update the user's password and remove the reset token
    querySnapshot.forEach(async (doc) => {
      const hashedPass = await hash(password, 12);
      await Promise.all([
        updateDoc(doc.ref, { password: hashedPass }),
        updateDoc(doc.ref, { resetToken: null }),
        updateDoc(doc.ref, { resetTokenExpires: null }),
      ]);
    });

    res.send('Password reset successful');
  } catch (error) {
    console.log('Error resetting password:', error);
    res.status(500).send('A server error occurred');
  }
});

const checkAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/profile', checkAuth, async (req, res) => {
  const {username, email} = req.session.user;
  const userRef = doc(db, 'system', username);
  const docSnapShot = await getDoc(userRef);
  const count = docSnapShot.data().count;
  res.render('profile', {...req.session.user, count: count});
});

app.listen(3000, () => console.log('server successfully hosted at port 3000'));