# IIIF-imageManipulation
Stand-alone implementation of UCD's IIIF image re-formatting tool + plugin to integrate with Mirador IIIF-compliant image viewer.

To add to your project, install index.html in a directory with the sub-directories js and img. Once installed, usage syntax is:

```
/dirname/index.html?imageID={IIIF_image_id}
```
where IIIF_image_id is the image resource identifier from a IIIF manifest (the identifier presented to a IIIF Image API server). For example:
```
/dirname/index.html?imageID=https://iiif.ucd.ie/loris/ivrla:3858
```
To integrate with Mirador, install the plugin file ```mirador-lugin-imageManip.js``` and in Mirador startup file, add to windowSettings: "imageManip": true. In the Mirador startup file, also add the following line after the script reference to ```mirador.js```:

```<script src="/<your_plugin_path>/mirador-plugin-imageManip.js"></script>```

## Demo

A demo of the IIIF-imageManipulation tool is available at https://jbhoward-dublin.github.io/IIIF-imageManipulation/index.html?imageID=https://iiif.ucd.ie/loris/ivrla:10408.

Additional IIIF image IDs to try include:

* https://jbhoward-dublin.github.io/IIIF-imageManipulation/index.html?imageID=https://images.britishart.yale.edu/iiif/3b437776-3278-42dc-9daf-e881d8934c66
* https://jbhoward-dublin.github.io/IIIF-imageManipulation/index.html?imageID=https://media.nga.gov/iiif/public/objects/5/7/6/576-primary-0-nativeres.ptif

<kbd>
<img alt="demo image" src="https://github.com/jbhoward-dublin/jbhoward-dublin.github.com/blob/master/IIIF-imageManipulation/demo/IIIF-imageManipulation_demo-01.gif"></img>
</kbd>
