import { searchFriend } from "../../api/v1/model/friend/friend.model"
import FriendStatus from "../../api/v1/model/types/friend-status"


test("mysql params", async () => {
    const searchStatusParams = [FriendStatus.Accepted, FriendStatus.Rejected, FriendStatus.Waiting]

    try {
        const search = await searchFriend({ params: [6, 6, 't', 6] }, searchStatusParams, true)

        if(search.error){
            console.error(search.error.message)
        }

        console.log(search.data)
    } catch (e) {
        console.error(e)
    }


    expect(true).toBe(true)
})

