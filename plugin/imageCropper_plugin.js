/*
 * imageCropper.js: Mirador plugin to detect highlighted image in the slot which has the current focus, then create a link to the cropping tool with
 *   the highlighted image canvasID
 * J B Howard - john.b.howard@ucd.ie - @john_b_howard - https://github.com/jbhoward-dublin
 *
 * configuration choices
 */

var configCropper = {
    "crop_path": "<path_to_installation>/index.html",
    "show_crop_link": true
}

var imageCropper = {
    
    /* the template & styles for the Cropper button */
    template_crop: Handlebars.compile([
    '</li>',
    '<li>',
    '<a class="crop hidden hidden-xs hidden-sm i18n" font-weight: bold; color: #FFF" target="_blank" data-i18n="croptool;[title]croptoolTooltip" title="Crop, resize download or create links to images" href>',
    '  imageEdit',
    '</a>',
    '</li>'].join('')),
    cropStyle: Handlebars.compile([
    '<style>',
    ' .crop { position:relative; top:1px; }',
    ' .crop:before { content: "\\F125"; font-family: FontAwesome; left:-18px; position:absolute; top:1px; }',
    '</style>'].join('')),
    
    /* injects the userButtons & associated styles into the viewer */
    injectUserButtonCrop: function () {
        var cropButton = this.template_crop();
        var cropStyle = this.cropStyle();
        $("body").append(cropStyle);
        var cropInjector = setInterval(appendCropButton, 200);
        /* wait for Mirador to inject userButtons into the DOM */
        function appendCropButton() {
            if (! $("a").hasClass("crop")) {
                if (configCropper[ 'show_crop_link'] == true) {
                    $("body > #viewer > div.mirador-main-menu-bar > ul.user-buttons").prepend(cropButton);
                }
                setTimeout(function () {
                    clearInterval(cropInjector);
                },
                10000);
            }
        }
        this.addCropLocalesToViewer();
    },
    
    /* adds  locales to the i18next localisation */
    addCropLocalesToViewer: function () {
        for (language in this.locales) {
            i18n.addResources(
            language, 'translation',
            this.locales[language]);
        }
    },
    
    /*
     * i18next locales - supplement
     */
    
    locales: {
        'en': {
            'crop': 'crop',
            'croptool': 'imageEdit',
            'croptoolTooltip': 'Capture image to your own specifications'
        },
        'ga': {
            'crop': 'Gearr amach',
            'croptool': 'Cuir eagar ar an íomhá',
            'croptoolTooltip': 'Gabh an íomhá de réir de shonraíocht féin'
        }
    },
    
    /*
     * functions
     */
    
    cropWorkspaceEventHandler: function () {
        var this_ = this;
        var originalListenForActions = Mirador.Workspace.prototype.listenForActions;
        var origFunc = Mirador.Workspace.prototype.bindEvents;
        Mirador.Workspace.prototype.bindEvents = function () {
            var _this = this;
            
            _this.eventEmitter.subscribe('manifestQueued', function (event, data) {
                //console.log('1: manifest queued');
                hideCropLink();
                return;
            })
            
            _this.eventEmitter.subscribe('manifestReceived', function (event, data) {
                //console.log('2: manifest received'); /* returns jsonLd */
                /*
                 * create a hash of canvasIDs => resourceIDs
                 * canvases["@id"] => this.resource.service["@id"]
                 *
                 */
                var canvasArray = data.jsonLd.sequences[0].canvases;
                var canvasID, imageID;
                for (var i = 0; i < canvasArray.length; i++) {
                    canvasID = canvasArray[i][ "@id"];
                    imageIDsToCanvasIDs[canvasID] = canvasArray[i].images[0].resource.service[ "@id"];
                }
                return;
            })
            
            _this.eventEmitter.subscribe('REMOVE_WINDOW', function (event, data) {
                //console.log('3: window removed');
                hideCropLink();
                if (getNumSlots() < 2) {
                    var currentImgID = $(".thumbnail-image.highlight").attr('data-image-id');
                    if (imageIDsToCanvasIDs[currentImgID] !== undefined) {
                        showCropLink(imageIDsToCanvasIDs[currentImgID]);
                        return;
                    }
                }
                return;
            })
            
            _this.eventEmitter.subscribe('REMOVE_NODE', function (event, data) {
                //console.log('4: node removed');
                hideCropLink();
            })
            
            _this.eventEmitter.subscribe('ADD_SLOT_ITEM', function (event, data) {
                //console.log('5: add slot item');            /* return data.Slot. { slotID | focused [true|false] */
                hideCropLink();
            })
            
            _this.eventEmitter.subscribe('ADD_WINDOW', function (event, data) {
                //console.log('6: window added');             /* returns data.state.slots.slotID ; data.state.slots.focused [true|false] */
                if (data.canvasID !== undefined) {
                    if (imageIDsToCanvasIDs[data.canvasID] !== undefined) {
                        showCropLink(imageIDsToCanvasIDs[data.canvasID]);
                        return;
                    }
                }
                return;
            })
            
            _this.eventEmitter.subscribe('SPLIT_RIGHT', function (event, data) {
                //console.log('7: split right');
                hideCropLink();
            })
            
            _this.eventEmitter.subscribe('SPLIT_LEFT', function (event, data) {
                //console.log('8: split left');
                hideCropLink();
            })
            
            _this.eventEmitter.subscribe('SPLIT_DOWN', function (event, data) {
                //console.log('9: split down');
                hideCropLink();
            })
            
            _this.eventEmitter.subscribe('SPLIT_UP', function (event, data) {
                //console.log('10: split up');
                hideCropLink();
            })
            origFunc.apply(this);
        }
    },
    
    /* ImageView & BookView  */
    addCropEventHandlersToViewer: function (viewType) {
        hideCropLink();
        var originalListenForActions = Mirador[viewType].prototype.listenForActions;
        var extendedListenForActions = function () {
            originalListenForActions.apply(this, arguments);
            
            this.eventEmitter.subscribe('windowUpdated', function (event, data) {
                //console.log('A: window updated');   /* returns objects with property data.id ; may also includes data.canvasID and data/loadedManifest */
                if (data.canvasID !== undefined && viewType !== undefined && getNumSlots() ==  1) {
                    var currentImgID = $.trim($(".thumbnail-image.highlight").attr('data-image-id'));
                    if (imageIDsToCanvasIDs[currentImgID] !== undefined) {
                        showCropLink(imageIDsToCanvasIDs[currentImgID]);
                        return;
                    }
                }
            }.bind(this));
        }
        Mirador[viewType].prototype.listenForActions = extendedListenForActions;
    },
    
    /* initialise plugin */
    init: function () {
        /* add event handlers to Mirador */
        this.cropWorkspaceEventHandler();
        this.addCropEventHandlersToViewer('ImageView');
        this.addCropEventHandlersToViewer('BookView');
    }
};

/*
 * local variables & functions
 */

var imageIDsToCanvasIDs = {
};

function showCropLink(imageID) {
    /*
     * old prototype: /crop/?id=ucdlib:30895&pid=ucdlib:30708
     * current prototype: /crop/?imageID={imageIDsToCanvasIDs[currentImgID]}
     */
     
    var link = configCropper[ 'crop_path'] + '?imageID=' + imageID;
    if ($("a.crop").is(".hidden")) {
        $("a.crop").removeClass("hidden");
    }
    $("a.crop").attr("href", link);
    return;
}

function hideCropLink() {
    if (! $("a.crop").is(".hidden")) {
        $("a.crop").addClass("hidden");
        $("a.crop").attr("href", "");
    }
    return;
}

function getNumSlots() {
    return $('div.panel-thumbnail-view img.highlight').length;
}

$(document).ready(function () {
    if (! $('a').hasClass("crop")) {
        imageCropper.injectUserButtonCrop();
    }
    imageCropper.init();
    if (getNumSlots() > 1) {
        hideCropLink();
    }
    $(document).click(function (event) {
        /* update crop link with ID of highlighted image in the selected slot */
        var target = $(event.target);
        if (target.is("canvas") || target.is("div")) {
            var current_canvas_id = target.closest("div.view-container").find("img.highlight").attr("data-image-id");
            if (imageIDsToCanvasIDs[current_canvas_id] !== undefined) {
                showCropLink(imageIDsToCanvasIDs[current_canvas_id]);
            }
        }
    });
});
