import React, { useState } from 'react'
import { View } from 'react-native'
import SignIn from './signIn/signin'
import SignUp from './signUp/signup'

const Main = () => {
  const [component,setComponent] = useState('signin')
  return (
    <View>
      {/* if user is present, take hime to home screen. Else show the signin/signup option */}
      {component === "signin" ? <SignIn setComponent={setComponent}/> : <SignUp setComponent={setComponent}/>}
    </View>
  )
}

export default Main