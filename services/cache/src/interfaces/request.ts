import { Callback } from "ioredis";

export interface Request {
    key:string;
}
export interface SetRequest {
    key:string;
    value:string;
}
export interface SetEXRequest {
    key:string;
    value:string;
    ttl:number;
}
export interface ExpireRequest {
    key:string;
    ttl:number;
    mode?: "NX"|"XX"|"GT"|"LT";
    callback?: Callback<number>;
}