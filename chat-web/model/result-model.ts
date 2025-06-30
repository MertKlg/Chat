interface IResultError{
    status : number,
    message : string
}

export interface IResult<T>{
    data : T | null,
    error? : IResultError
}


export class ResultModel<T> implements IResult<T>{
    data : T | null
    error? : IResultError

    constructor(data : T | null, error? : IResultError){
        this.data = data
        this.error = error
    }
}