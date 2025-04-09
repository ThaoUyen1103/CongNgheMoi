import { createContext, useState } from 'react'
const UserType = createContext()

const UserContext = ({ children }) => {
    const [accountId, setAccountId] = useState('')
    const [conversations, setConversations] = useState([])
    const [cloud, setCloud] = useState([])
    return (
        <UserType.Provider
            value={{
                accountId,
                setAccountId,
                conversations,
                setConversations,
                cloud,
                setCloud,
            }}
        >
            {children}
        </UserType.Provider>
    )
}
export { UserType, UserContext }
