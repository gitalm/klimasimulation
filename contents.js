// injected content for the js goes in here

var contentsData = {
    // Set the width at which the menu should switch from horizontal to vertical.
    // If not provided, will be calculated from menu contents.
    // menuStyleSwitch: 750,

    // Set this to your homefolder in order to allow for subfolder corrections on the injected menubar
    homeFolderName: "DesignOurClimate",

    //set the default folder depth of the link a positive number is needed
    folderDepth: 1,

    // allows for path corrections to be made to a different external folder
    // appletPath: null,


    // To use the applet path correction the following 3 lines of code will need to be added to the page specific js
    // You will also need to use appletPath + "link" instead of folderPath + "link" to make use of this additional correction 
    // appletPath = folderPath;
    // if (contentsData.hasOwnProperty("appletPath")) {
    // appletPath = folderPath + contentsData.appletPath;


    //menubar injection content
    //all strings should be surrounded by double qoutes
    //unused variables should be left as null without qoutes
    //links should be entered like this: "../index.html" or "index.html"depending on where they point
    //code should be added like this 'onclick="createWindow(\'about\')"' where the entire code snippet is wrapped in single qoutes(''), the function is wrapped in double qoute(""), and any passed in strings are wrapped in escaped single qoutes (\'\')

    menuBarContents: [
        // { "name": "Home", "link": null, "code": 'onclick="pageCollection.setCategoryAndPage(\'noCat\', \'helpPage\');"', "submenu": null },
        {
            "name": "Home",
            "link": null,
            "code": null,
            "submenu": [
                { "name": "DOCS Introduction Page", "link": null, "code": 'onclick="createIntroWindow();"' },
                { "name": "Climate Solutions home", "link": "https://climateSolutions.kcvs.ca", "code": 'target="_blank"' },
                { "name": "Explaining Climate Change home", "link": "https://explainingclimatechange.com", "code": 'target="_blank"' }
            ]
        },
        { "name": "Reset", "link": null, "code": 'onclick="resetSim()"', "submenu": null },
        { "name": "Summary", "link": null, "code": 'onclick="openSummary()"', "submenu": null },
        // { "name": "References", "link": null, "code": 'onclick="window.open(\'references.html\')"', "submenu": null },
        { "name": "References", "link": null, "code": 'onclick="showReferencesPage()"', "submenu": null },
        // { "name": "About", "link": null, "code": 'onclick="openAbout()"', "submenu": null },
        {
          "name": "About",
          "link": null,
          "code": null,
          "submenu": [
              { "name": "About DOCS", "link": null, "code": 'onclick="openAbout()"' },
              { "name": "Reference Summary", "link": "referenceSummary.html", "code": 'target="_blank"' },
          ]
      },
        {
            "name": "Help",
            "link": null,
            "code": null,
            "submenu": [
                { "name": "Instructions", "link": null, "code": "onclick='pageCollection.showHelp();'" },
                { "name": "Glossary", "link": null, "code": 'onclick="openGlossary()"' },
                // This tutorial link will be replaced in JavaScript to append any additional URL parameters required.
                { "name": "Tutorial (new window)", "link": "DesignOurClimateSim.html?mode=quest", "code": 'id="tutorialLink" target="_blank"' },
                { "name": "Teaching Resources", "link": "https://docs.google.com/document/d/1IrLSnr5PdPVo9GGz6kCCAS19tRCu3sJVFQ0rNDLEBxg/edit?usp=sharing", "code": 'target="_blank"' },
                { "name": "Intro Video", "link": null, "code": 'onclick="createWindow(\'introVideo\', \'big\')"' },
            ]
        },
    ],

    //contains text to be injected with javascript
    injection: [
        // {
        //     THE ABOUT INFO HAS BEEN MOVED TO ABOUT.HTML .
        //     "name": "about",
        //     "text": '<h3> Applet Name: Design Our Climate Simulation </h3>' +
        //         '<p>Version 3.0.0, Date: August 2019</p>' +
        //         '<p>Authors:  McKenzie Tilstra, Ashley Elgersma, Kalley Lasola, Luke Vanderwekken, Theo Keeler, Anna Schwalfenberg, Darrell Vandenbrink, Joseph Zondervan, Dr. Peter Mahaffy, Dr. Brian Martin, Dr. Melanie Hoffman, and Dr. Robert MacDonald</p>' +
        //         '<p>Contact: Visit <a href="http://www.kcvs.ca/" target="_new">KCVS.ca</a> for contact information.</p>' +
        //         '<div class="logoContainer"><a href="http://www.kcvs.ca/" target="_blank"><img src="img/KCVS_logo.png" alt="KCVS.ca" class="aboutLogo" style="padding-bottom:3%;"/></a>'
        // },
        // {
        //     'name': 'sliderConstraintWarning',
        //     'text': 'Lower another power source before raising this further.'
        // },

        {
            'name': "introVideo",
            'text': '<div class = "videocontainer videocontainer-16x9"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/cXzqmF2JoSQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
        }
    ]

}

function openGlossary() {
    if ($('.darkMode')[0]) {
        // $('#learnDOCS').click(function(){
        //     window.open("DesignOurClimateSim.html?mode=quest&darkMode=true")
        // });
        window.open('glossary.html?darkMode=true');
    }
    else {
        // $('#learnDOCS').click(function(){
        //     window.open("DesignOurClimateSim.html?mode=quest")
        // });
        window.open('glossary.html');
    }
}
