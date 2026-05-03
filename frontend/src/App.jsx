import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader';
import Layout from "./components/Layout"
function App() {
  const {isLoaded} = useAuth();

  if (!isLoaded) return <PageLoader/>
 
  return (
    <Layout>
     <header>
        <Show when="signed-out">
          <SignInButton mode='model'/>
          <SignUpButton mode='model'/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <button className='btn btn-primary'>Click me</button>
    </Layout>
  )
}

export default App
