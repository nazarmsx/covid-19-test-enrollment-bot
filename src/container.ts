import "reflect-metadata";

import {container} from "tsyringe";
import {DBService, UserService} from "./services";
import {BotFlow} from "./bot-utils";

container.register<UserService>(UserService, {useClass: UserService});
container.register<DBService>(DBService, {useClass: DBService});
container.register<BotFlow>(BotFlow, {useClass: BotFlow});


export default container;