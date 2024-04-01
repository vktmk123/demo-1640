exports.isAdmin = function(req, res, next) {
    if (req.session && req.session.admin)
      return next();
    else
      return res.sendStatus(401);
};

exports.isStudent = function(req, res, next) {
    if (req.session && req.session.student)
      return next();
    else
      return res.sendStatus(401);
};

exports.isQAM = function(req, res, next) {
    if (req.session && req.session.qam)
      return next();
    else
      return res.sendStatus(401);
};

exports.isQAC = function(req, res, next) {
  if (req.session && req.session.qac)
    return next();
  else
    return res.sendStatus(401);
};