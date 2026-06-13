const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function setupDom(html = '<!doctype html><html><body></body></html>') {
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    return dom.window;
}

function loadScripts(window, scriptEntries) {
    scriptEntries.forEach((entry) => {
        const scriptPath = typeof entry === 'string' ? entry : entry.path;
        const attach = typeof entry === 'object' && Array.isArray(entry.attach) ? entry.attach : [];
        const expose = typeof entry === 'object' && Array.isArray(entry.expose) ? entry.expose : [];
        const fullPath = path.join(__dirname, '..', scriptPath);
        let code = fs.readFileSync(fullPath, 'utf8');

        if (attach.length) {
            attach.forEach((name) => {
                code += `\nwindow.${name} = ${name};`;
            });
        }
        if (expose.length) {
            code += '\nwindow.__testExports = window.__testExports || {};';
            expose.forEach((name) => {
                code += `\nwindow.__testExports.${name} = ${name};`;
            });
        }

        window.eval(code);
    });
}

module.exports = {
    setupDom,
    loadScripts
};
