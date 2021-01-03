/*

  JavaScript for the Design Our Climate Simulation.
  
  Copyright The King's Centre for Visualization in Science.  Content subject to
  terms of use, which can be found at: https://kcvs.ca/termsOfUse.html

  TODO: Allow a slider year that's different from the simData year.
  - Requires projecting slider's min and max values.
  
 */

"use strict";

// Allow extra log messages from kcvsTheme.
// enableConsoleLogging = true;

// Log tables of carbon contributions when they're calculated.
//var enableCarbonCalcLogging = true;

// Give the current window a name, so we can come back to it.
window.name = 'DOCSwindow';


// If simData has not yet been loaded, make a placeholder object so the
// functions here won't complain.
var simData; // Does nothing if simData is already defined.
if (simData === undefined) simData = {};


// The simulation object contains the parameters and current values and handles
// calculations.  See below for details.  Defining it here we can assign the data to it.
var simulation = {};
simulation.constant = function (name) {
    return simData.physicalConstants[name].value;
}
simulation.value = function (name) {

    return simData.variables[name].value;
}

// Total projected amount of carbon produced in the simDataYear from various sources,
// in GT.
simulation.carbonInSimYear = {
    electricity: 0,
    vehicle: 0,
    landUse: 0,
    building: 0,
    material: 0,

    total: 0
};

//////////////////////////////
// Some handy internal variables.

// The last variable that was modified by simulation.setValue:
simulation.lastVar = null;

// The last slider that was touched by the user:
simulation.lastSlider = null;
// The variable controlled by lastSlider:
simulation.lastSliderVar = null;

//////////////////////////////
// Function for updating "dependent" variables that represent "the rest" of 100%.

simulation.updateDependentPercent = function (varName) {

    var depVar = simData.variables[varName];

    if (!depVar) return;

    // Calculate the new value of the dependent variable.
    depVar.value = 100;
    for (var i = 0; i < depVar.dependsOn.length; i++) {
        depVar.value -= simulation.value(depVar.dependsOn[i]);
    }

    // Update constraints on the associated sliders.
    for (var i = 0; i < depVar.dependsOn.length; i++) {
        var conMax = simulation.value(depVar.dependsOn[i]) + depVar.value;

        // More than one slider controls the same variable.
        var sliders = simulation.getSlidersByVar(depVar.dependsOn[i]);
        for (var j = 0; j < sliders.length; j++) {
            sliders[j].setConstraintMax(conMax);
        }
    }

    return (depVar.value);
};

// Carbon intensity scales.
simulation.maxCIIcons = 10;
simulation.eachCIIconWidth = 17;
simulation.updateCIScales = function () {
    //Get all the dependent Sliders:
    var allDepSliders = simulation.depSliderList;


    //Go through all the dependent Sliders:
    for (var i = 0; i < allDepSliders.length; i++) {
        var thisSliderInput = allDepSliders[i].inputID;

        var depVarName = thisSliderInput.replace("Slider", "");
        var depVar = simData.variables[depVarName];
        var CIScale = depVar.carbonIntensityScale;

        // If the dependent variable does not have a carbon intensity scale
        // defined in simData, there are no CI scales for this set of sliders.
        if (CIScale === undefined) continue;


        var varList = depVar.dependsOn.slice();
        var thisVariable;
        //Go through the list of sliders each Slider depends on:
        for (var j = 0; j <= varList.length; j++) {

            //For the Slider list
            if (j < varList.length) {
                thisVariable = varList[j];
            };
            //for the dependant slider
            if (j == varList.length) {
                thisVariable = depVarName;
            };
            updateIcons(thisVariable, false);
            var thisVarData = simData.variables[thisVariable];
            if (thisVarData.capturable) {
                updateIcons(thisVariable, true)
            };

        }; //For loop that goes through slider lists (j loop)

    }; //loop that goes through dependant Sliders (i loop)


    function updateIcons(variable, captured) {

        //Get rid of the "percent" in the variable name -  to select the right Icons
        var thisVariableName = thisVariable.replace('Percent', '');
        if (captured) {
            thisVariableName = thisVariableName + "Capturable";
        };

        var variableData = simData.variables[thisVariable]

        //Calculate the relative Carbon Intensity of the slider. (this is a scale of 1-10 with 10 being the highest)
        var CIofThisSlider = simulation.constant(thisVariableName + "CarbonIntensity");
        var relCI = simulation.maxCIIcons * CIofThisSlider / (CIScale[1] - CIScale[0]);
        var eachIconWidth = simulation.eachCIIconWidth;
        var numberOfIcons = Math.ceil(relCI);
        var CIScaleOfThisSlider = d3.select('#' + thisVariableName + "CIScale");


        //Relative size of the last Icon
        var remainingFraction = relCI - numberOfIcons + 1;

        //Go through the Icons, and Update them
        for (var k = 1; k <= simulation.maxCIIcons; k++) {

            //Select the icon:
            var thisIconID = thisVariableName + "Icon" + k;
            var thisIcon = d3.select("#" + thisIconID);
            //Get the (current) width of the icon as a number: 

            //The Icons that should be whole:
            if (k < numberOfIcons) {

                var eachIconWidthPx = eachIconWidth + "px";
                //make the Icon Whole and visible (if CI is increasing)
                thisIcon.style("width", eachIconWidthPx).style("opacity", 1);

            };
            //The last Icon (which is a fraction):
            if (k == numberOfIcons) {

                var theWidthItShouldBe = remainingFraction * eachIconWidth;
                //Change the Width:
                thisIcon.style("width", theWidthItShouldBe + "px").style("opacity", 1);
                //Check if theres an Icon after this icon (if CI is decreasing)


            };
            //Hide remaining Icons
            if (k > numberOfIcons) {
                thisIcon.style("opacity", 0);
            }

        }; //for that goes through Icons (k loop)
    };

};

simulation.updateElectricityCarbonIntensity = function () {
    // PRECONDITION: This depends on baseCoalPercent, so make sure that's updated first.
    // This is the only dependent variable that's a weighted average, so we don't
    // need to make this function more general (yet).

    if (!simData.variables.electricityCarbonIntensity) return;

    //Update coal carbon intensity according to user-selected coal efficiency AND CCS Percent
    simData.physicalConstants.coalCarbonIntensity.value = (simulation.constant('baseCoalCarbonIntensity') * (simData.variables.coalEfficiency.default / 100)) / (simulation.value('coalEfficiency') / 100) * (1 - (simulation.value('CCSPercent') / 100));
    //Without the CCS, for the CIScale:
    simData.physicalConstants.coalCapturableCarbonIntensity.value = (simulation.constant('baseCoalCarbonIntensity') * (simData.variables.coalEfficiency.default / 100)) / (simulation.value('coalEfficiency') / 100);

    //Update NG carbon intensity according to user-selected CCS Percent
    simData.physicalConstants.naturalGasCarbonIntensity.value = simulation.constant('baseNaturalGasCarbonIntensity') * (1 - (simulation.value('CCSPercent') / 100));
    //Without the CCS, for the CIScale:
    simData.physicalConstants.naturalGasCapturableCarbonIntensity.value = simulation.constant('baseNaturalGasCarbonIntensity');


    simData.variables.electricityCarbonIntensity.value =
        (simulation.value('windPercent') / 100) * simulation.constant('windCarbonIntensity') +
        (simulation.value('solarPercent') / 100) * simulation.constant('solarCarbonIntensity') +
        (simulation.value('nuclearPercent') / 100) * simulation.constant('nuclearCarbonIntensity') +
        (simulation.value('geothermalPercent') / 100) * simulation.constant('geothermalCarbonIntensity') +
        (simulation.value('hydroPercent') / 100) * simulation.constant('hydroCarbonIntensity') +
        (simulation.value('biomassPercent') / 100) * simulation.constant('biomassCarbonIntensity') +
        //  In the Classic applet this intensity variable did not include naturalGas... This seems to be an error, so this is included in this applet
        (simulation.value('naturalGasPercent') / 100) * simulation.constant('naturalGasCarbonIntensity') +
        (simulation.value('coalPercent') / 100) * simulation.constant('coalCarbonIntensity');
    // console.log(simData.variables.electricityCarbonIntensity.value);


    simData.variables.electricityCapturableCarbonIntensity.value =
        (simulation.value('windPercent') / 100) * simulation.constant('windCarbonIntensity') +
        (simulation.value('solarPercent') / 100) * simulation.constant('solarCarbonIntensity') +
        (simulation.value('nuclearPercent') / 100) * simulation.constant('nuclearCarbonIntensity') +
        (simulation.value('geothermalPercent') / 100) * simulation.constant('geothermalCarbonIntensity') +
        (simulation.value('hydroPercent') / 100) * simulation.constant('hydroCarbonIntensity') +
        (simulation.value('biomassPercent') / 100) * simulation.constant('biomassCarbonIntensity') +
        //  In the Classic applet this intensity variable did not include naturalGas... This seems to be an error, so this is included in this applet
        (simulation.value('naturalGasPercent') / 100) * simulation.constant('naturalGasCapturableCarbonIntensity') +
        (simulation.value('coalPercent') / 100) * simulation.constant('coalCapturableCarbonIntensity');
    // console.log(simData.variables.electricityCarbonIntensity.value);

    // console.log('updateElecCarbInten: ', simulation.value('CCSPercent'),
    //     simulation.constant('coalCarbonIntensity'),
    //     simData.variables.electricityCarbonIntensity.value.toFixed(6),
    //     simData.variables.electricityCapturableCarbonIntensity.value.toFixed(6)
    // ); // FIXME: for testing

    return simData.variables.electricityCarbonIntensity.value;

}

simulation.updateDependentVars = function () {
    simulation.updateDependentPercent('coalPercent');
    simulation.updateDependentPercent('gasolineVehiclePercent');
    simulation.updateDependentPercent('coalHeatingPercent');
    simulation.updateElectricityCarbonIntensity();
};

// For updating readonly sliders that depend on other variables.
// TODO: Maybe slider lists like this belong in pageCollection instead?
simulation.depSliderList = [];
simulation.addDependentSlider = function (slider) {
    simulation.depSliderList.push(slider);
}
simulation.updateDependentSliders = function () {
    for (var i = 0; i < simulation.depSliderList.length; i++) {
        var s = simulation.depSliderList[i];
        s.setValueSilently(simulation.value(s.varName));
    }
}

////////////////////////////////////////////////////////////
// Set up the rest of the simulation object, which stores parameters and current
// values, and handles all calculations.  It is also responsible for overall
// applet behaviour that doesn't specifically fall under another object's
// domain.

// Calculate the "feasibility" for one variable's current setting.
// NOTE: This is not quite the same calculation as was used by the Classic applet.
simulation.calcVarFeasibility = function (name) {
    var theVar = simData.variables[name]; // for convenience.
    if (theVar.hasOwnProperty('minFeasible') && theVar.value < theVar.minFeasible) {
        theVar.feasibility = Math.max((theVar.value - theVar.min) / (theVar.minFeasible - theVar.min), 0);
    } else if (theVar.hasOwnProperty('maxFeasible') && theVar.value > theVar.maxFeasible) {
        theVar.feasibility = Math.min((theVar.max - theVar.value) / (theVar.max - theVar.maxFeasible), 1)
    } else {
        theVar.feasibility = 1;
    }
    return theVar.feasibility;
}

// Update powerPerCapita from the relative power slider.  Attach this as a
// listener to the relative power slider so it'll update automatically.
simulation.powerPerCapitaListener = function (event) {
    // Get the value straight from the relative power slider, so the order that
    // listeners fire in doesn't matter:
    var relPow = event.slider.value();
    var power = relPow * simData.variables.powerPerCapita.presentDay;
    simulation.setValue('powerPerCapita', power);
}

//Update the netCarbon, which is used in the Impacts calculation
simulation.updateNetCO2 = function () {

    //Get the CO2 from the graph up to present
    var historyData = carbonGraph.historyData;
    var CO2toPresent = 0;
    if (historyData) {
        CO2toPresent = d3.sum(historyData, function (d) {
            return d.carbon_GtPerYear;
        });
    }
    //Calculate the integral of the graph after the present:
    var startCO2 = simData.startCarbon,
        startYear = simData.startYear,
        slope = simulation.carbonSlope;
    //Scale the impacts depending on the graph switch
    var graphYear = 2100; //simData.timeScales[carbonGraph.timeScale].xmax;
    ;

    var endYear;
    //if the emissions are negative in 2100, use the 0 year as the end year for the calculation. Otherwise, use 2100:
    if (simulation.getNetZeroYear() <= graphYear) {
        endYear = simulation.getNetZeroYear();

    } else {
        endYear = graphYear;
    };
    //Calculate the total emissions since the present to 2100 (or 2050). This uses an integral, and it's complicated, I'm integrating this:
    // C(t) = slope(t-startYear) + startCO2; from present to the end year
    //This becomes: C(t) = slope(t) + (StartCO2 - slope(startYear))
    //Doing this in two definite integral pieces (from P(for present)to X(either 2050 or 2100 (endYear)) this becomes:
    //(slope/2)(X^2 - P^2) + (startCO2 - slope(startYear))(X-P)
    var CO2SincePresent = (slope / 2) * ((endYear * endYear) - (startYear * startYear)) + ((startCO2 - (slope * startYear)) * (endYear - startYear));

    simulation.netCO2 = CO2toPresent + CO2SincePresent;

    //Also the CO2 for the high scenario (starting point):

    //First, the high slope, so that the carbon in the high situation can be calculated for whatever year we need:
    var highCO2Slope = (simData.simDataYearCarbon - startCO2) / (2100 - startYear);
    //I think the best way to do this is to just add this section up by area -> rectangle area plus the top triangle 
    var highCO2SincePresent = startCO2 * (graphYear - startYear) + 0.5 * (graphYear - startYear) * ((startCO2 + highCO2Slope * (graphYear - startYear)) - startCO2);

    simulation.highNetCO2 = CO2toPresent + highCO2SincePresent;

    //And the low Scenario (net 0 in 2050)
    //this one is just the triangle at the end - the same for both 2100 and 2050
    var lowCO2SincePresent = 0.5 * (2050 - simData.startYear) * startCO2;

    simulation.lowNetCO2 = CO2toPresent + lowCO2SincePresent
    return simulation.netCO2;
}


// Take the change predicted by a slider and project it to the simData year.
// Assumes changes are linear in time. DOES NOT STORE the value.  (We want to be
// able to compare the projected value against the projected min & max.)
simulation.projectSliderToSimYear = function (name, x) {
    var theVar = simData.variables[name]; // for convenience.

    var slope = (x - theVar.presentDay) / (simData.sliderYear - simData.startYear);
    var proj = (theVar.presentDay + slope * (simData.simDataYear - simData.startYear));

    // Allow for rounding error.
    var tol = (theVar.max - theVar.min) * 1e-6;
    if (Math.abs(proj - theVar.max) < tol) proj = theVar.max;
    if (Math.abs(proj - theVar.min) < tol) proj = theVar.min;

    return proj;
}

// Stores the value of the variable with the given name.
// INPUT:
// - name: Name of the variable.
// - x: Value of the SLIDER to store.
// x will be projected from the sliderYear to the simDataYear before storing!
simulation.setValue = function (name, x) {
    // NOTE: This function should NOT call simulation.update, etc.  All of that
    // should be done explicitly in other functions. The reason is that we might
    // want to change multiple values before updating everything, e.g. for
    // correlated sliders like power percentages.
    var vars = simData.variables; // for convenience.
    var projX = simulation.projectSliderToSimYear(name, x);
    if (projX >= vars[name].min && projX <= vars[name].max) {
        vars[name].value = projX;

        // Update feasibility score for this variable.
        simulation.calcVarFeasibility(name);

        // // Opacity for the "not realistic" slider message.  Bring it to 100%
        // // smoothly but quickly.
        // var rcOpacity = Math.min(10*(1-vars[name].feasibility), 1);
        //console.log('opa! ' + rcOpacity, vars[name].feasibility); // FIXME: for testing

        if (vars[name].hasOwnProperty('modifies') || vars[name].capturable) {
            // Right now there aren't many dependent variables, so it's simplest just to update them all.
            // If the var is "capturable", that means CCS is involved, so we
            // need to at least recalculate carbon intensities.  (TODO: That
            // should probably happen on its own instead of forcing all the
            // percentages to get updated as well.)
            simulation.updateDependentVars();
            simulation.updateDependentSliders();
        }

        // Update the value in all sliders that control this variable.
        var sliders = simulation.getSlidersByVar(name);
        for (var i = 0; i < sliders.length; i++) {
            sliders[i].setValueSilently(x);
            sliders[i].updateRealityCheck();
        }
    }

    simulation.lastVar = simData.variables[name];
} // simulation.setValue

/////////////////////////////////////////////
// List of all sliders in the simulation.  (Using an array instead of an object
// so that we can take advantage of JavaScript's array functions, such as
// filter.)
simulation.sliderList = [];
simulation.addSlider = function (slider) {
    simulation.sliderList.push(slider);
}

simulation.getSlidersByVar = function (varName) {
    return simulation.sliderList.filter(function (s) {
        return s.varName == varName;
    });
}


/////////////////////////////////////////////
// Functions for resetting the simulation.

// Set all variables and sliders to their default values.
simulation.reset = function () {
    $.each(simData.variables, function (varName, varObj) {
        if (!(simData.variables[varName].dependsOn)) {
            if (varObj.default != undefined) simulation.setValue(varName, varObj.default);
        }
    });
    simulation.updateDependentVars();
    // The first time we run this, dependent variables don't have defaults.
    // Set those now.
    $.each(simData.variables, function (varName, varObj) {
        if (varObj.default == undefined) varObj.default = varObj.value;
    });
}

// Set all variables and sliders to their present-day values.
simulation.setToPresentDay = function () {
    $.each(simData.variables, function (varName, varObj) {
        if (!(simData.variables[varName].dependsOn)) {
            simulation.setValue(varName, varObj.presentDay);
        }
    });
    simulation.updateDependentVars();
    // The first time we run this, dependent variables haven't stored present-day
    // values.  Set those now.
    $.each(simData.variables, function (varName, varObj) {
        if (varObj.presentDay == undefined) varObj.presentDay = varObj.value;
    });
}


/////////////////////////////////////////////
// Listener system for simulation updates.  Use these tools to add functions to
// call whenever the simulation is updated.

simulation.listeners = [];

simulation.addListener = function (fcn) {
    simulation.listeners.push(fcn);
}

simulation.callListeners = function () {
    for (var i = 0; i < simulation.listeners.length; i++) {
        simulation.listeners[i]();
    }
}


/////////////////////////////////////////////
// Initialize the simulation.  Activate listeners, etc.  Should be called
// inside document ready function (below).
simulation.init = function () {

    //////////////////////////////
    // Initialize simulation and do initial calculations.

    // Calculate some constants from other constants.  (Can't do that inside an
    // object literal.)
    simData.physicalConstants.H2Energy.value = simulation.constant("H2Volts") * simulation.constant("convertVolts") / simulation.constant("convertM3");
    simData.physicalConstants.windArea.value = 0.31 / 0.01752;
    simData.physicalConstants.solarArea.value = 1 / (0.3 * 1000000 / 114000);

    // Initialize calibration scale factor.  We'll set this properly once
    // we've run calculations using the default settings.
    simData.carbonScaleFactor = 1;

    // Initialize variable values.
    // For each variable that these depend on, set a flag so we know to update the dependents as well.
    // (More reliable than making sure we keep cross-listings up to date in simData.)
    // TODO: Search simData.variables for all variables that have dependsOn properties,
    // instead of listing them by hand here.
    simulation.reset();
    for (i = 0; i < simData.variables.coalPercent.dependsOn.length; i++) {
        simData.variables[simData.variables.coalPercent.dependsOn[i]].modifies = "coalPercent";
    }
    for (i = 0; i < simData.variables.gasolineVehiclePercent.dependsOn.length; i++) {
        simData.variables[simData.variables.gasolineVehiclePercent.dependsOn[i]].modifies = "gasolineVehiclePercent";
    }
    for (i = 0; i < simData.variables.coalHeatingPercent.dependsOn.length; i++) {
        simData.variables[simData.variables.coalHeatingPercent.dependsOn[i]].modifies = "coalHeatingPercent";
    }

    // Calculate and store present-day values of dependent variables.
    // (Mainly intended for interpolating feasibility ranges.)
    // WARNING: The carbon production calculated from "present day" values
    // is not calibrated to match the present-day carbon value (startCarbon)
    // in simData.  So setting all sliders to "present day" values does not
    // give a horizontal projection line.
    simulation.setToPresentDay();
    simulation.update();

    // Re-initialize variables to their defaults.
    simulation.reset();
    simulation.update();

    // Calibrate default projection to match the scale projection.
    simulation.carbonInSimYear.simTotalDefault = simulation.carbonInSimYear.simTotal;
    // Calculate reference contributions for each category, by scaling them so
    // they add up to the business-as-usual target.
    // WARNING: Kludge!  The category names are difference in the carbon totals
    // vs the list in e.g. simData.categories so it's not easy to just loop over
    // them.
    simulation.carbonCategoryDefaults = {};
    simulation.carbonCategoryDefaults.scaleFactor = simData.simDataYearCarbon / simulation.carbonInSimYear.simTotalDefault;
    simulation.carbonCategoryDefaults.electricity = simulation.carbonInSimYear.electricity;
    simulation.carbonCategoryDefaults.vehicle = simulation.carbonInSimYear.vehicle;
    simulation.carbonCategoryDefaults.landUse = simulation.carbonInSimYear.landUse;
    simulation.carbonCategoryDefaults.building = simulation.carbonInSimYear.building;
    simulation.carbonCategoryDefaults.material = simulation.carbonInSimYear.material;

    // Update the simulation now that it's calibrated.
    simulation.update();

    // Nice y-axis limits for each timescale.
    simData.timeScales.short.ymax = 1.05 * simulation.getCarbonInYear(simData.timeScales.short.xmax);
    simData.timeScales.long.ymax = 1.05 * simulation.getCarbonInYear(simData.timeScales.long.xmax);

    //////////////////////////////
    // Attach listeners to the applet.

    var simSliderListener = function (event) {
        var theSlider = event.slider;
        simulation.setValue(theSlider.varName, theSlider.value());
        simulation.update();
        // FIXME: Why is this called twice?  Could someone please either remove or document this?
        simulation.setValue(theSlider.varName, theSlider.value());
        landAreaDisplay.update(theSlider.varName);
        carbonGraph.update();
        impactDisplay.update();
        feasibilityIndicator.update();
        percentDisplays.updateAll();

        simulation.lastSlider = theSlider;
        simulation.lastSliderVar = simData.variables[theSlider.varName];
    }
    $('#controlsContainer').on('slide.kcvs.slider', simSliderListener);

    // TODO: Move these messages to either simData or the HTML file, so that all messages are in consistent places.
    var simSliderConstraintListener = function (event) {
        var theSlider = event.slider;
        var theVariable = simData.variables[theSlider.varName];
        var message = 'Bork!  ' + theVariable.modifies;
        if (theVariable.modifies == 'coalPercent') {
            message = "<p>You've reduced the percent of electricity <strong>from coal</strong> to zero.</p><p>Reduce another power source before increasing this further.</p>";
        } else if (theVariable.modifies == 'gasolineVehiclePercent') {
            message = "<p>You've reduced percent of <strong>gasoline vehicles</strong> to zero.</p><p>Reduce another vehicle fuel source before increasing this further.</p>";
        } else if (theVariable.modifies == 'coalHeatingPercent') {
            message = "<p>You've reduced the percent of heating energy <strong>from coal</strong> to zero.</p><p>Reduce another power source before increasing this further.</p>";
        }
        constraintNotice.show(message, theVariable.modifies, 0);
    }
    $('#controlsContainer').on('constraint.kcvs.slider', simSliderConstraintListener);
} // simulation.init

/////////////////////////////////////////////
// Calculate carbon contributions!

// calc* functions: Calculate projected carbon emissions/reductions in the simDataYear
// (e.g. total emissions in 2100).

// The "Percent ... avoided by CCS" slider should be applied to the total
// _emissions_ (before removals).  It's currently applied to the final total instead.  That said, I (Rob) think _reductions_ in emissions should probably be applied to emissions _before_ the "percent avoided by CCS" is applied.  So the only sliders that should be separated out and applied after CCS are the ones that represent _removal_ of carbon.  Which I think is just reforestation.  

// That said, it depends on what "total CO2 emissions" actually means.  The feasibility limits assume we're only doing CCS on coal-power emissions; anything over the feasibility max could actually be pulling it out of the air.  (So we _could_ let the slider go up to 150% or something, i.e. capturing more than we produce.)  And in that case, the "percent avoided by CCS" should be applied after all emissions and removals.
// Note from Mel: We are not including direct air capture, as it isn't ready to be used. CCS could be applied to gas or coal power plants, primarily. See electricity review document for estimated CCS capabilities, and Peer Review Summary doc for more notes.

// Sliders that represent reductions in emissions
// - Reforestation rate
// - conservation tillage
// - decrease in agricultural emissions
// - low-flow water fixtures
// - Mel adds: lightbulbs?


simulation.calcElectricityCarbon = function () {
    var sim = simulation; // convenience

    // Total power used - in tWh = [kwh/person] * [billions of people] (billions of kWh or TWh)
    var totalPower = sim.value("powerPerCapita") * sim.value("population");
    // Units in round brackets, and calculated units after each step are in square brackets qk I rearranged these - check against old applet (before pushing) to make sure they give the same values.
    //Coal Carbon: (TWh/year)*(percent Coal)/100 [TWh/year of coal] * (GtC/TWh) [GtC/year] [GtC Emitted/year]
    var coalCarbon = totalPower * (sim.value('coalPercent') / 100) * (sim.constant('coalCarbonIntensity'));
    // Natural Gas Carbon: (TWh/year)*(percent NG)/100 [TWh/year of NG] * 100/(percent efficiency) [total power pruduced, TWh/year] * (GtC/TWh) [GtC] [GtC Emitted] 
    var naturalGasCarbon = totalPower * (sim.value('naturalGasPercent') / 100) * sim.constant('naturalGasCarbonIntensity'); //* (100 / sim.constant('naturalGasEfficiency'))
    //Wind Carbon: (TWh/year)*(percent wind)/100 [TWh/year of wind]  * (GtC/TWh) [GtC/year]
    var windCarbon = totalPower * (sim.value('windPercent') / 100) * sim.constant('windCarbonIntensity');
    //Solar Carbon: (TWh/year)*(percent solar)/100 [TWh/year of solar]  * (GtC/TWh) [GtC/year]
    var solarCarbon = totalPower * (sim.value('solarPercent') / 100) * sim.constant('solarCarbonIntensity');
    //nuclear Carbon: (TWh/year)*(percent nuclear)/100 [TWh/year of nuclear]  * (GtC/TWh) [GtC/year]
    var nuclearCarbon = totalPower * (sim.value('nuclearPercent') / 100) * sim.constant('nuclearCarbonIntensity');
    //Geothermal Carbon: (TWh/year)*(percent Geothermal)/100 [TWh/year of geothermal]  * (GtC/TWh) [GtC/year]
    var geothermalCarbon = totalPower * (sim.value('geothermalPercent') / 100) * sim.constant('geothermalCarbonIntensity');
    //Hydroelectric Carbon: (TWh/year)*(percent hydro)/100 [TWh/year of hydrp]  * (GtC/TWh) [GtC/year] ---Had to add the /100 to the efficiency. Make sure this is right.
    var hydroCarbon = totalPower * (sim.value('hydroPercent') / 100) * sim.constant('hydroCarbonIntensity');
    //Biomass Carbon: (TWh/year)*(percent hydro)/100 [TWh/year of hydro]  * (GtC/TWh) [GtC/year] 
    var biomassCarbon = totalPower * (sim.value('biomassPercent') / 100) * sim.constant('biomassCarbonIntensity');
    // //CSS Carbon Savings = total GtCO2e * percent CSS
    // var CCSsavings = 0;
    // if (simulation.carbonInSimYear.total >= 0) {
    //     CCSsavings = simulation.carbonInSimYear.total * (sim.value('CCSPercent') / 100);
    // }


    // //Coal and Natural Gas check for CSS feasibility
    // if (sim.value('coalPercent') == 0) {
    //     simData.variables.CCSPercent.maxFeasible = 7;
    // } else {
    //     simData.variables.CCSPercent.maxFeasible = 14;
    // }

    sim.carbonInSimYear.electricity = coalCarbon + naturalGasCarbon + windCarbon + solarCarbon + nuclearCarbon + geothermalCarbon + hydroCarbon + biomassCarbon; //- CCSsavings;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.log("********** BEGIN CALCULATING CARBON **********");
        console.table({
            coalCarbon: coalCarbon,
            geothermalCarbon: geothermalCarbon,
            hydroCarbon: hydroCarbon,
            naturalGasCarbon: naturalGasCarbon,
            nuclearCarbon: nuclearCarbon,
            solarCarbon: solarCarbon,
            windCarbon: windCarbon,
            biomassCarbon: biomassCarbon
        });
    }
    simulation.updateDependentVars();

    return sim.carbonInSimYear.electricity;
};

simulation.calcVehicleCarbon = function () {
    var sim = simulation; // convenience
    // //Total Number of Vehicles: (percent) / 100 * (billions of people) [billions of cars] * 1e9 [# of cars]
    // var numberOfVehicles = sim.value("vehicleOwnership") / 100 * sim.value("population") * 1e9;

    //Total Distance Travelled: (distance/person) * (billions of people)/ (people/car ) [billions of km travelled by cars]
    var distTravelled = sim.value("vehicleDistanceTravelled") * sim.value("population") / sim.value("vehicleOccupancy") * 1e9;

    // Units in round brackets, and calculated units after each step are in square brackets 
    ////////////////////////Vehicles/////////////////////////////
    //The Carbon Intensities of Each Type of Vehicle:
    //CI of Electric Vehicles: (Kwh/100km) / 100 (kwh/km) * {(GtCO2/TWh) * 1e12[kg/TWh] / 1e9 [kg/kw]} (kg/km)
    simData.physicalConstants.electricVehicleCarbonIntensity.value = sim.constant('electricEfficiency') / 100 * sim.value('electricityCarbonIntensity') * 1e12 / 1e9;
    //CI of Electric Vehicles with CCS
    simData.physicalConstants.electricVehicleCapturableCarbonIntensity.value = sim.constant('electricEfficiency') / 100 * sim.value('electricityCapturableCarbonIntensity') * 1e12 / 1e9;

    // console.log('calcVehicleCarbon: ',
    //     sim.value('electricityCarbonIntensity'),
    //     sim.value('electricityCapturableCarbonIntensity'),
    //     simData.physicalConstants.electricVehicleCarbonIntensity.value,
    //     simData.physicalConstants.electricVehicleCapturableCarbonIntensity.value
    // ); // FIXME: for testing

    //CI of fuel Cell Vehicles:  (kgH2/100km) /100 [kgH2/km] * (kWh/kgH2) [kWh/km] * 
    simData.physicalConstants.fuelCellVehicleCarbonIntensity.value = (sim.constant('fuelCellEfficiency') / 100) * sim.constant('H2Energy') * sim.value('electricityCarbonIntensity') * 1e12 / 1e9;

    //CI of fuel Cell Vehicles with CCS:  (kgH2/100km) /100 [kgH2/km] * (kWh/kgH2) [kWh/km] * 
    simData.physicalConstants.fuelCellVehicleCapturableCarbonIntensity.value = (sim.constant('fuelCellEfficiency') / 100) * sim.constant('H2Energy') * sim.value('electricityCapturableCarbonIntensity') * 1e12 / 1e9;

    //CI of fuel Cell Vehicles:  (kgH2/100km) /100 [kgH2/km] * (kWh/kgH2) [kWh/km] * 
    simData.physicalConstants.fuelCellVehicleCarbonIntensity.value = (sim.constant('fuelCellEfficiency') / 100) * sim.constant('H2Energy') * sim.value('electricityCarbonIntensity') * 1e12 / 1e9;

    //CI of Propane Vehicles:  (L/100km) /100 [L/km] * fraction* (kgCO2/l) [kgCO2/km]
    simData.physicalConstants.propaneVehicleCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * sim.constant('propaneEfficiency') * (sim.constant('lifecyclePropaneCarbonIntensity') - (((sim.value("CCSPercent") / 100)) * (sim.constant('lifecyclePropaneCarbonIntensity') - sim.constant('propaneCarbonIntensity'))));
    //Without CCS, for the CI Scaler:
    simData.physicalConstants.propaneVehicleCapturableCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * sim.constant('propaneEfficiency') * sim.constant('lifecyclePropaneCarbonIntensity');

    //CI of Gas Vehicles:  (L/100km) /100 [L/km] * (kgCO2/l) [kgCO2/km]
    simData.physicalConstants.gasolineVehicleCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * (sim.constant('lifecycleGasolineCarbonIntensity') - (((sim.value("CCSPercent") / 100)) * (sim.constant('lifecycleGasolineCarbonIntensity') - sim.constant('gasolineCarbonIntensity'))));
    //Without CCS, for the CI Scale:
    simData.physicalConstants.gasolineVehicleCapturableCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * sim.constant('lifecycleGasolineCarbonIntensity');

    //CI of hybrid vehicles:  
    simData.physicalConstants.hybridVehicleCarbonIntensity.value = ((1 / 3) * (sim.constant('gasolineVehicleCarbonIntensity') + ((2 / 3) * sim.constant('electricVehicleCarbonIntensity'))));
    //Without CCS, for the CIScale:
    simData.physicalConstants.hybridVehicleCapturableCarbonIntensity.value = ((1 / 3) * (sim.constant('gasolineVehicleCapturableCarbonIntensity') + ((2 / 3) * sim.constant('electricVehicleCapturableCarbonIntensity'))))


    //CI of diesel Vehicles:  (L/100km) /100 [L/km] * (kgCO2/l) [kgCO2/km]
    simData.physicalConstants.dieselVehicleCarbonIntensity.value = 0.8 * (sim.value('gasVehicleFuelEfficiency') / 100) * (sim.constant('dieselCarbonIntensity') - (((sim.value("CCSPercent") / 100)) * (sim.constant('lifecycleDieselCarbonIntensity') - sim.constant('dieselCarbonIntensity'))));
    //Without CCS for the CI Scale:
    simData.physicalConstants.dieselVehicleCapturableCarbonIntensity.value = 0.8 * (sim.value('gasVehicleFuelEfficiency') / 100) * sim.constant('dieselCarbonIntensity');



    //CI of biofuel vehicles:  (Lgas/100km)/100 [Lgas/km] * (% gas in biofuel) [Lgasin biofuel/km]
    // simData.physicalConstants.biofuelVehicleCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * (1 - sim.constant('biofuelRating')) * sim.constant('gasolineCarbonIntensity') * (1 + sim.constant('biofuelOverhead'));

    //CI of biofuel Vehicles: Biofuel is assumed to be a mix of ethanol (the bio
    //part) and gasoline; the mixture is controlled by the biofuelRating
    //constant in simData. From the Argonne National Laboratory's GREEt Database (https://greet.es.anl.gov/results)
    //E85 from corn stover: 68% less emissions than gasoline equivalent (130 vs 410 gCO2/lge)

    simData.physicalConstants.biofuelVehicleCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * ((sim.constant('biofuelRating') * sim.constant('lifecycleBiofuelCarbonIntensity')) + ((1 - sim.constant('biofuelRating')) * sim.constant('lifecycleGasolineCarbonIntensity')) - ((sim.value('CCSPercent') / 100) * (sim.constant("lifecycleGasolineCarbonIntensity") - sim.constant('gasolineCarbonIntensity'))));
    //Without CCS, for the CI Scale:
    simData.physicalConstants.biofuelVehicleCapturableCarbonIntensity.value = (sim.value('gasVehicleFuelEfficiency') / 100) * ((sim.constant('biofuelRating') * sim.constant('lifecycleBiofuelCarbonIntensity')) + ((1 - sim.constant('biofuelRating')) * sim.constant('lifecycleGasolineCarbonIntensity')));






    //Electric Car Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by electric vehicles]* (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var electricCarbon = distTravelled * (sim.value('electricVehiclePercent') / 100) * sim.constant("electricVehicleCarbonIntensity") / 1e12;


    //Fuel Cell Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by fuel Cell vehicles]* (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var fuelCellCarbon = distTravelled * (sim.value('fuelCellVehiclePercent') / 100) * sim.constant("fuelCellVehicleCarbonIntensity") / 1e12;


    //Propane Carbon Emissions:(total kms driven)*(percent of vehicles)/100[kms driven by propane vehicles] * (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var propaneCarbon = distTravelled * (sim.value('propaneVehiclePercent') / 100) * sim.constant("propaneVehicleCarbonIntensity") / 1e12;

    //Hybrid Car Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by hybrid vehicles] * (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var hybridCarbon = distTravelled * (sim.value('hybridVehiclePercent') / 100) * sim.constant("hybridVehicleCarbonIntensity") / 1e12;

    //Diesel Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by diesel vehicles] * (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var dieselCarbon = distTravelled * (sim.value('dieselVehiclePercent') / 100) * sim.constant("dieselVehicleCarbonIntensity") / 1e12;

    //Biofuel Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by biofuel vehicles] * (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var biofuelCarbon = distTravelled * (sim.value('biofuelVehiclePercent') / 100) * sim.constant("biofuelVehicleCarbonIntensity") / 1e12;


    //Gasoline Carbon Emissions: (total kms driven)*(percent of vehicles)/100[kms driven by gas vehicles] * (kgCO2/km) [kgCO2] / 1e12 [Gt CO2];
    var gasolineCarbon = distTravelled * (sim.value('gasolineVehiclePercent') / 100) * sim.constant("gasolineVehicleCarbonIntensity") / 1e12;





    //////////////////////////////////////Aviation/////////////////////////////////
    //Plane Carbon: 11 billion people* 45% of people are flying * km/person[total km flown]/100[100s of km flown]*(L/100km)[total fuel used]*kgCO2/L[kg of CO2]/1e12[gTCO2]
    var planeCarbon = sim.value("population") * 1e9 * 0.45 * sim.value("kilometersFlown") / 100 * sim.value("planeFuelEfficiency") * sim.constant("jetFuelCO2Intensity") / 1e12;
    sim.carbonInSimYear.vehicle = gasolineCarbon + biofuelCarbon + propaneCarbon + fuelCellCarbon + electricCarbon + hybridCarbon + dieselCarbon + planeCarbon;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.table({
            biofuelCarbon: biofuelCarbon,
            electricCarbon: electricCarbon,
            fuelCellCarbon: fuelCellCarbon,
            gasolineCarbon: gasolineCarbon,
            propaneCarbon: propaneCarbon,
            hybridCarbon: hybridCarbon,
            dieselCarbon: dieselCarbon,
            planeCarbon: planeCarbon
        });
        console.log('electricityCarbonIntensity: ' + sim.value('electricityCarbonIntensity'));
        console.log('vehicleCarbon: ' + sim.carbonInSimYear.vehicle);
    }

    return sim.carbonInSimYear.vehicle;

};

simulation.calcLandUseCarbon = function () {
    var sim = simulation; // convenience
    // Units in round brackets, and calculated units after each step are in square brackets
    //deforestation Carbon: (1000km^2/year)*(ktC/km^2)[1000ktC/year or MtC/year]/1000 [GtC/year]
    var presentRate = sim.constant('deforestationRate');
    var forestProtectionCarbon = (presentRate - (presentRate * (sim.value('forestProtection') / 100))) * sim.constant('forestCarbonStorage') / 1000;
    //reforestation Carbon: (1000km^2/year)*(ktC/km^2)[1000ktC/year or MtC/year]/1000 [GtC/year]
    var reforestationCarbon = sim.value('reforestationRate') * sim.constant('forestCarbonStorage') / 1000;

    var peatlandProtectionCarbon = sim.value('peatlandProtection') * 1e5 * sim.constant('peatlandProtectionSavings') / 1e9;
    var peatlandRestorationCarbon = sim.value('peatlandRestoration') * 1e5 * sim.constant('peatlandRestorationSavings') / 1e9;

    //Conservation Carbon: -1(million km^2) * (TC/km^2 * year) [-million TC/year or -MTC/year]/1000 [-GTC/year]
    var conservationTillageCarbon = -sim.value('conservationTillage') * sim.constant('conservationTillageStorage') / 1000;
    //Agriculture Carbon: (1-(%reduction/100))[%left]* (2/person)[GT CO2 left/person] * (billions of people) * 1e9 [2]

    var agricultureCarbon = (1 - (sim.value('agriculture') / 100)) * sim.constant('currentAgricultureCarbon') * sim.value("population") * 1e9;
    sim.carbonInSimYear.landUse = forestProtectionCarbon - reforestationCarbon + conservationTillageCarbon + agricultureCarbon - peatlandProtectionCarbon - peatlandRestorationCarbon;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.table({
            conservationTillageCarbon: conservationTillageCarbon,
            forestProtectionCarbon: forestProtectionCarbon,
            agricultureCarbon: agricultureCarbon,
            reforestationCarbon: reforestationCarbon
        });
        console.log('landuseCarbon: ' + sim.carbonInSimYear.landUse);
    }

    return sim.carbonInSimYear.landUse;
};

simulation.calcBuildingCarbon = function () {
    var sim = simulation; // convenience
    //Total Building Floor Area: (square m / person) * (billions of people) [billions of sq m] * 1e9 [square m]
    var totalFloorArea = sim.value("buildingFloorArea") * sim.value("population") * 1e9;
    // Units in round brackets, and calculated units after each step are in square brackets

    // Other (electric) heating carbon intensity: GtCO2/TWh * 1e12 kg/Gt * TWh/1e6 MWh [kgCO2/MWh]
    simData.physicalConstants.electricHeatingCarbonIntensity.value = sim.value("electricityCarbonIntensity") * 1e12 / 1e6;
    // Other (electric) heating carbon intensity: GtCO2/TWh * 1e12 kg/Gt * TWh/1e6 MWh [kgCO2/MWh]
    simData.physicalConstants.electricHeatingCapturableCarbonIntensity.value = sim.value("electricityCapturableCarbonIntensity") * 1e12 / 1e6;

    //Construction Carbon: ( m^2) * (kgC/m^2) [kgC] * 1e-12 [GtC] / (years) [GtC/year]
    var constructionCarbon = totalFloorArea * sim.value('buildingConstructionCarbon') * 1e-12 / sim.value('buildingLifetime');

    //Lighting Cabon qk note: this is the decrease - not the total emissions for lighting  - this is not in the assumptions, I think: (billions of lights)* 1e9 [number of lights] * {1-{LED percent/100}} [number of incandescant lights] * {(W/light) - (W/light)} [total W] * (TWh/(y*W)) [TWh] * (GTC/TWh) [GtC] - MH: this makes sense because electricity is counted in the electricity tab, so this is a decrease of electricity use. Other heating should function similarly (doesn't as of Dec2019). 
    // var lightingCarbon = sim.value('numberOfLights') * 1e9 * (1 - sim.value('LEDLightPercent') / 100) * (sim.constant('LEDWatts') - sim.constant('incandescentWatts')) * sim.constant('convertWatts') * sim.value('electricityCarbonIntensity');

    //qk a table to check this:
    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.table({
            "number of Lights": sim.constant("numberOfLights"),
            "LED Light %": sim.value("LEDLightPercent"),
            "LED Watts": sim.constant("LEDWatts"),
            "Incandescant Watts": sim.constant("incandescentWatts"),
            "convert Watts": sim.constant("convertWatts"),
            "electricity Carbon Intensity": sim.value("electricityCarbonIntensity")
        });
    }

    // MH correction suggestion: 


    var lightingCarbon = sim.constant('numberOfLights') * 1e9 * ((sim.value('LEDLightPercent') - simData.variables.LEDLightPercent.presentDay) / 100) * (sim.constant('LEDWatts') - sim.constant('incandescentWatts')) * sim.constant('convertWatts') * sim.value('electricityCarbonIntensity');
    //(billion m^2)*1e9 [m^2] * (kgC/m^2) [kgC] * 1e-12 [GTC] / (years) [GtC/year]
    // var heatingCarbon = sim.value('buildingFloorArea') * 1e9 * sim.constant('heatingCarbonIntensity') * 1e-12 / sim.value('buildingLifetime');

    var waterSavingsCarbon = (sim.value('lowFlowWaterPercent') - simData.variables.lowFlowWaterPercent.default) * sim.constant('lowFlowWaterCarbonIntensity');

    var cookstoveSavingsCarbon = (sim.value('cleanCookstoves') - simData.variables.cleanCookstoves.default) * sim.constant('cleanCookstovesSavings');



    ///////////////////////////Heating Emissions////////////////////////
    //Carbon INtensity of Coal heating - including CCS:
    simData.physicalConstants['coalHeatingCarbonIntensity'].value = sim.constant('coalHeatingCapturableCarbonIntensity') - (sim.value('CCSPercent') / 100 * (sim.constant('coalHeatingCapturableCarbonIntensity') - sim.constant('baseCoalHeatingCarbonIntensity')));
    //Carbon Intensity of oil heating - including CCS:
    simData.physicalConstants['oilHeatingCarbonIntensity'].value = sim.constant('oilHeatingCapturableCarbonIntensity') - (sim.value('CCSPercent') / 100 * (sim.constant('oilHeatingCapturableCarbonIntensity') - sim.constant('baseOilHeatingCarbonIntensity')));

    //Carbon Intensity of natural gas  heating - including CCS:
    simData.physicalConstants['naturalGasHeatingCarbonIntensity'].value = sim.constant('naturalGasHeatingCapturableCarbonIntensity') - (sim.value('CCSPercent') / 100 * (sim.constant('naturalGasHeatingCapturableCarbonIntensity') - sim.constant('baseNaturalGasHeatingCarbonIntensity')));




    //Biomass heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var biomassHeatingCarbon = ((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('biomassHeatingPercent') / 100)) * sim.constant('biomassHeatingCarbonIntensity') / 1e12;

    //geothermal heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var geothermalHeatingCarbon = (((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('geothermalHeatingPercent') / 100)) * sim.constant('geothermalHeatingCarbonIntensity') / 1e12);

    //NG heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var naturalGasHeatingCarbon = ((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('naturalGasHeatingPercent') / 100)) * ((sim.constant('naturalGasHeatingCarbonIntensity')) / 1e12);

    //Oil heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var oilHeatingCarbon = ((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('oilHeatingPercent') / 100)) * (sim.constant('oilHeatingCarbonIntensity') / 1e12);

    //Other heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var electricHeatingCarbon = ((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('electricHeatingPercent') / 100)) * (sim.constant('electricHeatingCarbonIntensity') / 1e12);

    //Coal heating emissions: (kWh/m^2) * (m^2) [total kWh] / 1e3 [MWh] * (% that is this source) [MWh for this source] * (kgCO2/MWh) [kgCO2] * GtCO2/1e12kgCO2 [GtCO2] 
    var coalHeatingCarbon = ((sim.constant('heatingEnergyConsumption') * totalFloorArea / 1e3) * (sim.value('coalHeatingPercent') / 100)) * (sim.constant('coalHeatingCarbonIntensity') / 1e12);

    var heatingCarbon = biomassHeatingCarbon + geothermalHeatingCarbon + naturalGasHeatingCarbon + oilHeatingCarbon + electricHeatingCarbon + coalHeatingCarbon;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.table({
            constructionCarbon: constructionCarbon,
            lightingCarbon: lightingCarbon,
            heatingCarbon: heatingCarbon,
            waterSavingsCarbon: waterSavingsCarbon,
        });

        console.table({
            biomassHeatingCarbon: biomassHeatingCarbon,
            geothermalHeatingCarbon: geothermalHeatingCarbon,
            naturalGasHeatingCarbon: naturalGasHeatingCarbon,
            oilHeatingCarbon: oilHeatingCarbon,
            electricHeatingCarbon: electricHeatingCarbon,
            coalHeatingCarbon: coalHeatingCarbon,
        });
    }

    sim.carbonInSimYear.building = constructionCarbon + lightingCarbon + heatingCarbon - waterSavingsCarbon - cookstoveSavingsCarbon;

    return sim.carbonInSimYear.building;
};


simulation.calcMaterialCarbon = function () {
    var sim = simulation; // convenience

    var cementEmissions = sim.constant("cementEmissions");
    var cementSavingsCarbon = (sim.value('cementComposition') - simData.variables.cementComposition.default) * sim.constant('cementCarbonIntensity');

    var refrigerantCarbon = (sim.value('HFCs') / 100) * sim.constant('HFCEmissions');
    // console.log(refrigerantCarbon); // FIXME: for testing

    // shipping emissions: tonne-km/person * #people [tonne-km]* gCO2e/tonne-km [gCO2e] * Gt/(1e9*1000*1e3 g) [GtCO2e]
    var shippingCarbon = (sim.value("shippingPerCapita") * sim.value("population") * 1e9) * ((sim.value("roadShipping") * sim.constant("roadShippingFraction")) + (sim.value("railShipping") * sim.constant("railShippingFraction")) + (sim.value("seaShipping") * sim.constant("seaShippingFraction")) + (sim.value("skyShipping") * sim.constant("skyShippingFraction"))) / 1e15;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.table({
            cementEmissions: cementEmissions,
            cementSavingsCarbon: cementSavingsCarbon,
            refrigerantCarbon: refrigerantCarbon,
            shippingCarbon: shippingCarbon,
        });
    }

    sim.carbonInSimYear.material = cementEmissions - cementSavingsCarbon + shippingCarbon - refrigerantCarbon;
    return sim.carbonInSimYear.material;
}

// simulation.calcCCSSavings = function () {
//     // simulation.calcElectricityCarbon();
//     // simulation.calcVehicleCarbon();
//     // simulation.calcLandUseCarbon();
//     // simulation.calcBuildingCarbon();
//     // NOTE: This should be called immediately after the category contributions are calculated, and before the total carbon is calculated.
//     simulation.calcMaterialCarbon();
//     var totalCarbon = simulation.carbonInSimYear.electricity + simulation.carbonInSimYear.vehicle + simulation.carbonInSimYear.landUse + simulation.carbonInSimYear.building + simulation.carbonInSimYear.material;

//     simulation.carbonInSimYear.CCSSavingsCarbon = -1 * (simulation.value('CCSPercent') / 100) * totalCarbon;
//     return simulation.carbonInSimYear.CCSSavingsCarbon;
// };

// Calculates the slope between today's carbon production and the projection.
// Slope is 0 if either carbon levels have not yet been calculated.
simulation.calcCarbonSlope = function () {
    if (simulation.hasOwnProperty('carbonInSimYear')) {
        var dt = simData.simDataYear - simData.startYear;
        simulation.carbonSlope = (simulation.carbonInSimYear.total - simData.startCarbon) / dt;
    } else {
        simulation.carbonSlope = 0;
    }
    return simulation.carbonSlope;
}



simulation.calcCarbonInSimYear = function () {
    simulation.calcElectricityCarbon();
    simulation.calcVehicleCarbon();
    simulation.calcLandUseCarbon();
    simulation.calcBuildingCarbon();
    simulation.calcMaterialCarbon();
    //simulation.calcCCSSavings();

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.log("Before scaling, total carbon is " + simulation.carbonInSimYear.total + ", and simDataYearCarbon is " + simData.simDataYearCarbon);
    }

    simulation.carbonInSimYear.simTotal = simulation.carbonInSimYear.electricity + simulation.carbonInSimYear.vehicle + simulation.carbonInSimYear.landUse + simulation.carbonInSimYear.building + simulation.carbonInSimYear.material; //+ simulation.carbonInSimYear.CCSSavingsCarbon;
    if (this.carbonInSimYear.simTotalDefault) {
        simulation.carbonInSimYear.simChange = simulation.carbonInSimYear.simTotal - simulation.carbonInSimYear.simTotalDefault;
    } else {
        // In this case this is called to _calculate_ the default, so the change is 0 by definition.
        simulation.carbonInSimYear.simChange = 0;
    }
    simulation.totalChange = simulation.carbonInSimYear.simChange * 0.5 * (simData.simDataYear - simData.startYear);

    simulation.carbonInSimYear.total = simData.simDataYearCarbon + simulation.carbonInSimYear.simChange;

    if (typeof enableCarbonCalcLogging !== 'undefined' && enableCarbonCalcLogging) {
        console.log("Total carbon for each category (overall total has been scaled here):")
        console.table(simulation.carbonInSimYear);
    }

    return simulation.carbonInSimYear.total;
}

// Calculate "feasibility" score for current variable settings.  Uses values
// projected to simDataYear, which assumes that any changes between now, the
// "sliderYear", and the "simDataYear" will come into affect linearly, and that
// the feasibility scales linearly by year as well.  (This is obviously not
// correct -- technological changes seem to happen exponentially rather than
// linearly, for one thing -- but it's not bad for this model, we think.)
simulation.calcFeasibility = function () {
    simData.feasibility = 1;
    $.each(simData.variables, function (varName, varObj) {
        if (!(simData.variables[varName].dependsOn)) {
            simData.feasibility *= simData.variables[varName].feasibility;
        }
    });
    return simData.feasibility;
}

// Update all sim calculations in the simDataYear (e.g. 2100).
simulation.update = function () {
    //simulation.updateCIScales();
    simulation.calcCarbonInSimYear();
    simulation.calcCarbonSlope();
    simulation.calcFeasibility();
    simulation.updateNetCO2();
    simulation.updateCIScales();

    simulation.callListeners();
};


//////////////////////////////
// Getters for simulation calculations.

// Projected total carbon produced in the given year.
// WARNING: Call update first to update the projection to the current slider
// settings.
simulation.getCarbonInYear = function (year) {
    return simData.startCarbon +
        simulation.carbonSlope * (year - simData.startYear);
}


// Returns the year in which the projected net carbon emission crosses 0.
// Returns -1 if the projected carbon emission rate is increasing instead of
// decreasing.
simulation.getNetZeroYear = function () {
    if (simulation.carbonSlope < 0) {
        /*
        y = mx+b
        x = (y-b)/m
        --> x-int = -b/m 
        and x = year - presentDay
        --> yearZero = presentDay - b/m  (where m<0)
         */
        return Math.round(simData.startYear -
            simData.startCarbon / simulation.carbonSlope);
    } else {
        // return -1;
        return Infinity;
    }
}


// Returns the feasibility score for the current variable settings (as of the
// most recent call to update).
simulation.getFeasibility = function () {
    return simData.feasibility;
}

// Are the current settings feasible?  (Allows a bit of rounding error.)
simulation.isFeasible = function () {
    return (simulation.getFeasibility() >= 0.99);
}


////////////////////////////////////////////////////////////
// General output display functions.

// Tracker for whether the window width has crossed the smallness threshold, and 
// functions to update displays accordingly.
var zoomer = {};

// Anything smaller than this (in px) is "small".
// Chosen because it's what the Foundation library calls "small", and it works well.
// This should be the same as the relevant CSS media query.
zoomer.smallBreak = 640;

// String for tracking whether the size is currently "small" or "large".
// This makes it more convenient to check if we've crossed the threshold recently.
zoomer.currentSize = "unknown";

// Function to check the window width and update the the current size string.
zoomer.updateSize = function () {
    if (window.innerWidth < zoomer.smallBreak) {
        zoomer.currentSize = "small";
    } else {
        zoomer.currentSize = "large";
    }
}

// Update now, and add a listener to update again if the window gets resized.
zoomer.updateSize();
$(window).resize(zoomer.updateSize);


zoomer.addZoomFunctions = function (display) {
    display.zoomIn = function () {
        // Only zoom if the screen is small.  (Otherwise the displays should already be
        // at full width.)
        if (zoomer.currentSize == 'small') {
            display.display.removeClass('shrunk');
            display.display.siblings().addClass('shrunkHidden');
            // Switch which listeners are active.
            display.display.find('.shrinkingCover').off('click', display.zoomIn);
            display.zoomIcon.off('click', display.zoomIn);
            display.zoomIcon.on('click', display.zoomOut);
            if (display.zoomInListener) { display.zoomInListener(); }
            return false; // Prevent event propagation.
        }
    }
    display.zoomOut = function () {
        if (zoomer.currentSize == 'small') {
            display.display.addClass('shrunk');
            display.display.siblings().removeClass('shrunkHidden');
            // Switch which listeners are active.
            display.zoomIcon.off('click', display.zoomOut);
            display.zoomIcon.on('click', display.zoomIn);
            display.display.find('.shrinkingCover').on('click', display.zoomIn);
            if (display.zoomOutListener) { display.zoomOutListener(); }
            return false; // Prevent event propagation.
        }
    }

    // Call this if the shrunk class has been added/removed directly.
    display.updateZoomListeners = function () {
        if (display.display.hasClass('shrunk')) {
            display.display.find('.shrinkingCover').on('click', display.zoomIn);
            display.zoomIcon.on('click', display.zoomIn);
        } else {
            display.zoomIcon.on('click', display.zoomOut);
        }
    }
} // zoomer.addZoomFunctions function

zoomer.updateAllZoomListeners = function () {
    carbonGraph.updateZoomListeners();
    impactDisplay.updateZoomListeners();
}

////////////////////////////////////////////////////////////
// Graph of carbon production by year (the "wedges").
var carbonGraph = {};

// Has the user zoomed in for details?  Any listeners attached to specific
// pieces of the graph should check this first; if we're not zoomed in, clicking
// shouldn't activate anything, just zoom.
carbonGraph.isZoomedIn = false;

// Duration for graph animations.
carbonGraph.animTime = 1000; // milliseconds

// Duration for micro-transitions (updating projection etc) so it's not jumpy.
carbonGraph.smoothTime = 50; // milliseconds.

// Which time scale to use.  Taken from switch value.
carbonGraph.timeScale;
if (document.getElementById('timeScaleSwitch').checked) {
    carbonGraph.timeScale = "long";
} else {
    carbonGraph.timeScale = "short";
}

carbonGraph.display = $('#projectionGraphDisplay');
carbonGraph.container = $('#projectionGraphContainer');
carbonGraph.zoomIcon = carbonGraph.display.find('.zoomIcon');

zoomer.addZoomFunctions(carbonGraph);

// Initialize the graph.  Call this after initializing the simulation.
carbonGraph.init = function () {

    carbonGraph.defaultTimeScale = carbonGraph.timeScale;

    // Height and width of the viewbox that defines the shape of the graph.
    // Make sure the aspect ratio is not too squished.
    var h = carbonGraph.container.height();
    // w = Math.min(carbonGraph.container.width(), Math.max(2*h, 15*16));
    var w = Math.min(carbonGraph.container.width(), 2 * h);

    // If the container is really small, scale down the font used on the
    // graph.  The largest is from the container's default font size.
    var fontSize = Math.max(10,
        Math.min(parseInt(carbonGraph.container.css('font-size')), h / 10));
    carbonGraph.container.css('font-size', fontSize);

    // Create the graph axes.
    carbonGraph.graph = new KCVSGraph({
        containerID: 'projectionGraphContainer',
        graphID: 'projectionGraph',
        // width: carbonGraph.container.width(),
        // height: 0.67 * carbonGraph.container.parent().width(),
        // height: carbonGraph.container.height(),
        width: w,
        height: h,
        // gmargin: { top: 5, right: 5, bottom: 10, left: 30 }, // graph area margins
        // gmargin: { top: 5, right: 5, bottom: 20, left: 60 }, // graph area margins
        gmargin: { top: 5, right: 20, bottom: 25, left: 60 }, // graph area margins
        xmin: simData.timeScales[carbonGraph.timeScale].xmin,
        xmax: simData.timeScales[carbonGraph.timeScale].xmax,
        xticks: 3,
        xtickFormat: 'd',
        ymin: simData.timeScales[carbonGraph.timeScale].ymin,
        ymax: simData.timeScales[carbonGraph.timeScale].ymax,
        // ylabel: 'CO2 eqv. (Gt/y)',
        // ylabel: 'Greenhouse Gas emitted (Gt CO₂eq/year)',
        // ylabel: 'GHG emitted (Gt CO₂eq/year)',
        ylabel: 'Gt CO₂eq/year',
        zeroline: false
    });
    $('#projectionGraph').attr('preserveAspectRatio', 'xMidYMid meet');

    // Adjust some axis label spacing.
    $('#projectionGraphYaxis').find('text').last().attr('dy', '-2.75em');

    // Get the SVG context to simplify adding our own pieces.
    var svg = carbonGraph.graph.svg;

    // Put all the pieces we draw into an SVG "group" to make things like zooming easier.
    carbonGraph.contents = svg.append('g').attr('id', 'carbonContents');

    // Project the net-zero target out to 2100.  (For layout only!)
    var netZeroSlope = (0 - simData.startCarbon) / (simData.netZeroTarget - simData.startYear);
    simData.simDataYearNetZeroProj = simData.startCarbon + netZeroSlope * (simData.simDataYear - simData.startYear);

    //////////////////////////////
    // Calculate where the wedges are and how many we'll have.

    //simData.wedgeCarbon = (simData.simDataYearCarbon - simData.simDataYearNetZeroProj) / (simData.nWedges);

    // Number of wedges (not wedge lines).
    simData.nWedges = simData.wedgeLineEndpoints.length - 1;

    // Area of one wedge, assuming they're all the same.
    // Assumes they're sorted from high to low!
    simData.wedgeCarbon = 0.5 * (simData.simDataYear - simData.startYear) * (simData.wedgeLineEndpoints[0] - simData.wedgeLineEndpoints[1])

    // Update any assumptions that mention the amount of carbon in each wedge.
    $('.autofill-wedgeCarbon').text(Math.round(simData.wedgeCarbon));
    $('.autofill-numWedges').text(simData.nWedges);
    $('.autofill-wedgeCarbon2100').text(Math.round(simData.wedgeLineEndpoints[0] - simData.wedgeLineEndpoints[1]));

    carbonGraph.graph.wedgeLinePts = [];
    for (var i = 0; i < simData.nWedges + 1; i++) {
        carbonGraph.graph.wedgeLinePts.push({
            key: i,
            // carbon_GtPerYear: simData.simDataYearCarbon - i * simData.wedgeCarbon
            carbon_GtPerYear: simData.wedgeLineEndpoints[i]
        });
    }

    // Line generator function for D3.
    carbonGraph.lineGen = d3.line()
        .x(function (d) { return carbonGraph.graph.xScale(d.year); })
        .y(function (d) { return carbonGraph.graph.yScale(d.carbon_GtPerYear); });

    // Remove the extra ticks at the ends of the axes.
    carbonGraph.graph.xAxis.tickSizeOuter(0);
    carbonGraph.graph.xAxisG.call(carbonGraph.graph.xAxis);
    carbonGraph.graph.yAxis.tickSizeOuter(0);
    carbonGraph.graph.yAxisG.call(carbonGraph.graph.yAxis);

    // Draw the wedges.  Start collapsed into the "business as usual" line, then
    // fan down to the goal.
    var wedgeEase = d3.easeBounceOut;
    var wedgeTime = 2 * carbonGraph.animTime;
    // Wedge background
    carbonGraph.graph.wedgeBkg_pts = [{
        key: 'top',
        year: simData.simDataYear,
        carbon_GtPerYear: simData.simDataYearCarbon
    },
    {
        key: 'tip',
        year: simData.startYear,
        carbon_GtPerYear: simData.startCarbon
    },
    {
        key: 'bottom',
        year: simData.simDataYear,
        carbon_GtPerYear: carbonGraph.graph.wedgeLinePts[carbonGraph.graph.wedgeLinePts.length - 1].carbon_GtPerYear
    },
    ];



    //Yellow Background
    carbonGraph.graph.wedgeBkg = carbonGraph.contents.append('path')
        .attr('class', 'wedgeBackground')
        .datum(carbonGraph.graph.wedgeBkg, function (d) { return d.key; });
    carbonGraph.graph.applyClipPath(carbonGraph.graph.wedgeBkg);




    // Wedge dividers (including bottom edge)
    carbonGraph.graph.wedgeLines = carbonGraph.contents.selectAll('.wedgeLine')
        .data(carbonGraph.graph.wedgeLinePts, function (d) { return d.key; })
        .enter().append('line')
        .attr('class', 'wedgeLine')
        .attr('fill', 'none')
        .attr('opacity', 0);
    carbonGraph.graph.applyClipPath(carbonGraph.graph.wedgeLines);


    // Draw the net-zero projection (the goal!).
    carbonGraph.graph.netzeroProj_pts = [{
        key: 'start',
        year: simData.startYear,
        carbon_GtPerYear: simData.startCarbon
    },
    {
        key: 'goal',
        year: simData.netZeroTarget,
        carbon_GtPerYear: 0
    },
    {
        key: 'end',
        year: simData.simDataYear,
        carbon_GtPerYear: 0
    },
    ];
    carbonGraph.graph.netzeroProj = carbonGraph.contents.append('path')
        .datum(carbonGraph.graph.netzeroProj_pts, function (d) { return d.key; })
        .attr('class', 'line wedgeProjLine wedgeTargetProjLine')
        .attr("id", "bottomLine")
        .attr("stroke", 'rgb(16, 186, 172)')
        .attr("stroke-width", "4")
        .on('mouseover', function () {
            d3.select(this)
                .attr("stroke", 'rgb(166, 245, 238)')
                .attr("stroke-width", '15');
            d3.select('#goalButtonText')
                .attr('font-size', '16')
                .attr("startOffset", "2%")

        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke", 'rgb(16, 186, 172)')
                .attr("stroke-width", '4');
            d3.select('#goalButtonText')
                .attr('font-size', '14')
                .attr("startOffset", "10%");

        });
    carbonGraph.graph.applyClipPath(carbonGraph.graph.netzeroProj);



    // Define the arrowhead marker.
    svg.append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrowhead')
        .attr('markerUnits', 'strokeWidth')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('class', 'wedgeProjLine')
        .attr("stroke", "darkgreen")
        .attr("stroke-width", "4")
        .attr("fill", "none");

    // Draw the initial arrow projection.
    carbonGraph.graph.projection_pts = [{
        key: 'start',
        year: simData.startYear,
        carbon_GtPerYear: simData.startCarbon
    },
    {
        key: 'netZero',
        year: simData.simDataYear,
        carbon_GtPerYear: simData.simDataYearCarbon
    },
    {
        key: 'point',
        year: simData.simDataYear,
        carbon_GtPerYear: simData.simDataYearCarbon
    },
    ];
    carbonGraph.graph.projection = carbonGraph.contents.append('path')
        .datum(carbonGraph.graph.projection_pts, function (d) { return d.key; })
        .attr('class', 'line wedgeProjLine wedgeCurrentProjLine')
        .attr("stroke-width", "4")
        .attr('stroke', "green")
        .attr('marker-end', 'url(#arrowhead)');
    carbonGraph.graph.applyClipPath(carbonGraph.graph.projection);




    // Label the net zero goal.
    carbonGraph.graph.goalButton = carbonGraph.contents.append('svg')
        .classed('goalButtonWrapper', true)
    // .attr('x', carbonGraph.graph.xScale(simData.netZeroTarget) - 210)
    // .attr('y', carbonGraph.graph.yScale(39))
    // .append('g')
    // .attr("transform", "rotate(36.5)");
    carbonGraph.graph.goalButton.append('text').append("textPath")
        .attr('href', "#bottomLine")
        .attr('id', 'goalButtonText')
        .classed('goalButtonText initInvisible hideOnShrink', true)
        .attr('tabindex', 0)
        .attr("side", "right")
        .text("Resilient Pathway")
        .attr("startOffset", "10%")
        .attr('alignment-baseline', "hanging")
        .attr('fill', "black")
        .attr('font-size', '14');

    // var bb = carbonGraph.graph.goalButton.node().getBBox();
    // carbonGraph.graph.goalButton.append('rect').lower()
    //     .attr('id', 'ourGoalButton')
    //     .classed('goalButton initInvisible hideOnShrink', true)
    //     .attr('x', -5)
    //     .attr('y', -(bb.height - 2))
    //     .attr('rx', bb.height / 2 + 2)
    //     .attr('ry', bb.height / 2 + 2)
    //     .attr('width', bb.width + 10)
    //     .attr('height', bb.height + 4);

    // Add buttons to show/hide the historical data. (Using a nested svg
    // element instead of a g makes the positioning easier.) The actual
    // button is a transparent circle behind the icon.  Otherwise the icon
    // has a hole in it.
    carbonGraph.graph.historyToggleSize = 20; // Diameter of each icon.
    // Save the default xmin, since we'll be changing it later.
    simData.timeScales.default = {
        xmin: simData.timeScales[carbonGraph.timeScale].xmin,
        xmax: simData.timeScales[carbonGraph.timeScale].xmax,
        ymin: simData.timeScales[carbonGraph.timeScale].ymin,
    };
    carbonGraph.graph.historyToggle = carbonGraph.contents.append('svg')
        .classed('initInvisible hideOnShrink', true)
        .attr('x', carbonGraph.graph.historyToggleSize * 0.25)
        .attr('y', carbonGraph.graph.graphHeight - carbonGraph.graph.historyToggleSize * 1.25);
    carbonGraph.graph.longHistoryButton = carbonGraph.graph.historyToggle.append('g');
    carbonGraph.graph.longHistoryButton.append('circle')
        .attr('id', 'longHistoryButton')
        .classed('graphToggleBkg graphToggle-active', true)
        .attr('tabindex', 0)
        .attr('cx', carbonGraph.graph.historyToggleSize / 2)
        .attr('cy', carbonGraph.graph.historyToggleSize / 2)
        .attr('r', carbonGraph.graph.historyToggleSize / 2);
    carbonGraph.graph.longHistoryButton.append('use')
        .classed('graphToggleIcon', true)
        .attr('width', carbonGraph.graph.historyToggleSize)
        .attr('height', carbonGraph.graph.historyToggleSize)
        .attr('href', 'img/fontawesome/fontawesome-free-5.9.0-web-solid-sprite_a.svg#arrow-alt-circle-left');
    carbonGraph.graph.shortHistoryButton = carbonGraph.graph.historyToggle.append('g');
    carbonGraph.graph.shortHistoryButton.append('circle')
        .attr('id', 'shortHistoryButton')
        .classed('graphToggleBkg', true)
        .attr('tabindex', 0)
        .attr('cx', carbonGraph.graph.historyToggleSize / 2 + carbonGraph.graph.historyToggleSize * 1.25)
        .attr('cy', carbonGraph.graph.historyToggleSize / 2)
        .attr('r', carbonGraph.graph.historyToggleSize / 2)
    carbonGraph.graph.shortHistoryButton.append('use')
        .classed('graphToggleIcon graphToggleIcon', true)
        .attr('width', carbonGraph.graph.historyToggleSize)
        .attr('height', carbonGraph.graph.historyToggleSize)
        .attr('href', 'img/fontawesome/fontawesome-free-5.9.0-web-solid-sprite_a.svg#arrow-alt-circle-right')
        .attr('x', carbonGraph.graph.historyToggleSize * 1.25);


    // // Load the historical data, and graph it when it's ready.
    // d3.csv("carbonVSyear.csv", d3.autoType).then(function (data) {
    //     carbonGraph.historyData = data;

    //     // Convert the data into Gt of CO2 /yr.
    //     carbonGraph.historyData = carbonGraph.historyData.map(function (d) {
    //         d.carbon_GtPerYear = d.carbon_MtPerYear / 1000 * (44 / 12);
    //         return d;
    //     });



    // Load the historical data, and graph it when it's ready.
    //This is an updated source: https://www.pik-potsdam.de/paris-reality-check/primap-hist/

    d3.csv("GHGVsYear.csv", d3.autoType).then(function (data) {
        carbonGraph.historyData = data;

        // Convert the data into Gt of CO2 /yr.
        carbonGraph.historyData = carbonGraph.historyData.map(function (d) {
            d.carbon_GtPerYear = d.carbon_MtPerYear / 1000;
            return d;
        });

        // Append the present-day carbon rate so the history connects
        // to the wedges.
        carbonGraph.historyData.push({
            year: simData.startYear,
            carbon_GtPerYear: simData.startCarbon
        });

        carbonGraph.graph.historyLine = carbonGraph.contents.append('path')
            .attr('class', 'line kcvsGraphLine carbonHistoryLine')
            .attr('fill', 'none')
            .attr('id', 'carbonHistory')
            .datum(carbonGraph.historyData)
            .attr('d', carbonGraph.lineGen(carbonGraph.historyData))
            .raise(); // make sure the history line is on top.
        carbonGraph.graph.applyClipPath(carbonGraph.graph.historyLine);
        //calculate the netCO2: 
        simulation.updateNetCO2();
        impactDisplay.init();
        //update the impacts once CO2 is calculated:
        impactDisplay.updateImpacts();

    }); // load and graph historical data.

    // Draw everything!  (Possibly except for the history line.)
    // true means this is the initial call.
    carbonGraph.updateAxes(true);

    //////////////////////////////
    // Listeners

    // Graph assumptions buttons functionality.
    // (This really should be stand-alone function defined separately...)
    $('#graphAssumptionsButton, #ourGoalButton, #bottomLine, #goalButtonText').on('click', function (event) {
        var assumptions = $('#graphAssumptions').html();
        if (!assumptions) assumptions = 'This makes no assumptions!  <br>(ahem.)';
        createWindowHTML(assumptions, 'big');
        $('.reference').on('click', function (event) {
            createReference(event.target);
        });
    });

    // Historic timescale toggle functionality.
    carbonGraph.graph.historyToggle.showGraphHistory = function () {
        simData.timeScales.short.xmin = carbonGraph.historyData[0].year;
        simData.timeScales.long.xmin = carbonGraph.historyData[0].year;
        carbonGraph.updateAxes();
        simulation.updateNetCO2();
        $('#longHistoryButton').removeClass('graphToggle-active');
        $('#shortHistoryButton').addClass('graphToggle-active');
    }
    carbonGraph.graph.historyToggle.hideGraphHistory = function () {
        simData.timeScales.short.xmin = simData.timeScales.default.xmin;
        simData.timeScales.long.xmin = simData.timeScales.default.xmin;
        carbonGraph.updateAxes();
        simulation.updateNetCO2();
        $('#shortHistoryButton').removeClass('graphToggle-active');
        $('#longHistoryButton').addClass('graphToggle-active');
    }
    $('#longHistoryButton').on('click', function (event) {
        if ($(this).hasClass('graphToggle-active')) {
            carbonGraph.graph.historyToggle.showGraphHistory();
        }
    });
    $('#shortHistoryButton').on('click', function (event) {
        if ($(this).hasClass('graphToggle-active')) {
            carbonGraph.graph.historyToggle.hideGraphHistory();
        }
    });

    // Timescale switch functionality.
    $('#timeScaleSwitch').on('input', function (event) {
        event.stopPropagation();

        if ($(event.target).prop('checked')) {
            carbonGraph.timeScale = "long";
        } else {
            carbonGraph.timeScale = "short";
        }
        // $('#currentTimeScale').text(simData.timeScales[carbonGraph.timeScale].xmax);

        carbonGraph.updateAxes();
        simulation.updateNetCO2();
        impactDisplay.update();
    });

    carbonGraph.score.init();

} // carbonGraph.init()


// (Re)draw the graph components that were defined during init.  (Do this each
// time the axes change.)
carbonGraph.updateAxes = function (isInit) {

    var ttime,
        wedgeTime, wedgeEase, wedgeDelay,
        projTime, projEase, projDelay;
    if (isInit) {
        ttime = 0;
        projTime = 0.8 * carbonGraph.animTime;
        projEase = d3.easeCubicIn;
        projDelay = 0;
        wedgeTime = 2 * carbonGraph.animTime;
        wedgeEase = d3.easeBounceOut;
        wedgeDelay = projTime;
    } else {
        ttime = carbonGraph.animTime;
        wedgeTime = ttime;
        wedgeEase = d3.easeCubicInOut;
        wedgeDelay = 0;
        projTime = ttime;
        projEase = d3.easeCubicInOut;
        projDelay = 0;
    }
    var t = d3.transition().duration(ttime);
    var wt = d3.transition().duration(wedgeTime).delay(wedgeDelay).ease(wedgeEase);
    var pt = d3.transition().duration(projTime).delay(projDelay).ease(projEase);

    var oldLimits = carbonGraph.graph.getAxisLimits();
    var newLimits = simData.timeScales[carbonGraph.timeScale];
    carbonGraph.graph.xmin = newLimits.xmin;
    carbonGraph.graph.xmax = newLimits.xmax;
    carbonGraph.graph.ymin = newLimits.ymin;
    carbonGraph.graph.ymax = newLimits.ymax;

    var gr = carbonGraph.graph;
    var svg = carbonGraph.graph.svg;

    // Rescale the axes.
    gr.xScale.domain([newLimits.xmin, newLimits.xmax]);
    gr.yScale.domain([newLimits.ymin, newLimits.ymax]);
    gr.xAxisG.transition(t).call(gr.xAxis);
    gr.yAxisG.transition(t).call(gr.yAxis);

    // Initialize "collapsed" so it can animate in.
    if (isInit) {
        var wedgeBkg_startpts = $.extend(true, [], carbonGraph.graph.wedgeBkg_pts); // deep copy
        wedgeBkg_startpts[2].carbon_GtPerYear = simData.simDataYearCarbon;
        // TODO: Put all these wedgeBkg objects into an array, to make it easier to work with and add to.
        carbonGraph.graph.wedgeBkg.attr('d', carbonGraph.lineGen(wedgeBkg_startpts));

        carbonGraph.graph.wedgeLines
            .attr('x1', carbonGraph.graph.xScale(simData.startYear))
            .attr('x2', carbonGraph.graph.xScale(simData.simDataYear))
            .attr('y1', carbonGraph.graph.yScale(simData.startCarbon))
            .attr('y2', carbonGraph.graph.yScale(simData.simDataYearCarbon));

        var projection_startpts = [{
            key: 'start',
            year: simData.startYear,
            carbon_GtPerYear: simData.startCarbon
        },
        {
            key: 'netZero',
            year: simData.startYear,
            carbon_GtPerYear: simData.startCarbon
        },
        {
            key: 'point',
            year: simData.startYear + 1,
            carbon_GtPerYear: simulation.getCarbonInYear(simData.startYear + 1)
        },
        ]
        carbonGraph.graph.projection
            .attr('d', carbonGraph.lineGen(projection_startpts));
        carbonGraph.graph.netzeroProj
            .attr('d', carbonGraph.lineGen(projection_startpts));

    } // if (isinit)

    // Wedges.
    var wedgeBkg_top = carbonGraph.graph.wedgeBkg_pts.find(function (e) { return e.key == "top" });
    svg.select('.wedgeBackground')
        .transition(wt)
        .attr('d', carbonGraph.lineGen(carbonGraph.graph.wedgeBkg_pts));

    svg.selectAll('.wedgeLine')
        .transition(wt)
        .attr('opacity', 1)
        .attr('x1', carbonGraph.graph.xScale(simData.startYear))
        .attr('x2', carbonGraph.graph.xScale(simData.simDataYear))
        .attr('y1', carbonGraph.graph.yScale(simData.startCarbon))
        .attr('y2', function (d) { return carbonGraph.graph.yScale(d.carbon_GtPerYear); });

    // Projection.
    carbonGraph.updateProjection();
    // svg.select('.wedgeProjLine:not(.wedgeTargetProjLine)')
    svg.select('.wedgeCurrentProjLine')
        .datum(carbonGraph.graph.projection_pts, function (d) { return d.key; })
        .transition(pt)
        .attr('opacity', 1)
        .attr('d', carbonGraph.lineGen)
        .attr("stroke-width", "4");

    // Net-zero target line.
    svg.select('.wedgeTargetProjLine')
        .datum(carbonGraph.graph.netzeroProj_pts, function (d) { return d.key; })
        .transition(pt)
        .attr('opacity', 1)
        .attr('d', carbonGraph.lineGen);

    // 'Our goal' label.
    carbonGraph.graph.goalButton
        .transition(t)
        //.attr('x', carbonGraph.graph.xScale(simData.netZeroTarget))
        .attr('opacity', 1 - carbonGraph.graph.goalButton.attr('opacity'));

    // History.
    var history = svg.select('.carbonHistoryLine');
    if (!(history.empty())) { // make sure it's loaded!
        history.raise() // make sure the history line is on top.
            .datum(carbonGraph.historyData)
            .transition(t)
            .attr('d', carbonGraph.lineGen);
    }

} // carbonGraph.updateAxes()

// Calculate the points on the projection arrow.
carbonGraph.updateProjection = function () {
    var year0 = simulation.getNetZeroYear();
    var xmax = carbonGraph.graph.xmax;
    carbonGraph.graph.projection_pts[1].year = Math.min(year0, xmax - 1);
    carbonGraph.graph.projection_pts[1].carbon_GtPerYear = Math.max(0, simulation.getCarbonInYear(carbonGraph.graph.projection_pts[1].year));
    carbonGraph.graph.projection_pts[2].year = xmax;
    carbonGraph.graph.projection_pts[2].carbon_GtPerYear = Math.max(0, simulation.getCarbonInYear(carbonGraph.graph.projection_pts[2].year));
}

// Call the update function after updating the simulation.
carbonGraph.update = function () {
    var newCarbon_xmax = simulation.getCarbonInYear(carbonGraph.graph.xmax);

    // Remove the wedges we've eliminated!
    var wedgeBkg_top = carbonGraph.graph.wedgeBkg_pts.find(function (e) { return e.key == "top" });
    wedgeBkg_top.carbon_GtPerYear = simulation.getCarbonInYear(wedgeBkg_top.year);



    d3.select('.wedgeBackground')
        .transition().duration(carbonGraph.smoothTime)
        .attr('d', carbonGraph.lineGen(carbonGraph.graph.wedgeBkg_pts));



    // Move the projection arrow!
    carbonGraph.updateProjection();
    // d3.select('.wedgeProjLine')
    d3.select('.wedgeCurrentProjLine')
        .datum(carbonGraph.graph.projection_pts, function (d) { return d.key; })
        .transition().duration(carbonGraph.smoothTime)
        // .attr('y2', carbonGraph.graph.yScale(newCarbon_xmax));
        .attr('d', carbonGraph.lineGen);

    return newCarbon_xmax;
}

//////////////////////////////
// Display the "score", i.e. the number of wedges eliminated.
carbonGraph.score = {};

carbonGraph.score.wedgesEliminated = 0;


// carbonGraph.score.init = function() {
//     // Initialize the score display.
//     carbonGraph.score.display = $('<div></div>')
//         .attr('id', 'wedgeScore')
//         .addClass('wedgeScore hideOnShrink')
//         .appendTo('#projectionGraphContainer');
//     carbonGraph.score.update(true);
// 
//     simulation.addListener(carbonGraph.score.checkScore);
// }

carbonGraph.score.init = function () {
    // Initialize the score display.

    // TODO: Add text annotation functions to kcvs-graph.

    carbonGraph.score.x0 = 5; // left margin.

    carbonGraph.score.scoreLabel = carbonGraph.graph.svg.append('text')
        .attr('id', 'wedgeScoreLabel')
        .classed('wedgeScore hideOnShrink', true)
        .attr('x', carbonGraph.score.x0)
        .attr('y', 5)
        .attr('dy', '1em')
        .html('Wedges eliminated:');
    carbonGraph.score.scoreStatus = carbonGraph.score.scoreLabel.append('tspan')
        .attr('id', 'wedgeScoreStatus')
        .classed('wedgeScore wedgeScoreNum hideOnShrink', true)
        .attr('x', 4 * carbonGraph.score.x0)
        .attr('dy', '1.1em')
        .html('<tspan id="wedgeScoreNum"></tspan> / ' + simData.nWedges);
    carbonGraph.score.scoreNum = carbonGraph.score.scoreStatus.select('#wedgeScoreNum');

    carbonGraph.score.update();

    simulation.addListener(carbonGraph.score.checkScore);
}


// carbonGraph.score.update = function(init) {
//     carbonGraph.score.display.html('Wedges eliminated: <strong>' + carbonGraph.score.wedgesEliminated + ' / ' + simData.nWedges + '</strong>');
//     // TODO: Flash the score display when a wedge is eliminated.
//     /* 
//         Currently this code is inefficient somehow -- there's a pause before each flash, which makes the interface really choppy.
//         Also, we probably only want to flash the score if it's _increasing_, which we're not currently checking.
//     */
//     // if (!init) {
//     //     carbonGraph.score.display.removeClass('wedgeScore-flash');
//     //     window.setTimeout(function(){carbonGraph.score.display.addClass('wedgeScore-flash')}, 0);
//     // }
// }

carbonGraph.score.update = function () {
    carbonGraph.score.scoreNum.html(carbonGraph.score.wedgesEliminated);

    // Check if all wedges were eliminated
    if (carbonGraph.score.wedgesEliminated == simData.nWedges) {

        // For each 'firework', display animation
        $(".celebrationCircle").each(function () {
            // Get parent dimensions
            var parent = $(this).parent();
            var w = parseInt($('#' + parent.attr('id')).css('width')) - 2;
            var h = parseInt($('#' + parent.attr('id')).css('height')) - 2;

            $(this).animate({
                opacity: "0.8",
                height: h,
                width: w,
            }, 1000, function () {
                // Animate fade out effect when finished
                $(this).animate({
                    opacity: "0",
                }, 1000, function () {
                    // Hide 'firework'
                    $(this).css("height", "0px");
                    $(this).css("width", "0px");

                    // Flash what's next button 3 times
                    $("#whatNextButton").addClass("qm_lookAtMe");
                    setTimeout(function () {
                        $("#whatNextButton").removeClass("qm_lookAtMe");
                    }, 6000);
                });
            });
        });



        // Display circle animation that indicates all wedges were removed
        // $("#celebrationCircle").animate({
        //     opacity: "0.8",
        //     height: "100px",
        //     width: "100px",
        // }, 1000, function () {
        //     // Fade circle out when animation is done
        //     $("#celebrationCircle").animate({
        //         opacity: "0",
        //     }, 1000, function () {
        //         $("#celebrationCircle").css("height", "0px");
        //         $("#celebrationCircle").css("width", "0px");

        //         // Flash what's next button 3 times
        //         $("#whatNextButton").addClass("qm_lookAtMe");
        //         setTimeout(function () {
        //             $("#whatNextButton").removeClass("qm_lookAtMe");
        //         }, 6000);
        //     });
        // });
    }
}

// Check if the score has changed.
carbonGraph.score.checkScore = function () {
    var nextDown = carbonGraph.score.wedgesEliminated + 1;
    var nextUp = carbonGraph.score.wedgesEliminated;
    var changed = false;
    while (nextDown < carbonGraph.graph.wedgeLinePts.length &&
        simulation.carbonInSimYear.total < carbonGraph.graph.wedgeLinePts[nextDown].carbon_GtPerYear) {
        carbonGraph.score.wedgesEliminated = nextDown;
        changed = true;
        nextDown++;
    }
    while (nextUp > 0 &&
        simulation.carbonInSimYear.total > carbonGraph.graph.wedgeLinePts[nextUp].carbon_GtPerYear) {
        carbonGraph.score.wedgesEliminated = nextUp - 1;
        changed = true;
        nextUp--;
    }
    if (changed) carbonGraph.score.update();
}



// When the projection crosses a wedge line, fire a custom event.  
// can use this event to check completion conditions etc.  
carbonGraph.score.simWedgeListener = function () {
    // var nextDown = qm.lastWedgeDown+1;
    // var nextUp = qm.lastWedgeUp-1;
    var nextDown = carbonGraph.score.lastWedge + 1;
    var nextUp = carbonGraph.score.lastWedge - 1;
    while (nextDown < carbonGraph.graph.wedgeLinePts.length &&
        simulation.carbonInSimYear.total < carbonGraph.graph.wedgeLinePts[nextDown].carbon_GtPerYear) {
        // qm.lastWedgeDown = Math.min(qm.lastWedgeDown+1, carbonGraph.graph.wedgeLinePts.length);
        carbonGraph.score.lastWedge = nextDown;
        carbonGraph.container.trigger({
            type: 'wedgeDown',
            wedge: nextDown
        });
        nextDown++;
    }
    while (nextUp >= 0 &&
        simulation.carbonInSimYear.total > carbonGraph.graph.wedgeLinePts[nextUp].carbon_GtPerYear) {
        qm.lastWedge = nextUp;
        qm.wedgeTriggerElement.trigger({
            type: 'wedgeUp',
            wedge: nextUp
        });
        nextUp--;
    }
}


////////////////////////////////////////////////////////////
// Display feasibility of current slider settings.
var feasibilityIndicator = {};

feasibilityIndicator.init = function () {
    // Store some elements so we don't have to search the DOM each time.
    feasibilityIndicator.container = $('#feasibilityIndicator');
    feasibilityIndicator.fills = feasibilityIndicator.container.find('.feasibilityFill');
    feasibilityIndicator.topFill = feasibilityIndicator.fills.filter('.realistic');
    feasibilityIndicator.msg = feasibilityIndicator.container.find('.feasibilityLabel');
    feasibilityIndicator.icon = $('.feasibilityAssumptionsIcon');

    $('.feasibilityBase, .feasibilityAssumptionsIcon').on('click', function (event) {
        var assumptions = $('#feasibilityAssumptions').html();
        if (!assumptions) assumptions = 'This makes no assumptions!  <br>(ahem.)';
        createWindowHTML(assumptions, 'normal');
        $('.reference').on('click', function (event) {
            createReference(event.target);
        });
    });

    // Make sure the initial values match the initial sim.
    feasibilityIndicator.update();
} // feasibilityIndicator.init function


// Call this after updating the simulation.
feasibilityIndicator.update = function () {
    // Square so it turns redder faster.
    var feasOpacity = simData.feasibility * simData.feasibility;
    feasibilityIndicator.fills.css('width',
        Math.round(100 * simData.feasibility) + '%');
    feasibilityIndicator.topFill.css('opacity', feasOpacity);
    // if (simData.feasibility >= 0.99) {
    if (simulation.isFeasible()) {
        // feasibilityIndicator.msg.text('realistic');
        feasibilityIndicator.msg.filter('.unrealistic').fadeOut(carbonGraph.animTime / 2);
        feasibilityIndicator.msg.filter('.realistic').fadeIn(carbonGraph.animTime / 2);
    } else {
        // feasibilityIndicator.msg.text('not realistic');
        feasibilityIndicator.msg.filter('.realistic').fadeOut(carbonGraph.animTime / 2);
        feasibilityIndicator.msg.filter('.unrealistic').fadeIn(carbonGraph.animTime / 2);
    }

    return simData.feasibility;
}



////////////////////////////////////////////////////////////
// Display impact of projected carbon production on climate.
var impactDisplay = {};
impactDisplay.display = $('#impactDisplay');
impactDisplay.container = $('#impactDisplay');
impactDisplay.zoomIcon = impactDisplay.container.find('.zoomIcon');
impactDisplay.isZoomedIn = false;
zoomer.addZoomFunctions(impactDisplay);

// Some reference sizes for scales.
impactDisplay.reasonableRadius = 25;
impactDisplay.extremeRadius = 35;

impactDisplay.calcRadius = function (impact, value) {
    // Calculate the arc radius for this impact.
    // INPUTS:
    // - impact is an element from the impact array from simData.
    // - value is an optional arbitrary value (e.g. present-day).  If not present, will use impact.value.

    if (impact.scale == undefined) {
        // Define scale factor to convert sqrt(value) into svg units.
        impact.scale = (impactDisplay.extremeRadius - impactDisplay.reasonableRadius) /
            (Math.sqrt(impact.extreme) - Math.sqrt(impact.reasonable));
        impact.ref = Math.sqrt(impact.reasonable); // Reference point.
    }

    if (value == undefined) value = impact.value;

    return (Math.sqrt(value) - impact.ref) * impact.scale + impactDisplay.reasonableRadius;

} // impactDisplay.calcRadius function

impactDisplay.init = function () {
    //Update the impact Calculations before the crater loads:
    impactDisplay.updateImpacts();
    //Set up the assumptions button for the impacts:
    d3.selectAll(".impactAssumptionsIcon").on("click", function () {
        pageCollection.showAssumptions("impactAssumptions")
    });

    //Add an svg
    //Scale it so that the whole thing is visible, to start:
    var viewBoxWidth = (2 * impactDisplay.biggestRad),
        viewBoxMin = 50 - impactDisplay.biggestRad,
        viewBox = viewBoxMin + " " + viewBoxMin + " " + +viewBoxWidth + " " + viewBoxWidth;
    d3.select("#impactContainer")
        .append("div")
        .attr('id', 'impactSpaceWrapper')
        .classed('kcvsGraphWrapper', true)
        .append("svg")
        .attr("id", "impactSpace")
        .attr("viewBox", viewBox)
        .attr("preserveAspectRatio", "xMidYMid meet");
    var impactSpace = d3.select("#impactSpace");

    //Set up a shadow for behind the crater
    var defs = impactSpace.append("defs");
    var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "blur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    //Add the place for the circle to go and give it the shadow
    impactSpace.append("g")
        .attr("id", "impactCrater")
        .attr("transform", "translate(50, 50)")
        .style("filter", "url(#drop-shadow)");


    //  Add a place for the Impact circles, and present wedges.
    impactSpace.append("g")
        .attr("id", "presentImpactCrater")
        .attr("transform", "translate(50, 50)")
        .attr("class", "noInteract");

    // Add a place for the Impact symbols, so they stay on top of everything.
    impactSpace.append('g')
        .attr('id', 'impactSymbols')
        .attr('transform', 'translate(50, 50)')
        .attr('class', 'noInteract');

    var impactCrater = d3.select("#impactCrater");
    var presentImpactCrater = d3.select("#presentImpactCrater");
    var impactSymbols = d3.select('#impactSymbols');
    var impacts = simData.impacts;

    //the start angle, and the angle for each impact - this is needed for the icons:
    var thisAngle = 0,
        eachAngle = Math.PI * 2 / impacts.length;

    //Go through each impact and add the proper wedge:
    impacts.forEach(function (index) {

        var thisImpact = index;

        // var roundedValue = thisImpact.value.toPrecision(3);
        // var roundedValue = thisImpact.value.toFixed(thisImpact.decimal);
        var roundedValue = thisImpact.value;
        if (thisImpact.roundToNearest) {
            // WARNING: Assumes roundToNearest < 1 !
            roundedValue = Math.round(roundedValue / thisImpact.roundToNearest) * thisImpact.roundToNearest;
        }
        roundedValue = roundedValue.toFixed(thisImpact.decimal);

        //Add the impact Wedges
        impactCrater.append('path')
            .attr("d", "M 0 0")
            .attr("class", "impactWedge " + "color-" + thisImpact.type)
            .attr("id", thisImpact.type + "Impact")
            .attr("tabindex", 0)
            .on("mouseover", function () {
                var textScale = impactDisplay.biggestRad / 50,
                    textSize = 5 * textScale,
                    textX = 50 - 25 * textScale,
                    textY1 = 50 + 40 * textScale,
                    textY2 = 50 + 45 * textScale;
                d3.select(this).raise()
                    .attr("stroke", d3.select(this).style("fill"));
                // d3.select("#impactNameText")
                //     .text(thisImpact.name + ":")
                //     .attr("font-size", textSize)
                //     .attr("x", textX)
                //     .attr("y", textY1);
                // d3.select("#impactText")
                //     .text(roundedValue + " " + thisImpact.units)
                //     .attr("font-size", textSize)
                //     .attr("x", textX)
                //     .attr("y", textY2);
                impactDisplay.impactText.html(thisImpact.name + ':<br>' +
                    roundedValue + ' ' + thisImpact.units);
                impactDisplay.impactText.addClass('shown');
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke", "none");
                // d3.select("#impactNameText")
                //     .text("");
                // d3.select("#impactText")
                //     .text("");
                // impactDisplay.impactText.html('');
                impactDisplay.impactText.removeClass('shown');
            })
            //so that th assumptions show up for each wedge when it is clicked:
            .on("click", function () {
                pageCollection.showAssumptions(thisImpact.type + "Assumptions");

                ////Code to show the assumptions for each wedge, I hope. 
            })
            .transition() //transition so it loads nice
            .ease(d3.easeSin)
            .delay(impacts.indexOf(thisImpact) * 2 * carbonGraph.animTime / impacts.length) //this delays each wedge until the previous wedge is done
            .duration(carbonGraph.animTime * 2 / impacts.length) //so it matches the carbonGraph animation
            .attr("d", thisImpact.path); //transition to the right path

        // Listener for the enter key if an impact wedge is in focus 
        $('.impactWedge').on("keydown", function (e) {
            console.log(e);
            if (e.keyCode === 13) {
                // Open assumptions
                pageCollection.showAssumptions(thisImpact.type + "Assumptions");
            }
        })


        //Add the wedges for the present values
        presentImpactCrater.append('path')
            .attr("d", "M 0 0")
            .attr("class", "presentImpactWedge")
            .attr("id", thisImpact.type + "PresentImpact")
            .attr("d", thisImpact.presentPath);


        //Add the proper Symbol:
        var iconAngle = thisAngle + (eachAngle / 2) - (Math.PI / 2),
            iconSize = 16,
            iconX = iconSize * (Math.cos(iconAngle)) - iconSize / 2,
            iconY = iconSize * (Math.sin(iconAngle)) - iconSize / 2;

        impactSymbols.append("image")
            .attr("href", thisImpact.icon)
            .attr("x", iconX)
            .attr("y", iconY)
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("class", "impactsIcon noInteract");

        //Add Hidden Text to show when the impacts Change:
        var textX = 40 + 45 * (Math.cos(iconAngle)),
            textY = 50 + 47 * (Math.sin(iconAngle));

        impactSpace.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("font-size", 5)
            .attr("id", thisImpact.type + "impactUpdateText1")
            .attr("class", "noInteract impactUpdateText");
        impactSpace.append("text")
            .attr("x", textX)
            .attr("y", textY + 8)
            .attr("font-size", 5)
            .attr("id", thisImpact.type + "impactUpdateText2")
            .attr("class", 'noInteract impactUpdateText');


        //go to the next angle for the next impact
        thisAngle = thisAngle + eachAngle;

    }); //impacts.forEach

    //Add the circles on top
    //Reasonable Circle:
    presentImpactCrater.append("circle")
        // .attr("r", 25)
        .attr("r", impactDisplay.reasonableRadius)
        // .attr("fill", "transparent")
        // .attr("stroke", "green")
        // .attr("stroke-width", "0.5")
        .classed('impactCircle reasonable', true);
    //Extreme Circle:
    presentImpactCrater.append("circle")
        // .attr("r", 35)
        .attr("r", impactDisplay.extremeRadius)
        // .attr("fill", "transparent")
        // .attr("stroke", "red")
        // .attr("stroke-width", "0.5")
        .classed('impactCircle extreme', true);

    // Label the circles.
    var svg_ns = 'http://www.w3.org/2000/svg';
    var xlink_ns = 'http://www.w3.org/1999/xlink';
    var makeArcPath = function (r, id) {
        // Make a semicircular path to wrap some text around.
        // Adds the path to the defs section.
        var path = '';
        path += 'M-' + r + ',0'; // Move to the start of the path.
        path += ' A' + r + ',' + r + ',0,0,1,' + r + ',0'; // Arc to the end.
        var elem = document.createElementNS(svg_ns, 'path');
        elem.setAttributeNS(null, 'd', path);
        elem.setAttributeNS(null, 'fill', 'none');
        elem.setAttributeNS(null, 'stroke', 'none');
        elem.setAttributeNS(null, 'id', id);
        defs.node().appendChild(elem);
        return elem;
    }
    var makeArcText = function (pathID, txt, id, classes) {
        var textElem = document.createElementNS(svg_ns, 'text');
        $(textElem).attr('id', id)
            .attr('text-anchor', 'middle')
            .addClass('impactCircleLabel ' + classes);
        var textPathElem = document.createElementNS(svg_ns, 'textPath');
        textPathElem.setAttributeNS(xlink_ns, 'href', '#' + pathID);
        textPathElem.innerHTML = txt;
        $(textPathElem).attr('startOffset', '50%');
        textElem.appendChild(textPathElem);
        return textElem;
    }

    var reasonablePath = makeArcPath(impactDisplay.reasonableRadius, 'reasonablePath');
    var reasonableLabel = makeArcText('reasonablePath', 'goal', 'reasonableLabel', 'reasonable');
    presentImpactCrater.node().appendChild(reasonableLabel);

    var extremePath = makeArcPath(impactDisplay.extremeRadius, 'extremePath');
    var extremeLabel = makeArcText('extremePath', 'extreme', 'extremelabel', 'extreme');
    presentImpactCrater.node().appendChild(extremeLabel);

    // Add an assumptions instruction.
    impactDisplay.assumptionsLegend = $('<div></div>')
        .attr('id', 'assumptionsLegend')
        .addClass('impactText impactLegend impactLegend-left noInteract hideOnShrink')
        .html('<em>click and hover over sectors<br>to learn more about them</em>')
        .appendTo('#impactSpaceWrapper');


    // Add a 'legend' to explain the 'today' curves.
    impactDisplay.todayLegend = $('<div></div>')
        .attr('id', 'todayLegend')
        .addClass('impactText impactLegend impactLegend-right noInteract hideOnShrink')
        .appendTo('#impactSpaceWrapper');
    var legendSVG = d3.select('#todayLegend').append('svg');
    legendSVG.attr('width', 20)
        .attr('height', 15)
        .attr('viewBox', '0 0 8 6');
    var legendLine = document.createElementNS(svg_ns, 'path');
    legendLine.setAttributeNS(null, 'd', 'M0,4L8,4');
    legendLine.setAttributeNS(null, 'class', 'presentImpactWedge');
    legendSVG.node().appendChild(legendLine);
    impactDisplay.todayLegend.append('&nbsp;Present Day');

    //Append text to be the label on the graph:
    impactDisplay.impactText = $('<div></div>')
        .addClass('impactText noInteract')
        .appendTo('#impactSpaceWrapper');

}; //impactDisplay.init()

//update all the values for the impacts
impactDisplay.updateImpacts = function () {
    //So that the impact display will "zoom out"- the minimum radius that it should be 50.
    impactDisplay.biggestRad = 60;
    var impacts = simData.impacts,
        netCO2 = simulation.netCO2,
        netCarbon = netCO2 * (12 / 44);

    //This Constant returns a value that indicates where emissions are compared with the scale the simulation is between 0 (net 0 CO2) and 1 (starting point). This number could be higher than 1 (or lower than 0) if emissions are increased/decreased above these targets. 
    var whereScale = (netCO2 - simulation.lowNetCO2) / (simulation.highNetCO2 - simulation.lowNetCO2)
    //Calculate the impacts here, then assign them to the wedges, because a lot depend on each other.
    var AtmosphereCO2 = 280 + ((netCO2) / 17.3); //https://www.skepticalscience.com/print.php?r=45
    var TemperatureChange = 3 * Math.log2(AtmosphereCO2 / 280);
    //translates the CO2 to a pH value
    // TODO: Move these magic numbers into simData!
    var OceanPH = -0.3864 * Math.log(AtmosphereCO2) + 10.357;
    //Scales the constant between the scenarios in the model (NOAA SLR 2012)
    //All these constants are for keeping track of the Sea Level Calculation: E(t) = 0.0017t + bt^2 , where b is scaled between highConst and lowConst, depending on whereScale. This calculation also depends on both time and emissions. t is the time since 1992.

    var graphYear = simData.timeScales[carbonGraph.timeScale].xmax,
        highConst = 1.56e-4,
        lowConst = 2.71e-5
    var seaLevelConst = lowConst + whereScale * (highConst - lowConst),
        SeaLevelChange = 0.0017 * (graphYear - 1993) + seaLevelConst * Math.pow(graphYear - 1993, 2);


    var thisAngle = 0,
        eachAngle = Math.PI * 2 / impacts.length;

    impacts.forEach(function (index) {
        var thisImpact = index,
            thisImpactType = index.type;

        if (thisImpactType == "CO2Concentration") {
            index.value = AtmosphereCO2
        }

        if (thisImpactType == "temperature") {
            thisImpact.value = TemperatureChange;
        }

        if (thisImpactType == "seaLevel") {
            thisImpact.value = SeaLevelChange;
        }

        if (thisImpactType == "oceanPH") {
            thisImpact.value = OceanPH;
        }

        if (thisImpactType == "arcticIce") {
            thisImpact.value = 50;
        };

        //sets the proper radius for each wedge
        // var outerRad = thisImpact.value * ((10) / (thisImpact.extreme - thisImpact.reasonable)) + (35 - (10 * thisImpact.extreme / (thisImpact.extreme - thisImpact.reasonable)));
        var outerRad = impactDisplay.calcRadius(thisImpact);

        //updates the path for each wedge:
        var arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(outerRad);
        var arcPath = arcGenerator({
            startAngle: thisAngle,
            endAngle: thisAngle + eachAngle
        });
        //assigns the path for each wedge
        thisImpact.path = arcPath;

        //For the present Values for each Wedge
        // var presentOuterRad = thisImpact.present * ((10) / (thisImpact.extreme - thisImpact.reasonable)) + (35 - (10 * thisImpact.extreme / (thisImpact.extreme - thisImpact.reasonable)));
        var presentOuterRad = impactDisplay.calcRadius(thisImpact, thisImpact.present);
        //updates the path for each wedge:
        var presentArcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(presentOuterRad);
        var presentArcPath = presentArcGenerator({
            startAngle: thisAngle,
            endAngle: thisAngle + eachAngle
        });
        //assigns the path for each wedge
        thisImpact.presentPath = presentArcPath;

        //Set the "radius" of the graph to be the biggest radius of the wedges, if there is one.
        // if (outerRad > impactDisplay.biggestRad) {
        //     impactDisplay.biggestRad = outerRad;
        // };
        //update the angle
        thisAngle = thisAngle + eachAngle;
    }) //impacts.foreach
} //impactDisplay.updateImpacts



//To update the impactDisplay
impactDisplay.update = function () {

    impactDisplay.updateImpacts();


    // var viewBoxWidth = (2 * impactDisplay.biggestRad),
    //     viewBoxMin = 50 - impactDisplay.biggestRad,
    //     viewBox = viewBoxMin + " " + viewBoxMin + " " + +viewBoxWidth + " " + viewBoxWidth;
    // d3.select("#impactSpace")
    //     .attr("viewBox", viewBox);

    var impacts = simData.impacts;
    impacts.forEach(function (index) {

        var thisImpact = index;

        //Calculate the rounded value to display:

        // var roundedValue = Math.round(thisImpact.value * 100) / 100;
        // var roundedValue = thisImpact.value.toFixed(thisImpact.decimal);
        var roundedValue = thisImpact.value;
        if (thisImpact.roundToNearest) {
            // WARNING: Assumes roundToNearest < 1 !
            roundedValue = Math.round(roundedValue / thisImpact.roundToNearest) * thisImpact.roundToNearest;
        }
        roundedValue = roundedValue.toFixed(thisImpact.decimal);

        //Actually update the paths for each wedge:
        var thisWedge = d3.select("#" + thisImpact.type + "Impact");
        thisWedge.on("mouseover", function () {
            d3.select(this).raise()
                .attr("stroke", d3.select(this).style("fill"));
            var textScale = impactDisplay.biggestRad / 50,
                textSize = 5 * textScale,
                textX = 50 - 25 * textScale,
                textY1 = 50 + 40 * textScale,
                textY2 = 50 + 45 * textScale;
            // d3.select("#impactNameText")
            //     .text(thisImpact.name + ":")
            //     .attr("font-size", textSize)
            //     .attr("x", textX)
            //     .attr("y", textY1);
            // 
            // d3.select("#impactText")
            //     .text(roundedValue + " " + thisImpact.units)
            //     .attr("font-size", textSize)
            //     .attr("x", textX)
            //     .attr("y", textY2);
            impactDisplay.impactText.html(thisImpact.name + ':<br>' +
                roundedValue + ' ' + thisImpact.units);
            impactDisplay.impactText.addClass('shown');
        })
            //Update the path:
            .attr("d", thisImpact.path);

        //Add Text to indicate the impacts are Changing:
        d3.select("#" + thisImpact.type + "impactUpdateText1")
            .text(thisImpact.shortName + ':')
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .transition()
            .delay(200)
            // .duration(1500)
            .duration(3000)
            .attr("opacity", 0);
        d3.select("#" + thisImpact.type + "impactUpdateText2")
            // .text(thisImpact.units)
            .text(roundedValue + " " + thisImpact.units)
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .transition()
            .delay(200)
            // .duration(1500)
            .duration(3000)
            .attr("opacity", 0);

    } //impacts.forEach
    )
} //impactDisplay.update


////////////////////////////////////////////////////////////
// Display a region whose area illustrates the area required for some setting.

/*

    WORK IN PROGRESS.  Currently (18 July 2019), this will correctly select the
    appropriate "nation" and update the land area notification drawer.
    Listeners have not been implemented.
    
    The idea is that you call update and pass in the name of the slider's
    variable.  If there's a land area function associated with that variable, it
    will select and display the appropriate land.  If not, it will clear the
    display.
    
    Idea: When a slider with a land area is changed, show a small tab with a tiny version of the land area map.  The tab should disappear after a couple of seconds.  Click the tab or click the "land" button on the slider to pull down the full-size land area display.  (Still have to add the "land" button to the sliders, too...)
 */

var landAreaDisplay = {};
landAreaDisplay.panel = $('#landAreaNotice');
landAreaDisplay.container = $('#landAreaMessage');
landAreaDisplay.messageBox = $('#landAreaMessageBox');
landAreaDisplay.assumptionsButton = $('<button><span class="show-for-sr">Show Land Area assumptions</span><svg class="svgIcon svgIcon-inline" role="img"><use href="img/fontawesome/fontawesome-free-5.9.0-web-solid-sprite_q.svg#question-circle"></use></svg></button>')
    .attr('id', 'landAreaAssumptionsButton')
    .addClass('assumptionsButton-icon')
    .appendTo(landAreaDisplay.panel)
    .on("click", function (event) {
        event.stopPropagation();
        pageCollection.showAssumptions("landAreaAssumptions");
    });
landAreaDisplay.imgList = {};
landAreaDisplay.init = function () {
    // Add img tags for each area diagram now, so the browser will preload them
    // before they're needed.  Using plain JavaScript in the loop since it's
    // much faster than jQuery, and jQuery wouldn't add much here.
    var fragment = document.createDocumentFragment();
    $.each(simData.nationArray, function (i, nation) {
        nation.id = nation.name.replace(/ /g, '_');
        var img = document.createElement('img');
        img.src = 'img/' + nation.image;
        img.id = nation.id;
        img.classList.add('landAreaImg', 'hidden');
        img.alt = '';
        landAreaDisplay.imgList[nation.id] = img;
        fragment.appendChild(img);
    });
    landAreaDisplay.container.append($(fragment)); // Should trigger loading here.

    landAreaDisplay.messageBox = $('<div></div>')
        .attr('id', 'landAreaMessageBox')
        .addClass('landAreaMessageBox')
        .appendTo(landAreaDisplay.container);
}

// Reveal/hide the display (without updating).
landAreaDisplay.show = function () {
    landAreaDisplay.panel.removeClass('closed');
}
landAreaDisplay.hide = function () {
    landAreaDisplay.panel.addClass('closed');
}
landAreaDisplay.toggle = function () {
    landAreaDisplay.panel.toggleClass('closed');
}
landAreaDisplay.hideAll = function () {
    landAreaDisplay.hide();
    landAreaDisplay.hideButton();
}

landAreaDisplay.showButton = function () {
    //Show land area display button
    var landAreaButton = document.getElementById('landAreaButton');
    landAreaButton.style.left = '0';
    landAreaButton.style.top = '0';

    // //Hide after 5 seconds
    // this.timeoutID = window.setTimeout(function() {
    //     landAreaDisplay.hideButton();
    // }, 10000);
}

landAreaDisplay.hideButton = function () {
    //Hide land area display button
    var landAreaButton = document.getElementById('landAreaButton');
    landAreaButton.style.top = '-100px';
    landAreaButton.style.left = '0';
}

landAreaDisplay.panel.on('click', landAreaDisplay.hide);

$('#landAreaButton').on('click', landAreaDisplay.toggle);

landAreaDisplay.clear = function () {
    $('.landAreaImg:not(.hidden)').addClass('hidden');
    landAreaDisplay.messageBox.html('');
    landAreaDisplay.hideAll();
}

landAreaDisplay.findLand = function (area) {
    // find returns the first array element that matches, so it's important that
    // the array is sorted by area.

    var land = simData.nationArray.find(function (e) {
        return e.size <= area;
    });
    return land;
}

landAreaDisplay.currentLand = null;

// Functions for various land-area calculations.  The calculations are different
// for different groups.
landAreaDisplay.landAreaFunctions = {

    energyPercentLandArea: function (varName) {
        var theVar = simData.variables[varName]; // for convenience.
        var varLabel = varName.replace('Percent', '');
        var pct = theVar.value;
        // var conv = simulation.constant(theVar.landAreaConstantName);
        var conv;
        if (theVar.landAreaConstantName) {
            conv = simulation.constant(theVar.landAreaConstantName);
        } else {
            conv = simulation.constant(varName.replace('Percent', 'Area'));
        }

        landAreaDisplay.currentLand = {};

        landAreaDisplay.currentLand.area = simulation.value('powerPerCapita') * pct * conv;

        landAreaDisplay.currentLand.nation = landAreaDisplay.findLand(landAreaDisplay.currentLand.area);

        if (landAreaDisplay.currentLand.nation) {
            landAreaDisplay.currentLand.text = 'This amount of ' + varLabel +
                ' energy corresponds to an area about the size of ' + landAreaDisplay.currentLand.nation.name + '.';

            landAreaDisplay.showButton();
            return landAreaDisplay.currentLand;
        }

        return null;
    },
    biofuelPercentLandArea: function (varName) {

        var theVar = simData.variables[varName]; // for convenience.
        var sim = simulation;
        var varLabel = varName.replace('Percent', '');

        // varLabel = varLabel.replace('Vehicle', '');
        var pct = theVar.value;
        var conv = simulation.constant(varLabel + 'Area');
        // var numVehicles = (simulation.value('vehicleOwnership') / 100) * ((simulation.value('population')) * 1e9);
        var distTravelled = sim.value("vehicleDistanceTravelled") * sim.value("population") / sim.value("vehicleOccupancy")
        landAreaDisplay.currentLand = {};

        landAreaDisplay.currentLand.area = (pct / 100) * distTravelled * (simulation.value('gasVehicleFuelEfficiency') / 100) * simulation.constant('biofuelRating') * (1 / conv);

        landAreaDisplay.currentLand.nation = landAreaDisplay.findLand(landAreaDisplay.currentLand.area);

        if (landAreaDisplay.currentLand.nation) {
            landAreaDisplay.currentLand.text = 'This amount of ' + varLabel.replace('Vehicle', '') +
                ' energy corresponds to an area about the size of ' + landAreaDisplay.currentLand.nation.name + '.';

            landAreaDisplay.showButton();

            return landAreaDisplay.currentLand;
        }

        return null;
    },
    forestationLandArea: function (varName) {
        var theVar = simData.variables[varName]; // for convenience.
        var varLabel = '';
        if (varName == 'reforestationRate') { varLabel = 'reforestation'; }
        else if (varName == 'forestProtection') { varLabel = 'forest protection'; }
        // var varLabel = varName.replace('Rate', '');
        var pct = theVar.value;

        landAreaDisplay.currentLand = {};

        landAreaDisplay.currentLand.area = pct * 1000;

        landAreaDisplay.currentLand.nation = landAreaDisplay.findLand(landAreaDisplay.currentLand.area);

        if (landAreaDisplay.currentLand.nation) {
            landAreaDisplay.currentLand.text = 'This amount of ' + varLabel + ' corresponds to an area about the size of ' + landAreaDisplay.currentLand.nation.name + '.';

            landAreaDisplay.showButton();

            return landAreaDisplay.currentLand;
        }

        return null;
    },
    conservationTillageLandArea: function (varName) {
        var theVar = simData.variables[varName]; // for convenience.
        var pct = theVar.value;

        landAreaDisplay.currentLand = {};

        landAreaDisplay.currentLand.area = pct * 1e6;

        landAreaDisplay.currentLand.nation = landAreaDisplay.findLand(landAreaDisplay.currentLand.area);

        if (landAreaDisplay.currentLand.nation) {
            landAreaDisplay.currentLand.text = 'This amount of conservation tillage corresponds to an area about the size of ' + landAreaDisplay.currentLand.nation.name + '.';

            landAreaDisplay.showButton();

            return landAreaDisplay.currentLand;
        }

        return null;
    },

};

landAreaDisplay.calcLandArea = function (varName) {
    var fcn = simData.variables[varName].landAreaFunctionName;
    if (fcn) {
        return landAreaDisplay.landAreaFunctions[fcn](varName);
    } else {
        // Specified variable does not have land area associated with it, so 
        // clear the display and close the drawer.
        landAreaDisplay.currentLand = null;
    }
}



// Select and display the area that best matches the given variable's value. If
// the given variable doesn't have associated land area, close the "drawer".
// Otherwise does not affect the "drawer" state, i.e. doesn't un-hide the
// notification panel.
landAreaDisplay.update = function (varName) {
    if (simData.variables[varName].landAreaFunctionName) {
        landAreaDisplay.calcLandArea(varName);

        if (landAreaDisplay.currentLand.nation) {
            $('.landAreaImg:not(.hidden)').addClass('hidden');
            $('#' + landAreaDisplay.currentLand.nation.id).removeClass('hidden');
            landAreaDisplay.messageBox.html(landAreaDisplay.currentLand.text);
        } else {
            landAreaDisplay.clear();
        }
    } else {
        landAreaDisplay.hideAll();
    }

}

////////////////////////////////////////////////////////////
// Display for percentages of a whole.  Construct a display once, then add a
// copy to each page where you want to display it.  The update function will 
// update all copies.  Assumes all displays are the same size!

// Note that this structure is less useful in the single-page-categories
// version, since there will (probably) only be one copy of a percentDisplay in
// the applet.  But it works and it's not worth streamlining.

// TODO: Possibly make the bargraph stick to the top of the container on scroll?  
// (Foundation's "Sticky" system can take care of this for us.)  Might work better on Mobile.

// IDEA: When a slider is dragged, briefly highlight the corresponding bargraph box?

var percentDisplays = {};
percentDisplays.displayList = {};
percentDisplays.buildPercentDisplay = function (displayName, title, varList, addShowButton) {

    // We'll return this in the end.
    var percentDisplay = {};

    percentDisplay.name = displayName;
    percentDisplay.title = title;
    percentDisplay.segmentClass = displayName + 'Segment';

    percentDisplay.varList = varList.slice(); // separate copy of the array

    // Store the variable entries.
    percentDisplay.data = [];
    $.each(varList, function (i, varName) {

        percentDisplay.data.push({ key: varName, entry: simData.variables[varName] });

        // cum is the cumulative sum of the _previous_ segments, i.e. the starting
        // point for the current segment.
        if (i == 0) {
            percentDisplay.data[i].cum = 0;
        } else {
            percentDisplay.data[i].cum = percentDisplay.data[i - 1].cum + percentDisplay.data[i - 1].entry.value;
        }
        percentDisplay.data[i].shortName = varName.replace('Percent', '');

    });

    percentDisplay.copyList = [];

    percentDisplay.addCopy = function (id, containerId) {

        var newDisplay = {};

        newDisplay.id = id;
        newDisplay.containerId = containerId;

        newDisplay.container = $('#' + newDisplay.containerId);
        newDisplay.title = $('<h3></h3>')
            .addClass('percentDisplayTitle')
            .html('<span class="percentDisplayTitleText">' + percentDisplay.title + '</span>')
            .appendTo(newDisplay.container);
        newDisplay.graph = $('<button></button>', {
            'class': 'percentDisplay',
            'id': newDisplay.id,
            // 'onclick': "togglePercentSliders()",
        }).appendTo(newDisplay.container);

        if (addShowButton) {
            newDisplay.showButton = $('<button></button>')
                .attr('id', '' + newDisplay.id)
                .addClass('assumptionsButton percentButton ' + newDisplay.id + 'Button')
                .html('Show controls')
                .appendTo(newDisplay.title);
        }

        // Set the background to the colour of the last segment, to cover rounding errors.
        newDisplay.graph.addClass('color-' + percentDisplay.data[percentDisplay.data.length - 1].shortName);
        newDisplay.graph.addClass('' + newDisplay.id + 'Display');

        newDisplay.segments = d3.select(newDisplay.graph.get(0)).selectAll('div.' + percentDisplay.segmentClass)
            .data(percentDisplay.data, function (d) { return d.key; })
            .enter().append('div')
            .style('left', function (d) { return d.cum + '%'; })
            .style('width', function (d) { return d.entry.value + '%'; })
            .attr('class', function (d) { return 'color-' + d.shortName; })
            .attr('title', function (d) { return Math.round(d.entry.value) + '% ' + d.shortName; })
            .classed('percentDisplaySegment', true)
            .classed(percentDisplay.segmentClass, true)
            .html(function (d) {
                return svgIcon(d.entry.icon);
            });


        percentDisplay.copyList.push(newDisplay);

        return newDisplay;
    };

    // Update all copies of this display.
    percentDisplay.updateAll = function () {
        // Recalculate starting points for each segment.
        for (i = 0; i < percentDisplay.data.length; i++) {
            if (i == 0) {
                percentDisplay.data[i].cum = 0;
            } else {
                percentDisplay.data[i].cum = percentDisplay.data[i - 1].cum + percentDisplay.data[i - 1].entry.value;
            }
        }

        d3.selectAll('div.' + percentDisplay.segmentClass)
            .style('left', function (d) { return d.cum + '%'; })
            .style('width', function (d) { return d.entry.value + '%'; })
            .attr('title', function (d) { return Math.round(d.entry.value) + '% ' + d.shortName; });
    } // percentDisplay.updateAll function

    percentDisplays.displayList[displayName] = percentDisplay;

    return percentDisplay;
}; // percentDisplays.buildPercentDisplay function


percentDisplays.addDisplayCopy = function (displayName, copyId, containerId) {
    return this.displayList[displayName].addCopy(copyId, containerId);
}

// Initialize percent displays.  Do this before adding copies to each page.
percentDisplays.init = function () {
    var varlist;

    varlist = simData.variables.coalPercent.dependsOn.slice();
    varlist.push('coalPercent');
    // this.buildPercentDisplay('electricity', 'Sources of Electricity: <button id="electricityPercents" class="electricityPercentsButton assumptionsButton percentButton">Show controls</button>', varlist);
    this.buildPercentDisplay('electricity', 'Sources of Electricity:', varlist, true);

    varlist = simData.variables.gasolineVehiclePercent.dependsOn.slice();
    varlist.push('gasolineVehiclePercent');
    // this.buildPercentDisplay('vehicleFuel', 'Sources of Vehicle Fuel: <button id="vehicleUsePercents" class="vehicleUsePercentsButton assumptionsButton percentButton">Show controls</button>', varlist);
    this.buildPercentDisplay('vehicleFuel', 'Sources of Vehicle Fuel:', varlist, true);

    varlist = simData.variables.coalHeatingPercent.dependsOn.slice();
    varlist.push('coalHeatingPercent');
    // this.buildPercentDisplay('heating', 'Sources of Heating Energy: <button id="heatingPercents" class="heatingPercentsButton assumptionsButton percentButton">Show controls</button>', varlist);
    this.buildPercentDisplay('heating', 'Sources of Heating Energy:', varlist, true);
}

percentDisplays.updateAll = function () {
    $.each(percentDisplays.displayList, function (name, display) {
        display.updateAll();
    });
}


////////////////////////////////////////////////////////////
// Collection of all control-panel "pages".
var pageCollection = {
    // Existing element that the pages will go inside of.
    controlsContainer: $('#controlsContainer'),

    // List of pages.
    pageList: {},

    // Page currently being displayed.
    currentPage: null,

    // Carbon category of current page.  Should match a color-* class.
    category: "noCat"

};


/////////////////////////////////////////////
// Functions for handling pages.

pageCollection.animTime = 1000; // milliseconds

pageCollection.setPage = function (pageName) {
    var page = pageCollection.pageList[pageName];
    var pageJQ = $('#' + pageName);

    // Don't do anything if this is the current page.
    if (pageJQ.hasClass('controlPage-current')) return;

    // Displays the selected page.  Does not change the category shown.
    // $('.controlPage-current').removeClass('controlPage-current')
    //     .one('transitionend', function (event) {
    //         event.target.classList.add('hidden');
    //         console.log(event.target);
    //     });
    $('.controlPage-current').addClass('hidden');
    $('.controlPage-current').removeClass('controlPage-current');
    pageJQ.removeClass('hidden');
    window.setTimeout(function () { pageJQ.addClass('controlPage-current'); }, 0);
    // page.updateSliders();

    // Move the focus onto the top of the new page.
    page.titleContainer[0].focus();

    // Close the Land Area display and "globe" button (if they're open).
    landAreaDisplay.hideAll();
}

pageCollection.setCategory = function (cat) {
    // Store the category and update the display.
    var oldCat = this.category;
    this.category = cat;

    // Highlight the new category's icon.
    $('.carbonCategory-current').removeClass('carbonCategory-current');
    $('#' + cat + 'Menu').addClass('carbonCategory-current');
    $('#' + cat + 'Button').addClass('carbonCategory-current');

    // Update the display colours.
    $('.categoryColor').removeClass('color-' + oldCat).addClass('color-' + cat)
        .find('.categoryColorFill').each(function (index, element) {
            $(this).css('fill', $(this).css('background-color'));
        });
}

// Set both at once; a more convenient form especially useful in the menu system.
pageCollection.setCategoryAndPage = function (cat, pageName) {
    this.setCategory(cat);
    this.setPage(pageName);
}

pageCollection.enableAllCategories = function () {
    // Enable all category buttons.  (Setting to empty string removes the
    // attribute entirely.)
    $('.carbonCategoryButton').prop('disabled', '');
}

pageCollection.singleCategory = function (cat) {
    // Disable all but one of the category buttons.
    $('.carbonCategoryButton:not(#' + cat + 'Button)').prop('disabled', true);
}

pageCollection.showAssumptions = function (assumptionsId) {
    var assumptions = $('#' + assumptionsId).html();
    if (!assumptions) assumptions = 'This page makes no assumptions!  <br>(ahem.)';
    createWindowHTML(assumptions, 'big');
    $('.reference').on('click', function (event) {
        createReference(event.target);
    });
}


// TODO: Maybe make this into a more generic function and move it into kcvsTheme?
pageCollection.showHelp = function () {
    createWindowHTML($('#helpPageContent').html(), 'big');
}

/////////////////////////////////////////////
// For building a page with common features.  Options go in the config object.
pageCollection.buildPage = function (config) {
    var newPage = {};

    // Store the config object in case it's useful for specific pages.
    newPage.config = config;

    newPage.name = config.name;
    newPage.title = config.title;

    if (config.category) newPage.category = config.category;

    if (config.titleLevel) {
        newPage.titleLevel = config.titleLevel;
    } else {
        newPage.titleLevel = 'h2';
    }

    if (config.addAssumptionsButton === undefined) config.addAssumptionsButton = true;

    if (config.assumptionsId === undefined) config.assumptionsId = newPage.name + "Assumptions";

    //////////////////////////////
    // Construct the page.

    newPage.container = $('<section></section>', {
        'class': 'controlPage',
        'id': newPage.name
    }).appendTo(pageCollection.controlsContainer);

    newPage.titleContainer = $('<div></div>', {
        'class': 'pageTitle clearfix',
        'id': newPage.name + 'Title',
    }).appendTo(newPage.container);

    if (config.addAssumptionsButton) {
        newPage.assumptionsButton = $('<button></button>')
            // .html('Show<br>Assumptions')
            .attr('data-assumptionsId', config.assumptionsId)
            .addClass('assumptionsButton assumptionsButton-icon overviewAssumptions')
            .html(svgIcon('question-circle'))
            .appendTo(newPage.titleContainer);
        newPage.assumptionsButton.on('click', null, config.assumptionsId, function (event) {
            pageCollection.showAssumptions(config.assumptionsId);
        });
    }
    // We'll move the focus to the title div when the page appears.
    newPage.titleContainer.attr('tabindex', -1);


    if (newPage.title) {
        newPage.pageTitle = $('<' + newPage.titleLevel + '></' + newPage.titleLevel + '>').html(newPage.title)
            .addClass('controlPageTitle')
            .appendTo(newPage.titleContainer);
    }

    newPage.controlsContainer = $('<div></div>')
        // .addClass('row')
        .attr('id', newPage.name + "ControlsContainer")
        .appendTo(newPage.container);

    // Array of sliders on this page.
    newPage.sliderList = [];

    //////////////////////////////
    // Functions for building pages.

    // Add a slider to control a sim variable.
    // varName is the name of the sim variable, and is optional;
    // if varName is not given it assumes it's the same as sliderName.
    // You can put additional slider config options into the variable entry in 
    // simData.
    newPage.addSlider = function (sliderName, varName, options) {
        if (!varName) varName = sliderName;

        var sliderConfig = simData.variables[varName];
        if (!sliderConfig) {
            console.error('Bork!  No slider parameters found for ' + varName);
        }

        sliderConfig.containerID = this.controlsContainer.attr('id');
        sliderConfig.inputID = sliderName + "Slider";
        sliderConfig.title = sliderConfig.description + " (" + sliderConfig.units + ")";
        sliderConfig.inputSize = 10;
        sliderConfig.showScale = true;
        sliderConfig.fillFromDefault = true;
        sliderConfig.showModified = true;

        // Add or override config options.
        if (options) {
            $.each(options, function (key, value) {
                sliderConfig[key] = value;
            });
        }

        var newSlider = new KCVSSlider(sliderConfig);
        newSlider.panel.addClass('categoryColor')

        newSlider.varName = varName;

        if (sliderConfig.assumptionsId) {
            newSlider.assumptionsButton = newSlider.labelRow.append(
                $('<button></button>')
                    .addClass('assumptionsButton assumptionsButton-icon')
                    .attr('title', 'Show Assumptions')
                    .html(svgIcon('question-circle'))
            );
            newSlider.assumptionsButton.on('click', null, sliderConfig.assumptionsId, function (event) {
                pageCollection.showAssumptions(sliderConfig.assumptionsId);
            });
        }


        newSlider.realityCheck = $('<div></div>')
            .addClass('sliderRealityCheck')
            .text('not realistic')
            .insertBefore(newSlider.handle);



        //Check if this slider is CCS Capturable:
        if (simData.variables[varName].capturable) {


            newSlider.CCSIcon = newSlider.labelRow.append(
                $('<svg><use href= "img/fontawesome/fontawesome-free-5.9.0-web-solid-sprite_a.svg#archive"></svg>')
                    .addClass('CCSIcon')
                    .attr('width', 20)
                    .attr('height', 20)
                    .insertBefore(newSlider.assumptionsButton));

        };

        $(".CCSIcon").on('mouseenter focus', function () {
            var pos = $(this).offset();
            pos.top = pos.top + $(this).height() + 5;
            var text = "Some of these emissions<br> can be captured and stored";
            var tooltip = $('.tooltipwindow');
            tooltip.offset({ left: pos.left, top: pos.top });
            tooltip.html(text);
            tooltip.show();
        });

        $(".CCSIcon").on('mouseleave blur', function () {
            $('.tooltipwindow').hide();
        });


        newSlider.updateRealityCheck = function () {
            var theVar = simData.variables[this.varName];
            if (theVar.hasOwnProperty('feasibility')) {
                if (theVar.feasibility <= 0.99) {
                    this.realityCheck.addClass('unrealistic');
                } else {
                    this.realityCheck.removeClass('unrealistic');
                }
            }
        }



        // Note: We're using a single global listener for all sliders, rather than
        // attaching separate listeners to each one.

        this.sliderList.push(newSlider);
        simulation.addSlider(newSlider);

        return newSlider;
    }; // newPage.addSlider

    // Add a "percentage" slider, which gets some additional formatting.
    newPage.addPercentSlider = function (sliderName, varName, options) {
        if (!varName) varName = sliderName;
        var entry = simData.variables[varName];
        var shortName = varName.replace('Percent', '');
        entry.showScale = false;

        var s = newPage.addSlider(sliderName, varName, options);
        s.setTitle(svgIcon(entry.icon) + ' ' + s.title);
        s.panel.addClass('color-' + shortName);

        //add grouping class
        var group = simData.variables[varName].percentGroup;
        if (group == 'electricityPercents') {
            s.panel.addClass('' + group);
        } else if (group == 'vehicleUsePercents') {
            s.panel.addClass('' + group);
        } else if (group == 'heatingPercents') {
            s.panel.addClass('' + group);
        }

        return s;
    }





    //Add the "Carbon Intensity Scale" for sets of sliders
    var addCIScale = function (depVarName) {
        var depVar = simData.variables[depVarName];
        var varList = depVar.dependsOn.slice();
        var CIScale = depVar.carbonIntensityScale;
        var thisVariable;

        for (var i = 0; i <= varList.length; i++) {

            //Add indicators for all sliders, including the dependent Variable
            var thisVariable;
            if (i < varList.length) {
                thisVariable = varList[i];
            };
            if (i == varList.length) {
                thisVariable = depVarName;
            };
            var thisVarData = simData.variables[thisVariable];
            if (thisVarData.capturable) {
                addIcons(thisVariable, true)
            }

            addIcons(thisVariable, false)


        };


        function addIcons(variable, captured) {

            //Get rid of the "percent" in the variable name -  to select the right slider
            var thisVariableName = variable.replace('Percent', '');
            if (captured) {
                thisVariableName = thisVariableName + "Capturable";
            };

            //Calculate the relative Carbon Intensity of the slider. (this is a scale of 1-10 with 10 being the highest)
            var CIconst = simData.physicalConstants[thisVariableName + "CarbonIntensity"];


            var CIofThisSlider = CIconst.value;
            var relCI = simulation.maxCIIcons * CIofThisSlider / (CIScale[1] - CIScale[0]);


            //qk:


            var numberOfIcons = Math.ceil(relCI);

            //Remaining fraction - scales the width of the last icon
            var remainingFraction = relCI - numberOfIcons + 1;

            var eachIconWidth = simulation.eachCIIconWidth;

            //Add the Icons:
            //A class for the icons: 
            var iconClass = thisVariableName + "Icon" + " CIIcon";
            var iconsToAdd = '';
            for (var a = 1; a <= simulation.maxCIIcons; a++) {
                var addSvg = svgIcon('copyright', iconClass);
                var thisIconID = thisVariableName + "Icon" + a;
                var addIDSvg = addSvg.replace("<svg", "<svg id ='" + thisIconID + "' viewBox = '0 0 20 20' preserveAspectRatio='xMinYMid slice' width = '" +
                    eachIconWidth + "' height = '" + eachIconWidth + "'");
                iconsToAdd = iconsToAdd.concat(addIDSvg);
            }
            var thisCIScaleID = thisVariableName + 'CIScale';

            //Add a div to the sliders:
            var sliderID = thisVariable + "SliderLabelRow";
            var totalWidth = simulation.maxCIIcons * eachIconWidth;
            // var CIdiv = d3.select("#" + sliderID)

            d3.select("#" + sliderID)
                .append("div")
                .attr('id', thisCIScaleID)
                .attr('class', 'CIScale')
                .style("width", totalWidth + "px");

            var CIdiv = $('#' + thisVariableName + 'CIScale');

            if (captured) {
                CIdiv.addClass('capturable');
            };

            // Add the icons to the div.
            CIdiv.html(iconsToAdd);

            if (!captured) {
                // Explain the CI scale on hover.
                var thisVarData = simData.variables[thisVariable];
                CIdiv.on('mouseenter focus', function () {
                    var theDiv = $(this);
                    var CIname = theDiv.attr('id').replace('CIScale', 'CarbonIntensity');
                    var CIconst = simData.physicalConstants[CIname];
                    var value = CIconst.value;
                    if (CIconst.displayMultiplier != undefined) {
                        value *= CIconst.displayMultiplier
                    };
                    if (CIconst.displayDecimal != undefined) {
                        value = value.toFixed(CIconst.displayDecimal);
                    }
                    var units = "";
                    if (CIconst.displayUnits != undefined) {
                        units = CIconst.displayUnits;
                    } else if (CIconst.units) {
                        units = CIconst.units;
                    }
                    // var msg = 'Carbon intensity:<br>' + CIconst.value + ' ' + CIconst.units;
                    var msg = 'Carbon intensity:<br>' + value + ' ' + units;
                    if (thisVarData.capturable) {
                        var captCIConst = simData.physicalConstants[thisVariableName + "CapturableCarbonIntensity"];
                        var captValue = captCIConst.value;

                        if (captCIConst.displayMultiplier != undefined) {
                            captValue *= captCIConst.displayMultiplier
                        };
                        if (captCIConst.displayDecimal != undefined) {
                            captValue = captValue.toFixed(captCIConst.displayDecimal);
                        }
                        msg = msg.concat("<br>Without CCS:<br>" + captValue + " " + units);
                    };
                    var pos = $(this).offset();
                    pos.top = pos.top + $(this).height() + 5;
                    var tooltip = $('.tooltipwindow');
                    tooltip.html(msg);
                    tooltip.show();
                    tooltip.offset({ left: pos.left, top: pos.top });
                });
                CIdiv.on('mouseleave blur', function () {
                    $('.tooltipwindow').hide();
                })
            }//if (captured)

            var lastIconWidth = eachIconWidth * remainingFraction;
            var lastIconID = thisVariableName + "Icon" + numberOfIcons;
            d3.select("#" + lastIconID).attr("width", lastIconWidth);

            //Hide all the other Icons:
            for (var j = numberOfIcons + 1; j <= simulation.maxCIIcons; j++) {
                var eachIconID = thisVariableName + "Icon" + j;
                d3.select("#" + eachIconID).style("opacity", 0);
            };

        }//end of addIcons()


    } //Add CI Scale

    // Add a set of "percentage" sliders.
    // depVarName is the name of the variable that's calculated from the rest.
    // (We'll get the full list from that.)
    newPage.addPercentSliderSet = function (depVarName, containerID, setID, percentDisplay) {
        var depVar = simData.variables[depVarName];
        var varList = depVar.dependsOn.slice();

        if (!setID) {
            setID = depVarName + 'SliderSet';
        }

        if (!containerID) {
            containerID = newPage.controlsContainer.attr('id');
        }

        newPage[setID] = $('<div></div>')
            .attr('id', setID)
            .addClass('percentSliderSet')
            .appendTo('#' + containerID);

        var options = {
            containerID: setID // Where to put each percent slider
        };

        // Add the independent sliders.
        for (var i = 0; i < varList.length; i++) {
            newPage.addPercentSlider(varList[i], varList[i], options);
        }


        // Add the dependent slider for display only.
        var s = newPage.addPercentSlider(depVarName, depVarName, options);
        s.disableUI();
        s.setListening(false);
        simulation.addDependentSlider(s);

        //If there's a "Carbon Intensity Scale", add the scale to the sliders:
        if (depVar.carbonIntensityScale) {
            addCIScale(depVarName);
        };

        // Store the size of the "open" drawer (with some extra space to make sure).
        newPage[setID].maxHeightPx = 1.1 * newPage[setID].height();


        // Start with the drawer closed.
        newPage[setID].css('max-height', 0);

        // Listener to toggle the "drawer" containing the slider set.
        newPage[setID].toggle = function () {
            // newPage[setID].slideToggle(pageCollection.animTime);
            if (newPage[setID].height() > 0) {
                newPage[setID].css('max-height', 0);
            } else {
                newPage[setID].css('max-height', newPage[setID].maxHeightPx + 'px');
            }
        }

        // If the percent display (bar graph) is provided, attach the toggle listener.
        if (percentDisplay) {
            percentDisplay.graph.on('click', newPage[setID].toggle);
            if (percentDisplay.showButton) percentDisplay.showButton.on('click', newPage[setID].toggle);
        }

        return newPage[setID];
    } // addPercentSliderSet function

    // Build a table of "percentage" sliders.
    // depVarName is the name of the variable that's calculated from the rest.
    // (We'll get the full list from that.)
    newPage.addPercentSliderTable = function (depVarName) {
        var depVar = simData.variables[depVarName];
        var varList = depVar.dependsOn.slice();
        varList.push(depVarName);

        // Construct the table.  Start with placeholder cells so we have
        // somewhere to inject the sliders into.
        var table = $('<table></table>')
            .addClass('sliderTable');
        newPage.append(table);
        var entries = [];
        var shortNames = [];
        var rows = [];
        var labels = [];
        var sliderCells = [];
        for (var i = 0; i < varList.length; i++) {
            entries.push(simData.variables[varList[i]]);
            shortNames.push(varList[i].replace('Percent', ''));
            rows.push($('<tr></tr>').appendTo(table));
            labels.push($('<td></td>')
                .attr('id', shortNames[i] + 'LabelCell')
                .addClass('sliderTableLabel kcvsPanel color-' + shortNames[i])
                .appendTo(rows[i]));
            sliderCells.push($('<td></td>')
                .attr('id', shortNames[i] + 'SliderCell')
                .addClass('sliderTableSlider color-' + shortNames[i])
                .appendTo(rows[i]));
            table.append(rows[i]);
        }

        // Insert the sliders, and add their titles to the table.
        var sliders = [];
        for (var i = 0; i < varList.length; i++) {
            var options = {
                containerID: shortNames[i] + 'SliderCell',
                inputSize: 6,
                showTitle: false
            };
            sliders.push(newPage.addPercentSlider(varList[i], varList[i], options));
            labels[i].html(sliders[i].title);
        }

        // Turn off event listeners for the dependent variable (last slider in
        // the list).
        var s = sliders[sliders.length - 1];
        s.disableUI();
        s.setListening(false);
        simulation.addDependentSlider(s);

    } // newPage.addPercentSliderTable function

    // Append content to the bottom of the page.
    // content can be an HTML string or a jQuery selector.
    newPage.append = function (content) {
        this.controlsContainer.append(content);
    }


    // Redraw all sliders on this page.  (Needed if the page was hidden the last
    // time the values were set!)
    // TODO: Add a "redraw" method to kcvs-slider!
    newPage.updateSliders = function () {
        for (var i = 0; i < newPage.sliderList.length; i++) {
            var sl = newPage.sliderList[i];
            sl.setValueSilently(simulation.value(sl.varName));
        }
    }

    return newPage;

}; // pageCollection.buildPage

pageCollection.addPage = function (config) {
    var newPage = this.buildPage(config)
    this.pageList[newPage.name] = newPage;
    return this.pageList[newPage.name];
}


/////////////////////////////////////////////
// Build each page!

// TODO: Each page builder function should check the original HTML for an assumptions box.  If found, it should add that to the page (make an addAssumptions page function).

// List of "page builders", one for each page to build. To add another page,
// add a builder function to this list and it will be called automatically by
// buildAllPages.
pageCollection.pageBuilderList = {};

//////////////////////////////
// Builder for help page (which is also the start-up page).

pageCollection.pageBuilderList.buildHelpPage = function () {
    var page = pageCollection.addPage({
        name: "helpPage",
        // title: "Design Our Climate Simulation",
        // titleLevel: 'h1', // Bigger title for the "front" page.
        addAssumptionsButton: false
    });

    // The startup content was written into the HTML file.
    // var helpPageContent = page.append($('#helpPageContent'));
} // buildHelpPage


//////////////////////////////
// Builders for all-category pages.

pageCollection.pageBuilderList.buildElectricity = function () {
    var s; // temporary pointer to a new slider

    var page = pageCollection.addPage({
        name: 'electricityPage',
        title: 'Electricity in ' + simData.sliderYear,
        assumptionsId: 'electricityOverviewAssumptions'
    });
    s = page.addSlider('relativePowerPerCapita');
    s.addListener(simulation.powerPerCapitaListener);

    page.append('<div id="electricityPercentsWrapper" class="percentDisplayWrapper"></div>');

    var percentDisplay = percentDisplays.addDisplayCopy('electricity', 'electricityPercents', 'electricityPercentsWrapper');
    var percentSet = page.addPercentSliderSet('coalPercent', 'electricityPercentsWrapper', 'electricityPercentsSet', percentDisplay);
    // percentDisplay.graph.on('click', percentSet.toggle);

    // page.addSlider("coalEfficiency");
    s = page.addSlider("coalEfficiency", "coalEfficiency", { containerID: 'electricityPercentsSet' });
    s.panel.addClass('color-baseCoal');
    percentSet.maxHeightPx += s.panel.height();

    page.append("<hr>");
    // page.append("<h3 class = 'sectionTitle'>Global Sliders</h3>");
    page.append("<h3 class = 'sectionTitle'>Common Sliders</h3>");
    s = page.addSlider("population_Electricity", "population");
    s.panel.removeClass('categoryColor')
    s = page.addSlider("CCS_Electricity", "CCSPercent");
    s.panel.removeClass('categoryColor')
}


pageCollection.pageBuilderList.buildTransportation = function () {
    var page = pageCollection.addPage({
        name: "transportationPage",
        title: "Vehicle Efficiency and Use in " + simData.sliderYear
    });

    // page.append("<hr>");

    page.addSlider("vehicleDistanceTravelled");
    page.addSlider("vehicleOccupancy");
    page.addSlider("gasVehicleFuelEfficiency");
    //page.addSlider("vehicleDistanceDriven");
    // percentDisplays.addDisplayCopy('vehicleFuel', 'vehicleUsePercents', page.name + 'ControlsContainer');
    // page.addPercentSliderSet('gasolineVehiclePercent');
    var percentDisplay = percentDisplays.addDisplayCopy('vehicleFuel', 'vehicleUsePercents', page.name + 'ControlsContainer');
    page.addPercentSliderSet('gasolineVehiclePercent', '', 'gasolineVehiclePercentsSet', percentDisplay);

    //Avaition stuff: this should have its own title

    // page.append("<p class = 'sectionTitle'>Aviation</p>");
    page.append("<h3 class = 'sectionTitle'>Aviation</h3>");
    page.addSlider("kilometersFlown");
    page.addSlider("planeFuelEfficiency")

    page.append("<hr>");
    // page.append("<h3 class = 'sectionTitle'>Global Sliders</h3>");
    page.append("<h3 class = 'sectionTitle'>Common Sliders</h3>");
    var s = page.addSlider("population_Transportation", "population");
    s.panel.removeClass('categoryColor')
    s = page.addSlider("CCS_Transportation", "CCSPercent");
    s.panel.removeClass('categoryColor')
}


pageCollection.pageBuilderList.buildLanduse = function () {
    var page = pageCollection.addPage({
        name: "landusePage",
        title: "Food, Agriculture, and Land Use in " + simData.sliderYear
    });
    page.addSlider("forestProtection");
    page.addSlider("reforestationRate");

    page.addSlider("peatlandProtection");
    page.addSlider("peatlandRestoration");

    // page.append("<p class = 'sectionTitle'>Agriculture</p>");
    page.append("<h3 class = 'sectionTitle'>Food and Agriculture</h3>");
    page.addSlider("conservationTillage");
    page.addSlider("agriculture");

    page.append("<hr>");
    // page.append("<h3 class = 'sectionTitle'>Global Sliders</h3>");
    page.append("<h3 class = 'sectionTitle'>Common Sliders</h3>");
    var s = page.addSlider("population_landUse", "population")
    s.panel.removeClass('categoryColor')
    s = page.addSlider("CCS_landUse", "CCSPercent");
    s.panel.removeClass('categoryColor')
}


pageCollection.pageBuilderList.buildBuildings = function () {
    var page = pageCollection.addPage({
        name: "buildingsPage",
        title: "Buildings in " + simData.sliderYear
    });
    page.addSlider("buildingFloorArea");
    page.addSlider("buildingConstructionCarbon");
    page.addSlider("buildingLifetime");
    page.addSlider("LEDLightPercent");
    // page.addSlider("numberOfLights");


    page.addSlider("lowFlowWaterPercent");
    page.addSlider("cleanCookstoves");

    // page.addSlider("heatingCarbonIntensity");
    // percentDisplays.addDisplayCopy('heating', 'heatingPercents', page.name + 'ControlsContainer');
    var percentDisplay = percentDisplays.addDisplayCopy('heating', 'heatingPercents', page.name + 'ControlsContainer');
    page.addPercentSliderSet('coalHeatingPercent', '', 'coalHeatingPercentsSet', percentDisplay);

    page.append("<hr>");
    // page.append("<h3 class = 'sectionTitle'>Global Sliders</h3>");
    page.append("<h3 class = 'sectionTitle'>Common Sliders</h3>");
    var s = page.addSlider("population_buildings", "population");
    s.panel.removeClass('categoryColor')
    s = page.addSlider("CCS_buildings", "CCSPercent");
    s.panel.removeClass('categoryColor')
}


pageCollection.pageBuilderList.buildMaterials = function () {
    var page = pageCollection.addPage({
        name: "materialsPage",
        title: "Materials in " + simData.sliderYear
    });
    page.addSlider("cementComposition");
    page.addSlider("HFCs");

    // page.append("<p class = 'sectionTitle'>Shipping</p>");
    page.append("<h3 class = 'sectionTitle'>Shipping</h3>");
    page.addSlider("shippingPerCapita");
    page.addSlider("roadShipping");
    page.addSlider("railShipping");
    page.addSlider("seaShipping");
    page.addSlider("skyShipping");

    page.append("<hr>");
    // page.append("<h3 class = 'sectionTitle'>Global Sliders</h3>");
    page.append("<h3 class = 'sectionTitle'>Common Sliders</h3>");
    var s = page.addSlider("population_materials", "population");
    s.panel.removeClass('categoryColor')
    s = page.addSlider("CCS_materials", "CCSPercent");
    s.panel.removeClass('categoryColor')
}


/////////////////////////////////////////////
// Pages for Quest Mode.

pageCollection.pageBuilderList.buildQMIntro = function () {
    var page = pageCollection.addPage({
        name: "qmIntroPage",
        addAssumptionsButton: false
    });

    // The content was written into the HTML file.
    page.append($('#questModeIntroContent'));
}

//////////////////////////////
// Call buildAllPages from inside $( document ).ready, i.e. after all assets are
// loaded and parsed.
pageCollection.buildAllPages = function () {
    $.each(pageCollection.pageBuilderList, function (name, builder) {
        builder();
    });
};


////////////////////////////////////////////////////////////
// The qm (Quest Mode) object drives the tutorial and tracks progress.
var qm = {};

/*

TODO for Quest Mode:
- Remove "Reset" button until end of tutorial.  (Maybe?)
*/


//////////////////////////////
// Copy the current URL parameters into the "start tutorial" menu link.
qm.updateTutorialLink = function () {

    var queryStr = $.param(contentsData.urlParams);
    // Remove the mode if any.
    queryStr = queryStr.replace(/&?mode=\w*/, '');
    // Append the tutorial mode instead.
    if (queryStr.length > 0) queryStr += '&';
    queryStr += 'mode=quest';

    var baseURL = window.location.pathname;

    // Update the menu link.
    $('#tutorialLink').attr('href', baseURL + '?' + queryStr);
};

//////////////////////////////
// Quest Mode internal variables.

// Name of the quest we're currently on.  (Useful for interrupting animations.)
qm.quest = null;

// Number of wedges eliminated since the tutorial began.
qm.wedgesEliminated = 0;

// Most recent wedge line crossed in each direction.
// qm.lastWedgeDown = 0;
// qm.lastWedgeUp = 0;
qm.lastWedge = 0;

// Which wedge divider line represents the current goal.
// (0 is the starting line.)
qm.targetWedgeLine = 1;

// Default animation duration (for notes fading in/out, etc) (ms).
qm.animTime = 400;

// Which element we're listening to for "wedge eliminated" triggers.
qm.wedgeTriggerElement = $('#projectionGraphDisplay');

/////////////////////////////////////////////
// Quest Mode display-manipulation functions.

// Note that most of these functions do nothing if we're not in Quest Mode.

// Convenience functions to animate elements in/out.
// Combination of CSS and jQuery.
// element can be an identifier string or a jQuery object.
qm.slideIn = function (element, time) {
    if (time == undefined) time = qm.animTime;
    $(element).hide().removeClass('qm_hidden').slideDown(time);
}
// TODO: slideOut

// Hide most controls on the screen.  Call this early to hide controls defined
// in the HTML so they don't flash on the screen, then call it again after all
// the pages are built.
qm.hideControls = function () {
    if (qm.questMode) {
        $('#feasibilityIndicator').addClass('qm_hidden');
        $('.percentDisplayWrapper').addClass('qm_hidden');
        $('#landArea').addClass('qm_hidden');
        $('#impactDisplay').addClass('qm_hidden hidden');
        $('.assumptionsButton:not(.percentButton)').addClass('qm_hidden');
        $('.assumptionsButton-icon').addClass('qm_hidden');
        $('.timeScale').addClass('qm_hidden');
        $('.wedgeScore').addClass('qm_hidden');

        qm.hideSlidersByVar('coalEfficiency');
        qm.hideSlidersByVar('population');
        qm.hideSlidersByVar('CCSPercent');

        $('h3.sectionTitle').addClass('qm_hidden');

        // Hide the What's Next button immediately (no transition).
        $('#whatNextButton').hide();
    }
}

// Hide/show all sliders connected to a particular variable.
qm.hideSlidersByVar = function (varName) {
    var sliders = simulation.getSlidersByVar(varName);
    for (var i = 0; i < sliders.length; i++) {
        sliders[i].panel.addClass('qm_hidden');
    }
}
qm.showSlidersByVar = function (varName) {
    var sliders = simulation.getSlidersByVar(varName);
    for (var i = 0; i < sliders.length; i++) {
        sliders[i].panel.hide().removeClass('qm_hidden').slideDown(qm.animTime);
    }
}

// Highlight the divider line we're currently aiming for.
qm.highlightTargetWedge = function () {
    carbonGraph.graph.wedgeLines.classed('qm_targetWedgeLine', function (d) {
        return parseInt(d.key) === qm.targetWedgeLine;
    });
};

qm.setTargetWedge = function (n) {
    qm.targetWedgeLine = n;
    qm.highlightTargetWedge();
}

qm.hideTargetWedge = function () {
    carbonGraph.graph.wedgeLines.classed('qm_targetWedgeLine', false);
}


//////////////////////////////
// Quest Mode status display.

qm.display = {};

qm.display.init = function () {

    // Insert container for displays specific to Quest Mode.
    qm.display.wrapper = $('<div></div>')
        .attr('id', 'questModeDisplayWrapper')
        .attr('class', 'qm_displayWrapper')
        .appendTo('#displaysContainer');

    qm.msgDisplay.removeClass('qm_msgDisplayFlash');
    // qm.msgDisplay.appendTo('#displaysContainer');
    qm.msgDisplay.appendTo(qm.display.wrapper);

}

// Update all parts of the Quest Mode display.  (This will be important when there's more than one part!)
qm.display.update = function () {
    // Currently nothing to update!  This may be used for e.g. number of assumptions left to show, etc.
}

/////////////////////////////////////////////
// Quest Mode annotation handling.
qm.notes = {};

// Create a new annotation with the given content (html), and attach it to the
// specified container.  (If a container exists with this id, the content will
// be replaced.)  Does not reposition the annotation; that should be done
// directly.  New notes are hidden by default, so they can be faded in.
qm.setNote = function (id, html, containerID) {
    if (!qm.notes[id]) {
        qm.notes[id] = $('<div></div>')
            .addClass('qm_note qm_hidden hideOnShrink')
            .attr('id', id);
    }
    qm.notes[id].html(html);
    qm.notes[id].appendTo($('#' + containerID));

    return qm.notes[id]; // for chaining!
} // qm.setNote

qm.hideNote = function (id) {
    qm.notes[id].addClass('qm_hidden');
}

qm.hideAllNotes = function () {
    $.each(qm.notes, function (id, note) {
        qm.hideNote(id);
    });
}

qm.showNote = function (id) {
    // For efficiency, jQuery kills CSS transitions when an element is first created.
    // But that keeps it from fading in.  Adding a timeout (even 0ms) prevents this.
    window.setTimeout(function () { qm.notes[id].removeClass('qm_hidden'); }, 0);
}

qm.showAllNotes = function (id) {
    $.each(qm.notes, function (id, note) {
        qm.showNote(id);
    })
}

qm.deleteNote = function (id) {
    if (qm.notes[id]) qm.notes[id].remove();
}


/////////////////////////////////////////////
// Quest Mode message log window.

// TODO: Shrink the font & padding when the window is narrow (CSS media query).

qm.msgDisplay = $('<div></div>')
    .addClass('qm_msgDisplay')
    .attr('id', 'qm_msgDisplay');

qm.msgDisplay.on('click', function () {
    qm.msgDisplay.toggleClass('qm_msgDisplay-expanded')
        .one('transitionend', function () {
            qm.msgPane.scrollBottom();
        });
});

qm.msgPane = $('<div></div>')
    .addClass('qm_msgPane')
    .attr('id', 'qm_msgPane')
    .attr('role', 'log')
    .attr('aria-live', 'assertive')
    .appendTo(qm.msgDisplay);

qm.msgPane.scrollBottom = function () {
    qm.msgPane.stop().animate({
        scrollTop: qm.msgPane[0].scrollHeight
    }, qm.animTime);
}

qm.addMessage = function (msg, carlIcon) {
    if (!carlIcon) carlIcon = "smile";
    var msgLine = $('<div class="qm_msgWrapper"></div>');

    // Your assistant: Carl the Carbon Dioxide Molecule.  :)
    // (If butchers can have smiling pigs as their mascots, we can have a CO2 molecule. ;)
    // TODO: Create anthropomorphic CO2 molecule.
    var carlBox = $('<div class="qm_carlPane"></div>')
        .html(svgIcon(carlIcon, 'qm_svgIcon qm_carlIcon', true))
        .appendTo(msgLine);

    var msgBox = $('<p class="qm_message"></p>')
        .html(msg)
        .appendTo(msgLine);

    msgLine.appendTo(qm.msgPane);

    qm.msgPane.scrollBottom();

    qm.msgDisplay.removeClass('qm_msgDisplayFlash');
    // See comment about this timeout in qm.showNote...
    window.setTimeout(function () { qm.msgDisplay.addClass('qm_msgDisplayFlash') }, 0);
}

// Preload the initial message, before it's added to the page.  (Reduces layout redraws.)
qm.addMessage('<big>To begin, find the <strong>electricity</strong> button.</big>', 'smile-beam');


/////////////////////////////////////////////
// Function for responding to simulation updates.

// This will be run each time the simulation recalculates the carbon projection.
// (So KEEP IT SIMPLE.)  We'll replace it as the quest continues.  Does nothing
// to start with.
qm.simListener = function () { };

// We can't (easily) update the function the simulation is pointing to, so have
// it point to this wrapper, which will call the real function by name.
qm.simListenerWrapper = function () {
    qm.simListener();
};
simulation.addListener(qm.simListenerWrapper);


/////////////////////////////////////////////
// Initialize quest mode, and apply QM styling where appropriate.

qm.checkQuestMode = function () {
    // Note that if mode is undefined here, the comparison will return false, as
    // desired.
    qm.questMode = (contentsData.urlParams.mode == "quest");
    return qm.questMode;
}

qm.init = function () {

    if (qm.questMode == undefined) qm.checkQuestMode();

    // If we're not in quest mode, there's nothing more to do here.
    if (!qm.questMode) return;

    qm.quest = 'init';

    qm.hideControls();

    // Insert "leave tutorial" icon into the menu bar.  (First we need to remove
    // the quest mode from the Query String, leaving everything else intact.)
    var mode = contentsData.urlParams.mode;
    delete contentsData.urlParams.mode;
    var queryStr = $.param(contentsData.urlParams);
    contentsData.urlParams.mode = mode;
    var baseURL = window.location.pathname;
    if (queryStr.length > 0) {
        baseURL = baseURL + '?' + queryStr;
    }
    qm.endQuestButton = $('<a></a>')
        .attr('href', baseURL)
        .attr('target', '_blank')
        .attr('rel', 'noopener')
        // .attr('title', 'Leave Tutorial')
        // .html(svgIcon('door-open', 'svgIcon-menu'))
        .html('leave<br>tutorial')
        .addClass('assumptionsButton whatNextButton qm_endQuestButton')
        .appendTo('#carbonCategoryMenu');
    qm.endQuestButton.on('mouseenter focus', function () {

        var tooltip = $('.tooltipwindow'); // So we don't have to keep searching.
        tooltip.html('Leave tutorial and<br>design our climate!<br><em>(opens new window)</em>');
        tooltip.show();

        var pos = $(this).offset();
        var fontSize = parseInt($(this).css("font-size").replace('px', ''));
        pos.top = pos.top + (fontSize * 4);
        tooltip.offset(pos); // Set position relative to document.
    });
    qm.endQuestButton.on('mouseleave blur', function () {
        $('.tooltipwindow').hide();
    });


    // Deactivate all but the first category.
    $('.carbonCategoryButton:not(#electricityButton)').prop('disabled', true);

    // TODO: If graph is shrunk (i.e. small screen), show a note: "Click to see projected emissions."
    // (Clear the note once the user clicks the graph.)  Be sure the note is only visible on small screens.

    qm.display.init();

    // Annotate the graph.  Start them hidden, then fade them in one at a time.
    qm.setNote('qm_going', 'where we\'re headed ' + svgIcon('long-arrow-alt-right', 'svgIcon-inline'), 'projectionGraphContainer')
        .css('right', '25%')
        .css('top', '0rem');
    qm.initNoteTimers = [];
    var i = 0;
    $.each(qm.notes, function (id, note) {
        var delay = 2000 + i * 600;
        var timer = window.setTimeout(function () {
            note.removeClass('qm_hidden');
        }, delay);
        qm.initNoteTimers.push(timer);
        i++;
    });
    // Fade in the "our goal" button last.
    var timer = window.setTimeout(function () {
        $('#ourGoalButton').removeClass('initInvisible qm_hidden');
    }, 2000 + i * 600);
    qm.initNoteTimers.push(timer);

    // When the projection crosses a wedge line, fire a custom event.  Quests
    // can use this event to check completion conditions etc.
    qm.simWedgeListener = function () {
        // var nextDown = qm.lastWedgeDown+1;
        // var nextUp = qm.lastWedgeUp-1;
        var nextDown = qm.lastWedge + 1;
        var nextUp = qm.lastWedge - 1;
        while (nextDown < carbonGraph.graph.wedgeLinePts.length &&
            simulation.carbonInSimYear.total < carbonGraph.graph.wedgeLinePts[nextDown].carbon_GtPerYear) {
            // qm.lastWedgeDown = Math.min(qm.lastWedgeDown+1, carbonGraph.graph.wedgeLinePts.length);
            qm.lastWedge = nextDown;
            qm.wedgeTriggerElement.trigger({
                type: 'wedgeDown',
                wedge: nextDown
            });
            nextDown++;
        }
        while (nextUp >= 0 &&
            simulation.carbonInSimYear.total > carbonGraph.graph.wedgeLinePts[nextUp].carbon_GtPerYear) {
            qm.lastWedge = nextUp;
            qm.wedgeTriggerElement.trigger({
                type: 'wedgeUp',
                wedge: nextUp
            });
            nextUp--;
        }
    }
    simulation.addListener(qm.simWedgeListener);

    // Keep track of the number of wedges eliminated since the start of the tutorial.
    qm.wedgeTriggerElement.on('wedgeDown', function (event) {
        qm.wedgesEliminated++;
        qm.display.update();
        console.log('Wedge down!', event.wedge); // FIXME: for testing
    });
    qm.wedgeTriggerElement.on('wedgeUp', function (event) {
        qm.wedgesEliminated--;
        qm.display.update();
        console.log('Wedge up!', event.wedge); // FIXME: for testing
    });

    // When the "quest" is complete, start the next quest!
    $('#electricityButton').one('click', qm.quests.totalPower);

} // qm.init ()


/////////////////////////////////////////////
// Functions for starting individual Quests.
qm.quests = {};

//////////////////////////////
// Reduce emissions by one wedge, using the first visible sliders (mainly "Total Power").
qm.quests.totalPower = function () {

    qm.quest = 'totalPower';

    qm.setNote('qm_wedgeDefn', 'Each <strong>wedge</strong> is the <strong>same amount</strong> of GHG emissions.', 'projectionGraphContainer')
        .css('left', '4rem')
        .css('top', '40%');
    window.setTimeout(function () {
        qm.addMessage(
            'Try to <strong>eliminate a wedge</strong> of emissions by <strong>changing a prediction</strong>.<br>' +
            '&rightarrow; <em>Use the <strong>sliders</strong> to change predictions.</em>',
            'smile'
        );
        qm.showNote('qm_wedgeDefn');
    }, qm.animTime);

    window.setTimeout(function () {
        qm.highlightTargetWedge();
    }, 2 * qm.animTime);

    $('#controlsContainer').one('slide.kcvs.slider', function () {
        // In case the user gets here before the starting notes have displayed:
        for (var i = 0; i < qm.initNoteTimers.length; i++) {
            window.clearTimeout(qm.initNoteTimers[i]);
        }
        qm.hideNote('qm_wedgeDefn');
        qm.hideNote('qm_going');
    });

    // Next quest!
    qm.wedgeTriggerElement.one('wedgeDown', qm.quests.realPower);
} // qm.quests.totalPower

//////////////////////////////
// Reduce emissions by two more wedges, while keeping it real.
qm.quests.realPower = function () {

    qm.quest = 'realPower';

    qm.slideIn(carbonGraph.score.display);

    // Congratulations message.  If they kept it "realistic", just mention the
    // next goal.  If not, bring in the Reality Check now.
    if (simulation.isFeasible()) {
        qm.addMessage('<strong>Excellent!</strong><br>Now go for <strong>two more wedges</strong>.', 'grin');
        qm.setTargetWedge(qm.targetWedgeLine + 2);
    }

    // Next quest!
    qm.wedgeTriggerElement.on('wedgeDown', qm.quests.keepItReal);
} // qm.quests.realPower

//////////////////////////////
// User has found an unrealistic setting.  Introduce the Reality Check.
// Also reveal more sliders and update the goal.
qm.quests.keepItReal = function () {
    // If we haven't hit unrealistic settings yet, keep watching.
    // TODO: Check if we pass the wedge target with realistic settings!
    if (simulation.isFeasible()) return;

    qm.quest = 'keepItReal';
    qm.wedgeTriggerElement.off('wedgeDown', qm.quests.keepItReal);

    qm.slideIn('#feasibilityIndicator');

    // qm.setNote('qm_quest', '<strong>However!</strong><br>' + 
    //     'Your changes must be <strong>realistic</strong>.<br><br>' +
    //     'Move your sliders <strong>back</strong> to <strong>realistic values</strong>.')
    //     .css('top', '')
    //     .css('bottom', '2rem');
    qm.addMessage('<strong>However!</strong>  ' +
        'Your changes must be <strong>realistic</strong>.<br>' +
        '&rightarrow;Move your slider <strong>back</strong> to <strong>realistic values</strong>.', 'meh-rolling-eyes');

    qm.simListener = function () {
        if (simulation.isFeasible()) {
            qm.simListener = function () { };

            // Next quest!
            qm.quests.keepingItReal();
        }
    };
}; // qm.quests.keepItReal

qm.quests.keepingItReal = function () {

    qm.quest = 'keepingItReal';

    qm.addMessage('Good.  Let\'s try it again, but watch the <strong>Reality Check</strong> meter.<br>' +
        'You\'ll need some <strong>more controls</strong> to get there -- try these!',
        // 'It is dangerous to go alone.  Take this!',
        'smile'
    );

    qm.slideIn('#electricityPercentsWrapper');
    $('#electricityPercents').addClass('qm_lookAtMe');

    // When the user opens the "Sources" controls, start a new sub-quest to teach them how to use it.
    $('#electricityPercentsWrapper').one('click', qm.quests.electricitySources);


}; // qm.quests.keepingItReal

qm.quests.electricitySources = function () {

    $('#electricityPercents').removeClass('qm_lookAtMe');

    qm.addMessage('Those sources are <strong>connected</strong>.<br>' +
        'To see how, figure out how to set <strong>any single source</strong> to 100%.', 'surprise');

    var lastMsg = function () {
        qm.simListener = function () { };
        // qm.setNote('qm_miniQuest',     
        //     'Good.  This connection makes sure the sources add up to 100%.<br><br>' +
        //     'Now <strong>reset</strong> the sources, and eliminate some wedges!');
        qm.addMessage('Nice!  This connection makes sure the sources add up to 100%.<br>' +
            'Now hit the <strong>Reset Sources</strong> button and we\'ll do this for real.', 'grin-beam');
        qm.resetButton = $('<button>Reset Sources</button>')
            .attr('id', 'resetElectricityPercents')
            .addClass('electricityPercentsButton assumptionsButton percentButton qm_lookAtMe')
            // .insertAfter('#electricityPercents')
            .insertBefore('.electricityPercentsButton')
            .hide().slideDown();
        qm.resetButton.on('click', function () {
            var varList = simData.variables.coalPercent.dependsOn;
            for (var i = 0; i < varList.length; i++) {
                var sliders = simulation.getSlidersByVar(varList[i]);
                for (var j = 0; j < sliders.length; j++) {
                    sliders[j].reset();
                }
            }
            qm.resetButton.removeClass('qm_lookAtMe').slideUp();

            qm.addMessage('OK, let\'s eliminate some wedges -- using <strong>realistic</strong> predictions!')

            // Next quest!
            qm.checkQuest = function () {
                if (qm.wedgesEliminated >= qm.targetWedgeLine && simulation.isFeasible()) {
                    qm.simListener = function () { };
                    qm.quests.landArea();
                }
            };
            qm.simListener = qm.checkQuest;

        });
    };

    var any100 = function () {
        var varList = simData.variables.coalPercent.dependsOn;
        var found = false;
        for (var i = 0; i < varList.length; i++) {
            if (simulation.value(varList[i]) == 100) {
                found = true;
                qm.addMessage('Good.  Now change the sliders to get <strong>100% coal power</strong>.', 'smile');
                qm.simListener = coal100;
            }
        }
        if (!found && simulation.value('coalPercent') == 100) {
            lastMsg();
        }
    };
    var coal100 = function () {
        if (simulation.value('coalPercent') == 100) {
            lastMsg();
        }
    }
    qm.simListener = any100;


}; // qm.quests.electricitySources

//////////////////////////////
// Introduce the Land Area display.

qm.quests.landArea = function () {
    qm.quest = 'landArea';

    qm.hideTargetWedge();

    landAreaDisplay.hide();
    landAreaDisplay.hideButton();
    $('#landArea').removeClass('qm_hidden');

    var msg;
    if (simulation.lastSliderVar.hasOwnProperty('landAreaFunctionName')) {
        $('#landAreaButton').addClass('qm_lookAtMe');
        msg = 'Excellent!  Now, some of these sources, including '
            + simulation.lastSliderVar.description
            + ', need their <strong>space</strong>.  To see how much, click the <strong>green globe</strong> button that just appeared at the top left of the page.';
    } else {
        msg = 'Excellent!  Now, some of these sources need their <strong>space</strong>.  Find a source that needs land and <strong>adjust its slider</strong> to see how much.'
        qm.simListener = function () {
            if (simulation.lastVar.landAreaFunctionName) {
                // User changed a slider that has a land area.
                $('#landAreaButton').addClass('qm_lookAtMe');
                qm.simListener = function () { };
                qm.addMessage('Right, that one uses land.  Click the <strong>globe</strong> button that just appeared.', 'smile');
            }
        };
    }

    qm.addMessage(msg, 'grin-stars');

    $('#landAreaButton').one('click', function () {
        $('#landAreaButton').removeClass('qm_lookAtMe');
        // Next quest!
        qm.quests.landAreaAssumptions();
    });

}; // qm.quests.landArea


//////////////////////////////
// Have the user check some assumptions pages.

qm.quests.landAreaAssumptions = function () {
    qm.quest = 'landAreaAssumptions';

    qm.slideIn($('.assumptionsButton-icon'));

    qm.addMessage('Some sources of electricity can <strong>share the land</strong> with other uses.  Use the <em>assumptions</em> buttons ' + svgIcon('question-circle', 'svgIcon-inline', true) + ' to <strong>find two sources</strong> whose land can be multi-use.');

    qm.actionsRemaining = 2;

    // For each source that can share land, we'll attach this listener to its
    // assumptions button.  Naming the function lets us remove them all once the
    // user's found the right button.
    var buttons = $('.assumptionsButton');
    var correctButton = function (event) {
        // TODO: Have them do this TWICE; the first time it says to find another one, the second time it just says 'Great!' and then moves on to the next Quest.

        // The buttons aren't named, but the parent panels are.  We have to use
        // delegateTarget instead of target because sometimes target is the SVG
        // icon and sometimes it's the "button" element itself.
        var parent = $(event.delegateTarget).parent();
        var parentType = 'PercentSliderLabelRow';
        if (!parent.attr('id').endsWith(parentType)) return;

        var source = parent.attr('id').replace(parentType, '');

        var assumptionsWindow = $('#bigWindow');

        if (source == 'solar' || source == 'wind') {
            qm.actionsRemaining--;
            if (qm.actionsRemaining > 0) {
                assumptionsWindow.one('closeModal.kcvs', function (event) {
                    qm.addMessage('That\'s one!  Land used for ' + source +
                        ' power can still be used for other things.  Now find <strong>'
                        + qm.actionsRemaining + ' more</strong> source like this.',
                        'grin');
                });
            } else {
                assumptionsWindow.one('closeModal.kcvs', function (event) {
                    buttons.off('click', correctButton);
                    landAreaDisplay.hide();
                    qm.addMessage('That\'s it!  These ' + svgIcon('question-circle', 'svgIcon-inline', true) + ' buttons can tell you about anything in the simulation.<br>But you can\'t reach the goal with electricity alone.  Pick <strong>another category</strong> of predictions to explore.', 'grin-stars');
                    pageCollection.enableAllCategories();

                    $('.carbonCategoryButton:not(.carbonCategory-current)').one('click', function (event) {
                        var cat = event.delegateTarget.getAttribute('id').replace('Button', '');
                        pageCollection.singleCategory(cat);

                        // Next quest!
                        qm.quests.newCat();
                    });
                });
            }
        }
    }; // correctButton function
    buttons.on('click', correctButton);

}; // qm.quests.landAreaAssumptions


//////////////////////////////
// Remove a wedge using a new category of actions.

qm.quests.newCat = function () {
    qm.quest = 'newCat';

    qm.addMessage('Okay, over to you!  By changing <strong>only these predictions</strong> and using <strong>realistic values</strong>, try to reduce our emissions by at least <strong>one more wedge</strong>.');

    qm.setTargetWedge(qm.wedgesEliminated + 1);

    qm.checkQuest = function (event) {
        if (simulation.isFeasible()) {
            // pageCollection.enableAllCategories();
            qm.addMessage('<strong>Nicely done!</strong><br>That\'s it for me -- but there\'s a lot more to explore! Choose&nbsp;<strong>Summary</strong> from the menu to see all your predictions at once, or hit the <strong>Leave Tutorial</strong> button for the <strong>complete</strong> <em>Design Our Climate</em> simulation.', 'grin-hearts');

            // Make sure the last message fits in the message pane.
            var lastHeight = qm.msgPane.children(':last-child').height();
            qm.msgDisplay.height(lastHeight + 8);
            qm.msgPane.scrollBottom();

            qm.wedgeTriggerElement.off('wedgeDown', qm.checkQuest);
        }
    };
    qm.wedgeTriggerElement.on('wedgeDown', qm.checkQuest);
}; // qm.quests.newCat

/*
REMAINING QUESTS:
- Impact Crater
  - Leave it out for now, until I have a better handle on what it shows and what we're doing with it.
*/

/////////////////////////////////////////////
// Quest-mode cheat codes. :)
qm.cheats = {};

// At the Atlas Coal Mine in Drumheller, AB, they put orange paint on some of
// their coal and sold it at a premium as "Wildfire Coal".  (Yes, people bought
// it!)
qm.cheats.wildfireCoal = function () {
    var varList = simData.variables.coalPercent.dependsOn;
    for (var i = 0; i < varList.length; i++) {
        simulation.getSlidersByVar(varList[i])[0].setValue(0);
    }
}

////////////////////////////////////////////////////////////
// This will run once the browser had loaded all JS and CSS files 
// and finished layout etc.
$(document).ready(function () {

    ////////////////////////////////////////////////////////////
    // Check if we're in Quest Mode (introductory tutorial).

    // qm.init();
    qm.checkQuestMode();

    // Add any additional URL parameters to the tutorial link in the menu.
    qm.updateTutorialLink();

    ////////////////////////////////////////////////////////////
    // Initialize libraries

    // Activate the Foundation library.
    // $(document).foundation();

    // For wide screens, use full-width displays.
    zoomer.lastSize = "unknown"; // Size label from last time we called setShrinkingDisplaySize.

    // Save references to reduce repeated DOM searching.
    zoomer.shrinkWrap = $('.shrinkWrap');
    zoomer.shrinkingDisplay = $('.shrinkingDisplay');
    zoomer.displaysContainer = $('#displaysContainer');
    zoomer.displaysStickyWrapper = $('#displaysStickyWrapper');
    zoomer.displaysStickyWrapperMargin = zoomer.displaysStickyWrapper.css('margin-top');
    zoomer.main = $('#mainContent');
    var setShrinkingDisplaySize = function (init) {
        if (zoomer.currentSize != zoomer.lastSize) {
            if (zoomer.currentSize != 'small') {
                zoomer.shrinkingDisplay.removeClass('shrunk').removeClass('shrunkHidden').addClass('full');
                // zoomer.displaysStickyWrapper.css('position', 'static');
            } else {
                zoomer.shrinkingDisplay.removeClass('full').addClass('shrunk');
                // zoomer.displaysStickyWrapper.css('position', '');
            }
            zoomer.updateAllZoomListeners();
        }
        zoomer.lastSize = zoomer.currentSize;

        // Make the sticky controls resize properly when window is resized.  (Works
        // around a bug in Foundation's sticky plugin.)
        // $('.sticky').foundation('_calc', true);

    } // setShrinkingDisplaySize function

    zoomer.resizeTimer = null;
    $(window).resize(function () {
        clearTimeout(zoomer.resizeTimer);
        zoomer.resizeTimer = setTimeout(setShrinkingDisplaySize, 150);
    });


    ////////////////////////////////////////////////////////////
    // Initialize the simulation.

    simulation.init();


    ////////////////////////////////////////////////////////////
    // Initialize control pages

    percentDisplays.init();

    pageCollection.buildAllPages();

    // Set display to "no category selected".
    pageCollection.setCategory('noCat');

    // Hide all category pages when they're not selected.  (Hopefully this will
    // reduce the amount the browser needs to update at a time.)
    $('.controlpage').addClass('hidden');

    // Display the default page.
    if (qm.questMode) {
        pageCollection.setPage('qmIntroPage');
    } else {
        pageCollection.setPage('helpPage');
    }

    // Update the simulation in case the control page initialization changed
    // something.  (WARNING: This a kludge, and should not be needed!)
    simulation.update();

    /////////////////////////////////////////////
    // Set up category selection icons.

    // Page selection listener.
    var buttonPageSelect = function (event) {
        var catName = $(event.currentTarget).attr('id').replace('Button', '');
        var pageName = catName + 'Page';

        pageCollection.setCategory(catName);
        pageCollection.setPage(pageName);
    }
    $('button.carbonCategoryButton').click(buttonPageSelect);

    // For category emissions hover
    $('button.carbonCategoryButton').on('mouseenter focus', function () {
        var cat = (this.id).replace("Button", "");
        var calcCat, emissions, msg;

        if (cat == 'electricity') {
            calcCat = 'electricity';
        } else if (cat == 'transportation') {
            calcCat = 'vehicle';
        } else if (cat == 'landuse') {
            calcCat = 'landUse';
        } else if (cat == 'buildings') {
            calcCat = 'building';
        } else if (cat == 'materials') {
            calcCat = 'material';
        } else {
            console.error('Bork! Unknown carbon category button: ' + cat);
        }

        emissions = (simulation.carbonCategoryDefaults[calcCat] * simulation.carbonCategoryDefaults.scaleFactor) - (simulation.carbonCategoryDefaults[calcCat] - simulation.carbonInSimYear[calcCat]);

        emissions = Math.round(emissions);

        msg = this.getAttribute('aria-label') + '<br>' + emissions + ' GtCO₂eq/year in ' + simData.simDataYear;

        var pos = $(this).offset();
        var fontSize = parseInt($(this).css("font-size").replace('px', ''));
        // showCategoryEmissions(emissions+' GtCO₂eq/year', pos.left, pos.top + (fontSize * 4));
        showCategoryEmissions(msg, pos.left, pos.top + (fontSize * 4));
    });

    $('button.carbonCategoryButton').on('mouseleave blur', function () {
        $('.tooltipwindow').hide();
    });


    function showCategoryEmissions(emissionsText, x, y) {

        var tooltip = $('.tooltipwindow'); // So we don't have to keep searching.
        // tooltip.text(emissionsText);
        tooltip.html(emissionsText);
        tooltip.show();
        tooltip.offset({ left: x, top: y }); // Set position relative to document.
    }

    //////////////////////////////
    // Set up "what next" button according to selected option.
    // Options are: "cs" (default, "Climate Solutions"), "ecc" ("Explaining Climate Change"), "none" (default - hide the "what next" button)
    var whatNext = contentsData.urlParams.whatnext;
    var whatNextPage = "";
    if (whatNext == "cs" || whatNext == undefined) {
        // whatNextPage = "https://kcvs.ca/ClimateSolutions/whatNext_DOCS.html";
        if ($('.darkMode')[0]) {
            whatNextPage = "whatsNext.html?darkMode=true";
        }
        else {
            whatNextPage = "whatsNext.html";
        }
    } else if (whatNext == "ecc") {
        whatNextPage = "https://explainingclimatechange.com/lesson9/9_3_6.html";
    } else {
        whatNextPage = "";
    }

    if (whatNextPage == "") {
        $('#whatNextButton').parent().hide();
    } else {
        var whatNextButton = $('#whatNextButton');

        whatNextButton.attr('href', whatNextPage)

        // Explanatory tooltip
        whatNextButton.on('mouseenter focus', function () {

            var tooltip = $('.tooltipwindow'); // So we don't have to keep searching.
            tooltip.html('Leave DOC simulation<br>and explore your next steps.<br><em>(opens new window)</em>');
            tooltip.show();

            var pos = $(this).offset();
            var fontSize = parseInt($(this).css("font-size").replace('px', ''));
            pos.top = pos.top + (fontSize * 4);
            tooltip.offset(pos); // Set position relative to document.
        });
        whatNextButton.on('mouseleave blur', function () {
            $('.tooltipwindow').hide();
        });
        whatNextButton.on('click', function () {
            whatNextButton.blur(); // Force blur so tooltip is removed on click; hover still visible but removed once user mouses onto the page—not sure how to work around this
        });
    }

    ////////////////////////////////////////////////////////////
    // Initialize the HUD displays.

    carbonGraph.init();
    feasibilityIndicator.init();



    landAreaDisplay.init();

    // FIXME: This should be done inside of impactDisplay.init etc instead of
    // being called directly here... (or maybe in zoomer.addZoomFunctions?)
    impactDisplay.container.on('click', impactDisplay.zoomIn);

    var referenceListener = function (e) {
        var reference;
        reference = $(this).attr("data-reference");
    };

    var addReferenceListeners = function (element) {
        // Finds all "glossary"-class descendents of the given element and attaches
        // the glossary mouse-over/mouse-out behaviour.
        // The element is optional; if not given, the entire page is searched.
        var targets;
        if (!element) {
            targets = $('.reference');
        } else {
            targets = element.find('.reference');
        }
        targets.on({
            'click': referenceListener,
        });
    }

    addReferenceListeners();

    $('.reference').on('click', function (event) {
        console.log(event);
    });

    setShrinkingDisplaySize();

    // Percent display 'accordion' controls
    var percentDisplayButton = {};
    percentDisplayButton.state = {
        "electricityPercents": false, //false: sliders hidden, true: sliders displayed
        "vehicleUsePercents": false,
        "heatingPercents": false,
    };

    percentDisplayButton.display = function () {
        var s = this.id;
        var state = percentDisplayButton.state[s];

        if (state) {
            //hide sliders
            // $('.' + this.id).each(function(i, obj) {
            //     obj.style.display = 'none';
            // });

            //change button text
            $('.' + this.id + 'Button').text('Show Controls');

            percentDisplayButton.state[s] = false;
        } else {
            $('.' + this.id).each(function (i, obj) {
                obj.style.display = 'block';
            });
            //change button text
            $('.' + this.id + 'Button').text('Hide Controls');

            percentDisplayButton.state[s] = true;
        }
    };

    $(".percentDisplay").on("click", percentDisplayButton.display);
    $(".percentButton").on("click", percentDisplayButton.display);

    // Check for Quest Mode!
    qm.init();

    // Last thing: Reveal bits that were hidden initially.
    $('.initInvisible').addClass('revealed');
    // Remove these utility classes so they don't complicate styling later.
    $('.initInvisible.revealed').one('transitionend', function (event) {
        $(this).removeClass('initInvisible revealed');
    });

    // Auto-fill assumptions values from simData
    $(".autofill-data").each(function () {
        var val;

        // Check if looking for default value
        if ($(this).attr("data-constant")) {
            var constName = $(this).attr("data-constant");

            // // FIXME: for testing
            // if (simData.variables[constName] === undefined) {
            //     console.error("Bork! " + constName + " not found!");
            // }else{
            //   val = Number(simData.variables[constName].default).toFixed(simData.variables[constName].decimal);
            // }

            if (simData.variables[constName]) {
                val = Number(simData.variables[constName].default).toFixed(simData.variables[constName].decimal);
            }
        }

        // Check if looking for other value
        if ($(this).attr("data-property")) {
            var constProp = $(this).attr("data-property");

            // Check if variable or constant
            if (simData.variables[constName]) {
                val = Number(simData.variables[constName][constProp]).toFixed(simData.variables[constName].decimal);
            } else if (simData.physicalConstants[constName]) {
                if (simData.physicalConstants[constName].displayDecimal) {
                    val = simData.physicalConstants[constName][constProp].toFixed(simData.physicalConstants[constName].displayDecimal);
                } else {
                    val = simData.physicalConstants[constName][constProp].toString();
                }
            }
        }

        // Check if looking for impacts value
        if ($(this).attr("data-impacts")) {
            var impactsName = $(this).attr("data-impacts");
            var impactsProp = $(this).attr("data-impactsProperty");
            val = simData.impacts[impactsName][impactsProp];

            // Add units
            if ($(this).attr("units") != "none") {
                val += " " + simData.impacts[impactsName].units;
            }
        }

        // Check if constant has units to include
        if ($(this).attr("data-constant") && $(this).attr("units") != "none") {
            // Check if variable or constant
            if (simData.variables[constName]) {
                if (simData.variables[constName].units != "%") {
                    val += " ";
                }
                val += simData.variables[constName].units;
            } else if (simData.physicalConstants[constName]) {
                val += simData.physicalConstants[constName].units;
            }
        }

        // Display value
        $(this).html(val);
    });

    // Reset sim to display proper decimals (should probably fix this)
    simulation.reset();

    // updateLinks();
    // insertLearnDocs();
}); // $( document ).ready


/*******************************************************************
 *                          UTILITY FUNCTIONS                      *
 *******************************************************************/

// Generates the HTML for using an SVG icon.
function svgIcon(iconName, classes, isAriaHidden) {
    if (!classes) classes = '';
    classes += ' svgIcon';
    var output = '<svg class="' + classes + '" role="img"';
    if (isAriaHidden) output += ' aria-hidden="true"';
    output += '><use href="img/fontawesome/fontawesome-free-5.9.0-web-solid-sprite_';
    output += iconName.charAt(0);
    output += '.svg#';
    output += iconName;
    output += '"></use></svg>';
    return output;
}


// Shows a temporary notification, which hides itself after a certain amount of
// time.  (If show is called again the timer is restarted.)
var constraintNotice = {};
constraintNotice.hideDelay = 5000; // Time in ms before hiding.
constraintNotice.panel = document.querySelector('#constraintNotice');
constraintNotice.msgContainer = constraintNotice.panel.querySelector('#constraintMessage');
constraintNotice.timeoutID = null;
constraintNotice.depVar = null; // Which dependent variable's constraint was hit?
constraintNotice.varMin = 0;
constraintNotice.show = function (msg, depVar, varMin) {
    if (this.timeoutID) window.clearTimeout(this.timeoutID);
    constraintNotice.depVar = depVar;
    constraintNotice.varMin = varMin;
    // MSG is the HTML string for the message you want to display.
    this.msgContainer.innerHTML = msg;
    this.panel.classList.remove('closed');
    this.timeoutID = window.setTimeout(function () {
        constraintNotice.panel.classList.add('closed');
    }, this.hideDelay);
}
constraintNotice.hideNow = function () {
    if (constraintNotice.timeoutID) window.clearTimeout(constraintNotice.timeoutID);
    constraintNotice.panel.classList.add('closed');
    constraintNotice.depVar = null;
}
$(constraintNotice.panel).on('click', constraintNotice.hideNow);
simulation.addListener(function (event) {
    if (constraintNotice.depVar && constraintNotice.varMin != undefined &&
        simulation.value(constraintNotice.depVar) > constraintNotice.varMin) {
        constraintNotice.hideNow();
    }
    // if (constraintNotice.depVar)
});

// $('.tooltipwindow').on({
//     // Click on the tooltip to hide it (useful for touch interfaces).
//     'click': hideToolTip
// });

//Functions for retrieving and creating reference windows
function createReferenceID(target) {
    var ref = $(target).text();

    ref = ref.replace(/-/g, '');
    ref = ref.replace(/\(/g, '');
    ref = ref.replace(/\)/g, '');
    ref = ref.replace(/'/g, '');
    ref = ref.replace(/:/g, '');
    ref = ref.replace(/\s+/g, '');
    return ref;
}
function createReference(target) {
    var ref = createReferenceID(target);

    console.log(ref);
    // Create window
    createWindowHTML('<div id="refWindowDiv">Loading Reference...</div>', "normal");
    console.log('references.html #' + ref);
    // Lood reference into created window
    $('#refWindowDiv').load('references.html #' + ref);
}

// Add an "Open in New Window" button to the given element.  Intended for use
// with the References, About, and Glossary pages when shown in the bigWindow
// modal.
// - elem should be a selector or a jQuery object.
// - page is the URL to open in a new window when the button is clicked.
// function addNewWindowButton(elem, page) {
//     var target = $(elem); // in case elem is a selector string.
//     var a = $('<a></a>')
//         .attr('href', page)
//         .attr('target', '_blank')
//         .prependTo(target);
//     var b = $('<button>open in<br>new window</button>')
//         .attr('button')
//         .addClass('DOCSButton newWindowButton')
//         .appendTo(a);
// }

function addNewWindowLink(elem, page) {
    var target = $(elem); // in case elem is a selector string.
    var a = $('<a></a>')
        .attr('href', page)
        .attr('target', '_blank')
        // .addClass('newWindowLink buttonShine')
        .addClass('assumptionsButton newWindowLink buttonShine')
        .prependTo(target);
    var d = $('<div>open in<br>new window</div>')
        .appendTo(a);
}

// Function for loading the References page in a modal window.
function showReferencesPage() {
    createWindowHTML('<div id="refWindowDiv">Loading References...</div>', 'big');

    var modalDiv = $('#refWindowDiv');
    if ($('.darkMode')[0]) {
        modalDiv.load('references.html  #referencesList', function () {
            modalDiv.prepend('<h1>References for <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
            // addNewWindowButton(modalDiv, 'references.html');
            addNewWindowLink('#bigWindow', 'references.html?darkMode=true');
        });
    }
    else {
        modalDiv.load('references.html  #referencesList', function () {
            modalDiv.prepend('<h1>References for <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
            // addNewWindowButton(modalDiv, 'references.html');
            addNewWindowLink('#bigWindow', 'references.html');
        });
    }
}

// Finds all "constant"-class descendents of the given element (a JQuery object)
// and replaces their contents with the values of the corresponding constants in
// the simData object. parent is optional; if not given, the entire page is
// searched. (This mainly applies to assumptions and other initially-invisible
// elements, so do this after the main interaction stuff is ready!)
function updateConstants(parent) {
    var targets;
    if (!parent) {
        targets = $('.constant');
    } else {
        targets = parent.find('.constant');
    }
    targets.each(function (index, element) {
        var jq = $(element);
        var c = simData.physicalConstants[jq.attr('data-name')];
        var value = c.value;
        if (c.displayMultiplier != undefined) value = value * c.displayMultiplier;
        if (c.displayDecimal != undefined) value = value.toFixed(c.displayDecimal);
        jq.text(value);
    });
}

//Historic timescale toggle functions
// TODO: Take the earlier year from the history data file and move the other to simData.
function showGraphHistory() {
    simData.timeScales.short.xmin = 1750;
    simData.timeScales.long.xmin = 1750;
    carbonGraph.updateAxes();
    simulation.updateNetCO2();

    var t1 = document.getElementById('defaultGraph');
    t1.style.fill = 'black';
    var t2 = document.getElementById('graphHistory');
    t2.style.fill = 'grey';
}

function hideGraphHistory() {
    simData.timeScales.short.xmin = 2000;
    simData.timeScales.long.xmin = 2000;
    carbonGraph.updateAxes();
    simulation.updateNetCO2();

    var t1 = document.getElementById('defaultGraph');
    t1.style.fill = 'grey';
    var t2 = document.getElementById('graphHistory');
    t2.style.fill = 'black';
}

//For menu reset button
function resetSim() {
    simulation.reset();
    simulation.update();
    carbonGraph.update();
    impactDisplay.update();
    feasibilityIndicator.update();
    percentDisplays.updateAll();
}


//For menu instructions button
function displayHelpPage() {
    // Set display to "no category selected".
    pageCollection.setCategory('noCat');
    // Display the default page.
    pageCollection.setPage('helpPage');
}

// Display the About info for the applet.
function openAbout() {
    // var aboutWindow = $('#bigWindow');
    // createWindowHTML('<div id="aboutWindowDiv">Loading About page...</div>', 'big');

    // var modalDiv = $('#aboutWindowDiv');
    // if($('.darkMode')[0]){
    //     modalDiv.load('about.html  #aboutContent', function() {
    //         modalDiv.prepend('<h1>About <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
    //         addNewWindowLink('#bigWindow', 'about.html?darkMode=true');
    //         var modalFoot = $('<div id="aboutFoot"></div>').appendTo(modalDiv);
    //         modalFoot.load('about.html #footerContainer');
    //         // addNewWindowButton(modalDiv, 'references.html');
    //     });
    // }
    // else{
    //     modalDiv.load('about.html  #aboutContent', function() {
    //         modalDiv.prepend('<h1>About <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
    //         addNewWindowLink('#bigWindow', 'about.html');
    //         var modalFoot = $('<div id="aboutFoot"></div>').appendTo(modalDiv);
    //         modalFoot.load('about.html #footerContainer');
    //         // addNewWindowButton(modalDiv, 'references.html');
    //     });
    // }

    // Hide simulation content
    $("#mainRowWrapper").css("display", "none");
    $(".menuBar").css("display", "none");

    // Create and display summary content
    var aboutDiv = document.createElement("div");
    aboutDiv.setAttribute("id", "aboutContainer");
    document.getElementById("mainContent").appendChild(aboutDiv);

    aboutDiv = $('#aboutContainer');

    if ($('.darkMode')[0]) {
        aboutDiv.load('about.html  #aboutContent', function () {
            aboutDiv.prepend('<button id="aboutBackButton" onclick="closeAbout();"<strong>X</strong><h1>About <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
            // addNewWindowLink('#bigWindow', 'about.html?darkMode=true');
            var modalFoot = $('<div id="aboutFoot"></div>').appendTo(aboutDiv);
            modalFoot.load('about.html #footerContainer');
            // addNewWindowButton(modalDiv, 'references.html');
        });
    }
    else {
        aboutDiv.load('about.html  #aboutContent', function () {
            aboutDiv.prepend('<button id="aboutBackButton" onclick="closeAbout();"<strong>X</strong></button><h1>About <em>Design&nbsp;Our&nbsp;Climate</em></h1>');
            // addNewWindowLink('#bigWindow', 'about.html');
            var modalFoot = $('<div id="aboutFoot"></div>').appendTo(aboutDiv);
            modalFoot.load('about.html #footerContainer');
            // addNewWindowButton(modalDiv, 'references.html');
        });
    }

    // Show summary
    $("#aboutContainer").fadeIn(500);
};

function openLearnDOCS() {
    if ($('.darkMode')[0]) {
        // $('#learnDOCS').click(function(){
        //     window.open("DesignOurClimateSim.html?mode=quest&darkMode=true")
        // });
        window.open('DesignOurClimateSim.html?mode=quest&darkMode=true');
    }
    else {
        // $('#learnDOCS').click(function(){
        //     window.open("DesignOurClimateSim.html?mode=quest")
        // });
        window.open('DesignOurClimateSim.html?mode=quest');
    }
}

// Displays intro window for the menu option without switching pages
function createIntroWindow() {
    pageCollection.showHelp();
}

// Displays an intro window populated with a docs introduction, instructions, and resources
document.body.onload = function createIntroWindow() {
    if (!qm.checkQuestMode()) {
        pageCollection.setCategory('electricity');
        pageCollection.setPage('electricityPage');

        pageCollection.showHelp();
        $("#bigWindow").css("display", "none");
        $("#bigWindow").slideDown();
    }
}

/*******************************************************************
 *                          SUMMARY PAGE                           *
 *******************************************************************/

function returnToSim() {
    window.open('javascript:void window.focus();', 'DOCSwindow');
    window.close();
}

// Loads the simulation displays in the summary overlay
function loadSummaryDisplays() {
    // Create and display summary content
    var sumDiv = document.createElement("div");
    sumDiv.setAttribute("id", "summaryContainer");
    document.getElementById("mainContent").appendChild(sumDiv);

    // Summary title
    sumDiv.innerHTML += "<div class='summaryControls'><button id='summaryPrintButton' onclick='printSummary();'><strong>Print Summary</strong></button><button id='summaryBackButton' onclick='closeSummary();'<strong>X</strong></div><br><h1 class='supportPageTitle'>DOCS Summary</h1>"

    // Add sim displays
    var displayDiv = document.createElement("div");
    displayDiv.setAttribute("id", "summaryDisplaysContainer");
    sumDiv.appendChild(displayDiv);

    // Projection Graph
    displayDiv.innerHTML += "<div>" + $("#projectionGraphContainer").html() + $('.belowDisplay').html() + "</div>";
    // Impacts
    var impacts = $("#impactContainer").html();
    displayDiv.innerHTML += impacts;
    // Impacts legend
    var impactsLegend = document.createElement("div");
    impactsLegend.setAttribute("id", "summaryImpactsLegend");

    // Hide display content
    $(".impactLegend-left").css("display", "none");
    $(".feasibilityAssumptionsIcon").css("display", "none");

    //Retrieve and display impacts values
    simData.impacts.forEach(function (index) {
        var thisImpact = index;
        impactsLegend.innerHTML += "<p><img class='summaryIcon' src='" + thisImpact.icon + "'> <strong>" + thisImpact.name;
        // var roundedValue = thisImpact.value;
        // if (thisImpact.roundToNearest) {
        //   roundedValue = Math.round(roundedValue/thisImpact.roundToNearest)*thisImpact.roundToNearest;
        // }
        // roundedValue = roundedValue.toFixed(thisImpact.decimal);

        // impactsLegend.innerHTML += "<p><img class='summaryIcon' src='"+thisImpact.icon+"'> <strong>"+ thisImpact.name+":</strong> "+roundedValue+" "+thisImpact.units+"</p>";
    });
    displayDiv.appendChild(impactsLegend);
}

// Loops through a slider list and puts their duplicate in a specified container
function setSummarySliders(targetContainer, sliderList, sliderColor) {
    for (let i = 0; i < sliderList.length; i++) {
        var slider = $("#" + sliderList[i]).clone();
        $("#" + targetContainer).append(slider);

        // Set slider category color
        slider.removeClass();
        slider.addClass("kcvsPanel kcvsSliderPanel disabled categoryColor " + sliderColor);

        // Hide slider assumptions button
        // var assumptionsButton = $("#"+sliderList[i]+" .assumptionsButton");
        // assumptionsButton.css("display", "none");
    }
}

// Loops through a percent slider list and puts their duplicate in a specified container
function setSummaryPercentSliders(targetContainer, percentSliders) {
    var percentSlidersDisplay = $("." + percentSliders).clone();
    percentSlidersDisplay.css("z-index", "0");
    $("#" + targetContainer).append(percentSlidersDisplay);
    $("." + percentSliders.replace("Display", "")).each(function () {
        var slider = $("#" + this.id).clone();
        $("#" + targetContainer).append(slider);
        slider.addClass("disabled");

        // Hide slider assumptions button
        // var assumptionsButton = $("#"+this.id+" .assumptionsButton");
        // assumptionsButton.css("display", "none");
    });
}

// Creates a summary sliders div container according to category
function createSummarySliderDiv(targetContainer, divName, divTitle) {
    var summaryDiv = document.createElement("div");
    summaryDiv.setAttribute("id", divName);
    summaryDiv.innerHTML += divTitle;
    $("#" + targetContainer).append(summaryDiv);
}

// Loads the simulation sliders in the summary overlay
function loadSummarySliders() {
    var ssc = document.createElement("div");
    ssc.setAttribute("id", "summarySlidersContainer");
    $("#summaryContainer").append(ssc);

    // Duplicate electricity sliders
    createSummarySliderDiv("summarySlidersContainer", "summaryElectricitySliders", "<h3 style='margin-top:4%;'><strong>Electricity in 2050</strong></h3>");
    var electricitySlidersList = ["relativePowerPerCapitaSliderPanel"];
    setSummarySliders("summaryElectricitySliders", electricitySlidersList, "color-electricity");
    $("#summaryElectricitySliders").append("<p>Sources of electricity:</p>");
    setSummaryPercentSliders("summaryElectricitySliders", "electricityPercentsDisplay");
    electricitySlidersList = ["coalEfficiencySliderPanel"];
    setSummarySliders("summaryElectricitySliders", electricitySlidersList, "color-electricity");

    // Duplicate transportation sliders
    createSummarySliderDiv("summarySlidersContainer", "summaryTransportationSliders", "<h3><strong>Vehicle Efficiency and Use in 2050</strong></h3>");
    var transportationSlidersList = ["vehicleDistanceTravelledSliderPanel", "vehicleOccupancySliderPanel", "gasVehicleFuelEfficiencySliderPanel"];
    setSummarySliders("summaryTransportationSliders", transportationSlidersList, "color-transportation");
    $("#summaryTransportationSliders").append("<p>Sources of Vehicle Fuel:</p>");
    setSummaryPercentSliders("summaryTransportationSliders", "vehicleUsePercentsDisplay");
    $("#summaryTransportationSliders").append("<p>Aviation</p>");
    transportationSlidersList = ["kilometersFlownSliderPanel", "planeFuelEfficiencySliderPanel"];
    setSummarySliders("summaryTransportationSliders", transportationSlidersList, "color-transportation");

    // Duplicate land use sliders
    createSummarySliderDiv("summarySlidersContainer", "summaryLandUseSliders", "<h3><strong>Food, Agriculture, and Land Use in 2050</strong></h3>");
    var landUseSlidersList = ["forestProtectionSliderPanel", "reforestationRateSliderPanel", "peatlandProtectionSliderPanel", "peatlandRestorationSliderPanel", "conservationTillageSliderPanel", "agricultureSliderPanel"];
    setSummarySliders("summaryLandUseSliders", landUseSlidersList, "color-landuse");

    // Duplicate materials sliders
    createSummarySliderDiv("summaryLandUseSliders", "summaryMaterialsSliders", "<h3 style='margin-top:4%;'><strong>Materials in 2050</strong></h3>");
    var materialsSlidersList = ["cementCompositionSliderPanel", "HFCsSliderPanel"];
    setSummarySliders("summaryMaterialsSliders", materialsSlidersList, "color-materials");
    $("#summaryMaterialsSliders").append("<p>Shipping:</p>");
    materialsSlidersList = ["shippingPerCapitaSliderPanel", "roadShippingSliderPanel", "railShippingSliderPanel", "seaShippingSliderPanel", "skyShippingSliderPanel"];
    setSummarySliders("summaryMaterialsSliders", materialsSlidersList, "color-materials");

    // Duplicate buildings sliders
    createSummarySliderDiv("summarySlidersContainer", "summaryBuildingsSliders", "<h3><strong>Buildings in 2050</strong></h3>");
    var buildingsSlidersList = ["buildingFloorAreaSliderPanel", "buildingConstructionCarbonSliderPanel", "buildingLifetimeSliderPanel", "LEDLightPercentSliderPanel", "lowFlowWaterPercentSliderPanel", "cleanCookstovesSliderPanel"];
    setSummarySliders("summaryBuildingsSliders", buildingsSlidersList, "color-buildings");
    $("#summaryBuildingsSliders").append("<p>Sources of Heating Energy:</p>");
    setSummaryPercentSliders("summaryBuildingsSliders", "heatingPercentsDisplay");

    // Duplicate common sliders
    createSummarySliderDiv("summaryContainer", "summaryCommonSliders", "<h3 style='grid-column: 1 / span 2;'><strong>Common Sliders</strong></h3>");
    var commonSliderList = ["population_ElectricitySliderPanel", "CCS_ElectricitySliderPanel"];
    setSummarySliders("summaryCommonSliders", commonSliderList);
}

function printSummary(){
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  window.print();
}

// Displays the summary overlay
function openSummary() {
    // Hide simulation content
    $("#mainRowWrapper").css("display", "none");
    $(".menuBar").css("display", "none");
    $("#projectionGraph").css("width", "100%");

    loadSummaryDisplays();
    loadSummarySliders();

    // Add date of design
    var d = new Date();
    $("#summaryContainer").append("<h5>Date of design: " + d.toLocaleDateString() + "</h5>");

    // Show summary
    $("#summaryContainer").fadeIn(500);
};

// Hides the summary overlay and displays the simulation content
function closeSummary() {
    // Hide summary
    $("#summaryContainer").fadeOut(500, function () {
        $("#summaryContainer").remove();

        // Show content
        $("#mainRowWrapper").slideDown();
        $("#mainRowWrapper").css("display", "flex");
        $(".menuBar").css("display", "block");
    });
}

function closeAbout() { //FIXME: combine w function above
    $("#aboutContainer").fadeOut(500, function () {
        $("#aboutContainer").remove();

        // Show content
        $("#mainRowWrapper").slideDown();
        $("#mainRowWrapper").css("display", "flex");
        $(".menuBar").css("display", "block");
    });
}

