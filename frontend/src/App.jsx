import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {
 
  return (
    <>
     <header>
        <Show when="signed-out">
          <SignInButton mode='model'/>
          <SignUpButton mode='model'/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  )
}

export default App
