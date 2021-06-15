const Users = require("../users/users-model");
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
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


/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree (req, res, next) {
  try{
    const existing = await Users.findBy({username: req.body.username})
    if(!existing.length){
      next()
    } else {
      next({"message": "Username taken"})
    }
  } catch (err){
    next(err)
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists (req, res, next) {
  try{
    const existing = await Users.findBy({username: req.body.username})
    if(existing.length){
      next()
    } else {
      next({status: 401, message: `Invalid credentials`})
    }
  } catch (err){
    next(err)
  }

}


/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
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

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree
}

const checkVinNumberUnique =  async (req, res, next) => {
  try{
    const existing = await Car.getByVin(req.body.vin)
    if(!existing){
     next()
    } else {
      next({status: 400, 
        message: `vin ${req.body.vin} already exists`})
    }
  } catch (err){
    next(err)
  }
}

// const Accounts = require('./accounts-model')
// const db = require('../../data/db-config');

// exports.checkAccountPayload = (req, res, next) => {
//   const error = {status: 400}
//   const { name , budget} = req.body
//   if ( name === undefined || budget === undefined ) {
//       error.message = 'name and budget are required'
//   } else if ( typeof name !== 'string') {
//     error.message = 'name of account must be a string'
//   } else if ( name.trim().length < 3 || name.trim().length > 100) {
//     error.message = 'name of account must be between 3 and 100'
//   } else if ( typeof budget !== 'number' || isNaN(budget)) {
//     error.message = 'budget of account must be a number'
//   }  else if ( budget < 0 || budget > 1000000 ) {
//     error.message = 'budget of account is too large or too small'
//   } 
//   if  (error.message) {
//     next(error)
//   } else {
//     next()
//   }
// }


// exports.checkAccountNameUnique = async (req, res, next) => {
//   try{
//     const existing = await db('accounts')
//     .where('name', req.body.name)
//     .first()

//     if(existing){
//       next({status: 400, message: `that name is taken`})
//     } else {
//       next()
//     }
//   } catch (err){
//     next(err)
//   }
// }

// exports.checkAccountId = async (req, res, next) => {
//   try {
//     const account = await Accounts.getById(req.params.id)
//     if(!account) {
//       next({status: 404, message: `account not found`})
//     } else {
//       req.account = account
//       next()
//     }
//   }catch(err) {
//     next(err)
//   }
// }