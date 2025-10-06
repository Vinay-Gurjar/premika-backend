export const socketLisners  = {
    SUBSCRIBE_USERS:"subscribe_users",
    SUBSCRIBE_CONVERSATIONS:"subscribe_conversations",
    SEND_MESSAGE:"send_message",
    TYPING:"typing",
    MESSAGE_SEEN:"message_seen",
    GET_USER_STATUS:"get_user_status",
    ON_CHAT_ENTER:"on_chat_enter",
    ON_CHAT_EXIT:"on_chat_exit",
    BROADCAST_MESSAGE:"broadcast_message",
    ON_ENTER_EXIT_CHAT:"on_enter_exit_chat",
    UPDATE_LIVE_STATUS:"update_live_status"

}   

export const socketEmitter = {
    NEW_MESSAGE:"new_message",
    TYPING_STATUS:"typing_status",
    MESSAGE_SEEN:"message_seen",
    ERROR:"error",
    USER_LIVE_STATUS:"user_live_status",
    LIVE_STATUS_CHANGED:"live_status_changed"
}