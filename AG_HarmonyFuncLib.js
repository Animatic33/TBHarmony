// Harmony Functions

// TODO: work this into a comprehensive "list of nodes" object.

var agn = require("AG_HarmonyObjLib.js");


exports.sortSubArray = function(arrayToSort, indexVal)
{
	// Note: arrayToSort is passed as a ref, therefore we can arrange in place
	// no returning unless an error is thrown.
	try {
		arrayToSort.sort( function(a,b){return a[indexVal] - b[indexVal]} );
		return true;
	}
	catch(err) {
		return false;
	}
};

exports.sortNodes = function(nodesToSort, sortBy) // Re-usable sort function of nodes
{
	var sortedNodes = [];
	
	for(var x = 0; x < nodesToSort.length; x++)
	{
		sortedNodes.push( [ nodesToSort[x] ] );
		var tempNodeObj = new agn.HNode( nodesToSort[x] );
		
		switch(sortBy)
		{
			case "x":
			case "X":
				sortedNodes[x].push( tempNodeObj.coordX );
				break;
			case "y":
			case "Y":
				sortedNodes[x].push( tempNodeObj.coordY );
				break;
			case "z":
			case "Z":
				sortedNodes[x].push( tempNodeObj.coordZ );
				break;
			default:
				sortedNodes[x].push( tempNodeObj.coordX );
		}
		
	}
	
	//MessageLog.trace( "?" + sortBy);
	//MessageLog.trace("?? " + sortedNodes);
	
	exports.sortSubArray(sortedNodes, 1);
	
	MessageLog.trace("+++ " + sortedNodes);
	
	
	return sortedNodes;
};

exports.midNodeCoord = function(arrayOfNodes)
{
	return ( ( (arrayOfNodes[arrayOfNodes.length-1][1] - arrayOfNodes[0][1]) / 2) + arrayOfNodes[0][1] );
};