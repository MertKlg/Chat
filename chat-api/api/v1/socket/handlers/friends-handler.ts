import { Socket } from "socket.io";
import errorCodes from "../../common/error.messages";
import ResponseModel from "../../model/error-model";
import FriendStatus from "../../model/types/friend-status";
import errorMessages from "../../common/error.messages";
import { checkFriendRequest, deleteFriendRequest, getFriendRequest, getFriends, searchFriend, sendFriendRequest, updateFriendRequest } from "../../model/friend/friend.model";
import { unFriendHelper } from "../helper/friend-helper";

export const getFriendsHandler = async (data: any, socket: Socket) => {
    const { user_id } = socket.data.user;

    const friends = await getFriends({ params: [user_id, user_id, user_id] })

    if (friends.error) {
        socket.emit("get_friends_result", new ResponseModel(friends.error.message, 500))
        return
    }

    socket.emit("get_friends_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, friends.data));

};

export const getFriendRequestHandler = async (data: any, socket: Socket) => {
    const { user_id } = socket.data.user;

    const getRequest = await getFriendRequest({ params: [user_id] })

    if (getRequest.error) {
        socket.emit("get_friend_requests_result", new ResponseModel(getRequest.error.message, 500))
        return
    }

    socket.emit("get_friend_requests_result", new ResponseModel(errorCodes.GENERAL.SUCCESS, 200, getRequest.data))
};

export const friendRequestHandler = async (data: any, socket: Socket) => {
    const { receiver_id,status } = data;
    const { user_id, username } = socket.data.user;

    if (user_id == receiver_id) {
        socket.emit("friend_request_result", new ResponseModel("You can't send friend request to youself", 400))
        return
    }

    const checkFriend = await checkFriendRequest({ params: [user_id, receiver_id, receiver_id, user_id] })

    if (checkFriend.error) {
        socket.emit("friend_request_result", new ResponseModel(checkFriend.error?.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
        return
    } else if (!checkFriend.data || checkFriend.data.length <= 0) {
        const sendRequest = await sendFriendRequest({ params: [user_id, receiver_id] });

        if (sendRequest.error) {
            socket.emit("friend_request_result", new ResponseModel(sendRequest.error.message, 500))
            return
        }

        socket.emit("friend_request_result", new ResponseModel(errorMessages.FRIEND.REQUEST_SENDED, 200, [{ receiver_id }]));
        return
    } else if (checkFriend.data) {
        const deleteResult = await deleteFriendRequest({ params: [user_id,receiver_id,receiver_id,user_id] });

        if(deleteResult.error){
            socket.emit("friend_request_result", new ResponseModel(deleteResult.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500));
            return
        }

        const sendRequest = await sendFriendRequest({ params: [user_id, receiver_id] });


        if (sendRequest.error) {
            socket.emit("friend_request_result", new ResponseModel(sendRequest.error.message, 500))
            return
        }

        socket.emit("friend_request_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, [{ receiver_id, status }]));
    }else {
        socket.emit("friend_request_result", new ResponseModel(errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500));
        return
    }
};

export const searchUserHandler = async (data: any, socket: Socket) => {
    const { username } = data;
    const { user_id } = socket.data.user

    if (!username) {
        socket.emit("search_user_result", new ResponseModel(errorMessages.USERNAME.EMPTY, 400));
        return;
    }
    const search = await searchFriend({ params: [user_id, user_id, username, user_id] })

    if (search.error) {
        socket.emit("search_user_result", new ResponseModel(search.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500, []));
        return;
    }

    socket.emit("search_user_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200, search.data));
};


export const acceptFriendHandler = async (data: any, socket: Socket) => {
    const { sender_id } = data;
    const { user_id } = socket.data.user;

    const updateResult = await updateFriendRequest({ params: [FriendStatus.Accepted, user_id, sender_id, sender_id, user_id] });

    if (updateResult.error) {
        socket.emit("update_friend_request_result", new ResponseModel(updateResult.error.message, 500));
        return
    }

    socket.emit("update_friend_request_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200));
}

export const rejectFriendHandler = async (data: any, socket: Socket) => {
    const { sender_id } = data;
    const { user_id } = socket.data.user;

    const updateResult = await updateFriendRequest({ params: [FriendStatus.Rejected, user_id, sender_id, sender_id, user_id] });

    if (updateResult.error) {
        socket.emit("update_friend_request_result", new ResponseModel(updateResult.error.message, 500));
        return
    }

    socket.emit("update_friend_request_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200));
}

export const unfriendHandler = async (data: any, socket: Socket) => {
    const { sender_id } = data
    const { user_id } = socket.data.user

    const friendHelper = await unFriendHelper(FriendStatus.Unfriend, user_id, sender_id)

    if (friendHelper.error) {
        socket.emit("update_friend_request_result", new ResponseModel(friendHelper.error.message ?? errorMessages.GENERAL.SOMETHING_WENT_WRONG, 500))
        return
    }

    socket.emit("update_friend_request_result", new ResponseModel(errorMessages.GENERAL.SUCCESS, 200))
}

export const searchFriendHandler = async (data: any, socket: Socket) => {
    const { username } = data;
    const {user_id } = socket.data.user
    
}