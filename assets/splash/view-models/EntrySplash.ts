// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { storeSessionData } from "../../common/auth/SessionManager";
import { initialize as initializeGameConfigurations } from "../../configs/GameConfigurations";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        
        if(mode === "minigame"){
            const session = JSON.parse(window.atob((urlParams.get("session"))));
            storeSessionData(session);
            initializeGameConfigurations().then(value => {
                cc.director.loadScene("MiniGameLobby");
            });
        }
        else{
            cc.director.loadScene("Splash");
        }
    }   

    start () {

    }

    // update (dt) {}
}
