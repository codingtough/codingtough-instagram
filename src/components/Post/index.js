import { Avatar } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import './Post.css';
import { db } from '../Firebase';
import firebase from 'firebase';

function Post({user, postId, username, imageUrl, caption}) {
   const [comments, setComments] = useState([]);
   const [comment, setComment] = useState([]);

   useEffect(() => {
      let unsubscribe;
      if(postId){
         unsubscribe = db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            // .orderBy("timestamp", "desc")
            .onSnapshot(snapshot => {
               setComments(snapshot.docs.map(doc => ({
                  id: doc.id,
                  comment: doc.data()
               })))
            })
      }

      return () => {
         unsubscribe();
      };

   }, [postId]);

   const postComment = e => {
      e.preventDefault();

      db.collection("posts")
         .doc(postId)
         .collection("comments")
         .add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            text: comment,
            username: user.displayName
         });
      setComment("");
   }

   return (
      <div className="post">
         <div className="post__header">
            <Avatar 
               className="post__avatar"
               src={user?.photoURL}
               alt={username}
               />
            <h3>{username}</h3>
         </div>
         <img 
            className="post__image"
            src={imageUrl}
            alt=""
         />
         <h4 className="post__text"><strong>{username}</strong> {caption}</h4>

         <div className="post__comments">
            {
               comments.map(({ id, comment }) => (
                     <p key={id}>
                        <strong>{comment.username}</strong> {comment.text}
                     </p>
               ))
            }
         </div>

         {
            user && (
               <form className="post__commentBox">
                  <input 
                     className="post__input"
                     type="text"
                     placeholder="Add a comment..."
                     value={comment}
                     onChange={e => setComment(e.target.value)}
                  />
                  <button 
                     disabled={!comment}
                     type="submit"
                     className="post__button"
                     onClick={postComment}
                  >
                     Post
                  </button>
               </form>
            )
         }
      </div>
   )
}

export default Post;