const { ccclass, property } = cc._decorator;
import GameUtils from "../../common/GameUtils";
import GameViewBase from "../../games/_base/GameViewBase";
import { Socket } from "socket.io-client";
import SocketIOController from "../../SocketIOController";
import { lazyInject } from "../../Application";

cc.macro.ENABLE_TRANSPARENT_CANVAS = true;

@ccclass
export default class MiniGameLobby extends cc.Component {
    @property(cc.Node)
    containerNode: cc.Node = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    protected onLoad(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get("gameId");
        this.openNewSocket(+gameId);

        setTimeout(() => {
            document.getElementsByTagName("body")[0].style.backgroundImage = "url('./bg3.acc40.png')";
            document.getElementsByTagName("body")[0].style.backgroundSize = "82% 98%";
            document.getElementsByTagName("body")[0].style.backgroundRepeat = "no-repeat";
            document.getElementsByTagName("body")[0].style.backgroundImage = "55px -8px";
        }, 2000);        
    }

    async openNewSocket(gameId) {
        let socket: Socket = this.socketIOController.getSocketGame(gameId);
        

        if (socket && socket.connected) {
            this.openMiniGame(gameId);
        } else {
            const multiplay = this.socketIOController.isMultiplayGame(gameId);
            if (socket && multiplay) {
                socket.removeAllListeners();
                socket.connect();
            } else {
                socket = this.createMiniGameSocket(gameId, true);
            }
            const gameName = await GameUtils.getDisplayGameName(gameId);
            this.initMiniGameSocketListeners(socket, gameId, gameName, null);
            socket.on("signedIn", () => {                
                this.openMiniGame(gameId);
            });
        }
    }

    createMiniGameSocket(gameId: number, forceNew: boolean): Socket {
        return this.socketIOController.openMiniGameSocket(gameId, forceNew);
    }

    initMiniGameSocketListeners(socket, gameId: number, gameName: string, gameContainer: any) {
        const listenerOptions = {
            gameId,
            gameName,
            onConnectFailed: (name, gameId, isGameRoom) => {
                if (gameContainer && gameContainer.hideContainer) {
                    gameContainer.hideContainer();
                }
            },
            isGameRoom: false,
            gameContainer
        };
        this.socketIOController.initBaseListeners(socket, listenerOptions);

        this.handleSocket(socket, gameId);
    }

    public handleSocket(socket, gameId) {
        socket.on("message", (data) => {            
            console.log("handle socket data ", data);
        });

        socket.on("forceDisconnect", () => {
            socket.disconnect();
        });
    }

    async openMiniGame(gameId) {
        // post message to hide mini game menu

        // loading here
        
        try {
            const gameName = GameUtils.getGameNameString(gameId);
            console.time("LoadScene " + gameName);
            const prefab = await GameUtils.loadMiniGamePrefab(gameId, (completedCount, total, item) => {
                
            });
            
            console.timeEnd("LoadScene " + gameName);

           
            

            const node = cc.instantiate(prefab);
            const gameComponent = node.getComponent(GameViewBase);
            gameComponent.initMiniPanel(null);
            this.containerNode.addChild(gameComponent.node);
            gameComponent.openGame();
        } catch (error) {
            //console.error(error);            
        }
    }
}