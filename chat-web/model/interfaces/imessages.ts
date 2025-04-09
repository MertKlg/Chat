export default interface IMessages {
    username: string,
    chat_message_id: string,
    message: string,
    user_id: number,
    sended_at: string,
    photo: string,
    chat_image: string | null
}