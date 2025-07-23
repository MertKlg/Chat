
import { deleteGroupChatByGroupId, getGroupChats, getOwnedGroups, leaveGroupChat } from "../model/chat/chat-group-model";
import databasePool from "../../../service/database";
import errorMessages from "../common/error.messages";
import { deleteAllChatMessages, deleteChat, deleteChatMembers, getPersonalChats } from "../model/chat/chat.model";
import { deleteFriendRequest, getFriends } from "../model/friend/friend.model";
import { IUser } from "../model/auth/auth.interface";
import { deleteStorageFileAsync } from "../common/file";
import { deleteUser } from "../model/auth/auth.model";
import { IResult } from "../model/common/common.interface";

export const deleteUserAccountHelper = async (user : IUser): Promise<IResult<string>> => {
    const getConnection = await databasePool.getConnection()

    try {
        await getConnection.beginTransaction()

        /* If user owner of a group */
        const findUserOwnerGroups = await getOwnedGroups({ params: [user.user_id] })

        if (findUserOwnerGroups.data && findUserOwnerGroups.data.length > 0) {
            const deleteGroupJobs = []
            for (const group of findUserOwnerGroups.data) {
                deleteGroupJobs.push(deleteAllChatMessages({params : [group.chat_id], databasePool : getConnection}))
                deleteGroupJobs.push(deleteChatMembers({params : [group.chat_id], databasePool : getConnection}))
                deleteGroupJobs.push(deleteGroupChatByGroupId({ params: [group.group_id], databasePool: getConnection }))
                deleteGroupJobs.push(deleteChat({ params: [group.chat_id], databasePool: getConnection }))
            }

            const deleteResults = await Promise.all(deleteGroupJobs)

            for (const result of deleteResults) {
                if(result.error){
                    throw result.error
                }
            }
        }

        /* If user already join chats */

        // Personal chat, two user chat between
        const getUserChats = await getPersonalChats({params : [user.user_id], databasePool : getConnection})

        if(getUserChats.data && getUserChats.data.length > 0){
            const jobs = []
            for(const chat of getUserChats.data){
                jobs.push(deleteAllChatMessages({params : [chat.chat_id], databasePool : getConnection}))
                jobs.push(deleteChatMembers({params : [chat.chat_id], databasePool : getConnection}))
                jobs.push(deleteChat({params : [chat.chat_id], databasePool : getConnection}))
            }

            const deleteResults = await Promise.all(jobs)

            for(const result of deleteResults){
                if(result.error){
                    throw result.error
                }
            }
        }

        // Group chats, user already joined in group but, if user not owned of a group, user must be leave
        const groupChats = await getGroupChats({params : [user.user_id], databasePool : getConnection})
        if(groupChats.data && groupChats.data.length > 0){
            const jobs = []
            for(const chat of groupChats.data){
                jobs.push(leaveGroupChat({params : [user.user_id, chat.chat_id], databasePool : getConnection}))
            }

            const deleteResults = await Promise.all(jobs)

            for(const result of deleteResults){
                if(result.error){
                    throw result.error
                }
            }
        }

        /* Maybe user added friend, we need delete user's friends */

        const friends = await getFriends({params : [user.user_id], databasePool : getConnection})

        if(friends.data && friends.data.length > 0){
            const jobs = []
            for(const friend of friends.data){
                jobs.push(deleteFriendRequest({params : [friend.user_id, user.user_id, user.user_id, friend.user_id]}))
            }

            const deleteResults = await Promise.all(jobs)

            for(const result of deleteResults){
                if(result.error){
                    throw result.error
                }
            }
        }

        /* And delete account */
        // First delete profile image
        if(user.photo){
            await deleteStorageFileAsync(user.photo)
        }

        const deleteResult = await deleteUser({params : [user.user_id], databasePool : getConnection})
        
        if(deleteResult.error){
            throw deleteResult.error
        }

        await getConnection.commit()

        return {
            data : "Success"
        }
    } catch (e) {
        await getConnection.rollback()

        console.log(e)

        return {
            error : e instanceof Error ? e : new Error(errorMessages.GENERAL.SOMETHING_WENT_WRONG)
        }
    } finally {
        getConnection.release()
    }
}