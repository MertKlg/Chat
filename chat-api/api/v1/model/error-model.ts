export default class ResponseModel extends Error{
    constructor(
        public readonly message : string, 
        public readonly status : number,
        public readonly value : any[] = [],
        public readonly type? : string
    ){
        super()
    }
}