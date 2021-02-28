const app = require('./app')
const PORT = process.env.PORT ||  5000;

app.get('/', (req, res) => {
    res.status(200).json({message: 'working...'})
})


app.listen(PORT, () => {
    console.log('server started')
})
