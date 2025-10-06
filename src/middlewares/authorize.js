

const authorize = (action) => {
    return async (req, res, next) => {
        // const userRole = req.user.role;
        // // await saveUserActivity(req.user.id, action)

        // if(userRole === "sub_admin" && req.user.permissions instanceof Array){
        //     const allowed = req.user.permissions.some((perm) => commonAdminPermissions.includes(action) ||  subAdminPermissions[perm].includes(action))
        //     if(allowed) return next();
        // }

        // if (userRole !== "sub_admin" && roles[userRole] && roles[userRole].permissions.includes(action)) {
        //     return next();
        // }

        // return sendFailure(res, 'Permission denied', 'Permission denied', 403);

          return next();
    };
};

export default authorize;