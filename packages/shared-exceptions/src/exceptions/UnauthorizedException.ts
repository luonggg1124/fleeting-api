export class UnauthorizedException extends Error{
    constructor(message: string){
        super(message);
        this.name = "UnauthorizedException";
    }
    getStatus():number|string {
        return 401;
    }
}