export class InternalServerErrorException extends Error{
    constructor(message: string){
        super(message);
        this.name = "InternalServerErrorException";
    }
    getStatus():number|string {
        return 500;
    }
}