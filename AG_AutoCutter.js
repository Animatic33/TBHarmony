// Auto Cutter
var agn = require("AG_HarmonyObjLib.js");
var agf = require("AG_HarmonyFuncLib.js");

function autoCutter() 
{
	scene.beginUndoRedoAccum("AG_AutoCutter");	
	
	var firstNodeObj = new agn.HNode();
	var parentGrp = firstNodeObj.parentNode;
	var heightDiff = 50;
	
	var unorderSelNodes = selection.selectedNodes();
	
	var selNodes = agf.sortNodes(unorderSelNodes, "X");
	MessageLog.trace(">>>" + selNodes);
	
	var midPointCoordVal = agf.midNodeCoord(selNodes);
	
	var newCutter = node.add(parentGrp, 
							 "CUTTER", 
							 "CUTTER", 
							 x=midPointCoordVal, 
							 y=(firstNodeObj.coordY + heightDiff), 
							 z=firstNodeObj.coordZ);
	
	
	var cutterObj = new agn.HNode(newCutter);
	var cutterSourceObj = new agn.HNode( selNodes[1][0] );
	var affectedNodeObj = new agn.HNode( selNodes[0][0] );
		
	if ( affectedNodeObj.link(cutterObj, 0, 0, false, false) == false)
	{
		MessageLog.trace("issue with affected node to cutter");
		//return;
	}
	if ( cutterSourceObj.link(cutterObj, 0, 1, false, false) == false)
	{
		MessageLog.trace("issue with source node to cutter");
		//return;
	}
	
	
	// Now to connect the cutter to where the affected node was going
	// and remove the link from affected node to it's destination
	
	var destNodeObj =  new agn.HNode( affectedNodeObj.oPorts[0][0] );
	var destNodeObjDestPort = affectedNodeObj.oPorts[0][1];
	
	affectedNodeObj.unlink( destNodeObj.nodePath , destNodeObjDestPort);
	
	if (destNodeObj.type == "COMPOSITE") // Composites will be the only thing that gets new ports, everything else is usually 4 or less
	{
		var addMoreInPorts = true;
	}
	else
	{
		var addMoreInPorts = false;
	}
	
	if ( cutterObj.link( destNodeObj, 0, destNodeObjDestPort, false, addMoreInPorts ) == false)
	{
		MessageLog.trace("issue with source node to cutter");
		//return;
	}
	
	scene.endUndoRedoAccum();
}