function checkDom(dom) {
    return dom && dom.addEventListener;
}

class ClickOutSide {

    constructor(container) {
        this.container = null;
        this.doms = [];
        this.inited = false;
        this._containerClickEvents = [];
        this._frameId = null;
        this.init(container);
    }

    init(container) {
        if (this.inited) {
            return this;
        }
        container = container || document.body;
        if (!checkDom(container)) {
            console.error(container, 'is not dom');
            return this;
        }
        this.container = container;
        this.inited = true;
        this._containerClick = this.containerClick.bind(this);
        this.container.addEventListener('click', this._containerClick);
        this._loop = this.loop.bind(this);
        this._frameId = requestAnimationFrame(this._loop);
    }

    loop() {
        if (this._containerClickEvents.length) {
            const len = this._containerClickEvents.length;
            const event = this._containerClickEvents[len - 1];
            const { clientX, clientY } = event;
            this.doms.forEach(dom => {
                if (!dom.getBoundingClientRect) {
                    return;
                }
                const rect = dom.getBoundingClientRect();
                const { left, top, right, bottom } = rect;
                const inRect = clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;
                if (inRect) {
                    const event = new Event('clickinside');
                    dom.dispatchEvent(event);
                }
                if (!inRect) {
                    // domHide(dom);
                    const event = new Event('clickoutside');
                    dom.dispatchEvent(event);
                }
            });
        }
        this._containerClickEvents = [];
        this._frameId = requestAnimationFrame(this._loop);
    }

    containerClick(e) {
        this._containerClickEvents.push(e);
    }

    addDom(dom) {
        if (!checkDom(dom)) {
            console.error(dom, 'is not dom');
            return this;
        }
        if (!this.inited) {
            console.error('not init');
            return this;
        }
        const index = this.doms.indexOf(dom);
        if (index >= 0) {
            return this;
        }
        this.doms.push(dom);
        return this;
    }

    removeDom(dom) {
        if (!checkDom(dom)) {
            console.error(dom, 'is not dom');
            return this;
        }
        if (!this.inited) {
            console.error('not init');
            return this;
        }
        const index = this.doms.indexOf(dom);
        if (index === -1) {
            return this;
        }
        this.doms.splice(index, 1);
        return this;
    }

    dispose() {
        cancelAnimationFrame(this._frameId);
        this.container.removeEventListener('click', this._containerClick);
        this.doms = null;
        this.container = null;
        this.inited = false;
        this._loop = null;
        this._containerClick = null;
        this._containerClickEvents = null;
        return this;
    }
};
export function create(container) {
    return new ClickOutSide(container);
}
