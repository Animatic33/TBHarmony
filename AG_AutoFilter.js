// Auto-setup filters

var agn = require("AG_HarmonyObjLib.js");
var agf = require("AG_HarmonyFuncLib.js");

function autoFilter()
{
	scene.beginUndoRedoAccum("AG_AlignReadsPegs");
	autoFilterRun();
	scene.endUndoRedoAccum();
}

function autoFilterRun()
{
	var selNodes = selection.selectedNodes();
	var parentGrp = (new agn.HNode()).parentNode;
	var sortedNodes = []; // stores info about nodePath, X location, Y location, Z location
	var filtersCreated = [];
	var createComposite = true;
	var heightDiff = 100;
	
	var filterNodes = ["OVERLAY", "LINE_ART", "COLOR_ART", "UNDERLAY"];
		
	if (selNodes.length == 0)
	{
		MessageLog.trace("!!!");
		return false;
	}
	
	
	// if there's only two elements selected, let's default to Line Art and Color Art
	if (selNodes.length == 2)
	{
		filterNodes = ["LINE_ART", "COLOR_ART"];
	}
	
	
	// IF ONLY ONE NODE IS SELECTED - CREATE MULTIPLE FILTERS FOR IT.
	if (selNodes.length == 1)
	{
		//MessageLog.trace("???");
		var nodeSelObj = new agn.HNode();
		var newComposite = node.add(parentGrp, "Composite","COMPOSITE", x=nodeSelObj.coordX + 130, y=(nodeSelObj.coordY + heightDiff * 2), z=nodeSelObj.coordZ);
		node.setTextAttr(newComposite, "COMPOSITE_MODE", 1, "Pass Through");
		
		
		for (var x = 0; x < filterNodes.length; x++)
		{
			var newFilter = node.add(parentGrp, 
									filterNodes[x], 
									filterNodes[x], 
									nodeSelObj.coordX + (100*x), 
									nodeSelObj.coordY + heightDiff, 
									nodeSelObj.coordZ);
			var newFilterObj = new agn.HNode(newFilter);
			
			if ( nodeSelObj.link( newFilter, 0, 0, false, false) == false)
			{
				MessageLog.trace("something went wrong with the linking to filter");
				return false;
			}
			
			if( newFilterObj.link(newComposite, 0, 0, false, true) == false) 
			{
				MessageLog.trace("something went wrong with the linking to composite");
				return false;
			}
			
		}
		return true;
	}
	
	
	
	// THE USUAL MULTI SELECTED NODES 
	if (selNodes.length > 4) {
		var nodesToFilter = selNodes.slice(0,4);
	}
	else
	{
		var nodesToFilter = selNodes;
	}
	
	if (nodesToFilter.length == 0 || nodesToFilter.length == 1)
	{
		return false;
	}
	
	// generate an X-position sorted list
	for (var x = 0; x < nodesToFilter.length; x++)
	{
		var newNodeObj = new agn.HNode(nodesToFilter[x]);
		sortedNodes.push( [ newNodeObj.nodePath, newNodeObj.coordX, newNodeObj.coordY, newNodeObj.coordZ] );
	}

	if ( agf.sortSubArray(sortedNodes, 1) == false)
	{
		return false;
	}
	
	if (createComposite == true)
	{
		var compXCoord = ( (sortedNodes[sortedNodes.length-1][1] - sortedNodes[0][1]) / 2) + sortedNodes[0][1];
		var compNode = node.add(parentGrp, "Composite","COMPOSITE", x=compXCoord, y=sortedNodes[0][2] + heightDiff * 2, z=sortedNodes[0][3]);
		var compNodeObj = new agn.HNode(compNode);
		compNodeObj.setTextAttr("COMPOSITE_MODE", 1, "Pass Through");
	}
	
	//MessageLog.trace("test");
	
	
	
	for (var x = 0; x < sortedNodes.length; x++)
	{
		var xCoord = sortedNodes[x][1];
		var yCoord = sortedNodes[x][2] + heightDiff;
		var zCoord = sortedNodes[x][3];
		
		MessageLog.trace( sortedNodes[x][0] );
		MessageLog.trace( xCoord + " >> " + yCoord + " >> " + zCoord);
		MessageLog.trace( typeof xCoord );
		MessageLog.trace( typeof yCoord );
		MessageLog.trace( typeof zCoord );
		
		var newFilter = node.add(parentGroup=parentGrp, name=filterNodes[x], type=filterNodes[x], xCoord, yCoord, zCoord );
		filtersCreated.push( new agn.HNode(newFilter) );
				
		var nodeObj = new agn.HNode( sortedNodes[x][0] );
		
		//MessageLog.trace( newFilter + " > " + filtersCreated[x] + " > " + nodeObj.nodePath );
		
		if ( nodeObj.link( filtersCreated[x].nodePath, 0, 0, false, false) == false)
		{
			MessageLog.trace("something went wrong with the linking to filter");
			return false;
		}
		
		if (createComposite == true)
		{
			if ( filtersCreated[x].link(compNode, 0, 0, false, true) == false)
			{
				MessageLog.trace("something went wrong with the linking to composite");
				return false;
			}
		}
		
	}
	
	// TODO: Add auto-select the filters and composite;
	
	return true;

}

