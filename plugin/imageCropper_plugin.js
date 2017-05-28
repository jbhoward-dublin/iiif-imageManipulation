var ImageManip = {
    /* options of the plugin */
    /* 
     * in Mirador startup file, add to windowSettings: "imageManip": true
     */
    options: {
    },
    
    /* i18next locales */
    locales: {
        'en': {
            'crop-canvas-image': 'Crop, edit &amp save image'
        },
        'ga': {
            'crop-canvas-image': 'Gearr amach'
        }
    },
    /* template for CSS styles */
    styleTemplate: Mirador.Handlebars.compile([
    '<style>',
    '.mirador-container .window-manifest-title { font-size: 14px!important; }',
    '</style>'].join('')),
    
    /* template for the imageManip button */
    cropTemplate: Mirador.Handlebars.compile([
    '<a title="{{t "crop-canvas-image"}}" class="mirador-btn mirador-icon-canvas-crop" target="_blank" aria-label="{{t "crop-canvas-image"}}" style="position: relative!important; padding-right:6px;">',
    '<i class="fa fa-lg fa-fw fa-crop" style="color:green;"></i>',
    '</a>'].join('')),
    
    /* initializes the plugin */
    init: function () {
        i18next.on('initialized', function () {
            this.addLocalesToViewer();
        }.bind(this));
        this.injectStylesToDom();
        this.setPluginOptions();
        this.injectWorkspaceEventHandler();
        this.injectWindowEventHandler();
    },
    
    /* injects the button to the window menu */
    injectButtonToMenu: function (windowButtons) {
        if (this.options.imageManip && this.options.imageManip == true) {
            $(windowButtons).prepend(this.cropTemplate());
        }
    },
    
    /* inject style template */
    injectStylesToDom: function () {
        var this_ = this;
        document.body.insertAdjacentHTML('beforeend', this_.styleTemplate());
    },
    
    /* set local options */
    setPluginOptions: function () {
        var this_ = this;
        var origFunc = Mirador.Viewer.prototype.setupViewer;
        Mirador.Viewer.prototype.setupViewer = function () {
            origFunc.apply(this);
            var windowSettings = this.state.currentConfig.windowSettings;
            if (windowSettings.imageManip && windowSettings.imageManip == true) {
                ImageManip.options[ "imageManip"] = true;
            }
        };
    },
    
    /* inject workspace event handler */
    injectWorkspaceEventHandler: function () {
        var this_ = this;
        var origFunc = Mirador.Workspace.prototype.bindEvents;
        Mirador.Workspace.prototype.bindEvents = function () {
            origFunc.apply(this);
            this.eventEmitter.subscribe('WINDOW_ELEMENT_UPDATED', function (event, data) {
                var windowButtons = data.element.find('.window-manifest-navigation');
                this_.injectButtonToMenu(windowButtons);
            });
        };
    },
    
    /* inject window event handler */
    injectWindowEventHandler: function () {
        var this_ = this;
        
        var origFunc = Mirador.Window.prototype.bindEvents;
        Mirador.Window.prototype.bindEvents = function () {
            origFunc.apply(this);
            var localDomain = document.location.origin;
            _this = this;
            
            var canvasID = this.canvasID;
            var current_slot_id = $('.highlight[data-image-id="' + canvasID + '"]').closest("div.layout-slot").attr('data-layout-slot-id');
            
            this.element.find('.mirador-icon-canvas-crop').on('click', function () {
                var currentImage = this.imagesList[ this.focusModules[ this.viewType].currentImgIndex];
                if (this_.options.imageManip && this_.options.imageManip == true) {
                    var cropLink = localDomain + '/crop/index.html?imageID=' + Mirador.Iiif.getImageUrl(currentImage);
                    $('a.mirador-icon-canvas-crop').attr("href", cropLink);
                }
            }.bind(this));
        };
    },
    
    /* add the locales to the internationalisation module (i18next) of the viewer */
    addLocalesToViewer: function () {
        for (var language in this.locales) {
            i18next.addResources(
            language, 'translation',
            this.locales[language]);
        }
    },
};

$(document).ready(function () {
    ImageManip.init();
});

