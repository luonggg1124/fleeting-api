export class TooManyRequestException extends Error{
    constructor(message: string){
        super(message);
        this.name = "TooManyRequestException";
    }
    getStatus():number|string {
        return 429;
    }
}