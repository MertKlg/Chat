import type IResponse from "./interfaces/iresponse"

class ResponseModel implements IResponse{
    message: string
    status: number
    value: any[]
    
    constructor(message : string = "", status : number = 500, value : any[] = []){
        this.message = message
        this.status = status
        this.value = value
    }
}


export default ResponseModel