const jsrender = require('jsrender');


class ModulerizrJsRenderPlugin {
    constructor(pluginconfig = {}) {
        this.internal = true;
        this.config = pluginconfig;
    }
    async apply(modulerizr) {
        modulerizr.plugins.on('afterRender', async() => {
            return modulerizr.store.$each("$.src.*", ($, currentFile, currentPath, i) => {
                const $components = $('[data-component-instance]');

                $components.each((i, e) => {
                    const $currentComp = $(e);
                    const embeddedComponentId = $currentComp.attr('data-component-instance');
                    const embeddedComponent = modulerizr.store.queryOne(`$.embeddedComponents.id_${embeddedComponentId}`);
                    const componentTemplate = modulerizr.store.queryOne(`$.component.id_${$currentComp.attr('id')}`);

                    const params = Object.assign({}, embeddedComponent.attributes, componentTemplate.data || {});

                    const tmpl = jsrender.templates($currentComp.html()); // Compile template from string
                    const renderedTemplate = tmpl.render(params);

                    $currentComp.html(renderedTemplate);
                });
            });
        });
    }
}

exports.ModulerizrJsRenderPlugin = ModulerizrJsRenderPlugin;