const Toast = (() => {
    const container = document.getElementById('toast-container');

    function show(message, type = 'info', duration = 3000) {
        if (!container) return;
        const el = Utils.createElement('div', { className: 'toast toast--' + type }, message);
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-12px)';
            el.style.transition = 'all 0.25s ease';
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
        }, duration);
    }

    function success(msg) { show(msg, 'success'); }
    function error(msg)   { show(msg, 'error'); }
    function info(msg)    { show(msg, 'info'); }

    return { show, success, error, info };
})();
