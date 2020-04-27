const ConnectRoles = require('connect-roles');
const Permission = require('app/models/permission');

let gate = new ConnectRoles({
    failureHandler: function (req, res, action) {
        // optional function to customise code that runs when
        // user fails authorisation
        let accept = req.headers.accept || '';
        res.status(403);
        if (accept.indexOf('html')) {
            res.render('errors/403', {
                action
            });
        } else {
            res.send('Access Denied - You don\'t have permission to: ' + action);
        }
    }
});

let permissions = async () => {
    return await Permission.find({}).populate('roles').exec();
}

permissions()
    .then(permissions => {
        permissions.forEach(permission => {
            let roles = permission.roles.map(item => item._id); // return roles id
            gate.use(permission.name , (req) => {
                if(req.isAuthenticated()) {
                    return req.user.hasRole(roles);
                } else {
                    return false;
                }
            });
        });
    })
    .catch(err => console.log(err));

module.exports = gate;