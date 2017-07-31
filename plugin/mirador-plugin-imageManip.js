var ImageManip = {
  /* options of the plugin */
  /*
   * in Mirador startup file, add to windowSettings: "imageManip": true
   */
  options: {},
  
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
  '.window-manifest-title { max-width:60%!important; }',
  '.mirador-container .window-manifest-navigation { min-width:34%!important; }',
  '.hidden-mirador-sm { display:none!important; }',
  '@media screen and (min-width:596px){ .hidden-mirador-sm {display:inline!important;} }',
  '.mirador-container .window-manifest-title { font-size: 14px!important; }',
  '.mirador-icon-canvas-crop { color: inherit; }',
  '</style>'].join('')),
  
  /* template for the imageManip button */
  cropTemplate: Mirador.Handlebars.compile([
  '<div class="local-cropping-controls">',
  '<a title="{{t "crop-canvas-image"}}" class="mirador-btn mirador-icon-canvas-crop hud-control showImageEdit" target="_blank" name="showImageEdit" aria-label="{{t "crop-canvas-image"}}">',
  '<i class="fa fa-lg fa-fw fa-crop"></i>',
  '</a>',
  '</div>'].join('')),
  
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
  
  /* injects the button to the canvas controls */
  injectButtonToMenu: function () {
    var this_ = this;
    var origFunc = Mirador.Hud.prototype.init;
    Mirador.Hud.prototype.init = function () {
      origFunc.apply(this);
      if (this.element.find('.mirador-icon-canvas-crop').length > 0) {
        return;
      }
      if (this.appendTo.hasClass('image-view')) {
        var button = $(this_.cropTemplate());
        button.appendTo(this.appendTo.find('.mirador-osd-context-controls'));
      }
    };
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
      if (windowSettings.plugins.imageManip && windowSettings.plugins.imageManip.showImageEdit == true) {
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
        this_.setSavedPreferences();
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
      
      updateAboutLink(_this.manifest.uri, _this.canvasID);
      
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
  
  /* restore any saved preferences from local storage */
  setSavedPreferences: function (context) {
    /* read saved settings from local storage, then update menu and buttons */
    var savedPreferences_buttons = localStorage.getItem('dl_settings_buttons');
    var savedPreferences_userButtons = localStorage.getItem('dl_settings_userButtons');
    //var savedPreferences_plugins = localStorage.getItem('dl_settings_plugins');
    
    if (savedPreferences_buttons) {
      updateSettings(savedPreferences_buttons);
    }
    if (savedPreferences_userButtons) {
      updateSettings(savedPreferences_userButtons);
    }
    
    function updateSettings(settings) {
      /* updates both menu settings and menu buttons */
      $.each(JSON.parse(settings), function (key, val) {
        var className = 'a.' + key;
        var mainMenuClasses = {
          'a.bookmark': 'a.bookmark-workspace', 'a.changeLayout': 'a.change-layout', 'a.fullScreen': 'a.fullscreen-viewer', 'a.canvasLink': 'a.shareButtons'
        };
        if (mainMenuClasses[className] && mainMenuClasses[className].length) {
          className = mainMenuClasses[className];
        }
        if ($.type(val) == 'boolean') {
          var counter = 0;
          var setLinks = setInterval(function () {
            if ($(className).length) {
              counter++
              if (val == true) {
                $(className).removeClass('noshow');
                $('.window-options-item[name=key]').attr('checked', '');
              } 
              else {
                $(className).addClass('noshow');
                $('.mirador-container #window-options-panel .window-options-item[name="' + key + '"]').removeAttr('checked');
              }
              clearInterval(setLinks);
            } else {
              counter++;
              if (counter > 29) {
                clearInterval(setLinks);
              }
            }
          },
          100);
        } else if ($.type(val) == 'object') {
          var counter = 0;
          var irrelevantKeys =[ 'label', 'plugin'];
          $.each(val, function (objKey, objVal) {
            /* skip irrelevant keys */
            if ($.inArray(objKey, irrelevantKeys) !== -1) {
              return;
            }
            className = 'a.' + objKey;
            var setObjLinks = setInterval(function () {
              if ($(className).length) {
                if (objVal == false) {
                  $('a.shareButtons').addClass('noshow');
                  $('.mirador-container #window-options-panel .window-options-item[name="' + objKey + '"]').removeAttr('checked');
                } else {
                  $(className).removeClass('noshow');
                  $('.mirador-container #window-options-panel .window-options-item[name="' + objKey + '"]').attr('checked', '');
                }
                clearInterval(setObjLinks);
              } else {
                counter++;
                if (counter > 80) {
                  clearInterval(setObjLinks);
                }
              }
            },
            100);
          });
        }
      });
    }
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

function updateAboutLink(manifestURI, canvasID) {
  /* the About Link is pertinent only to UCD */
  if (canvasID.includes("ucd.ie")) {
    if ($('.link-about').hasClass("hidden")) {
      $('.link-about').removeClass("hidden")
    }
    var pid = manifestURI.substring(manifestURI.indexOf("/manifests/") + 11);
    $('.link-about').attr("href", "/view/" + pid);
  } 
  else if ($('.link-about') !== undefined) {
    $('.link-about').addClass("hidden");
  }
}

$(document).ready(function () {
  ImageManip.init();
});
