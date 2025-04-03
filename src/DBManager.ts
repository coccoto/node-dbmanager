import mysql from 'mysql2/promise'
import fs from 'fs'

export interface Logger {
    info(message: string): void
    error(message: string): void
}

export type DBConnectionConfig = {
    host: string
    user: string
    password: string
    database: string
}

type DBManagerConfig = {
    dbConnectionConfig: DBConnectionConfig
    logger: Logger
}

export class DBManager {

    private dbConnection: mysql.Connection | null = null
    private readonly dbConnectionConfig: DBConnectionConfig
    private readonly logger: Logger

    constructor({ dbConnectionConfig, logger }: DBManagerConfig) {
        this.dbConnectionConfig = dbConnectionConfig
        this.logger = logger
    }

    async connect(): Promise<void> {
        try {
            if (this.dbConnection !== null) {
                return
            }
            this.dbConnection = await mysql.createConnection(this.dbConnectionConfig)

            const { host, user, database } = this.dbConnectionConfig
            this.logger.info(`Connection to the database was successful. Host: ${host} User: ${user} Database: ${database}`)
            return

        } catch (error: unknown) {
            this.logger.error('Failed to connect to database. Error: ' + (error as Error).message)
            throw error
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.dbConnection === null) {
                throw new Error('No active database connection to disconnect.')
            }
            await this.dbConnection.end()

        } catch (error: unknown) {
            this.logger.error('Failed to disconnect from the database. Error: ' + (error as Error).message)
            throw error

        } finally {
            this.dbConnection = null
        }
    }

    async select<T>(query: string, params: any[] = []): Promise<T[]> {
        try {
            if (this.dbConnection === null) {
                throw new Error('Database connection is not established.')
            }
            const [rows] = await this.dbConnection.execute<mysql.RowDataPacket[]>(query, params)
            return rows as T[]

        } catch (error: unknown) {
            this.logger.error('Failed to execute the SELECT. Error: ' + (error as Error).message)
            throw error
        }
    }

    async readFile(filePath: string): Promise<string> {
        try {
            const data = fs.readFileSync(filePath, 'utf8')
            return data
        } catch (error) {
            this.logger.error(`Failed to read the file at path: "${filePath}". Error: ${(error as Error).message}`)
            throw error
        }
    }
}

