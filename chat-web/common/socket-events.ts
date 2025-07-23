export const SOCKET_EMIT_EVENTS = {
  GET_FRIENDS: "get_friends",
  GET_FRIEND_REQUESTS: "get_friend_requests",
  SEARCH_USER: "search_user",
  CREATE_CHAT: "create_chat",
  UPDATE_FRIEND_REQUEST: "update_friend_request",
  UNFRIEND_REQUEST: "unfriend_request",
} as const

export const SOCKET_ON_EVENTS = {
  SEARCH_USER_RESULT: "search_user_result",
  GET_FRIENDS_RESULT: "get_friends_result",
  FRIEND_REQUEST_RESULT: "friend_request_result",
  UPDATE_FRIEND_REQUEST_RESULT: "update_friend_request_result",
  FRIEND_REQUEST_GETTED_RESULT: "friend_request_getted_result",
  CREATE_CHAT_RESULT: "create_chat_result",
  GET_FRIEND_REQUESTS_RESULT: "get_friend_requests_result",
  NEW_FRIEND_REQUEST_GOTTED: "new_friend_request_gotted",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  UNFRIEND_REQUEST_RESULT: "unfriend_request_result",

} as const;