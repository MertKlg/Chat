import type IResponse from "./interfaces/iresponse"

class ResponseModel implements IResponse{
    message: string
    status: number
    value: any[]
    
    constructor(){
        this.message = ""
        this.status = 0
        this.value = []
    }
}


export default ResponseModel