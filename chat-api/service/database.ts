import mysql, { RowDataPacket } from 'mysql2';
import { BaseMysqlQuery, MysqlQuery, MysqlResult, RowMapper } from '../api/v1/model/mysql/mysql.interface';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } = process.env as {
    DB_HOST: string,
    DB_USERNAME: string,
    DB_PASSWORD: string,
    DB_DATABASE: string,
    DB_PORT: string
}


const databasePool = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: Number(DB_PORT),
    waitForConnections: true,
}).promise()


databasePool.getConnection().then(() => console.log("Succesfuly connected")).catch(e => console.log(e))

export const query = async<T>(query: BaseMysqlQuery, mapper?: RowMapper<T> ): Promise<MysqlResult<T[]>> => {
    try {
        const connection = query.databasePool ?? databasePool
        const [result] = await connection.query<RowDataPacket[]>(query.query, query.params)

        if(Array.isArray(result) && mapper){
            const queryResult = result.map(mapper)
            return {
                data : queryResult
            }
        }else if(Array.isArray(result)){
            return {
                data : result as T[]
            }
        }else{
            return {
                data : [] as T[]
            }
        }
    } catch (e) {
        return {
            error: e instanceof Error ? e : Error("Something went wrong")
        }
    }
}


export const execute = async (query: BaseMysqlQuery): Promise<MysqlResult<void>> => {
    try {
        const connection = query.databasePool ?? databasePool
        await connection.execute(query.query, query.params)

        return {
            data: undefined
        }
    } catch (e) {
        return {
            error: e instanceof Error ? e : Error("Something went wrong")
        }
    }
}


export default databasePool