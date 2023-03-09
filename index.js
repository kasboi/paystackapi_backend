//It's important that dotenv gets imported before the note model is imported. This ensures that the environment variables from the .env file are available globally before the code from the other modules is imported.
require("dotenv").config()
const express = require("express")
const axios = require("axios")
const cors = require("cors")
const history = require('connect-history-api-fallback');

const app = express()

// Enable cors
app.use(cors())
// Allow express to parse JSON
app.use(express.json())
// Allow to serve client side routes
app.use(history())
// Allow express to serve static files from the dist folder
app.use(express.static("dist"))

const reqLogger = (req, res, next) => {
    console.log("Method:", req.method)
    console.log("Path:  ", req.path)
    console.log("Body:  ", req.body)
    console.log("---")
    // Call the next middleware
    next()
}

const products = [
    {
        id: 1,
        amount: 1400,
    },
    {
        id: 2,
        amount: 1500,
    },
    {
        id: 3,
        amount: 2100,
    },
]

app.use(reqLogger)

app.get("/", (req, res) => {
    res.send("Implementing paystack api")
})

app.post("/transaction/initialize", async (req, res) => {
    const { id, quantity } = req.query
    const food = products.find(item => item.id == id)
    const params = {
        email: "customer@email.com",
        amount: (food.amount * quantity * 100).toString(),
    }
    try {
        const response = await axios({
            method: "POST",
            url: "https://api.paystack.co/transaction/initialize",
            headers: {
                Authorization:
                    "Bearer sk_test_6966faa59e3211a668ba7bbc167ea18bcc4fd906",
                "Content-Type": "application/json",
            },
            data: params,
        })

        res.json(response.data)
    } catch (error) {
        console.error(error)
        res.status(error.response.status).send(error.message)
    }
})

app.get("/transaction/verify", async (req, res) => {
    const { reference } = req.query
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization:
                        "Bearer sk_test_6966faa59e3211a668ba7bbc167ea18bcc4fd906",
                },
            }
        )
        res.json(response.data)
    } catch (error) {
        console.error(error)
        res.status(error.response.status).send(error.message)
    }
})

app.use((_req, res) => {
    res.status(404).send({ error: "Cannot find the requested resource" })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
