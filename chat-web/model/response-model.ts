import type IResponse from "./interfaces/iresponse"

class ResponseModel implements IResponse{
    message: string
    status: number
    value: any[]
    type : string
    
    constructor(message : string = "", status : number = 500, value : any[] = [], type : string){
        this.message = message
        this.status = status
        this.value = value
        this.type = type
    }
}


export default ResponseModel