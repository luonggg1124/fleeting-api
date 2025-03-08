export class CacheException extends Error{
    keyCache:string;
    typeCache: "redis"|"session"|"cookie";
    constructor(message: string,keyCache:string,typeCache:"redis"|"session"|"cookie" = "redis"){
        super(message);
        this.name = "CacheException";
        this.keyCache = keyCache,
        this.typeCache = typeCache;
    }
    getStatus():number|string {
        return 500;
    }
    get key():string {
        return this.keyCache;
    }
    get type():string {
        return this.typeCache;
    }
}