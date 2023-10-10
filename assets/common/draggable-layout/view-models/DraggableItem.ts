import NightClubHoverHalo from "../../../games/nightclub/scripts/NightClubHoverHalo";

const { ccclass, property } = cc._decorator;

const eventTarget = new cc.EventTarget();

window.addEventListener('message', e => {
    console.log("--> message from parent ", e['data']);
    
    if(e['data'] === "resetMoving")  {
        eventTarget.emit("resetMoving", e['data']);
    }
    
},false);

@ccclass
export default class DraggableItem extends cc.Component {
    @property({ type: cc.PolygonCollider })
    colliders: cc.PolygonCollider[] = [];

    @property(cc.Node)
    targetNode: cc.Node = null;

    get target(): cc.Node {
        return this.targetNode ?? this.node;
    }

    private startPosition = cc.v3(0, 0);
    private startTouchLocation = cc.v3(0, 0);

    private isTouchStarted = false;

    public touchCallback = {
        start: (node: cc.Node) => {},
        move: (touchPosition: cc.Vec2) => {},
        end: (isClicked: boolean) => {}
    };

    checkCollider(event): boolean {
        if (this.colliders.length === 0) {
            return true;
        }

        const touchLocation = event.touch.getLocation();
        return this.colliders.some((collider) => cc.Intersection.pointInPolygon(touchLocation, collider.world.points));
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
       

        this.node.on(cc.Node.EventType.MOUSE_MOVE, (e) => {
            window.parent.postMessage(JSON.stringify({type: "MOUSE_MOVE", data: {x: e._x, y: e._y}}), "*");
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, (e) => {
            window.parent.postMessage(JSON.stringify({type: "MOUSE_DOWN", data: {x: e._x, y: e._y}}), "*");
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_UP, (e) => {
            window.parent.postMessage(JSON.stringify({type: "MOUSE_UP"}), "*");
        }, this);

        eventTarget.on("resetMoving", (data) => {
            console.log("resetMoving");
            this.onTouchCancel(true);
        })
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart(e) {
        if (!this.checkCollider(e)) {
            console.log("not touch in collider");
            return;
        }
        this.isTouchStarted = true;
        this.touchCallback.start(this.node);
        this.startPosition = this.target.position;
        this.startTouchLocation = e.touch.getLocation();
    }

    onTouchMove(e) {
        if (!this.isTouchStarted) {
            return;
        }
        //this.target.position = e.touch.getLocation().sub(this.startTouchLocation).add(this.startPosition);
        //console.log("moved ", e.touch.getLocation().sub(this.startTouchLocation));
        
        const changed = e.touch.getLocation().sub(this.startTouchLocation);
        //console.log("changed", changed);
        if(Math.abs(changed.x) > 2 || Math.abs(changed.y) > 2){
            //window.parent.postMessage(JSON.stringify({x: changed.x, y: changed.y}), "*");
            this.startTouchLocation = this.startTouchLocation.add(cc.v3(changed.x, changed.y, 0));
            //console.log("moved ", this.target.position.x, this.target.position.y, this.startTouchLocation.x, this.startTouchLocation.y);
            //this.target.position =   e.touch.getLocation().sub(this.startTouchLocation).add(this.startPosition);
        }

        this.touchCallback.move(e.touch.getLocation());
    }

    onTouchEnd(e) {
        if (!this.isTouchStarted) {
            return;
        }

        //console.log("moved ", e.touch.getLocation().sub(this.startTouchLocation));
        //const changed = e.touch.getLocation().sub(this.startTouchLocation);
        //window.parent.postMessage(JSON.stringify({x: changed.x, y: changed.y}), "*");
        //window.parent.postMessage("touch-end", "*");
        
        this.isTouchStarted = false;
        this.touchCallback.end(e && this.isClicked(e));
    }

    isClicked(e): boolean {
        const delta = e.touch.getLocation().sub(this.startTouchLocation);
        return Math.abs(delta.x) + Math.abs(delta.y) < 10;
    }

    onTouchCancel(e) {
        if (!this.isTouchStarted) {
            return;
        }
        this.isTouchStarted = false;
        this.touchCallback.end(false);
    }
}
