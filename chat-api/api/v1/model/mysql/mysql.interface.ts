import { PoolConnection } from "mysql2/promise";
import { IResult } from "../common/common.interface";

export interface BaseMysqlQuery {
    query : string,
    params : object,
    databasePool?: PoolConnection
}

export interface MysqlQuery {
    params : object | object[],
    databasePool?: PoolConnection
}


export interface MysqlResult<T> extends IResult<T>{}
export type RowMapper<T> = (row : any) => T