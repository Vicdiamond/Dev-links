import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db, storage } from './firebaseConfig'
import { toast } from 'react-toastify'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { handleLogin, handleSignup, handleSignOut } from '../firebase/auth'
import { validateLoginData } from '../firebase/helpers'

export async function handleSubmitLogin (
  userData,
  setErrorFunc,
  navigate,
  setIsLoading
) {
  const validationErrors = validateLoginData(userData)
  setErrorFunc(validationErrors)

  // For CREATING ACCOUNT
  if (Object.keys(validationErrors).length === 0 && userData?.confirmPassword) {
    setIsLoading(true)
    try {
      const user = await handleSignup(userData.email, userData.password)

      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          firstName: '',
          lastName: '',
          email: userData.email,
          links: [],
          profilePicture: '',
          id: user.uid
        })
      }
      toast.success('Account created successfully')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // FOR LOGGING IN
  if (
    Object.keys(validationErrors).length === 0 &&
    !userData?.confirmPassword
  ) {
    setIsLoading(true)
    try {
      await handleLogin(userData.email, userData.password)

      toast.success('Login sucess')
      navigate('/app')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }
}

export async function signOutuser (navigate, setIsLoading, setIsSigningOut) {
  setIsLoading(true)
  try {
    await handleSignOut()
    setIsSigningOut(false)
    toast.success('Signed out sucessfully')
    navigate('/login')
  } catch (err) {
    toast.error(err.message)
  } finally {
    setIsLoading(false)
  }
}

export const getUserProfile = async userId => {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      toast.error('No such document!')
      return null
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateUserLink (userId, amtOfLinkContainer) {
  try {
    const userDocRef = doc(db, 'users', userId)
    // console.log(amtOfLinkContainer)
    await updateDoc(userDocRef, { links: amtOfLinkContainer })
  } catch (err) {
    toast.error(err.message)
  }
}

export async function updateUserProfile (userId, userDetails, imageFile) {
  const userDocRef = doc(db, 'users', userId)
  try {
    if (imageFile) {
      // Create a reference to the file in Firebase Storage
      const imageRef = ref(storage, `user_images/${userId}/${imageFile.name}`)

      // Upload the file
      await uploadBytes(imageRef, imageFile)

      // Get the download URL
      const imageUrl = await getDownloadURL(imageRef)
      await updateDoc(userDocRef, { profilePicture: imageUrl })
    }

    await updateDoc(userDocRef, {
      firstName: userDetails.firstName,
      email: userDetails.email,
      lastName: userDetails.lastName
    })
  } catch (err) {
    toast.error(err.message)
  }
}
