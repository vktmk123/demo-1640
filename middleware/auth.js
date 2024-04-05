exports.isAdmin = function (req, res, next) {
  if (req.session && req.session.admin) return next();
  else return res.sendStatus(401);
};

exports.isStudent = function (req, res, next) {
  if (req.session && req.session.student) return next();
  else return res.sendStatus(401);
};

exports.isMng = function (req, res, next) {
  if (req.session && req.session.manager) return next();
  else return res.sendStatus(401);
};

exports.isDean = function (req, res, next) {
  if (req.session && req.session.Dean) return next();
  else return res.sendStatus(401);
};
