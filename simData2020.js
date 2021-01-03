/*

  Data and simulation parameters for the Carbon Stabilization Wedges applet.  
  
  The wasCalled attributes are what the variables were called in previous versions.  These are useful for comparing calculations.
  
  WARNING: Before updating this, MAKE A COPY with the last-update year in the filename (simData2018.json etc).

  In the process of updating by Ashley Elgersma, Kalley Lasola, and Aden Gagnon, 2020
  
  Updated 2019 by Melanie Hoffman, Ashley Elgersma and McKenzie Tilstra
  
  Updated 2018 by Luke Vanderwekken.

*/
var convertCtoCO2 = 44 / 12;

var simData = {
    // Sliders represent values predicted for this year.
    "sliderYear": 2050,

    // All parameters represent carbon produced in this year.  This means that the
    // carbon production calculated is the y-value of the carbon production graph
    // for this year.
    "simDataYear": 2050,

    // Current carbon emissions, in GtCO2/y - update to CO2e
    "startCarbon": 47600 / 1000,
    "startYear": 2017,

    // "Business-as-usual" projected carbon in simDataYear, in GtC/y. The
    // simulation's projections will be scaled so that it gives this value under
    // the default settings.
    // This value is the RPC8.5 "worst-case scenario" projection, from IPCC2013
    // Estimated from figure 9 on  Riahi et al 2011 https://link.springer.com/article/10.1007/s10584-011-0149-y
    "simDataYearCarbon": 80,

    //OR 51.557, using 2100 value and extrapolating back

    // Target year for achieving net-zero carbon emissions.
    "netZeroTarget": 2050,

    // Time horizons (for different graph timescales, mainly). ymax values will
    // be calculated in simulation.init based on default projections.
    "timeScales": {
        "short": { "xmin": 2000, "xmax": 2050, "ymin": 0 },
        // "long": { "xmin": 2000, "xmax": 2100, "ymin": 0 }
        "long": { "xmin": 2000, "xmax": 2050, "ymin": 0 }
    },

    // The amount of carbon in one wedge.
    // "wedgeCarbon": 2,

    // Number of wedges between starting trajectory and goal.
    // "nWedges": 20,

    // List of wedge line endpoints (calculated in "DOCS wedge
    // endpoints.xlsx" spreadsheet in git repo).
    // These are the carbon (y) values of the lines projected to 2100.
    // Using the "equal area" calculations.
    "wedgeLineEndpoints": [
        80.0,
        74.66666666666667,
        69.33333333333333,
        64.0,
        58.66666666666667,
        53.333333333333336,
        48.0,
        42.66666666666667,
        37.333333333333336,
        32.0,
        26.66666666666667,
        21.333333333333336,
        16.0,
        10.666666666666671,
        5.333333333333343,
        0.0,

    ],

    // List of the categories that we have buttons for.
    "categories": {
        'electricity': {
            'title': 'Electricity',
            'variables': [
                'coalEfficiency',
                // 'powerPerCapita',
                'relativePowerPerCapita',
                'solarPercent',
                'windPercent',
                'nuclearPercent',
                'geothermalPercent',
                'hydroPercent',
                'naturalGasPercent',
                'biomassPercent',
                'coalPercent',
                'CCSPercent',
            ],
            'constants': [
                'baseCoalCarbonIntensity',
                'coalCarbonIntensity',
                'coalCapturableCarbonIntensity',
                'BaseNaturalGasCarbonIntensity',
                'naturalGasCarbonIntensity',
                'naturalGasCapturableCarbonIntensity',
                'windCarbonIntensity',
                'solarCarbonIntensity',
                'nuclearCarbonIntensity',
                'geothermalCarbonIntensity',
                'hydroCarbonIntensity',
                'biomassCarbonIntensity',
                'naturalGasEfficiency',
                //'ccsEfficiency',
                'windArea',
                'solarArea',
            ],
        },
        'transportation': {
            'title': 'Vehicle Efficiency and Use',
            'shortTitle': 'Transportation',
            'variables': [
                'vehicleDistanceTravelled',
                'vehicleOccupancy',
                'gasVehicleFuelEfficiency',
                'electricVehiclePercent',
                'fuelCellVehiclePercent',
                'propaneVehiclePercent',
                'hybridVehiclePercent',
                'biofuelVehiclePercent',
                'gasolineVehiclePercent',
                'dieselVehiclePercent',
                'kilometersFlown',
                'planeFuelEfficiency',
            ],
            'constants': [
                'fuelCellEfficiency',
                'electricEfficiency',
                'propaneEfficiency',
                'dieselEfficiency',
                'convertVolts',
                'H2Volts',
                'convertM3',
                'H2Energy',
                // 'biofuelVehicleArea',
                'gasolineCarbonIntensity',
                'propaneCarbonIntensity',
                'dieselCarbonIntensity',
                'biofuelRating',
                'electricVehicleCarbonIntensity',
                'electricVehicleCapturableCarbonIntensity',
                'fuelCellVehicleCarbonIntensity',
                'fuelCellVehicleCapturableCarbonIntensity',
                'propaneVehicleCarbonIntensity',
                'propaneVehicleCapturableCarbonIntensity',
                'hybridVehicleCarbonIntensity',
                'hybridVehicleCapturableCarbonIntensity',
                'dieselVehicleCarbonIntensity',
                'dieselVehicleCapturableCarbonIntensity',
                'biofuelVehicleCarbonIntensity',
                'biofuelVehicleCapturableCarbonIntensity',
                'gasolineVehicleCarbonIntensity',
                'gasolineVehicleCapturableCarbonIntensity',
                'jetFuelCO2Intensity',
            ],
        },
        'landuse': {
            'title': 'Food, Agriculture, and Land Use',
            'shortTitle': 'Land Use',
            'variables': [
                'forestProtection',
                'reforestationRate',
                'peatlandProtection',
                'peatlandRestoration',
                'conservationTillage',
                'agriculture',
            ],
            'constants': [
                'deforestationRate',
                'forestCarbonStorage',
                'peatlandProtectionSavings',
                'peatlandRestorationSavings',
                'conservationTillageStorage',
                'currentAgricultureCarbon',
            ],
        },
        'buildings': {
            'title': 'Buildings',
            'variables': [
                'buildingFloorArea',
                'buildingConstructionCarbon',
                'buildingLifetime',
                'LEDLightPercent',
                'lowFlowWaterPercent',
                'cleanCookstoves',
                'biomassHeatingPercent',
                'naturalGasHeatingPercent',
                'coalHeatingPercent',
                'oilHeatingPercent',
                'geothermalHeatingPercent',
                'electricHeatingPercent',
            ],
            'constants': [
                'incandescentWatts',
                'numberOfLights',
                'LEDWatts',
                'convertWatts',
                'lowFlowWaterCarbonIntensity',
                'cleanCookstovesSavings',
                'heatingEnergyConsumption',
                'biomassHeatingCarbonIntensity',
                'geothermalHeatingCarbonIntensity',
                'naturalGasHeatingCarbonIntensity',
                'naturalGasHeatingCapturableCarbonIntensity',
                'oilHeatingCarbonIntensity',
                'oilHeatingCapturableCarbonIntensity',
                'electricHeatingCarbonIntensity',
                'electricHeatingCapturableCarbonIntensity',
                'coalHeatingCarbonIntensity',
                'coalHeatingCapturableCarbonIntensity'
            ],
        },
        'materials': {
            'title': 'Materials',
            'variables': [
                'cementComposition',
                'HFCs',
                'shippingPerCapita',
                'roadShipping',
                'railShipping',
                'seaShipping',
                'skyShipping',
            ],
            'constants': [
                'cementCarbonIntensity',
                'cementEmissions',
                'HFCEmissions',
                'roadShippingFraction',
                'railShippingFraction',
                'seaShippingFraction',
                'skyShippingFraction',
            ],
        },
        "nonCategorical": {
            'title': 'Common Sliders',
            'variables': [
                'population',
                'CCSPercent',
            ],
            'constants': [
            ],
        },
    },

    ////////////////////////////////////////////////////////////
    "variables": {

        "population": {
            /* Some Comments:
            UN Probabilistic Population Projections based on the World Population Prospects 2019: 9.73 Billion in 2050 - https://population.un.org/wpp/Download/Probabilistic/Population/
            Lower 95%:9.40 Billion
            Median: 9.73 Billion
            Upper 95%: 10.07 Billion
 
            High Fertility Variant: 10.58 Billion
            Low Fertility Variant: 8.91 Billion - Actually higher than the 2100 Scenario
 
            2020 Population: 7.8 Billion
            */
            "description": "Global Population in 2050",
            "units": "billions",
            "default": 9.7,
            "presentDay": 7.8,
            "min": 5,
            "max": 15,
            "minFeasible": 8.9,
            "maxFeasible": 10.6,
            "decimal": 1,
            "assumptionsId": "populationAssumptions",
            "refComments": {
                default: '<a class="reference">(UNDESA2019)</a> The UN reports a 2050 probabilistic population of 9.73 billion.  Updated 2020.',
                presentDay: '<a class="reference">(UNDESA2019)</a> The UN reports a 2019 population of 7.8 billion.  Updated 2020.',
                minFeasible: '<a class="reference">(UNDESA2019)</a> UN 2050 Low-Fertility Scenario.  Updated 2020.',
                maxFeasible: '<a class="reference">(UNDESA2019)</a> UN 2050 High-Fertility Scenario.  Updated 2020.'
            },
        },
        ////////////////////////////////////////////////////////////////
        ///////////////////////Electricity//////////////////////////////
        ////////////////////////////////////////////////////////////////

        "coalEfficiency": {
            "description": "Efficiency of coal power",
            "wasCalled": "coalPlants",
            "units": "%",
            "default": 45,
            "presentDay": 45,
            "min": 10,
            "max": 100,
            "minFeasible": 40,
            "maxFeasible": 55,
            "decimal": 0,
            "assumptionsId": "CoalAssumptions",
            "refComments": {
                default: 'Set to  present day value',
                presentDay: 'Average efficiency is about 45% <a class="reference">(Whitaker 2012)</a>',
                maxFeasible: 'Reasonable to increase to 55% <a class="reference">(Whitaker 2012)</a>',
            }
        },
        "powerPerCapita": {
            "description": "Amount of electricity produced annually",
            "wasCalled": "totalPower",
            "units": " kWh per person",
            "default": 6880,
            "presentDay": 3400,
            "min": 0,
            "max": 10000,
            "minFeasible": 4000,
            "decimal": 0,
            "assumptionsId": "electricityOverviewAssumptions",
            "refComments": {
                default: 'Set to  present day value',
                presentDay: 'Average efficiency is about 45% <a class="reference">(Whitaker 2012)</a>',
                maxFeasible: 'Reasonable to increase to 55% <a class="reference">(Whitaker 2012)</a>',
            }
        },
        "relativePowerPerCapita": {
            "description": "Amount of electricity produced annually",
            "wasCalled": "",
            // "units": "relative to today",
            "units": "times today's use",
            "default": 2.0,
            // default and other properties are calculated at the end of this file.
            "presentDay": 1.0,
            "min": 0,
            "decimal": 1,
            "assumptionsId": "relativePowerPerCapitaAssumptions",
            "refComments": {
                default: 'Set to  present day value',
                presentDay: 'Average efficiency is about 45% <a class="reference">(Whitaker 2012)</a>',
                maxFeasible: 'Reasonable to increase to 55% <a class="reference">(Whitaker 2012)</a>',
            }
        },
        "CCSPercent": {
            "description": "Capture and storage of fossil fuel emissions",
            "wasCalled": "CCSPercent",
            "units": "%",
            "default": 1, //*technically less than 1%
            "presentDay": 0, //no Update
            "min": 0,
            "max": 100,
            "maxFeasible": 30,
            "decimal": 0,
            "assumptionsId": "CCSAssumptions",
            "capturable": true,
            "refComments": {
                default: '<a class="reference">(GCCSI2019)</a> Some CCS facilities are planned and in progress, estimated to capture about 1% of fossil fuel production emissions.  Updated 2020.',
                presentDay: '<a class="reference">(GCCSI2019)</a> Presently, there are only a few CCS facilities in the world.  Updated 2020.',
                maxFeasible: '<a class="reference">(Pembina2014)</a> Estimated that is is possible to implement CCS systems that capture 90% of emissions on one-third of facilities.  Updated 2020.',

            }

        },

        //-----------Sources of Electricity-------------//
        "solarPercent": {
            "description": "Solar",
            "wasCalled": "solarPercent",
            "icon": "sun",
            "units": "%",
            "default": 7,
            "presentDay": 2, //as of 2017 (IEA)
            "min": 0,
            "max": 100,
            "maxFeasible": 70,
            "decimal": 0,
            "assumptionsId": "solarAssumptions",
            "landAreaFunctionName": "energyPercentLandArea",
            "percentGroup": "electricityPercents",
            "refComments": {
                default: 'Projected to be 7% in 2050 <a class="reference">(Bogdanov 2019)</a> ',
                presentDay: '<a class="reference"><a class="reference">(WEO 2018)</a>IEA reports that 2017 solar electricity generation was 460 TWh, which is 2% of total electricity generation.',
                maxFeasible: '<a class="reference">(Bogdanov 2019)</a>',

            }
        },
        "windPercent": {
            "description": "Wind",
            "wasCalled": "windPercent",
            "icon": "wind",
            "units": "%",
            "default": 9,
            "presentDay": 4, //as of 2017 (IEA)
            "min": 0,
            "max": 100,
            "maxFeasible": 36,
            "decimal": 0,
            "assumptionsId": "windAssumptions",
            "landAreaFunctionName": "energyPercentLandArea",
            "percentGroup": "electricityPercents",
            "refComments": {
                default: '<a class="reference">(WEO 2018)</a> ',
                presentDay: 'IEA Reports a share of 4% in 2016 <a class="reference">(WEO 2018)</a>',
                maxFeasible: '<a class="reference">(WEO 2018)</a>',
            }
        },
        "nuclearPercent": {
            "description": "Nuclear",
            "wasCalled": "nuclearPercent",
            "icon": "atom",
            "units": "%",
            "default": 9,
            "presentDay": 11, //as of 2017 (IEA)
            "min": 0,
            "max": 100,
            "maxFeasible": 17,
            "decimal": 0,
            "assumptionsId": "nuclearAssumptions",
            "percentGroup": "electricityPercents",
            "refComments": {
                default: 'Growth is predicted to be limited - <a class="reference">(WEO 2018)</a>',
                presentDay: '2637 TWh<a class="reference">(WEO 2018</a>',
                maxFeasible: '<a class="reference">(WEC 2016)</a>',
            }
        },
        "geothermalPercent": {
            "description": "Geothermal",
            "wasCalled": "geothermalPercent",
            "icon": "mountain",
            "units": "%",
            "default": 1,
            "presentDay": 1, //as of 2017 (IEA)
            "min": 0,
            "max": 100,
            "maxFeasible": 5,
            "decimal": 0,
            "assumptionsId": "geothermalAssumptions",
            "percentGroup": "electricityPercents",
            "refComments": {
                default: '<a class="reference">(WEO 2018)</a>',
                presentDay: '85 TWh<a class="reference">(WEO 2018</a>',
                maxFeasible: '<a class="reference">(WEO 2018)</a>, <a class="reference">(Drawdown G 2019)</a>>',
            }
        },
        "hydroPercent": {
            "description": "Hydroelectric",
            "wasCalled": "hydroPercent",
            "icon": "water",
            "units": "%",
            "default": 14,
            "presentDay": 16, //as of 2017 (IEA)
            "min": 0,
            "max": 100,
            "maxFeasible": 25,
            "decimal": 0,
            "assumptionsId": "hydroAssumptions",
            "percentGroup": "electricityPercents",
            "refComments": {
                default: '<a class="reference">(WEO 2018)</a>',
                presentDay: '4109 TWh in 2017 <a class="reference">(WEO 2018)</a>',
                maxFeasible: '<a class="reference">(WEO 2018)</a>, <a class="reference">(Drawdown H 2019)</a>>',
            },
        },
        "naturalGasPercent": {
            "description": "Natural gas",
            "wasCalled": "naturalGasPercent",
            "icon": "burn",
            "units": "%",
            "default": 24,
            "presentDay": 23, //as of 2017
            "min": 0,
            "max": 100,
            "maxFeasible": 40, //no Update
            "decimal": 0,
            "assumptionsId": "NaturalGasAssumptions",
            "percentGroup": "electricityPercents",
            "capturable": true,
            "refComments": {
                default: '<a class="reference">(WEO 2018)</a>',
                presentDay: '<a class="reference">(WEO 2018)</a>',
                maxFeasible: '<a class="reference">(WEO 2018)</a>',
            },
        },
        "biomassPercent": {
            "description": "Biomass",
            "icon": "tree",
            "units": "%",
            "default": 3,
            "presentDay": 2, //as of 2016
            "min": 0,
            "max": 100,
            "maxFeasible": 5,
            "decimal": 0,
            "assumptionsId": "biomassAssumptions", // FIXME: separate page?
            "percentGroup": "electricityPercents",
            "refComments": {
                default: '<a class="reference">(WEO 2018)</a>',
                presentDay: '500 TWh in 2017 <a class="reference">(WEO 2018)</a>',
                maxFeasible: '<a class="reference">(WEO 2018</a>, <a class="glossary">Drawdown B 2019)</a>',
            },
        },
        "coalPercent": {
            "description": "Coal power",
            "icon": 'dungeon',
            "units": "%",
            "default": 33,
            "presentDay": 36,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "dependsOn": ['solarPercent', 'windPercent', 'nuclearPercent', 'geothermalPercent', 'hydroPercent', 'naturalGasPercent', 'biomassPercent'],
            "carbonIntensityScale": [0, 1300e-6],
            "assumptionsId": "CoalAssumptions",
            "percentGroup": "electricityPercents",
            "capturable": true,
            "refComments": {
                default: 'Set so that all sliders add to 100%<a class="reference">(WEO 2018)</a> There is no min or max feasible for this slider, to allow the other sliders to move.',
                presentDay: '<a class="reference">(WEO 2018)</a>',

            },

            // TODO: Add assumptions explaining how the other sliders reduce this one.
        },
        //--------------------End of Electricity Sources------------------//


        //////////////////////End of Electricity//////////////////////////////

        //////////////////////////////////////////////////////////////////////
        /////////////////////////Transportation///////////////////////////////
        //////////////////////////////////////////////////////////////////////
        /* General Transport Notes:
        tation is responsible for 24% of direct CO2 emissions from fuel combustion. Road vehicles – cars, trucks, buses and two- and three-wheelers – account for nearly three-quarters of transport CO2 emissions. Emissions from aviation and shipping continue to rise, indicating that these hard-to-abate subsectors need more international action. - https://www.iea.org/reports/tracking-transport-2019
        2018 emissions from transport: 2.8Gt - same source as above.
        Of this - Passenger road vehicles: 3.6Gt
        
        */

        //<<<<<<<<<<<<<<<Vehicles>>>>>>>>>>>>>>>>>>>>

        // "vehicleOwnership": {
        //     /*  Some Notes:
        //     Light duty Vehicle Miles:  3.3 trillion miles in 2050 (IEA 2018, pg 110)
        //      182 Vehicles/1000 inhabitants - 18.2% in 2015 http://www.oica.net/category/vehicles-in-use/
        //     The Future: Some reports that we have reached "peak Car": https://markets.businessinsider.com/news/stocks/auto-industry-shrinking-at-peak-car-dragging-global-economy-lower-2019-10-1028644883#supply-constraints1

        //     */
        //     "description": "Percentage of people who own a car",
        //     "wasCalled": "vehicleNumber, numberOfVehicles",
        //     "units": "%",
        //     "default": 18, //Assume same rates as today
        //     "presentDay": 18,
        //     "min": 0,
        //     "max": 64,
        //     "minFeasible": 10,
        //     "maxFeasible": 55,
        //     "decimal": 1,
        //     "assumptionsId": "vehicleOwnershipAssumptions"
        // },


        //New Sliders to replace Number of Vehicles:
        //Why?
        //Most reports report in passenger-km
        //This way, we can include solutions such as walkable cities, public transport, and carpooling from drawdown


        "vehicleDistanceTravelled": {
            /*  Some Notes:
            This slider, along with the "Average Vehicle Occupancy" replace the sliders for vehicle ownership rates
 
            Present Day: 
                According to the ICCT's Transportation roadmap results (2017) (https://theicct.org/transportation-roadmap):
                2020 Billion Vehicle Km: 18054.77315
                2020 Billion Passenger km: 27353.167
 
                UN 2020 population: 7.8 billion
 
                Distance per passenger = 27353.167/7.8 = 3507 km
 
 
            2050 Predictions:
                ICCT's Transportation roadmap:
                    2050 Billion Vehicle Km: 33203.50165
                    2050 Billion Passenger km: 52476.10563
                    UN 2050 population: 9.7 billion
                    Distance per passenger = 52476.1/9.7 = 5410 km - This is higher than in 2020- set it to the default
 
                Low value: 
                    Based on Drawdown's bicycle infrastructure, walkable cities,and public transportation sectors, it seems reasonable that per person kilometers could be r10% lower than the pesent value in 2050.
                    This is 3156 km/person.
                    NUMBERS!
            */
            "description": "Average distance a person travels in a vehicle every year",
            "units": "km/year",
            "default": 5410,
            "presentDay": 3507,
            "min": 0,
            "max": 7000,
            "minFeasible": 3156,
            "decimal": 0,
            "assumptionsId": "distanceTravelledAssumptions",
            "refComments": {
                default: '<a class="reference">(ICCTTR2017)</a> The ICCT transportation roadmap predicts that in 2020, global vehicle passenger kilometers will be 33203.50165 billion. 2020 UN population estimate: 9.7 billion.This gives 5410 km/person',
                presentDay: '<a class="reference">(ICCTTR2017)</a> The ICCT Transportation Roadmap Results Spreadsheet reports 27353.167 billion passenger kilometers in 2020. Using the UNs population estimates of 7.8 billion, this gives a km/passenger value of 3507 kilometers.',
                minFeasible: '<a class="reference">(DrawdownBI2020)</a> <a class="reference">(DrawdownWC2020)</a>,<a class="reference">(DrawdownPT2020)</a>  Based on Drawdowns bicycle infrastructure, walkable cities,and public transportation sectors, it seems reasonable that per person kilometers could be 10% lower than the present value in 2050. This is 3156 km/person.'
            },
        },

        "vehicleOccupancy": {
            /*  Some Notes:
            This slider, along with the "Average VehicleCapacity" replace the sliders for vehicle ownership rates and distance traveled
            This does not include public transportation, so I guess we're assuming that public transit is carbon neutral??
            In Drawdown's "carpooling" solution - specific to urban trips:
            Present Vehicle Capacity: 1.57
                1.7 - https://www.fhwa.dot.gov/tpm/guidance/avo_factors.pdf - Average Vehicle Occupancy Factors for Computing Travel Time Reliability Measures and Total Peak Hour Excessive Delay Metrics - from American Federal Highway Association
 
            Projections for 2050:
                Drawdown - again, specific to urban trips:
                Scenario 1, 2050: 1.75
                Scenario 2, 2050: 2.00
                **********These drawdown numbers and the technical summary are hard to understand, so I (AE) made a note about this. this should be updated. 
                
                According to the ICCT Roadmap document:
                2020 Billion Vehicle Km: 18054.77315
                2020 Billion Passenger km: 27353.167
                This makes it seem like average occupancy is 27353/18054 = 1.52 - close to Drawdown, so this is probably right 
            */

            "description": "Average number of people in vehicle",//Number of people in a car
            "units": "people",
            "default": 1.57, //Set the default to the present day value
            "presentDay": 1.57,
            "min": 1,
            "max": 5,
            "maxFeasible": 2, //Really not much of a change
            "decimal": 1,
            "assumptionsId": "vehicleOccupancyAssumptions",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(DrawdownCP2020)</a> Drawdowns carpooling solution assumes an average vehicle occupancy today of 1.57.',
                maxFeasible: '<a class="reference">(DrawdownCP2020)</a> Drawdowns carpooling solution indicates two scenarios: scenario 1(ambitious): 1.75. Scenario 2 (very ambitious): 2.00. Note that the Drawdown technical summary here is hard to understand.'
            },
        },


        "gasVehicleFuelEfficiency": {
            /*  Some Notes:
                
                2017 Average fuel Economy: 7.2 Lge/100 km - https://www.iea.org/reports/tracking-transport-2020
                Issue here: this includes all vehicle fuel types - and electric vehicles are 2-3 times more efficient than gas-powered vehicles
                The number of EVs currently on the roads is so low this probable doesn't matter
                Also - This includes both Regular and hybrid vehicles (not PHEVs), so this could be significantly decreased.
                Fuel efficiency can be increased by lessening the number of fuel-innefficient SUVs, increasing the number of smaller vehicles, and improvements in technology. 
 
                Minimum feasible:
                4.2 - based on graph on page 6 of https://www.globalfueleconomy.org/media/708302/gfei-working-paper-20.pdf
                    The green line - for ICE (Internal combustion) vehicles
                        Good - does not include EVs
                This is comparable to the fuel economy of a 2020 Prius (hybrid): https://fcr-ccc.nrcan-rncan.gc.ca/en#VehicleReport/24032
 
 
            */
            "description": "Fuel consumption",
            "wasCalled": "vehicleFuel",
            "units": "Lge/100km",
            "default": 7.2, //Set the default to the present day value - no technological improvements.
            "presentDay": 7.2, //no Update
            "min": 2.0,
            "max": 12.5,
            "minFeasible": 4.2,
            "decimal": 1,
            "assumptionsId": "gasVehicleFuelEfficiencyAssumptions",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(IEATT2020)</a> The IEA tracking transport report assumes an average fuel efficiency of 7.2 litres of gasoline equivalent (Lge) per 100 km.This includes everything, such as electric vehicles, but there are so many of them that this probably will not make much of a difference.',
                minFeasible: '<a class="reference">(ICCTGFEI)</a> The ICCT Global fuel economy initiative sets an ambitious goal to decrease fuel economy of internal combustion vehicles to approximately 4.2 Lge/100km by 2050. This is comparable to the fuel economy of a 2020 Toyota Prius <a class="reference">(NRCanPrius2020)</a>. Because this fuel economy includes hybrid vehicles (not plug-in hybrids). This can be assumed to be possible with minimal technological improvements, although improvements are likely.'
            },
        },

        // "vehicleDistanceDriven": {
        //     /*  Some Notes:*/
        //     "description": "Distance each car is driven per year",
        //     "wasCalled": "vehicleDistance",
        //     "units": "km",
        //     "default": 21000,
        //     "presentDay": 18530, //no Update
        //     "min": 4000,
        //     "max": 30000,
        //     "minFeasible": 8000,
        //     "decimal": 0,
        //     "assumptionsId": "distanceDrivenAssumptions"
        // },

        //---------------------- Vehicle fuel sources-------------------------//
        /*
        Notes:
        Use current market shares to determine the "business as usual" scenario
        Projections for 2050 - esp. sustainable development scenarios determine what is feasible. 
        ***All need to add up to 100%!!!!!
 
        */

        "electricVehiclePercent": {
            /*  Some Notes:
            Default Value - Set to current market Shares:
                Current Share: 0.8% of the market - 2019 https://www.iea.org/reports/tracking-transport-2019
                1% -2018 in http://www.alternativasostenibile.it/sites/default/files/BCG-The-Electric-Car-Tipping-Point-Jan-2018_tcm9-180862.pdf
                2.8% - 2020 in https://about.bnef.com/electric-vehicle-outlook/
                Let's set it at 2%
 
 
            2050 Predictions:
                "Expected to grow to 2% by 2050"    source:  https://www.eia.gov/outlooks/aeo/pdf/AEO2020%20Transportation.pdf
                23% is the ambitious Drawdown Scenario (Scenario 2) - https://drawdown.org/solutions/electric-cars
                
                High estimates for sales in 2040 are 75% - https://media.rff.org/documents/GEO_Report_8-22-19.pdf - They cite "equinor renewal"
                Also have Equinor Renewal Spreadsheet - This checks out.
 
                30% in 2030 - IEA EV30@30 scenario - https://www.iea.org/reports/global-ev-outlook-2019
 
                58% market share in 2040 - https://about.bnef.com/electric-vehicle-outlook/
 
 
            */
            "description": "Electricity",
            "wasCalled": "electricPercent",
            "icon": "car-battery",
            "units": "%",
            "default": 2,
            "presentDay": 2, // - Actually Present sales
            "min": 0,
            "max": 100,
            "maxFeasible": 75,   //60,
            "decimal": 0,
            "assumptionsId": "electricVehiclesAssumptions",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'set to the present-day sales',
                presentDay: '<a class="reference">(IEATT2020)</a> The IEA tracking transport report reports a market share for EVs of 0.8% in 2019. Other sources indicate 1% (<a class="reference">(BCCEC)</a>) and 2.8% (<a class="reference">(BloombergNEF)</a>>) This is averaged to 2%. Note: This is sales, not the number on the roads, which are what are predicted for 2050.',
                maxFeasible: 'The EIA Annual Energy Outlook expects EV sales to grow to 2% by 2050 - <a class="reference">(EIAAEO2020)</a>. The Equinor renewal Scenario has high estimates for 2040 sales at 75% - <a class="reference">(Equinor2019)</a>. Several other predictions are available from the IEA and project Drawdown, but this is the highest estimate I could find, so this was assumed to be the maximum feasible percentage.'
            },
            "capturable": true,
        },
        "fuelCellVehiclePercent": {
            /*  
            Some Notes:
            Present Day - set current market share as default
                This is not one of Project Drawdown's solutions
                A lot of reports say that this technology, although initially a competitor against electric cars, is now pretty much dead, as it requires a lot more new infrastructure. 
                Virtually no cars are fuel cell vehicles right now: 
                    From A Shell Report (https://www.shell.com/energy-and-innovation/new-energies/hydrogen/_jcr_content/par/keybenefits_150847174/link.stream/1496312627865/6a3564d61b9aff43e087972db5212be68d1fb2e8/shell-h2-study-new.pdf):
                        280 active hydrogen refuelling stations worldwide [in 2017]. 
                        Compare to 168,000 in the US alone = 0.1% of fueling stations
                        =======>Set default to 0
 
 
 
            2050 projections:
                IEA in 2012: 17% market share in 2050
 
                From A Shell Report (https://www.shell.com/energy-and-innovation/new-energies/hydrogen/_jcr_content/par/keybenefits_150847174/link.stream/1496312627865/6a3564d61b9aff43e087972db5212be68d1fb2e8/shell-h2-study-new.pdf):
                    10 million new FCEVs in the three market regions in 2050
                    Later:  As a comparison, approx. 74 million new passenger cars are registered each year worldwide at present (VDA 2016); in 2050 the annual number of newly registered passenger cars would be expected to be over 100 million cars.
                That's 10% of new vehicles
 
                Because these are both market share values, it could take up to a decade for this to match the actual number of cars on the road. 
                But since these two values are far apart, let's set the  max feasible to 10%
 
            */
            "description": "Hydrogen Fuel Cells",
            "wasCalled": "fuelCellPercent",
            "icon": "magic",
            // "icon": "grip-vertical",
            // "icon": "flask",
            "units": "%",
            "default": 0,
            "presentDay": 0, //no Update
            "min": 0,
            "max": 100,
            "maxFeasible": 10,
            "decimal": 0,
            "assumptionsId": "fuelCellsAssumptions",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'set to the present-day sales ',
                presentDay: '<a class="reference">(Shell 2017)</a> There are essentially no Hydrogen fuell cells on the roads right now. There are 280 active H2 fuelling stations in the world, which is 0.1% of the stations in the United States alone.',
                maxFeasible: '<a class="reference">(Shell 2017)</a> Shell reports that 10 million out of 100 million new cars in 2050 will be fuel-cell powered, which is 10%. This is the highest estimate anywhere, so is considered the maximum feasible percentage for this technology.'
            },
            "capturable": true,
        },
        "propaneVehiclePercent": {
            /*  Some Notes:
            Present Day - current market share: 
                Accounts for 1.2% of total fuel use - https://www.wlpga.org/wp-content/uploads/2019/04/WLPGA-AUTOGAS-ROADMAP-March-2019-1.pdf
 
                From https://www.wlpga.org/wp-content/uploads/2019/04/WLPGA-AUTOGAS-ROADMAP-March-2019-1.pdf   - Business as usual scenario
                    Business as usual:
                        The share of Autogas in the global vehicle fleet remains broadly constant at 2% to 2030 and then declines gradually to 1.7% by 2040. 
                    Alternative:
                        Worldwide, Autogas vehicles make up 3.4% of the total fleet in 2040, compared with 1.7% in the Baseline Scenario and around 2% today.
 
                    Lets say 2% = current market share = default
                    4% = max feasible - goal of doubling LPG (autogas) vehicles
 
            */
            "description": "LPG (autogas)",
            "wasCalled": "propanePercent",
            "icon": "fire",
            "units": "%",
            "default": 2,
            "presentDay": 3, //no Update
            "min": 0,
            "max": 100,
            "maxFeasible": 50,
            "decimal": 0,
            "assumptionsId": "LPGAssumptions",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'set to the present-day sales ',
                presentDay: '<a class="reference">(WLPGA2019)</a> The WLPGA reports a current market share of 1.2% Note: This is sales, not the number on the roads, which are what are predicted for 2050.',
                maxFeasible: '<a class="reference">(WLPGA2019)</a> The WLPGA Alternative Scenario predicts that LPG vehicles will make up 3.4% of the global fleet in 2040. From this it is assumed that this percentage will rise to approxamately 4% in 2050 at most.'
            },
            "capturable": true
        },
        "hybridVehiclePercent": {
            /*  Some Notes:
 
            "Hybrid Vehicles" here refers only to Plug-in hybrids, which operate on both gas and electricity generated from outside sources
            Hybrids that do not plug in and operate on electricity produces internally are considered as improvements in fuel economy of gas-powered vehicles
 
            Present Day - current market share:
            Equinor - from https://www.equinor.com/en/how-and-why/energy-perspectives.html:
            PHEV: 0.2%
            According to the IEA and This stats site (https://www.statista.com/statistics/442759/global-sales-of-plugin-hybrid-electric-vehicles-as-a-share-of-evs/), PHEV sales doubled from 2016-2018. Assumin the same sort of growth, I'm going to assume that they have doubled again from 2018-2020
            Then, say the current global market share is 0.8%, round to 1%
 
            
            Projections to 2050:
            Equinor spreadsheet:
            PHEV: 
            Reform: 17.2%
            Renewal: 1.1%
            Rivalry: 15%
            */
            "description": "Plug in Hybrids",
            "wasCalled": "electricPercent",
            "icon": "car", //qkthish should change
            "units": "%",
            "default": 1,
            "presentDay": 1, //Sales, not on the roads.
            "min": 0,
            "max": 100,
            "maxFeasible": 17,
            "decimal": 0,
            "assumptionsId": "hybridVehiclesAssumptions",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'Set to present day sales',
                presentDay: '<a class="reference">(Equinor2019)</a> Equinor reports a current market share of 0.2% in 2016. The IEA <a class="reference">(IEATT2020)</a> reports that Plug in Hybrid Electric Vehicle (PHEV) sales doubled from 2016 to 2018.Assuming it doubled again from 2018-2020, we can approximate this to 1%. Note: This is sales, not the number on the roads, which are what are predicted for 2050.',
                maxFeasible: '<a class="reference">(Equinor2019)</a>The Equinor Reform scenario predicts that 17.2% of vehicles will be PHEVs. This is the highest prediction found.'
            },
            "capturable": true
        },
        "biofuelVehiclePercent": {
            /*  Some Notes:
            This is not one of the Drawdown Solutions
 
            Present Day:
            5% in equinor spreadsheet: https://www.equinor.com/en/how-and-why/energy-perspectives.html
 
            Projections to 2050:
            Equinor:
            Reform: 5.1%
            Renewal: 2.5%
            6.5%
 
            EIA, in the united States: 13.5% in 2050 - https://www.eia.gov/todayinenergy/detail.php?id=43096
            IEA: 27% of world transportation fuel in 2050
            */
            "description": "Biofuel",
            "wasCalled": "biofuelPercent",
            "icon": "seedling",
            "units": "%",
            "default": 5,
            "presentDay": 5,
            "min": 0,
            "max": 100,
            "maxFeasible": 27,
            "decimal": 0,
            "assumptionsId": "biofuelAssumptions",
            "landAreaFunctionName": "biofuelPercentLandArea",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'set to the present-day sales ',
                presentDay: '<a class="reference">(Equinor2019)</a> Equinor reports a current market share of 5% in 2016. Note: This is sales, not the number on the roads, which are what are predicted for 2050.',
                maxFeasible: '<a class="reference">(IEATT2020)</a>The IEA predicts that 27% of world (ground?) transportation will use biofuel. This is the highest prediction found.'
            },
            "capturable": true
        },
        "gasolineVehiclePercent": {
            /*  Some Notes:
            Default Value - Set to current market Shares:
            74% in 2016 - Spreadsheet from  https://www.equinor.com/en/how-and-why/energy-perspectives.html
            Round this up to 75% so that they all add up to 100%
 
 
            Projections to 2050:
            0.24% in Equinor Renewal Scenario -  https://www.equinor.com/en/how-and-why/energy-perspectives.html
                - Reasonable to say it can go to zero
                - Not feasible to say it will increase! ==> max feasible = 77%
            */
            "description": 'Gasoline',
            "icon": 'gas-pump',
            "units": '%',
            "default": 75,
            "presentDay": 75,
            "min": 0,
            "max": 100,
            "maxFeasible": "77",
            "minFeasible": 0,
            "decimal": 0,
            "dependsOn": ['electricVehiclePercent', 'fuelCellVehiclePercent', 'propaneVehiclePercent', 'hybridVehiclePercent', 'dieselVehiclePercent', 'biofuelVehiclePercent'],
            "carbonIntensityScale": [0, 0.2882],
            "percentGroup": "vehicleUsePercents",
            "assumptionsId": "gasolineAssumptions",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(Equinor2019)</a> Equinor reports a current market share of 74% in 2016. This was increased to 75% so that all vehicle fuel types add to 100%',
                maxFeasible: 'It does not seem feasible that this will increase, and no predictions indicate an increase. Note: This is sales, not the number on the roads, which are what are predicted for 2050.',
                minFeasible: '<a class="reference">(Equinor2019)</a>Equinor Renewal Scenario predicts 0.24% in 2050, so it is reasonable to say that this can go to 0.'
            },
            "capturable": true
        },
        "dieselVehiclePercent": {

            /* Some notes:
            Default Value - Set to current market Shares:
                14% on http://www.alternativasostenibile.it/sites/default/files/BCG-The-Electric-Car-Tipping-Point-Jan-2018_tcm9-180862.pdf, page 4, 2020
                18.7% on Equinor spreadsheed, 2016
                Set default to 15%
            2050 Projections:
                5% in 2030 - http://www.alternativasostenibile.it/sites/default/files/BCG-The-Electric-Car-Tipping-Point-Jan-2018_tcm9-180862.pdf
 
            It's reasonable to assume that this can decrease to 0 by 2050 - Equinor Renewal - 0.547%
            
            It's not reasonable for the number of diesel vehicles to increase. Numerous bans, restrictions, and incentives make this seem very unlikely. Therefore, Let's say that diesel shoould grow larger than 19%
                Some references for this:
                    https://www.bbc.com/news/uk-40726868
                    https://www.electronicspecifier.com/products/power/the-future-looks-dark-for-diesel-cars
                    Less than 1% (0.7%) at the highest in the Equinor spreadsheet
 
            */
            "description": "Diesel",
            "wasCalled": "dieselPercent",
            "icon": "truck-pickup",
            "units": "%",
            "default": 15,
            "presentDay": 15,
            "min": 0,
            "max": 100,
            "maxFeasible": 19,
            "decimal": 0,
            "assumptionsId": "dieselAssumptions",
            "percentGroup": "vehicleUsePercents",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(Equinor2019)</a> Equinor reports a current market share of 18.7% in 2016. The Boston Consulting group predicts a market share of 14% in 2020(<a class="reference">(BCCEC)</a>, page 4. The present-day value is set between these, at 15%. ',
                maxFeasible: 'It does not seem likely for diesel vehicle sales to increase, and no scenarios have predicted an increased market share. However, since the market share of diesel has grown in the past, the maximum feasible number of diesel vehicles on the roads in 2050 is set at 19%, which is the market share reported by Equinor in 2016 <a class="reference">(Equinor2019)</a>',
                minFeasible: '<a class="reference">(Equinor2019)</a>Equinor Renewal Scenario predicts 0.55% in 2050, so it is reasonable to say that this can go to 0.'
            },
            "capturable": true
        },

        //---------------End of Vehicle Types------------------
        //<<<<<<<<<<<<<<<<End of Vehicles>>>>>>>>>>>>>>>>>>>>>>
        //<<<<<<<<<<<<<<<<Aviation sliders>>>>>>>>>>>>>>>>>>>>>

        "kilometersFlown": {
            /*Some notes:
            1.9 trillion revenue passenger miles between 2017 and 2050 - IEA report 2018, pg 110
            6 562 billion revenue passenger-kilometres in 2015 - ITF transport outlook (2017), pg 37
            8,329,776,000,000 passenger km in 2019 - IATA Statistics - https://www.iata.org/contentassets/a686ff624550453e8bf0c9b3f7f0ab26/wats-2019-mediakit.pdf  
 
 
            According to this article (which is mostly estimates, but definitely more informed than I am): https://www.airspacemag.com/daily-planet/how-much-worlds-population-has-flown-airplane-180957719/
                39.85% of americans flew in 2009
                47 percent of respondents in eight large Chinese cities had ever flown in an airplane
                Air travel is on the rise
 
                Let's assume that 45% of people globally take at least one flight a year
 
 
            2015 population: 7379796967
            km/person in 2015:889km
            km/person assuming 45% are flying: 1975km
 
            2019 population: 7713468000
            km/person in 2019:1079
            Assuming 45% are flying: 2222km/person
 
            If we set the total number of passengers flying per year:
                IATA: 4.4 billion passenger in 2019 - https://www.iata.org/contentassets/a686ff624550453e8bf0c9b3f7f0ab26/wats-2019-mediakit.pdf
                Assuming all these were unique passengers:
                this is 56.4% of the population.
 
 
 
            According to this article (which is mostly estimates, but definitely more informed than I am): https://www.airspacemag.com/daily-planet/how-much-worlds-population-has-flown-airplane-180957719/
                39.85% of americans flew in 2009
                47 percent of respondents in eight large Chinese cities had ever flown in an airplane
                Air travel is on the rise
 
                Let's assume that 45% of people globally take at least one flight in 2050
 
                Then using the 2019 km/person:
 
            
 
            */
            "description": "Distance a person travels by plane per year",
            "units": "km",
            "default": 2222,
            "presentDay": 2222,
            "min": 300,
            "max": 5000,
            "minFeasible": 1555,
            "decimal": 0,
            "assumptionsId": "aviationAssumptions",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(IATA2019)</a><a class="reference">(Nergoni2016)</a> The IATA Reports 8,329,776,000,000 passenger km in 2019. Estimates are that about 45% of the global population will fly every year in 2050. Using 2019 population estimates <a class="reference">(UNDESA2017)</a>, this is 2222 km/person.',
                minFeasible: 'Many alternatives to flying are becoming available, such as high speed rail and video  conferencing. Because of this, it is assumed reasonable that air travel can be reduced by 30% to 1555 km/person.'
            },
        },

        "planeFuelEfficiency": {
            /*
            Some Notes:
            Present Day:
            ICCT reports an industry average of 31 pax-km/L - https://theicct.org/blog/staff/size-matters-for-aircraft-fuel-efficiency
                This is equivalent to 3.2 L/100 km
            Projections to 2050:
                Scenario 2 (Most ambitious): Fuel burn is improved by 18% - https://drawdown.org/solutions/efficient-aviation 
                    This is an average of 2.6 l/100km
            */

            "description": "Fuel consumption per passenger",
            "units": "L/100km",
            "default": 3.03,
            "presentDay": 3.03,
            "min": 1,
            "max": 5,
            "minFeasible": 2.6,
            "decimal": 2,
            "assumptionsId": "aviationFuelAssumptions",
            "refComments": {
                default: 'set to the present-day value ',
                presentDay: '<a class="reference">(Rutherford2018)</a> The ICCTs industry average in 2018 is 31 passenger-km/l, which is equivalent to 3.2 l/100 km.',
                minFeasible: '<a class="reference">(DrawdownEA2020)</a> Drawdowns efficient aviation technical summary reports a decrease in fuel burn of 18% in its ambitious scenario 2.'
            },
        },


        ////////////////////////////////////////////////////////////
        ////////////////////Land use/Agriculture////////////////////
        ////////////////////////////////////////////////////////////
        //<<<<<<<<<<<<Land Use>>>>>>>>>>>>>>>>
        "forestProtection": {
            "description": "Increase in Forest Protection",
            "wasCalled": "deforestation",
            "units": "%",
            "default": 15,
            "presentDay": 0,
            "min": 0,
            "max": 100,
            "maxFeasible": 57,
            "decimal": 0,
            "assumptionsId": "forestProtectionAssumptions",
            "landAreaFunctionName": "forestationLandArea",
            "refComments": {
                default: 'Calculated by looking at how much the deforestation rate is projected to change ((present day rate - 2050 rate) / present day rate * 100). For present day rate, see the deforestation rate constant.  Updated 2020.',
                maxFeasible: 'Proportionate to the minimum feasible of the deforestation rate in 2050, which is 43 thousand km<sup>2</sup>/year. About half of deforestation was due to forestry and wildfires from 2001-2015 (which are reasonably understood to not be within feasible control), while the other half have the capacity to be shifted through behaviour etc.—therefore our minimum feasible is about half that of the rate in 2050 <a class="reference">(Harris 2018)</a>, which is 85 thousand km<sup>2</sup>/year <a class="reference">(CGDEV 2015)</a>, pg 14—projects 289 million ha cleared from 2016 to 2050.  Updated 2020.'
            },
        },
        "deforestationRate": {
            "description": "Deforestation rate",
            "wasCalled": "deforestation",
            "units": "thousand km<sup>2</sup>/year",
            "default": 85,
            "presentDay": 100,
            "min": 0,
            "max": 200,
            "minFeasible": 43,
            "decimal": 0,
            "assumptionsId": "deforestationAssumptions",
            "landAreaFunctionName": "forestationLandArea",
            "refComments": {
                default: '<a class="reference">(CGDEV 2015)</a>, page 14 - projects 289 million ha cleared from 2016 to 2050.  Updated 2020.',
                presentDay: '<a class="reference">(FAO 2020)</a>, page 13.  Updated 2020.',
                minFeasible: '<a class="reference">(Harris 2018)</a>. About half of deforestation was due to forestry and wildfires from 2001-2015 (which are reasonably understood to not be within feasible control), while the other half have the capacity to be shifted through behaviour etc.—therefore our minimum feasible should be about half that of our default (Harris).  Updated 2020.'
            },
        },
        "reforestationRate": {
            "description": "Reforestation rate",
            "units": "thousand km<sup>2</sup>/year",
            "default": 25,
            "presentDay": 25,
            "min": 0,
            "max": 350,
            "minFeasible": 0,
            "maxFeasible": 300,
            "decimal": 0,
            "assumptionsId": "reforestationAssumptions",
            "landAreaFunctionName": "forestationLandArea",
            "refComments": {
                default: '<a class="reference">(FAD 2011)</a>, Default and present day are assumed to be the same.',
                presentDay: '<a class="reference">(FAD 2011)</a>, Default and present day are assumed to be the same. Unable to find original source on website (they are all vaguely referenced at the bottom), but their deforestation rate matches up with FAO, so it is assumed that this number is credible).',
                maxFeasible: '<a class="reference">(Bastin 2019)</a>, p.4 - IPCC reports a 0.9 billion ha target for reforestation that the Bastin report states is acheivable--0.9 billion / 30 years (2020-2050) = 30 million ha = 300,000 km<sup>2</sup>/year.  Updated 2020.'
            },
        },
        "peatlandProtection": {
            "description": "Peatland Protection",
            "units": "thousand km<sup>2</sup>/year",
            "default": 88.4,
            "presentDay": 88.4,
            "min": 0,
            "max": 4640,
            "maxFeasible": 415,
            "decimal": 0,
            "assumptionsId": "peatlandProtectionAssumptions",
            "refComments": {
                default: '<a class="reference">(DrawdownPPR2020)</a>, set to present day value.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownPPR2020)</a>, 8.84 mHa converted to thousand km<sup>2</sup>.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownPPR2020)</a>, calculated according to the scenario 2 max of 27 GtCO2eq reduced emissions: 27 GtCO2eq / 88 (GtCO2eq per wedge) = 0.31. Each wedge on the graph corresponds to about 5 GtCO2, so 31% of 5 is 1.6 GtCO2eq. Using the equation <strong>protection rate * savings = 1.6 GtCO2eq</strong>, 415 thousand km<sup>2</sup>/year was the result. Full calculation: protection rate * 1e5 * 38.58 GtCO2eq / 1e9 = 1.6 GtCO2eq -> protection rate = 415 thousand km<sup>2</sup>/year (see the Peatland protection emissions reductions per year constant for the 38.58 value).  Updated 2020.'
            },
        },
        "peatlandRestoration": {
            "description": "Peatland Restoration",
            "units": "thousand km<sup>2</sup>/year",
            "default": 0,
            "presentDay": 0,
            "min": 0,
            "max": 620,
            "maxFeasible": 515,
            "decimal": 0,
            "assumptionsId": "peatlandRestorationAssumptions",
            "refComments": {
                default: '<a class="reference">(DrawdownPPR2020)</a>, set to present day value.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownPPR2020)</a>.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownPPR2020)</a>, calculated according to the scenario 2 max of 14.9 GtCO2eq reduced emissions: 14.9 GtCO2eq / 88 (GtCO2eq per wedge) = 0.17. Each wedge on the graph corresponds to about 5 GtCO2, so 17% of 5 is 0.85 GtCO2eq. Using the equation <strong>restoration rate * savings = 0.85 GtCO2eq</strong>, 515 thousand km<sup>2</sup>/year was the result. Full calculation: restoration rate * 1e5 * 16.5 GtCO2eq / 1e9 = 0.85 GtCO2eq -> restoration rate = 515 thousand km<sup>2</sup>/year (see the Peatland restoration emissions reductions per year constant for the 16.5 value).  Updated 2020.'
            },
        },
        //<<<<<<<<<<<<<<<<<<<<<<<<<<Agriculture>>>>>>>>>>>>>>>>>>>>>>>>
        "conservationTillage": {
            "description": "Amount of arable land using conservation tillage methods",
            "wasCalled": "conservationTillage",
            "units": "million km<sup>2</sup>",
            "default": 3.73,
            "presentDay": 1.48,
            "min": 0, //no Update
            "max": 7.4,
            "maxFeasible": 4, //no Update
            "decimal": 2,
            "assumptionsId": "conservationTillageAssumptions",
            "landAreaFunctionName": "conservationTillageLandArea",
            "refComments": {
                default: '<a class="reference">(DrawdownCA 2020)</a>, projects 373 million ha adoption of conservation agriculture.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownCA 2020)</a>, 148 million ha as of 2018 - the drawdown solution is conservation agriculture which includes reduced tillage alongside crop rotation and cover cropping.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownCA 2020)</a>, projects 400 million ha as the possible total for conservation agriculture (54% of total available land, 740 million ha, which is used as the max value on the slider).  Updated 2020.'
            },
        },
        "agriculture": {
            "description": "Decrease in emissions from crop and livestock management and food waste ",
            // FAO calls agricultural emissions 'crop and livestock production and management activities'
            "units": "%",
            "default": 0,
            "presentDay": 0,
            "min": 0,
            "max": 100,
            "maxFeasible": 89,
            "decimal": 0,
            "assumptionsId": "agricultureAssumptions",
            "refComments": {
                default: '<a class="reference">(EPA 2019)</a>',
                presentDay: '<a class="reference">(EPA 2019)</a>',
                maxFeasible: '<a class="reference">(Leahy 2020)</a>, <a class="reference">(DrawdownPRD 2020)</a>, upper limit of 41% agricultural emissions reduction in 2050 + 48% from adopting plant rich diets (savings of 5.15 GtCO2eq—Drawdown states 91.72 GtCO2eq savings from 2030 to 2050, which is ~1 wedge (5.15 GtCO2eq) in our simulation); 5.15/10.72 = 0.48 (see Current emissions from agriculture per person).  Updated 2020.'
            },
        },
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<End of Agriculture>>>>>>>>>>>>>>>>>>>>>>>>>>
        //////////////////////////////End of Land Use/Agriculture//////////////////////////////////

        "buildingFloorArea": {
            "description": "Total floor area of buildings per person",
            "wasCalled": "floorArea",
            "units": "m<sup>2</sup> per person",
            "default": 42,
            "presentDay": 21,
            "min": 18,
            "max": 60,
            "minFeasible": 21, // no update
            "maxFeasible": 82, // no update
            "decimal": 0,
            "assumptionsId": "floorAreaAssumptions",
            "refComments": {
                default: '<a class="reference">(GSR 2017)</a>, <a class="reference">(Arch 2019)</a>, GSR 2017 projects a 230 billion m<sup>2</sup> increase in 2060 -- if we assume a 5.75 billion m2 increase per year, we get a 172.5 billion m<sup>2</sup> increase by 2050 which then gives us a total of 402.5 billion m2 (41.5 per person assuming a population of 9.7 billion)--supported by Architecture 2030, who state a 6.13 billion m<sup>2</sup> annual increase (still amounts to 42 m<sup>2</sup> per person).  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownB 2020)</a>, 230 billion m<sup>2</sup> as of 2020.  Updated 2020.',
                minFeasible: 'Set to present day.  Updated 2020.',
                maxFeasible: 'Rough guess',
            },
        },
        "buildingConstructionCarbon": {
            "description": "Carbon intensity of building construction",
            "wasCalled": "construction or constructionEmission",
            "units": "kg CO<sub>2</sub>eq /m<sup>2</sup>",
            "default": 330,
            "presentDay": 90.9,
            "min": 0,
            "max": 500,
            "minFeasible": 0,
            "decimal": 0,
            "assumptionsId": "constructionCarbonAssumptions",
            "refComments": {
                default: '<a class="reference">(Arch 2019)</a><a class="reference">(Huang 2017)</a>, Architecture 2030 suggests an annual increase of 3729 million metric tons of CO<sub>2</sub> of embodied emissions. This is a 111.870 billion metric tons CO<sub>2</sub> increase by 2050, which is converted to kg (1.1187e11 tons CO2 -> 1.1187e14 kgCO<sub>2</sub>eq). Adding on the present day value (Huang - 2.09e13 kgCO<sub>2</sub>eq), this amounts to a total of 1.3277e14 kgCO<sub>2</sub>eq by 2050--329.86 kg/m<sup>2</sup> in 2050 using the 2050 floor area of 402.5 billion m<sup>2</sup> (see default value of total floor area of buildings per person).  Updated 2020.',
                presentDay: '<a class="reference">(Huang 2017)</a>, Huang reports 5.7 billion tons CO<sub>2</sub> of global construction emissions in 2009--this is converted to 2.09e10 CO<sub>2</sub>eq tons -> 2.09e13 kgCO<sub>2</sub>eq, which is then used to calculate the result of 90.87 kgCO<sub>2</sub>eq/m<sup>2</sup> using the 2020 floor area of 230 billion m<sup>2</sup> (see present day value of total floor area of buildings per person).  Updated 2020.',
                minFeasible: '<a class="reference">(DrawdownB 2020)</a>, <a class="reference">(WorldGBC 2019)</a>, based on Drawdown\'s net-zero buildings solutions and WorldGBC\'s report on fully decarbonising building emissions (operational and embodied).  Updated 2020.',
            },
        },
        "buildingLifetime": {
            "description": "Average lifetime of buildings",
            "wasCalled": "lifetime",
            "units": "years",
            "default": 40,
            "presentDay": 30,
            "min": 20,
            "max": 100,
            "maxFeasible": 70,
            "decimal": 0,
            "assumptionsId": "buildingLifetimeAssumptions",
            "refComments": {
                default: 'An assumed projection by 2050.  Updated 2020.',
                presentDay: '<a class="reference">(Daigo 2017)</a>, Daigo reports a 30-year average lifetime in 2010 (pg.150).',
                maxFeasible: 'Rough guess.',
            },
        },

        "LEDLightPercent": {
            "description": "Lights that are LEDs",
            "wasCalled": "PercentLED",
            "units": "%",
            "default": 85,
            "presentDay": 3,
            "max": 100,
            "min": 0,
            "maxFeasible": 93,
            "decimal": 0,
            "assumptionsId": "LEDLightingAssumptions",
            "refComments": {
                default: '<a class="reference">(DrawdownL 2020)</a>, between 90% residential and 80% commercial.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownL 2020)</a>, between 3% commerical and 2% residential as of 2018.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownL 2020)</a>, between 95% residential and 90% commercial.  Updated 2020.',
            },
        },
        "lowFlowWaterPercent": {
            "description": "Low-flow water fixtures",
            "units": "%",
            "default": 59,
            "presentDay": 59,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "maxFeasible": 92,
            "assumptionsId": "lowFlowWaterPercentAssumptions",
            "refComments": {
                default: 'Set at present day value.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownWS 2020)</a>, estimate share as of 2018.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownC 2020)</a>, used the max of 81-92% (scenario 1 - scenario 2).  Updated 2020.',
            },
        },
        "cleanCookstoves": {
            "description": "Increase in Efficient Cookstoves",
            "units": "%",
            "default": 53,
            "presentDay": 53,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "maxFeasible": 75,
            "assumptionsId": "cleanCookstovesAssumptions",
            "refComments": {
                default: 'Set at present day value.  Updated 2020.',
                presentDay: '<a class="reference">(DrawdownICC 2020)</a>, adoption as of 2018.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownICC 2020)</a>, Drawdown\'s scenario 2 follows the UN SDG of 100% access to improved clean cookstoves—since this would be challenged by the cost of clean cookstoves adoption (free for families who collect firewood etc.), it is assumed that 75% adoption is reasonable.  Updated 2020.',
            },
        },

        //-----------------Sources of Building Heating------------------------//
        "biomassHeatingPercent": {
            "description": "Biomass Heating",
            "icon": 'tree',
            "units": "%",
            "default": 25,
            "presentDay": 25,
            "min": 0,
            "max": 100,
            "maxFeasible": 35,
            "decimal": 0,
            "assumptionsId": "biomassHeatingPercentAssumptions",
            "percentGroup": "heatingPercents",
            "refComments": {
                default: '<a class="reference">(ETP 2012)</a>, IEA is vague on what heating entails.',
                maxFeasible: 'Biomass is limited at low carbon intensity - once you start cutting down trees explicitly for biomass, it is no longer sustainable/low emissions, since it takes time to grow trees',
            },
        },
        "naturalGasHeatingPercent": {
            "description": "Natural Gas Heating",
            "icon": "burn",
            "units": "%",
            "default": 28,
            "presentDay": 28,
            "min": 0,
            "max": 100,
            "maxFeasible": 70,
            "decimal": 0,
            "assumptionsId": "naturalGasHeatingPercentAssumptions",
            "percentGroup": "heatingPercents",
            "refComments": {
                default: '<a class="reference">(ETP 2012)</a>, IEA is vague on what heating entails.',
                maxFeasible: '<a class="reference">(GABC 2018)</a>5% increase during 2010-2017 (p.12 GABC 2018)',
            },
            "capturable": true,
        },
        "coalHeatingPercent": {
            "description": "Coal Heating",
            "icon": 'dungeon',
            "units": "%",
            "default": 20,
            "presentDay": 20,
            "min": 0,
            "max": 100,
            "decimal": 0,
            // "assumptionsId": "coalHeatingPercentAssumptions",
            "dependsOn": ['biomassHeatingPercent', 'geothermalHeatingPercent', 'naturalGasHeatingPercent', 'oilHeatingPercent', 'electricHeatingPercent'],
            // Comment out the carbonIntensityScale for coalHeatingPercent
            // to remove the intensity scales from all of the Heating Energy
            // sliders.
            "carbonIntensityScale": [0, 450],
            "assumptionsId": "coalHeatingPercentAssumptions",
            "percentGroup": "heatingPercents",
            "refComments": {
                default: '<a class="reference">(ETP 2012)</a>, IEA is vague on what heating entails.',
            },
            'capturable': 'true',
        },
        "oilHeatingPercent": {
            "description": "Oil Heating",
            "icon": 'oil-can',
            "units": "%",
            "default": 20,
            "presentDay": 20,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "assumptionsId": "oilHeatingPercentAssumptions",
            "percentGroup": "heatingPercents",
            "refComments": {
                default: '<a class="reference">(ETP 2012)</a>, IEA is vague on what heating entails.',
            },
            'capturable': true
        },
        "geothermalHeatingPercent": {
            "description": "Geothermal Heating",
            "icon": "mountain",
            "units": "%",
            "default": 1,
            "presentDay": 1,
            "min": 0,
            "max": 100,
            "maxFeasible": 50,
            "decimal": 0,
            "assumptionsId": "geothermalHeatingPercentAssumptions",
            "percentGroup": "heatingPercents"
        },
        "electricHeatingPercent": {
            "description": "Electric Heating",
            "icon": 'solar-panel',
            "units": "%",
            "default": 6,
            "presentDay": 6,
            "min": 0,
            "max": 100,
            "maxFeasible": 70,
            "decimal": 0,
            "assumptionsId": "electricHeatingPercentAssumptions",
            "percentGroup": "heatingPercents",
            "refComments": {
                default: '<a class="reference">(DrawdownHP 2020)</a><a class="reference">(DrawdownSHW 2020)</a>, estimates a possible 40% adoption of heat pumps by 2050, which is combined with their 30% adoption estimate of solar water heating (not space heating but used here as a rough comparative estimate).  Updated 2020',
            },
            "capturable": true,
        },
        //------------------------End of Heating Sources-----------------------//
        //////////////////////////End of Buildings//////////////////////////

        ////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////Materials//////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////

        "cementComposition": {
            "description": "Cement: Using Alternatives to Clinker",
            "units": "%",
            "default": 31,
            "presentDay": 31,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "maxFeasible": 54,
            "assumptionsId": "cementCompositionAssumptions",
            "refComments": {
                default: 'Set to present day value.',
                presentDay: '<a class="reference">(DrawdownC 2020)</a>, as of 2018.  Updated 2020.',
                maxFeasible: '<a class="reference">(DrawdownC 2020)</a>, used the max of 39% - 54% (scenario 1 - scenario 2).  Updated 2020.',
            },
        },
        "HFCs": {
            "description": "Refrigerants: HFC emissions reduction",
            "units": "%",
            "default": 0,
            "presentDay": 0,
            "maxFeasible": 82,
            "min": 0,
            "max": 100,
            "decimal": 0,
            "assumptionsId": "HFCAssumptions",
            "refComments": {
                maxFeasible: '<a class="reference">(DrawdownAR 2020)</a>, used the max of 67% - 82% (scenario 1 - scenario 2).  Updated 2020.',
            },
        },

        //<<<<<<<<<<<<<<<<<Shipping>>>>>>>>>>>>>>>>>
        "shippingPerCapita": {
            "description": "Annual total goods shipped per person",
            "units": "tonne-km",
            "default": 33402,
            "presentDay": 13846,
            "minFeasible": 16701,
            "min": 300,
            "max": 50000,
            "decimal": 0,
            "assumptionsId": "shippingAssumptions",
            "decimal": 0,
            "assumptionsId": "shippingAssumptions",
            "refComments": {
                default: '<a class="reference">(ITF 2019)</a>, 2015 value expected to triple by 2050 (multiplied 2015 value (see present day comments) by 3 and divided by 9.7 billion), pg.36.  Updated 2020.',
                presentDay: '2015 value <a class="reference">(ITF 2019)</a>, 108 trillion t-km / 7.8 billion, pg.36.  Updated 2020.',
                max: 'arbitrary increase from 30k to 50k since default is ~30k',
                minFeasible: '<a class="reference">(ITF 2019)</a>, because of the uncertainties that international trade is expected to face (lower world merchandise trade growth rates, growing protectionism, slowing economic growth etc.- pg.25), we are assuming that freight transport can multiply by a factor of 1.5 instead of 3 (2015 value * 1.5 / 9.7 billion).  Updated 2020.'
            },
        },
        "roadShipping": {
            "description": "Carbon Intensity of Shipping by Truck",
            "units": "gCO<sub>2</sub>eq/tonne-km",
            "default": 63.8,
            "presentDay": 63.8,
            "minFeasible": 40,
            "min": 0,
            "max": 100,
            "decimal": 1,
            "assumptionsId": "roadShippingAssumptions",
            "refComments": {
                default: 'Set to present day.',
                presentDay: '<a class="reference">(CN 2019)</a>.',
                minFeasible: '<a class="reference">(ECTA 2011)</a>.'
            },
        },
        "railShipping": {
            "description": "Carbon Intensity of Shipping by Rail",
            "units": "gCO<sub>2</sub>eq/tonne-km",
            "default": 15.2,
            "presentDay": 22,
            "minFeasible": 0,
            "min": 0,
            "max": 25,
            "decimal": 1,
            "assumptionsId": "railShippingAssumptions",
            "refComments": {
                default: '<a class="reference">(CN 2019)</a>.',
                // presentDay: '',
                minFeasible: '<a class="reference">(Drawdown R 2019)</a>.'
            },
        },
        "seaShipping": {
            "description": "Carbon Intensity of Shipping by Boat",
            "units": "gCO<sub>2</sub>eq/tonne-km",
            "default": 8.3,
            "presentDay": 8.3,
            "minFeasible": 4,
            "min": 0,
            "max": 25,
            "decimal": 1,
            "assumptionsId": "seaShippingAssumptions",
            "refComments": {
                default: 'Set to present day.',
                presentDay: '<a class="reference">(CN 2019)</a>.',
                minFeasible: '<a class="reference">(Walsh 2011)</a>.'
            },
        },
        "skyShipping": {
            "description": "Carbon Intensity of Shipping by Plane",
            "units": "gCO<sub>2</sub>eq/tonne-km",
            "default": 750,
            "presentDay": 800,
            "minFeasible": 500,
            "min": 0,
            "max": 1000,
            "decimal": 0,
            "assumptionsId": "skyShippingAssumptions",
            "refComments": {
                default: '<a class="reference">(Howitt 2011)</a>.',
                // presentDay: '',
                minFeasible: '<a class="reference">(TFC 2019)</a>.'
            },
        },
        //<<<<<<<<<<<<<<<<<end of Shipping>>>>>>>>>>>>>>>>>>>>
        ////////////////////End of Materials////////////////////

        ////////////////////////////////////////////////////////////////
        ///////////////////////Calculated///////////////////////////////
        ////////////////////////////////////////////////////////////////
        "electricityCarbonIntensity": {
            description: 'the carbon intensity of whatever the user set the electricity mix to be.',
            units: 'Gt CO<sub>2</sub>eq/TWh',
            dependsOn: 'coalPercent',
            "calculated": true
        },
        "electricityCapturableCarbonIntensity": {
            description: 'the carbon intensity of whatever the user set the electricity mix to be.',
            units: 'Gt CO<sub>2</sub>eq/TWh',
            dependsOn: 'coalPercent',
            "calculated": true
        }

    }, //End of Sliders

    "physicalConstants": {

        /////////////////////////////////////////////////////////
        /////////////Constants for electricity///////////////////
        /////////////////////////////////////////////////////////

        //-------------Carbon Intensities------------//
        "baseCoalCarbonIntensity": {
            "description": "The lifecycle carbon intensity of coal electricity, with no changes from efficiency or CCS",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 1001e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "coalCarbonIntensity": {
            "description": "The lifecycle carbon intensity of coal electricity, default",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "calculated": true,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0,
            "refComments": "This is a default. It can be modified using the efficiency and CCS sliders"
        },
        "coalCapturableCarbonIntensity": {
            "description": "The lifecycle carbon emissions of coal electricity, without CCS",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "calculated": true,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0,
            "refComments": "This is a default. It can be modified using the CCS slider."
        },
        "baseNaturalGasCarbonIntensity": {
            "description": "The lifecycle carbon emissions of natural gas electricity, with no change from CCS",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 461e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "naturalGasCarbonIntensity": {
            "description": "The lifecycle carbon emissions of natural gas electricity. Default",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "calculated": true,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0,
            "refComments": "This is a default. It can be modified using the CCS sliders"
        },
        "naturalGasCapturableCarbonIntensity": {
            "description": "The lifecycle carbon emissions of natural gas electricity, with no changes from CCS",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "calculated": true,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0,
            "refComments": "This is set to the same value as the baseNaturalGasCarbonIntensity, but is necessary for calculations."
        },
        "windCarbonIntensity": {
            "description": "The lifecycle carbon emissions of wind electricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 11e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "solarCarbonIntensity": {
            "description": "The lifecycle carbon emissions of solar electricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 46e-6, //excluding solar concentrators, according to assumptions - MH
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "nuclearCarbonIntensity": {
            "description": "The lifecycle carbon emissions of nuclear electricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 16e-6, //NREL
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "geothermalCarbonIntensity": {
            "description": "The lifecycle carbon emissions of geothermal electricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 37e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "hydroCarbonIntensity": {
            "description": "The lifecycle carbon emissions of hydroelectricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 4e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        "biomassCarbonIntensity": {
            "description": "The lifecycle carbon emissions of biomass electricity",
            "units": "Gt CO<sub>2</sub>eq/TWh",
            "value": 47e-6,
            "displayUnits": "kt&nbsp;CO<sub>2</sub>eq/TWh",
            "displayMultiplier": 1e6,
            "displayDecimal": 0
        },
        //--------------End of Carbon Intensities-------------------//


        "naturalGasEfficiency": {
            "description": "percent fuel efficiency of natural gas fired power plants",
            "units": "%",
            "value": 40 //no Update
        },
        // "ccsEfficiency": {
        //     "description": "percent efficiency of carbon capture and storage systems.",
        //     "units": "%",
        //     "value": 90 //no Update
        // },
        "windArea": {
            "description": "land intensity of wind electricity qk",
            "units": "km^2/(TWh/y)",
            "calculated": true //no Update
        },
        "solarArea": {
            "description": "land intensity of pv solar electricity qk",
            "units": "km^2/(TWh/y)",
            "calculated": true //no Update
        },
        //////////////////////////End of Electricity Constants//////////////////////////

        /////////////////////////////////////////////////////////////////////////
        ////////////////////constants for Transportation/////////////////////////
        /////////////////////////////////////////////////////////////////////////
        //<<<<<<<<<<<<<<<<<<<<<<<<<Vehicles>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        //--------------------------To Calculate CI for Vehicle Fuels----------------------//


        "fuelCellEfficiency": {
            "description": "Fuel efficiency of hydrogen fuel cell vehicles",
            "units": "(kg of H2)/100km",
            "value": 0.9,
            "refComments": {
                value: '<a class="reference">(USDEa 2018)</a>.',
            },
        },
        "electricEfficiency": {
            "description": "Fuel efficiency of average electric vehicle",
            "units": "kWh/100km",
            "value": 19,
            "refComments": {
                value: '<a class="reference">(USDEb 2018)</a>.',
            },
        },
        "propaneEfficiency": {
            "description": "the efficiency of propane vehicles, compared to gasoline vehicles. Above 1 is less fuel efficient",
            "units": "(ratio)",
            "value": 1.25,
            "refComments": {
                value: '<a class="reference">(NRCan 2020)</a>.',
            },
        },
        "dieselEfficiency": {
            "description": "Fuel efficiency of average diesel vehicle. compared to gasoline vehicles. Above 1 is less fuel efficient",
            "units": "(ratio)",
            "value": 0.75,
            "refComments": {
                value: '<a class="reference">(NRCan 2020)</a>.',
            },
        },
        "convertVolts": {
            "description": "used to convert H2 cell potential (V) to KWh/(m^3 of H2). See M. Wang et al in 'Renewable and Sustainable Energy Reviews'",
            "units": "(kWh/m^3 of H2)/V",
            "value": 2.3929812, //no Update
            "refComments": {
                value: '<a class="reference">(Wang 2014)</a>.',
            },
        },
        "H2Volts": {
            "description": "The cell potential of a hydrogen electrolysis cell, in V. Theoretical min is 1.23, but should be 1.8-2.6. ",
            "units": "volts",
            "value": 2.0, //no Update
            "refComments": {
                value: '<a class="reference">(Wang 2014)</a>.',
            },
        },
        "convertM3": {
            "description": "used to convert m^3 of hydrogen to Kg",
            "units": "kg/m^3",
            "value": 0.08343, //no Update
            "refComments": {
                value: 'Calculated using the density and mass of molecular hydrogen.',
            },
        },

        "H2Energy": {
            "description": "the energy required for hydrogen production",
            "units": "kWh/kg",
            "calculated": true, //no Update
            "refComments": {
                value: 'Calculated using the previous constants.',
            },
        },

        // "biofuelVehicleArea": {
        //     "description": "land intensity of growing biofuel, in L/Km^2",
        //     "units": "L/km^2",
        //     "value": 363200, //no Update
        //     "refComments": '<a class="reference">(Wang2014)</a>',
        // },

        "lifecycleGasolineCarbonIntensity": {
            "description": "the lifecycle carbon intensity of gasoline",
            "units": "kg CO<sub>2</sub>/L",
            "value": 2.8,
            "refComments": {
                value: '<a class="reference">  (Woo 2017, Masnadi 2018)</a><a class="reference">(USEIAStats 2019)</a>.',
            },
        },

        "gasolineCarbonIntensity": {
            "description": "the carbon intensity of gasoline",
            "units": "kg CO<sub>2</sub>/L",
            "value": 2.3,
            "refComments": {
                value: '<a class="reference">(USEIAStats 2019)</a>.',
            },
        },

        "lifecyclePropaneCarbonIntensity": {
            "description": "the lifecycle carbon dioxide intensity of liquefied propane",
            "units": "kg CO<sub>2</sub>/L",
            "value": 2.5,
            "refComments": {
                value: '<a class="reference">(USDOEc)</a>.',
            },
        },
        "propaneCarbonIntensity": {
            "description": "the carbon intensity of burning liquefied propane",
            "units": "kg CO<sub>2</sub>/L",
            "value": 1.5,
            "refComments": {
                value: '<a class="reference">(USEIAStats 2019)</a>.',
            },
        },

        "lifecycleDieselCarbonIntensity": {
            "description": "the carbon intensity of liquefied diesel",
            "units": "kg CO<sub>2</sub>/L",
            "value": 3.2,
            "refComments": {
                value: '<a class="reference">(Woo 2017)</a>, <a class="reference">(Masnadi 2018)</a>.',
            },
        },
        "dieselCarbonIntensity": {
            "description": "the carbon intensity of liquefied diesel",
            "units": "kg CO<sub>2</sub>/L",
            "value": 2.7,
            "refComments": {
                value: '<a class="reference">(USEIAStats 2019)</a>.',
            },
        },

        "lifecycleBiofuelCarbonIntensity": {
            "description": "the lifetime carbon dioxide intensity of biofuel, assuming E100",
            "units": "kg CO<sub>2</sub>/L",
            "value": 1.66, //https://greet.es.anl.gov/results
            "refComments": {
                value: '<a class="reference">(Argonne2020)</a>.',
            },
        },
        "biofuelRating": {
            "description": "the percent of biofuel that is ethanol, as a decimal",
            "units": "(decimal)",
            "value": 0.85,
            "refComments": {
                value: '<a class="reference">(NRCan2020)</a>, Most common biofuel rating.',
            },
        },

        //CIs of the Vehicle Types ----- Calculated in the Applet
        "electricVehicleCarbonIntensity": {
            "units": "kg&nbsp;CO<sub>2</sub>/km",
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "electricVehicleCapturableCarbonIntensity": {
            "units": "kg&nbsp;CO<sub>2</sub>/km",
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "fuelCellVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "fuelCellVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "propaneVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "propaneVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "hybridVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "hybridVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "dieselVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },

        "dieselVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "biofuelVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "biofuelVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "gasolineVehicleCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        "gasolineVehicleCapturableCarbonIntensity": {
            "displayUnits": "kg&nbsp;CO<sub>2</sub>/100&nbsp;km",
            "displayMultiplier": 100,
            "displayDecimal": 1,
            "calculated": true
        },
        //Aviation constants:
        "jetFuelCO2Intensity": {
            "description": "carbon dioxide intensity of jet fuel",
            "units": "(kg CO<sub>2</sub>)/L",
            "value": 9.57
        },
        //Land use Constants
        "deforestationRate": {
            "description": "deforestation rate",
            "units": "thousand km<sup>2</sup>/year",
            "value": 100,
            "refComments": {
                value: '<a class="reference">(FAO 2020)</a>, page 13.  Updated 2020.',
            },
        },
        "forestCarbonStorage": {
            "description": "average carbon content of a forest",
            "units": " ktCO<sub>2</sub>/km<sup>2</sup>",
            "value": 15.95 * convertCtoCO2,
            "displayDecimal": 2,
            "refComments": {
                value: '<a class="reference">(FAO 2005)</a>, FAO reports a carbon denesity of 638Gt in chapter 2, pg.14--this is converted to 638 million kt and divided by 40 million km<sup>2</sup> (total forest area-pg.12).  Updated 2020.',
            },
        },
        "conservationTillageStorage": {
            "description": "approximate carbon storage from conservation tillage",
            "units": "&nbsp;tCO<sub>2eq</sub>/km<sup>2</sup> per year",
            "value": 183,
            "refComments": {
                value: '<a class="reference">(DrawdownCA 2020)</a>, took average of the 4 sequestration rates (0.78, 0.38, 0.61, and 0.25 tons of carbon per hectare per year), which is 0.5--converted to CO2e (1.83), and converted to km2.  Updated 2020.',
            },
        },
        "currentAgricultureCarbon": {
            "description": "Current emissions from agriculture per person",
            "units": "Gt CO<sub>2eq</sub> per person",
            "value": 1.1e-9,
            "refComments": {
                value: '<a class="reference">(FAOstat 2018)</a>, used the settings: World + (Total), Emissions (CO2eq), Agriculture total+ (Total), 2050 (6.32 GtCO2eq per year in 2050) and added an addition 4.4 GtCO2eq to account for food waste <a class="reference">(FAO 2011)</a>. The resulting calculation (10.72 GtCO2eq) then assumes a population of 9.7 billion to get the per capita estimate.  Updated 2020.',
            },
        },
        "peatlandProtectionSavings": {
            "description": "Peatland protection emissions reductions per year",
            "units": "tons CO<sub>2eq</sub> per hectare per year",
            "value": 38.58,
            "refComments": {
                value: '<a class="reference">(DrawdownPPR2020)</a>.  Updated 2020.',
            },
        },
        "peatlandRestorationSavings": {
            "description": "Peatland restoration emissions reductions per year",
            "units": "tons CO<sub>2eq</sub> per hectare per year",
            "value": 16.5,
            "refComments": {
                value: '<a class="reference">(DrawdownPPR2020)</a>.  Updated 2020.',
            },
        },

        //Buildings Constants:
        "incandescentWatts": {
            "description": "the power rating of the average incandescent bulb",
            "units": "W",
            "value": 100 //no Update
        },
        "numberOfLights": {
            "description": "Number of lights globally",
            "units": "billion",
            "value": 40,
            // "assumptionsId": "numberOfLightsAssumptions",
            "refComments": {
                value: 'Default is assumed to be 100W incandescent bulbs. Value is assuming 1 lightbulb per 10 m<sup>2</sup> in relation to our default total floor area value.  Updated 2020.',
                // presentDay: 'Value is assuming 1 lightbulb per 10 m<sup>2</sup> in relation to our present day total floor area value.  Updated 2020.',
                // minFeasible: 'Rough guess.  Updated 2020.',
            },
        },
        "LEDWatts": {
            "description": "the power rating of the average LED bulb",
            "units": "W",
            "value": 10 //no Update
        },
        "convertWatts": {
            "description": "used to convert watts to TWh/y",
            "units": "TWh/(y*W)",
            "value": 8760e-12 //no Update
        },
        "lowFlowWaterCarbonIntensity": {
            "description": "amount of carbon emissions savings per water savings",
            "units": "GtCO<sub>2eq</sub> per year",
            "value": 0.0015,
            "displayDecimal": 4,
            "refComments": {
                value: '<a class="reference">(DrawdownWS 2020)</a>, Carbon intensity needed to acheive 1.6 Gt reduction by 2050.  Updated 2020.',
            },
        },
        "cleanCookstovesSavings": {
            "description": "amount of carbon emissions savings per clean cookstoves adoption",
            "units": "GtCO<sub>2eq</sub>/% per year",
            "value": 0.19,
            "refComments": {
                value: '<a class="reference">(DrawdownICC 2020)</a>, Carbon intensity needed to acheive 4.2 GtCO2eq reduction by 2050 (Drawdown\'s 72.65 GtCO2eq reduction is comparable to a 4.2 GtCO2eq reduction in our simulation; roughly 82% of a wedge. Updated 2020.',
            },
        },
        // "heatingCarbonIntensity": {
        //     "description": "The carbon intensity of heating and cooling buildings",
        //     "wasCalled": "heating",
        //     "units": "kg CO<sub>2</sub>eq/m<sup>2</sup>",
        //     "value": 649,
        // "presentDay": 649,
        // "min": 30,
        // "max": 1200,
        // "minFeasible": 20, //no Update
        // "decimal": 0,
        // "assumptionsId": "heatingAndCoolingAssumptions"
        // },
        "heatingEnergyConsumption": {
            "description": "the heating energy required per unit floor area",
            "units": "kWh/m<sup>2</sup>",
            "value": 200
        },
        "coolingEnergyConsumption": {
            "description": "the cooling energy required per unit floor area",
            "units": "kWh/m<sup>2</sup>",
            "value": 50
        },
        "biomassHeatingCarbonIntensity": {
            "description": "emissions for biomass heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 38,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "geothermalHeatingCarbonIntensity": {
            "description": "emissions for geothermal heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 14,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(McCay 2019)</a>',
            },
        },
        "naturalGasHeatingCapturableCarbonIntensity": {
            "description": "emissions for natural gas heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 227,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "baseNaturalGasHeatingCarbonIntensity": {
            "description": "emissions for natural gas heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 181, //calculated from https://www.eia.gov/tools/faqs/faq.php?id=73&t=11
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "naturalGasHeatingCarbonIntensity": {
            "description": "emissions for natural gas heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 227,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "oilHeatingCapturableCarbonIntensity": {
            "description": "emissions for oil heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 314,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "baseOilHeatingCarbonIntensity": {
            "description": "emissions for oil heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 244,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "oilHeatingCarbonIntensity": {
            "description": "emissions for oil heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 314,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "electricHeatingCarbonIntensity": {
            "description": "emissions for other heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "calculated": true
        },
        "electricHeatingCapturableCarbonIntensity": {
            "description": "emissions for other heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "calculated": true
        },
        "baseCoalHeatingCarbonIntensity": {
            "description": "emissions for coal heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 341,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "coalHeatingCarbonIntensity": {
            "description": "emissions for coal heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 414,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "coalHeatingCapturableCarbonIntensity": {
            "description": "emissions for coal heating",
            "units": "kgCO<sub>2-e</sub>/MWh heat",
            "value": 414,
            "displayUnits": "kgCO<sub>2-e</sub>/MWh heat",
            "displayMultiplier": 1,
            "displayDecimal": 0,
            "refComments": {
                value: '<a class="reference">(FRUK 2019)</a>',
            },
        },
        "naturalGasCoolingCarbonIntensity": {
            "description": "emissions for natural gas cooling",
            "units": "GtCO<sub>2-e</sub>/y",
            "value": 0.28
        },
        "electricityCoolingCarbonIntensity": {
            "description": "emissions for electricity cooling",
            "units": "GtCO<sub>2-e</sub>/y",
            "value": 0.3
        },
        "electricityCoolingCapturableCarbonIntensity": {
            "description": "emissions for electricity cooling",
            "units": "GtCO<sub>2-e</sub>/y",
            "value": 0.3
        },
        "naturalGasCoolingPower": {
            "description": "amount of natural gas power used for cooling a building",
            "units": "TWh/year",
            "value": 25
        },
        "electricityCoolingPower": {
            "description": "amount of electricity used for cooling a building",
            "units": "TWh/year",
            "value": 1997
        },

        //Materials constants
        "cementCarbonIntensity": {
            "description": "amount of carbon emissions savings per cement substitution",
            "units": "GtCO<sub>2-e</sub>/%",
            "value": 0.02,
            "refComments": {
                value: '<a class="reference">(DrawdownC 2020)</a>, carbon intensity needed to acheive 16 Gt co2e reduction by 2050.  Updated 2020.',
            },
        },
        "cementEmissions": {
            "description": "amount of cement emissions",
            "units": "GtCO<sub>2-e</sub>/year",
            "value": 9.4,
            "refComments": {
                value: '<a class="reference">(IEA TR 2018)</a>, page 5—reduction of 7.7 GtCO<sub>2</sub> in 2050, reaching  1.7 GtCO<sub>2</sub>, which assumes a total of 9.4 GtCO<sub>2</sub>.',
            },
        },
        "HFCEmissions": {
            "description": "amount of carbon emissions savings per HFC substitution",
            "units": "GtCO<sub>2-e</sub>/%",
            "value": 0.0207,
            "refComments": {
                value: '<a class="reference">(DrawdownAR 2020)</a>, carbon intensity needed to acheive 50.5 Gt co2e reduction by 2050.  Updated 2020.',
            },
        },
        "roadShippingFraction": {
            "description": "Fraction of total shipping that's by truck",
            "units": "fraction",
            "value": 0.17,
            "refComments": {
                value: '<a class="reference">(ITF 2019)</a>, pg.36.  Updated 2020.',
            },
        },
        "railShippingFraction": {
            "description": "Fraction of total shipping that's by train",
            "units": "fraction",
            "value": 0.07,
            "refComments": {
                value: '<a class="reference">(ITF 2019)</a>, pg.36.  Updated 2020.',
            },
        },
        "seaShippingFraction": {
            "description": "Fraction of total shipping that's by Ship",
            "units": "fraction",
            "value": 0.7575,
            "refComments": {
                value: '<a class="reference">(ITF 2019)</a>, pg.36, remainder left by ITF\'s mention of 17% road, 7% rail, and 0.25% air.  Updated 2020.',
            },
        },
        "skyShippingFraction": {
            "description": "Fraction of total shipping that's by Plane",
            "units": "fraction",
            "value": 0.0025,
            "refComments": {
                value: '<a class="reference">(ITF 2019)</a>, pg.36.  Updated 2020.',
            },
        }
    },
    "impacts": [

        {
            type: "temperature",
            name: "Global Average Surface Temperature in 2100",
            shortName: "Temperature",
            reasonable: 1.5,
            extreme: 2.0,
            present: 1.0,
            // units: "°C since 1850-1900 average",
            units: "°C higher than pre-industrial",
            decimal: 1,
            icon: "img/ImpactIcons/global-warmingTemp.svg",
            "refComments": {
                reasonable: '<a class="reference">(IPCC 2018)</a>.',
                extreme: '<a class="reference">(IPCC 2018)</a>.',
                present: '<a class="reference">(IPCC 2018)</a>.',
            },
        },
        {
            type: "seaLevel",
            name: "Rise in Sea Level by 2100",
            shortName: "Sea Level",
            reasonable: 0.9,
            extreme: 1.8,
            present: 0.08,
            // units: "m since 1992",
            units: "m over 1992 level",
            decimal: 1,
            icon: "img/ImpactIcons/flood.svg",
            "refComments": {
                reasonable: '<a class="reference">(WEF 2019)</a>.',
                extreme: '<a class="reference">(WEF 2019)</a>.',
                present: '<a class="reference">(Lindsey 2018)</a>.',
            },
        },
        {
            type: "CO2Concentration",
            name: "Atmospheric Carbon Dioxide in 2100",
            shortName: "CO2",
            reasonable: 350,
            extreme: 450,
            present: 412,
            units: "ppm",
            decimal: 0,
            icon: "img/ImpactIcons/co2.svg",
            "refComments": {
                reasonable: '<a class="reference">(OECD 2012)</a>.',
                extreme: '<a class="reference">(OECD 2012)</a>.',
                present: '<a class="reference">(NOAA 2019)</a>.',
            },
        },
        {
            type: "oceanPH",
            name: "Ocean pH in 2100",
            shortName: "Ocean pH",
            reasonable: 7.7,
            extreme: 7.4,
            present: 8.1,
            units: "",
            roundToNearest: 1 / 20,
            decimal: 2,
            icon: "img/ImpactIcons/coral.svg",
            "refComments": {
                reasonable: '<a class="reference">(Caldeira 2003)</a>.',
                extreme: '<a class="reference">(Caldeira 2003)</a>.',
                present: '<a class="reference">(NOAA OA)</a>.',
            },
        },

        /* {
            type: "arcticIce",
            name: "Decrease in Arctic Ice Cover",
            reasonable: 70, //placeholder
            extreme: 0, //placeholder
            present: 8, //Placeholder
            units: "Millions of km/year NOT DONE IGNORE",
            icon: "img/ImpactIcons/iceberg.svg"
        }*/

    ],

    //this array holds all the information for the land areas shown.
    //name: the name of the land area, these are returned and injected into the HTML. 
    //size: the approximate size of the land area, in Km^2.
    //image: the name of the image as it appears in the images folder.
    //when adding new nations, make sure that they're sorted from largest to smallest.
    "nationArray": [
        { "name": "the World", "size": 150000000, "image": "world.png" },
        { "name": "Eurasia", "size": 54000000, "image": "eurasia.png" },
        { "name": "Africa", "size": 30000000, "image": "africa.png" },
        { "name": "Russia", "size": 17000000, "image": "russia.png" },
        { "name": "Canada", "size": 10000000, "image": "Canada.png" },
        { "name": "Brazil", "size": 8000000, "image": "Brazil.png" },
        { "name": "Australia", "size": 7000000, "image": "Australia.png" },
        { "name": "India", "size": 3000000, "image": "India.png" },
        { "name": "Saudi Arabia", "size": 2000000, "image": "SaudiArabia.png" },
        { "name": "Mongolia", "size": 1500000, "image": "Mongolia.png" },
        { "name": "Egypt", "size": 1000000, "image": "Egypt.png" },
        { "name": "Spain", "size": 500000, "image": "Spain.png" },
        { "name": "Germany", "size": 350000, "image": "Germany.png" },
        { "name": "the Philippines", "size": 300000, "image": "Philippines.png" },
        { "name": "the United Kingdom", "size": 200000, "image": "Uk.png" },
        { "name": "Iceland", "size": 100000, "image": "Iceland.png" },
        { "name": "Costa Rica", "size": 50000, "image": "CostaRica.png" },
        { "name": "El Salvador", "size": 20000, "image": "ElSalvador.png" },
        { "name": "Lebanon", "size": 10000, "image": "Lebanon.png" },
        { "name": "FPEI", "size": 5000, "image": "PEI.png" },
        { "name": "Hong Kong", "size": 900, "image": "Map_of_Hong_Kong.png" },
    ],

} // simData object

// Fill in some simple calculated quantities.  Do this inside a function so that
// any convenience variables we define are not global.
simData.init = function () {
    var vars = simData.variables; // for convenience

    // Relative and absolute power per capita:
    var p0 = vars.powerPerCapita.presentDay;
    vars.relativePowerPerCapita.default = parseFloat((vars.powerPerCapita.default / p0).toFixed(vars.relativePowerPerCapita.decimal));
    vars.relativePowerPerCapita.max = Math.ceil(vars.powerPerCapita.max / p0);
    vars.relativePowerPerCapita.minFeasible = (vars.powerPerCapita.minFeasible / p0).toFixed(1);
    // Since powerPerCapita won't be visible, raise its max to accomodate the
    // "ceil" rounding here, with a bit of a margin.
    vars.powerPerCapita.max = vars.relativePowerPerCapita.max * p0 * 1.1;

}
simData.init();
