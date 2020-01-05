const jsrender = require('jsrender');

class ModulerizrJsRenderPlugin {
    constructor(pluginconfig = {}) {
        this.pluginconfig = pluginconfig;

        throwErrorIfDelimitersAreNotValid(pluginconfig.delimiters);
    }
    apply(compiler) {
        compiler.hooks.modulerizrFileRendered.tap('ModulerizrJsRenderPlugin', ($, file, modulerizr) => {
            if (this.pluginconfig.delimiters) {
                jsrender.views.settings.delimiters(this.pluginconfig.delimiters[0], this.pluginconfig.delimiters[1])
            }
            if (this.pluginconfig.allowCode) {
                jsrender.views.settings.allowCode(this.pluginconfig.allowCode);
            }
            if (this.pluginconfig.debugMode) {
                jsrender.views.settings.debugMode(this.pluginconfig.debugMode);
            }

            for (let embeddedComp of file.embeddedComponents) {
                const $comp = $(`[data-component-instance="${embeddedComp.id}"]`);
                const params = Object.assign({}, embeddedComp.attributes, embeddedComp.component.prerenderdata || {});

                const tmpl = jsrender.templates($comp.html().replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, "&")); // Compile template from string
                const renderedTemplate = tmpl.render(params);

                $comp.html(renderedTemplate);
            }
        });
    }
}

exports.ModulerizrJsRenderPlugin = ModulerizrJsRenderPlugin;

function throwErrorIfDelimitersAreNotValid(delimiters) {
    if (delimiters) {
        if (!Array.isArray(delimiters) || delimiters.length != 2)
            throw new Error('Error in ModulerizrJsRenderPlugin(config): config.delimiters must be an array with start- and endtag. Example: ["<$","$>]');
    }
}