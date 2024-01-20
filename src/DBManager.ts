import mysql, { Connection, RowDataPacket } from 'mysql2/promise'
import { logger } from '@coccoto/node-logmanager'
import dotenv from 'dotenv'

dotenv.config()

type Config = {
    host: string,
    user: string,
    password: string,
    database: string,
}

export class DBManager {

    private db: Connection | null = null

    async connect(): Promise<void> {
        try {
            if (this.db !== null) {
                return
            }

            if (! process.env['HOST'] || ! process.env['USER'] || ! process.env['PASSWORD'] || ! process.env['DATABASE']) {
                throw new Error('The .env file is not configured.')
            }

            const config: Config = {
                host: process.env['HOST'],
                user: process.env['USER'],
                password: process.env['PASSWORD'],
                database: process.env['DATABASE'],
            }

            this.db = await mysql.createConnection(config)
            return

        } catch (error: unknown) {
            logger.error('Failed to connect to database. Error: ' + (error as Error).message)
            throw error
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.db === null) {
                throw new Error('No active database connection to disconnect.')
            }
            await this.db.end()

        } catch (error: unknown) {
            logger.error('Failed to disconnect from the database. Error: ' + (error as Error).message)
            throw error

        } finally {
            this.db = null
        }
    }

    async select<T>(query: string): Promise<T[]> {
        try {
            if (this.db === null) {
                throw new Error('Database connection is not established.')
            }
            const [rows] = await this.db.execute<RowDataPacket[]>(query)
            return rows as T[]

        } catch (error: unknown) {
            logger.error('Failed to execute the SELECT. Error: ' + (error as Error).message)
            throw error
        }
    }
}

