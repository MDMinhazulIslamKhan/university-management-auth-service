import express, { Application, Response } from 'express'
import cors from 'cors'

const app: Application = express()

app.use(cors())

// parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Testing
app.get('/', (req: any, res: Response) => {
  res.send('Working Successfully')
})

export default app
