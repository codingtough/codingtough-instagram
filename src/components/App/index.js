import { useEffect, useState } from 'react';
import Post from '../Post';
import './App.css';
import { db, auth } from '../Firebase';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button, Input } from '@material-ui/core';
import ImageUpload from '../ImageUpload';
import InstagramEmbed from 'react-instagram-embed';

function getModalStyle() {
  const top = 50; 
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const APP_ID = process.env.REACT_APP_INSTAGRAM_APP_ID;
const TOKEN_CLIENT = process.env.REACT_APP_INSTAGRAM_TOKEN_CLIENT;

function App() {
   const classes = useStyles();
   const [modalStyle] = useState(getModalStyle);
   const [posts, setPosts] = useState([]);
   const [open, setOpen] = useState(false);
   const [username, setUsername] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [user, setUser] = useState(null);
   const [openSignIn, setOpenSignIn] = useState(false);

   useEffect(() => {
      db.collection("posts")
         .orderBy("timestamp", "desc")
         .onSnapshot(snapshot => {
            setPosts(snapshot.docs.map(doc => ({
               id: doc.id,
               post: doc.data()
            })))
         })
   }, []);

   useEffect (() => {
      const unsubscribe = auth.onAuthStateChanged(authUser => {
         if(authUser){
            // user has logged in...
            setUser(authUser);
         } else {
            // user has logged out...
            setUser(null);
         }
      });
      return () => {
         // perform some cleanup actions
         unsubscribe()
      };
   }, [user]);

   const signUp = (e) => {
      e.preventDefault();

      auth
         .createUserWithEmailAndPassword(email, password)
         .then(authUser => {
            return authUser.user.updateProfile({
               displayName: username
            })
         })
         .catch(error => alert(error.message));
      
      setOpen(false);
   }

   const signIn = (e) => {
      e.preventDefault();

      auth
         .signInWithEmailAndPassword(email, password)
         .catch(error => alert(error.message));

      setOpenSignIn(false);
   }

   return (
      <div className="app">
         <Modal 
            open={open}
            onClose={() => setOpen(false)}
         >
            <div style={modalStyle} className={classes.paper}>
               <form className="app__signup">
                  <center>
                     <img 
                        className="app__headerImage"
                        src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
                        alt="Instagram"
                     />
                  </center>
                  <Input 
                     placeholder="username"
                     type="text"
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                  />
                  <Input 
                     placeholder="email"
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                  />
                  <Input 
                     placeholder="password"
                     type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                  />
                  <Button onClick={signUp}>Sign Up</Button>
               </form>
            </div>
         </Modal>

         <Modal  
            open={openSignIn}
            onClose={() => setOpenSignIn(false)}
         >
            <div style={modalStyle} className={classes.paper}>
               <form className="app__signup">
                  <center>
                     <img 
                        className="app__headerImage"
                        src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
                        alt="Instagram"
                     />
                  </center>

                  <Input 
                     placeholder="email"
                     type="text"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />

                  <Input 
                     placeholder="password"
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="submit" onClick={signIn}>Sign In</Button>

               </form>

            </div>
         </Modal>
         
         <div className="app__header">
            <div className="app__headerImage">
               <img 
                  src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
                  alt="Instagram"
               />
            </div>   
               {user? (
                  <Button onClick={() => auth.signOut()}>Logout</Button>
               ) : (
                  <div className="app_">
                     <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
                     <Button onClick={() => setOpen(true)}>Sign up</Button>
                  </div>
               )}
         </div>
         <div className="app__posts">
            <div className="app__postsLeft">
                  {posts.map(({id, post}) => (   
                     <Post 
                        key={id}
                        postId={id}
                        user={user}
                        username={post.username}
                        imageUrl={post.imageUrl}
                        caption={post.caption}
                     />
                  ))}
            </div>
            <div className="app__postsRight">
               <InstagramEmbed
                  url="https://instagr.am/p/Zw9o4/"
                  clientAccessToken={`${APP_ID}|${TOKEN_CLIENT}`}
                  maxWidth={320}
                  hideCaption={false}
                  containerTagName='div'
                  protocol=''
                  injectScript
                  onLoading={() => {}}
                  onSuccess={() => {}}
                  onAfterRender={() => {}}
                  onFailure={() => {}}
               />
            </div>
         </div>

         {user?.displayName ? (
            <ImageUpload username={user.displayName} />
         ) : (
            <h3 className="app__imageUpload">Sorry you need to login to upload image</h3>
         )}
      </div>
   );
}

export default App;
