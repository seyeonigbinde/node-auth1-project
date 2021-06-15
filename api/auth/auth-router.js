const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../users/users-model')
const { checkPasswordLength, 
  checkUsernameExists, 
  checkUsernameFree } = require('./auth-middleware')

router.post('/register', checkUsernameFree, checkPasswordLength,  (req, res, next) => {
// router.post('/register',  (req, res, next) => {
    const { username, password } = req.body
    const hash = bcrypt.hashSync(
      password, 8 )
    User.add({username, password: hash})
      .then(saved => {
        res.status(201).json(saved)
      })
   .catch (next) 
})

router.post('/login',  checkUsernameExists, async (req, res, next) => {
  try {
    const { username, password } = req.body
    const [user] = await User.findBy({ username })

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user
      res.json(`welcome ${user.username}!`)
    } else {
      next({ status: 401, 
        message: 'invalid credentials' })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/logout', async (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) res.json({ 
        message: 'you cannot leave' })
      else res.json({ 
        message: 'logged out' })
    })
  } else {
    res.json({ message: 'no session' })
  }
})

module.exports = router
