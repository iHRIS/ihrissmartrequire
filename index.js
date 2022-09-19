"use strict";

// this prevents ihrissmartrequire from being cached, so 'parent' is always updated
delete require.cache[require.resolve(__filename)];

let path = require('path');
let scanner = require('./scanner');
const _ = require('underscore');
const extensions  = ['.js','.json','.coffee', '.html'];

module.exports = function(primaryPath, secondaryPath) {
    if(!primaryPath || !secondaryPath) {
        throw "Primary or secondary path was not specified"
    }
    let pkg = require(path.join(primaryPath, "package.json"));
    if (pkg.ihrissmartrequire){
        if (pkg.ihrissmartrequire.ignore){
            scanner.ignore(pkg.ihrissmartrequire.ignore);
        }
    }

    // SCANNING THE FOLDERS AS SOON AS THIS FILE LOADS
    let scanResults = {}
    scanResults.core = scanner.scan(secondaryPath, extensions);
    scanResults.site = scanner.scan(primaryPath, extensions);
    let filesInCoreProject = scanResults.core.filesInProject;
    let filesInSiteProject = scanResults.site.filesInProject;
    let ambiguousFileNamesInCore = scanResults.core.ambiguousFileNames;
    let ambiguousFileNamesInSite = scanResults.site.ambiguousFileNames;

    function ihrissmartrequire(requirement){
        return getModule(requirement).module
    }
    /**
    **********************************
        PUBLIC METHODS
    **********************************
    **/
    ihrissmartrequire.path = function(requirement){
        return getPath(requirement);
    };
    
    ihrissmartrequire.ignore = function(/*args*/){
        var args = Array.prototype.slice.call(arguments);
        scanner.ignore(args);
        scanResults.core = scanner.scan(secondaryPath, extensions);
        scanResults.site = scanner.scan(primaryPath, extensions);
        filesInCoreProject = scanResults.core.filesInProject;
        filesInSiteProject = scanResults.site.filesInProject;
        ambiguousFileNamesInCore = scanResults.core.ambiguousFileNames;
        ambiguousFileNamesInSite = scanResults.site.ambiguousFileNames;
    };

    /**
    **********************************
        PRIVATE METHODS
    **********************************
    **/

    function getPath(requirement){
        var location = getModule(requirement).path;
        if (location === undefined){
            throw "Could not locate a local for a module named ["+requirement+"]";
        }
        return location;
    }

    function isDefined(val){
        return typeof val === 'string' || typeof val === 'object' ;
    }


    function getModule(requirement){
        var calleePath = path.dirname(module.parent.filename);
        var parentReq = module.parent.require.bind(module);
        var retModule = null;
        var modulePath = null;
        var error = "";

        if (isDefined(ambiguousFileNamesInSite[requirement])){
            throw new Error('Ambiguity Error: There are more then one files that is named '+requirement+
                '. \n\t' + ambiguousFileNamesInSite[requirement].join('\n\t') +
                '\nYou can use require("ihrissmartrequire").ignore("folder_to_ignore") to prevent ihrissmartrequire from scanning unwanted folders.');
        } else if(!isDefined(filesInSiteProject[requirement]) && isDefined(ambiguousFileNamesInCore[requirement])) {
            throw new Error('Ambiguity Error: There are more then one files that is named '+requirement+
                '. \n\t' + ambiguousFileNamesInSite[requirement].join('\n\t') +
                '\nYou can use require("ihrissmartrequire").ignore("folder_to_ignore") to prevent ihrissmartrequire from scanning unwanted folders.');
        }
        if (isDefined(filesInSiteProject[requirement])){        
            // User typed in a relative path
            retModule =  parentReq(filesInSiteProject[requirement]);
            modulePath = filesInSiteProject[requirement];
        } else if (isDefined(filesInCoreProject[requirement])){   
            // User typed in a relative path
            retModule =  parentReq(filesInCoreProject[requirement]);
            modulePath = filesInCoreProject[requirement];
        }else{
            // User typed in a module name
            modulePath =  path.normalize(calleePath+"/"+requirement);
            try{
                retModule = parentReq(modulePath);
            }catch(e){
                // module by that name was not found in the scanner, maybe it's a general node module.
                error += e +"\n";
            }

            // General node module
            if (retModule == null){
                modulePath = requirement;
                try{
                    retModule =  parentReq(requirement);
                }catch(e){
                    error += e +"\n";
                }
            }
        }
        if(!retModule && !modulePath.includes("/")){
            console.error("Cannot find a module by the name of ["+requirement+"] nested: "+error);
            modulePath = null
        }
        return { module: retModule, path: modulePath};
    }
    return ihrissmartrequire
}
