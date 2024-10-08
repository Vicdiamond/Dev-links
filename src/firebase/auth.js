import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth } from './firebaseConfig'

async function handleSignup (email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    return userCredential.user
  } catch (error) {
    throw new Error(error.code.slice(5))
  }
}

async function handleLogin (email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return userCredential.user
  } catch (err) {
    throw new Error(err.code.slice(5))
  }
}

async function handleSignOut () {
  try {
    return await signOut(auth)
  } catch (error) {
    throw new Error(error.code.slice(5))
  }
}

export { handleSignup, handleLogin, handleSignOut }
