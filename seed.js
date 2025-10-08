import { generateHashedPassword } from "#api/v1/helpers/session.js";
import { denormalizeEntity } from "#application/application.js";
import Role from "#models/role.js";
import User from "#models/users.js";
import dynamodb from '@techveda/node-dynamodb';
import shortUUID from "short-uuid";
const { initDynamoDB } = dynamodb;

initDynamoDB()

const admins = [
    //name should be in lowercase
    {name: "super admin", email: "super_admin_premika@gmail.com", phone_number: "9999999999", password: "1234567812345678", role: "super_admin", entity: "USER"},
    {name: "admin", email: "admin_premika@gmail.com", phone_number: "8888888888", password: "1234567812345678", role: "admin", entity: 'USER'},
]

const roles = [
    { name: "admin", permissions: [], permission_ids: []},
    { name: "super_admin", permissions: [], permission_ids: []},
    { name: "user", permissions: [], permission_ids: []}
]

const createRoleAndAdmins = async () => {
    try {
        //create roles before creating admin/super_admin
        for(const role of roles){
            const {name} = role;

            const data = await Role.find({PK: "ROLE",name});
            const roleExists = data.data[0]
            if(roleExists){
                console.log(`role ${name} already exists`);
                continue;
            }

            const role_id = shortUUID().new();
            const newRole = await Role.create({
                ...role,
                id: role_id,
                PK: "ROLE",
                SK: `ROLE#${role_id}`
            });
            console.log(`role ${name} with id ${newRole.id} created successfully.`)
        }


        for(const adminData of admins){
            const {name, email, phone_number, role: roleName, password } = adminData
            
            const {data} = await User.find({PK: `USER#${email}`})
            if(data.length > 0){
                console.log(`Admin with name ${name} and email ${email} already exists.`);
                continue;
            }
            
            const {data: roleData} = await Role.find({PK: "ROLE", name: roleName})
            const role = roleData[0];
            adminData.password = await generateHashedPassword(password)
            await User.create({
                ...adminData,
                id: shortUUID().new(),
                PK: `USER#${email}`,
                SK: `ADMIN`,
                role: DenormalizeRole(role),
                role_id: role.id
            });
            console.log(`Admin ${name} with email id ${email} created successfully`)
        }
    } catch (error) {
        console.log("something went wrong", error);
    }
}

createRoleAndAdmins();

const DenormalizeRole = (data) => {
    return denormalizeEntity(data, ["id", "name", "role", "permissions", "permission_ids", "entity"])
}
