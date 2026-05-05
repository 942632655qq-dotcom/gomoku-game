const Utils = {
    createElement(tag, attrs = {}, ...children) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === 'className') { el.className = v; }
            else if (k.startsWith('on')) { el.addEventListener(k.substring(2).toLowerCase(), v); }
            else { el.setAttribute(k, v); }
        });
        children.forEach(child => {
            if (typeof child === 'string') { el.appendChild(document.createTextNode(child)); }
            else if (child instanceof Node) { el.appendChild(child); }
        });
        return el;
    },

    escape(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    empty(el) {
        while (el.firstChild) el.removeChild(el.firstChild);
    }
};
