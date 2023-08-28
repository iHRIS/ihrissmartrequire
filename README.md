ihrissmartrequire
=========
'ihrissmartrequire' works like node's require, but this package has been designed specifically designed to be used for iHRIS where you can require a module or file without having to specify the path of that module or file. A good example could be 
when doing customization on your site and you want to reuse a module from iHRIS core, you wont need to care about the path of that file, all you need to know is the module name only. ihrissmartrequire scans files from the iHRIS site and core directories, 
you may use the ignore() method to instruct the package directories that should be ignored during scanning, i.e node_modules folders are ignored by default.


Installation
-------------
to install, type
> ```npm install ihrissmartrequire```

- - - 

How to use it?
-----------------
instead of doing this: <br/>
> ```let fhirAxios = require('../../../fhirAxios.js');```

you only do this:<br/>
```
let ihrissmartrequire = require('ihrissmartrequire');
let fhirAxios = ihrissmartrequire('fhirAxios');
```
<br/><br/>

or that:<br/>
```
let mheroReports = ihrissmartrequire('mhero-reports.json');
let fhirModules = ihrissmartrequire('modules/fhir/fhirModules');
```
<br/>


How does it work?
------------------
when 'ihrissmartrequire' is first loaded into the project, it scans the source files locations, and stores them.
so when you need them they are right there ready to use!
no relative paths are needed!

in order to tell the scanner, not to scan specific folders you can configure `rekuire` not to scan folders right from the `package.json` file:

```
...
"ihrissmartrequire": {
	"ignore": ["out", "dist/target", "client/app"]
}
...

```

or you can set it up by code: <br/>
```
let mypath = ihrissmartrequire.ignore('out', 'target', 'static/js');
// you should only do it once in your code
```


<br/>


if you want to resolve only the file location, for example, when you want to use [proxyquire][proxyquire].<br/>
use: <br/>
```
let mypath = ihrissmartrequire.path('MyModule');
// mypath = 'lib/classes/MyModule.js' 
```

<br/>

for more examples, I recommend you to checkout the spec file :)
