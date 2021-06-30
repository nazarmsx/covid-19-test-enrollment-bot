const bcrypt = require('bcrypt');
import {Admin, AdminDocument} from "../models/Admin";
const prompt = require('prompt');
import app from "../app";

const schema = {
  properties: {
    login: {
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      required: true
    },
    password: {
      hidden: true
    }
  }
};


prompt.start();

prompt.get(schema, function (err:any, result:any) {
  let a=app.request;

  createAdminUser(result.login,result.password).then(data=>{
     console.log('Admin created');
     process.exit(1);
   }).catch(er=>{
     console.error(er)
     process.exit();
   });
});

export async function createAdminUser (login:string,password:string) {
  let salt=await bcrypt.genSalt(10);
  let hash=await bcrypt.hash(password,salt);
  return await Admin.create({
    login:login,
    password:hash,
    salt:salt,
    createdAt:new Date(),
    updatedAt:new Date(),
    claims:{"superAdmin" : true}
  });
}