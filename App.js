import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, View, YellowBox, TextInput, Button } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';

/*
-Je laisse mes cordonnées de firebase pour que tu puisses tester l'app
-Tu dois crée un compte + un projet firebase 
-package.json : voir les librairies/dépendace du projet
              : pour lancer le script : npm run start
-Avec firebase : tu crée un système de storage des messages + système d'utilisateurs + CRUD
-n'hésite pas si t'as des questions ou des bugs !!!!




*/

///////FIREBASE SETUP
const firebaseConfing = {
  apiKey: "AIzaSyBRHWOWTKgmKYYAueNqITFUZzDSXeQurt8",
  authDomain: "react-chat-6e683.firebaseapp.com",
  projectId: "react-chat-6e683",
  storageBucket: "react-chat-6e683.appspot.com",
  messagingSenderId: "1054605324412",
  appId: "1:1054605324412:web:05f265022e186749f959f9",
  measurementId: "G-HM5JJ77VQW"
}

if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfing);

}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time']);

const db = firebase.firestore();
const chatsRef = db.collection('chats')




/////////////APP 
export default function App() {

  ///////Création de constante pour créer/manipuler data avec React Hooks
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);



  useEffect(()=> {
    readUser();
    const unsubcribe = chatsRef.onSnapshot(querySnapshot => {
      const messageFirestore = querySnapshot
        .docChanges().filter(({type}) => type == 'added' )
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate() }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() )
        appendMessages(messageFirestore)
      })
      return () => unsubcribe();
  }, [])


  ///structure de l'app avec des functions asynchrone(Elle fonctionne sans attendre la fonction précédente)
  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }
  }

  async function handlePress () {
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map((m) => chatsRef.add(m));
    await Promise.all(writes)
  }


  ////IF THERE IS NO USER
  if(!user) {
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
        <Button onPress={handlePress} title="Enter the chat" />
      </View>
    )
  }
  return <GiftedChat messages={messages} user={user} onSend={handleSend} />
}



///////// STYLE 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'grey',
   
  }
});
