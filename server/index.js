import bodyParser from 'body-parser'
import express from 'express'
import nodeMailer from 'nodemailer'

const app = express()

const port = process.env.PORT || 5000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.post('/send-email', function(req, res) {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'mLussier1936@gmail.com',
      pass: 'Pablo123',
    },
  })
  let mailOptions = {
    from: '<mLussier1936@gmail.com>', // sender address
    to: '<mLussier1936@gmail.com>', // list of receivers
    subject: 'test', // Subject line
    text: `http://localhost:3000/${req.body.id}`, // plain text body
    // html: '<b>NodeJS Email Tutorial</b>' // html body
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('message sent')
  

    res.end()
  })
})

app.listen(port, err => {
  if (err) {
    console.error(err)
  }
  {
    console.log(`App listen to port ${port}`)
  }
})
