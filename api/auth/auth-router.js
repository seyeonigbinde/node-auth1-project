// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../users/users-model')
const { checkPasswordLength, 
  checkUsernameExists, 
  checkUsernameFree } = require('./auth-middleware')


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
// router.post('/register', checkUsernameFree, checkPasswordLength, async (req, res, next) => {
//   try {
//     const { username, password } = req.body
//     const hash = bcrypt.hashSync(
//       password, // plain text
//       8, // number of rounds of hashing 2 ^ 8
//     )
//     const newUser = { username, password: hash }
//     const createdUser = await User.add(newUser)

//     res.json(createdUser)
//   } catch (err) {
//     next(err)
//   }
// })

router.post('/register', checkUsernameFree, checkPasswordLength,  (req, res, next) => {
    const { username, password } = req.body
    const hash = bcrypt.hashSync(
      password, // plain text
      8, // number of rounds of hashing 2 ^ 8
    )
    User.add({username, password: hash})
      .then(saved => {
        res.json(saved).status(201)
      })
   .catch (next) 
})


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.post('/login',  checkUsernameExists, async (req, res, next) => {
  try {
    const { username, password } = req.body
    const [user] = await User.findBy({ username })
    // does username correspont to an actual user?
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user
      // a cookie is set on client
      // a session is stored for that user
      res.json(`welcome ${user.username}!`)
    } else {
      next({ status: 401, message: 'invalid credentials' })
    }
  } catch (err) {
    next(err)
  }
})
/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

router.get('/logout', async (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) res.json({ message: 'you cannot leave' })
      else res.json({ message: 'logged out' })
    })
  } else {
    res.json({ message: 'no session' })
  }
})

router.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});


 
// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router
