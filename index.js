const jsrender = require('jsrender');


class ModulerizrJsRenderPlugin {
    constructor(pluginconfig = {}) {
        this.internal = true;
        this.pluginconfig = pluginconfig;

        throwErrorIfDelimitersAreNotValid(pluginconfig.delimiters);
    }
    async apply(modulerizr) {
        modulerizr.plugins.on('afterRender', async() => {

            return modulerizr.store.$each("$.src.*/[data-component-instance]", ($currentComp, currentFile, currentPath, i) => {
                const embeddedComponentId = $currentComp.attr('data-component-instance');
                const embeddedComponent = modulerizr.store.queryOne(`$.embeddedComponents.id_${embeddedComponentId}`);
                const componentTemplate = modulerizr.store.queryOne(`$.component.id_${$currentComp.attr('id')}`);

                const params = Object.assign({}, embeddedComponent.attributes, componentTemplate.prerenderdata || {});

                if (this.pluginconfig.delimiters) {
                    jsrender.views.settings.delimiters(this.pluginconfig.delimiters[0], this.pluginconfig.delimiters[1])
                }
                if (this.pluginconfig.allowCode) {
                    jsrender.views.settings.allowCode(this.pluginconfig.allowCode);
                }
                if (this.pluginconfig.debugMode) {
                    jsrender.views.settings.debugMode(this.pluginconfig.debugMode);
                }

                const tmpl = jsrender.templates($currentComp.html().replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, "&")); // Compile template from string
                const renderedTemplate = tmpl.render(params);

                $currentComp.html(renderedTemplate);
            });
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