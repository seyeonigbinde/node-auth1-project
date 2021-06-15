const Users = require("../users/users-model")

function restricted (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    next({
      status: 401,
      message: 'you shall not pass'
    })
  }
}


async function checkUsernameFree (req, res, next) {
  try{
    const existing = await Users
    .findBy({username: req.body.username})
    if(!existing.length){
      next()
    } else {
      next({"message": "Username taken"})
    }
  } catch (err){
    next(err)
  }
}

async function checkUsernameExists (req, res, next) {
  try{
    const existing = await Users
    .findBy({username: req.body.username})

    if(existing.length){
      next()
    } else {
      next({status: 401, message: `Invalid credentials`})
    }
  } catch (err){
    next(err)
  }
}

function checkPasswordLength(req, res, next) {
  const error = {status: 422}
  const { password } = req.body
  if ( !password || password.trim().length < 3 ) {
      error.message = 'Password must be longer than 3 chars'
  if  (error.message) {
    next(error)
  } else {
    next()
  }
}
}

module.exports = {
  restricted,
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree
}
