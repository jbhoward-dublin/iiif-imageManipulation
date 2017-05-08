/*
 * croppingTool.js: manipulate images served via IIIF Image API via controls linked to IIIF parameters
 *   makes use of JCrop library for visual selection of image region & MagnificPopup for image preview
 *
 * J B Howard - john.b.howard@ucd.ie - @john_b_howard - https://github.com/jbhoward-dublin
 *
 */
var croptool = {
    
    /* initialise  */
    init: function () {
        this.crop();
    },
    
    crop: function () {
        
        var clipboard = new Clipboard('.btn');
        clipboard.on('success', function (e) {
            e.clearSelection();
            showTooltip(e.trigger, 'Copied!');
        });
        clipboard.on('error', function (e) {
            showTooltip(e.trigger, fallbackMessage(e.action));
        });
        function showTooltip(elem, msg) {
            $('.btn-copy-link').tooltip('hide');
            $('button.btn-copy-link').attr('data-placement', 'bottom');
            $('button.btn-copy-link').attr('data-original-title', msg);
            elem.setAttribute('aria-label', msg);
            $('.btn-copy-link').tooltip('show');
            $('button.btn-copy-link').attr('data-placement', 'right');
            $('button.btn-copy-link').attr('data-original-title', 'Copy link to clipboard');
            elem.setAttribute('aria-label', 'Copy link to clipboard');
        }
        
        /* page HTML */
        
        /* page intro: localise */
        var page_intro =
        '    <div class="crop-align">' +
        '        <div class="pull-left"><img src="img/ucd_logo_sm.png" style="max-height:32px;"></img></div>' +
        '        <h2>IIIF Image Manipulation Tool</h2>' +
        '        <h3>Crop and Re-size Images</h3>' +
        '        <div class="panel panel-default">' +
        '            <div class="panel-body">' +
        '                <h4>Create custom images by cropping and re-sizing images for download or linking</h4>' +
        '                <p>Using the steps below, you can select all or a portion of an image, and either download it or create a persistent link to it.</p>' +
        '                <!-- <p>Please visit our <a href="/help">Help</a> page for further information.</p> -->' +
        '            </div>' +
        '        </div>' +
        '    </div>';
        
        var page_end;
        
        var image_selection =
        '    <div class="crop-align">' +
        '        <div class="hidden image_error"></div>' +
        '        <h4>1: Select Image Area</h4>' +
        '        <p>Use the mouse (or a fingertip) to select all or a portion of an image in the Crop Box (or enter numbers in the coordinates boxes below).</p>' +
        '        <p id="set-select-all"><i class="fa fa-chevron-circle-right fa-lg" style="color: green;" aria-hidden="true"></i> You can also <a class="select_all">select the entire image</a>.</p>' +
        '    </div>';
        
        var image_display =
        '    <div id="interface" class="row text-center page-interface">' +
        '        <div class="crop-align">' +
        '            <img src id="target"/>' +
        '        </div>' +
        '    </div>';
        
        var image_navbox =
        '    <div class="nav-box">' +
        '        <form onsubmit="return false;" id="text-inputs" class="form form-inline">' +
        '            <div class="crop-align inp-group">' +
        '                <p class="coordinates-selected hidden">' +
        '                    <strong>Coordinates selected: </strong>' +
        '                    <b> X </b>' +
        '                    <input type="text" name="cx" id="crop-x"/>' +
        '                    <span class="inp-group">' +
        '                        <b> Y </b>' +
        '                        <input type="text" name="cy" id="crop-y"/>' +
        '                    </span>' +
        '                    <span class="inp-group">' +
        '                        <b> W </b>' +
        '                        <input type="text" name="cw" id="crop-w"/>' +
        '                    </span>' +
        '                    <span class="inp-group">' +
        '                        <b> H </b>' +
        '                        <input type="text" name="ch" id="crop-h"/>' +
        '                    </span>' +
        '                </p>' +
        '                <hr/>' +
        '                <h4>2: Select Image Size</h4>' +
        '                <p class="image-options">' +
        '                    <strong>Select output image width: </strong>' +
        '                    <label class="radio-inline" id="label_1280">' +
        '                        <input type="radio" name="img_width" id="xxl" value="1280"/> 1280px </label>' +
        '                    <label class="radio-inline" id="label_1024">' +
        '                        <input type="radio" name="img_width" id="xl" value="1024"/> 1024px </label>' +
        '                    <label class="radio-inline" id="label_800">' +
        '                        <input type="radio" name="img_width" id="lg" value="800" checked="checked"/> 800px </label>' +
        '                    <label class="radio-inline" id="label_400">' +
        '                        <input type="radio" name="img_width" id="md" value="400"/> 400px </label>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_width" id="th" value="150"/> 150px </label>' +
        '                    <label><span  class="textbox">' +
        '                        &#8212; <strong> other:&#8196;</strong>' +
        '                        <input type="text" name="img_width_other" id="ot" value="" data-toggle="tooltip" data-placement="top" title="enter an integer or &quot;full&quot;"/>' +
        '                    </span></label>' +
        '                    <span id="label_regionSquare" class="hidden">' +
        '                        <br />' +
        '                        <label class="radio-inline">' +
        '                            <input type="checkbox" name="img_square" id="sq"/> create a square image </label>' +
        '                    </span>' +
        '                </p>' +
        '                <!-- the following applies to UCD only -->' +
        '                <p>Tip: When downloading a full map sheet or very large image (width > 8000 pixels), select an output image value of 8000 or higher in the <strong>Other</strong> box. There is no need to add &apos;px&apos; to the end of the integer.</p>' +
        '                <hr/>' +
        '                <!-- add more options: rotate ; format ; quality -->' +
        '                <h4>3: Select Image Options</h4>' +
        '                <p class="image-options">' +
        '                    <strong>Select output image format: </strong>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_format" id="fmt_jpeg" value=".jpg" checked="checked"/> JPEG </label>' +
        '                    <label class="radio-inline hidden" id="label_png">' +
        '                        <input type="radio" name="img_format" id="fmt_png" value=".png"/> PNG </label>' +
        '                    <label class="radio-inline hidden" id="label_gif">' +
        '                        <input type="radio" name="img_format" id="fmt_gif" value=".gif"/> GIF </label>' +
        '                    <label class="radio-inline hidden" id="label_webp">' +
        '                        <input type="radio" name="img_format" id="fmt_webp" value=".webp"/> WEBP </label>' +
        '                    <label class="radio-inline hidden" id="label_tif">' +
        '                        <input type="radio" name="img_format" id="fmt_tif" value=".tif"/> TIFF </label>' +
        '                    <label class="radio-inline hidden" id="label_jp2">' +
        '                        <input type="radio" name="img_format" id="fmt_jp2" value=".jp2"/> JP2 </label>' +
        '                    <label class="radio-inline hidden" id="label_pdf">' +
        '                        <input type="radio" name="img_format" id="fmt_pdf" value=".pdf"/> PDF </label>' +
        '                </p>' +
        '                <p class="image-options">' +
        '                    <strong>Select output image rotation: </strong>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_rotation" id="rot0" value="0" checked="checked"/> 0 </label>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_rotation" id="rot90" value="90"/> 90 </label>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_rotation" id="rot180" value="180"/> 180 </label>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_rotation" id="rot270" value="270"/> 270 </label>' +
        '                    <label class="radio-inline hidden" id="label_mirroring">' +
        '                        <input type="radio" name="img_rotation" id="rot_mirror" value="!0"/> mirror rotation </label>' +
        '                    <label id="label_rotationArbitrary" class="hidden textbox">' +
        '                        &#8212; <strong> other: </strong>' +
        '                        <input type="text" name="img_rotation" id="rot_other" value=""/>' +
        '                    </label>' +
        '                </p>' +
        '                <p class="image-options">' +
        '                    <strong>Select output image quality: </strong>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_quality" id="qual_default" value="default" checked="checked"/> default </label>' +
        '                    <label class="radio-inline">' +
        '                        <input type="radio" name="img_quality" id="qual_colour" value="color"/> colour </label>' +
        '                    <label class="radio-inline hidden" id="label_greyscale">' +
        '                        <input type="radio" name="img_quality" id="qual_grey" value="grey"/> greyscale </label>' +
        '                    <label class="radio-inline hidden" id="label_bitonal">' +
        '                        <input type="radio" name="img_quality" id="qual_bitonal" value="bitonal"/> bitonal </label>' +
        '                </p>' +
        '                <input type="hidden" id="multiplier" name="multiplier"/>' +
        '                <hr/>' +
        '                <h4>4: Save or Link the image</h4>' +
        '                <p>Click on the &apos;Preview this image&apos; button to open your image in a new window for download. Right click on the image to save to your computer.</p>' +
        '                <p class="image-options">' +
        '                    <button id="get_url" data-mfp-src="" type="button" style="vertical-align:6px;" class="btn btn-primary btn-xs"><i class="fa fa-eye" aria-hidden="true"/>&#8194;Preview this' +
        '                        image</button>' +
        '                    <br/>' +
        '                    <button id="get_img" data-mfp-src="" type="button" style="vertical-align:6px;" class="btn btn-primary btn-xs">' +
        '                        <a href="" class="img_download" download="" style="color: #fff; text-decoration: none;"><i class="fa fa-download" aria-hidden="true"/>&#8194;Download this image</a>' +
        '                    </button>' +
        '                    <p>Or copy the URL below to create a persistent hyperlink to your custom image:</p>' +
        '                    <span class="nowrap"><input class="iiif_link" type="text" readonly="readonly" name="iiif" id="iiif" value/><button class="btn btn-xs btn-copy-link" data-clipboard-target="#iiif"><i class="fa fa-clipboard" aria-hidden="true"></i></button></span>' +
        '                </p>' +
        '            </div>' +
        '        </form>' +
        '    </div>';
        
        /* inject HTML */
        $("#cropping_tool").append(page_intro).append(image_selection).append(image_display).append(image_navbox);
        
        var imageID = getParameterByName('imageID');
        
        /* get metadata about requested image from IIIF server */
        var info_url = imageID + '/info.json';
        var result = {
        };
        
        $.ajax({
            async: true,
            url: info_url,
            dataType: "json",
            statusCode: {
                400: function () {
                    alert('400 status code! user error');
                    console.log('HTTP 400: Bad request');
                    showImageInfoLoadError(400);
                },
                401: function () {
                    console.log('HTTP 401: Not authorised');
                    showImageInfoLoadError(401);
                },
                403: function () {
                    console.log('HTTP 403: Forbidden');
                    showImageInfoLoadError(403);
                },
                404: function () {
                    console.log('HTTP 404: Not found');
                    showImageInfoLoadError(404);
                },
                500: function () {
                    console.log('HTTP 500: Server error');
                    showImageInfoLoadError(500);
                }
            },
            error: function (xhr) {
                console.log(xhr.status + ': request for image metadata failed with URL ' + info_url);
                showImageLoadError();
            },
            success: function (data) {
                result = data;
                getImageData();
            }
        });
        
        function showImageInfoLoadError(status_code) {
            $("#set-select-all").hide();
            switch (status_code) {
                case 400:
                $("#target").attr("src", "400-bad-request.png");
                break;
                case 401:
                $("#target").attr("src", "img/401-unauthorized.png");
                break;
                case 403:
                $("#target").attr("src", "img/403-forbidden.png");
                break;
                case 404:
                $("#target").attr("src", "img/404-not-found.png");
                break;
                case 500:
                $("#target").attr("src", "img/500-server-error.png");
                break;
                default:
                $("#target").attr("src", "400-bad-request.png");
            }
            return true;
        }
        
        function getParameterByName(name, url) {
            if (! url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
            if (! results) return null;
            if (! results[2]) return '';
            return results[2].replace(/\+/g, "%20");
        }
        
        function preload(arrayOfImages) {
            $(arrayOfImages).each(function () {
                $('<img/>')[0].src = this;
            });
        }
        
        function getImageData() {
            /* image info from info.json */
            var width = result.width;
            var height = result.height;
            var multiplier = (width / 800);
            $("#multiplier").val(multiplier);
            
            /* get image height and width ; use setInterval to account for latency */
            
            function get_target_details() {
                var img_display_size = document.getElementById('target');
                if (img_display_size.clientWidth == undefined) {
                    return false;
                }
                return img_display_size;
            }
            
            var iiif_rotation = '0';
            var iiif_format = '.jpg';
            var iiif_quality = 'default';
            var sizeAboveFull = false;
            
            /* API v. 1.0 and 1.1 use 'native' rather than 'default' */
            
            if (result[ '@context'] !== undefined) {
                if (result[ '@context'].match(/image\-api\/1\.1/) || result[ '@context'].match(/image\-api\/1\.0/)) {
                    iiif_quality = 'native';
                }
            } else if (result.qualities !== undefined) {
                iiif_quality = 'native';
            }
            
            if (result.profile.constructor == Array) {
                $.each(result.profile, function (index, value) {
                    if (value.formats !== undefined) {
                        $.each(value.formats, function (item, format) {
                            var attr_id = '#label_' + format;
                            $(attr_id).removeClass("hidden");
                        });
                    }
                    if (value.qualities !== undefined) {
                        $.each(value.qualities, function (item, quality) {
                            var attr_id = '#label_' + quality;
                            $(attr_id).removeClass("hidden");
                        });
                    }
                    if (value.maxWidth !== undefined) {
                        /* treat the maxWidth value as the actual width */
                        width = value.maxWidth;
                        if (width > 1280) {
                            var attr_id = 'label_' + '1280';
                            $(attr_id).addClass("hidden");
                        }
                        if (width > 1024) {
                            var attr_id = 'label_' + '1024';
                            $(attr_id).addClass("hidden");
                        }
                        if (width > 800) {
                            var attr_id = 'label_' + '800';
                            $(attr_id).addClass("hidden");
                        }
                        if (width > 400) {
                            var attr_id = 'label_' + '400';
                            $(attr_id).addClass("hidden");
                        }
                    }
                    if (value.supports !== undefined) {
                        $.each(value.supports, function (item, supported) {
                            if (supported == 'mirroring') {
                                var attr_id = '#label_' + supported;
                                $(attr_id).removeClass("hidden");
                            } else if (supported == 'rotationArbitrary') {
                                var attr_id = '#label_' + supported;
                                $(attr_id).removeClass("hidden");
                            } else if (supported == 'regionSquare') {
                                var attr_id = '#label_' + supported;
                                $(attr_id).removeClass("hidden");
                            } else if (supported == 'sizeAboveFull') {
                                sizeAboveFull = true;
                            }
                            /*
                             * other properties to support:
                             *     rotationBy90s
                             *     regionSquare
                             */
                        });
                    }
                });
            }
            
            var iiif_width;
            if (width < 800) {
                iiif_width = width + ',';
            } else {
                iiif_width = '800,';
            }
            
            var getTargetDetails, img_display_width, img_display_height;
            
            var getTargetInterval = setInterval(function () {
                getTargetDetails = get_target_details();
                if (getTargetDetails.clientWidth !== undefined) {
                    clearInterval(getTargetInterval);
                } else {
                    img_display_width = getTargetDetails.clientWidth;
                    img_display_height = getTargetDetails.clientHeight;
                }
            },
            500);
            
            /* image details for display on page */
            
            if (imageID !== undefined) {
                var uri_decoded = imageID + '/full/' + iiif_width + '/' + iiif_rotation + '/' + iiif_quality + iiif_format;
                preload([uri_decoded]);
                var loadImage = $('#target').attr("src", uri_decoded);
                
                var image_status = waitForImage();
                if (loadImage.naturalWidth !== "undefined" && loadImage.naturalWidth === 0) {
                    $('#target').attr("src", "img/404-not-found.png");
                    return false;
                }
                if (loadImage[0].complete && loadImage[0].naturalHeight !== 0) {
                    if (image_status == true) {
                        setSelectJcrop();
                    }
                } else {
                    loadImage.load(setSelectJcrop());
                }
                function setSelectJcrop() {
                    if (sel_x == undefined) {
                        return false;
                    }
                    $('#target').Jcrop({
                        setSelect:[sel_x, sel_y, sel_x1, sel_y1]
                    });
                }
            }
            
            $("input:radio[name=img_width]").click(function () {
                iiif_width = $(this).val() + ',';
            });
            
            $("input:text[name=img_width_other]").change(function () {
                if ($(this).val() == 'full') {
                    iiif_width = 'full';
                } else {
                    if ($(this).val() > width && sizeAboveFull == false) {
                        alert("Maximum allowed width is " + width + " pixels");
                        $("input[name='img_width_other']").val(width);
                        iiif_width = width + ',';
                    } else {
                        iiif_width = $(this).val() + ',';
                    }
                }
            });
            
            /* arbitrary image rotation */
            $("input:text[name=img_rotation]").change(function () {
                var degrees = $(this).val();
                if ((degrees + "").match(/^\d+$/)) {
                    if (degrees < 361) {
                        iiif_rotation = degrees;
                    } else {
                        console.log('bad value for image rotation');
                    }
                } else {
                    console.log('bad value for image rotation');
                }
            });
            
            $("input:radio[name=img_rotation]").click(function () {
                iiif_rotation = $(this).val();
            });
            $("input:radio[name=img_format]").click(function () {
                iiif_format = $(this).val();
            });
            $("input:radio[name=img_quality]").click(function () {
                iiif_quality = $(this).val();
            });
            
            var d = document, ge = 'getElementById';
            
            $('#interface').on('cropmove cropend', function (e, s, c) {
                var iiif_region = Math.round((c.x * multiplier)) + ',' + Math.round(c.y * multiplier) + ',' + Math.round(c.w * multiplier) + ',' + Math.round(c.h * multiplier);
                $('#iiif').attr('value', imageID + '/' + iiif_region + '/' + iiif_width + '/' + iiif_rotation + '/' + iiif_quality + iiif_format);
                $('#get_url').attr('data-mfp-src', imageID + '/' + iiif_region + '/' + iiif_width + '/' + iiif_rotation + '/' + iiif_quality + iiif_format);
                $('.img_download').attr('href', imageID + '/' + iiif_region + '/' + iiif_width + '/' + iiif_rotation + '/' + iiif_quality + iiif_format);
                
                d[ge]('crop-x').value = c.x;
                d[ge]('crop-y').value = Math.round(c.y);
                d[ge]('crop-w').value = c.w;
                d[ge]('crop-h').value = c.h;
            });
            
            /* set selection coords */
            var sel_x = Math.round(img_display_width / 4);
            var sel_y = Math.round(img_display_height / 4);
            var sel_x1 = Math.round(img_display_width / 2);
            var sel_y1 = Math.round(img_display_height / 2);
            
            $(".select_all").click(function () {
                console.log('select_all');
                if (img_display_height == 0) {
                    var getTargetDetails = get_target_details();
                    img_display_width = getTargetDetails.clientWidth;
                    img_display_height = getTargetDetails.clientHeight;
                }
                $('#target').Jcrop('api').animateTo([
                0, 0, img_display_width, img_display_height]);
            });
            
            var src;
            if (imageID !== undefined) {
                src = imageID + '/full/800,/0/' + iiif_quality + '.jpg';
            }
            
            $('#text-inputs').on('change', 'input', function (e) {
                $('#target').Jcrop('api').animateTo([
                parseInt(d[ge]('crop-x').value),
                parseInt(d[ge]('crop-y').value),
                parseInt(d[ge]('crop-w').value),
                parseInt(d[ge]('crop-h').value)]);
            });
            
            /* there can be significant latency loading the image, so ... */
            function waitForImage() {
                img_display_size = document.getElementById('target');
                if (img_display_size.clientWidth > 0) {
                    //console.log('image loaded...')
                    $('p.wait-spinner').hide();
                    img_display_width = img_display_size.clientWidth;
                    img_display_height = img_display_size.clientHeight;
                    var sel_x = Math.round(img_display_width / 4);
                    var sel_y = Math.round(img_display_height / 4);
                    var sel_x1 = Math.round(img_display_width / 2);
                    var sel_y1 = Math.round(img_display_height / 2);
                    $('#target').Jcrop({
                        setSelect:[sel_x, sel_y, sel_x1, sel_y1]
                    });
                } else {
                    setTimeout(function () {
                        waitForImage();
                    },
                    250);
                }
                return true;
            }
            
            if (img_display_width > 0) {
                $('p.wait-spinner').hide();
            } else {
                var tmp = waitForImage();
            }
        }
        
        /* popup a preview image */
        $('#get_url').magnificPopup({
            type: 'image'
        });
        
        /* initialise boostrap tooltips */
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
        
        /* toggle hide/show more options - not implemented */
        $('#iiif_format-switch').on('show', function () {
            $('#iiif_format-switch').html('hide options');
        });
        $('#iiif_format-switch').on('hide', function () {
            $('#iiif_format-switch').html('more options');
        });
    }
}

$(document).ready(function () {
    croptool.init();
});
