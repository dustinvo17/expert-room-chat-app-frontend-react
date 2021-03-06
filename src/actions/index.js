
import axios from 'axios'
import { setToken, getUser } from './helper'
let baseUrl = 'https://expertroom.herokuapp.com'

export const imgPath = () => {
    return {
        type: "img_path",
        payload: "https://chatapp.s3.us-east-2.amazonaws.com/"
    }
}

export const authUser = (userInput, login) => async (dispatch, getState) => {
    const { username, password } = userInput
    let name;
    if (!login) {
        name = userInput.name
    }
    try {
        const { data } = await axios.post(`${baseUrl}/auth/${login ? 'login' : 'signup'}`, {
            username,
            password,
            name

        })
        localStorage.setItem('access_token', data.access_token)
        dispatch({ type: "auth", payload: data.access_token })
        const user = await getUser(baseUrl)
        dispatch({ type: "user_friends", payload: user.friends })
        return dispatch({ type: "user_profile", payload: user })

    } catch (err) {
        console.log(err)
    }


}

export const logOut = () => async (dispatch) => {
    try {
        localStorage.clear()
        axios.defaults.headers.common['Authorization'] = null
        dispatch({ type: 'logout' })
    } catch (err) {
        console.log(err)
    }
}
export const fetchUser = () => async dispatch => {

    const token = localStorage.getItem('access_token')
    dispatch({ type: "auth", payload: token })
    const user = await getUser(baseUrl)
    dispatch({ type: "user_friends", payload: user.friends })
    return dispatch({ type: "user_profile", payload: user })
}
export const getConversationHistory = () => async (dispatch) => {

    setToken()
    try {
        const { data } = await axios.get(`${baseUrl}/chat/conversation`)

        return await dispatch({ type: "get_conversation_history", payload: data })
    } catch (err) {
        console.log(err)
    }
}
export const getCurrentConversation = (messages) => {
    return {
        type: "current_conversation",
        payload: messages
    }
}
export const handleUploadImage = (formData, conversationId) => async (dispatch, getState) => {
    setToken()


    const { data } = await axios.post(`${baseUrl}/chat/message?conversationId=${conversationId}`, formData, {

    })
    return data

}
export const handleMessageSend = message => (dispatch, getState) => {
  
    const state = getState()
    const messages = state.messages

    if(message._id !== messages[messages.length-1]._id) {
        dispatch({
            type: "current_conversation",
            payload: [...messages, message]
        })
    }
 
}

export const getUserByName = name => async (dispatch) => {
    setToken()
    const { data } = await axios.get(`${baseUrl}/users/search?name=${name}`)

    dispatch({ type: "user_search", payload: data })
}
export const addFriend = userId => async dispatch => {
    setToken()
    try {
        const { data } = await axios.post(`${baseUrl}/users/friend`, {
            userId
        })

        return await dispatch({ type: "user_friends", payload: data })
    } catch (err) {
        alert('Relationship already exists')
    }




}

export const acceptFriend = (userId) => async (dispatch) => {

    const { data } = await axios.put(`${baseUrl}/users/friend`, {
        userId
    })

    dispatch({ type: "user_friends", payload: data })
}
export const denyFriend = (userID, pullBack = false) => async dispatch => {

    const { data } = await axios.delete(`${baseUrl}/users/friend`, {
        data: {
            userID,
            pullBack
        }

    })

    dispatch({ type: "user_friends", payload: data })
}

export const initConversation = (userID) => async (dispatch, getState) => {


    // console.log(state.conversationHistory)
    const { data } = await axios.post(`${baseUrl}/chat`, {
        userID
    })
    const newList = data instanceof Array
    let currentConversation;
    if (!newList) {
        const state = getState()
        const conversationList = state.conversationHistory
        const index = conversationList.findIndex(item => item._id === data)
        currentConversation = conversationList[index].messages
        dispatch({ type: 'conversation_id', payload: conversationList[index]._id })
        dispatch({ type: 'index_conversation', payload: index })

    }
    else {
        dispatch({ type: 'conversation_id', payload: data[data.length - 1]._id })
        dispatch({ type: "get_conversation_history", payload: data })
        currentConversation = data[data.length - 1].messages
    }
    dispatch({
        type: "current_conversation",
        payload: currentConversation
    })



}
export const setIndexConversation = index => {
    return {
        type: "index_conversation",

        payload: index
    }
}
export const injectConversationID = id => {
    return {
        type: "conversation_id",
        payload: id
    }
}


export const uploadImageProfile = formData => async dispatch => {



    const { data } = await axios.post(`${baseUrl}/users`, formData, {

    })
    if (data) {
        alert('Successfully upload profile')
    }
    dispatch({ type: "user_profile", payload: data })


}
export const updateUserProfile = (name, job) => async dispatch => {
    const { data } = await axios.put(`${baseUrl}/users`, {
        name,
        job
    })
    if (data) {
        alert('Successfully upload profile')
    }
    dispatch({ type: "user_profile", payload: data })
}
