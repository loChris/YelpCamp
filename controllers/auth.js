const User = require('../models/user')

module.exports.registerShow = (req, res) => {
  res.render('auth/register')
}

module.exports.registerNewUser = async (req, res) => {
  try {
    const { email, username, password } = req.body
    const user = new User({
      email,
      username
    })
    const newUser = await User.register(user, password)
    req.login(newUser, (error) => {
      if (error) {
        return next(error)
      } else {
        req.flash('success', 'Welcome to Yelp Camp!')
        res.redirect('/campgrounds')
      }
    })
  } catch (error) {
    req.flash('error', error.message)
    res.redirect('register')
  }
}

module.exports.loginShow = (req, res) => {
  res.render('auth/login')
}

module.exports.loginUser = (req, res) => {
  req.flash('success', 'Welcome Back!')
  res.redirect('/campgrounds')
}

module.exports.logoutUser = (req, res) => {
  req.logout()
  req.flash('success', 'Goodbye!')
  res.redirect('/campgrounds')
}
