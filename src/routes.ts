import {UserController} from "./controller/UserController";
import {AutomaticaController} from "./controller/AutomaticaController";

export const Routes = [{
    method: "get",
    route: "/import",
    controller: AutomaticaController,
    action: "all"
}, {
    method: "get",
    route: "/import/process",
    controller: AutomaticaController,
    action: "process"
},{
    method: "get",
    route: "/import/history",
    controller: AutomaticaController,
    action: "history"
}, {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all"
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one"
}, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save"
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove"
}];
